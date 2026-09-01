import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import axios from 'axios'
import api, { setAuthToken, initAuthFromStorage } from '@/lib/api'

interface User {
  id: string
  email: string
  fullName?: string
  name?: string
}

interface AuthState {
  isAdmin: boolean
  loading: boolean
  user: User | null
  login: (email: string, password: string, isAdmin?: boolean) => Promise<boolean>
  logout: () => void
}

interface AuthExtras {
  requestPasswordReset: (email: string) => Promise<boolean>
  resetPassword: (token: string, password: string) => Promise<boolean>
}

export const AuthContext = createContext<(AuthState & AuthExtras) | null>(null)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const useAuthState = (): AuthState & AuthExtras => {
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<User | null>(null)

  const SESSION_DURATION_MS = 10 * 60 * 1000 // 10 minutes

  // Check if there's a stored token on mount and validate it
  useEffect(() => {
    const initAuth = async () => {
      try {
        initAuthFromStorage()
        const token = localStorage.getItem('authToken')

        if (!token) {
          setLoading(false)
          return
        }

        // Check session expiry
        const sessionExpiry = Number(localStorage.getItem('sessionExpiry') || '0')
        const now = Date.now()
        if (!sessionExpiry || sessionExpiry <= now) {
          localStorage.removeItem('authToken')
          localStorage.removeItem('sessionExpiry')
          localStorage.removeItem('cachedUser')
          setAuthToken(null)
          setLoading(false)
          return
        }

        // Restore user from cache — avoids a network round-trip on every page load
        const cachedUserRaw = localStorage.getItem('cachedUser')
        if (cachedUserRaw) {
          try {
            const cached = JSON.parse(cachedUserRaw) as { user: User; isAdmin: boolean }
            setUser(cached.user)
            setIsAdmin(cached.isAdmin)
            setLoading(false)
            return
          } catch {
            localStorage.removeItem('cachedUser')
          }
        }

        // No cache — validate token via /auth/me (only happens once after login)
        const response = await api.get('/auth/me')
        if (response.data.role === 'admin' && response.data.admin) {
          const u = { id: response.data.admin.id, email: response.data.admin.email, fullName: response.data.admin.name }
          setIsAdmin(true)
          setUser(u)
          localStorage.setItem('cachedUser', JSON.stringify({ user: u, isAdmin: true }))
        } else if (response.data.role === 'user' && response.data.user) {
          const u = { id: response.data.user.id, email: response.data.user.email, fullName: response.data.user.fullName }
          setIsAdmin(false)
          setUser(u)
          localStorage.setItem('cachedUser', JSON.stringify({ user: u, isAdmin: false }))
        }
      } catch (error) {
        console.error('Auth validation failed:', error)
        localStorage.removeItem('authToken')
        localStorage.removeItem('sessionExpiry')
        localStorage.removeItem('cachedUser')
        setAuthToken(null)
        setIsAdmin(false)
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    initAuth()
  }, [])

  // Session timeout handling: auto-logout when sessionExpiry reached
  useEffect(() => {
    let timer: number | undefined
    const sessionExpiry = Number(localStorage.getItem('sessionExpiry') || '0')
    const now = Date.now()
    if (sessionExpiry && sessionExpiry > now) {
      const ms = sessionExpiry - now
      timer = window.setTimeout(() => {
        // expire session
        localStorage.removeItem('authToken')
        localStorage.removeItem('sessionExpiry')
        setAuthToken(null)
        setUser(null)
        setIsAdmin(false)
      }, ms)
    }
    return () => {
      if (timer) clearTimeout(timer)
    }
  }, [user])

  // Login with backend endpoint
  const login = useCallback(async (email: string, password: string, isAdminLogin: boolean = false): Promise<boolean> => {
    setLoading(true)
    try {
      const endpoint = isAdminLogin ? '/auth/admin/login' : '/auth/login'
      const response = await api.post(endpoint, { email, password })

      const { token, user: userData, admin: adminData } = response.data
      const userInfo = userData || adminData

      if (token && userInfo) {
        // Store token in localStorage
        localStorage.setItem('authToken', token)
        // set session expiry timestamp (10 minutes from now)
        const expiry = Date.now() + SESSION_DURATION_MS
        localStorage.setItem('sessionExpiry', String(expiry))
        setAuthToken(token)

        const u = { id: userInfo.id, email: userInfo.email, fullName: userInfo.fullName || userInfo.name }
        const isAdminUser = !!adminData
        setUser(u)
        setIsAdmin(isAdminUser)
        localStorage.setItem('cachedUser', JSON.stringify({ user: u, isAdmin: isAdminUser }))

        setLoading(false)
        return isAdminUser
      }

      setLoading(false)
      throw new Error('Invalid email or password. Please try again.')
    } catch (error) {
      console.error('Login error:', error)
      setLoading(false)
      const message =
        (axios.isAxiosError(error) && error.response?.data?.msg) ||
        (error instanceof Error ? error.message : null) ||
        'An error occurred during login. Please try again.'
      throw new Error(message)
    }
  }, [])

  // Logout
  const logout = useCallback(() => {
    setUser(null)
    setIsAdmin(false)
    localStorage.removeItem('authToken')
    localStorage.removeItem('sessionExpiry')
    localStorage.removeItem('cachedUser')
    setAuthToken(null)
  }, [])

  // Request password reset (backend should send reset email)
  const requestPasswordReset = useCallback(async (email: string): Promise<boolean> => {
    try {
      const res = await api.post('/auth/forgot-password', { email })
      return res.status === 200 || res.data?.success === true
    } catch (err) {
      console.error('Forgot password error:', err)
      return false
    }
  }, [])

  // Reset password using token provided in email
  const resetPassword = useCallback(async (token: string, password: string): Promise<boolean> => {
    try {
      const res = await api.post('/auth/reset-password', { token, password })
      return res.status === 200 || res.data?.success === true
    } catch (err) {
      console.error('Reset password error:', err)
      return false
    }
  }, [])

  return {
    isAdmin,
    loading,
    user,
    login,
    logout,
    requestPasswordReset,
    resetPassword
  }
}