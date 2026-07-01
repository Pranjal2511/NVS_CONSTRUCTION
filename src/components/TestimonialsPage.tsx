import { motion } from 'motion/react';
import { Quote, Star, Sparkles } from 'lucide-react';
import { TESTIMONIALS_DATA } from '../data';

export default function TestimonialsPage() {
  return (
    <div className="text-brand-on-surface min-h-screen bg-brand-surface pt-28 pb-20 px-6 md:px-16">
      {/* Page Header */}
      <section className="max-w-7xl mx-auto text-center mb-16 animate-fade-in">
        <span className="inline-block px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-brand-secondary bg-brand-secondary/10 rounded-full mb-4">
          Testimonials
        </span>
        <h1 className="font-display text-4xl md:text-5xl font-bold tracking-tight text-brand-on-surface mb-4">
          Client Testimonials
        </h1>
        <p className="text-sm text-brand-on-surface-variant max-w-lg mx-auto font-serif italic">
          Short feedback from clients who worked with NVS Buildcon for planning, design, and project support.
        </p>
        <div className="gold-line mt-8 w-24 mx-auto" />
      </section>

      {/* Testimonials Grid */}
      <section className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {TESTIMONIALS_DATA.map((test, index) => (
            <motion.div
              key={test.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              className="p-8 md:p-10 bg-brand-surface-container/40 border border-white/5 rounded-2xl shadow-xl flex flex-col justify-between hover:border-brand-secondary/20 hover:-translate-y-1 transition-all duration-300 group"
            >
              <div>
                {/* Rating & Quote Icon */}
                <div className="flex justify-between items-center mb-6">
                  <div className="flex gap-1 text-brand-secondary">
                    {[...Array(test.rating)].map((_, i) => (
                      <Star key={i} size={16} fill="currentColor" />
                    ))}
                  </div>
                  <span className="text-brand-secondary/20 group-hover:text-brand-secondary/40 transition-colors">
                    <Quote size={28} />
                  </span>
                </div>

                {/* Review Text */}
                <p className="font-serif text-brand-on-surface-variant/90 text-sm md:text-base leading-relaxed mb-8 font-light italic">
                  "{test.review}"
                </p>
              </div>

              {/* Client Profile */}
              <div className="border-t border-white/5 pt-6 flex items-center gap-3">
                {/* Initials Avatar */}
                <div className="w-10 h-10 rounded-full bg-brand-secondary/10 border border-brand-secondary/20 flex items-center justify-center text-brand-secondary font-display font-bold text-xs">
                  {test.name.split(' ').map((n) => n[0]).join('')}
                </div>
                <div>
                  <h4 className="font-display text-xs font-bold uppercase tracking-wider text-brand-on-surface">
                    {test.name}
                  </h4>
                  <p className="text-[10px] text-brand-on-surface-variant/60 uppercase tracking-widest mt-0.5">
                    {test.role}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Trust Metrics Summary */}
      <section className="max-w-4xl mx-auto mt-24 text-center p-8 md:p-12 bg-brand-surface-lowest/50 border border-white/5 rounded-2xl">
        <Sparkles className="text-brand-secondary mx-auto mb-4" size={24} />
        <h4 className="font-display text-sm font-bold uppercase tracking-widest text-white mb-2">
          Professional Planning Support
        </h4>
        <p className="text-xs text-brand-on-surface-variant/80 max-w-md mx-auto leading-relaxed font-serif">
          We focus on clear drawings, practical design choices, transparent communication, and reliable project guidance.
        </p>
      </section>
    </div>
  );
}
