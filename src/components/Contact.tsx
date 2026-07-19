import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Mail, Phone, MapPin, Send, CheckCircle,
  Calendar, Clock, User, FileText, Loader2
} from 'lucide-react';
import { apiFetch } from '../utils/api';

interface ContactProps {
  onInquire?: (projectName?: string) => void;
}

const SERVICES = [
  'Architectural Design',
  'Structural Engineering',
  'Interior Architecture',
  '3D Elevation Rendering',
  'Full Turnkey Construction',
  'Site Visit Consultation',
  'Vastu Planning',
];

const TIME_SLOTS = [
  { label: 'Morning', sub: '9am–12pm', value: '9:00 AM' },
  { label: 'Afternoon', sub: '12pm–4pm', value: '1:00 PM' },
  { label: 'Evening', sub: '4pm–7pm', value: '5:00 PM' },
];

export default function Contact({ onInquire }: ContactProps) {
  const [activeTab, setActiveTab] = useState<'message' | 'consultation'>('message');

  // ── Message Form State ───────────────────────────
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [service, setService] = useState('Architectural Design');
  const [message, setMessage] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ── Consultation Form State ──────────────────────
  const [cName, setCName] = useState('');
  const [cEmail, setCEmail] = useState('');
  const [cPhone, setCPhone] = useState('');
  const [cService, setCService] = useState(SERVICES[0]);
  const [cDate, setCDate] = useState('');
  const [cTime, setCTime] = useState(TIME_SLOTS[0].value);
  const [cNotes, setCNotes] = useState('');
  const [cSubmitted, setCSubmitted] = useState(false);
  const [cLoading, setCLoading] = useState(false);
  const [cError, setCError] = useState<string | null>(null);

  const today = new Date().toISOString().split('T')[0];

  const handleSubmitMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !phone || !message) {
      setError('Please fill in all required fields.');
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const res = await apiFetch('/api/enquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, phone, email, service, message }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || 'Failed to submit message.');
      }
      setIsSubmitted(true);
      const saved = localStorage.getItem('nvs_inquiries');
      const past = saved ? JSON.parse(saved) : [];
      localStorage.setItem('nvs_inquiries', JSON.stringify([{ id: Math.random().toString(36).substr(2, 9), name, email, phone, service, message, date: new Date().toLocaleDateString(), status: 'New' }, ...past]));
      setName(''); setEmail(''); setPhone(''); setMessage('');
    } catch (err: any) {
      setError(err.message || 'Server error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitConsultation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cName || !cEmail || !cPhone || !cDate) {
      setCError('Please fill in all required fields including the date.');
      return;
    }
    setCError(null);
    setCLoading(true);
    try {
      const res = await apiFetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: cName, email: cEmail, phone: cPhone,
          service: cService, date: cDate, time: cTime,
          preferredDate: cDate, preferredTime: cTime, notes: cNotes,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || 'Booking failed. Please try again.');
      }
      setCSubmitted(true);
      setCName(''); setCEmail(''); setCPhone(''); setCDate(''); setCNotes('');
    } catch (err: any) {
      setCError(err.message || 'Server error. Please try again.');
    } finally {
      setCLoading(false);
    }
  };

  return (
    <div className="text-brand-on-surface min-h-screen bg-brand-surface pt-28 pb-20 px-6 md:px-16">
      {/* Page Header */}
      <section className="max-w-7xl mx-auto text-center mb-16">
        <span className="inline-block px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-brand-secondary bg-brand-secondary/10 rounded-full mb-4">
          Connect With Us
        </span>
        <h1 className="font-display text-4xl md:text-5xl font-bold tracking-tight text-brand-on-surface mb-4">
          Contact Our Firm
        </h1>
        <p className="text-sm text-brand-on-surface-variant max-w-lg mx-auto font-serif italic">
          Partner with NVS Buildcon to manifest your architectural vision. Schedule an on-site consultation or request drawing specifications.
        </p>
        <div className="gold-line mt-8 w-24 mx-auto" />
      </section>

      {/* Main Grid */}
      <section className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-start mb-20">
        {/* Left: Contact Info */}
        <div className="lg:col-span-5 space-y-6">
          <h3 className="font-display text-xl font-bold text-white mb-6 uppercase tracking-wider">
            Offices & Communications
          </h3>

          {/* Phone Card */}
          <div className="p-6 bg-brand-surface-container/40 border border-white/5 rounded-2xl flex gap-4 items-center hover:border-brand-secondary/20 transition-all duration-300 group">
            <span className="p-4 rounded-xl bg-brand-secondary/10 text-brand-secondary group-hover:scale-105 transition-transform">
              <Phone size={22} />
            </span>
            <div>
              <span className="text-[10px] font-bold font-mono text-brand-secondary uppercase tracking-widest block">Direct Phone</span>
              <a href="tel:+918009363259" className="font-display text-sm md:text-base font-bold text-brand-on-surface hover:text-brand-secondary mt-0.5 block transition-colors">
                +91 8009363259
              </a>
            </div>
          </div>

          {/* Email Card */}
          <div className="p-6 bg-brand-surface-container/40 border border-white/5 rounded-2xl flex gap-4 items-center hover:border-brand-secondary/20 transition-all duration-300 group">
            <span className="p-4 rounded-xl bg-brand-secondary/10 text-brand-secondary group-hover:scale-105 transition-transform">
              <Mail size={22} />
            </span>
            <div>
              <span className="text-[10px] font-bold font-mono text-brand-secondary uppercase tracking-widest block">Principal Designer</span>
              <a href="https://instagram.com/nishant.designs13" target="_blank" rel="noopener noreferrer" className="font-display text-sm md:text-base font-bold text-brand-on-surface hover:text-brand-secondary mt-0.5 block transition-colors">
                @nishant.designs13
              </a>
            </div>
          </div>

          {/* Address Card */}
          <div className="p-6 bg-brand-surface-container/40 border border-white/5 rounded-2xl flex gap-4 items-center hover:border-brand-secondary/20 transition-all duration-300 group">
            <span className="p-4 rounded-xl bg-brand-secondary/10 text-brand-secondary group-hover:scale-105 transition-transform">
              <MapPin size={22} />
            </span>
            <div>
              <span className="text-[10px] font-bold font-mono text-brand-secondary uppercase tracking-widest block">Headquarters</span>
              <p className="font-serif text-sm text-brand-on-surface-variant/90 leading-relaxed mt-0.5 font-light">
                Lucknow & Delhi NCR, India
              </p>
            </div>
          </div>

          {/* Hours Card */}
          <div className="p-6 bg-brand-surface-container/30 border border-white/5 rounded-2xl">
            <div className="flex items-center gap-2 mb-3">
              <Clock size={14} className="text-brand-secondary" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-brand-on-surface/50">
                Consultation Hours
              </h4>
            </div>
            <p className="text-xs text-brand-on-surface-variant leading-relaxed">
              Monday — Saturday: 09:00 AM — 07:00 PM (IST)<br />
              Sunday: By Appointment Only (Site Visits)
            </p>
          </div>

          {/* WhatsApp Direct CTA */}
          <a
            href="https://wa.me/918009363259?text=Hi%2C%20I%27d%20like%20to%20discuss%20my%20project%20with%20NVS%20Buildcon."
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 p-5 bg-[#25D366]/10 border border-[#25D366]/30 rounded-2xl hover:border-[#25D366]/60 hover:bg-[#25D366]/15 transition-all duration-300 group"
          >
            <span className="p-3 rounded-xl bg-[#25D366]/20 text-[#25D366] group-hover:scale-105 transition-transform">
              <Phone size={20} />
            </span>
            <div>
              <span className="text-[10px] font-bold font-mono text-[#25D366] uppercase tracking-widest block">WhatsApp Direct</span>
              <span className="font-display text-sm font-bold text-white mt-0.5 block">Chat on WhatsApp</span>
            </div>
          </a>
        </div>

        {/* Right: Tab Panel */}
        <div className="lg:col-span-7 bg-brand-surface-lowest/50 border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
          {/* Tab switcher */}
          <div className="flex border-b border-white/10">
            <button
              onClick={() => setActiveTab('message')}
              className={`flex-1 py-4 px-6 text-[10px] font-bold font-display uppercase tracking-widest transition-all duration-200 flex items-center justify-center gap-2 ${
                activeTab === 'message'
                  ? 'bg-brand-surface-container text-brand-gold border-b-2 border-brand-gold'
                  : 'text-brand-on-surface-variant hover:text-white hover:bg-white/5'
              }`}
            >
              <Mail size={13} /> Send Message
            </button>
            <button
              onClick={() => setActiveTab('consultation')}
              className={`flex-1 py-4 px-6 text-[10px] font-bold font-display uppercase tracking-widest transition-all duration-200 flex items-center justify-center gap-2 ${
                activeTab === 'consultation'
                  ? 'bg-brand-surface-container text-brand-gold border-b-2 border-brand-gold'
                  : 'text-brand-on-surface-variant hover:text-white hover:bg-white/5'
              }`}
            >
              <Calendar size={13} /> Book Consultation
            </button>
          </div>

          <AnimatePresence mode="wait">
            {activeTab === 'message' ? (
              <motion.div
                key="message"
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -12 }}
                transition={{ duration: 0.25 }}
                className="p-8 md:p-10 min-h-[480px] flex flex-col justify-between"
              >
                {isSubmitted ? (
                  <div className="my-auto text-center py-8">
                    <div className="w-16 h-16 bg-brand-secondary/10 text-brand-secondary rounded-full flex items-center justify-center mx-auto mb-6">
                      <CheckCircle size={36} />
                    </div>
                    <h3 className="font-display text-2xl font-bold text-brand-on-surface mb-2">Message Received</h3>
                    <p className="text-sm text-brand-on-surface-variant max-w-md mx-auto mb-8 leading-relaxed">
                      Thank you. Our team will review your requirements and get back to you soon.
                    </p>
                    <button
                      onClick={() => setIsSubmitted(false)}
                      className="px-6 py-2.5 bg-brand-surface-highest text-brand-secondary border border-brand-secondary/30 rounded-lg text-xs font-bold font-display uppercase tracking-widest hover:bg-brand-secondary/10 transition-all duration-300"
                    >
                      Send Another Message
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmitMessage} className="space-y-5">
                    <div>
                      <h3 className="font-display text-xl font-bold text-white mb-2 uppercase tracking-wider">Project Inquiry Form</h3>
                      <p className="text-xs text-brand-on-surface-variant mb-6">Fill in your details and select a service. Our team will get back to you promptly.</p>
                    </div>

                    {error && (
                      <p className="text-sm text-red-400 mb-4 bg-red-500/10 border border-red-500/20 rounded-lg py-2 px-3">{error}</p>
                    )}

                    <div className="space-y-4">
                      <input type="text" required placeholder="Your Name" value={name} onChange={(e) => setName(e.target.value)}
                        className="w-full bg-brand-surface-lowest text-brand-on-surface text-sm px-4 py-3 rounded-lg border border-white/10 focus:border-brand-secondary focus:outline-none transition-all placeholder:text-brand-on-surface/30" />

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <input type="email" required placeholder="Email Address" value={email} onChange={(e) => setEmail(e.target.value)}
                          className="w-full bg-brand-surface-lowest text-brand-on-surface text-sm px-4 py-3 rounded-lg border border-white/10 focus:border-brand-secondary focus:outline-none transition-all placeholder:text-brand-on-surface/30" />
                        <input type="tel" required placeholder="Phone Number" value={phone} onChange={(e) => setPhone(e.target.value)}
                          className="w-full bg-brand-surface-lowest text-brand-on-surface text-sm px-4 py-3 rounded-lg border border-white/10 focus:border-brand-secondary focus:outline-none transition-all placeholder:text-brand-on-surface/30" />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-brand-on-surface/60 mb-2 uppercase tracking-widest">Selected Service</label>
                        <select value={service} onChange={(e) => setService(e.target.value)}
                          className="w-full bg-brand-surface-lowest text-brand-on-surface text-sm px-4 py-3 rounded-lg border border-white/10 focus:border-brand-secondary focus:outline-none transition-all">
                          {SERVICES.map((s) => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </div>

                      <textarea rows={4} required placeholder="Describe your property specifications, plot size, or design requirements..."
                        value={message} onChange={(e) => setMessage(e.target.value)}
                        className="w-full bg-brand-surface-lowest text-brand-on-surface text-sm px-4 py-3 rounded-lg border border-white/10 focus:border-brand-secondary focus:outline-none transition-all placeholder:text-brand-on-surface/30 resize-none" />

                      <button type="submit" disabled={loading}
                        className="w-full bg-brand-secondary hover:bg-brand-secondary/90 text-brand-on-primary py-3.5 rounded-lg text-xs font-bold font-display uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-2 shadow-lg shadow-brand-secondary/10 disabled:opacity-50 disabled:cursor-not-allowed">
                        {loading ? <><Loader2 size={14} className="animate-spin" /> Sending...</> : <><Send size={14} /> Send Message</>}
                      </button>
                    </div>
                  </form>
                )}
              </motion.div>
            ) : (
              <motion.div
                key="consultation"
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 12 }}
                transition={{ duration: 0.25 }}
                className="p-8 md:p-10 min-h-[480px] flex flex-col justify-between"
              >
                {cSubmitted ? (
                  <div className="my-auto text-center py-8">
                    <div className="w-16 h-16 bg-brand-gold/10 text-brand-gold rounded-full flex items-center justify-center mx-auto mb-6">
                      <CheckCircle size={36} />
                    </div>
                    <h3 className="font-display text-2xl font-bold text-white mb-2">Consultation Booked!</h3>
                    <p className="text-sm text-brand-on-surface-variant max-w-md mx-auto mb-8 leading-relaxed">
                      Your consultation request has been logged. We'll confirm your slot within 2 hours via WhatsApp.
                    </p>
                    <button onClick={() => setCSubmitted(false)}
                      className="px-6 py-2.5 bg-brand-surface-highest text-brand-gold border border-brand-gold/30 rounded-lg text-xs font-bold font-display uppercase tracking-widest hover:bg-brand-gold/10 transition-all duration-300">
                      Book Another
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmitConsultation} className="space-y-5">
                    <div>
                      <h3 className="font-display text-xl font-bold text-white mb-2 uppercase tracking-wider">Book a Consultation</h3>
                      <p className="text-xs text-brand-on-surface-variant mb-6">Schedule a free session with our principal architects at your preferred time.</p>
                    </div>

                    {cError && (
                      <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg py-2 px-3">{cError}</p>
                    )}

                    <div className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="relative">
                          <User size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-on-surface-variant/50" />
                          <input type="text" required placeholder="Full Name *" value={cName} onChange={(e) => setCName(e.target.value)}
                            className="w-full bg-brand-surface-lowest text-brand-on-surface text-sm pl-10 pr-4 py-3 rounded-lg border border-white/10 focus:border-brand-gold/50 focus:outline-none transition-all placeholder:text-brand-on-surface/30" />
                        </div>
                        <div className="relative">
                          <Phone size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-on-surface-variant/50" />
                          <input type="tel" required placeholder="Phone Number *" value={cPhone} onChange={(e) => setCPhone(e.target.value)}
                            className="w-full bg-brand-surface-lowest text-brand-on-surface text-sm pl-10 pr-4 py-3 rounded-lg border border-white/10 focus:border-brand-gold/50 focus:outline-none transition-all placeholder:text-brand-on-surface/30" />
                        </div>
                      </div>

                      <div className="relative">
                        <Mail size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-on-surface-variant/50" />
                        <input type="email" required placeholder="Email Address *" value={cEmail} onChange={(e) => setCEmail(e.target.value)}
                          className="w-full bg-brand-surface-lowest text-brand-on-surface text-sm pl-10 pr-4 py-3 rounded-lg border border-white/10 focus:border-brand-gold/50 focus:outline-none transition-all placeholder:text-brand-on-surface/30" />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold font-display uppercase tracking-widest text-brand-on-surface/50 mb-2">Consultation Topic</label>
                        <select value={cService} onChange={(e) => setCService(e.target.value)}
                          className="w-full bg-brand-surface-lowest text-brand-on-surface text-sm px-4 py-3 rounded-lg border border-white/10 focus:border-brand-gold/50 focus:outline-none transition-all">
                          {SERVICES.map((s) => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] font-bold font-display uppercase tracking-widest text-brand-on-surface/50 mb-2 flex items-center gap-1.5">
                            <Calendar size={10} /> Preferred Date *
                          </label>
                          <input type="date" required min={today} value={cDate} onChange={(e) => setCDate(e.target.value)}
                            className="w-full bg-brand-surface-lowest text-brand-on-surface text-sm px-4 py-3 rounded-lg border border-white/10 focus:border-brand-gold/50 focus:outline-none transition-all" />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold font-display uppercase tracking-widest text-brand-on-surface/50 mb-2 flex items-center gap-1.5">
                            <Clock size={10} /> Time Slot
                          </label>
                          <div className="grid grid-cols-3 gap-1.5">
                            {TIME_SLOTS.map((slot) => (
                              <button key={slot.value} type="button" onClick={() => setCTime(slot.value)}
                                className={`py-2 px-1 rounded-lg border text-[9px] font-bold font-display uppercase tracking-wider transition-all text-center ${
                                  cTime === slot.value ? 'bg-brand-gold border-brand-gold text-[#0a0f18]' : 'border-white/10 text-brand-on-surface-variant hover:border-brand-gold/30'
                                }`}>
                                <span className="block">{slot.label}</span>
                                <span className="block text-[7px] opacity-70 mt-0.5 normal-case font-normal">{slot.sub}</span>
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="relative">
                        <FileText size={13} className="absolute left-3.5 top-3.5 text-brand-on-surface-variant/50" />
                        <textarea rows={3} placeholder="Project notes, plot size, or any specific questions (optional)..."
                          value={cNotes} onChange={(e) => setCNotes(e.target.value)}
                          className="w-full bg-brand-surface-lowest text-brand-on-surface text-sm pl-10 pr-4 py-3 rounded-lg border border-white/10 focus:border-brand-gold/50 focus:outline-none transition-all placeholder:text-brand-on-surface/30 resize-none" />
                      </div>

                      <button type="submit" disabled={cLoading}
                        className="w-full bg-brand-gold hover:bg-brand-gold/90 text-[#0a0f18] py-3.5 rounded-lg text-xs font-bold font-display uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-2 shadow-lg shadow-brand-gold/10 disabled:opacity-50 disabled:cursor-not-allowed">
                        {cLoading ? <><Loader2 size={14} className="animate-spin" /> Booking...</> : <><Calendar size={14} /> Confirm Consultation</>}
                      </button>
                      <p className="text-center text-[9px] text-brand-on-surface-variant/40 uppercase tracking-wider">Slot confirmed via WhatsApp within 2 hours</p>
                    </div>
                  </form>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* Google Maps section */}
      <section className="max-w-7xl mx-auto rounded-2xl overflow-hidden border border-white/10 shadow-2xl h-96 relative">
        <iframe
          title="NVS Buildcon Location Map"
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d113896.79541571556!2d80.85966601625801!3d26.84882057393439!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x399bfd991f32b17b%3A0x12c99df7393699c7!2sLucknow%2C%20Uttar%20Pradesh%2C%20India!5e0!3m2!1sen!2sus!4v1700000000000!5m2!1sen!2sus"
          width="100%"
          height="100%"
          style={{ border: 0, filter: 'invert(90%) hue-rotate(180deg) grayscale(100%) brightness(90%) contrast(90%)' }}
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        ></iframe>
        <div className="absolute bottom-6 left-6 glass-gold p-4 rounded-xl max-w-xs border border-brand-secondary/20 shadow-2xl hidden md:block">
          <h4 className="font-display text-xs font-bold text-white uppercase tracking-wider mb-1">NVS Buildcon HQ</h4>
          <p className="text-[11px] text-brand-on-surface-variant/90 leading-relaxed font-serif">
            Lucknow, Uttar Pradesh, India. Operational across major metropolitan zones including Delhi NCR.
          </p>
        </div>
      </section>
    </div>
  );
}
