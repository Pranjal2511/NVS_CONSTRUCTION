// src/components/HomeShowcase.tsx
import React, { useRef } from 'react';
import { ArrowRight } from 'lucide-react';
import { PROJECTS_DATA } from '../data';
import { ViewState } from '../types';
import useScrollReveal from '../hooks/useScrollReveal';

interface HomeShowcaseProps {
  onViewChange: (view: ViewState) => void;
}

const featured = PROJECTS_DATA.slice(0, 4);

function ShowcaseItem({
  project,
  index,
  onViewChange,
}: {
  key?: React.Key;
  project: (typeof featured)[0];
  index: number;
  onViewChange: (view: ViewState) => void;
}) {
  const imgRef = useScrollReveal<HTMLDivElement>({ threshold: 0.15 });
  const textRef = useScrollReveal<HTMLDivElement>({ threshold: 0.2, rootMargin: '0px 0px -80px 0px' });
  const isEven = index % 2 === 0;

  return (
    <div
      className={`flex flex-col ${isEven ? 'md:flex-row' : 'md:flex-row-reverse'} gap-0 items-stretch min-h-[60vh]`}
    >
      {/* Image */}
      <div
        ref={imgRef}
        className="img-reveal-wrapper w-full md:w-1/2 relative group overflow-hidden"
        style={{ minHeight: '450px' }}
      >
        <img
          src={project.imageUrl}
          alt={project.title}
          className="w-full h-full object-cover transition-transform duration-[1.2s] ease-in-out group-hover:scale-105"
          style={{ minHeight: '450px' }}
          loading="lazy"
          decoding="async"
        />
        {/* Category tag */}
        <div className="absolute top-6 left-6 glass-gold px-4 py-1.5">
          <span className="font-display text-brand-gold text-[10px] uppercase tracking-[0.25em]">
            {project.category}
          </span>
        </div>
      </div>

      {/* Text */}
      <div
        ref={textRef}
        className={`blur-reveal w-full md:w-1/2 flex flex-col justify-center px-8 md:px-16 py-16 md:py-24 bg-brand-surface-low`}
      >
        <div className="h-px w-12 bg-brand-gold mb-8" />
        <p className="font-display text-[10px] text-brand-gold/60 uppercase tracking-[0.3em] mb-4">
          {project.year} — {project.location}
        </p>
        <h3 className="heading-editorial text-[clamp(2rem,4vw,3.5rem)] text-brand-on-surface mb-6 leading-[1]">
          {project.title}
        </h3>
        <p className="font-serif text-brand-on-surface/50 text-lg font-light leading-relaxed mb-10 max-w-md">
          {project.description}
        </p>
        {project.area && (
          <div className="flex gap-8 mb-10">
            {project.area && (
              <div>
                <p className="font-display text-xs text-brand-gold/60 uppercase tracking-widest mb-1">Area</p>
                <p className="font-display text-sm text-brand-on-surface font-semibold">{project.area}</p>
              </div>
            )}
            {project.duration && (
              <div>
                <p className="font-display text-xs text-brand-gold/60 uppercase tracking-widest mb-1">Duration</p>
                <p className="font-display text-sm text-brand-on-surface font-semibold">{project.duration}</p>
              </div>
            )}
          </div>
        )}
        <button
          onClick={() => onViewChange('projects')}
          className="btn-outline-gold self-start group"
        >
          View All Projects
          <ArrowRight size={12} className="transition-transform group-hover:translate-x-1" />
        </button>
      </div>
    </div>
  );
}

export default function HomeShowcase({ onViewChange }: HomeShowcaseProps) {
  return (
    <section className="bg-brand-surface">
      {/* Header */}
      <div className="max-w-7xl mx-auto px-6 md:px-16 pt-24 pb-16">
        <div className="flex items-end justify-between">
          <div>
            <p className="font-display text-[10px] text-brand-gold uppercase tracking-[0.3em] mb-4">
              Portfolio
            </p>
            <h2 className="heading-editorial text-[clamp(2.5rem,6vw,5rem)] text-brand-on-surface">
              Signature<br />
              <span className="text-brand-on-surface/30">Projects</span>
            </h2>
          </div>
          <button
            onClick={() => onViewChange('projects')}
            className="hidden md:flex btn-outline-gold"
          >
            All Projects →
          </button>
        </div>
        <div className="gold-line mt-12" />
      </div>

      {/* Showcase items */}
      {featured.map((project, i) => (
        <ShowcaseItem key={project.id} project={project} index={i} onViewChange={onViewChange} />
      ))}
    </section>
  );
}
