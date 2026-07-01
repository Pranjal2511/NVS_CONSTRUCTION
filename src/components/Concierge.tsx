import { Phone, MessageSquare, ShieldCheck } from 'lucide-react';
import { useState } from 'react';

interface ConciergeProps {
  onInquire: (service?: string) => void;
}

export default function Concierge({ onInquire }: ConciergeProps) {
  const [activeTooltip, setActiveTooltip] = useState<'whatsapp' | 'call' | 'none'>('none');

  return (
    <aside className="hidden xl:flex fixed right-8 top-1/2 -translate-y-1/2 rounded-full w-16 py-8 bg-brand-surface-highest/90 backdrop-blur-2xl border border-white/10 shadow-2xl flex-col gap-6 items-center z-40 animate-fade-in">
      {/* Professional Concierge Avatar */}
      <div 
        className="relative w-10 h-10 rounded-full bg-brand-secondary/15 flex items-center justify-center border border-brand-secondary/30 overflow-hidden group cursor-help text-brand-secondary font-bold text-xs"
        title="NVS Principal Support"
      >
        NVS
        {/* Active Indicator dot */}
        <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border border-brand-surface-highest"></span>
      </div>

      {/* Divider */}
      <div className="w-6 h-px bg-white/10"></div>

      {/* WhatsApp Button */}
      <div className="relative">
        <button 
          onMouseEnter={() => setActiveTooltip('whatsapp')}
          onMouseLeave={() => setActiveTooltip('none')}
          onClick={() => {
            window.open('https://wa.me/918009363259', '_blank');
          }}
          aria-label="Connect via WhatsApp"
          className="flex flex-col items-center gap-1 text-brand-on-surface-variant hover:text-brand-secondary hover:bg-brand-secondary/10 transition-all hover:scale-110 active:scale-95 p-3 rounded-full"
        >
          <MessageSquare size={20} />
        </button>
        {activeTooltip === 'whatsapp' && (
          <span className="absolute right-full mr-4 top-1/2 -translate-y-1/2 px-3 py-1 bg-brand-surface-high border border-white/10 rounded font-display text-[10px] font-bold uppercase tracking-wider text-brand-on-surface whitespace-nowrap shadow-xl pointer-events-none animate-fade-in">
            WhatsApp Concierge
          </span>
        )}
      </div>

      {/* Phone Call Button */}
      <div className="relative">
        <button 
          onMouseEnter={() => setActiveTooltip('call')}
          onMouseLeave={() => setActiveTooltip('none')}
          onClick={() => onInquire('Architectural Design')}
          aria-label="Consult Architect"
          className="flex flex-col items-center gap-1 text-brand-on-surface-variant hover:text-brand-secondary hover:bg-brand-secondary/10 transition-all hover:scale-110 active:scale-95 p-3 rounded-full"
        >
          <Phone size={20} />
        </button>
        {activeTooltip === 'call' && (
          <span className="absolute right-full mr-4 top-1/2 -translate-y-1/2 px-3 py-1 bg-brand-surface-high border border-white/10 rounded font-display text-[10px] font-bold uppercase tracking-wider text-brand-on-surface whitespace-nowrap shadow-xl pointer-events-none animate-fade-in">
            Schedule a Call
          </span>
        )}
      </div>

      {/* Security verification icon */}
      <div className="mt-4 text-brand-on-surface-variant/30 hover:text-brand-on-surface-variant transition-colors cursor-help" title="SSL Encrypted Communications">
        <ShieldCheck size={16} />
      </div>
    </aside>
  );
}
