import { useState } from 'react';
import { Compass, Scale, ShieldAlert, Sparkles, CheckCircle2, ChevronRight, HelpCircle } from 'lucide-react';

export default function Process() {
  const [activeStep, setActiveStep] = useState(0);

  const steps = [
    {
      number: '01',
      title: 'Site Analysis & Space Planning',
      tagline: 'Understanding site conditions and spatial requirements.',
      icon: <Compass size={22} />,
      desc: 'Our process begins on-site. We evaluate the plot layout, check standard building regulations, and analyze solar orientation. This ensures the floor plan makes optimal use of light, ventilation, and space.',
      bullets: [
        'Detailed site measurements and level checks',
        'Zoning regulations and building setback compliance checks',
        'Vastu orientation and sun path alignment checks',
        'Adjacent property analysis for privacy and layout planning'
      ]
    },
    {
      number: '02',
      title: 'Architectural & Structural Design',
      tagline: 'Creating functional layouts and safe structural blueprints.',
      icon: <Scale size={22} />,
      desc: 'Next, we create architectural floor plans and 3D elevations. Once the layouts are approved, our structural engineers design the reinforcement concrete details, foundation plans, and column positions for safe construction.',
      bullets: [
        'Detailed 2D floor plans and furniture layouts',
        '3D front elevation design with realistic material renderings',
        'Safe foundation design matching soil load requirements',
        'RCC column and beam steel detailing'
      ]
    },
    {
      number: '03',
      title: 'Material Selection & Estimates',
      tagline: 'Choosing finishing materials and preparing clear budget sheets.',
      icon: <Sparkles size={22} />,
      desc: 'We assist clients in selecting the right materials for construction and interiors. From brick qualities and cement grades to tiles and plumbing fixtures, we prepare a detailed Bill of Quantities (BOQ) to avoid budget surprises.',
      bullets: [
        'Detailed Bill of Quantities (BOQ) for cost estimates',
        'Guidance on selecting grade-A cement and high-tensile steel',
        'Selection support for flooring tiles, paints, and interior laminates',
        'Plumbing, drainage, and electrical wiring conduit routing plans'
      ]
    },
    {
      number: '04',
      title: 'Quality Construction Support',
      tagline: 'Assisting execution on-site to ensure drawings match.',
      icon: <ShieldAlert size={22} />,
      desc: 'Our design support continues during construction. We coordinate with the site engineers and contractors, providing clarification on structural details and verifying that execution matches the design specifications.',
      bullets: [
        'Checking foundation excavation and layout alignment on-site',
        'Verifying column reinforcement steel placement before casting',
        'Reviewing MEP (Electrical & Plumbing) pipeline routing details',
        'Final inspection check before interior finishes'
      ]
    }
  ];

  return (
    <div className="animate-fade-in text-brand-on-surface">
      {/* Intro */}
      <section className="py-24 px-6 md:px-16 max-w-7xl mx-auto border-b border-white/5">
        <div className="max-w-3xl">
          <span className="inline-block px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-brand-secondary bg-brand-secondary/10 rounded-full mb-6">
            The Blueprint Journey
          </span>
          <h1 className="font-display text-4xl md:text-5xl font-bold tracking-tight text-brand-on-surface mb-6">
            How We Translate Vision Into Reality.
          </h1>
          <p className="text-sm md:text-base text-brand-on-surface-variant leading-relaxed">
            By combining architectural drafting with active structural engineering, we eliminate the friction typical between architects and construction crews. Our 4-step sequence ensures perfect alignment with zero unexpected overheads.
          </p>
        </div>
      </section>

      {/* Interactive Process Split */}
      <section className="py-24 px-6 md:px-16 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Timeline Steps Selector (Left Column) */}
          <div className="lg:col-span-5 space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-widest text-brand-on-surface/50 mb-6 block">
              Execution Phases
            </h4>
            
            {steps.map((st, i) => (
              <div
                key={i}
                onClick={() => setActiveStep(i)}
                className={`cursor-pointer p-6 rounded-xl border transition-all duration-300 flex gap-4 items-center ${
                  activeStep === i
                    ? 'bg-brand-surface-container border-brand-secondary/40 shadow-lg'
                    : 'bg-brand-surface-container/30 border-white/5 hover:border-white/15'
                }`}
              >
                <span className={`font-display text-lg font-bold ${activeStep === i ? 'text-brand-secondary' : 'text-brand-on-surface-variant/40'}`}>
                  {st.number}
                </span>
                <div className="flex-grow">
                  <h3 className={`font-display text-sm font-bold transition-colors ${activeStep === i ? 'text-brand-on-surface' : 'text-brand-on-surface-variant'}`}>
                    {st.title}
                  </h3>
                  <p className="text-[11px] text-brand-on-surface-variant/70 mt-0.5 line-clamp-1">
                    {st.tagline}
                  </p>
                </div>
                <ChevronRight 
                  size={16} 
                  className={`text-brand-on-surface-variant transition-transform ${activeStep === i ? 'translate-x-1 text-brand-secondary' : ''}`} 
                />
              </div>
            ))}
          </div>

          {/* Step Detail Panel (Right Column) */}
          <div className="lg:col-span-7 bg-brand-surface-lowest/50 border border-white/10 rounded-2xl p-8 md:p-12 shadow-2xl min-h-[450px] flex flex-col justify-between animate-fade-in">
            <div>
              <div className="flex justify-between items-center mb-8 border-b border-white/5 pb-6">
                <div className="flex items-center gap-3">
                  <span className="p-3 rounded-xl bg-brand-secondary/10 text-brand-secondary">
                    {steps[activeStep].icon}
                  </span>
                  <div>
                    <span className="text-[10px] font-bold font-mono text-brand-secondary uppercase tracking-widest block">Phase {steps[activeStep].number}</span>
                    <h2 className="font-display text-lg md:text-xl font-bold text-brand-on-surface mt-0.5">
                      {steps[activeStep].title}
                    </h2>
                  </div>
                </div>
              </div>

              <p className="text-xs md:text-sm text-brand-on-surface-variant leading-relaxed mb-8">
                {steps[activeStep].desc}
              </p>

              {/* Checklist */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-brand-on-surface/50 mb-4">
                  Standard Specifications & Submittals
                </h4>
                <ul className="space-y-3.5">
                  {steps[activeStep].bullets.map((bullet, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-xs text-brand-on-surface-variant leading-relaxed">
                      <span className="text-brand-secondary shrink-0 mt-0.5"><CheckCircle2 size={14} /></span>
                      <span>{bullet}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="mt-12 pt-6 border-t border-white/5 flex flex-wrap justify-between items-center gap-4 text-xs">
              <span className="flex items-center gap-1.5 text-brand-on-surface-variant/70">
                <HelpCircle size={13} /> Standards Compliant Design
              </span>
              <button 
                onClick={() => setActiveStep((activeStep + 1) % steps.length)}
                className="px-4 py-2 bg-brand-surface-highest hover:bg-white/5 text-brand-secondary rounded border border-brand-secondary/30 text-[10px] font-bold font-display uppercase tracking-widest transition-all"
              >
                Proceed to Phase {(activeStep + 1) % steps.length + 1}
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
