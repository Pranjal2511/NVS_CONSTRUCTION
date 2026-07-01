import { motion } from 'motion/react';
import { Building2, CheckCircle2, ClipboardList, Cuboid, Lightbulb, Ruler } from 'lucide-react';

interface ServicesProps {
  onInquire: (serviceName?: string) => void;
}

const serviceGroups = [
  {
    title: 'Planning',
    icon: <ClipboardList size={23} />,
    description: 'Practical drawings for homes, villas, shops, offices, and approval work.',
    items: ['2D Floor Plans', 'Vastu Planning', 'Working Drawings', 'Municipal Drawings'],
  },
  {
    title: '3D Services',
    icon: <Cuboid size={23} />,
    description: 'Clear visuals that help you understand the final look before construction starts.',
    items: ['Front Elevation', 'Exterior Rendering', 'Interior Design', 'Walkthrough'],
  },
  {
    title: 'Structural',
    icon: <Building2 size={23} />,
    description: 'Engineering drawings for safe, buildable, and cost-aware construction.',
    items: ['Column Layout', 'Beam Layout', 'Footing Layout', 'BOQ'],
  },
  {
    title: 'MEP',
    icon: <Lightbulb size={23} />,
    description: 'Electrical and plumbing layouts planned with the building drawings.',
    items: ['Electrical Layout', 'Plumbing Layout', 'Electrical + Plumbing'],
  },
];

const paymentTerms = [
  { value: '40%', label: 'Advance' },
  { value: '40%', label: 'After Design Approval' },
  { value: '20%', label: 'Before Final Delivery' },
];

export default function Services({ onInquire }: ServicesProps) {
  return (
    <div className="text-brand-on-surface bg-brand-surface pt-28 pb-20">
      <section className="py-16 px-6 md:px-16 max-w-7xl mx-auto border-b border-white/5">
        <div className="max-w-3xl space-y-5">
          <span className="inline-block px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-brand-gold bg-brand-gold/10 rounded-full">
            Services
          </span>
          <h1 className="font-display text-4xl md:text-5xl font-bold tracking-tight text-white leading-tight">
            House planning, 3D design, structure, and MEP drawings.
          </h1>
          <p className="text-sm md:text-base text-brand-on-surface-variant/85 leading-relaxed">
            Choose the service you need or request a complete design package. Every service is explained clearly,
            priced transparently, and prepared for practical use.
          </p>
        </div>
      </section>

      <section className="py-20 px-6 md:px-16 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {serviceGroups.map((group, index) => (
            <motion.div
              key={group.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.5, delay: index * 0.05, ease: 'easeOut' }}
              className="bg-brand-surface-container/35 border border-white/5 rounded-2xl p-7 flex flex-col justify-between min-h-[360px] hover:border-brand-gold/25 hover:-translate-y-1 transition-all duration-300"
            >
              <div>
                <div className="w-12 h-12 bg-brand-gold/10 text-brand-gold rounded-xl flex items-center justify-center mb-6">
                  {group.icon}
                </div>
                <h3 className="font-display text-lg font-bold text-white mb-3 uppercase tracking-wide">{group.title}</h3>
                <p className="text-sm text-brand-on-surface-variant/80 leading-relaxed mb-6">{group.description}</p>
                <ul className="space-y-3">
                  {group.items.map((item) => (
                    <li key={item} className="flex items-center gap-2.5 text-sm text-brand-on-surface/88">
                      <CheckCircle2 size={15} className="text-brand-gold shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <button
                onClick={() => onInquire(group.title)}
                className="mt-7 px-5 py-3 bg-brand-surface-highest hover:bg-brand-gold hover:text-[#0a0f18] border border-white/10 hover:border-transparent rounded-lg text-[10px] font-bold font-display uppercase tracking-widest transition-all duration-300"
              >
                Get Quote
              </button>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="px-6 md:px-16 max-w-7xl mx-auto">
        <div className="bg-[#050a12]/70 border border-white/5 rounded-2xl p-8 md:p-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
            <div>
              <span className="inline-block px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-brand-gold bg-brand-gold/10 rounded-full mb-4">
                Payment Terms
              </span>
              <h2 className="font-display text-2xl md:text-3xl font-bold text-white">Simple project payment timeline</h2>
            </div>
            <p className="text-sm text-brand-on-surface-variant/75 max-w-md">
              Payments are linked to project progress so the scope remains clear for both sides.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {paymentTerms.map((term, index) => (
              <div key={term.label} className="relative bg-brand-surface-container/35 border border-white/5 rounded-xl p-6">
                <div className="flex items-center gap-4">
                  <span className="font-display text-4xl font-black text-brand-gold">{term.value}</span>
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-brand-on-surface-variant/50">Stage {index + 1}</p>
                    <h3 className="font-display text-sm font-bold text-white uppercase tracking-wide">{term.label}</h3>
                  </div>
                </div>
                {index < paymentTerms.length - 1 && (
                  <span className="hidden md:block absolute -right-3 top-1/2 -translate-y-1/2 text-brand-gold/60">
                    <Ruler size={20} />
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
