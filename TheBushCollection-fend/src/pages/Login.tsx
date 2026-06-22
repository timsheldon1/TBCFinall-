import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { ArrowRight, Eye, EyeOff } from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();
  const { login, user, loading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (!loading && user) {
      navigate('/', { replace: true });
    }
  }, [user, loading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const success = await login(email, password);
      if (success) {
        navigate('/', { replace: true });
      } else {
        setError('Invalid email or password. Please try again.');
      }
    } catch (err) {
      setError('An error occurred during login. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#292524] flex items-center justify-center">
        <div className="text-center">
          <div className="relative mx-auto w-14 h-14 mb-8">
            <div className="absolute inset-0 border border-[#c9a961]/20 animate-ping" />
            <div className="absolute inset-3 border border-[#c9a961]/40 animate-pulse" />
          </div>
          <p className="text-white/25 text-[10px] tracking-[0.5em] uppercase font-light">Loading</p>
        </div>
      </div>
    );
  }

  if (user) return null;

  return (
    <div className="min-h-screen bg-[#292524] flex">
      {/* ── LEFT: HERO IMAGE ── */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <motion.div
          className="absolute inset-0"
          animate={{ scale: [1, 1.08] }}
          transition={{ duration: 25, repeat: Infinity, repeatType: 'reverse', ease: 'linear' }}
        >
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: `url('https://obbrmdtdcevckizykfzu.supabase.co/storage/v1/object/sign/images/Mwazaro-1.jpg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV8zMmQyZDM5YS1mOGUyLTQwNGItOTJlMy1mZjc1ZGJjYmQ5ZDUiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJpbWFnZXMvTXdhemFyby0xLmpwZyIsImlhdCI6MTc2MzYyOTcwNCwiZXhwIjoxNzk1MTY1NzA0fQ.Ihw6Bmfj9cx-SsrMzKzH0bt-4Qej5J0sfxw-JgKWllA')`
            }}
          />
        </motion.div>
        <div className="absolute inset-0 bg-gradient-to-r from-[#292524]/30 to-[#292524]/80" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#292524]/60 to-transparent" />

        {/* Branding overlay */}
        <div className="relative z-10 flex flex-col justify-end p-16 pb-20">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-[1px] bg-[#c9a961]" />
            <p className="text-[#c9a961] text-[10px] tracking-[0.5em] uppercase font-medium">The Bush Collection</p>
          </div>
          <h2 className="text-4xl xl:text-5xl font-extralight text-white/90 leading-[1.1] mb-4">
            Welcome<br />
            <span className="italic text-[#c9a961]/80">Back</span>
          </h2>
          <p className="text-white/35 text-sm font-light leading-relaxed max-w-sm">
            Sign in to manage your bookings and continue exploring Africa's finest lodges &amp; retreats.
          </p>
        </div>

        {/* Vertical text */}
        <div className="absolute right-8 top-1/2 -translate-y-1/2">
          <span className="text-[9px] tracking-[0.5em] uppercase text-white/10 font-light [writing-mode:vertical-lr] rotate-180">
            Est. 1983 — Curated Safari Experiences
          </span>
        </div>
      </div>

      {/* ── RIGHT: FORM ── */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-8 py-16 md:px-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-md"
        >
          {/* Mobile brand */}
          <div className="lg:hidden mb-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-6 h-[1px] bg-[#c9a961]" />
              <p className="text-[#c9a961] text-[10px] tracking-[0.4em] uppercase font-medium">The Bush Collection</p>
            </div>
          </div>

          {/* Header */}
          <div className="mb-10">
            <h1 className="text-3xl md:text-4xl font-extralight text-white/90 mb-3">
              Sign In
            </h1>
            <p className="text-white/30 text-sm font-light">
              Access your bookings and safari experiences
            </p>
          </div>

          {/* Error */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8 border border-red-500/20 bg-red-500/5 px-5 py-4"
            >
              <p className="text-red-400/80 text-sm font-light">{error}</p>
            </motion.div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-white/70 text-[10px] tracking-[0.2em] uppercase font-medium mb-3">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full h-13 px-5 bg-transparent text-white/95 border border-white/[0.15] hover:border-white/[0.25] focus:border-[#c9a961]/60 placeholder:text-white/40 text-sm font-medium tracking-wide outline-none transition-all duration-300"
              />
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-white/70 text-[10px] tracking-[0.2em] uppercase font-medium mb-3">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full h-13 px-5 pr-12 bg-transparent text-white/95 border border-white/[0.15] hover:border-white/[0.25] focus:border-[#c9a961]/60 placeholder:text-white/40 text-sm font-medium tracking-wide outline-none transition-all duration-300"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20 hover:text-white/40 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <div className="text-right mt-3">
                <Link to="/forgot-password" className="text-[#c9a961]/60 hover:text-[#c9a961] text-xs tracking-wide font-light transition-colors duration-300">
                  Forgot password?
                </Link>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-14 bg-[#c9a961] hover:bg-[#b8943d] text-[#292524] text-xs tracking-[0.2em] uppercase font-medium transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-3 mt-2"
            >
              {isLoading ? (
                <span>Signing in...</span>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Signup link */}
          <p className="text-center text-white/30 text-sm font-light">
            Don't have an account?{' '}
            <Link to="/signup" className="text-[#c9a961] hover:text-[#c9a961]/70 font-medium transition-colors duration-300">
              Create one
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
