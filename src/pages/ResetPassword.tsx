import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Lock, AlertCircle, Loader2, ShieldCheck, KeyRound } from 'lucide-react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { resetPassword } from '../utils/auth';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!token) {
      setError('Invalid or missing reset token.');
    }
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!token) {
      setError('Invalid reset token.');
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      await resetPassword(token, newPassword);
      setSuccess(true);
      setTimeout(() => {
        navigate('/');
      }, 3000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to reset password.');
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    'w-full pl-10 pr-4 py-3 text-sm rounded-xl bg-brand-surface-container border border-white/8 focus:outline-none focus:ring-2 focus:ring-brand-gold/40 focus:border-brand-gold/40 text-brand-on-surface placeholder:text-brand-on-surface/25 transition-all';

  return (
    <div className="flex items-center justify-center min-h-screen bg-brand-surface px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.25, 1, 0.5, 1] }}
        className="w-full max-w-sm"
      >
        <div className="bg-brand-surface-high border border-white/8 rounded-2xl shadow-2xl overflow-hidden">
          <div className="bg-brand-gold px-8 py-6 flex flex-col items-center gap-2">
            <span className="p-3 bg-[#0a0f18]/20 rounded-xl">
              <KeyRound size={26} className="text-[#0a0f18]" />
            </span>
            <h1 className="font-display text-[#0a0f18] text-lg font-black uppercase tracking-[0.2em]">
              Set New Password
            </h1>
            <p className="font-display text-[#0a0f18]/60 text-[9px] uppercase tracking-widest">
              NVS Buildcon & Architects
            </p>
          </div>

          <form onSubmit={handleSubmit} className="px-8 py-8 space-y-4">
            {error && (
              <div className="flex items-center gap-2.5 p-3.5 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs">
                <AlertCircle size={14} className="shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {success ? (
              <div className="flex flex-col items-center gap-3 p-4 bg-green-500/10 border border-green-500/20 rounded-xl text-green-400 text-sm text-center">
                <ShieldCheck size={32} className="shrink-0" />
                <span>Password reset successful! Redirecting to login...</span>
              </div>
            ) : (
              <>
                <div className="relative">
                  <span className="absolute inset-y-0 left-3.5 flex items-center text-brand-on-surface-variant/40 pointer-events-none">
                    <Lock size={14} />
                  </span>
                  <input
                    type="password"
                    placeholder="New Password"
                    required
                    disabled={!token}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className={inputClass}
                  />
                </div>
                <div className="relative">
                  <span className="absolute inset-y-0 left-3.5 flex items-center text-brand-on-surface-variant/40 pointer-events-none">
                    <Lock size={14} />
                  </span>
                  <input
                    type="password"
                    placeholder="Confirm New Password"
                    required
                    disabled={!token}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className={inputClass}
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading || !token}
                  className="w-full flex items-center justify-center gap-2 py-3.5 bg-brand-gold text-[#0a0f18] font-display text-[11px] font-black uppercase tracking-widest rounded-xl shadow-lg shadow-brand-gold/20 hover:scale-[1.02] disabled:opacity-60 disabled:cursor-not-allowed disabled:scale-100 transition-all duration-200 mt-2"
                >
                  {loading ? <><Loader2 size={14} className="animate-spin" /> Please wait...</> : 'Reset Password'}
                </button>
              </>
            )}

            <p className="text-center text-[11px] text-brand-on-surface-variant/60 pt-1">
              <button type="button" onClick={() => navigate('/')} className="text-brand-gold font-bold hover:underline">
                Back to Login
              </button>
            </p>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
