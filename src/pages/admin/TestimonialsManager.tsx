import React, { useEffect, useState, useCallback } from 'react';
import { Plus, Pencil, Trash2, Star } from 'lucide-react';
import { apiFetch } from '../../utils/api';
import AdminTable, { Column } from '../../components/admin/AdminTable';
import AdminModal from '../../components/admin/AdminModal';

interface Testimonial {
  _id: string;
  name: string;
  role: string;
  rating: number;
  review: string;
}

const EMPTY: Omit<Testimonial, '_id'> = { name: '', role: '', rating: 5, review: '' };

const TestimonialsManager: React.FC = () => {
  const [data, setData] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState<Omit<Testimonial, '_id'>>(EMPTY);
  const [editId, setEditId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiFetch('/api/testimonials');
      const result = await res.json();
      if (result.success) setData(result.data);
    } catch {/* ignore */} finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const openCreate = () => { setForm(EMPTY); setEditId(null); setError(null); setModalOpen(true); };
  const openEdit = (row: Testimonial) => { const { _id, ...rest } = row; setForm(rest); setEditId(_id); setError(null); setModalOpen(true); };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true); setError(null);
    try {
      const method = editId ? 'PUT' : 'POST';
      const url = editId ? `/api/testimonials/${editId}` : '/api/testimonials';
      const res = await apiFetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...form, clientName: form.name }) });
      const result = await res.json();
      if (!res.ok) throw new Error(result.message || 'Save failed');
      setModalOpen(false); fetchData();
    } catch (err: any) { setError(err.message); } finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this testimonial?')) return;
    await apiFetch(`/api/testimonials/${id}`, { method: 'DELETE' });
    fetchData();
  };

  const StarRating: React.FC<{ value: number; onChange: (v: number) => void }> = ({ value, onChange }) => (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button key={star} type="button" onClick={() => onChange(star)}>
          <Star size={18} className={star <= value ? 'text-brand-gold fill-brand-gold' : 'text-brand-on-surface-variant/30'} />
        </button>
      ))}
    </div>
  );

  const columns: Column<Testimonial>[] = [
    { key: 'name', label: 'Client', render: (v) => <span className="font-semibold text-white">{v}</span> },
    { key: 'role', label: 'Role / Company' },
    { key: 'rating', label: 'Rating', render: (v) => (
      <div className="flex gap-0.5">
        {[1,2,3,4,5].map(s => <Star key={s} size={12} className={s <= v ? 'text-brand-gold fill-brand-gold' : 'text-brand-on-surface-variant/20'} />)}
      </div>
    )},
    { key: 'review', label: 'Review', className: 'max-w-xs', render: (v) => <span className="text-xs text-brand-on-surface-variant truncate block max-w-xs">{v}</span> },
  ];

  const f = (k: keyof typeof form, v: any) => setForm(p => ({ ...p, [k]: v }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-lg font-black uppercase tracking-widest text-brand-on-surface">Testimonials</h2>
          <p className="text-xs text-brand-on-surface-variant mt-0.5">{data.length} reviews</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2.5 bg-brand-gold text-brand-surface text-[10px] font-bold uppercase tracking-widest rounded-xl hover:bg-brand-gold/80 transition-colors">
          <Plus size={14} /> Add Review
        </button>
      </div>
      <AdminTable columns={columns} data={data} loading={loading} exportFilename="testimonials" emptyMessage="No testimonials yet."
        actions={(row) => (
          <div className="flex items-center gap-2 justify-end">
            <button onClick={() => openEdit(row)} className="p-1.5 rounded-lg bg-white/5 hover:bg-brand-gold/10 text-brand-on-surface-variant hover:text-brand-gold transition-all"><Pencil size={13} /></button>
            <button onClick={() => handleDelete(row._id)} className="p-1.5 rounded-lg bg-white/5 hover:bg-red-500/10 text-brand-on-surface-variant hover:text-red-400 transition-all"><Trash2 size={13} /></button>
          </div>
        )}
      />
      <AdminModal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editId ? 'Edit Testimonial' : 'Add Testimonial'} size="md">
        <form onSubmit={handleSave} className="space-y-4">
          {error && <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-xl">{error}</div>}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-widest text-brand-on-surface-variant">Client Name *</label>
            <input required value={form.name} onChange={(e) => f('name', e.target.value)} className="w-full px-3 py-2.5 bg-brand-surface-container border border-white/8 text-sm text-white rounded-xl focus:outline-none focus:border-brand-gold/40" />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-widest text-brand-on-surface-variant">Role / Company</label>
            <input value={form.role} onChange={(e) => f('role', e.target.value)} className="w-full px-3 py-2.5 bg-brand-surface-container border border-white/8 text-sm text-white rounded-xl focus:outline-none focus:border-brand-gold/40" placeholder="e.g. Homeowner, Lucknow" />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-widest text-brand-on-surface-variant">Rating</label>
            <StarRating value={form.rating} onChange={(v) => f('rating', v)} />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-widest text-brand-on-surface-variant">Review *</label>
            <textarea required rows={4} value={form.review} onChange={(e) => f('review', e.target.value)} className="w-full px-3 py-2.5 bg-brand-surface-container border border-white/8 text-sm text-white rounded-xl focus:outline-none focus:border-brand-gold/40 resize-none" />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setModalOpen(false)} className="flex-1 py-2.5 border border-white/10 text-brand-on-surface-variant text-[10px] font-bold uppercase tracking-widest rounded-xl hover:bg-white/5 transition-colors">Cancel</button>
            <button type="submit" disabled={saving} className="flex-1 py-2.5 bg-brand-gold text-brand-surface text-[10px] font-bold uppercase tracking-widest rounded-xl hover:bg-brand-gold/80 transition-colors disabled:opacity-50">
              {saving ? 'Saving...' : (editId ? 'Update' : 'Add')}
            </button>
          </div>
        </form>
      </AdminModal>
    </div>
  );
};

export default TestimonialsManager;
