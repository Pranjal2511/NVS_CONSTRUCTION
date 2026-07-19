import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { User, Mail, Phone, AlertCircle, Loader2, ShieldCheck, Lock, KeyRound } from 'lucide-react';
import { loginUser, registerUser, verifyLoginOtp, loginWithPassword, forgotPasswordRequest } from '../utils/auth';

interface UserLoginProps {
  onLoginSuccess: () => void;
}

export default function UserLogin({ onLoginSuccess }: UserLoginProps) {
  const [isRegister, setIsRegister] = useState(false);
  const [loginMethod, setLoginMethod] = useState<'otp' | 'password'>('otp');
  const [forgotPasswordMode, setForgotPasswordMode] = useState(false);
  
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  
  const [otp, setOtp] = useState('');
  const [otpSentTo, setOtpSentTo] = useState('');
  const [otpChannel, setOtpChannel] = useState<'email' | 'phone' | null>(null);
  const [devOtp, setDevOtp] = useState('');
  
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const resetForm = () => {
    setFirstName('');
    setLastName('');
    setPhone('');
    setEmail('');
    setIdentifier('');
    setPassword('');
    setOtp('');
    setOtpSentTo('');
    setOtpChannel(null);
    setDevOtp('');
    setError(null);
    setSuccessMsg(null);
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setLoading(true);
    try {
      const msg = await forgotPasswordRequest(identifier);
      setSuccessMsg(msg);
      setForgotPasswordMode(false);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Forgot password request failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      if (otpSentTo) {
        await verifyLoginOtp(otpSentTo, otp, 'user');
        onLoginSuccess();
        return;
      }

      if (isRegister) {
        const challenge = await registerUser(firstName, lastName, email, phone);
        setOtpSentTo(challenge.identifier);
        setOtpChannel(challenge.channel);
        setDevOtp(challenge.devOtp || '');
      } else if (loginMethod === 'password') {
        await loginWithPassword(identifier, password);
        onLoginSuccess();
      } else {
        const challenge = await loginUser(identifier);
        setOtpSentTo(challenge.identifier);
        setOtpChannel(challenge.channel);
        setDevOtp(challenge.devOtp || '');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Authentication failed.';
      setError(msg);
      // If unverified error from password login, it sends OTP implicitly. Switch to OTP mode manually.
      if (msg.includes('verification OTP has been sent')) {
        setOtpSentTo(identifier);
        setOtpChannel('email');
      }
    } finally {
      setLoading(false);
    }
  };

  const switchMode = () => {
    setIsRegister(!isRegister);
    setForgotPasswordMode(false);
    resetForm();
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
              {forgotPasswordMode ? <KeyRound size={26} className="text-[#0a0f18]" /> : <User size={26} className="text-[#0a0f18]" />}
            </span>
            <h1 className="font-display text-[#0a0f18] text-lg font-black uppercase tracking-[0.2em]">
              {forgotPasswordMode ? 'Reset Password' : otpSentTo ? 'Verify OTP' : isRegister ? 'Create Account' : 'Welcome Back'}
            </h1>
            <p className="font-display text-[#0a0f18]/60 text-[9px] uppercase tracking-widest">
              NVS Buildcon & Architects
            </p>
          </div>

          {!isRegister && !otpSentTo && !forgotPasswordMode && (
            <div className="flex bg-brand-surface-container p-1 mx-8 mt-6 rounded-lg">
              <button
                onClick={() => { setLoginMethod('otp'); setError(null); }}
                className={`flex-1 py-2 text-xs font-bold uppercase tracking-widest rounded-md transition-all ${
                  loginMethod === 'otp' ? 'bg-brand-surface text-brand-gold shadow-sm' : 'text-brand-on-surface-variant hover:text-brand-on-surface'
                }`}
              >
                OTP Login
              </button>
              <button
                onClick={() => { setLoginMethod('password'); setError(null); }}
                className={`flex-1 py-2 text-xs font-bold uppercase tracking-widest rounded-md transition-all ${
                  loginMethod === 'password' ? 'bg-brand-surface text-brand-gold shadow-sm' : 'text-brand-on-surface-variant hover:text-brand-on-surface'
                }`}
              >
                Password Login
              </button>
            </div>
          )}

          <form onSubmit={forgotPasswordMode ? handleForgotPassword : handleSubmit} className="px-8 py-8 space-y-4">
            {error && (
              <div className="flex items-center gap-2.5 p-3.5 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs">
                <AlertCircle size={14} className="shrink-0" />
                <span>{error}</span>
              </div>
            )}
            
            {successMsg && (
              <div className="flex items-center gap-2.5 p-3.5 bg-green-500/10 border border-green-500/20 rounded-xl text-green-400 text-xs">
                <ShieldCheck size={14} className="shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            {otpSentTo && (
              <div className="flex items-start gap-2.5 p-3.5 bg-brand-gold/10 border border-brand-gold/20 rounded-xl text-brand-gold text-xs">
                <ShieldCheck size={14} className="shrink-0 mt-0.5" />
                <span>
                  Enter the 6-digit OTP sent to your {otpChannel === 'phone' ? 'phone' : 'email'}.
                  {devOtp ? <strong className="block mt-1">Local dev OTP: {devOtp}</strong> : null}
                </span>
              </div>
            )}

            <AnimatePresence mode="wait">
              {!otpSentTo && !forgotPasswordMode && isRegister && (
                <motion.div
                  key="register-fields"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.25 }}
                  className="space-y-4 overflow-hidden"
                >
                  <div className="grid grid-cols-2 gap-3">
                    <div className="relative">
                      <span className="absolute inset-y-0 left-3.5 flex items-center text-brand-on-surface-variant/40 pointer-events-none">
                        <User size={14} />
                      </span>
                      <input type="text" placeholder="First Name" required value={firstName} onChange={(e) => setFirstName(e.target.value)} className={inputClass} />
                    </div>
                    <input
                      type="text"
                      placeholder="Last Name"
                      required
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="w-full px-4 py-3 text-sm rounded-xl bg-brand-surface-container border border-white/8 focus:outline-none focus:ring-2 focus:ring-brand-gold/40 focus:border-brand-gold/40 text-brand-on-surface placeholder:text-brand-on-surface/25 transition-all"
                    />
                  </div>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-3.5 flex items-center text-brand-on-surface-variant/40 pointer-events-none">
                      <Phone size={14} />
                    </span>
                    <input type="tel" placeholder="Phone Number" required value={phone} onChange={(e) => setPhone(e.target.value)} className={inputClass} />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {!otpSentTo ? (
              <div className="relative">
                <span className="absolute inset-y-0 left-3.5 flex items-center text-brand-on-surface-variant/40 pointer-events-none">
                  <Mail size={14} />
                </span>
                <input
                  type={isRegister ? 'email' : 'text'}
                  placeholder={isRegister ? 'Email Address' : 'Email Address'}
                  required
                  value={isRegister ? email : identifier}
                  onChange={(e) => (isRegister ? setEmail(e.target.value) : setIdentifier(e.target.value))}
                  className={inputClass}
                />
              </div>
            ) : (
              <div className="relative">
                <span className="absolute inset-y-0 left-3.5 flex items-center text-brand-on-surface-variant/40 pointer-events-none">
                  <ShieldCheck size={14} />
                </span>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  placeholder="6-digit OTP"
                  required
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className={inputClass}
                />
              </div>
            )}
            
            {!otpSentTo && !isRegister && !forgotPasswordMode && loginMethod === 'password' && (
              <div className="space-y-2">
                <div className="relative">
                  <span className="absolute inset-y-0 left-3.5 flex items-center text-brand-on-surface-variant/40 pointer-events-none">
                    <Lock size={14} />
                  </span>
                  <input
                    type="password"
                    placeholder="Password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={inputClass}
                  />
                </div>
                <div className="flex justify-end">
                  <button type="button" onClick={() => { setForgotPasswordMode(true); setError(null); setSuccessMsg(null); }} className="text-[10px] text-brand-gold hover:underline">
                    Forgot Password?
                  </button>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3.5 bg-brand-gold text-[#0a0f18] font-display text-[11px] font-black uppercase tracking-widest rounded-xl shadow-lg shadow-brand-gold/20 hover:scale-[1.02] disabled:opacity-60 disabled:cursor-not-allowed disabled:scale-100 transition-all duration-200 mt-2"
            >
              {loading ? <><Loader2 size={14} className="animate-spin" /> Please wait...</> : 
               forgotPasswordMode ? 'Send Reset Link' : 
               otpSentTo ? 'Verify & Login' : 
               loginMethod === 'password' && !isRegister ? 'Login with Password' : 
               'Send OTP'}
            </button>

            <p className="text-center text-[11px] text-brand-on-surface-variant/60 pt-1">
              {forgotPasswordMode ? 'Remember your password?' : otpSentTo ? 'Need to change details?' : isRegister ? 'Already have an account?' : "Don't have an account?"}{' '}
              <button type="button" onClick={forgotPasswordMode ? () => setForgotPasswordMode(false) : otpSentTo ? resetForm : switchMode} className="text-brand-gold font-bold hover:underline">
                {forgotPasswordMode ? 'Login' : otpSentTo ? 'Start Over' : isRegister ? 'Login' : 'Register'}
              </button>
            </p>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
