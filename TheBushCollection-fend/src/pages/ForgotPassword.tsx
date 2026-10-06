import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';

export default function ForgotPassword() {
  const { requestPasswordReset } = useAuth();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const ok = await requestPasswordReset(email);
      if (ok) {
        toast.success('If that email exists, a reset link was sent.');
        navigate('/');
      } else {
        toast.error('Failed to send reset email.');
      }
    } catch (err) {
      toast.error('Failed to send reset email.');
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
            Account<br />
            <span className="italic text-[#c9a961]/80">Recovery</span>
          </h2>
          <p className="text-white/35 text-sm font-light leading-relaxed max-w-sm">
            No worries, we'll help you regain access to your account in just a moment.
          </p>
        </div>

        {/* Vertical text */}
        <div className="absolute right-8 top-1/2 -translate-y-1/2">
          <span className="text-[9px] tracking-[0.5em] uppercase text-white/10 font-light [writing-mode:vertical-lr] rotate-180">
            Est. 1983 · Curated Safari Experiences
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
              Forgot Password
            </h1>
            <p className="text-white/30 text-sm font-light">
              Enter your email and we'll send you a reset link
            </p>
          </div>

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

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full h-14 bg-[#c9a961] hover:bg-[#b8943d] text-[#292524] text-xs tracking-[0.2em] uppercase font-medium transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-3 mt-2"
            >
              {loading ? (
                <span>Sending...</span>
              ) : (
                <>
                  <span>Send Reset Link</span>
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
            Remembered your password?{' '}
            <Link to="/login" className="text-[#c9a961] hover:text-[#c9a961]/70 font-medium transition-colors duration-300">
              Sign in
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
