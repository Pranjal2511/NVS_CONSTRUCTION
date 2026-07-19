import React, { useEffect, useState, useCallback } from 'react';
import { Plus, Pencil, Trash2, X } from 'lucide-react';
import { apiFetch } from '../../utils/api';
import AdminTable, { Column } from '../../components/admin/AdminTable';
import AdminModal from '../../components/admin/AdminModal';

interface Service {
  _id: string;
  title: string;
  description: string;
  icon: string;
  details: string[];
}

const EMPTY: Omit<Service, '_id'> = { title: '', description: '', icon: 'Compass', details: [] };
const ICONS = ['Compass', 'Layers', 'Landmark', 'Hammer', 'Wrench', 'Home', 'Building', 'Ruler', 'PenTool', 'Star'];

const ServicesManager: React.FC = () => {
  const [data, setData] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState<Omit<Service, '_id'>>(EMPTY);
  const [editId, setEditId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newDetail, setNewDetail] = useState('');

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiFetch('/api/services');
      const result = await res.json();
      if (result.success) setData(result.data);
    } catch {/* ignore */} finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const openCreate = () => { setForm(EMPTY); setEditId(null); setError(null); setNewDetail(''); setModalOpen(true); };
  const openEdit = (row: Service) => { const { _id, ...rest } = row; setForm(rest); setEditId(_id); setError(null); setNewDetail(''); setModalOpen(true); };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true); setError(null);
    try {
      const method = editId ? 'PUT' : 'POST';
      const url = editId ? `/api/services/${editId}` : '/api/services';
      const res = await apiFetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
      const result = await res.json();
      if (!res.ok) throw new Error(result.message || 'Save failed');
      setModalOpen(false); fetchData();
    } catch (err: any) { setError(err.message); } finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this service?')) return;
    await apiFetch(`/api/services/${id}`, { method: 'DELETE' });
    fetchData();
  };

  const addDetail = () => {
    if (newDetail.trim()) {
      setForm(p => ({ ...p, details: [...p.details, newDetail.trim()] }));
      setNewDetail('');
    }
  };

  const removeDetail = (idx: number) => setForm(p => ({ ...p, details: p.details.filter((_, i) => i !== idx) }));

  const columns: Column<Service>[] = [
    { key: 'icon', label: 'Icon', render: (v) => <span className="text-[10px] font-mono text-brand-gold bg-brand-gold/10 px-2 py-1 rounded-lg">{v}</span> },
    { key: 'title', label: 'Title', render: (v) => <span className="font-semibold text-white">{v}</span> },
    { key: 'description', label: 'Description', className: 'max-w-xs', render: (v) => <span className="text-brand-on-surface-variant truncate block max-w-xs">{v}</span> },
    { key: 'details', label: 'Features', render: (v) => <span className="text-xs text-brand-on-surface-variant">{(v as string[]).length} items</span> },
  ];

  const f = (k: keyof typeof form, v: any) => setForm(p => ({ ...p, [k]: v }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-lg font-black uppercase tracking-widest text-brand-on-surface">Services</h2>
          <p className="text-xs text-brand-on-surface-variant mt-0.5">{data.length} services</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2.5 bg-brand-gold text-brand-surface text-[10px] font-bold uppercase tracking-widest rounded-xl hover:bg-brand-gold/80 transition-colors">
          <Plus size={14} /> Add Service
        </button>
      </div>
      <AdminTable columns={columns} data={data} loading={loading} exportFilename="services" emptyMessage="No services yet."
        actions={(row) => (
          <div className="flex items-center gap-2 justify-end">
            <button onClick={() => openEdit(row)} className="p-1.5 rounded-lg bg-white/5 hover:bg-brand-gold/10 text-brand-on-surface-variant hover:text-brand-gold transition-all"><Pencil size={13} /></button>
            <button onClick={() => handleDelete(row._id)} className="p-1.5 rounded-lg bg-white/5 hover:bg-red-500/10 text-brand-on-surface-variant hover:text-red-400 transition-all"><Trash2 size={13} /></button>
          </div>
        )}
      />
      <AdminModal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editId ? 'Edit Service' : 'Add Service'} size="md">
        <form onSubmit={handleSave} className="space-y-4">
          {error && <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-xl">{error}</div>}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-widest text-brand-on-surface-variant">Title *</label>
            <input required value={form.title} onChange={(e) => f('title', e.target.value)} className="w-full px-3 py-2.5 bg-brand-surface-container border border-white/8 text-sm text-white rounded-xl focus:outline-none focus:border-brand-gold/40" />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-widest text-brand-on-surface-variant">Icon</label>
            <select value={form.icon} onChange={(e) => f('icon', e.target.value)} className="w-full px-3 py-2.5 bg-brand-surface-container border border-white/8 text-sm text-white rounded-xl focus:outline-none focus:border-brand-gold/40">
              {ICONS.map((ic) => <option key={ic} value={ic}>{ic}</option>)}
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-widest text-brand-on-surface-variant">Description *</label>
            <textarea required rows={3} value={form.description} onChange={(e) => f('description', e.target.value)} className="w-full px-3 py-2.5 bg-brand-surface-container border border-white/8 text-sm text-white rounded-xl focus:outline-none focus:border-brand-gold/40 resize-none" />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-brand-on-surface-variant">Features</label>
            <div className="flex gap-2">
              <input value={newDetail} onChange={(e) => setNewDetail(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addDetail(); }}} placeholder="Add a feature..." className="flex-1 px-3 py-2 bg-brand-surface-container border border-white/8 text-sm text-white rounded-xl focus:outline-none focus:border-brand-gold/40" />
              <button type="button" onClick={addDetail} className="px-4 py-2 bg-brand-gold/10 text-brand-gold text-xs font-bold rounded-xl hover:bg-brand-gold/20 transition-colors">Add</button>
            </div>
            <div className="flex flex-wrap gap-2">
              {form.details.map((d, i) => (
                <span key={i} className="flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1.5 rounded-full bg-white/5 text-brand-on-surface-variant">
                  {d}
                  <button type="button" onClick={() => removeDetail(i)} className="hover:text-red-400 transition-colors"><X size={10} /></button>
                </span>
              ))}
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setModalOpen(false)} className="flex-1 py-2.5 border border-white/10 text-brand-on-surface-variant text-[10px] font-bold uppercase tracking-widest rounded-xl hover:bg-white/5 transition-colors">Cancel</button>
            <button type="submit" disabled={saving} className="flex-1 py-2.5 bg-brand-gold text-brand-surface text-[10px] font-bold uppercase tracking-widest rounded-xl hover:bg-brand-gold/80 transition-colors disabled:opacity-50">
              {saving ? 'Saving...' : (editId ? 'Update' : 'Create')}
            </button>
          </div>
        </form>
      </AdminModal>
    </div>
  );
};

export default ServicesManager;
