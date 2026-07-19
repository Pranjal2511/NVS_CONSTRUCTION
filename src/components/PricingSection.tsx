import React, { useMemo, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Calculator, Download, Mail, MessageCircle, Printer, CheckCircle, ChevronDown, ChevronUp, FileText, Sparkles } from 'lucide-react';
import { apiFetch } from '../utils/api';

interface PricingSectionProps {
  onOpenQuoteForm: (defaultService: string, defaultArea?: number) => void;
}

type PricingItem = {
  label: string;
  rate: number | null;
  unit: string;
  service: string;
};

const DEFAULT_PRICING_GROUPS = [
  {
    title: 'Planning & Design',
    startingRate: '₹3/sq.ft',
    items: [
      { label: 'Standard 2D Floor Plan', rate: 3, unit: '/sq.ft', service: 'Standard 2D Floor Plan' },
      { label: 'Vastu-Compliant 2D Floor Plan', rate: 5, unit: '/sq.ft', service: 'Vastu-Compliant 2D Floor Plan' },
      { label: 'Working Drawings Package', rate: 8, unit: '/sq.ft onwards', service: 'Working Drawings Package' },
      { label: 'Municipal Submission Drawings', rate: 5, unit: '/sq.ft onwards', service: 'Municipal Submission Drawings' },
    ],
  },
  {
    title: '3D Services',
    startingRate: '₹5/sq.ft',
    items: [
      { label: '3D Front Elevation Design', rate: 30, unit: '/sq.ft onwards', service: '3D Front Elevation Design' },
      { label: '3D Floor Plan Rendering', rate: 5, unit: '/sq.ft', service: '3D Floor Plan Rendering' },
      { label: 'Exterior 3D Views & Rendering', rate: 20, unit: '/sq.ft onwards', service: 'Exterior 3D Views & Rendering' },
      { label: 'Interior Design with 3D Views', rate: 20, unit: '/sq.ft onwards', service: 'Interior Design with 3D Views' },
      { label: 'Walkthrough Animation', rate: null, unit: 'Custom Quote', service: 'Walkthrough Animation' },
    ],
  },
  {
    title: 'Structural',
    startingRate: '₹1/sq.ft',
    items: [
      { label: 'Structural Drawings (Column, Beam, Footing & Slab Layout)', rate: 1, unit: '/sq.ft', service: 'Structural Drawings' },
      { label: 'RCC Detailing & Reinforcement Drawings', rate: 1, unit: '/sq.ft onwards', service: 'RCC Detailing' },
      { label: 'BOQ & Quantity Estimation', rate: 1, unit: '/sq.ft onwards', service: 'BOQ' },
    ],
  },
  {
    title: 'MEP',
    startingRate: '₹2/sq.ft',
    items: [
      { label: 'Electrical Layout', rate: 2, unit: '/sq.ft', service: 'Electrical Layout' },
      { label: 'Plumbing Layout', rate: 2, unit: '/sq.ft', service: 'Plumbing Layout' },
      { label: 'Electrical + Plumbing Package', rate: 3, unit: '/sq.ft', service: 'Electrical + Plumbing Package' },
    ],
  },
  {
    title: 'Packages',
    startingRate: '₹10/sq.ft',
    items: [
      { label: 'Planning + Vastu + Structural + Electrical + Plumbing', rate: 10, unit: '/sq.ft onwards', service: 'Planning + Vastu + Structural + MEP' },
      { label: 'Complete Architectural Package (2D + 3D + Working Drawings)', rate: 15, unit: '/sq.ft onwards', service: 'Complete Architectural Package' },
      { label: 'Premium End-to-End Design Package', rate: 20, unit: '/sq.ft onwards', service: 'Premium Design Package' },
    ],
  },
];

const includedFeatures = [
  'Floor Planning',
  'Furniture Layout',
  'Door & Window Schedule',
  'Vastu Consultation (if opted)',
  'Elevation Concepts',
  'Basic Revisions',
  'PDF & High-Quality Image Deliverables',
];

const paymentTerms = [
  { value: '40%', label: 'Advance to Start Work' },
  { value: '40%', label: 'After Design Approval' },
  { value: '20%', label: 'Before Final Delivery' },
];

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value);

export default function PricingSection({ onOpenQuoteForm }: PricingSectionProps) {
  const [pricingGroups, setPricingGroups] = useState(DEFAULT_PRICING_GROUPS);
  const [selectedService, setSelectedService] = useState('');
  const [area, setArea] = useState(1000);
  const [isTableExpanded, setIsTableExpanded] = useState(false);
  const [disclaimer, setDisclaimer] = useState('Rates listed are starting estimates per square foot of total built-up area. Final quotations depend on structural complexity, project scope, and specific site conditions.');

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await apiFetch('/api/settings');
        if (res.ok) {
          const data = await res.json();
          if (data.data) {
            if (data.data.pricingDisclaimer) {
              setDisclaimer(data.data.pricingDisclaimer);
            }
            if (data.data.customRates) {
              try {
                const parsed = JSON.parse(data.data.customRates);
                if (Array.isArray(parsed) && parsed.length > 0) {
                  setPricingGroups(parsed);
                }
              } catch (e) {
                console.error('Failed to parse customRates JSON', e);
              }
            }
          }
        }
      } catch (err) {
        console.error('Failed to load settings', err);
      }
    };
    fetchSettings();
  }, []);

  const calculatorOptions = useMemo(() => {
    return pricingGroups.flatMap((group) =>
      group.items
        .filter((item) => item.rate !== null)
        .map((item) => ({
          ...item,
          group: group.title,
          rate: item.rate as number,
        }))
    );
  }, [pricingGroups]);

  useEffect(() => {
    if (calculatorOptions.length > 0 && !selectedService) {
      setSelectedService(calculatorOptions[0].service);
    }
  }, [calculatorOptions, selectedService]);

  const selected = useMemo(() => {
    return calculatorOptions.find((item) => item.service === selectedService) || calculatorOptions[0] || { service: '', rate: 0, group: '' };
  }, [calculatorOptions, selectedService]);

  const quote = useMemo(() => {
    const rate = selected ? selected.rate : 0;
    const base = Math.max(area, 0) * rate;
    return { base, finalPrice: base };
  }, [area, selected]);

  const quoteText = `NVS Buildcon Quotation Estimate:%0A- Service: ${encodeURIComponent(selected.service)}%0A- Area: ${area} sq.ft%0A- Starting Rate: Rs ${selected.rate}/sq.ft%0A- Final Price Estimate: ${encodeURIComponent(formatCurrency(quote.finalPrice))}`;

  const downloadPDFQuote = () => {
    // Generate a printable/PDF formatted document layout
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>NVS Buildcon Quotation</title>
          <style>
            body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #1e293b; padding: 40px; line-height: 1.6; }
            .header { border-bottom: 2px solid #b45309; padding-bottom: 20px; margin-bottom: 30px; }
            .title { font-size: 24px; font-weight: bold; color: #0f172a; margin: 0; }
            .subtitle { font-size: 12px; color: #64748b; margin-top: 5px; text-transform: uppercase; letter-spacing: 1px; }
            .details-grid { display: grid; grid-template-cols: 1fr 1fr; gap: 20px; margin-bottom: 40px; }
            .section-title { font-size: 14px; font-weight: bold; text-transform: uppercase; color: #b45309; border-bottom: 1px solid #e2e8f0; padding-bottom: 5px; margin-bottom: 15px; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
            th { background-color: #f8fafc; font-weight: bold; text-align: left; padding: 10px; border-bottom: 1px solid #cbd5e1; font-size: 12px; text-transform: uppercase; }
            td { padding: 12px 10px; border-bottom: 1px solid #e2e8f0; font-size: 14px; }
            .total-row td { font-weight: bold; background-color: #f8fafc; font-size: 16px; border-top: 2px solid #cbd5e1; }
            .disclaimer { font-size: 11px; color: #64748b; border-top: 1px solid #e2e8f0; padding-top: 20px; margin-top: 40px; }
            .footer { margin-top: 50px; text-align: center; font-size: 12px; color: #94a3b8; }
            @media print {
              body { padding: 0; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="title">NVS BUILDCON &amp; ARCHITECTS</div>
            <div class="subtitle">Official Project Quotation Estimate</div>
          </div>
          <div class="details-grid">
            <div>
              <div class="section-title">Quotation Details</div>
              <div><strong>Date:</strong> ${new Date().toLocaleDateString()}</div>
              <div><strong>Valid For:</strong> 30 Days</div>
            </div>
            <div>
              <div class="section-title">Company Info</div>
              <div><strong>Phone:</strong> +91 8009363259</div>
              <div><strong>Email:</strong> nvsbuildcon@gmail.com</div>
              <div><strong>Instagram:</strong> @nishant.designs13</div>
            </div>
          </div>
          <div class="section-title">Cost breakdown</div>
          <table>
            <thead>
              <tr>
                <th>Item / Service</th>
                <th>Specifications</th>
                <th style="text-align: right;">Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>${selected.service}</strong></td>
                <td>Rate: ₹${selected.rate}/sq.ft | Plot Area: ${area} sq.ft</td>
                <td style="text-align: right;">${formatCurrency(quote.base)}</td>
              </tr>
              <tr class="total-row">
                <td colspan="2">Final Price Estimate</td>
                <td style="text-align: right; color: #b45309;">${formatCurrency(quote.finalPrice)}</td>
              </tr>
            </tbody>
          </table>
          <div class="disclaimer">
            <strong>Please Note:</strong> ${disclaimer}
          </div>
          <div class="footer">
            Smart Planning &bull; Modern Design &bull; Practical Construction
          </div>
          <div class="no-print" style="margin-top: 30px; text-align: center;">
            <button onclick="window.print()" style="padding: 10px 20px; background-color: #b45309; color: white; border: none; font-weight: bold; cursor: pointer; border-radius: 4px;">Print to PDF</button>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const printQuote = downloadPDFQuote;

  return (
    <section className="section-padding bg-brand-surface relative overflow-hidden" id="pricing-section">
      <div className="absolute inset-0 blueprint-bg opacity-[0.02] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 md:px-16 relative z-10">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <span className="inline-block px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-brand-gold bg-brand-gold/10 rounded-full">
            Pricing Guide
          </span>
          <h2 className="font-display text-3xl md:text-5xl font-bold text-white tracking-tight">
            Transparent starting prices for planning &amp; design.
          </h2>
          <p className="text-sm text-brand-on-surface-variant/80 max-w-xl mx-auto leading-relaxed">
            NVS Buildcon offers clear, square-foot-based pricing matching our official rate catalog. Find standard services, modular options, or comprehensive packages.
          </p>
        </div>

        {/* Professional Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-16">
          {pricingGroups.map((group, index) => (
            <motion.div
              key={group.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
              className="bg-brand-surface-container/30 border border-white/5 rounded-2xl p-6 flex flex-col justify-between hover:border-brand-gold/25 hover:-translate-y-1 transition-all duration-300 shadow-xl relative overflow-hidden group"
            >
              <div>
                <span className="text-[10px] font-mono text-brand-gold/60 uppercase tracking-widest block mb-1">Starting From</span>
                <p className="font-display text-2xl font-black text-white mb-4">
                  {group.startingRate}
                </p>
                <div className="h-px bg-white/5 mb-4" />
                <h3 className="font-display text-sm font-bold uppercase tracking-wider text-brand-gold mb-4">{group.title}</h3>
                <ul className="space-y-3">
                  {group.items.slice(0, 4).map((item) => (
                    <li key={item.label} className="text-xs text-brand-on-surface-variant/90 leading-snug">
                      <span className="font-semibold block text-white/90">{item.label}</span>
                      <span className="text-[10px] text-brand-gold font-mono">
                        {item.rate === null ? item.unit : `₹${item.rate}${item.unit}`}
                      </span>
                    </li>
                  ))}
                  {group.items.length > 4 && (
                    <li className="text-[10px] text-brand-on-surface-variant/40 italic">
                      + {group.items.length - 4} more service options
                    </li>
                  )}
                </ul>
              </div>
              <button
                onClick={() => onOpenQuoteForm(group.title)}
                className="mt-6 w-full py-2.5 bg-brand-surface-highest hover:bg-brand-gold hover:text-[#0a0f18] border border-white/10 hover:border-transparent rounded-lg text-[9px] font-bold font-display uppercase tracking-widest transition-all duration-200"
              >
                Inquire Rates
              </button>
            </motion.div>
          ))}
        </div>

        {/* Expandable Pricing Table Trigger */}
        <div className="max-w-5xl mx-auto mb-16 text-center">
          <button
            onClick={() => setIsTableExpanded(!isTableExpanded)}
            className="px-6 py-3 bg-brand-surface-container/50 hover:bg-brand-surface-container border border-white/5 hover:border-brand-gold/20 rounded-xl text-xs font-bold font-display uppercase tracking-widest transition-all duration-300 inline-flex items-center gap-2"
          >
            {isTableExpanded ? (
              <>
                Hide Detailed Rate Table <ChevronUp size={14} />
              </>
            ) : (
              <>
                View Expandable Detailed Rate Table <ChevronDown size={14} />
              </>
            )}
          </button>

          <AnimatePresence>
            {isTableExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.35 }}
                className="overflow-hidden mt-6 text-left"
              >
                <div className="bg-[#050a12]/80 border border-white/10 rounded-2xl overflow-x-auto shadow-2xl p-6">
                  <table className="w-full text-left border-collapse text-xs md:text-sm">
                    <thead>
                      <tr className="border-b border-white/10 text-brand-gold font-display uppercase tracking-widest text-[10px]">
                        <th className="py-3 px-4">Service Description</th>
                        <th className="py-3 px-4 text-right">Rates &amp; Charges</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 text-brand-on-surface-variant">
                      {pricingGroups.map((group) => (
                        <React.Fragment key={group.title}>
                          <tr className="bg-brand-surface-container/20">
                            <td colSpan={2} className="py-3 px-4 font-bold text-white uppercase tracking-wider text-[11px] font-display">
                              {group.title}
                            </td>
                          </tr>
                          {group.items.map((item) => (
                            <tr key={item.label} className="hover:bg-white/[0.02] transition-colors">
                              <td className="py-3 px-6">{item.label}</td>
                              <td className="py-3 px-4 text-right font-mono text-brand-gold font-bold">
                                {item.rate === null ? item.unit : `₹${item.rate}${item.unit}`}
                              </td>
                            </tr>
                          ))}
                        </React.Fragment>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Features Checklist & Payment Terms Grid */}
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-8 mb-16">
          {/* Design Features checklist */}
          <div className="md:col-span-7 bg-[#050a12]/50 border border-white/5 rounded-2xl p-8">
            <h3 className="font-display text-sm font-bold uppercase tracking-widest text-white mb-6 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-brand-gold" /> Included in Design Services
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {includedFeatures.map((feature) => (
                <div key={feature} className="flex items-center gap-2.5 text-xs text-brand-on-surface-variant">
                  <CheckCircle size={14} className="text-brand-gold shrink-0" />
                  <span>{feature}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Payment Terms card */}
          <div className="md:col-span-5 bg-[#050a12]/50 border border-white/5 rounded-2xl p-8 flex flex-col justify-between">
            <div>
              <h3 className="font-display text-sm font-bold uppercase tracking-widest text-white mb-6 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-brand-gold" /> Payment Terms
              </h3>
              <div className="space-y-4">
                {paymentTerms.map((term, index) => (
                  <div key={term.label} className="flex items-center gap-4">
                    <span className="font-display text-2xl font-black text-brand-gold min-w-14">{term.value}</span>
                    <div className="text-xs">
                      <p className="text-[9px] uppercase tracking-widest text-white/40">Stage {index + 1}</p>
                      <p className="text-brand-on-surface-variant font-medium">{term.label}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Premium Calculator Section */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="max-w-5xl mx-auto bg-brand-surface-container border border-white/10 rounded-3xl p-8 md:p-10 shadow-2xl relative overflow-hidden mb-12"
        >
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brand-gold/20 via-brand-gold to-brand-gold/20" />
          <div className="flex items-center gap-3 mb-8">
            <span className="p-3 bg-brand-gold/10 text-brand-gold rounded-xl"><Calculator size={22} /></span>
            <div>
              <h3 className="font-display text-lg font-black uppercase tracking-wider text-white">Premium Price Calculator</h3>
              <p className="text-[10px] text-brand-on-surface-variant/55 uppercase tracking-widest">Compute exact design quotes with custom tax and discounts</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            {/* INPUTS COLUMN */}
            <div className="lg:col-span-6 space-y-6">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-brand-on-surface-variant/70 mb-2">
                  Select Design Service
                </label>
                <select
                  value={selectedService}
                  onChange={(event) => setSelectedService(event.target.value)}
                  className="w-full bg-brand-surface-lowest text-brand-on-surface text-sm px-4 py-3.5 rounded-xl border border-white/10 focus:border-brand-gold focus:outline-none transition-colors"
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
                  Plot Built-Up Area (sq.ft)
                </label>
                <input
                  type="number"
                  min="1"
                  value={area}
                  onChange={(event) => setArea(Number(event.target.value))}
                  className="w-full bg-brand-surface-lowest text-brand-on-surface text-sm px-4 py-3.5 rounded-xl border border-white/10 focus:border-brand-gold focus:outline-none transition-colors"
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-brand-surface-lowest/50 border border-white/5 rounded-xl">
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-white uppercase tracking-wider">Note</span>
                  <span className="text-[10px] text-brand-on-surface-variant/55">GST applicable separately as per government norms</span>
                </div>
              </div>
            </div>

            {/* OUTPUTS COLUMN */}
            <div className="lg:col-span-6 bg-brand-surface-lowest/70 border border-white/8 rounded-2xl p-6 md:p-8 flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-mono text-brand-gold/60 uppercase tracking-widest block mb-4">Calculated Quote Overview</span>
                
                <div className="space-y-4 text-xs md:text-sm">
                  <div className="pt-4 flex justify-between items-center gap-4">
                    <span className="font-display text-sm uppercase tracking-wider text-brand-gold font-black">Final Price</span>
                    <strong className="font-display text-3xl text-brand-gold font-black font-mono">{formatCurrency(quote.finalPrice)}</strong>
                  </div>
                </div>
              </div>

              {/* ACTION BUTTONS GRID */}
              <div className="mt-8 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={downloadPDFQuote}
                    className="py-3 px-4 bg-brand-gold text-[#0a0f18] hover:scale-[1.02] rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-transform shadow-lg shadow-brand-gold/5"
                  >
                    <Download size={13} /> Download PDF Quote
                  </button>
                  <button
                    onClick={printQuote}
                    className="py-3 px-4 border border-white/10 hover:border-brand-gold/40 text-white rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all"
                  >
                    <Printer size={13} /> Print Quote
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => window.open(`https://wa.me/918009363259?text=${quoteText}`, '_blank', 'noopener,noreferrer')}
                    className="py-3 px-4 border border-brand-gold/30 hover:bg-brand-gold/10 text-brand-gold rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all"
                  >
                    <MessageCircle size={13} /> WhatsApp Quote
                  </button>
                  <a
                    href={`mailto:?subject=NVS Buildcon Quotation Estimate&body=Service: ${selected.service}%0AArea: ${area} sq.ft%0ARate: ₹${selected.rate}/sq.ft%0AFinal Price Quote: ${formatCurrency(quote.finalPrice)}`}
                    className="py-3 px-4 border border-white/10 hover:bg-white/5 text-white rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all text-center"
                  >
                    <Mail size={13} /> Email Quote
                  </a>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Disclaimer & Notice */}
        <div className="max-w-5xl mx-auto text-center border-t border-white/5 pt-8">
          <p className="text-[10px] uppercase tracking-widest text-brand-gold/60 mb-2 font-bold">Important Notice &amp; Disclaimer</p>
          <p className="text-[11px] text-brand-on-surface-variant/60 max-w-3xl mx-auto leading-relaxed">
            {disclaimer}
          </p>
        </div>

      </div>
    </section>
  );
}
