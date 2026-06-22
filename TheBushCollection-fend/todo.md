# Admin Authentication Implementation

## Files to Create/Modify:
1. **src/components/AdminAuth.tsx** - Login component with sign-in only
2. **src/hooks/useAuth.ts** - Authentication hook for managing user state
3. **src/pages/admin/AdminLogin.tsx** - Admin login page
4. **src/App.tsx** - Update routing to include authentication protection
5. **src/components/ProtectedRoute.tsx** - Route protection component
6. **lib/supabase.ts** - Supabase client configuration

## Implementation Plan:
- Set up Supabase authentication
- Create login form (sign-in only, no sign-up)
- Add route protection for admin pages
- Create authentication context/hook
- Update navigation to show login/logout options
- Ensure admin users must be created manually (no self-registration)

## Backend Requirements:
- Configure Supabase Auth
- Set up admin user table for role management
- Disable public sign-up in Supabase settings