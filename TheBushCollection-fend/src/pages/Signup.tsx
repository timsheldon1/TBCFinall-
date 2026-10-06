import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { ArrowRight, Eye, EyeOff, AlertCircle, CheckCircle2 } from 'lucide-react';
import api from '@/lib/api';
import { validatePassword, getPasswordErrorMessage, getProgressBarColor } from '@/utils/passwordValidation';
import PasswordRequirements from '@/components/PasswordRequirements';

export default function Signup() {
  const navigate = useNavigate();
  const { user, loading, login } = useAuth();

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);
  const [passwordValidation, setPasswordValidation] = useState<ReturnType<typeof validatePassword> | null>(null);

  useEffect(() => {
    if (!loading && user) {
      navigate('/', { replace: true });
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (formData.password) {
      const validation = validatePassword(formData.password);
      setPasswordValidation(validation);
    } else {
      setPasswordValidation(null);
    }
  }, [formData.password]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    if (!formData.password) {
      setError('Please enter a password');
      setIsLoading(false);
      return;
    }

    const validation = validatePassword(formData.password);
    if (!validation.isValid) {
      setError(getPasswordErrorMessage(validation));
      setIsLoading(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    try {
      await api.post('/auth/signup', {
        fullName: formData.fullName,
        email: formData.email,
        password: formData.password,
      });

      const success = await login(formData.email, formData.password as string);
      if (success) {
        navigate('/', { replace: true });
      } else {
        setError('Signup succeeded but automatic login failed. Please sign in.');
      }
    } catch (err: unknown) {
      let msg = 'An error occurred during signup. Please try again.';
      if (err && typeof err === 'object') {
        const e = err as { response?: { data?: { msg?: unknown } }; message?: unknown };
        const respMsg = e.response?.data?.msg;
        const message = e.message;
        if (typeof respMsg === 'string') msg = respMsg;
        else if (typeof message === 'string') msg = message;
      }
      setError(msg);
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

        <div className="relative z-10 flex flex-col justify-end p-16 pb-20">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-[1px] bg-[#c9a961]" />
            <p className="text-[#c9a961] text-[10px] tracking-[0.5em] uppercase font-medium">The Bush Collection</p>
          </div>
          <h2 className="text-4xl xl:text-5xl font-extralight text-white/90 leading-[1.1] mb-4">
            Begin Your<br />
            <span className="italic text-[#c9a961]/80">Safari Journey</span>
          </h2>
          <p className="text-white/35 text-sm font-light leading-relaxed max-w-sm">
            Create an account to book handpicked lodges, camps &amp; retreats across East Africa.
          </p>
        </div>

        <div className="absolute right-8 top-1/2 -translate-y-1/2">
          <span className="text-[9px] tracking-[0.5em] uppercase text-white/10 font-light [writing-mode:vertical-lr] rotate-180">
            Est. 1983 · Curated Safari Experiences
          </span>
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center px-8 py-16 md:px-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-md"
        >
          <div className="lg:hidden mb-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-6 h-[1px] bg-[#c9a961]" />
              <p className="text-[#c9a961] text-[10px] tracking-[0.4em] uppercase font-medium">The Bush Collection</p>
            </div>
          </div>

          <div className="mb-10">
            <h1 className="text-3xl md:text-4xl font-extralight text-white/90 mb-3">
              Create Account
            </h1>
            <p className="text-white/30 text-sm font-light">
              Join us to book safaris and share your experiences
            </p>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8 border border-red-500/20 bg-red-500/5 px-5 py-4"
            >
              <p className="text-red-400/80 text-sm font-light">{error}</p>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="fullName" className="block text-white/70 text-[10px] tracking-[0.2em] uppercase font-medium mb-3">
                Full Name
              </label>
              <input
                id="fullName"
                name="fullName"
                type="text"
                required
                value={formData.fullName}
                onChange={handleChange}
                placeholder="Enter your full name"
                className="w-full h-13 px-5 bg-transparent text-white/95 border border-white/[0.15] hover:border-white/[0.25] focus:border-[#c9a961]/60 placeholder:text-white/40 text-sm font-medium tracking-wide outline-none transition-all duration-300"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-white/70 text-[10px] tracking-[0.2em] uppercase font-medium mb-3">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
                className="w-full h-13 px-5 bg-transparent text-white/95 border border-white/[0.15] hover:border-white/[0.25] focus:border-[#c9a961]/60 placeholder:text-white/40 text-sm font-medium tracking-wide outline-none transition-all duration-300"
              />
            </div>

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
                  value={formData.password}
                  onChange={handleChange}
                  onFocus={() => setIsPasswordFocused(true)}
                  onBlur={() => {
                    setTimeout(() => setIsPasswordFocused(false), 150);
                  }}
                  placeholder="At least 6 chars with uppercase, lowercase, number, special char"
                  className="w-full h-13 px-5 pr-12 bg-transparent text-white/95 border border-white/[0.15] hover:border-white/[0.25] focus:border-[#c9a961]/60 placeholder:text-white/40 text-sm font-medium tracking-wide outline-none transition-all duration-300"
                />
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20 hover:text-white/40 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {isPasswordFocused && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25 }}
                  className="mt-4"
                >
                  <PasswordRequirements isExpanded={true} className="mb-4" />
                </motion.div>
              )}

              {formData.password && passwordValidation && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="mt-4 space-y-3"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] tracking-[0.1em] uppercase font-light text-white/40">
                        Password Strength
                      </span>
                      <span
                        className={`text-[10px] tracking-[0.1em] uppercase font-medium ${
                          passwordValidation.strength === 'strong'
                            ? 'text-green-400'
                            : passwordValidation.strength === 'good'
                            ? 'text-blue-400'
                            : passwordValidation.strength === 'fair'
                            ? 'text-yellow-400'
                            : 'text-red-400'
                        }`}
                      >
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

                  {passwordValidation.isValid ? (
                    <div className="flex items-start gap-2 p-3 bg-green-500/10 border border-green-500/30 rounded">
                      <CheckCircle2 className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                      <span className="text-[10px] text-green-300">Password meets all security requirements</span>
                    </div>
                  ) : (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2">
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

            <div>
              <label htmlFor="confirmPassword" className="block text-white/70 text-[10px] tracking-[0.2em] uppercase font-medium mb-3">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirm ? 'text' : 'password'}
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm your password"
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

            <button
              type="submit"
              disabled={
                isLoading ||
                !formData.password ||
                !formData.confirmPassword ||
                !passwordValidation?.isValid ||
                formData.password !== formData.confirmPassword
              }
              className="w-full h-14 bg-[#c9a961] hover:bg-[#b8943d] text-[#292524] text-xs tracking-[0.2em] uppercase font-medium transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-3 mt-2"
            >
              {isLoading ? (
                <span>Creating account...</span>
              ) : (
                <>
                  <span>Create Account</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <p className="text-center text-white/30 text-sm font-light">
            Already have an account?{' '}
            <Link to="/login" className="text-[#c9a961] hover:text-[#c9a961]/70 font-medium transition-colors duration-300">
              Sign in
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}