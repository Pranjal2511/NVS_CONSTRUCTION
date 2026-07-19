import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import gsap from 'gsap';

export default function Preloader() {
  const [show, setShow] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const lineRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleLoad = () => {
      // GSAP exit animation
      if (containerRef.current) {
        gsap.to(containerRef.current, {
          yPercent: -100,
          duration: 1.2,
          ease: 'power4.inOut',
          delay: 0.3,
          onComplete: () => setShow(false)
        });
      }
    };

    if (document.readyState === 'complete') {
      const timer = setTimeout(() => handleLoad(), 1200);
      return () => clearTimeout(timer);
    } else {
      window.addEventListener('load', handleLoad);
      const timer = setTimeout(() => handleLoad(), 2000);
      return () => {
        window.removeEventListener('load', handleLoad);
        clearTimeout(timer);
      };
    }
  }, []);

  useEffect(() => {
    if (show && textRef.current) {
      // Subtle text reveal animation
      gsap.fromTo(textRef.current.children,
        { y: 20, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 1,
          stagger: 0.15,
          ease: 'power3.out',
          delay: 0.3
        }
      );

      // Elegant line animation
      if (lineRef.current) {
        gsap.fromTo(lineRef.current,
          { width: 0 },
          {
            width: '100%',
            duration: 1.5,
            ease: 'power2.inOut',
            delay: 0.8
          }
        );
      }
    }
  }, [show]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          ref={containerRef}
          initial={{ opacity: 1 }}
          className="fixed inset-0 z-[99999] bg-brand-surface-lowest flex flex-col items-center justify-center text-brand-on-surface"
        >
          {/* Architectural grid background */}
          <div className="absolute inset-0 opacity-5 pointer-events-none">
            <div className="absolute inset-0" style={{
              backgroundImage: `
                linear-gradient(rgba(194, 166, 73, 0.1) 1px, transparent 1px),
                linear-gradient(90deg, rgba(194, 166, 73, 0.1) 1px, transparent 1px)
              `,
              backgroundSize: '40px 40px'
            }} />
          </div>

          <div ref={textRef} className="relative flex flex-col items-center select-none z-10">
            {/* Logo Image */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 1.2, ease: [0.23, 1, 0.32, 1] }}
              className="mb-10 relative"
            >
              <img
                src="/images/nvs-logo.png"
                alt="NVS Buildcon Logo"
                className="h-28 md:h-36 w-auto object-contain"
                loading="eager"
              />
            </motion.div>

            {/* Elegant progress line */}
            <div ref={lineRef} className="w-32 h-[1px] bg-brand-gold/30" />
          </div>

          {/* Architectural corner elements */}
          <div className="absolute top-12 left-12 w-12 h-12 border-t-2 border-l-2 border-brand-gold/20" />
          <div className="absolute top-12 right-12 w-12 h-12 border-t-2 border-r-2 border-brand-gold/20" />
          <div className="absolute bottom-12 left-12 w-12 h-12 border-b-2 border-l-2 border-brand-gold/20" />
          <div className="absolute bottom-12 right-12 w-12 h-12 border-b-2 border-r-2 border-brand-gold/20" />

          {/* Subtle center accent */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-64 h-64 border border-brand-gold/5 rounded-full" />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
