import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Compass, ArrowRight, ArrowLeft, CheckCircle, Send, LayoutGrid, Ruler, Layers, DollarSign, User } from 'lucide-react';
import HCaptchaWidget from './HCaptchaWidget';
import { apiFetch } from '../utils/api';

interface DesignWizardProps {
  onViewChange: (view: any) => void;
}

export default function DesignWizard({ onViewChange }: DesignWizardProps) {
  const [step, setStep] = useState(1);
  const [plotSize, setPlotSize] = useState('1500 sq.ft');
  const [location, setLocation] = useState('Lucknow');
  const [floors, setFloors] = useState('Double Story (Duplex)');
  const [bedrooms, setBedrooms] = useState('3 BHK');
  const [style, setStyle] = useState<'Modern' | 'Classic' | 'Luxury' | 'Minimal'>('Luxury');
  const [budget, setBudget] = useState('₹80 Lakhs - 1.5 Crore');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);

  const nextStep = () => setStep((prev) => Math.min(prev + 1, 5));
  const prevStep = () => setStep((prev) => Math.max(prev - 1, 1));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !phone) {
      setError('Please fill out all contact fields.');
      return;
    }
    setError(null);
    setLoading(true);

    const message = `Dream Home Configuration:
- Plot Size: ${plotSize}
- Location: ${location}
- Structure: ${floors} (${bedrooms})
- Style Preference: ${style}
- Budget Bracket: ${budget}
- Additional Notes: ${notes || 'None'}`;

    try {
      const res = await apiFetch('/api/enquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          phone,
          email,
          service: 'Full Turnkey Build',
          blueprintTitle: `Custom ${style} Home Config`,
          budget,
          message,
          'h-captcha-response': captchaToken
        })
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || 'Failed to submit design configuration.');
      }

      setIsCompleted(true);
      // Save locally to show in history
      const saved = localStorage.getItem('nvs_inquiries');
      const past = saved ? JSON.parse(saved) : [];
      const newInq = {
        id: Math.random().toString(36).substr(2, 9),
        name,
        email,
        phone,
        service: 'Full Turnkey Build',
        blueprintTitle: `Custom ${style} Home Config`,
        message,
        date: new Date().toLocaleDateString(),
        status: 'New'
      };
      localStorage.setItem('nvs_inquiries', JSON.stringify([newInq, ...past]));
    } catch (err: any) {
      setError(err.message || 'Server error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const stylesList = [
    {
      name: 'Modern',
      desc: 'Clean lines, large glazing, open floor plans, and passive ventilation.',
      img: '/images/WhatsApp Image 2026-06-29 at 13.04.30.jpeg'
    },
    {
      name: 'Classic',
      desc: 'Symmetric pillars, elegant stone detailing, and timeless luxury layouts.',
      img: '/images/project_extra_3.jpg'
    },
    {
      name: 'Luxury',
      desc: 'Double-height voids, bookmatched marble panels, and smart automation.',
      img: '/images/WhatsApp Image 2026-06-29 at 13.04.30 (1).jpeg'
    },
    {
      name: 'Minimal',
      desc: 'Exposed raw concrete, concealed ducts, and integrated linear lighting.',
      img: '/images/WhatsApp Image 2026-06-29 at 13.04.42 (1).jpeg'
    }
  ];

  return (
    <div className="text-brand-on-surface min-h-screen bg-brand-surface pt-28 pb-20 px-6 md:px-16 flex items-center justify-center">
      <div className="absolute inset-0 blueprint-bg opacity-5 pointer-events-none z-0" />

      <div className="relative w-full max-w-2xl bg-brand-surface-container border border-white/10 rounded-2xl p-8 md:p-12 shadow-2xl z-10 overflow-hidden">
        {isCompleted ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-8"
          >
            <div className="w-16 h-16 bg-brand-gold/10 text-brand-gold rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle size={36} />
            </div>
            <h2 className="font-display text-2xl font-bold text-white mb-4">
              Configuration Registered
            </h2>
            <p className="text-sm text-brand-on-surface-variant max-w-md mx-auto mb-8 leading-relaxed">
              Your dream home design profile has been logged. Our principal architects and civil engineers will analyze your plot size, style preferences, and structural details to draft a preliminary 2D layout.
            </p>
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => onViewChange('home')}
                className="btn-gold"
              >
                Back to Home
              </button>
              <button
                onClick={() => {
                  setStep(1);
                  setIsCompleted(false);
                  setName('');
                  setEmail('');
                  setPhone('');
                  setNotes('');
                }}
                className="btn-outline-gold"
              >
                Configure Another
              </button>
            </div>
          </motion.div>
        ) : (
          <div>
            {/* Header / Progress */}
            <div className="mb-8">
              <div className="flex justify-between items-center mb-4">
                <span className="font-display text-[10px] text-brand-gold uppercase tracking-[0.25em] font-semibold">
                  Dream Home Designer
                </span>
                <span className="font-mono text-xs text-brand-gold">
                  Step {step} of 5
                </span>
              </div>
              {/* Progress Bar */}
              <div className="w-full h-[2px] bg-white/10 relative">
                <div
                  className="absolute top-0 bottom-0 left-0 bg-brand-gold transition-all duration-500"
                  style={{ width: `${(step / 5) * 100}%` }}
                />
              </div>
            </div>

            {error && (
              <p className="text-sm text-red-400 mb-4 bg-red-500/10 border border-red-500/20 rounded-lg py-2 px-3">
                {error}
              </p>
            )}

            {/* Steps Form */}
            <form onSubmit={handleSubmit}>
              <AnimatePresence mode="wait">
                {/* STEP 1: Plot Details */}
                {step === 1 && (
                  <motion.div
                    key="step-1"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-6"
                  >
                    <h3 className="font-display text-xl font-bold text-white mb-2 flex items-center gap-2">
                      <Ruler className="text-brand-gold" size={20} /> Plot Specifications
                    </h3>
                    <p className="text-xs text-brand-on-surface-variant leading-relaxed">
                      Define the dimensions of your building land and its geographical city to help our structural engineers assess soil conditions.
                    </p>
                    <div>
                      <label className="block text-xs font-bold text-brand-on-surface/60 mb-2 uppercase tracking-widest">
                        Plot Size / Area
                      </label>
                      <select
                        value={plotSize}
                        onChange={(e) => setPlotSize(e.target.value)}
                        className="w-full bg-brand-surface-lowest text-brand-on-surface text-sm px-4 py-3.5 rounded-lg border border-white/10 focus:border-brand-gold focus:outline-none transition-all"
                      >
                        <option value="1000 sq.ft">1,000 sq.ft (Standard Plot)</option>
                        <option value="1500 sq.ft">1,500 sq.ft (Recommended)</option>
                        <option value="2000 sq.ft">2,000 sq.ft (Large Plot)</option>
                        <option value="3000+ sq.ft">3,000+ sq.ft (Premium Estate)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-brand-on-surface/60 mb-2 uppercase tracking-widest">
                        Location (City)
                      </label>
                      <input
                        type="text"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        placeholder="e.g. Lucknow, Noida, Delhi"
                        className="w-full bg-brand-surface-lowest text-brand-on-surface text-sm px-4 py-3.5 rounded-lg border border-white/10 focus:border-brand-gold focus:outline-none transition-all"
                        required
                      />
                    </div>
                  </motion.div>
                )}

                {/* STEP 2: Spatial Requirements */}
                {step === 2 && (
                  <motion.div
                    key="step-2"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-6"
                  >
                    <h3 className="font-display text-xl font-bold text-white mb-2 flex items-center gap-2">
                      <Layers className="text-brand-gold" size={20} /> Spatial Layout
                    </h3>
                    <p className="text-xs text-brand-on-surface-variant leading-relaxed">
                      Select the number of stories and bedroom density required. This coordinates Vastu flow and staircase alignment.
                    </p>
                    <div>
                      <label className="block text-xs font-bold text-brand-on-surface/60 mb-2 uppercase tracking-widest">
                        Number of Floors
                      </label>
                      <select
                        value={floors}
                        onChange={(e) => setFloors(e.target.value)}
                        className="w-full bg-brand-surface-lowest text-brand-on-surface text-sm px-4 py-3.5 rounded-lg border border-white/10 focus:border-brand-gold focus:outline-none transition-all"
                      >
                        <option value="Single Floor">Single Floor (G)</option>
                        <option value="Double Story (Duplex)">Double Story Duplex (G+1)</option>
                        <option value="Three Floors (G+2)">Three Floors (G+2)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-brand-on-surface/60 mb-2 uppercase tracking-widest">
                        Bedrooms Config (BHK)
                      </label>
                      <select
                        value={bedrooms}
                        onChange={(e) => setBedrooms(e.target.value)}
                        className="w-full bg-brand-surface-lowest text-brand-on-surface text-sm px-4 py-3.5 rounded-lg border border-white/10 focus:border-brand-gold focus:outline-none transition-all"
                      >
                        <option value="2 BHK">2 BHK (2 Bedrooms, Hall, Kitchen)</option>
                        <option value="3 BHK">3 BHK (3 Bedrooms, Hall, Kitchen)</option>
                        <option value="4 BHK">4 BHK (4 Bedrooms, Hall, Kitchen)</option>
                        <option value="5+ BHK">5+ BHK (Luxury Mansion Suite)</option>
                      </select>
                    </div>
                  </motion.div>
                )}

                {/* STEP 3: Aesthetic Style */}
                {step === 3 && (
                  <motion.div
                    key="step-3"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-6"
                  >
                    <h3 className="font-display text-xl font-bold text-white mb-2 flex items-center gap-2">
                      <LayoutGrid className="text-brand-gold" size={20} /> Architectural Style
                    </h3>
                    <p className="text-xs text-brand-on-surface-variant leading-relaxed">
                      Select your primary design language. Our architectural division will base elevations on this preference.
                    </p>
                    <div className="grid grid-cols-2 gap-4">
                      {stylesList.map((item) => (
                        <div
                          key={item.name}
                          onClick={() => setStyle(item.name as any)}
                          className={`cursor-pointer rounded-xl border p-4 transition-all duration-300 flex flex-col justify-between h-44 relative overflow-hidden ${
                            style === item.name
                              ? 'border-brand-gold bg-brand-surface-lowest/70 shadow-lg shadow-brand-gold/5'
                              : 'border-white/5 bg-brand-surface-lowest/30 hover:border-white/10'
                          }`}
                        >
                          {/* Background overlay */}
                          <div className="absolute inset-0 z-0 opacity-20 hover:opacity-35 transition-opacity">
                            <img src={item.img} alt={item.name} className="w-full h-full object-cover" />
                          </div>
                          <div className="relative z-10 flex flex-col justify-between h-full">
                            <h4 className={`font-display text-sm font-bold ${style === item.name ? 'text-brand-gold' : 'text-white'}`}>
                              {item.name}
                            </h4>
                            <p className="text-[10px] text-brand-on-surface-variant/80 leading-relaxed font-light mt-2">
                              {item.desc}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* STEP 4: Financial Scope */}
                {step === 4 && (
                  <motion.div
                    key="step-4"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-6"
                  >
                    <h3 className="font-display text-xl font-bold text-white mb-2 flex items-center gap-2">
                      <DollarSign className="text-brand-gold" size={20} /> Budget Allocation
                    </h3>
                    <p className="text-xs text-brand-on-surface-variant leading-relaxed">
                      Select a budget range. This allows our civil division to estimate material grades (Premium vs Ultra-Luxury composite structures).
                    </p>
                    <div className="space-y-3">
                      {[
                        'Under ₹40 Lakhs',
                        '₹40-80 Lakhs',
                        '₹80 Lakhs - 1.5 Crore',
                        '1.5 Crore+'
                      ].map((item) => (
                        <div
                          key={item}
                          onClick={() => setBudget(item)}
                          className={`cursor-pointer px-6 py-4 rounded-xl border transition-all duration-300 flex justify-between items-center ${
                            budget === item
                              ? 'border-brand-gold bg-brand-surface-container text-brand-gold'
                              : 'border-white/5 bg-brand-surface-container/30 text-brand-on-surface-variant hover:border-white/10'
                          }`}
                        >
                          <span className="font-display text-xs font-bold uppercase tracking-wider">{item}</span>
                          <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${budget === item ? 'border-brand-gold bg-brand-gold/10' : 'border-white/10'}`}>
                            {budget === item && <div className="w-2 h-2 rounded-full bg-brand-gold" />}
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* STEP 5: Personal Details */}
                {step === 5 && (
                  <motion.div
                    key="step-5"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-5"
                  >
                    <h3 className="font-display text-xl font-bold text-white mb-2 flex items-center gap-2">
                      <User className="text-brand-gold" size={20} /> Design Specifications
                    </h3>
                    <p className="text-xs text-brand-on-surface-variant leading-relaxed">
                      Provide your contact details. A design representative will prepare a custom proposal and Vastu zoning map.
                    </p>
                    <div className="space-y-3">
                      <input
                        type="text"
                        required
                        placeholder="Full Name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full bg-brand-surface-lowest text-brand-on-surface text-sm px-4 py-3 rounded-lg border border-white/10 focus:border-brand-gold focus:outline-none transition-all placeholder:text-brand-on-surface/30"
                      />
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <input
                          type="email"
                          required
                          placeholder="Email Address"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full bg-brand-surface-lowest text-brand-on-surface text-sm px-4 py-3 rounded-lg border border-white/10 focus:border-brand-gold focus:outline-none transition-all placeholder:text-brand-on-surface/30"
                        />
                        <input
                          type="tel"
                          required
                          placeholder="Phone Number"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          className="w-full bg-brand-surface-lowest text-brand-on-surface text-sm px-4 py-3 rounded-lg border border-white/10 focus:border-brand-gold focus:outline-none transition-all placeholder:text-brand-on-surface/30"
                        />
                      </div>
                      <textarea
                        rows={3}
                        placeholder="Additional notes (topography, scheduling, Vastu preferences...)"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        className="w-full bg-brand-surface-lowest text-brand-on-surface text-sm px-4 py-3 rounded-lg border border-white/10 focus:border-brand-gold focus:outline-none transition-all placeholder:text-brand-on-surface/30 resize-none"
                      ></textarea>

                      {/* hCaptcha Widget */}
                      <HCaptchaWidget onVerify={setCaptchaToken} onExpire={() => setCaptchaToken(null)} />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Navigation buttons */}
              <div className="flex justify-between items-center mt-10 pt-6 border-t border-white/5">
                {step > 1 ? (
                  <button
                    type="button"
                    onClick={prevStep}
                    className="px-5 py-2.5 bg-brand-surface-lowest border border-white/10 hover:border-brand-gold/30 rounded-lg text-xs font-bold font-display uppercase tracking-widest text-center flex items-center gap-1.5 transition-all text-brand-on-surface-variant hover:text-brand-gold"
                  >
                    <ArrowLeft size={14} /> Back
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => onViewChange('home')}
                    className="px-5 py-2.5 bg-brand-surface-lowest border border-white/10 hover:border-brand-gold/30 rounded-lg text-xs font-bold font-display uppercase tracking-widest text-center flex items-center gap-1.5 transition-all text-brand-on-surface-variant hover:text-brand-gold"
                  >
                    Cancel
                  </button>
                )}

                {step < 5 ? (
                  <button
                    type="button"
                    onClick={nextStep}
                    className="px-6 py-2.5 bg-brand-gold hover:bg-brand-gold/90 text-[#0a0f18] rounded-lg text-xs font-bold font-display uppercase tracking-widest text-center flex items-center gap-1.5 transition-all hover:scale-[1.02] shadow-lg shadow-brand-gold/10"
                  >
                    Next <ArrowRight size={14} />
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-2.5 bg-brand-gold hover:bg-brand-gold/90 text-[#0a0f18] rounded-lg text-xs font-bold font-display uppercase tracking-widest text-center flex items-center gap-1.5 transition-all hover:scale-[1.02] shadow-lg shadow-brand-gold/10 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Submitting...' : 'Submit Spec Request'} <Send size={14} />
                  </button>
                )}
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
