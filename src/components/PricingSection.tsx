import { useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { Calculator, Download, Mail, MessageCircle, Printer } from 'lucide-react';

interface PricingSectionProps {
  onOpenQuoteForm: (defaultService: string, defaultArea?: number) => void;
}

type PricingItem = {
  label: string;
  rate: number | null;
  unit: string;
  service: string;
};

const pricingGroups: { title: string; items: PricingItem[] }[] = [
  {
    title: 'Planning & Design',
    items: [
      { label: 'Standard 2D Floor Plan', rate: 3, unit: '/sq.ft', service: 'Standard 2D Floor Plan' },
      { label: 'Vastu Floor Plan', rate: 5, unit: '/sq.ft', service: 'Vastu Floor Plan' },
      { label: 'Working Drawings', rate: 8, unit: '/sq.ft onwards', service: 'Working Drawings' },
      { label: 'Municipal Drawings', rate: 5, unit: '/sq.ft onwards', service: 'Municipal Drawings' },
    ],
  },
  {
    title: '3D Services',
    items: [
      { label: '3D Front Elevation', rate: 30, unit: '/sq.ft onwards', service: '3D Front Elevation' },
      { label: '3D Floor Plan', rate: 5, unit: '/sq.ft', service: '3D Floor Plan' },
      { label: 'Exterior Rendering', rate: 20, unit: '/sq.ft onwards', service: 'Exterior Rendering' },
      { label: 'Interior Design', rate: 20, unit: '/sq.ft onwards', service: 'Interior Design' },
      { label: 'Walkthrough', rate: null, unit: 'Custom Quote', service: 'Walkthrough' },
    ],
  },
  {
    title: 'Structural',
    items: [
      { label: 'Structural Drawings', rate: 1, unit: '/sq.ft', service: 'Structural Drawings' },
      { label: 'RCC Detailing', rate: 1, unit: '/sq.ft onwards', service: 'RCC Detailing' },
      { label: 'BOQ', rate: 1, unit: '/sq.ft onwards', service: 'BOQ' },
    ],
  },
  {
    title: 'MEP',
    items: [
      { label: 'Electrical', rate: 2, unit: '/sq.ft', service: 'Electrical Layout' },
      { label: 'Plumbing', rate: 2, unit: '/sq.ft', service: 'Plumbing Layout' },
      { label: 'Electrical + Plumbing', rate: 3, unit: '/sq.ft', service: 'Electrical + Plumbing' },
    ],
  },
  {
    title: 'Packages',
    items: [
      { label: 'Planning + Structural + Electrical + Plumbing', rate: 10, unit: '/sq.ft onwards', service: 'Planning + Structural + MEP' },
      { label: 'Complete Architectural Package', rate: 15, unit: '/sq.ft onwards', service: 'Complete Architectural Package' },
      { label: 'Premium Package', rate: 20, unit: '/sq.ft onwards', service: 'Premium Package' },
    ],
  },
];

const calculatorOptions = pricingGroups.flatMap((group) =>
  group.items
    .filter((item) => item.rate !== null)
    .map((item) => ({
      ...item,
      group: group.title,
      rate: item.rate as number,
    }))
);

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value);

export default function PricingSection({ onOpenQuoteForm }: PricingSectionProps) {
  const [selectedService, setSelectedService] = useState(calculatorOptions[0].service);
  const [area, setArea] = useState(1000);
  const [includeGst, setIncludeGst] = useState(false);

  const selected = calculatorOptions.find((item) => item.service === selectedService) || calculatorOptions[0];

  const quote = useMemo(() => {
    const base = Math.max(area, 0) * selected.rate;
    const gst = includeGst ? base * 0.18 : 0;
    const discount = 0;
    const total = base + gst - discount;
    return { base, gst, discount, total };
  }, [area, includeGst, selected.rate]);

  const quoteText = `NVS Buildcon Quote%0AService: ${encodeURIComponent(selected.service)}%0AArea: ${area} sq.ft%0ARate: Rs ${selected.rate}/sq.ft%0AEstimated Price: ${encodeURIComponent(formatCurrency(quote.base))}%0AGST: ${encodeURIComponent(formatCurrency(quote.gst))}%0ATotal: ${encodeURIComponent(formatCurrency(quote.total))}`;

  const printQuote = () => window.print();

  const downloadQuote = () => {
    const content = [
      'NVS Buildcon - Estimate',
      `Service: ${selected.service}`,
      `Area: ${area} sq.ft`,
      `Rate: Rs ${selected.rate}/sq.ft`,
      `Estimated Price: ${formatCurrency(quote.base)}`,
      `GST: ${formatCurrency(quote.gst)}`,
      `Discount: ${formatCurrency(quote.discount)}`,
      `Total Amount: ${formatCurrency(quote.total)}`,
      '',
      'This is an indicative estimate. Final quotation depends on project scope and site requirements.',
    ].join('\n');
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'nvs-buildcon-quotation.txt';
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <section className="section-padding bg-brand-surface relative overflow-hidden" id="pricing-section">
      <div className="absolute inset-0 blueprint-bg opacity-[0.02] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 md:px-16 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-14 space-y-4">
          <span className="inline-block px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-brand-gold bg-brand-gold/10 rounded-full">
            Pricing
          </span>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-brand-on-surface">
            Clear starting prices for planning and design.
          </h2>
          <p className="text-sm text-brand-on-surface-variant/80 leading-relaxed">
            Rates are based on the NVS Buildcon architectural and design services price list.
            Final quotation may change based on site scope and drawing requirements.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-14">
          {pricingGroups.map((group, index) => (
            <motion.div
              key={group.title}
              initial={{ opacity: 0, y: 22 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.45, delay: index * 0.04 }}
              className="bg-brand-surface-container/35 border border-white/5 rounded-2xl p-6 hover:border-brand-gold/25 transition-all duration-300"
            >
              <h3 className="font-display text-sm font-bold uppercase tracking-widest text-white mb-5">{group.title}</h3>
              <div className="space-y-4">
                {group.items.map((item) => (
                  <div key={item.label} className="border-b border-white/5 pb-3 last:border-b-0 last:pb-0">
                    <p className="text-sm text-brand-on-surface/90 leading-snug">{item.label}</p>
                    <p className="font-display text-lg font-black text-brand-gold mt-1">
                      {item.rate === null ? item.unit : `₹${item.rate}`}
                      {item.rate !== null && <span className="text-[10px] font-semibold text-brand-on-surface-variant/55 ml-1">{item.unit}</span>}
                    </p>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="max-w-5xl mx-auto bg-brand-surface-container border border-white/10 rounded-2xl p-7 md:p-9 shadow-2xl relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brand-gold/20 via-brand-gold to-brand-gold/20" />
          <div className="flex items-center gap-3 mb-8">
            <span className="p-2.5 bg-brand-gold/10 text-brand-gold rounded-lg"><Calculator size={18} /></span>
            <div>
              <h3 className="font-display text-base font-black uppercase tracking-wider text-white">Price Calculator</h3>
              <p className="text-[10px] text-brand-on-surface-variant/55 uppercase tracking-widest">Estimate cost by service and area</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-5">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-brand-on-surface-variant/70 mb-2">
                  Service
                </label>
                <select
                  value={selectedService}
                  onChange={(event) => setSelectedService(event.target.value)}
                  className="w-full bg-brand-surface-lowest text-brand-on-surface text-sm px-4 py-3 rounded-lg border border-white/10 focus:border-brand-gold focus:outline-none"
                >
                  {calculatorOptions.map((item) => (
                    <option key={item.service} value={item.service}>
                      {item.group} - {item.label} (₹{item.rate}/sq.ft)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-brand-on-surface-variant/70 mb-2">
                  Area (sq.ft)
                </label>
                <input
                  type="number"
                  min="1"
                  value={area}
                  onChange={(event) => setArea(Number(event.target.value))}
                  className="w-full bg-brand-surface-lowest text-brand-on-surface text-sm px-4 py-3 rounded-lg border border-white/10 focus:border-brand-gold focus:outline-none"
                />
              </div>

              <label className="flex items-center gap-3 text-sm text-brand-on-surface-variant/85">
                <input
                  type="checkbox"
                  checked={includeGst}
                  onChange={(event) => setIncludeGst(event.target.checked)}
                  className="accent-brand-gold"
                />
                Include GST estimate at 18%
              </label>

              <div className="p-4 bg-brand-surface-lowest/60 border border-white/5 rounded-xl">
                <p className="text-[10px] uppercase tracking-widest text-brand-on-surface-variant/55 mb-1">Admin Discount</p>
                <p className="text-sm text-brand-on-surface-variant/85">Available from admin quotation tools only.</p>
              </div>
            </div>

            <div className="bg-brand-surface-lowest/70 border border-white/5 rounded-2xl p-6">
              <p className="text-[10px] uppercase tracking-widest text-brand-on-surface-variant/55 mb-4">Result</p>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between gap-4">
                  <span className="text-brand-on-surface-variant">Estimated Price</span>
                  <strong className="text-white">{formatCurrency(quote.base)}</strong>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-brand-on-surface-variant">GST</span>
                  <strong className="text-white">{formatCurrency(quote.gst)}</strong>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-brand-on-surface-variant">Discount</span>
                  <strong className="text-white">{formatCurrency(quote.discount)}</strong>
                </div>
                <div className="border-t border-white/8 pt-4 mt-4 flex justify-between gap-4">
                  <span className="font-display text-xs uppercase tracking-widest text-brand-gold">Total Amount</span>
                  <strong className="font-display text-2xl text-brand-gold">{formatCurrency(quote.total)}</strong>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mt-7">
                <button onClick={downloadQuote} className="px-3 py-2.5 bg-brand-gold text-[#0a0f18] rounded-lg text-[9px] font-black uppercase tracking-widest flex items-center justify-center gap-1.5">
                  <Download size={12} /> PDF Quote
                </button>
                <button
                  onClick={() => window.open(`https://wa.me/918009363259?text=${quoteText}`, '_blank', 'noopener,noreferrer')}
                  className="px-3 py-2.5 border border-brand-gold/30 text-brand-gold rounded-lg text-[9px] font-black uppercase tracking-widest flex items-center justify-center gap-1.5"
                >
                  <MessageCircle size={12} /> WhatsApp
                </button>
                <a
                  href={`mailto:?subject=NVS Buildcon Quotation&body=Service: ${selected.service}%0AArea: ${area} sq.ft%0ATotal: ${formatCurrency(quote.total)}`}
                  className="px-3 py-2.5 border border-white/10 text-brand-on-surface rounded-lg text-[9px] font-black uppercase tracking-widest flex items-center justify-center gap-1.5"
                >
                  <Mail size={12} /> Email
                </a>
                <button onClick={printQuote} className="px-3 py-2.5 border border-white/10 text-brand-on-surface rounded-lg text-[9px] font-black uppercase tracking-widest flex items-center justify-center gap-1.5">
                  <Printer size={12} /> Print
                </button>
              </div>

              <button
                onClick={() => onOpenQuoteForm(selected.service, area)}
                className="w-full mt-4 py-3 bg-brand-surface-highest hover:bg-brand-gold hover:text-[#0a0f18] border border-white/10 hover:border-transparent rounded-lg text-[10px] font-bold font-display uppercase tracking-widest transition-all duration-300"
              >
                Request Detailed Quote
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
