import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  LayoutDashboard, User, BookOpen, FileText, Heart, Bell,
  Download, Calendar, Clipboard, Settings, LogOut, ChevronRight,
  Upload, Lock, Phone, Mail, Shield, RefreshCw, ExternalLink,
  AlertCircle, CheckCircle, Clock, Star, Home as HomeIcon, Loader2, X, Menu
} from 'lucide-react';
import { apiFetch } from '../utils/api';
import { AuthUser, logout as authLogout, signOutAllDevices, fetchUserProfile } from '../utils/auth';
import { Inquiry } from '../types';

/* ─── Types ─────────────────────────────────────────────────────── */
interface Appointment {
  _id: string;
  service: string;
  date: string;
  time: string;
  status: string;
  notes?: string;
  createdAt: string;
}

type PortalTab =
  | 'overview'
  | 'profile'
  | 'saved-plans'
  | 'saved-quotes'
  | 'wishlist'
  | 'notifications'
  | 'downloads'
  | 'appointments'
  | 'enquiries'
  | 'settings';

/* ─── Nav Items ──────────────────────────────────────────────────── */
const NAV_ITEMS: { id: PortalTab; label: string; icon: React.ElementType }[] = [
  { id: 'overview',      label: 'Dashboard',    icon: LayoutDashboard },
  { id: 'profile',       label: 'Profile',      icon: User },
  { id: 'saved-plans',   label: 'Saved Plans',  icon: BookOpen },
  { id: 'saved-quotes',  label: 'Saved Quotes', icon: FileText },
  { id: 'wishlist',      label: 'Wishlist',     icon: Heart },
  { id: 'notifications', label: 'Notifications',icon: Bell },
  { id: 'downloads',     label: 'Downloads',    icon: Download },
  { id: 'appointments',  label: 'Appointments', icon: Calendar },
  { id: 'enquiries',     label: 'Enquiries',    icon: Clipboard },
  { id: 'settings',      label: 'Settings',     icon: Settings },
];

/* ─── Avatar ─────────────────────────────────────────────────────── */
function UserAvatar({ user, size = 'md' }: { user: AuthUser & { avatar?: string | null }; size?: 'sm' | 'md' | 'lg' }) {
  const sizeMap = { sm: 'w-9 h-9 text-sm', md: 'w-12 h-12 text-lg', lg: 'w-20 h-20 text-2xl' };
  return user.avatar ? (
    <img
      src={user.avatar}
      alt={user.name}
      className={`${sizeMap[size]} rounded-full object-cover border-2 border-brand-gold/40 shadow-md`}
    />
  ) : (
    <div className={`${sizeMap[size]} rounded-full bg-gradient-to-br from-brand-gold/30 to-brand-gold/10 text-brand-gold font-black font-display flex items-center justify-center border-2 border-brand-gold/30 shadow-md`}>
      {user.name.trim().charAt(0).toUpperCase()}
    </div>
  );
}

/* ─── Stat Card ──────────────────────────────────────────────────── */
function StatCard({ icon: Icon, label, value, gradient }: { icon: React.ElementType; label: string; value: string | number; gradient: string }) {
  return (
    <div className="relative p-5 rounded-2xl border border-white/8 bg-brand-surface-high overflow-hidden">
      <div className={`absolute inset-0 opacity-[0.04] bg-gradient-to-br ${gradient}`} />
      <div className="relative flex items-start justify-between">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-brand-on-surface-variant mb-2">{label}</p>
          <p className="font-display text-2xl font-black text-white">{value}</p>
        </div>
        <div className={`p-2.5 rounded-xl bg-gradient-to-br ${gradient} opacity-80`}>
          <Icon size={16} className="text-white" />
        </div>
      </div>
    </div>
  );
}

/* ─── Empty State ─────────────────────────────────────────────────── */
function EmptyState({ icon: Icon, title, desc, action }: { icon: React.ElementType; title: string; desc: string; action?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/8 flex items-center justify-center mb-5">
        <Icon size={28} className="text-brand-on-surface-variant/30" />
      </div>
      <h3 className="font-display text-sm font-bold uppercase tracking-widest text-brand-on-surface mb-2">{title}</h3>
      <p className="text-xs text-brand-on-surface-variant/60 max-w-xs leading-relaxed">{desc}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

/* ─── Status Badge ────────────────────────────────────────────────── */
function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    New: 'bg-blue-500/10 text-blue-400',
    Pending: 'bg-amber-500/10 text-amber-400',
    'In Progress': 'bg-purple-500/10 text-purple-400',
    Contacted: 'bg-cyan-500/10 text-cyan-400',
    Completed: 'bg-emerald-500/10 text-emerald-400',
    Approved: 'bg-emerald-500/10 text-emerald-400',
    Rejected: 'bg-red-500/10 text-red-400',
    Rescheduled: 'bg-orange-500/10 text-orange-400',
  };
  return (
    <span className={`inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full ${map[status] ?? 'bg-white/5 text-white'}`}>
      {status}
    </span>
  );
}

/* ─── Main Component ─────────────────────────────────────────────── */
interface ClientPortalProps {
  currentUser: AuthUser;
  onLogout: () => void;
  onNavigate: (path: string) => void;
  onInquire: () => void;
}

const ClientPortal: React.FC<ClientPortalProps> = ({ currentUser, onLogout, onNavigate, onInquire }) => {
  const [tab, setTab] = useState<PortalTab>('overview');
  const [mobileOpen, setMobileOpen] = useState(false);

  /* profile state */
  const [editName, setEditName] = useState(currentUser.name);
  const [editPhone, setEditPhone] = useState(currentUser.phone || '');
  const [editPassword, setEditPassword] = useState('');
  const [editAvatar, setEditAvatar] = useState<string | null>(currentUser.avatar || null);
  const [profileMsg, setProfileMsg] = useState<string | null>(null);
  const [profileErr, setProfileErr] = useState<string | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);

  /* enquiries */
  const [enquiries, setEnquiries] = useState<Inquiry[]>([]);
  const [enquiriesLoading, setEnquiriesLoading] = useState(false);

  /* appointments */
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [apptLoading, setApptLoading] = useState(false);

  /* fetchers */
  const fetchEnquiries = useCallback(async () => {
    setEnquiriesLoading(true);
    try {
      const res = await apiFetch('/api/enquiries/mine');
      const d = await res.json();
      if (d.success) setEnquiries(d.data || []);
    } catch { /* ignore */ } finally { setEnquiriesLoading(false); }
  }, []);

  const fetchAppointments = useCallback(async () => {
    setApptLoading(true);
    try {
      const res = await apiFetch('/api/appointments/mine');
      const d = await res.json();
      if (d.success) setAppointments(d.data || []);
    } catch { /* ignore */ } finally { setApptLoading(false); }
  }, []);

  useEffect(() => {
    fetchEnquiries();
    fetchAppointments();
  }, [fetchEnquiries, fetchAppointments]);

  /* profile save */
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileMsg(null); setProfileErr(null); setProfileLoading(true);
    try {
      const payload: Record<string, string> = { name: editName };
      if (editPhone) payload.phone = editPhone;
      if (editPassword) payload.password = editPassword;
      if (editAvatar) payload.avatar = editAvatar;
      const res = await apiFetch('/api/auth/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const d = await res.json();
      if (res.ok && d.success) {
        setProfileMsg('Profile saved successfully!');
        setEditPassword('');
        await fetchUserProfile();
      } else {
        setProfileErr(d.message || 'Save failed');
      }
    } catch { setProfileErr('Network error'); } finally { setProfileLoading(false); }
  };

  /* avatar upload */
  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setProfileLoading(true); setProfileErr(null);
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('fileType', 'image');
      const res = await apiFetch('/api/uploads', { method: 'POST', body: fd });
      const d = await res.json();
      if (!res.ok || !d.success) throw new Error(d.message || 'Upload failed');
      setEditAvatar(d.data.url);
      setProfileMsg('Avatar updated! Click Save Profile to apply.');
    } catch (err: any) { setProfileErr(err.message); } finally { setProfileLoading(false); }
  };

  /* nav helper */
  const goTo = (t: PortalTab) => { setTab(t); setMobileOpen(false); };

  /* ── Render Tabs ── */
  const renderContent = () => {
    switch (tab) {

      /* ── Overview ── */
      case 'overview':
        return (
          <div className="space-y-6">
            {/* Welcome Banner */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-brand-gold/20 via-brand-gold/5 to-transparent border border-brand-gold/20 p-6">
              <div className="absolute -right-8 -top-8 w-40 h-40 rounded-full bg-brand-gold/5 blur-2xl" />
              <div className="relative flex items-center gap-4">
                <UserAvatar user={{ ...currentUser, avatar: editAvatar || currentUser.avatar }} size="lg" />
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-brand-gold mb-1">Welcome back</p>
                  <h2 className="font-display text-xl font-black text-white">{currentUser.name}</h2>
                  <p className="text-xs text-brand-on-surface-variant mt-0.5">{currentUser.email}</p>
                </div>
              </div>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard icon={Clipboard} label="Enquiries"    value={enquiries.length}    gradient="from-blue-600 to-blue-400" />
              <StatCard icon={Calendar}  label="Appointments" value={appointments.length} gradient="from-purple-600 to-purple-400" />
              <StatCard icon={Star}      label="Saved Plans"  value="0"                   gradient="from-amber-600 to-amber-400" />
              <StatCard icon={Heart}     label="Wishlist"     value="0"                   gradient="from-rose-600 to-rose-400" />
            </div>

            {/* Recent Enquiries */}
            <div className="bg-brand-surface-high rounded-2xl border border-white/8 overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-white/8">
                <h3 className="font-display text-xs font-black uppercase tracking-widest text-brand-on-surface">Recent Enquiries</h3>
                <button onClick={() => goTo('enquiries')}
                  className="text-[10px] font-bold uppercase tracking-widest text-brand-gold hover:text-brand-gold/70 flex items-center gap-1 transition-colors">
                  View All <ChevronRight size={12} />
                </button>
              </div>
              {enquiries.length === 0 ? (
                <div className="px-5 py-8 text-center text-xs text-brand-on-surface-variant/50">No enquiries yet.</div>
              ) : (
                <div className="divide-y divide-white/5">
                  {enquiries.slice(0, 3).map((q: any) => (
                    <div key={q._id || q.id} className="flex items-center justify-between px-5 py-4">
                      <div>
                        <p className="text-sm font-semibold text-white">{q.service}</p>
                        <p className="text-[11px] text-brand-on-surface-variant mt-0.5 line-clamp-1">{q.message}</p>
                      </div>
                      <StatusBadge status={q.status || 'New'} />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div>
              <h3 className="font-display text-xs font-black uppercase tracking-widest text-brand-on-surface mb-4">Quick Actions</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {[
                  { label: 'New Enquiry',       icon: Clipboard, action: onInquire,                          color: 'text-blue-400' },
                  { label: 'My Appointments',   icon: Calendar,  action: () => goTo('appointments'),         color: 'text-purple-400' },
                  { label: 'Browse House Plans', icon: HomeIcon, action: () => onNavigate('/house-plans'),   color: 'text-amber-400' },
                ].map((a) => (
                  <button key={a.label} onClick={a.action}
                    className="flex items-center gap-3 p-4 rounded-xl bg-brand-surface-high border border-white/8 hover:border-white/15 hover:bg-white/5 transition-all text-left group">
                    <div className={`${a.color} group-hover:scale-110 transition-transform`}>
                      <a.icon size={18} />
                    </div>
                    <span className="text-xs font-bold text-brand-on-surface-variant group-hover:text-white transition-colors">{a.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        );

      /* ── Profile ── */
      case 'profile':
        return (
          <div className="space-y-6 max-w-lg">
            <h2 className="font-display text-base font-black uppercase tracking-widest text-brand-on-surface">My Profile</h2>

            {/* Avatar Card */}
            <div className="p-5 rounded-2xl bg-brand-surface-high border border-white/8 flex items-center gap-5">
              <div className="relative">
                {editAvatar ? (
                  <img src={editAvatar} alt="Avatar" className="w-20 h-20 rounded-full object-cover border-2 border-brand-gold/40" />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-brand-gold/30 to-brand-gold/10 text-brand-gold font-black font-display text-2xl flex items-center justify-center border-2 border-brand-gold/30">
                    {currentUser.name.trim().charAt(0).toUpperCase()}
                  </div>
                )}
                <label className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-brand-gold flex items-center justify-center cursor-pointer hover:bg-brand-gold/80 transition-colors shadow">
                  <Upload size={12} className="text-black" />
                  <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} disabled={profileLoading} />
                </label>
              </div>
              <div>
                <p className="font-bold text-white text-sm">{currentUser.name}</p>
                <p className="text-xs text-brand-on-surface-variant">{currentUser.email}</p>
                <span className="inline-block mt-1.5 px-2 py-0.5 rounded-full bg-brand-gold/10 text-brand-gold text-[9px] font-bold uppercase tracking-widest border border-brand-gold/20">
                  Premium Client
                </span>
              </div>
            </div>

            {profileMsg && (
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs rounded-xl flex items-center gap-2">
                <CheckCircle size={13} />{profileMsg}
              </div>
            )}
            {profileErr && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-xl flex items-center gap-2">
                <AlertCircle size={13} />{profileErr}
              </div>
            )}

            <form onSubmit={handleSaveProfile} className="space-y-4">
              {[
                { label: 'Full Name',    icon: User,  val: editName,     set: setEditName,     type: 'text',     ph: '' },
                { label: 'Phone Number', icon: Phone, val: editPhone,    set: setEditPhone,    type: 'tel',      ph: '+91 9876543210' },
                { label: 'New Password', icon: Lock,  val: editPassword, set: setEditPassword, type: 'password', ph: 'Leave blank to keep current' },
              ].map((f) => (
                <div key={f.label}>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-brand-on-surface-variant mb-1.5">{f.label}</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-3 flex items-center text-brand-on-surface-variant/40"><f.icon size={14} /></span>
                    <input type={f.type} value={f.val} onChange={(e) => f.set(e.target.value)} placeholder={f.ph}
                      className="w-full bg-brand-surface-container border border-white/8 pl-9 pr-4 py-2.5 text-sm rounded-xl focus:outline-none focus:border-brand-gold/40 text-brand-on-surface placeholder:text-brand-on-surface-variant/30 transition-colors" />
                  </div>
                </div>
              ))}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-brand-on-surface-variant mb-1.5">Email Address</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-3 flex items-center text-brand-on-surface-variant/30"><Mail size={14} /></span>
                  <input disabled value={currentUser.email} className="w-full bg-brand-surface border border-white/5 pl-9 pr-4 py-2.5 text-sm rounded-xl text-brand-on-surface/40 cursor-not-allowed" />
                </div>
                <p className="text-[10px] text-brand-on-surface-variant/40 mt-1">Email cannot be changed</p>
              </div>
              <button type="submit" disabled={profileLoading}
                className="w-full flex items-center justify-center gap-2 py-3 bg-brand-gold text-[#0a0f18] font-display text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-brand-gold/80 disabled:opacity-50 transition-all">
                {profileLoading ? <Loader2 size={14} className="animate-spin" /> : <Shield size={14} />}
                Save Profile
              </button>
            </form>
          </div>
        );

      /* ── Enquiries ── */
      case 'enquiries':
        return (
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-base font-black uppercase tracking-widest text-brand-on-surface">My Enquiries</h2>
              <button onClick={fetchEnquiries} className="p-2 rounded-xl border border-white/10 hover:bg-white/5 text-brand-on-surface-variant transition-colors">
                <RefreshCw size={13} />
              </button>
            </div>
            {enquiriesLoading ? (
              <div className="flex justify-center py-16"><Loader2 size={24} className="animate-spin text-brand-gold" /></div>
            ) : enquiries.length === 0 ? (
              <EmptyState icon={Clipboard} title="No Enquiries Yet"
                desc="Submit a project enquiry to get a custom estimate from our architecture team."
                action={
                  <button onClick={onInquire} className="px-5 py-2.5 bg-brand-gold text-[#0a0f18] text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-brand-gold/80 transition-colors">
                    New Enquiry
                  </button>
                }
              />
            ) : (
              <div className="space-y-3">
                {enquiries.map((q: any) => (
                  <div key={q._id || q.id} className="p-4 rounded-2xl bg-brand-surface-high border border-white/8 space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <span className="inline-block px-2.5 py-1 bg-brand-gold/10 text-brand-gold text-[10px] font-bold uppercase tracking-widest rounded-lg">{q.service}</span>
                        {q.blueprintTitle && <p className="text-xs font-semibold text-white mt-1">Blueprint: {q.blueprintTitle}</p>}
                      </div>
                      <StatusBadge status={q.status || 'New'} />
                    </div>
                    <p className="text-xs text-brand-on-surface-variant leading-relaxed italic">"{q.message}"</p>
                    <div className="flex items-center gap-1.5 text-[10px] text-brand-on-surface-variant/50">
                      <Clock size={10} />
                      {q.createdAt ? new Date(q.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : q.date}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      /* ── Appointments ── */
      case 'appointments':
        return (
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-base font-black uppercase tracking-widest text-brand-on-surface">My Appointments</h2>
              <button onClick={fetchAppointments} className="p-2 rounded-xl border border-white/10 hover:bg-white/5 text-brand-on-surface-variant transition-colors">
                <RefreshCw size={13} />
              </button>
            </div>
            {apptLoading ? (
              <div className="flex justify-center py-16"><Loader2 size={24} className="animate-spin text-brand-gold" /></div>
            ) : appointments.length === 0 ? (
              <EmptyState icon={Calendar} title="No Appointments" desc="Book a consultation, site visit, or design review session with our team." />
            ) : (
              <div className="space-y-3">
                {appointments.map((a) => (
                  <div key={a._id} className="p-4 rounded-2xl bg-brand-surface-high border border-white/8">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div>
                        <p className="font-semibold text-white text-sm">{a.service}</p>
                        <p className="text-xs text-brand-on-surface-variant mt-0.5 flex items-center gap-1.5">
                          <Calendar size={11} />{a.date}{a.time ? ` @ ${a.time}` : ''}
                        </p>
                      </div>
                      <StatusBadge status={a.status || 'Pending'} />
                    </div>
                    {a.notes && <p className="text-xs text-brand-on-surface-variant italic bg-white/5 rounded-xl p-3">{a.notes}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      /* ── Settings ── */
      case 'settings':
        return (
          <div className="space-y-6 max-w-lg">
            <h2 className="font-display text-base font-black uppercase tracking-widest text-brand-on-surface">Settings</h2>
            <div className="p-4 rounded-2xl bg-brand-surface-high border border-white/8">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400">Session Active</span>
              </div>
              <p className="text-xs text-brand-on-surface-variant/60 mt-1">
                Your session is secured with HttpOnly cookies. Logging out will clear all credentials.
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-red-500/5 border border-red-500/15 space-y-3">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-red-400">Danger Zone</h3>
              <p className="text-xs text-brand-on-surface-variant/60">These actions will sign you out of your account.</p>
              <div className="flex flex-col gap-2">
                <button onClick={onLogout}
                  className="w-full py-2.5 border border-red-500/20 text-red-400 hover:bg-red-500/10 text-[10px] font-bold uppercase tracking-widest rounded-xl transition-all">
                  Logout Account
                </button>
                <button onClick={async () => { await signOutAllDevices(); onLogout(); }}
                  className="w-full py-2.5 border border-red-500/20 bg-red-500/5 text-red-400 hover:bg-red-500/10 text-[10px] font-bold uppercase tracking-widest rounded-xl transition-all">
                  Sign Out All Devices
                </button>
              </div>
            </div>
          </div>
        );

      /* ── Placeholder tabs ── */
      default: {
        const meta: Record<string, { icon: React.ElementType; title: string; desc: string }> = {
          'saved-plans':   { icon: BookOpen, title: 'Saved Plans',   desc: 'Save your favourite house plans and blueprints to review later.' },
          'saved-quotes':  { icon: FileText, title: 'Saved Quotes',  desc: 'Your saved project cost estimates will appear here.' },
          'wishlist':      { icon: Heart,    title: 'Wishlist',      desc: 'Wishlist your favourite design inspirations and mood boards.' },
          'notifications': { icon: Bell,     title: 'Notifications', desc: 'You are all caught up! System notifications will appear here.' },
          'downloads':     { icon: Download, title: 'Downloads',     desc: 'Your approved PDFs, blueprints, and quote sheets will be available here.' },
        };
        const m = meta[tab];
        if (!m) return null;
        return (
          <div className="space-y-5">
            <h2 className="font-display text-base font-black uppercase tracking-widest text-brand-on-surface">{m.title}</h2>
            <EmptyState icon={m.icon} title={`No ${m.title} Yet`} desc={m.desc} />
          </div>
        );
      }
    }
  };

  /* ── Root Layout ── */
  return (
    <div className="min-h-screen bg-brand-surface flex">
      {/* Mobile Overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 bg-black/60 md:hidden" onClick={() => setMobileOpen(false)} />
      )}

      {/* ── Sidebar ── */}
      <aside className={`fixed md:static top-0 left-0 h-full z-50 md:z-auto w-64 bg-brand-surface-high border-r border-white/8 flex flex-col transform transition-transform duration-300 ${mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'} shrink-0`}>
        {/* Brand */}
        <div className="px-5 py-6 border-b border-white/8 flex items-center justify-between">
          <div>
            <p className="font-display text-[8px] font-black uppercase tracking-[0.3em] text-brand-gold">NVS Buildcon</p>
            <p className="font-display text-[9px] font-bold uppercase tracking-widest text-brand-on-surface-variant/50 mt-0.5">Client Portal</p>
          </div>
          <button onClick={() => setMobileOpen(false)} className="md:hidden p-1.5 rounded-lg hover:bg-white/5 text-brand-on-surface-variant">
            <X size={15} />
          </button>
        </div>

        {/* User Summary */}
        <div className="px-5 py-4 border-b border-white/8">
          <div className="flex items-center gap-3">
            <UserAvatar user={{ ...currentUser, avatar: editAvatar || currentUser.avatar }} size="sm" />
            <div className="min-w-0">
              <p className="text-xs font-bold text-white truncate">{currentUser.name}</p>
              <p className="text-[9px] text-brand-on-surface-variant/60 truncate">{currentUser.email}</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-0.5">
          {NAV_ITEMS.map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => goTo(id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all text-[11px] font-bold uppercase tracking-widest ${tab === id ? 'bg-brand-gold text-[#0a0f18] shadow-md shadow-brand-gold/15' : 'text-brand-on-surface-variant hover:bg-white/5 hover:text-white'}`}>
              <Icon size={14} />
              {label}
            </button>
          ))}
        </nav>

        {/* Logout */}
        <div className="p-3 border-t border-white/8">
          <button onClick={onLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[11px] font-bold uppercase tracking-widest text-red-400 hover:bg-red-500/10 transition-all">
            <LogOut size={14} />Logout
          </button>
        </div>
      </aside>

      {/* ── Main ── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="sticky top-0 z-30 bg-brand-surface border-b border-white/8 px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => setMobileOpen(true)} className="md:hidden p-2 rounded-xl border border-white/10 hover:bg-white/5 text-brand-on-surface-variant transition-colors">
              <Menu size={16} />
            </button>
            <h1 className="text-xs font-black uppercase tracking-widest text-brand-on-surface">
              {NAV_ITEMS.find(n => n.id === tab)?.label ?? 'Portal'}
            </h1>
          </div>
          <button onClick={() => onNavigate('/')}
            className="hidden sm:flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-brand-on-surface-variant hover:text-brand-gold transition-colors">
            <ExternalLink size={12} />Back to Site
          </button>
        </header>

        {/* Content */}
        <main className="flex-1 p-5 sm:p-6 lg:p-8 overflow-y-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={tab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              {renderContent()}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
};

export default ClientPortal;
