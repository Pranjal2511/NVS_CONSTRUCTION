import React, { useEffect, useState, useCallback } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { apiFetch } from '../../utils/api';
import AdminTable, { Column } from '../../components/admin/AdminTable';
import AdminModal from '../../components/admin/AdminModal';
import FileUpload from '../../components/admin/FileUpload';

interface Blog {
  _id: string;
  title: string;
  slug: string;
  category: string;
  content: string;
  imageUrl: string;
  tags: string[];
}

const EMPTY: Omit<Blog, '_id'> = { title: '', slug: '', category: 'Architecture', content: '', imageUrl: '', tags: [] };
const CATEGORIES = ['Architecture', 'Interior Design', 'Structural', 'Vastu', 'Residential', 'Commercial', 'Industry News'];

const slugify = (s: string) => s.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

const BlogsManager: React.FC = () => {
  const [data, setData] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState<Omit<Blog, '_id'>>(EMPTY);
  const [editId, setEditId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiFetch('/api/blogs');
      const result = await res.json();
      if (result.success) setData(result.data);
    } catch {/* ignore */} finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const openCreate = () => { setForm(EMPTY); setEditId(null); setError(null); setModalOpen(true); };
  const openEdit = (row: Blog) => { const { _id, ...rest } = row; setForm(rest); setEditId(_id); setError(null); setModalOpen(true); };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true); setError(null);
    try {
      const payload = { ...form, featuredImage: form.imageUrl };
      const method = editId ? 'PUT' : 'POST';
      const url = editId ? `/api/blogs/${editId}` : '/api/blogs';
      const res = await apiFetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      const result = await res.json();
      if (!res.ok) throw new Error(result.message || 'Save failed');
      setModalOpen(false); fetchData();
    } catch (err: any) { setError(err.message); } finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this blog post?')) return;
    await apiFetch(`/api/blogs/${id}`, { method: 'DELETE' });
    fetchData();
  };

  const columns: Column<Blog>[] = [
    { key: 'imageUrl', label: 'Image', render: (v) => v ? <img src={v} alt="" className="w-14 h-10 rounded-lg object-cover" /> : <div className="w-14 h-10 bg-white/5 rounded-lg" /> },
    { key: 'title', label: 'Title', render: (v) => <span className="font-semibold text-white">{v}</span> },
    { key: 'category', label: 'Category', render: (v) => <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-brand-gold/10 text-brand-gold uppercase">{v}</span> },
    { key: 'slug', label: 'Slug', render: (v) => <span className="text-[10px] font-mono text-brand-on-surface-variant">{v}</span> },
    { key: 'content', label: 'Preview', className: 'max-w-xs', render: (v) => <span className="text-brand-on-surface-variant text-xs truncate block max-w-xs">{v?.substring(0, 60)}...</span> },
  ];

  const f = (k: keyof typeof form, v: any) => setForm(p => ({ ...p, [k]: v }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-lg font-black uppercase tracking-widest text-brand-on-surface">Blog Posts</h2>
          <p className="text-xs text-brand-on-surface-variant mt-0.5">{data.length} articles</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2.5 bg-brand-gold text-brand-surface text-[10px] font-bold uppercase tracking-widest rounded-xl hover:bg-brand-gold/80 transition-colors">
          <Plus size={14} /> New Post
        </button>
      </div>
      <AdminTable columns={columns} data={data} loading={loading} exportFilename="blogs" emptyMessage="No blog posts yet."
        actions={(row) => (
          <div className="flex items-center gap-2 justify-end">
            <button onClick={() => openEdit(row)} className="p-1.5 rounded-lg bg-white/5 hover:bg-brand-gold/10 text-brand-on-surface-variant hover:text-brand-gold transition-all"><Pencil size={13} /></button>
            <button onClick={() => handleDelete(row._id)} className="p-1.5 rounded-lg bg-white/5 hover:bg-red-500/10 text-brand-on-surface-variant hover:text-red-400 transition-all"><Trash2 size={13} /></button>
          </div>
        )}
      />
      <AdminModal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editId ? 'Edit Blog Post' : 'New Blog Post'} size="xl">
        <form onSubmit={handleSave} className="space-y-4">
          {error && <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-xl">{error}</div>}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-brand-on-surface-variant">Title *</label>
              <input required value={form.title} onChange={(e) => { f('title', e.target.value); if (!editId) f('slug', slugify(e.target.value)); }} className="w-full px-3 py-2.5 bg-brand-surface-container border border-white/8 text-sm text-white rounded-xl focus:outline-none focus:border-brand-gold/40" />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-widest text-brand-on-surface-variant">Slug</label>
              <input value={form.slug} onChange={(e) => f('slug', slugify(e.target.value))} className="w-full px-3 py-2.5 bg-brand-surface-container border border-white/8 text-sm text-brand-on-surface-variant rounded-xl focus:outline-none focus:border-brand-gold/40 font-mono" />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-widest text-brand-on-surface-variant">Category</label>
              <select value={form.category} onChange={(e) => f('category', e.target.value)} className="w-full px-3 py-2.5 bg-brand-surface-container border border-white/8 text-sm text-white rounded-xl focus:outline-none focus:border-brand-gold/40">
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-widest text-brand-on-surface-variant">Content *</label>
            <textarea required rows={8} value={form.content} onChange={(e) => f('content', e.target.value)} className="w-full px-3 py-2.5 bg-brand-surface-container border border-white/8 text-sm text-white rounded-xl focus:outline-none focus:border-brand-gold/40 resize-none" placeholder="Write the full article content here..." />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-widest text-brand-on-surface-variant">Tags (comma separated)</label>
            <input value={form.tags.join(', ')} onChange={(e) => f('tags', e.target.value.split(',').map(t => t.trim()).filter(Boolean))} placeholder="architecture, design, vastu" className="w-full px-3 py-2.5 bg-brand-surface-container border border-white/8 text-sm text-white rounded-xl focus:outline-none focus:border-brand-gold/40" />
          </div>
          <FileUpload value={form.imageUrl} onChange={(url) => f('imageUrl', url)} fileType="image" label="Featured Image" />
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setModalOpen(false)} className="flex-1 py-2.5 border border-white/10 text-brand-on-surface-variant text-[10px] font-bold uppercase tracking-widest rounded-xl hover:bg-white/5 transition-colors">Cancel</button>
            <button type="submit" disabled={saving} className="flex-1 py-2.5 bg-brand-gold text-brand-surface text-[10px] font-bold uppercase tracking-widest rounded-xl hover:bg-brand-gold/80 transition-colors disabled:opacity-50">
              {saving ? 'Saving...' : (editId ? 'Update' : 'Publish')}
            </button>
          </div>
        </form>
      </AdminModal>
    </div>
  );
};

export default BlogsManager;
