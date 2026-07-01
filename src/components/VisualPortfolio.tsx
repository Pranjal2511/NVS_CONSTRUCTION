import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight, X, ZoomIn, Layers } from 'lucide-react';
import { GALLERY_DATA } from '../data';

type GalleryFilter = 'All' | 'Exterior' | 'Interior' | 'Construction' | 'Completed Projects' | 'Ongoing Projects';

export default function VisualPortfolio() {
  const [activeFilter, setActiveFilter] = useState<GalleryFilter>('All');
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const filters: GalleryFilter[] = ['All', 'Exterior', 'Interior', 'Construction', 'Completed Projects', 'Ongoing Projects'];

  const getGalleryCategory = (item: (typeof GALLERY_DATA)[number]): GalleryFilter => {
    const text = `${item.title} ${item.category} ${item.desc}`.toLowerCase();
    if (text.includes('interior') || text.includes('kitchen') || text.includes('bedroom') || text.includes('living')) return 'Interior';
    if (text.includes('construction') || text.includes('frame') || text.includes('foundation') || text.includes('pour')) return 'Construction';
    if (text.includes('completed') || text.includes('finish') || text.includes('villa elevation')) return 'Completed Projects';
    if (text.includes('progress') || text.includes('active') || text.includes('site')) return 'Ongoing Projects';
    return 'Exterior';
  };

  const filteredItems = activeFilter === 'All'
    ? GALLERY_DATA
    : GALLERY_DATA.filter(item => getGalleryCategory(item) === activeFilter);

  // Keyboard navigation for Lightbox
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (lightboxIndex === null) return;
      if (e.key === 'Escape') setLightboxIndex(null);
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'ArrowLeft') handlePrev();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxIndex, filteredItems]);

  const handlePrev = () => {
    if (lightboxIndex === null) return;
    setLightboxIndex((lightboxIndex - 1 + filteredItems.length) % filteredItems.length);
  };

  const handleNext = () => {
    if (lightboxIndex === null) return;
    setLightboxIndex((lightboxIndex + 1) % filteredItems.length);
  };

  return (
    <div className="text-brand-on-surface min-h-screen bg-brand-surface pt-28 pb-20 px-6 md:px-16">
      {/* Header Info */}
      <section className="max-w-7xl mx-auto text-center mb-16">
        <span className="inline-block px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-brand-gold bg-brand-gold/10 rounded-full mb-4">
          Gallery
        </span>
        <h1 className="font-display text-4xl md:text-5xl font-bold tracking-tight text-white mb-4">
          Project Gallery
        </h1>
        <p className="text-sm text-brand-on-surface-variant max-w-md mx-auto font-serif italic">
          Real project images from exterior, interior, construction, completed, and ongoing work.
        </p>
        <div className="gold-line mt-8 w-24 mx-auto" />
      </section>

      {/* Filter Tabs */}
      <section className="max-w-7xl mx-auto mb-12 flex justify-center">
        <div className="flex flex-wrap gap-2 justify-center bg-brand-surface-container/30 border border-white/5 p-1.5 rounded-2xl">
          {filters.map((f) => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className={`px-5 py-2.5 rounded-xl text-[10px] font-bold font-display uppercase tracking-widest transition-all duration-300 ${
                activeFilter === f
                  ? 'bg-brand-gold text-[#0a0f18] shadow-lg shadow-brand-gold/10'
                  : 'bg-transparent text-brand-on-surface-variant/80 hover:text-white'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </section>

      {/* Gallery Grid */}
      <section className="max-w-7xl mx-auto">
        <motion.div 
          layout
          className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6 w-full"
        >
          <AnimatePresence mode="popLayout">
            {filteredItems.map((item, index) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.4, delay: index * 0.02 }}
                onClick={() => setLightboxIndex(index)}
                className="break-inside-avoid relative group rounded-2xl overflow-hidden border border-white/5 bg-brand-surface-container cursor-pointer shadow-lg hover:shadow-2xl hover:border-brand-gold/20 transition-all duration-300 hover:-translate-y-1 block"
              >
                {/* Image */}
                <div className="relative overflow-hidden w-full h-auto">
                  <img
                    src={item.imageUrl}
                    alt={item.alt}
                    className="w-full object-cover transition-transform duration-700 group-hover:scale-103"
                    loading="lazy"
                  />
                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-[#050a12]/85 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-between p-6 z-10">
                    <div className="flex justify-between items-center">
                      <span className="px-2.5 py-1 bg-brand-gold/10 border border-brand-gold/30 rounded-lg text-[9px] font-bold uppercase tracking-wider text-brand-gold">
                        {getGalleryCategory(item)}
                      </span>
                      <span className="p-2 bg-brand-surface-container/80 backdrop-blur rounded-full text-white hover:text-brand-gold transition-colors border border-white/10">
                        <ZoomIn size={14} />
                      </span>
                    </div>

                    <div>
                      <h3 className="font-display text-sm font-bold text-white mb-2 uppercase tracking-wider">
                        {item.title}
                      </h3>
                      <p className="font-serif text-[11px] text-brand-on-surface-variant/80 leading-relaxed line-clamp-2">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </section>

      {/* Lightbox Modal Component */}
      <AnimatePresence>
        {lightboxIndex !== null && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-[#050a12]/98 backdrop-blur-lg flex items-center justify-center p-4"
          >
            {/* Main Container */}
            <motion.div 
              initial={{ scale: 0.95, y: 10 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 10 }}
              className="relative max-w-5xl w-full flex flex-col md:flex-row bg-brand-surface-container rounded-2xl overflow-hidden border border-white/10 shadow-2xl max-h-[90vh]"
            >
              {/* Close Button */}
              <button
                onClick={() => setLightboxIndex(null)}
                className="absolute top-4 right-4 md:top-6 md:right-6 z-[210] p-2 bg-brand-surface-lowest/80 backdrop-blur rounded-full text-brand-on-surface-variant hover:text-white hover:bg-white/10 transition-all border border-white/10"
                aria-label="Close Lightbox"
              >
                <X size={20} />
              </button>

              {/* Left Column: Image Viewer */}
              <div className="relative w-full md:w-8/12 bg-black/40 flex items-center justify-center min-h-[40vh] md:min-h-[60vh] max-h-[70vh]">
                <img
                  src={filteredItems[lightboxIndex].imageUrl}
                  alt={filteredItems[lightboxIndex].alt}
                  className="w-full h-full object-contain max-h-[65vh] p-2"
                />

                {/* Navigation Arrows */}
                <button
                  onClick={(e: React.MouseEvent) => { e.stopPropagation(); handlePrev(); }}
                  className="absolute left-4 p-2.5 bg-brand-surface-lowest/70 backdrop-blur rounded-full text-brand-on-surface-variant hover:text-white hover:bg-white/10 hover:scale-105 transition-all border border-white/10"
                  aria-label="Previous Project"
                >
                  <ChevronLeft size={20} />
                </button>
                <button
                  onClick={(e: React.MouseEvent) => { e.stopPropagation(); handleNext(); }}
                  className="absolute right-4 p-2.5 bg-brand-surface-lowest/70 backdrop-blur rounded-full text-brand-on-surface-variant hover:text-white hover:bg-white/10 hover:scale-105 transition-all border border-white/10"
                  aria-label="Next Project"
                >
                  <ChevronRight size={20} />
                </button>
              </div>

              {/* Right Column: Architectural Metadata */}
              <div className="w-full md:w-4/12 p-8 flex flex-col justify-between bg-brand-surface-container border-t md:border-t-0 md:border-l border-white/10 overflow-y-auto max-h-[40vh] md:max-h-none">
                <div>
                  <span className="inline-block px-2.5 py-1 bg-brand-gold/10 border border-brand-gold/30 rounded-lg font-display text-[9px] font-bold uppercase tracking-wider text-brand-gold mb-4">
                    {getGalleryCategory(filteredItems[lightboxIndex])}
                  </span>
                  <h3 className="font-display text-lg font-bold text-white mb-3 uppercase tracking-wide">
                    {filteredItems[lightboxIndex].title}
                  </h3>
                  <p className="font-serif text-xs text-brand-on-surface-variant/90 leading-relaxed mb-6 font-light">
                    {filteredItems[lightboxIndex].desc}
                  </p>
                </div>

                <div className="border-t border-white/5 pt-6 mt-6">
                  <div className="flex items-center gap-3 text-xs text-brand-on-surface-variant/80 mb-4">
                    <span className="text-brand-gold"><Layers size={14} /></span>
                    <span>Real project image</span>
                  </div>
                  <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-wider text-brand-on-surface-variant/50">
                    <span>Record</span>
                    <span>{lightboxIndex + 1} of {filteredItems.length}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
