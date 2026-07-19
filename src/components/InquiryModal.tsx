import React, { useState, useEffect } from 'react';
import { X, Send, Phone, Mail, User, Clock, CheckCircle, Database } from 'lucide-react';
import { Inquiry } from '../types';

import { apiFetch } from '../utils/api';

interface InquiryModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialBlueprintTitle?: string;
  initialService?: string;
}

export default function InquiryModal({
  isOpen,
  onClose,
  initialBlueprintTitle,
  initialService
}: InquiryModalProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [service, setService] = useState('Architectural Design');
  const [message, setMessage] = useState('');

  const [isSubmitted, setIsSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pastInquiries, setPastInquiries] = useState<Inquiry[]>([]);

  useEffect(() => {
    if (initialService) {
      setService(initialService);
    }
  }, [initialService]);

  useEffect(() => {
    // Load past inquiries from localStorage on mount
    const saved = localStorage.getItem('nvs_inquiries');
    if (saved) {
      try {
        setPastInquiries(JSON.parse(saved));
      } catch {
        // Corrupted localStorage data — silently reset; not critical
        localStorage.removeItem('nvs_inquiries');
      }
    }
  }, []);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !phone) return;

    setError(null);
    setLoading(true);

    try {
      const msg = message || `Hi, I am interested in ${initialBlueprintTitle || service}. Please contact me.`;
      const res = await apiFetch('/api/enquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          phone,
          email,
          service,
          blueprintTitle: initialBlueprintTitle || undefined,
          message: msg
        })
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || 'Failed to submit enquiry.');
      }

      const result = await res.json();
      const dbEnquiry = result.enquiry || result.data?.enquiry || {};

      const newInquiry: Inquiry = {
        id: dbEnquiry._id || dbEnquiry.id || Math.random().toString(36).substr(2, 9),
        name,
        email,
        phone,
        service,
        blueprintTitle: initialBlueprintTitle || undefined,
        message: msg,
        date: new Date().toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })
      };

      const updated = [newInquiry, ...pastInquiries];
      setPastInquiries(updated);
      localStorage.setItem('nvs_inquiries', JSON.stringify(updated));
      setIsSubmitted(true);

      // Reset fields
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
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-brand-surface-lowest/90 backdrop-blur-md animate-fade-in">
      <div 
        id="inquiry-dialog"
        className="relative w-full max-w-4xl bg-brand-surface-container rounded-xl overflow-hidden border border-white/10 shadow-2xl flex flex-col md:flex-row max-h-[90vh]"
      >
        {/* Left Column: Context / Marketing info */}
        <div className="w-full md:w-5/12 bg-gradient-to-br from-brand-surface-highest to-brand-surface-low p-8 flex flex-col justify-between border-b md:border-b-0 md:border-r border-white/10">
          <div>
            <span className="inline-block px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-brand-secondary bg-brand-secondary/10 rounded-full mb-6">
              NVS Concierge
            </span>
            <h3 className="font-display text-2xl font-bold text-brand-on-surface mb-4">
              Begin Your Architectural Journey
            </h3>
            <p className="text-sm text-brand-on-surface-variant leading-relaxed mb-6">
              Connect with our principal architects and engineers. We provide hyper-custom, millimeter-precision consulting for luxury residential and commercial properties globally.
            </p>

            <div className="space-y-4">
              <div className="flex items-center gap-3 text-sm text-brand-on-surface/90">
                <span className="p-2 rounded-full bg-brand-surface-low text-brand-secondary">
                  <Phone size={16} />
                </span>
                <span>+91 8009363259</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-brand-on-surface/90">
                <span className="p-2 rounded-full bg-brand-surface-low text-brand-secondary">
                  <Mail size={16} />
                </span>
                <span>@nishant.designs13</span>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-white/5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-brand-on-surface/50 mb-3 flex items-center gap-1">
              <Clock size={12} /> Active Consultations
            </h4>
            <p className="text-xs text-brand-on-surface-variant leading-snug">
              Our response timeframe is typically under 2 hours.
            </p>
          </div>
        </div>

        {/* Right Column: Form or Success State */}
        <div className="w-full md:w-7/12 p-8 overflow-y-auto flex flex-col">
          {/* Close button */}
          <button 
            onClick={() => {
              setIsSubmitted(false);
              onClose();
            }}
            className="absolute top-6 right-6 p-2 rounded-full hover:bg-white/5 text-brand-on-surface-variant hover:text-brand-on-surface transition-colors"
          >
            <X size={20} />
          </button>

          {isSubmitted ? (
            <div className="my-auto text-center py-8 animate-fade-in">
              <div className="w-16 h-16 bg-brand-secondary/10 text-brand-secondary rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle size={36} />
              </div>
              <h4 className="font-display text-2xl font-bold text-brand-on-surface mb-2">
                Consultation Request Logged
              </h4>
              <p className="text-sm text-brand-on-surface-variant max-w-md mx-auto mb-8">
                Thank you, <span className="text-brand-on-surface font-semibold">your request has been successfully registered</span>. One of our lead architects will contact you shortly to review project specifications.
              </p>
              <button
                onClick={() => setIsSubmitted(false)}
                className="px-6 py-2 bg-brand-surface-highest text-brand-secondary border border-brand-secondary/30 rounded-lg text-sm font-semibold hover:bg-brand-secondary/10 transition-all duration-300"
              >
                Submit Another Request
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex-grow flex flex-col justify-center">
              <h4 className="font-display text-xl font-bold text-brand-on-surface mb-1">
                Inquiry & Specifications
              </h4>
              <p className="text-xs text-brand-on-surface-variant mb-6">
                {initialBlueprintTitle ? (
                  <span>Requesting similar design layout for: <strong className="text-brand-secondary">{initialBlueprintTitle}</strong></span>
                ) : (
                  <span>Specify your land topography, project scope, and preferences.</span>
                )}
              </p>

              <div className="space-y-4">
                {/* Name */}
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-on-surface-variant">
                    <User size={16} />
                  </span>
                  <input
                    type="text"
                    required
                    placeholder="Full Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-brand-surface-lowest text-brand-on-surface text-sm pl-12 pr-4 py-3 rounded-lg border border-white/10 focus:border-brand-secondary focus:outline-none transition-all placeholder:text-brand-on-surface/40"
                  />
                </div>

                {/* Email and Phone Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-on-surface-variant">
                      <Mail size={16} />
                    </span>
                    <input
                      type="email"
                      required
                      placeholder="Email Address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-brand-surface-lowest text-brand-on-surface text-sm pl-12 pr-4 py-3 rounded-lg border border-white/10 focus:border-brand-secondary focus:outline-none transition-all placeholder:text-brand-on-surface/40"
                    />
                  </div>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-on-surface-variant">
                      <Phone size={16} />
                    </span>
                    <input
                      type="tel"
                      required
                      placeholder="Phone Number"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full bg-brand-surface-lowest text-brand-on-surface text-sm pl-12 pr-4 py-3 rounded-lg border border-white/10 focus:border-brand-secondary focus:outline-none transition-all placeholder:text-brand-on-surface/40"
                    />
                  </div>
                </div>

                {/* Category/Service */}
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
                <div>
                  <textarea
                    rows={3}
                    placeholder={initialBlueprintTitle ? `Write specific site conditions or changes you want from The ${initialBlueprintTitle} plan...` : "Describe your custom design goals, budget, or timeline preferences..."}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full bg-brand-surface-lowest text-brand-on-surface text-sm px-4 py-3 rounded-lg border border-white/10 focus:border-brand-secondary focus:outline-none transition-all placeholder:text-brand-on-surface/40 resize-none"
                  ></textarea>
                </div>

                {error && (
                  <p className="text-sm text-red-400 my-2 bg-red-500/10 border border-red-500/20 rounded-lg py-2 px-3">
                    {error}
                  </p>
                )}



                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-brand-secondary hover:bg-brand-secondary/90 text-brand-on-primary py-3 rounded-lg text-sm font-bold tracking-widest uppercase transition-all duration-300 flex items-center justify-center gap-2 shadow-lg shadow-brand-secondary/10 hover:shadow-brand-secondary/20 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Transmitting Request...' : 'Submit Project Blueprint Request'} <Send size={16} />
                </button>
              </div>
            </form>
          )}

          {/* Past submissions drawer/panel inside the modal to show persistent storage functioning */}
          {pastInquiries.length > 0 && (
            <div className="mt-8 pt-6 border-t border-white/5">
              <h5 className="text-xs font-bold uppercase tracking-wider text-brand-on-surface/50 mb-3 flex items-center gap-1.5">
                <Database size={13} /> Active Request History ({pastInquiries.length})
              </h5>
              <div className="space-y-2 max-h-32 overflow-y-auto pr-1">
                {pastInquiries.map((inq) => (
                  <div key={inq.id} className="p-3 bg-brand-surface-low/50 rounded border border-white/5 flex justify-between items-center text-[11px]">
                    <div>
                      <span className="font-semibold text-brand-on-surface">{inq.service}</span>
                      {inq.blueprintTitle && (
                        <span className="text-brand-secondary ml-1">({inq.blueprintTitle})</span>
                      )}
                      <p className="text-brand-on-surface-variant text-[10px] mt-0.5">{inq.message.substring(0, 50)}...</p>
                    </div>
                    <div className="text-right flex flex-col items-end">
                      <span className="px-1.5 py-0.5 bg-brand-secondary/10 text-brand-secondary rounded font-mono text-[9px] uppercase tracking-wide">Pending</span>
                      <span className="text-brand-on-surface-variant/70 text-[9px] mt-1">{inq.date.split(',')[0]}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
