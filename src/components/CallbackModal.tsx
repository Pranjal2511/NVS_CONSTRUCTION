import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Phone, User, Clock, CheckCircle, Loader2 } from 'lucide-react';
import { apiFetch } from '../utils/api';

interface CallbackModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const TIME_OPTIONS = ['Morning (9am–12pm)', 'Afternoon (12pm–4pm)', 'Evening (4pm–7pm)'];

export default function CallbackModal({ isOpen, onClose }: CallbackModalProps) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [preferredTime, setPreferredTime] = useState(TIME_OPTIONS[0]);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone) {
      setError('Please enter your name and phone number.');
      return;
    }
    setError(null);
    setLoading(true);

    try {
      const res = await apiFetch('/api/enquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          phone,
          email: `callback-${Date.now()}@nvsbuildcon.com`, // placeholder to pass validation
          service: 'Callback Request',
          message: `Callback requested for ${preferredTime}. Phone: ${phone}`,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || 'Submission failed. Please try again.');
      }

      setSubmitted(true);
      setName('');
      setPhone('');
      setPreferredTime(TIME_OPTIONS[0]);
    } catch (err: any) {
      setError(err.message || 'Server error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setSubmitted(false);
    setError(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[160] flex items-center justify-center p-4 bg-brand-surface-lowest/90 backdrop-blur-md"
        onClick={handleClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 16 }}
          transition={{ duration: 0.3, ease: [0.25, 1, 0.5, 1] }}
          className="relative w-full max-w-md bg-brand-surface-container border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Gold top accent */}
          <div className="h-1 w-full bg-gradient-to-r from-brand-gold/60 via-brand-gold to-brand-gold/60" />

          <div className="px-8 py-8">
            {/* Close */}
            <button
              onClick={handleClose}
              className="absolute top-5 right-5 p-1.5 rounded-full hover:bg-white/5 text-brand-on-surface-variant hover:text-white transition-colors"
            >
              <X size={18} />
            </button>

            {submitted ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-6"
              >
                <div className="w-14 h-14 bg-brand-gold/10 text-brand-gold rounded-full flex items-center justify-center mx-auto mb-5">
                  <CheckCircle size={30} />
                </div>
                <h3 className="font-display text-lg font-bold text-white mb-2">
                  Callback Registered!
                </h3>
                <p className="text-xs text-brand-on-surface-variant leading-relaxed mb-6">
                  Our team will call you during your preferred window. Keep your phone handy.
                </p>
                <button
                  onClick={handleClose}
                  className="px-6 py-2.5 bg-brand-gold text-[#0a0f18] text-xs font-bold font-display uppercase tracking-widest rounded-lg hover:scale-105 transition-all"
                >
                  Close
                </button>
              </motion.div>
            ) : (
              <>
                <div className="mb-6">
                  <span className="inline-block px-3 py-1 text-[9px] font-bold uppercase tracking-widest text-brand-gold bg-brand-gold/10 rounded-full mb-3">
                    Quick Callback
                  </span>
                  <h2 className="font-display text-xl font-bold text-white mb-1">
                    We'll Call You Back
                  </h2>
                  <p className="text-xs text-brand-on-surface-variant">
                    Leave your number and preferred time. Our team will call you promptly.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Name */}
                  <div className="relative">
                    <User size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-on-surface-variant/50" />
                    <input
                      type="text"
                      required
                      placeholder="Your Name *"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-brand-surface-lowest text-brand-on-surface text-sm pl-10 pr-4 py-3 rounded-lg border border-white/10 focus:border-brand-gold/50 focus:outline-none transition-all placeholder:text-brand-on-surface/30"
                    />
                  </div>

                  {/* Phone */}
                  <div className="relative">
                    <Phone size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-on-surface-variant/50" />
                    <input
                      type="tel"
                      required
                      placeholder="Phone Number *"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full bg-brand-surface-lowest text-brand-on-surface text-sm pl-10 pr-4 py-3 rounded-lg border border-white/10 focus:border-brand-gold/50 focus:outline-none transition-all placeholder:text-brand-on-surface/30"
                    />
                  </div>

                  {/* Preferred time */}
                  <div>
                    <label className="block text-[10px] font-bold font-display uppercase tracking-widest text-brand-on-surface/50 mb-2 flex items-center gap-1.5">
                      <Clock size={11} /> Preferred Callback Time
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {TIME_OPTIONS.map((opt) => (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => setPreferredTime(opt)}
                          className={`py-2 px-1.5 rounded-lg border text-[9px] font-bold font-display uppercase tracking-wider transition-all text-center leading-tight ${
                            preferredTime === opt
                              ? 'bg-brand-gold border-brand-gold text-[#0a0f18]'
                              : 'border-white/10 text-brand-on-surface-variant hover:border-brand-gold/30'
                          }`}
                        >
                          {opt.split(' ')[0]}
                        </button>
                      ))}
                    </div>
                    <p className="text-[9px] text-brand-on-surface-variant/40 mt-1.5">{preferredTime}</p>
                  </div>

                  {error && (
                    <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg py-2 px-3">
                      {error}
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-brand-gold hover:bg-brand-gold/90 text-[#0a0f18] py-3.5 rounded-lg text-xs font-bold font-display uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-2 shadow-lg shadow-brand-gold/10 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <><Loader2 size={14} className="animate-spin" /> Submitting...</>
                    ) : (
                      <><Phone size={14} /> Request Callback</>
                    )}
                  </button>
                </form>
              </>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
