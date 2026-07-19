import { Landmark, ArrowUp, Mail, Phone, MapPin } from 'lucide-react';
import { ViewState } from '../types';

interface FooterProps {
  onViewChange: (view: ViewState) => void;
  onInquire: () => void;
}

export default function Footer({ onViewChange, onInquire }: FooterProps) {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-[#050a12] border-t border-brand-gold/10 pt-20 pb-12 px-6 md:px-16 text-brand-on-surface-variant">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 mb-16">
          {/* Column 1: Brand block */}
          <div className="md:col-span-4 space-y-4">
            <div className="flex items-center gap-2 text-white font-display text-lg font-bold tracking-[0.2em] mb-4 uppercase">
              <span className="text-brand-gold"><Landmark size={20} /></span>
              NVS BUILDCON
            </div>
            <p className="text-xs md:text-sm leading-relaxed max-w-sm font-light text-brand-on-surface-variant/80">
              Smart Planning • Modern Design • Practical Construction. Precision architectural drawings, Vastu-compliant layouts, and project planning support.
            </p>
            <div className="flex gap-4 text-xs text-brand-gold">
              <a href="https://instagram.com/nishant.designs13" target="_blank" rel="noopener noreferrer" className="p-2 bg-white/5 rounded-full hover:text-[#0a0f18] hover:bg-brand-gold transition-all duration-300 cursor-pointer border border-brand-gold/20">
                Instagram
              </a>
            </div>
          </div>

          {/* Column 2: Navigation shortcuts */}
          <div className="md:col-span-2 md:col-start-6">
            <h4 className="font-display text-xs font-bold text-white uppercase tracking-[0.15em] mb-4">Firm</h4>
            <ul className="space-y-3 text-xs font-light">
              <li>
                <button onClick={() => onViewChange('home')} className="hover:text-brand-gold transition-colors">Home</button>
              </li>
              <li>
                <button onClick={() => onViewChange('about')} className="hover:text-brand-gold transition-colors">About</button>
              </li>
              <li>
                <button onClick={() => onViewChange('services')} className="hover:text-brand-gold transition-colors">Services</button>
              </li>
              <li>
                <button onClick={() => onViewChange('projects')} className="hover:text-brand-gold transition-colors">Projects</button>
              </li>
              <li>
                <button onClick={() => onViewChange('house-plans')} className="hover:text-brand-gold transition-colors">House Plans</button>
              </li>
              <li>
                <button onClick={() => onViewChange('gallery')} className="hover:text-brand-gold transition-colors">Gallery</button>
              </li>
              <li>
                <button onClick={() => onViewChange('testimonials')} className="hover:text-brand-gold transition-colors">Testimonials</button>
              </li>
              <li>
                <button onClick={() => onViewChange('contact')} className="hover:text-brand-gold transition-colors">Contact</button>
              </li>
            </ul>
          </div>

          {/* Column 3: Contact/Inquiry support */}
          <div className="md:col-span-4 md:col-start-9">
            <h4 className="font-display text-xs font-bold text-white uppercase tracking-[0.15em] mb-4">Inquiries</h4>
            <ul className="space-y-4 text-xs font-light">
              <li className="flex items-center gap-2.5">
                <span className="text-brand-gold"><MapPin size={14} /></span>
                <span>Lucknow & Delhi NCR, India</span>
              </li>
              <li className="flex items-center gap-2.5">
                <span className="text-brand-gold"><Mail size={14} /></span>
                <a href="https://instagram.com/nishant.designs13" target="_blank" rel="noopener noreferrer" className="hover:text-brand-gold transition-colors">@nishant.designs13</a>
              </li>
              <li className="flex items-center gap-2.5">
                <span className="text-brand-gold"><Phone size={14} /></span>
                <a href="tel:+918009363259" className="hover:text-brand-gold transition-colors">+91 8009363259</a>
              </li>
              <li className="pt-2">
                <button
                  onClick={onInquire}
                  className="px-5 py-2.5 bg-brand-gold text-[#0a0f18] text-[10px] font-bold font-display uppercase tracking-widest rounded hover:scale-105 transition-transform duration-200 shadow-lg shadow-brand-gold/10"
                >
                  Consult Designer
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Credits section */}
        <div className="border-t border-white/5 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs font-light">
          <p>&copy; {new Date().getFullYear()} NVS Buildcon. All rights reserved.</p>
          <div className="flex gap-6 items-center">
            <span className="hover:text-white transition-colors cursor-pointer">Privacy & Terms</span>
            <button 
              onClick={scrollToTop}
              className="p-2 bg-white/5 hover:bg-brand-gold hover:text-[#0a0f18] rounded text-white transition-all flex items-center gap-1.5 border border-white/5"
            >
              Scroll to top <ArrowUp size={12} />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
