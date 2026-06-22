import { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Eye, EyeOff, ArrowLeft, AlertCircle, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { validatePassword, getPasswordErrorMessage, getStrengthColor, getProgressBarColor } from '@/utils/passwordValidation';
import PasswordRequirements from '@/components/PasswordRequirements';

export default function ResetPassword() {
  const { resetPassword } = useAuth();
  const [searchParams] = useSearchParams();
  const tokenFromUrl = searchParams.get('token') || '';
  const [token, setToken] = useState(tokenFromUrl);
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [passwordValidation, setPasswordValidation] = useState<ReturnType<typeof validatePassword> | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (tokenFromUrl) setToken(tokenFromUrl);
  }, [tokenFromUrl]);

  // Validate password as user types
  useEffect(() => {
    if (password) {
      const validation = validatePassword(password);
      setPasswordValidation(validation);
    } else {
      setPasswordValidation(null);
    }
  }, [password]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return toast.error('Missing reset token');
    
    // Validate password
    if (!password) return toast.error('Please enter a new password');
    const validation = validatePassword(password);
    if (!validation.isValid) {
      return toast.error(getPasswordErrorMessage(validation));
    }
    
    if (password !== confirm) return toast.error('Passwords do not match');
    
    setLoading(true);
    try {
      const ok = await resetPassword(token, password);
      if (ok) {
        toast.success('Password reset successful. Please sign in.');
        navigate('/login');
      } else {
        toast.error('Failed to reset password.');
      }
    } catch (err) {
      toast.error('Failed to reset password.');
    } finally {
      setLoading(false);
    }
  };

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
            New<br />
            <span className="italic text-[#c9a961]/80">Password</span>
          </h2>
          <p className="text-white/35 text-sm font-light leading-relaxed max-w-sm">
            Choose a strong new password to secure your account and continue your safari journey.
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

          {/* Back link */}
          <Link
            to="/login"
            className="inline-flex items-center gap-2 text-white/25 hover:text-white/50 text-xs tracking-wide font-light transition-colors duration-300 mb-10"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to sign in</span>
          </Link>

          {/* Header */}
          <div className="mb-10">
            <h1 className="text-3xl md:text-4xl font-extralight text-white/90 mb-3">
              Reset Password
            </h1>
            <p className="text-white/30 text-sm font-light">
              Enter a new password for your account
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Password Requirements */}
            <PasswordRequirements isExpanded={true} className="mb-6" />

            {/* Token */}
            <div>
              <label htmlFor="token" className="block text-white/70 text-[10px] tracking-[0.2em] uppercase font-medium mb-3">
                Reset Token
              </label>
              <input
                id="token"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="Paste your reset token"
                className="w-full h-13 px-5 bg-transparent text-white/95 border border-white/[0.15] hover:border-white/[0.25] focus:border-[#c9a961]/60 placeholder:text-white/40 text-sm font-medium tracking-wide outline-none transition-all duration-300"
              />
            </div>

            {/* New Password */}
            <div>
              <label htmlFor="password" className="block text-white/70 text-[10px] tracking-[0.2em] uppercase font-medium mb-3">
                New Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 chars with uppercase, lowercase, number, special char"
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

              {/* Password Strength Indicator */}
              {password && passwordValidation && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="mt-4 space-y-3"
                >
                  {/* Strength Bar */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] tracking-[0.1em] uppercase font-light text-white/40">
                        Password Strength
                      </span>
                      <span className={`text-[10px] tracking-[0.1em] uppercase font-medium ${
                        passwordValidation.strength === 'strong' ? 'text-green-400' :
                        passwordValidation.strength === 'good' ? 'text-blue-400' :
                        passwordValidation.strength === 'fair' ? 'text-yellow-400' :
                        'text-red-400'
                      }`}>
                        {passwordValidation.strength.toUpperCase()}
                      </span>
                    </div>
                    <div className="w-full h-2 bg-white/[0.06] rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${passwordValidation.score}%` }}
                        transition={{ duration: 0.5 }}
                        className={`h-full ${getProgressBarColor(passwordValidation.score)} transition-colors`}
                      />
                    </div>
                  </div>

                  {/* Validation Status */}
                  {passwordValidation.isValid ? (
                    <div className="flex items-start gap-2 p-3 bg-green-500/10 border border-green-500/30 rounded">
                      <CheckCircle2 className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                      <span className="text-[10px] text-green-300">Password meets all security requirements</span>
                    </div>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="space-y-2"
                    >
                      {passwordValidation.errors.map((error, idx) => (
                        <div key={idx} className="flex items-start gap-2 p-2 bg-red-500/10 border border-red-500/30 rounded">
                          <AlertCircle className="w-3 h-3 text-red-400 mt-0.5 flex-shrink-0" />
                          <span className="text-[9px] text-red-300">{error}</span>
                        </div>
                      ))}
                    </motion.div>
                  )}
                </motion.div>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirm" className="block text-white/70 text-[10px] tracking-[0.2em] uppercase font-medium mb-3">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  id="confirm"
                  type={showConfirm ? 'text' : 'password'}
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  placeholder="Confirm your new password"
                  className="w-full h-13 px-5 pr-12 bg-transparent text-white/95 border border-white/[0.15] hover:border-white/[0.25] focus:border-[#c9a961]/60 placeholder:text-white/40 text-sm font-medium tracking-wide outline-none transition-all duration-300"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20 hover:text-white/40 transition-colors"
                >
                  {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading || !password || !confirm || !passwordValidation?.isValid || password !== confirm}
              className="w-full h-14 bg-[#c9a961] hover:bg-[#b8943d] text-[#292524] text-xs tracking-[0.2em] uppercase font-medium transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-3 mt-2"
            >
              {loading ? (
                <span>Resetting...</span>
              ) : (
                <>
                  <span>Reset Password</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-4 my-8">
            <div className="flex-1 h-[1px] bg-white/[0.06]" />
            <span className="text-white/15 text-[9px] tracking-[0.3em] uppercase font-light">or</span>
            <div className="flex-1 h-[1px] bg-white/[0.06]" />
          </div>

          {/* Login link */}
          <p className="text-center text-white/30 text-sm font-light">
            Remember your password?{' '}
            <Link to="/login" className="text-[#c9a961] hover:text-[#c9a961]/70 font-medium transition-colors duration-300">
              Sign in
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
