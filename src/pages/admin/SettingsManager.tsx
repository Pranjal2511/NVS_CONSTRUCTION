import React, { useEffect, useState, useCallback } from 'react';
import { Save, RefreshCw } from 'lucide-react';
import { apiFetch } from '../../utils/api';

interface Settings {
  companyPhone: string;
  whatsappNumber: string;
  emailForNotifications: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
  heroTitle: string;
  heroSubtitle: string;
  metaTitle: string;
  metaDescription: string;
  metaKeywords: string;
  projectsCount: number;
  citiesCount: number;
  yearsCount: number;
  planningPrice: number;
  constructionPrice: number;
  pricingDisclaimer: string;
}

const EMPTY: Settings = {
  companyPhone: '', whatsappNumber: '', emailForNotifications: '', contactEmail: '',
  contactPhone: '', address: '', heroTitle: '', heroSubtitle: '',
  metaTitle: '', metaDescription: '', metaKeywords: '',
  projectsCount: 50, citiesCount: 12, yearsCount: 15,
  planningPrice: 5, constructionPrice: 1100,
  pricingDisclaimer: '',
};

type TabId = 'contact' | 'homepage' | 'seo' | 'pricing';

const TABS: { id: TabId; label: string }[] = [
  { id: 'contact', label: 'Contact Details' },
  { id: 'homepage', label: 'Homepage' },
  { id: 'seo', label: 'SEO & Meta' },
  { id: 'pricing', label: 'Pricing & Rates' },
];

const SettingsManager: React.FC = () => {
  const [form, setForm] = useState<Settings>(EMPTY);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabId>('contact');

  const fetchSettings = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiFetch('/api/settings');
      const result = await res.json();
      if (result.success) setForm({ ...EMPTY, ...result.data });
    } catch {/* ignore */} finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchSettings(); }, [fetchSettings]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true); setError(null); setSuccessMsg(null);
    try {
      const res = await apiFetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.message || 'Save failed');
      setSuccessMsg('Settings saved successfully!');
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: any) { setError(err.message); } finally { setSaving(false); }
  };

  const f = (k: keyof Settings, v: any) => setForm(p => ({ ...p, [k]: v }));

  const inputClass = "w-full px-3 py-2.5 bg-brand-surface-container border border-white/8 text-sm text-white rounded-xl focus:outline-none focus:border-brand-gold/40 placeholder:text-brand-on-surface-variant/30 transition-colors";
  const labelClass = "block text-[10px] font-bold uppercase tracking-widest text-brand-on-surface-variant mb-1.5";

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-2 border-brand-gold/30 border-t-brand-gold rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-lg font-black uppercase tracking-widest text-brand-on-surface">Site Settings</h2>
          <p className="text-xs text-brand-on-surface-variant mt-0.5">Manage all website configuration</p>
        </div>
        <button onClick={fetchSettings} className="p-2 rounded-xl border border-white/10 text-brand-on-surface-variant hover:text-white hover:bg-white/5 transition-colors">
          <RefreshCw size={14} />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-brand-surface-container rounded-xl border border-white/8">
        {TABS.map((tab) => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-2 text-[10px] font-bold uppercase tracking-widest rounded-lg transition-all ${activeTab === tab.id ? 'bg-brand-gold text-brand-surface shadow-sm' : 'text-brand-on-surface-variant hover:text-white'}`}>
            {tab.label}
          </button>
        ))}
      </div>

      <form onSubmit={handleSave} className="space-y-5">
        {successMsg && <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs rounded-xl">{successMsg}</div>}
        {error && <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-xl">{error}</div>}

        {activeTab === 'contact' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div><label className={labelClass}>Company Phone</label><input value={form.companyPhone} onChange={(e) => f('companyPhone', e.target.value)} className={inputClass} /></div>
            <div><label className={labelClass}>WhatsApp Number</label><input value={form.whatsappNumber} onChange={(e) => f('whatsappNumber', e.target.value)} className={inputClass} /></div>
            <div><label className={labelClass}>Contact Phone</label><input value={form.contactPhone} onChange={(e) => f('contactPhone', e.target.value)} className={inputClass} /></div>
            <div><label className={labelClass}>Contact Email</label><input type="email" value={form.contactEmail} onChange={(e) => f('contactEmail', e.target.value)} className={inputClass} /></div>
            <div><label className={labelClass}>Notification Email</label><input type="email" value={form.emailForNotifications} onChange={(e) => f('emailForNotifications', e.target.value)} className={inputClass} /></div>
            <div className="sm:col-span-2"><label className={labelClass}>Address</label><textarea rows={2} value={form.address} onChange={(e) => f('address', e.target.value)} className={inputClass + ' resize-none'} /></div>
          </div>
        )}

        {activeTab === 'homepage' && (
          <div className="space-y-5">
            <div><label className={labelClass}>Hero Heading</label><input value={form.heroTitle} onChange={(e) => f('heroTitle', e.target.value)} className={inputClass} /></div>
            <div><label className={labelClass}>Hero Subheading</label><textarea rows={3} value={form.heroSubtitle} onChange={(e) => f('heroSubtitle', e.target.value)} className={inputClass + ' resize-none'} /></div>
            <div className="grid grid-cols-3 gap-4">
              <div><label className={labelClass}>Projects Count</label><input type="number" value={form.projectsCount} onChange={(e) => f('projectsCount', parseInt(e.target.value))} className={inputClass} /></div>
              <div><label className={labelClass}>Cities Count</label><input type="number" value={form.citiesCount} onChange={(e) => f('citiesCount', parseInt(e.target.value))} className={inputClass} /></div>
              <div><label className={labelClass}>Years Count</label><input type="number" value={form.yearsCount} onChange={(e) => f('yearsCount', parseInt(e.target.value))} className={inputClass} /></div>
            </div>
          </div>
        )}

        {activeTab === 'seo' && (
          <div className="space-y-5">
            <div><label className={labelClass}>Meta Title</label><input value={form.metaTitle} onChange={(e) => f('metaTitle', e.target.value)} className={inputClass} placeholder="NVS Buildcon | Premium Architecture & Construction" /></div>
            <div><label className={labelClass}>Meta Description</label><textarea rows={3} value={form.metaDescription} onChange={(e) => f('metaDescription', e.target.value)} className={inputClass + ' resize-none'} /></div>
            <div><label className={labelClass}>Meta Keywords (comma separated)</label><input value={form.metaKeywords} onChange={(e) => f('metaKeywords', e.target.value)} className={inputClass} /></div>
            <div className="p-4 bg-brand-gold/5 border border-brand-gold/10 rounded-xl">
              <p className="text-[10px] font-bold uppercase tracking-widest text-brand-gold mb-2">SEO Preview</p>
              <div className="space-y-1">
                <p className="text-sm font-semibold text-blue-400">{form.metaTitle || 'Page Title'}</p>
                <p className="text-xs text-green-500">nvsbuildcon.com</p>
                <p className="text-xs text-brand-on-surface-variant leading-relaxed">{form.metaDescription?.substring(0, 160) || 'Page description...'}</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'pricing' && (
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-5">
              <div>
                <label className={labelClass}>Planning Price (₹/sq.ft)</label>
                <input type="number" value={form.planningPrice} onChange={(e) => f('planningPrice', parseFloat(e.target.value))} className={inputClass} />
                <p className="text-[10px] text-brand-on-surface-variant/50 mt-1">Used in Price Calculator</p>
              </div>
              <div>
                <label className={labelClass}>Construction Price (₹/sq.ft)</label>
                <input type="number" value={form.constructionPrice} onChange={(e) => f('constructionPrice', parseFloat(e.target.value))} className={inputClass} />
                <p className="text-[10px] text-brand-on-surface-variant/50 mt-1">Used in Price Calculator</p>
              </div>
            </div>
            <div>
              <label className={labelClass}>Pricing Disclaimer</label>
              <textarea rows={3} value={form.pricingDisclaimer} onChange={(e) => f('pricingDisclaimer', e.target.value)} className={inputClass + ' resize-none'} />
            </div>
            <div className="p-4 bg-brand-gold/5 border border-brand-gold/10 rounded-xl">
              <p className="text-[10px] font-bold uppercase tracking-widest text-brand-gold mb-2">Rate Preview</p>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-brand-on-surface-variant text-xs">Planning Rate</p>
                  <p className="text-white font-bold">₹{form.planningPrice}/sq.ft</p>
                </div>
                <div>
                  <p className="text-brand-on-surface-variant text-xs">Construction Rate</p>
                  <p className="text-white font-bold">₹{form.constructionPrice}/sq.ft</p>
                </div>
              </div>
            </div>
          </div>
        )}

        <button type="submit" disabled={saving} className="flex items-center gap-2 px-6 py-3 bg-brand-gold text-brand-surface text-[10px] font-bold uppercase tracking-widest rounded-xl hover:bg-brand-gold/80 transition-colors disabled:opacity-50">
          <Save size={14} />
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </form>
    </div>
  );
};

export default SettingsManager;
