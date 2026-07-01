// src/components/Hero.tsx
import React, { useEffect, useRef, useState } from 'react';
import { ArrowRight, CheckCircle, ChevronDown, MessageCircle } from 'lucide-react';

interface HeroProps {
  onInquire: () => void;
}

function useCountUp(target: number, duration: number = 2000, start: boolean = false) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!start) return;
    let startTime: number | null = null;
    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, duration, start]);

  return count;
}

const words = ['Designing Homes', 'That Feel', 'Built Around You'];
const serviceHighlights = [
  'House Plans',
  '3D Elevations',
  'Structural Drawings',
  'Site Guidance',
];

export default function Hero({ onInquire }: HeroProps) {
  const [revealed, setRevealed] = useState(false);
  const [countersStart, setCountersStart] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const projects = useCountUp(60, 2200, countersStart);
  const cities = useCountUp(12, 2000, countersStart);

  useEffect(() => {
    const t1 = setTimeout(() => setRevealed(true), 200);
    const t2 = setTimeout(() => setCountersStart(true), 800);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  const openWhatsApp = () => {
    window.open(
      'https://wa.me/918009363259?text=I%20want%20to%20discuss%20my%20home%20planning%20or%20construction%20project%20with%20NVS%20Buildcon.',
      '_blank',
      'noopener,noreferrer'
    );
  };

  return (
    <section className="relative w-full h-screen min-h-[720px] flex flex-col overflow-hidden">
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-black/75 via-black/45 to-[#0a0f18] z-10" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/25 to-transparent z-10" />

        <video
          ref={videoRef}
          className="w-full h-full object-cover"
          autoPlay
          muted
          loop
          playsInline
          poster="/images/WhatsApp Image 2026-06-29 at 13.04.30.jpeg"
          onError={() => {
            if (videoRef.current) videoRef.current.style.display = 'none';
          }}
        >
          <source src="/videos/construction-timelapse.mp4" type="video/mp4" />
        </video>

        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('/images/WhatsApp Image 2026-06-29 at 13.04.30.jpeg')" }}
        />
      </div>

      <div className="absolute top-24 left-6 md:left-16 w-12 h-12 border-t border-l border-brand-gold/40 z-20" />
      <div className="absolute top-24 right-6 md:right-16 w-12 h-12 border-t border-r border-brand-gold/40 z-20" />
      <div className="absolute bottom-24 right-6 md:right-16 w-12 h-12 border-b border-r border-brand-gold/40 z-20" />

      <div className="relative z-20 flex flex-col justify-center h-full px-6 md:px-16 pt-20 max-w-7xl mx-auto w-full">
        <div
          className="flex items-center gap-3 mb-7 opacity-0"
          style={{ animation: revealed ? 'fadeInUp 0.7s ease 0.1s forwards' : 'none' }}
        >
          <div className="h-px w-10 bg-brand-gold" />
          <span className="font-display text-brand-gold text-xs tracking-[0.25em] uppercase font-medium">
            NVS Buildcon &amp; Architects
          </span>
        </div>

        <h1 className="heading-editorial text-[clamp(3rem,8vw,7.25rem)] text-white leading-[0.97] mb-6 max-w-5xl">
          {words.map((word, wi) => (
            <span key={word} className={`split-word block ${revealed ? 'revealed' : ''}`}>
              <span
                className="split-word-inner"
                style={{ transitionDelay: `${wi * 120 + 150}ms` }}
              >
                {word === 'Built Around You' ? <span className="text-brand-gold">{word}</span> : word}
              </span>
            </span>
          ))}
        </h1>

        <p
          className="font-serif text-white/72 text-xl md:text-3xl font-light max-w-3xl mb-8 opacity-0 leading-snug"
          style={{ animation: revealed ? 'fadeInUp 0.7s ease 0.55s forwards' : 'none' }}
        >
          Clear house plans, practical drawings, and site-ready design support from first sketch to execution.
        </p>

        <div
          className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-xl mb-10 opacity-0"
          style={{ animation: revealed ? 'fadeInUp 0.7s ease 0.7s forwards' : 'none' }}
        >
          {serviceHighlights.map((item) => (
            <div key={item} className="flex items-center gap-2.5 text-sm md:text-base text-white/88">
              <CheckCircle size={17} className="text-brand-gold shrink-0" />
              <span className="font-display font-semibold tracking-wide">{item}</span>
            </div>
          ))}
        </div>

        <div
          className="flex flex-wrap items-center gap-4 opacity-0"
          style={{ animation: revealed ? 'fadeInUp 0.7s ease 0.85s forwards' : 'none' }}
        >
          <button onClick={onInquire} className="btn-gold group">
            Get Free Quote
            <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
          </button>
          <button onClick={openWhatsApp} className="btn-outline-gold">
            <MessageCircle size={14} />
            WhatsApp Us
          </button>
        </div>

        <div
          className="flex gap-8 md:gap-16 mt-14 opacity-0"
          style={{ animation: revealed ? 'fadeInUp 0.7s ease 1.05s forwards' : 'none' }}
        >
          {[
            { label: 'Projects Delivered', value: projects, suffix: '+' },
            { label: 'Cities Served', value: cities, suffix: '' },
            { label: 'Years Experience', value: '1.5', suffix: '' },
          ].map((stat) => (
            <div key={stat.label} className="flex flex-col">
              <span className="counter-number font-display text-3xl md:text-5xl font-bold text-white leading-none">
                {stat.value}
                <span className="text-brand-gold">{stat.suffix}</span>
              </span>
              <span className="font-display text-[10px] md:text-xs text-white/42 uppercase tracking-widest mt-2">
                {stat.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div
        className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2 opacity-0"
        style={{ animation: revealed ? 'fadeIn 1s ease 1.4s forwards' : 'none' }}
      >
        <span className="font-display text-[10px] text-white/35 uppercase tracking-[0.3em]">Scroll</span>
        <div className="scroll-indicator-line" />
        <ChevronDown size={14} className="text-brand-gold animate-bounce" />
      </div>
    </section>
  );
}
