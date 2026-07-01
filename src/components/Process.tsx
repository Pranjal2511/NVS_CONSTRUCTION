import { useState } from 'react';
import { Compass, Scale, ShieldAlert, Sparkles, CheckCircle2, ChevronRight, HelpCircle } from 'lucide-react';

export default function Process() {
  const [activeStep, setActiveStep] = useState(0);

  const steps = [
    {
      number: '01',
      title: 'Site Analysis & Topographical Scanning',
      tagline: 'Analyzing land physics and environmental orientation.',
      icon: <Compass size={22} />,
      desc: 'Our process begins on-site. We deploy digital scanning equipment to record precise elevations, bedrock depth, and sun angles. This guarantees that our blueprints capitalize perfectly on structural footing safety and passive thermal vectors.',
      bullets: [
        '3D LiDAR topographical scans with sub-centimeter resolution',
        'Bedrock analysis and soil load-bearing calculation',
        'Micro-climate tracking (wind sheer & thermal profiles)',
        'Neighboring structure envelope and sight-line preservation checks'
      ]
    },
    {
      number: '02',
      title: 'Precision CAD drafting & Engineering',
      tagline: 'Fusing visual elegance with rigid structural physics.',
      icon: <Scale size={22} />,
      desc: 'Next, we translate design ideas into highly technical models. Our engineering teams perform stress tests and composite beam simulations using advanced finite-element analysis. We formulate exact structural plans, ensuring code compliance and architectural integrity.',
      bullets: [
        'Rigorous finite-element structural loading simulations',
        'Dual seismic-isolation and soil-damping blueprints',
        'Triple-glazed low-emissivity framing layouts',
        'Millimeter-precision carbon-steel moment framing specifications'
      ]
    },
    {
      number: '03',
      title: 'Bespoke Materials Curation',
      tagline: 'Acquiring high-grade structural components globally.',
      icon: <Sparkles size={22} />,
      desc: 'We do not source from generic distributors. NVS maintains a proprietary list of specialized fabricators globally. From bookmatched Italian marble slabs to high-tensile structural steel members, we check every material under strict quality assurance.',
      bullets: [
        'Grade-A seismic carbon-steel framing curation',
        'FSC-certified timber composites and sustainable cladding materials',
        'Low-iron glass sheets with double acoustic sealing layers',
        'Raw premium-grain structural cement mixing formulas'
      ]
    },
    {
      number: '04',
      title: 'Zero-Tolerance Physical Build',
      tagline: 'On-site execution with millimeter accuracy.',
      icon: <ShieldAlert size={22} />,
      desc: 'Our construction sequences are managed entirely by our specialized builders and civil engineers. We employ advanced coordinate modeling equipment on-site to verify structural plumb, alignment, and spacing down to sub-millimeter tolerances.',
      bullets: [
        'Continuous coordinate alignment checks via laser-tracker systems',
        'Pre-stressed concrete tensioning and high-weld checks',
        'Thermal envelope airtightness testing and infrared verification',
        'Unified systems startup: Savant automation & geothermal loops'
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
                <HelpCircle size={13} /> Code Compliant ISO Certification
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
