import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X, Calendar, Clock, User, Phone, Mail, FileText, CheckCircle, Send, Loader2
} from 'lucide-react';
import { apiFetch } from '../utils/api';

interface BookConsultationModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialService?: string;
}

const TIME_SLOTS = [
  { label: 'Morning', sub: '9:00 AM – 12:00 PM', value: '9:00 AM' },
  { label: 'Afternoon', sub: '12:00 PM – 4:00 PM', value: '1:00 PM' },
  { label: 'Evening', sub: '4:00 PM – 7:00 PM', value: '5:00 PM' },
];

const SERVICES = [
  'Architectural Design',
  'Structural Engineering',
  'Interior Architecture',
  '3D Elevation Rendering',
  'Full Turnkey Construction',
  'Site Visit Consultation',
  'Vastu Planning',
];

export default function BookConsultationModal({
  isOpen,
  onClose,
  initialService,
}: BookConsultationModalProps) {
  const [step, setStep] = useState<'form' | 'success'>('form');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [service, setService] = useState(initialService || SERVICES[0]);
  const [date, setDate] = useState('');
  const [timeSlot, setTimeSlot] = useState(TIME_SLOTS[0].value);
  const [notes, setNotes] = useState('');

  const today = new Date().toISOString().split('T')[0];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !phone || !date) {
      setError('Please fill in all required fields.');
      return;
    }
    setError(null);
    setLoading(true);

    try {
      const res = await apiFetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          phone,
          service,
          date,
          time: timeSlot,
          preferredDate: date,
          preferredTime: timeSlot,
          notes,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || 'Submission failed. Please try again.');
      }

      setStep('success');
      // Reset form
      setName(''); setEmail(''); setPhone('');
      setDate(''); setNotes('');
      setService(SERVICES[0]);
      setTimeSlot(TIME_SLOTS[0].value);
    } catch (err: any) {
      setError(err.message || 'Server error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setStep('form');
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
          initial={{ opacity: 0, y: 24, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 24, scale: 0.97 }}
          transition={{ duration: 0.35, ease: [0.25, 1, 0.5, 1] }}
          className="relative w-full max-w-2xl bg-brand-surface-container border border-white/10 rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-brand-surface-highest to-brand-surface-high border-b border-white/5 px-8 py-6 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Calendar size={16} className="text-brand-gold" />
                <span className="text-[10px] font-bold font-display uppercase tracking-widest text-brand-gold">
                  NVS Buildcon
                </span>
              </div>
              <h2 className="font-display text-xl font-bold text-white tracking-tight">
                Book a Consultation
              </h2>
              <p className="text-xs text-brand-on-surface-variant mt-1">
                Schedule a free session with our principal architects.
              </p>
            </div>
            <button
              onClick={handleClose}
              className="p-2 rounded-full hover:bg-white/5 text-brand-on-surface-variant hover:text-white transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Body */}
          <div className="px-8 py-8">
            {step === 'success' ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-10"
              >
                <div className="w-16 h-16 bg-brand-gold/10 text-brand-gold rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle size={36} />
                </div>
                <h3 className="font-display text-2xl font-bold text-white mb-3">
                  Consultation Booked!
                </h3>
                <p className="text-sm text-brand-on-surface-variant max-w-sm mx-auto mb-6 leading-relaxed">
                  Your request has been logged. Our team will confirm your slot within 2 hours. Check WhatsApp for updates.
                </p>
                <div className="flex gap-3 justify-center">
                  <button
                    onClick={() => setStep('form')}
                    className="px-5 py-2.5 bg-brand-surface-highest border border-white/10 text-brand-on-surface text-xs font-bold font-display uppercase tracking-widest rounded-lg hover:border-brand-gold/30 transition-all"
                  >
                    Book Another
                  </button>
                  <button
                    onClick={handleClose}
                    className="px-5 py-2.5 bg-brand-gold text-[#0a0f18] text-xs font-bold font-display uppercase tracking-widest rounded-lg hover:scale-105 transition-all"
                  >
                    Done
                  </button>
                </div>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Name / Phone / Email */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="relative">
                    <User size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-on-surface-variant/50" />
                    <input
                      type="text"
                      required
                      placeholder="Full Name *"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-brand-surface-lowest text-brand-on-surface text-sm pl-10 pr-4 py-3 rounded-lg border border-white/10 focus:border-brand-gold/50 focus:outline-none transition-all placeholder:text-brand-on-surface/30"
                    />
                  </div>
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
                </div>

                <div className="relative">
                  <Mail size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-on-surface-variant/50" />
                  <input
                    type="email"
                    required
                    placeholder="Email Address *"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-brand-surface-lowest text-brand-on-surface text-sm pl-10 pr-4 py-3 rounded-lg border border-white/10 focus:border-brand-gold/50 focus:outline-none transition-all placeholder:text-brand-on-surface/30"
                  />
                </div>

                {/* Service */}
                <div>
                  <label className="block text-[10px] font-bold font-display uppercase tracking-widest text-brand-on-surface/50 mb-2">
                    Consultation Topic
                  </label>
                  <select
                    value={service}
                    onChange={(e) => setService(e.target.value)}
                    className="w-full bg-brand-surface-lowest text-brand-on-surface text-sm px-4 py-3 rounded-lg border border-white/10 focus:border-brand-gold/50 focus:outline-none transition-all"
                  >
                    {SERVICES.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                {/* Date + Time */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold font-display uppercase tracking-widest text-brand-on-surface/50 mb-2 flex items-center gap-1.5">
                      <Calendar size={11} /> Preferred Date *
                    </label>
                    <input
                      type="date"
                      required
                      min={today}
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full bg-brand-surface-lowest text-brand-on-surface text-sm px-4 py-3 rounded-lg border border-white/10 focus:border-brand-gold/50 focus:outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold font-display uppercase tracking-widest text-brand-on-surface/50 mb-2 flex items-center gap-1.5">
                      <Clock size={11} /> Preferred Time
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {TIME_SLOTS.map((slot) => (
                        <button
                          key={slot.value}
                          type="button"
                          onClick={() => setTimeSlot(slot.value)}
                          className={`py-2 px-2 rounded-lg border text-[9px] font-bold font-display uppercase tracking-wider transition-all text-center ${
                            timeSlot === slot.value
                              ? 'bg-brand-gold border-brand-gold text-[#0a0f18]'
                              : 'border-white/10 text-brand-on-surface-variant hover:border-brand-gold/30'
                          }`}
                        >
                          <span className="block">{slot.label}</span>
                          <span className="block text-[7px] opacity-70 mt-0.5 normal-case font-normal">{slot.sub.split('–')[0].trim()}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Notes */}
                <div className="relative">
                  <FileText size={14} className="absolute left-3.5 top-3.5 text-brand-on-surface-variant/50" />
                  <textarea
                    rows={3}
                    placeholder="Project brief, plot size, or any specific questions (optional)..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full bg-brand-surface-lowest text-brand-on-surface text-sm pl-10 pr-4 py-3 rounded-lg border border-white/10 focus:border-brand-gold/50 focus:outline-none transition-all placeholder:text-brand-on-surface/30 resize-none"
                  />
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
                    <><Send size={14} /> Confirm Consultation Request</>
                  )}
                </button>

                <p className="text-center text-[9px] text-brand-on-surface-variant/40 uppercase tracking-wider">
                  We'll confirm your slot via WhatsApp within 2 hours
                </p>
              </form>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
