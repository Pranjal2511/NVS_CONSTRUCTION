import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown, ChevronUp, HelpCircle } from 'lucide-react';
import { FAQ_DATA } from '../data';

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="py-24 px-6 md:px-16 max-w-4xl mx-auto w-full">
      {/* Header */}
      <div className="text-center mb-16">
        <span className="inline-block px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-brand-gold bg-brand-gold/10 rounded-full mb-4">
          Information & Support
        </span>
        <h2 className="font-display text-3xl md:text-4xl font-bold tracking-tight text-white mb-4">
          Frequently Asked Questions
        </h2>
        <p className="text-sm text-brand-on-surface-variant max-w-md mx-auto font-serif italic">
          Clear answers regarding structural planning, Vastu layouts, and turnkey development timelines.
        </p>
        <div className="gold-line mt-8 w-24 mx-auto" />
      </div>

      {/* Accordion List */}
      <div className="space-y-4">
        {FAQ_DATA.map((faq, i) => {
          const isOpen = openIndex === i;
          return (
            <div
              key={i}
              className={`border rounded-xl transition-all duration-300 ${
                isOpen
                  ? 'bg-brand-surface-container border-brand-gold/40 shadow-xl shadow-brand-gold/5'
                  : 'bg-brand-surface-container/25 border-white/5 hover:border-white/10'
              }`}
            >
              {/* Question Trigger Button */}
              <button
                onClick={() => toggleFAQ(i)}
                className="w-full px-6 py-5 text-left flex items-center justify-between gap-4 focus:outline-none"
                aria-expanded={isOpen}
              >
                <span className="font-display text-sm md:text-base font-bold text-brand-on-surface hover:text-brand-gold transition-colors duration-300">
                  {faq.question}
                </span>
                <span className={`p-1.5 rounded-lg bg-brand-surface-lowest/80 text-brand-gold border border-white/5 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}>
                  <ChevronDown size={16} />
                </span>
              </button>

              {/* Collapsible Answer Content */}
              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    key="content"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ 
                      height: 'auto', 
                      opacity: 1,
                      transition: { height: { duration: 0.3, ease: 'easeOut' }, opacity: { duration: 0.25, delay: 0.05 } }
                    }}
                    exit={{ 
                      height: 0, 
                      opacity: 0,
                      transition: { height: { duration: 0.25, ease: 'easeIn' }, opacity: { duration: 0.15 } }
                    }}
                    className="overflow-hidden"
                  >
                    <div className="px-6 pb-6 pt-1 border-t border-white/5">
                      <p className="font-serif text-sm md:text-base text-brand-on-surface-variant/85 leading-relaxed font-light">
                        {faq.answer}
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </section>
  );
}
