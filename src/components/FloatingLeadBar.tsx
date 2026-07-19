import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageCircle, Phone, Zap, X, ChevronUp } from 'lucide-react';

interface FloatingLeadBarProps {
  onOpenInquiry: () => void;
  onOpenCallback: () => void;
  onOpenConsultation: () => void;
}

export default function FloatingLeadBar({
  onOpenInquiry,
  onOpenCallback,
  onOpenConsultation,
}: FloatingLeadBarProps) {
  const [expanded, setExpanded] = useState(false);

  const openWhatsApp = () => {
    window.open(
      'https://wa.me/918009363259?text=Hi%2C%20I%27d%20like%20to%20discuss%20my%20construction%20or%20design%20project%20with%20NVS%20Buildcon.',
      '_blank',
      'noopener,noreferrer'
    );
  };

  const actions = [
    {
      id: 'whatsapp',
      label: 'WhatsApp Us',
      icon: <MessageCircle size={16} />,
      color: 'bg-[#25D366] hover:bg-[#1ebe5d] text-white',
      onClick: openWhatsApp,
    },
    {
      id: 'callback',
      label: 'Request Callback',
      icon: <Phone size={16} />,
      color: 'bg-brand-surface-highest hover:bg-brand-surface-high border border-brand-gold/30 hover:border-brand-gold/60 text-brand-gold',
      onClick: onOpenCallback,
    },
    {
      id: 'quote',
      label: 'Free Quote',
      icon: <Zap size={16} />,
      color: 'bg-brand-gold hover:bg-brand-gold/90 text-[#0a0f18]',
      onClick: onOpenInquiry,
    },
  ];

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col items-end gap-3">
      {/* Expanded action buttons */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.92 }}
            transition={{ duration: 0.22, ease: [0.25, 1, 0.5, 1] }}
            className="flex flex-col gap-2.5 items-end"
          >
            {/* Book Consultation pill */}
            <button
              onClick={() => { onOpenConsultation(); setExpanded(false); }}
              className="flex items-center gap-2 px-4 py-2.5 bg-brand-surface-highest border border-brand-gold/30 hover:border-brand-gold text-brand-gold text-xs font-bold font-display uppercase tracking-widest rounded-full shadow-xl transition-all hover:scale-105 whitespace-nowrap"
              aria-label="Book Consultation"
            >
              Book Consultation
            </button>

            {actions.map((action) => (
              <button
                key={action.id}
                onClick={() => { action.onClick(); setExpanded(false); }}
                className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold font-display uppercase tracking-widest rounded-full shadow-xl transition-all hover:scale-105 whitespace-nowrap ${action.color}`}
                aria-label={action.label}
              >
                {action.icon}
                {action.label}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toggle button */}
      <motion.button
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setExpanded((prev) => !prev)}
        className="relative w-14 h-14 bg-brand-gold text-[#0a0f18] rounded-full shadow-2xl shadow-brand-gold/30 flex items-center justify-center transition-all"
        aria-label="Lead generation actions"
        aria-expanded={expanded}
      >
        <AnimatePresence mode="wait">
          {expanded ? (
            <motion.span
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <X size={22} />
            </motion.span>
          ) : (
            <motion.span
              key="open"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <ChevronUp size={22} />
            </motion.span>
          )}
        </AnimatePresence>

        {/* Pulse ring */}
        {!expanded && (
          <span className="absolute inset-0 rounded-full animate-ping bg-brand-gold/30 pointer-events-none" />
        )}
      </motion.button>
    </div>
  );
}
