import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { FileText, Download, Eye, Search, Compass, Heart, Sparkles } from 'lucide-react';
import { BLUEPRINTS_DATA } from '../data';
import { isAuthenticated } from '../utils/auth';
import { apiFetch } from '../utils/api';

interface HousePlansProps {
  onInquire: (blueprintTitle?: string) => void;
}

export default function HousePlans({ onInquire }: HousePlansProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  
  const [plans, setPlans] = useState<any[]>(BLUEPRINTS_DATA);
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    const fetchDatabasePlans = async () => {
      try {
        const res = await apiFetch('/api/house-plans');
        if (res.ok) {
          const d = await res.json();
          if (d.success && d.data && d.data.length > 0) {
            setPlans(d.data);
          }
        }
      } catch { /* fallback to static blueprints data */ }
    };

    const fetchSavedPlans = async () => {
      if (isAuthenticated()) {
        try {
          const res = await apiFetch('/api/user/saved-plans');
          if (res.ok) {
            const d = await res.json();
            if (d.success) {
              setSavedIds((d.data || []).map((p: any) => p._id || p.id));
            }
          }
        } catch { /* ignore */ }
      }
    };

    fetchDatabasePlans();
    fetchSavedPlans();
  }, []);

  const toggleSavePlan = async (plan: any) => {
    if (!isAuthenticated()) {
      setToastMessage('Please login to save plans');
      setTimeout(() => setToastMessage(null), 3000);
      return;
    }

    const idToToggle = plan._id || plan.id;
    const isSaved = savedIds.includes(idToToggle);

    try {
      if (isSaved) {
        const res = await apiFetch(`/api/user/saved-plans/${idToToggle}`, {
          method: 'DELETE'
        });
        if (res.ok) {
          setSavedIds(prev => prev.filter(id => id !== idToToggle));
          setToastMessage('Plan removed from saved plans');
        }
      } else {
        const res = await apiFetch('/api/user/saved-plans', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ planId: idToToggle })
        });
        if (res.ok) {
          setSavedIds(prev => [...prev, idToToggle]);
          setToastMessage('Plan saved successfully!');
        }
      }
      setTimeout(() => setToastMessage(null), 3000);
    } catch {
      setToastMessage('An error occurred. Try again.');
      setTimeout(() => setToastMessage(null), 3000);
    }
  };

  const categories = ['All', '20x30', '30x40', '40x60', 'Duplex', 'Villa', 'Commercial'];

  const getPlanCategory = (plan: any) => {
    const text = `${plan.title} ${plan.category} ${plan.description}`.toLowerCase();
    if (text.includes('commercial') || text.includes('epd')) return 'Commercial';
    if (text.includes('duplex')) return 'Duplex';
    if (text.includes('villa') || text.includes('residential')) return 'Villa';
    if (text.includes('kitchen') || text.includes('bedroom') || text.includes('living')) return '30x40';
    if (text.includes('layout 7')) return '20x30';
    return '40x60';
  };

  const filteredPlans = plans.filter((plan) => {
    const matchesSearch = plan.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          plan.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          getPlanCategory(plan).toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || getPlanCategory(plan) === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleDownload = (pdfUrl: string, fileName: string) => {
    const link = document.createElement('a');
    link.href = pdfUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="text-brand-on-surface min-h-screen bg-brand-surface pt-28 pb-20 px-6 md:px-16">
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 50, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: 20, x: '-50%' }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 px-6 py-3 bg-[#111827] border border-brand-gold/30 text-white text-xs font-bold rounded-full shadow-2xl z-50 flex items-center gap-2"
          >
            <Sparkles size={14} className="text-brand-gold" />
            {toastMessage}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Page Header */}
      <section className="max-w-7xl mx-auto text-center mb-16">
        <span className="inline-block px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-brand-gold bg-brand-gold/10 rounded-full mb-4">
          House Plans
        </span>
        <h1 className="font-display text-4xl md:text-5xl font-bold tracking-tight text-white mb-4">
          House Plans & Drawings
        </h1>
        <p className="text-sm text-brand-on-surface-variant max-w-lg mx-auto font-serif italic">
          Search plans by size, project type, and drawing category. Download available PDFs or request a custom plan.
        </p>
        <div className="gold-line mt-8 w-24 mx-auto" />
      </section>

      {/* Search and Filter Section */}
      <section className="max-w-7xl mx-auto mb-12">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 bg-brand-surface-container/30 border border-white/5 p-6 rounded-2xl">
          {/* Filters */}
          <div className="flex flex-wrap gap-2 justify-center md:justify-start w-full md:w-auto">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                aria-pressed={selectedCategory === cat}
                aria-label={`Filter house plans by ${cat}`}
                className={`px-4 py-2.5 rounded-xl text-[10px] font-bold font-display uppercase tracking-widest transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-brand-gold/50 ${
                  selectedCategory === cat
                    ? 'bg-brand-gold text-[#0a0f18] shadow-lg shadow-brand-gold/10'
                    : 'bg-brand-surface-container border border-white/5 text-brand-on-surface-variant/80 hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search Bar */}
          <div className="relative w-full md:w-80">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-brand-on-surface-variant/50">
              <Search size={14} />
            </span>
            <input
              type="text"
              placeholder="Search plans, size, or type..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Search house plans"
              className="w-full bg-brand-surface-lowest text-brand-on-surface placeholder:text-brand-on-surface-variant/40 pl-10 pr-4 py-2.5 rounded-lg border border-white/5 focus:border-brand-gold/50 focus:ring-2 focus:ring-brand-gold/30 text-xs focus:outline-none transition-all"
            />
          </div>
        </div>
      </section>

      {/* Plans Grid */}
      <section className="max-w-7xl mx-auto">
        {filteredPlans.length === 0 ? (
          <div className="p-16 text-center border border-white/5 rounded-2xl bg-brand-surface-container/10">
            <Compass className="mx-auto mb-4 text-brand-gold/30 animate-pulse" size={40} />
            <h3 className="font-display text-base font-bold text-white mb-2 uppercase tracking-wider">No Plans Found</h3>
            <p className="text-xs text-brand-on-surface-variant max-w-xs mx-auto">
              We could not find a matching plan. Contact us for a custom house plan.
            </p>
            <button
              onClick={() => onInquire()}
              className="mt-6 px-6 py-2.5 bg-brand-gold text-[#0a0f18] text-xs font-bold font-display uppercase tracking-widest rounded-lg hover:scale-105 transition-all shadow-lg shadow-brand-gold/5"
            >
              Request Custom Plan
            </button>
          </div>
        ) : (
          <motion.div 
            layout
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            <AnimatePresence mode="popLayout">
              {filteredPlans.map((plan, index) => (
                <motion.div
                  key={plan._id || plan.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.4, delay: index * 0.02 }}
                  className="group flex flex-col justify-between bg-brand-surface-container/30 border border-white/5 rounded-2xl overflow-hidden hover:border-brand-gold/30 transition-all duration-700 shadow-xl relative hover:shadow-2xl hover:shadow-brand-gold/5"
                >
                  {/* Thumbnail Header */}
                  <div className="relative h-48 overflow-hidden bg-brand-surface-lowest">
                    <img
                      src={plan.imageUrl}
                      alt={plan.title}
                      className="w-full h-full object-cover transition-transform duration-[1.2s] ease-out group-hover:scale-110 brightness-[0.85] group-hover:brightness-100"
                      loading="lazy"
                      decoding="async"
                    />
                    <div className="absolute top-4 left-4 glass-gold border border-brand-gold/20 px-2.5 py-1 rounded text-[9px] font-bold font-display uppercase tracking-wider text-brand-gold">
                      {getPlanCategory(plan)}
                    </div>
                    
                    {/* Bookmark Toggle Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleSavePlan(plan);
                      }}
                      aria-label={savedIds.includes(plan._id || plan.id) ? `Remove ${plan.title} from saved plans` : `Save ${plan.title} to plans`}
                      aria-pressed={savedIds.includes(plan._id || plan.id)}
                      className="absolute top-4 right-4 p-2 rounded-full glass-panel border border-white/10 hover:border-brand-gold/40 text-brand-on-surface-variant hover:text-brand-gold transition-all duration-300 z-10 focus:outline-none focus:ring-2 focus:ring-brand-gold/50"
                    >
                      <Heart
                        size={14}
                        className={savedIds.includes(plan._id || plan.id) ? "fill-red-500 text-red-500" : "text-white"}
                      />
                    </button>

                    <div className="absolute inset-0 bg-gradient-to-t from-brand-surface-lowest via-transparent to-transparent opacity-70"></div>
                  </div>

                  {/* Body Details */}
                  <div className="p-6 flex-grow flex flex-col justify-between">
                    <div>
                      <h3 className="font-display text-sm font-bold text-white mb-3 group-hover:text-brand-gold transition-colors uppercase tracking-wide truncate">
                        {plan.title}
                      </h3>
                      <p className="font-serif text-xs text-brand-on-surface-variant/85 leading-relaxed mb-6 h-12 overflow-hidden line-clamp-3 font-light">
                        {plan.description}
                      </p>
                    </div>

                    {/* Tech Specs Summary */}
                    {plan.specs && (
                      <div className="border-t border-white/5 pt-4 mb-6 space-y-2">
                        {plan.specs.foundation && (
                          <div className="flex justify-between items-center text-[10px] text-brand-on-surface-variant/80">
                            <span className="font-semibold uppercase tracking-wider">Drawing:</span>
                            <span className="text-white/90 font-mono truncate max-w-[150px]">{plan.specs.foundation}</span>
                          </div>
                        )}
                        {plan.specs.superstructure && (
                          <div className="flex justify-between items-center text-[10px] text-brand-on-surface-variant/80">
                            <span className="font-semibold uppercase tracking-wider">Details:</span>
                            <span className="text-white/90 font-mono truncate max-w-[150px]">{plan.specs.superstructure}</span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Actions */}
                    <div className="grid grid-cols-2 gap-3 mt-auto">
                      <a
                        href={plan.pdfUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2.5 bg-brand-surface-lowest border border-white/10 hover:border-brand-gold/30 rounded-lg text-[9px] font-bold font-display uppercase tracking-widest text-center flex items-center justify-center gap-1.5 hover:text-brand-gold transition-all"
                      >
                        <Eye size={12} /> View PDF
                      </a>
                      <button
                        onClick={() => handleDownload(plan.pdfUrl, plan.pdfUrl.split('/').pop() || 'plan.pdf')}
                        className="px-4 py-2.5 bg-brand-gold text-[#0a0f18] rounded-lg text-[9px] font-bold font-display uppercase tracking-widest text-center flex items-center justify-center gap-1.5 shadow-lg shadow-brand-gold/5 transition-all hover:scale-[1.02]"
                      >
                        <Download size={12} /> Download
                      </button>
                    </div>

                    {/* Inquire Shortcut */}
                    <button
                      onClick={() => onInquire(plan.title)}
                      className="w-full mt-4 text-center text-[9px] font-bold font-display uppercase tracking-widest text-brand-on-surface-variant/60 hover:text-brand-gold transition-colors"
                    >
                      Request Custom Plan
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </section>
    </div>
  );
}
