import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ShieldCheck, Mail, AlertCircle, Loader2 } from 'lucide-react';
import { loginAdmin, verifyLoginOtp } from '../utils/auth';

interface AdminLoginProps {
  onLoginSuccess: () => void;
}

export default function AdminLogin({ onLoginSuccess }: AdminLoginProps) {
  const [identifier, setIdentifier] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSentTo, setOtpSentTo] = useState('');
  const [otpChannel, setOtpChannel] = useState<'email' | 'phone' | null>(null);
  const [devOtp, setDevOtp] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (otpSentTo) {
        await verifyLoginOtp(otpSentTo, otp, 'admin');
        onLoginSuccess();
        return;
      }

      const challenge = await loginAdmin(identifier);
      setOtpSentTo(challenge.identifier);
      setOtpChannel(challenge.channel);
      setDevOtp(challenge.devOtp || '');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Admin authentication failed.');
    } finally {
      setLoading(false);
    }
  };

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
              <ShieldCheck size={26} className="text-[#0a0f18]" />
            </span>
            <h1 className="font-display text-[#0a0f18] text-lg font-black uppercase tracking-[0.2em]">
              {otpSentTo ? 'Verify Admin' : 'Admin Portal'}
            </h1>
            <p className="font-display text-[#0a0f18]/60 text-[9px] uppercase tracking-widest">
              NVS Buildcon & Architects
            </p>
          </div>

          <form onSubmit={handleSubmit} className="px-8 py-8 space-y-5">
            {error && (
              <div className="flex items-center gap-2.5 p-3.5 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs">
                <AlertCircle size={14} className="shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {otpSentTo && (
              <div className="flex items-start gap-2.5 p-3.5 bg-brand-gold/10 border border-brand-gold/20 rounded-xl text-brand-gold text-xs">
                <ShieldCheck size={14} className="shrink-0 mt-0.5" />
                <span>
                  Enter the 6-digit OTP sent to the admin {otpChannel === 'phone' ? 'phone' : 'email'}.
                  {devOtp ? <strong className="block mt-1">Local dev OTP: {devOtp}</strong> : null}
                </span>
              </div>
            )}

            {!otpSentTo ? (
              <div className="space-y-1.5">
                <label htmlFor="admin-identifier" className="block font-display text-[10px] font-bold uppercase tracking-widest text-brand-on-surface-variant">
                  Email
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-3.5 flex items-center text-brand-on-surface-variant/40 pointer-events-none">
                    <Mail size={14} />
                  </span>
                  <input
                    id="admin-identifier"
                    type="text"
                    required
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="admin@nvsbuildcon.com"
                    className="w-full pl-10 pr-4 py-3 text-sm rounded-xl bg-brand-surface-container border border-white/8 focus:outline-none focus:ring-2 focus:ring-brand-gold/40 focus:border-brand-gold/40 text-brand-on-surface placeholder:text-brand-on-surface/25 transition-all"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-1.5">
                <label htmlFor="admin-otp" className="block font-display text-[10px] font-bold uppercase tracking-widest text-brand-on-surface-variant">
                  OTP
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-3.5 flex items-center text-brand-on-surface-variant/40 pointer-events-none">
                    <ShieldCheck size={14} />
                  </span>
                  <input
                    id="admin-otp"
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    required
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="6-digit OTP"
                    className="w-full pl-10 pr-4 py-3 text-sm rounded-xl bg-brand-surface-container border border-white/8 focus:outline-none focus:ring-2 focus:ring-brand-gold/40 focus:border-brand-gold/40 text-brand-on-surface placeholder:text-brand-on-surface/25 transition-all"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3.5 bg-brand-gold text-[#0a0f18] font-display text-[11px] font-black uppercase tracking-widest rounded-xl shadow-lg shadow-brand-gold/20 hover:scale-[1.02] disabled:opacity-60 disabled:cursor-not-allowed disabled:scale-100 transition-all duration-200 mt-2"
            >
              {loading ? <><Loader2 size={14} className="animate-spin" /> Please wait...</> : otpSentTo ? 'Verify & Sign In' : 'Send Admin OTP'}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
