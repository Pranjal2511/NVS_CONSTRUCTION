import React, { useEffect, useState } from 'react';
import { Users, MessageSquare, FolderKanban, Calendar, Home, Activity } from 'lucide-react';
import { apiFetch } from '../../utils/api';
import StatCard from '../../components/admin/StatCard';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line
} from 'recharts';

interface Stats {
  totalUsers: number;
  totalEnquiries: number;
  totalProjects: number;
  totalAppointments: number;
  totalHousePlans: number;
  recentActivity: { type: string; detail: string; date: string }[];
}

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

// Build mock monthly data from recentActivity - in production you'd have a dedicated endpoint
function buildMonthlyData(activity: Stats['recentActivity']) {
  const counts: Record<string, { enquiries: number; appointments: number }> = {};
  MONTHS.forEach((m) => { counts[m] = { enquiries: 0, appointments: 0 }; });
  activity.forEach((a) => {
    const month = MONTHS[new Date(a.date).getMonth()];
    if (a.type === 'Enquiry') counts[month].enquiries++;
    if (a.type === 'Appointment') counts[month].appointments++;
  });
  return MONTHS.map((m) => ({ month: m, ...counts[m] }));
}

const Overview: React.FC = () => {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await apiFetch('/api/admin/stats');
        const result = await res.json();
        if (result.success) setStats(result.data);
      } catch {/* ignore */} finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-2 border-brand-gold/30 border-t-brand-gold rounded-full animate-spin" />
    </div>
  );

  if (!stats) return <p className="text-brand-on-surface-variant">Failed to load stats.</p>;

  const monthlyData = buildMonthlyData(stats.recentActivity);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="bg-brand-surface border border-white/10 rounded-xl p-3 text-xs shadow-xl">
        <p className="font-bold text-white mb-2">{label}</p>
        {payload.map((p: any) => (
          <p key={p.dataKey} style={{ color: p.color }}>{p.name}: {p.value}</p>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-display text-lg font-black uppercase tracking-widest text-brand-on-surface mb-1">Overview</h2>
        <p className="text-xs text-brand-on-surface-variant">Welcome back. Here's your business at a glance.</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        <StatCard label="Users" value={stats.totalUsers} icon={<Users size={18} />} color="blue" />
        <StatCard label="Enquiries" value={stats.totalEnquiries} icon={<MessageSquare size={18} />} color="gold" />
        <StatCard label="Projects" value={stats.totalProjects} icon={<FolderKanban size={18} />} color="green" />
        <StatCard label="Appointments" value={stats.totalAppointments} icon={<Calendar size={18} />} color="purple" />
        <StatCard label="House Plans" value={stats.totalHousePlans} icon={<Home size={18} />} color="red" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="p-6 bg-brand-surface-high border border-white/8 rounded-2xl">
          <h3 className="text-xs font-bold uppercase tracking-widest text-brand-on-surface-variant mb-5">Monthly Enquiries</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={monthlyData} barSize={14}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="month" tick={{ fill: '#9ca3af', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#9ca3af', fontSize: 10 }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="enquiries" name="Enquiries" fill="#c2a649" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="p-6 bg-brand-surface-high border border-white/8 rounded-2xl">
          <h3 className="text-xs font-bold uppercase tracking-widest text-brand-on-surface-variant mb-5">Monthly Appointments</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="month" tick={{ fill: '#9ca3af', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#9ca3af', fontSize: 10 }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip content={<CustomTooltip />} />
              <Line type="monotone" dataKey="appointments" name="Appointments" stroke="#818cf8" strokeWidth={2} dot={{ fill: '#818cf8', r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="p-6 bg-brand-surface-high border border-white/8 rounded-2xl">
        <div className="flex items-center gap-2 mb-5">
          <Activity size={14} className="text-brand-gold" />
          <h3 className="text-xs font-bold uppercase tracking-widest text-brand-on-surface-variant">Recent Activity</h3>
        </div>
        {stats.recentActivity.length === 0 ? (
          <p className="text-sm text-brand-on-surface-variant/50 py-4 text-center">No recent activity</p>
        ) : (
          <div className="space-y-3">
            {stats.recentActivity.map((a, i) => (
              <div key={i} className="flex items-start gap-3 py-3 border-b border-white/5 last:border-0">
                <span className={`mt-0.5 text-[9px] font-bold uppercase tracking-widest px-2 py-1 rounded-full flex-shrink-0 ${
                  a.type === 'Enquiry' ? 'bg-brand-gold/10 text-brand-gold' : 'bg-purple-500/10 text-purple-400'
                }`}>{a.type}</span>
                <p className="text-xs text-brand-on-surface-variant flex-1">{a.detail}</p>
                <span className="text-[10px] text-brand-on-surface-variant/40 flex-shrink-0">
                  {new Date(a.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Overview;
