import { motion } from 'motion/react';
import { Building2, CheckCircle, Home, Landmark, Ruler, Shield } from 'lucide-react';

const services = [
  'Architectural Planning',
  'House Design',
  '3D Elevation',
  'Structural Design',
  'Interior Design',
  'Construction Services',
];

export default function About() {
  return (
    <div className="text-brand-on-surface bg-brand-surface">
      <section className="pt-32 pb-24 px-6 md:px-16 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
            className="lg:col-span-6 space-y-6"
          >
            <span className="inline-block px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-brand-gold bg-brand-gold/10 rounded-full">
              About NVS Buildcon
            </span>
            <h1 className="font-display text-4xl md:text-5xl font-bold tracking-tight text-white leading-tight">
              Practical design for homes, offices, and construction projects.
            </h1>
            <p className="text-sm md:text-base text-brand-on-surface-variant/90 leading-relaxed max-w-2xl">
              NVS Buildcon provides architectural planning, house design, 3D elevation, structural drawings,
              interior design, and construction support for residential and commercial projects.
            </p>
            <p className="text-sm text-brand-on-surface-variant/75 leading-relaxed max-w-2xl">
              Our team helps clients plan clearly, estimate costs, prepare drawings, and move from concept
              to site execution with confidence.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              {services.map((item) => (
                <div key={item} className="flex items-center gap-2.5 text-sm text-brand-on-surface/90">
                  <CheckCircle size={16} className="text-brand-gold shrink-0" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.15, ease: 'easeOut' }}
            className="lg:col-span-5 lg:col-start-8"
          >
            <div className="relative rounded-2xl overflow-hidden border border-white/10 shadow-2xl aspect-[3/4] group">
              <img
                src="/images/WhatsApp Image 2026-06-29 at 13.04.30 (1).jpeg"
                alt="Modern home project by NVS Buildcon"
                className="w-full h-full object-cover brightness-[0.82] transition-transform duration-[1.1s] group-hover:scale-105"
                loading="lazy"
                decoding="async"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0a0f18]/90 via-transparent to-transparent" />
              <div className="absolute bottom-6 left-6 right-6 p-5 glass-panel rounded-xl border border-white/5">
                <span className="text-brand-gold"><Home size={22} /></span>
                <p className="font-display text-sm font-bold text-white mt-2 uppercase tracking-wider">Residential Design</p>
                <p className="text-[10px] text-brand-on-surface-variant/80 uppercase tracking-widest mt-0.5">
                  Planning, elevation, structure, and execution
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="bg-[#050a12] py-20 px-6 md:px-16 border-t border-white/5 relative">
        <div className="absolute inset-0 blueprint-bg opacity-[0.02] pointer-events-none" />
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
          {[
            {
              icon: <Ruler size={22} />,
              title: 'Planning First',
              text: 'We start with plot size, requirements, budget, and local approval needs before creating drawings.',
            },
            {
              icon: <Shield size={22} />,
              title: 'Clear Drawings',
              text: 'Floor plans, elevations, structural layouts, and MEP drawings are prepared for practical site use.',
            },
            {
              icon: <Building2 size={22} />,
              title: 'Site Support',
              text: 'We support construction decisions with material guidance, BOQ, and execution coordination.',
            },
          ].map((card) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ duration: 0.5 }}
              className="p-8 bg-[#0a0f18]/55 border border-white/5 rounded-2xl hover:border-brand-gold/25 transition-all duration-300"
            >
              <div className="w-12 h-12 bg-brand-gold/10 text-brand-gold rounded-xl flex items-center justify-center mb-6">
                {card.icon}
              </div>
              <h3 className="font-display text-sm font-bold text-white mb-3 uppercase tracking-wider">{card.title}</h3>
              <p className="text-sm text-brand-on-surface-variant/80 leading-relaxed">{card.text}</p>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}
