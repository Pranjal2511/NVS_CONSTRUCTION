import React, { useEffect, useState, useCallback } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { apiFetch } from '../../utils/api';
import AdminTable, { Column } from '../../components/admin/AdminTable';
import AdminModal from '../../components/admin/AdminModal';
import FileUpload from '../../components/admin/FileUpload';

interface GalleryItem {
  _id: string;
  title: string;
  category: string;
  imageUrl: string;
  desc: string;
  alt: string;
}

const EMPTY: Omit<GalleryItem, '_id'> = { title: '', category: 'Architecture', imageUrl: '', desc: '', alt: '' };
const CATEGORIES = ['Architecture', 'Interior', 'Structural', 'Landscape', '3D Renders', 'Under Construction'];

const GalleryManager: React.FC = () => {
  const [data, setData] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState<Omit<GalleryItem, '_id'>>(EMPTY);
  const [editId, setEditId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiFetch('/api/gallery');
      const result = await res.json();
      if (result.success) setData(result.data);
    } catch {/* ignore */} finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const openCreate = () => { setForm(EMPTY); setEditId(null); setError(null); setModalOpen(true); };
  const openEdit = (row: GalleryItem) => { const { _id, ...rest } = row; setForm(rest); setEditId(_id); setError(null); setModalOpen(true); };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true); setError(null);
    try {
      const method = editId ? 'PUT' : 'POST';
      const url = editId ? `/api/gallery/${editId}` : '/api/gallery';
      const res = await apiFetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
      const result = await res.json();
      if (!res.ok) throw new Error(result.message || 'Save failed');
      setModalOpen(false); fetchData();
    } catch (err: any) { setError(err.message); } finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this gallery item?')) return;
    await apiFetch(`/api/gallery/${id}`, { method: 'DELETE' });
    fetchData();
  };

  const columns: Column<GalleryItem>[] = [
    { key: 'imageUrl', label: 'Image', render: (v) => v ? <img src={v} alt="" className="w-14 h-10 rounded-lg object-cover" /> : <div className="w-14 h-10 bg-white/5 rounded-lg" /> },
    { key: 'title', label: 'Title', render: (v) => <span className="font-semibold text-white">{v}</span> },
    { key: 'category', label: 'Category', render: (v) => <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-brand-gold/10 text-brand-gold uppercase">{v}</span> },
    { key: 'desc', label: 'Description', className: 'max-w-xs truncate' },
  ];

  const f = (k: keyof typeof form, v: any) => setForm(p => ({ ...p, [k]: v }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-lg font-black uppercase tracking-widest text-brand-on-surface">Gallery</h2>
          <p className="text-xs text-brand-on-surface-variant mt-0.5">{data.length} items</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2.5 bg-brand-gold text-brand-surface text-[10px] font-bold uppercase tracking-widest rounded-xl hover:bg-brand-gold/80 transition-colors">
          <Plus size={14} /> Add Image
        </button>
      </div>
      <AdminTable columns={columns} data={data} loading={loading} exportFilename="gallery" emptyMessage="No gallery items yet."
        actions={(row) => (
          <div className="flex items-center gap-2 justify-end">
            <button onClick={() => openEdit(row)} className="p-1.5 rounded-lg bg-white/5 hover:bg-brand-gold/10 text-brand-on-surface-variant hover:text-brand-gold transition-all"><Pencil size={13} /></button>
            <button onClick={() => handleDelete(row._id)} className="p-1.5 rounded-lg bg-white/5 hover:bg-red-500/10 text-brand-on-surface-variant hover:text-red-400 transition-all"><Trash2 size={13} /></button>
          </div>
        )}
      />
      <AdminModal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editId ? 'Edit Gallery Item' : 'Add Gallery Item'} size="md">
        <form onSubmit={handleSave} className="space-y-4">
          {error && <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-xl">{error}</div>}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-widest text-brand-on-surface-variant">Title *</label>
            <input required value={form.title} onChange={(e) => f('title', e.target.value)} className="w-full px-3 py-2.5 bg-brand-surface-container border border-white/8 text-sm text-white rounded-xl focus:outline-none focus:border-brand-gold/40" />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-widest text-brand-on-surface-variant">Category</label>
            <select value={form.category} onChange={(e) => f('category', e.target.value)} className="w-full px-3 py-2.5 bg-brand-surface-container border border-white/8 text-sm text-white rounded-xl focus:outline-none focus:border-brand-gold/40">
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-widest text-brand-on-surface-variant">Description</label>
            <textarea rows={2} value={form.desc} onChange={(e) => f('desc', e.target.value)} className="w-full px-3 py-2.5 bg-brand-surface-container border border-white/8 text-sm text-white rounded-xl focus:outline-none focus:border-brand-gold/40 resize-none" />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-widest text-brand-on-surface-variant">Alt Text (SEO)</label>
            <input value={form.alt} onChange={(e) => f('alt', e.target.value)} className="w-full px-3 py-2.5 bg-brand-surface-container border border-white/8 text-sm text-white rounded-xl focus:outline-none focus:border-brand-gold/40" placeholder="Descriptive alt text for accessibility" />
          </div>
          <FileUpload value={form.imageUrl} onChange={(url) => f('imageUrl', url)} fileType="image" label="Gallery Image" />
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

export default GalleryManager;
