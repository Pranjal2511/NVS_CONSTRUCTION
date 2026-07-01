import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, HelpCircle } from 'lucide-react';

interface BeforeAfterSliderProps {
  beforeImage: string;
  afterImage: string;
  title: string;
  subtitle?: string;
  beforeLabel?: string;
  afterLabel?: string;
}

export default function BeforeAfterSlider({
  beforeImage,
  afterImage,
  title,
  subtitle,
  beforeLabel = 'Before (Structure & Foundation)',
  afterLabel = 'After (Completed Masterpiece)'
}: BeforeAfterSliderProps) {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMove = (clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    let position = (x / rect.width) * 100;
    if (position < 0) position = 0;
    if (position > 100) position = 100;
    setSliderPosition(position);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    handleMove(e.clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    if (e.touches.length > 0) {
      handleMove(e.touches[0].clientX);
    }
  };

  const handleMouseDown = () => {
    setIsDragging(true);
  };

  const handleTouchStart = () => {
    setIsDragging(true);
  };

  useEffect(() => {
    const handleMouseUp = () => {
      setIsDragging(false);
    };

    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('touchend', handleMouseUp);

    return () => {
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchend', handleMouseUp);
    };
  }, []);

  return (
    <div className="w-full max-w-5xl mx-auto py-10">
      {/* Title */}
      <div className="text-center mb-8">
        <span className="inline-block px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-brand-gold bg-brand-gold/10 rounded-full mb-3">
          Structural Transformation
        </span>
        <h3 className="font-display text-2xl md:text-3xl font-bold text-white mb-2">
          {title}
        </h3>
        {subtitle && (
          <p className="font-serif text-brand-on-surface-variant/60 text-sm md:text-base italic max-w-xl mx-auto">
            {subtitle}
          </p>
        )}
      </div>

      {/* Slider Container */}
      <div
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onTouchMove={handleTouchMove}
        className="relative aspect-[16/9] w-full overflow-hidden rounded-2xl border border-white/10 shadow-2xl bg-brand-surface-lowest select-none before-after-container"
      >
        {/* AFTER IMAGE (Background) */}
        <img
          src={afterImage}
          alt="Completed structure"
          className="absolute inset-0 w-full h-full object-cover pointer-events-none"
        />
        <div className="absolute bottom-4 right-6 z-20 glass-gold px-4 py-1.5 rounded-lg">
          <span className="font-display text-brand-gold text-[10px] uppercase tracking-widest font-bold">
            {afterLabel}
          </span>
        </div>

        {/* BEFORE IMAGE (Foreground, clipped) */}
        <div
          className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none"
          style={{ clipPath: `polygon(0 0, ${sliderPosition}% 0, ${sliderPosition}% 100%, 0 100%)` }}
        >
          <img
            src={beforeImage}
            alt="Structure under construction"
            className="absolute inset-0 w-full h-full object-cover pointer-events-none"
            style={{ width: containerRef.current?.getBoundingClientRect().width }}
          />
          <div className="absolute bottom-4 left-6 z-20 bg-brand-surface-lowest/90 border border-white/10 px-4 py-1.5 rounded-lg">
            <span className="font-display text-white/60 text-[10px] uppercase tracking-widest font-bold">
              {beforeLabel}
            </span>
          </div>
        </div>

        {/* DRAG HANDLE VERTICAL LINE */}
        <div
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
          className="absolute top-0 bottom-0 w-1 bg-brand-gold cursor-ew-resize z-30 flex items-center justify-center before-after-handle"
          style={{ left: `${sliderPosition}%` }}
        >
          {/* Handle Circle */}
          <div className="w-10 h-10 rounded-full bg-brand-gold border-4 border-[#0a0f18] shadow-2xl flex items-center justify-center text-[#0a0f18] hover:scale-110 active:scale-95 transition-transform">
            <svg
              className="w-4 h-4 fill-current"
              viewBox="0 0 24 24"
            >
              <path d="M14 6l-6 6 6 6v-12z M10 18l6-6-6-6v12z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Guide text */}
      <p className="text-center text-[10px] text-brand-on-surface-variant/40 uppercase tracking-[0.2em] mt-4 flex items-center justify-center gap-1.5">
        <Sparkles size={10} className="text-brand-gold" /> Drag the center slider left and right to compare construction phases
      </p>
    </div>
  );
}
