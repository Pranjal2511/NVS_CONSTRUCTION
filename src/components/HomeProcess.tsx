// src/components/HomeProcess.tsx
import React from 'react';
import useScrollReveal from '../hooks/useScrollReveal';

const stages = [
  { num: '01', label: 'Consultation', desc: 'We listen, understand, and align with your vision.' },
  { num: '02', label: 'Site Visit', desc: 'Our team surveys the land and assesses requirements.' },
  { num: '03', label: 'Planning', desc: 'Master plan and space optimization studies.' },
  { num: '04', label: '2D Layout', desc: 'Precision floor plans, section drawings, elevations.' },
  { num: '05', label: '3D Elevation', desc: 'Photorealistic renders of your future home.' },
  { num: '06', label: 'Construction', desc: 'Structural engineering and quality execution.' },
  { num: '07', label: 'Interior', desc: 'Premium finishes, fixtures, and spatial detailing.' },
  { num: '08', label: 'Handover', desc: 'Keys in hand — your legacy, complete.' },
];

function StageCard({ stage, index }: { key?: React.Key; stage: (typeof stages)[0]; index: number }) {
  const ref = useScrollReveal<HTMLDivElement>({ threshold: 0.2 });
  return (
    <div
      ref={ref}
      className="blur-reveal group relative"
      style={{ transitionDelay: `${index * 80}ms` }}
    >
      {/* Connector line */}
      {index < stages.length - 1 && (
        <div className="hidden md:block absolute top-6 left-[calc(100%+0px)] w-full h-px bg-gradient-to-r from-brand-gold/30 to-transparent z-0" />
      )}

      <div className="relative z-10 p-5 border border-white/5 bg-brand-surface-container hover:border-brand-gold/30 transition-all duration-500 group-hover:bg-brand-surface-high">
        {/* Number */}
        <span className="font-display text-[10px] text-brand-gold/40 uppercase tracking-[0.3em]">
          {stage.num}
        </span>
        {/* Gold dot */}
        <div className="w-2 h-2 rounded-full bg-brand-gold mt-3 mb-4 group-hover:scale-150 transition-transform duration-300" />
        <h4 className="font-display text-sm font-bold text-brand-on-surface uppercase tracking-widest mb-2 group-hover:text-brand-gold transition-colors duration-300">
          {stage.label}
        </h4>
        <p className="font-serif text-brand-on-surface/40 text-sm font-light leading-relaxed">
          {stage.desc}
        </p>
      </div>
    </div>
  );
}

export default function HomeProcess() {
  const headRef = useScrollReveal<HTMLDivElement>();
  return (
    <section className="section-padding bg-brand-surface-lowest">
      <div className="max-w-7xl mx-auto px-6 md:px-16">
        {/* Header */}
        <div ref={headRef} className="blur-reveal mb-16">
          <p className="font-display text-[10px] text-brand-gold uppercase tracking-[0.3em] mb-4">
            Our Process
          </p>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <h2 className="heading-editorial text-[clamp(2.5rem,5vw,4.5rem)] text-brand-on-surface">
              From Vision<br />
              <span className="text-brand-gold">To Handover</span>
            </h2>
            <p className="font-serif text-brand-on-surface/40 text-lg font-light max-w-sm">
              Eight carefully orchestrated stages to deliver your dream — on time, on spec.
            </p>
          </div>
          <div className="gold-line mt-10" />
        </div>

        {/* Stage grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stages.map((stage, i) => (
            <StageCard key={i} stage={stage} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
