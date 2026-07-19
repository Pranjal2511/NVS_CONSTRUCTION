// src/hooks/useScrollReveal.ts
import { useEffect, useRef } from 'react';
import gsap from 'gsap';

interface ScrollRevealOptions {
  threshold?: number;
  rootMargin?: string;
  className?: string;
  delay?: number;
}

export function useScrollReveal<T extends HTMLElement>(
  options: ScrollRevealOptions = {}
) {
  const ref = useRef<T>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const {
      threshold = 0.15,
      rootMargin = '0px 0px -60px 0px',
      className = 'revealed',
      delay = 0,
    } = options;

    // Set initial state for GSAP animation
    gsap.set(el, {
      opacity: 0,
      y: 40,
      filter: 'blur(10px)'
    });

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add(className);
          
          // GSAP reveal animation
          gsap.to(el, {
            opacity: 1,
            y: 0,
            filter: 'blur(0px)',
            duration: 1.2,
            delay: delay,
            ease: 'power3.out'
          });
          
          observer.disconnect();
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return ref;
}

export default useScrollReveal;
