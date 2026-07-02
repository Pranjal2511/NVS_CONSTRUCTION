import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Mail, Phone, MapPin, Send, CheckCircle, HelpCircle } from 'lucide-react';
import HCaptchaWidget from './HCaptchaWidget';
import { apiFetch } from '../utils/api';

interface ContactProps {
  onInquire?: (projectName?: string) => void;
}

export default function Contact({ onInquire }: ContactProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [service, setService] = useState('Architectural Design');
  const [message, setMessage] = useState('');
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
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
        body: JSON.stringify({
          name,
          phone,
          email,
          service,
          message,
          'h-captcha-response': captchaToken
        })
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || 'Failed to submit message.');
      }

      setIsSubmitted(true);

      // Save locally to show in history
      const saved = localStorage.getItem('nvs_inquiries');
      const past = saved ? JSON.parse(saved) : [];
      const newInq = {
        id: Math.random().toString(36).substr(2, 9),
        name,
        email,
        phone,
        service,
        message,
        date: new Date().toLocaleDateString(),
        status: 'New'
      };
      localStorage.setItem('nvs_inquiries', JSON.stringify([newInq, ...past]));

      // Reset
      setName('');
      setEmail('');
      setPhone('');
      setMessage('');
    } catch (err: any) {
      setError(err.message || 'Server error. Please try again.');
    } finally {
      setLoading(false);
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
        {/* Contact Info (Left 5 columns) */}
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
            <h4 className="text-xs font-bold uppercase tracking-wider text-brand-on-surface/50 mb-3">
              Consultation Hours
            </h4>
            <p className="text-xs text-brand-on-surface-variant leading-relaxed">
              Monday — Saturday: 09:00 AM — 07:00 PM (IST)<br />
              Sunday: By Appointment Only (Site Visits)
            </p>
          </div>
        </div>

        {/* Form Column (Right 7 columns) */}
        <div className="lg:col-span-7 bg-brand-surface-lowest/50 border border-white/10 rounded-2xl p-8 md:p-10 shadow-2xl min-h-[450px] flex flex-col justify-between">
          {isSubmitted ? (
            <div className="my-auto text-center py-8">
              <div className="w-16 h-16 bg-brand-secondary/10 text-brand-secondary rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle size={36} />
              </div>
              <h3 className="font-display text-2xl font-bold text-brand-on-surface mb-2">
                Message Received
              </h3>
              <p className="text-sm text-brand-on-surface-variant max-w-md mx-auto mb-8 leading-relaxed">
                Thank you. Your project inquiry has been successfully transmitted to our engineering team. We will review your site requirements and contact you within 2 hours.
              </p>
              <button
                onClick={() => setIsSubmitted(false)}
                className="px-6 py-2.5 bg-brand-surface-highest text-brand-secondary border border-brand-secondary/30 rounded-lg text-xs font-bold font-display uppercase tracking-widest hover:bg-brand-secondary/10 transition-all duration-300"
              >
                Send Another Message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <h3 className="font-display text-xl font-bold text-white mb-2 uppercase tracking-wider">
                Project Inquiry Form
              </h3>
              <p className="text-xs text-brand-on-surface-variant mb-6">
                Fill in your details and select a division. Our team will get back to you promptly.
              </p>

              {error && (
                <p className="text-sm text-red-400 mb-4 bg-red-500/10 border border-red-500/20 rounded-lg py-2 px-3">
                  {error}
                </p>
              )}

              <div className="space-y-4">
                {/* Name */}
                <input
                  type="text"
                  required
                  placeholder="Your Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-brand-surface-lowest text-brand-on-surface text-sm px-4 py-3 rounded-lg border border-white/10 focus:border-brand-secondary focus:outline-none transition-all placeholder:text-brand-on-surface/30"
                />

                {/* Email & Phone */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <input
                    type="email"
                    required
                    placeholder="Email Address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-brand-surface-lowest text-brand-on-surface text-sm px-4 py-3 rounded-lg border border-white/10 focus:border-brand-secondary focus:outline-none transition-all placeholder:text-brand-on-surface/30"
                  />
                  <input
                    type="tel"
                    required
                    placeholder="Phone Number"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-brand-surface-lowest text-brand-on-surface text-sm px-4 py-3 rounded-lg border border-white/10 focus:border-brand-secondary focus:outline-none transition-all placeholder:text-brand-on-surface/30"
                  />
                </div>

                {/* Division Selection */}
                <div>
                  <label className="block text-xs font-bold text-brand-on-surface/60 mb-2 uppercase tracking-widest">
                    Selected Division
                  </label>
                  <select
                    value={service}
                    onChange={(e) => setService(e.target.value)}
                    className="w-full bg-brand-surface-lowest text-brand-on-surface text-sm px-4 py-3 rounded-lg border border-white/10 focus:border-brand-secondary focus:outline-none transition-all"
                  >
                    <option value="Architectural Design">Architectural Design Division</option>
                    <option value="Structural Engineering">Structural Engineering & Construction</option>
                    <option value="Interior Architecture">Premium Interior Architecture</option>
                    <option value="Sustainable Consultation">Net-Zero Energy Planning</option>
                    <option value="Full Turnkey Build">Full Turnkey Construction</option>
                  </select>
                </div>

                {/* Message */}
                <textarea
                  rows={4}
                  required
                  placeholder="Describe your property specifications, plot size, or design requirements..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full bg-brand-surface-lowest text-brand-on-surface text-sm px-4 py-3 rounded-lg border border-white/10 focus:border-brand-secondary focus:outline-none transition-all placeholder:text-brand-on-surface/30 resize-none"
                ></textarea>

                {/* hCaptcha Widget */}
                <HCaptchaWidget onVerify={setCaptchaToken} onExpire={() => setCaptchaToken(null)} />

                {/* Submit */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-brand-secondary hover:bg-brand-secondary/90 text-brand-on-primary py-3.5 rounded-lg text-xs font-bold font-display uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-2 shadow-lg shadow-brand-secondary/10 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Transmitting...' : 'Transmit Project Specifications'} <Send size={14} />
                </button>
              </div>
            </form>
          )}
        </div>
      </section>

      {/* Google Maps section */}
      <section className="max-w-7xl mx-auto rounded-2xl overflow-hidden border border-white/10 shadow-2xl h-96 relative">
        {/* Dark style iframe */}
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
