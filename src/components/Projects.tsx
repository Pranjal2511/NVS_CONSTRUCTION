import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { PROJECTS_DATA } from '../data';
import { MapPin, Calendar, ArrowRight } from 'lucide-react';

interface ProjectsProps {
  onInquire: (projectName?: string) => void;
}

export default function Projects({ onInquire }: ProjectsProps) {
  const [activeFilter, setActiveFilter] = useState<'All' | 'Residential' | 'Commercial' | 'Interior' | 'Exterior'>('All');

  const categories: ('All' | 'Residential' | 'Commercial' | 'Interior' | 'Exterior')[] = [
    'All', 'Residential', 'Commercial', 'Interior', 'Exterior'
  ];

  const filteredProjects = activeFilter === 'All'
    ? PROJECTS_DATA
    : PROJECTS_DATA.filter((p) => p.category === activeFilter);

  return (
    <div className="text-brand-on-surface min-h-screen bg-brand-surface pt-28 pb-20 px-6 md:px-16">
      {/* Page Header */}
      <section className="max-w-7xl mx-auto text-center mb-16">
        <span className="inline-block px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-brand-gold bg-brand-gold/10 rounded-full mb-4">
          Projects
        </span>
        <h1 className="font-display text-4xl md:text-5xl font-bold tracking-tight text-white mb-4">
          Our Projects
        </h1>
        <p className="text-sm text-brand-on-surface-variant max-w-lg mx-auto font-serif italic">
          Selected residential, commercial, interior, and exterior projects completed or in progress.
        </p>
        <div className="gold-line mt-8 w-24 mx-auto" />
      </section>

      {/* Category Filter Tabs */}
      <section className="max-w-7xl mx-auto mb-12 flex justify-center">
        <div className="flex flex-wrap gap-2 justify-center bg-brand-surface-container/30 border border-white/5 p-1.5 rounded-2xl">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveFilter(cat)}
              aria-pressed={activeFilter === cat}
              aria-label={`Filter projects by ${cat}`}
              className={`px-5 py-2.5 rounded-xl text-[10px] font-bold font-display uppercase tracking-widest transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-brand-gold/50 ${
                activeFilter === cat
                  ? 'bg-brand-gold text-[#0a0f18] shadow-lg shadow-brand-gold/10'
                  : 'bg-transparent text-brand-on-surface-variant/80 hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </section>

      {/* Projects Grid */}
      <section className="max-w-7xl mx-auto">
        <motion.div 
          layout
          className="grid grid-cols-1 md:grid-cols-2 gap-10"
        >
          <AnimatePresence mode="popLayout">
            {filteredProjects.map((project, index) => (
              <motion.div
                key={project.id}
                layout
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.5, delay: index * 0.05 }}
                className="group bg-brand-surface-container/30 border border-white/5 rounded-2xl overflow-hidden hover:border-brand-gold/30 transition-all duration-700 shadow-xl flex flex-col justify-between hover:shadow-2xl hover:shadow-brand-gold/5"
              >
                {/* Media Section */}
                <div className="relative aspect-[16/10] overflow-hidden bg-brand-surface-lowest">
                  <img
                    src={project.imageUrl}
                    alt={project.title}
                    className="w-full h-full object-cover transition-transform duration-[1.5s] ease-out group-hover:scale-110"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-brand-surface-lowest/90 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-700" />
                  <div className="absolute top-4 left-4 glass-gold border border-brand-gold/20 px-3 py-1 rounded-lg text-[9px] font-bold font-display uppercase tracking-wider text-brand-gold backdrop-blur-sm">
                    {project.category}
                  </div>
                </div>

                {/* Text Description */}
                <div className="p-8 flex-grow flex flex-col justify-between relative">
                  <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-brand-gold/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                  <div>
                    <h3 className="font-display text-lg font-bold text-white mb-3 group-hover:text-brand-gold transition-colors duration-500">
                      {project.title}
                    </h3>
                    <p className="text-sm text-brand-on-surface-variant/85 leading-relaxed mb-6 group-hover:text-brand-on-surface-variant transition-colors duration-500">
                      {project.description}
                    </p>
                  </div>

                  {/* Metadata Row */}
                  <div className="flex flex-wrap items-center gap-6 border-t border-white/5 pt-6 mt-auto">
                    {project.location && (
                      <div className="flex items-center gap-2 text-[11px] text-brand-on-surface-variant/80">
                        <span className="text-brand-gold"><MapPin size={13} /></span>
                        <span>{project.location}</span>
                      </div>
                    )}
                    {project.year && (
                      <div className="flex items-center gap-2 text-[11px] text-brand-on-surface-variant/80">
                        <span className="text-brand-gold"><Calendar size={13} /></span>
                        <span>{project.year}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-[11px] text-brand-on-surface-variant/80">
                      <span className="text-brand-gold">Area</span>
                      <span>{project.area || 'As per site'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-brand-on-surface-variant/80">
                      <span className="text-brand-gold">Status</span>
                      <span>{project.year === '2026' ? 'Ongoing' : 'Completed'}</span>
                    </div>
                  </div>

                  {/* Action button */}
                  <button
                    onClick={() => onInquire(project.title)}
                    aria-label={`Request consultation for ${project.title}`}
                    className="w-full mt-6 px-6 py-3.5 bg-brand-surface-highest border border-white/10 hover:border-brand-gold/40 rounded-xl text-[10px] font-bold font-display uppercase tracking-widest text-center flex items-center justify-center gap-2 group-hover:bg-brand-gold group-hover:text-[#0a0f18] transition-all duration-500 focus:outline-none focus:ring-2 focus:ring-brand-gold/50 hover:shadow-lg hover:shadow-brand-gold/10"
                  >
                    Request Consultation <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform duration-300" />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </section>
    </div>
  );
}
