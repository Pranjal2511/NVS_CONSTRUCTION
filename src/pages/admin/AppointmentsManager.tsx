import React, { useEffect, useState, useCallback } from 'react';
import { Eye, Trash2 } from 'lucide-react';
import { apiFetch } from '../../utils/api';
import AdminTable, { Column } from '../../components/admin/AdminTable';
import AdminModal from '../../components/admin/AdminModal';

interface Appointment {
  _id: string;
  name: string;
  email: string;
  phone: string;
  date: string;
  time: string;
  service: string;
  notes: string;
  status: string;
  createdAt: string;
}

const STATUS_COLORS: Record<string, string> = {
  'Pending': 'bg-amber-500/10 text-amber-400',
  'Approved': 'bg-emerald-500/10 text-emerald-400',
  'Rejected': 'bg-red-500/10 text-red-400',
  'Rescheduled': 'bg-purple-500/10 text-purple-400',
};

const STATUSES = ['Pending', 'Approved', 'Rejected', 'Rescheduled'];

const AppointmentsManager: React.FC = () => {
  const [data, setData] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewItem, setViewItem] = useState<Appointment | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiFetch('/api/appointments');
      const result = await res.json();
      if (result.success) setData(result.data);
    } catch {/* ignore */} finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this appointment?')) return;
    await apiFetch(`/api/appointments/${id}`, { method: 'DELETE' });
    fetchData();
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    setUpdatingStatus(true);
    try {
      await apiFetch(`/api/appointments/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: newStatus }) });
      setData(d => d.map(a => a._id === id ? { ...a, status: newStatus } : a));
      if (viewItem?._id === id) setViewItem(v => v ? { ...v, status: newStatus } : null);
    } catch {/* ignore */} finally { setUpdatingStatus(false); }
  };

  const columns: Column<Appointment>[] = [
    { key: 'name', label: 'Name', render: (v) => <span className="font-semibold text-white">{v}</span> },
    { key: 'phone', label: 'Phone' },
    { key: 'service', label: 'Service' },
    { key: 'date', label: 'Date', render: (v, row) => <span className="text-xs text-brand-on-surface-variant">{v} {row.time && `@ ${row.time}`}</span> },
    { key: 'status', label: 'Status', render: (v) => <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wide ${STATUS_COLORS[v] ?? 'bg-white/5 text-white'}`}>{v}</span> },
    { key: 'createdAt', label: 'Booked On', render: (v) => <span className="text-xs text-brand-on-surface-variant">{new Date(v).toLocaleDateString('en-IN')}</span> },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-lg font-black uppercase tracking-widest text-brand-on-surface">Appointments</h2>
        <p className="text-xs text-brand-on-surface-variant mt-0.5">{data.length} total appointments</p>
      </div>
      <AdminTable columns={columns} data={data} loading={loading} exportFilename="appointments" emptyMessage="No appointments yet."
        actions={(row) => (
          <div className="flex items-center gap-2 justify-end">
            <button onClick={() => setViewItem(row)} className="p-1.5 rounded-lg bg-white/5 hover:bg-brand-gold/10 text-brand-on-surface-variant hover:text-brand-gold transition-all"><Eye size={13} /></button>
            <button onClick={() => handleDelete(row._id)} className="p-1.5 rounded-lg bg-white/5 hover:bg-red-500/10 text-brand-on-surface-variant hover:text-red-400 transition-all"><Trash2 size={13} /></button>
          </div>
        )}
      />

      <AdminModal isOpen={!!viewItem} onClose={() => setViewItem(null)} title="Appointment Details" size="md">
        {viewItem && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              {[['Name', viewItem.name], ['Phone', viewItem.phone], ['Email', viewItem.email], ['Service', viewItem.service], ['Date', viewItem.date], ['Time', viewItem.time]].map(([label, value]) => (
                <div key={label}>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-brand-on-surface-variant mb-0.5">{label}</p>
                  <p className="text-sm text-white">{value || '—'}</p>
                </div>
              ))}
            </div>
            {viewItem.notes && (
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-brand-on-surface-variant mb-1">Notes</p>
                <p className="text-sm text-brand-on-surface-variant leading-relaxed bg-brand-surface-container rounded-xl p-3">{viewItem.notes}</p>
              </div>
            )}
            <div className="space-y-1.5">
              <p className="text-[10px] font-bold uppercase tracking-widest text-brand-on-surface-variant">Update Status</p>
              <div className="flex flex-wrap gap-2">
                {STATUSES.map((s) => (
                  <button key={s} disabled={updatingStatus} onClick={() => handleStatusChange(viewItem._id, s)}
                    className={`text-[10px] font-bold px-3 py-1.5 rounded-full uppercase tracking-wide transition-all ${viewItem.status === s ? STATUS_COLORS[s] + ' ring-1 ring-current' : 'bg-white/5 text-brand-on-surface-variant hover:bg-white/10'}`}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </AdminModal>
    </div>
  );
};

export default AppointmentsManager;
