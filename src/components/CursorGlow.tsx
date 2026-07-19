// src/components/CursorGlow.tsx
import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';

export default function CursorGlow() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const followerRef = useRef<HTMLDivElement>(null);
  const [isHovering, setIsHovering] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Check if device is mobile
    setIsMobile('ontouchstart' in window || window.matchMedia('(max-width: 768px)').matches);
  }, []);

  useEffect(() => {
    if (isMobile) return;

    const cursor = cursorRef.current;
    const follower = followerRef.current;
    if (!cursor || !follower) return;

    let mouseX = 0;
    let mouseY = 0;
    let followerX = 0;
    let followerY = 0;

    const onMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;

      // Immediate cursor movement
      gsap.to(cursor, {
        x: mouseX,
        y: mouseY,
        duration: 0.1,
        ease: 'power2.out'
      });
    };

    const animateFollower = () => {
      // Smooth follower with lag
      followerX += (mouseX - followerX) * 0.08;
      followerY += (mouseY - followerY) * 0.08;

      gsap.set(follower, {
        x: followerX,
        y: followerY
      });

      requestAnimationFrame(animateFollower);
    };

    const onMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const isInteractive = target.closest('button, a, [role="button"], .cursor-pointer, input, textarea, select');
      
      if (isInteractive) {
        setIsHovering(true);
        gsap.to(follower, {
          scale: 1.5,
          borderColor: 'rgba(194, 166, 73, 0.6)',
          duration: 0.3,
          ease: 'power2.out'
        });
      }
    };

    const onMouseOut = () => {
      setIsHovering(false);
      gsap.to(follower, {
        scale: 1,
        borderColor: 'rgba(194, 166, 73, 0.2)',
        duration: 0.3,
        ease: 'power2.out'
      });
    };

    animateFollower();
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseover', onMouseOver);
    window.addEventListener('mouseout', onMouseOut);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseover', onMouseOver);
      window.removeEventListener('mouseout', onMouseOut);
    };
  }, [isMobile]);

  if (isMobile) return null;

  return (
    <>
      {/* Main cursor dot */}
      <div
        ref={cursorRef}
        className="fixed top-0 left-0 w-2 h-2 bg-brand-gold rounded-full pointer-events-none z-[9999] mix-blend-difference"
        style={{ transform: 'translate(-50%, -50%)' }}
      />
      
      {/* Follower ring */}
      <div
        ref={followerRef}
        className="fixed top-0 left-0 w-8 h-8 border border-brand-gold/20 rounded-full pointer-events-none z-[9998] transition-colors duration-300"
        style={{ transform: 'translate(-50%, -50%)' }}
      />
    </>
  );
}
