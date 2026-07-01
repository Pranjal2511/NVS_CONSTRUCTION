import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

export default function Preloader() {
  const [show, setShow] = useState(true);

  useEffect(() => {
    // Hide preloader after 2.5 seconds
    const timer = setTimeout(() => {
      setShow(false);
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ 
            y: '-100%',
            transition: { duration: 0.8, ease: [0.76, 0, 0.24, 1] }
          }}
          className="fixed inset-0 z-[99999] bg-brand-surface-lowest flex flex-col items-center justify-center text-brand-on-surface"
        >
          {/* Subtle gold grid background */}
          <div className="absolute inset-0 blueprint-bg opacity-15 pointer-events-none" />

          <div className="relative flex flex-col items-center select-none z-10">
            {/* Logo Icon */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 1, ease: 'easeOut' }}
              className="mb-6 w-16 h-16 rounded-full border border-brand-gold/30 flex items-center justify-center bg-brand-surface-container/50 shadow-2xl shadow-brand-gold/5"
            >
              <motion.span 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.8 }}
                className="font-display text-xl font-black text-brand-gold tracking-widest"
              >
                NVS
              </motion.span>
            </motion.div>

            {/* Brand Title */}
            <h1 className="font-display text-lg md:text-xl font-bold tracking-[0.4em] uppercase text-white mb-2">
              NVS BUILDCON
            </h1>

            {/* Tagline */}
            <p className="font-serif text-[10px] md:text-xs text-brand-on-surface-variant/60 tracking-[0.2em] uppercase mb-8">
              Engineering Luxury • Est. 2009
            </p>

            {/* Luxury progress bar */}
            <div className="relative w-48 h-[1px] bg-white/10 overflow-hidden">
              <motion.div
                initial={{ left: '-100%' }}
                animate={{ left: '100%' }}
                transition={{ 
                  duration: 2, 
                  ease: 'easeInOut',
                  repeat: 0
                }}
                className="absolute top-0 bottom-0 w-1/2 bg-gradient-to-r from-transparent via-brand-gold to-transparent"
              />
            </div>
          </div>

          {/* Corner Decors */}
          <div className="absolute top-10 left-10 w-8 h-8 border-t border-l border-brand-gold/20" />
          <div className="absolute top-10 right-10 w-8 h-8 border-t border-r border-brand-gold/20" />
          <div className="absolute bottom-10 left-10 w-8 h-8 border-b border-l border-brand-gold/20" />
          <div className="absolute bottom-10 right-10 w-8 h-8 border-b border-r border-brand-gold/20" />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
