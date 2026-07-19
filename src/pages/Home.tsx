// src/pages/Home.tsx
import React from 'react';
import Hero from '../components/Hero';
import HomeShowcase from '../components/HomeShowcase';
import HomeProcess from '../components/HomeProcess';
import BeforeAfterSlider from '../components/BeforeAfterSlider';
import FAQ from '../components/FAQ';

import { TESTIMONIALS_DATA } from '../data';
import { ViewState } from '../types';
import { motion } from 'motion/react';
import { Quote, Star, ArrowRight, Compass, Shield, Layout, Sparkles } from 'lucide-react';

interface HomeProps {
  onViewChange: (view: ViewState) => void;
  onInquire: (service?: string) => void;
  onBookConsultation: () => void;
}

export default function Home({ onViewChange, onInquire, onBookConsultation }: HomeProps) {
  // Highlight first two testimonials on the home page
  const homeTestimonials = TESTIMONIALS_DATA.slice(0, 2);

  return (
    <div className="relative">
      {/* 1. Hero Section */}
      <Hero onInquire={onInquire} onBookConsultation={onBookConsultation} />

      {/* 2. Premium Brand Intro (About Teaser) */}
      <section className="section-padding bg-brand-surface-lowest relative">
        <div className="absolute inset-0 blueprint-bg opacity-[0.03] pointer-events-none" />
        <div className="max-w-7xl mx-auto px-6 md:px-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Text column */}
            <div className="lg:col-span-6 space-y-6">
              <span className="inline-block px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-brand-gold bg-brand-gold/10 rounded-full">
                About NVS Buildcon
              </span>
              <h2 className="heading-editorial text-[clamp(2rem,5vw,4.5rem)] text-white leading-tight">
                Planning, Design<br />
                <span className="text-brand-gold">and Construction.</span>
              </h2>
              <p className="font-serif text-brand-on-surface-variant/90 text-lg font-light leading-relaxed">
                NVS Buildcon provides house planning, 2D and 3D design, structural drawings, interior design, and construction support for residential and commercial projects.
              </p>
              <p className="text-xs text-brand-on-surface-variant/70 leading-relaxed">
                Every drawing—from floor plans to column layouts—is prepared with precision to match local guidelines and site requirements.
              </p>
              <div className="pt-4">
                <button
                  onClick={() => onViewChange('about')}
                  className="btn-outline-gold group"
                >
                  Learn About Us
                  <ArrowRight size={12} className="transition-transform group-hover:translate-x-1" />
                </button>
              </div>
            </div>

            {/* Graphic card column */}
            <div className="lg:col-span-5 lg:col-start-8">
              <div className="relative rounded-2xl overflow-hidden border border-white/10 shadow-2xl aspect-[4/5] group">
                <img
                  src="/images/WhatsApp Image 2026-06-29 at 13.04.30 (1).jpeg"
                  alt="Modern villa project designed by NVS Buildcon"
                  className="w-full h-full object-cover brightness-[0.75] transition-transform duration-[1.2s] group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-brand-surface-lowest via-transparent to-transparent opacity-90" />
                <div className="absolute bottom-6 left-6 right-6 p-6 glass-panel rounded-xl border border-white/5">
                  <span className="text-brand-gold"><Sparkles size={24} /></span>
                  <h4 className="font-display text-sm font-bold text-white mt-2 uppercase tracking-wider">Turnkey Villa Elevation</h4>
                  <p className="text-[10px] text-brand-on-surface-variant/80 uppercase tracking-widest mt-0.5">Lucknow, India</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Luxury Service Divisions Teaser */}
      <section className="section-padding bg-brand-surface">
        <div className="max-w-7xl mx-auto px-6 md:px-16">
          {/* Header */}
          <div className="text-center mb-16">
            <span className="inline-block px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-brand-gold bg-brand-gold/10 rounded-full mb-4">
              Core Services
            </span>
            <h2 className="font-display text-3xl md:text-4xl font-bold tracking-tight text-white mb-4">
              What We Do
            </h2>
            <p className="text-sm text-brand-on-surface-variant max-w-md mx-auto font-serif italic">
              Practical services for planning, designing, and building your project.
            </p>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Card 1 */}
            <div className="p-8 bg-brand-surface-container/40 border border-white/5 rounded-2xl hover:border-brand-gold/30 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between h-80 group">
              <div>
                <span className="p-3.5 rounded-xl bg-brand-gold/10 text-brand-gold inline-block mb-6 group-hover:scale-105 transition-transform">
                  <Compass size={22} />
                </span>
                <h3 className="font-display text-base font-bold text-white mb-3">House Planning</h3>
                <p className="text-xs text-brand-on-surface-variant/80 leading-relaxed">
                  2D floor plans, Vastu planning, working drawings, and municipal drawing support.
                </p>
              </div>
              <button
                onClick={() => onViewChange('services')}
                className="text-[10px] font-bold font-display uppercase tracking-widest text-brand-gold hover:text-white flex items-center gap-1 mt-6 self-start transition-colors"
              >
                Learn More →
              </button>
            </div>

            {/* Card 2 */}
            <div className="p-8 bg-brand-surface-container/40 border border-white/5 rounded-2xl hover:border-brand-gold/30 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between h-80 group">
              <div>
                <span className="p-3.5 rounded-xl bg-brand-gold/10 text-brand-gold inline-block mb-6 group-hover:scale-105 transition-transform">
                  <Shield size={22} />
                </span>
                <h3 className="font-display text-base font-bold text-white mb-3">Structural Design</h3>
                <p className="text-xs text-brand-on-surface-variant/80 leading-relaxed">
                  Column layout, beam layout, footing layout, RCC detailing, and BOQ support.
                </p>
              </div>
              <button
                onClick={() => onViewChange('services')}
                className="text-[10px] font-bold font-display uppercase tracking-widest text-brand-gold hover:text-white flex items-center gap-1 mt-6 self-start transition-colors"
              >
                Learn More →
              </button>
            </div>

            {/* Card 3 */}
            <div className="p-8 bg-brand-surface-container/40 border border-white/5 rounded-2xl hover:border-brand-gold/30 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between h-80 group">
              <div>
                <span className="p-3.5 rounded-xl bg-brand-gold/10 text-brand-gold inline-block mb-6 group-hover:scale-105 transition-transform">
                  <Layout size={22} />
                </span>
                <h3 className="font-display text-base font-bold text-white mb-3">3D & Interior Design</h3>
                <p className="text-xs text-brand-on-surface-variant/80 leading-relaxed">
                  Front elevation, exterior renders, interior concepts, and walkthrough visuals.
                </p>
              </div>
              <button
                onClick={() => onViewChange('services')}
                className="text-[10px] font-bold font-display uppercase tracking-widest text-brand-gold hover:text-white flex items-center gap-1 mt-6 self-start transition-colors"
              >
                Learn More →
              </button>
            </div>
          </div>
        </div>
      </section>



      {/* 5. Signature Project Showcase */}
      <HomeShowcase onViewChange={onViewChange} />

      {/* 6. Interactive Before / After Build Slider */}
      <section className="section-padding bg-brand-surface-lowest relative border-y border-white/5">
        <div className="max-w-7xl mx-auto px-6 md:px-16">
          <BeforeAfterSlider
            beforeImage="/images/WhatsApp Image 2026-06-29 at 13.04.32 (1).jpeg"
            beforeLabel="Initial Foundation & Structure"
            afterImage="/images/WhatsApp Image 2026-06-29 at 13.04.30.jpeg"
            afterLabel="Completed Duplex Exterior"
            title="Design Transformation: From Layout to Execution"
            subtitle="Compare the initial structural planning stages with the final completed residential duplex facade."
          />
        </div>
      </section>

      {/* 6. Execution Process Timeline */}
      <HomeProcess />

      {/* 7. Client Testimonials Summary */}
      <section className="section-padding bg-brand-surface">
        <div className="max-w-7xl mx-auto px-6 md:px-16">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
            <div>
              <span className="inline-block px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-brand-gold bg-brand-gold/10 rounded-full mb-4">
                Client Reviews
              </span>
              <h2 className="heading-editorial text-[clamp(2.5rem,5vw,4.5rem)] text-white">
                Client<br />
                <span className="text-brand-gold">Testimonials</span>
              </h2>
            </div>
            <button
              onClick={() => onViewChange('testimonials')}
              className="btn-outline-gold group self-start md:self-end"
            >
              All Client Testimonials
              <ArrowRight size={12} className="transition-transform group-hover:translate-x-1" />
            </button>
          </div>

          {/* Testimonials cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {homeTestimonials.map((test) => (
              <div
                key={test.id}
                className="p-8 bg-brand-surface-container/40 border border-white/5 rounded-2xl flex flex-col justify-between hover:border-brand-gold/20 transition-all duration-300 group"
              >
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <div className="flex gap-1 text-brand-gold">
                      {[...Array(test.rating)].map((_, i) => (
                        <Star key={i} size={14} fill="currentColor" />
                      ))}
                    </div>
                    <span className="text-brand-gold/10 group-hover:text-brand-gold/25 transition-colors">
                      <Quote size={24} />
                    </span>
                  </div>
                  <p className="font-serif text-brand-on-surface-variant/95 text-sm md:text-base italic leading-relaxed mb-8">
                    "{test.review}"
                  </p>
                </div>
                <div className="border-t border-white/5 pt-6 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-brand-gold/10 border border-brand-gold/20 flex items-center justify-center text-brand-gold font-display font-bold text-xs">
                    {test.name.split(' ').map((n) => n[0]).join('')}
                  </div>
                  <div>
                    <h4 className="font-display text-xs font-bold uppercase tracking-wider text-white">
                      {test.name}
                    </h4>
                    <p className="text-[9px] text-brand-on-surface-variant/60 uppercase tracking-widest mt-0.5">
                      {test.role}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 8. FAQ Accordion Section */}
      <FAQ />

      {/* 9. Bottom Luxury CTA Section */}
      <section className="section-padding bg-brand-surface-lowest border-t border-white/5 relative">
        <div className="absolute inset-0 blueprint-bg opacity-5 pointer-events-none" />
        <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
          <div className="gold-line mb-12" />
          <p className="font-display text-xs text-brand-gold uppercase tracking-[0.3em] mb-6">
            Ready to Build?
          </p>
          <h2 className="heading-editorial text-[clamp(2.5rem,6vw,5.5rem)] text-white mb-8 leading-none">
            Design Your<br />
            <span className="text-brand-gold">Dream Home</span>
          </h2>
          <p className="font-serif text-brand-on-surface-variant/70 text-xl font-light mb-12 max-w-2xl mx-auto leading-relaxed">
            Configure your plot size, architectural style, and spatial needs. Our principal designers will draft a custom Vastu-aligned layout.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={() => onViewChange('design-wizard')}
              className="btn-gold text-sm px-12 py-5 shadow-lg shadow-brand-gold/10 hover:shadow-brand-gold/20"
            >
              Start the Journey →
            </button>
            <button
              onClick={onBookConsultation}
              className="btn-outline-gold text-sm px-8 py-5"
            >
              Book a Free Consultation
            </button>
          </div>
        </div>
        <div className="gold-line mt-12" />
      </section>
    </div>
  );
}
