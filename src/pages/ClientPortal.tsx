import React, { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  LayoutDashboard, User, BookOpen, FileText, Heart, Bell,
  Download, Calendar, Clipboard, Settings, LogOut, ChevronRight,
  Upload, Lock, Phone, Mail, Shield, RefreshCw, ExternalLink,
  AlertCircle, CheckCircle, Clock, Star, Home as HomeIcon, Loader2, X, Menu, Eye
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

interface SavedQuote {
  _id: string;
  title: string;
  amount: number;
  area?: number;
  details?: string;
  date: string;
}

interface WishlistItem {
  _id: string;
  title: string;
  imageUrl?: string;
  category?: string;
  refId: string;
}

interface PortalNotification {
  _id: string;
  message: string;
  read: boolean;
  type: 'enquiry' | 'appointment' | 'download' | 'general';
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
      className={`${sizeMap[size]} rounded-full object-cover border-2 border-brand-gold/40 shadow-md transition-transform duration-300 hover:scale-105`}
    />
  ) : (
    <div className={`${sizeMap[size]} rounded-full bg-gradient-to-br from-brand-gold/30 to-brand-gold/10 text-brand-gold font-black font-display flex items-center justify-center border-2 border-brand-gold/30 shadow-md`}>
      {user.name.trim().charAt(0).toUpperCase()}
    </div>
  );
}

/* ─── Stat Card ──────────────────────────────────────────────────── */
function StatCard({ icon: Icon, label, value, gradient, onClick }: { icon: React.ElementType; label: string; value: string | number; gradient: string; onClick?: () => void }) {
  return (
    <div 
      onClick={onClick}
      className={`relative p-5 rounded-2xl border border-white/8 bg-brand-surface-high overflow-hidden transition-all duration-300 ${onClick ? 'cursor-pointer hover:border-brand-gold/30 hover:bg-white/[0.02]' : ''}`}
    >
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
    <div className="flex flex-col items-center justify-center py-20 text-center glass-panel rounded-2xl border border-white/5 px-6">
      <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/8 flex items-center justify-center mb-5">
        <Icon size={28} className="text-brand-on-surface-variant/40 animate-pulse" />
      </div>
      <h3 className="font-display text-sm font-bold uppercase tracking-widest text-brand-on-surface mb-2">{title}</h3>
      <p className="text-xs text-brand-on-surface-variant/65 max-w-xs leading-relaxed">{desc}</p>
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
  onInquire: (title?: string) => void;
}

const ClientPortal: React.FC<ClientPortalProps> = ({ currentUser, onLogout, onNavigate, onInquire }) => {
  const [tab, setTab] = useState<PortalTab>('overview');
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

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

  /* saved plans */
  const [savedPlans, setSavedPlans] = useState<any[]>([]);
  const [savedPlansLoading, setSavedPlansLoading] = useState(false);

  /* saved quotes */
  const [savedQuotes, setSavedQuotes] = useState<SavedQuote[]>([]);
  const [savedQuotesLoading, setSavedQuotesLoading] = useState(false);

  /* wishlist */
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [wishlistLoading, setWishlistLoading] = useState(false);

  /* notifications */
  const [notifications, setNotifications] = useState<PortalNotification[]>([]);
  const [notificationsLoading, setNotificationsLoading] = useState(false);

  /* downloads */
  const [downloads, setDownloads] = useState<string[]>([]);
  const [downloadsLoading, setDownloadsLoading] = useState(false);

  /* Tab-URL Sync */
  useEffect(() => {
    const path = location.pathname.substring(1);
    if (path === 'dashboard') {
      setTab('overview');
    } else if (['profile', 'saved-plans', 'saved-quotes', 'wishlist', 'notifications', 'downloads', 'appointments', 'enquiries', 'settings'].includes(path)) {
      setTab(path as PortalTab);
    }
  }, [location.pathname]);

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

  const fetchSavedPlans = useCallback(async () => {
    setSavedPlansLoading(true);
    try {
      const res = await apiFetch('/api/user/saved-plans');
      const d = await res.json();
      if (d.success) setSavedPlans(d.data || []);
    } catch { /* ignore */ } finally { setSavedPlansLoading(false); }
  }, []);

  const fetchSavedQuotes = useCallback(async () => {
    setSavedQuotesLoading(true);
    try {
      const res = await apiFetch('/api/user/saved-quotes');
      const d = await res.json();
      if (d.success) setSavedQuotes(d.data || []);
    } catch { /* ignore */ } finally { setSavedQuotesLoading(false); }
  }, []);

  const fetchWishlist = useCallback(async () => {
    setWishlistLoading(true);
    try {
      const res = await apiFetch('/api/user/wishlist');
      const d = await res.json();
      if (d.success) setWishlist(d.data || []);
    } catch { /* ignore */ } finally { setWishlistLoading(false); }
  }, []);

  const fetchNotifications = useCallback(async () => {
    setNotificationsLoading(true);
    try {
      const res = await apiFetch('/api/user/notifications');
      const d = await res.json();
      if (d.success) setNotifications(d.data || []);
    } catch { /* ignore */ } finally { setNotificationsLoading(false); }
  }, []);

  const fetchDownloads = useCallback(async () => {
    setDownloadsLoading(true);
    try {
      const res = await apiFetch('/api/user/pdfs');
      const d = await res.json();
      if (d.success) setDownloads(d.data || []);
    } catch { /* ignore */ } finally { setDownloadsLoading(false); }
  }, []);

  useEffect(() => {
    fetchEnquiries();
    fetchAppointments();
    fetchSavedPlans();
    fetchSavedQuotes();
    fetchWishlist();
    fetchNotifications();
    fetchDownloads();
  }, [
    fetchEnquiries,
    fetchAppointments,
    fetchSavedPlans,
    fetchSavedQuotes,
    fetchWishlist,
    fetchNotifications,
    fetchDownloads
  ]);

  /* handlers */
  const handleRemovePlan = async (id: string) => {
    try {
      const res = await apiFetch(`/api/user/saved-plans/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setSavedPlans(prev => prev.filter(p => p._id !== id && p.id !== id));
      }
    } catch { /* ignore */ }
  };

  const handleRemoveQuote = async (id: string) => {
    try {
      const res = await apiFetch(`/api/user/saved-quotes/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setSavedQuotes(prev => prev.filter(q => q._id !== id));
      }
    } catch { /* ignore */ }
  };

  const handleRemoveWishlist = async (refId: string) => {
    try {
      const res = await apiFetch(`/api/user/wishlist/${refId}`, { method: 'DELETE' });
      if (res.ok) {
        setWishlist(prev => prev.filter(item => item.refId !== refId && item._id !== refId));
      }
    } catch { /* ignore */ }
  };

  const handleMarkNotificationRead = async (id: string) => {
    try {
      const res = await apiFetch(`/api/user/notifications/${id}/read`, { method: 'PATCH' });
      if (res.ok) {
        setNotifications(prev => prev.map(n => n._id === id ? { ...n, read: true } : n));
      }
    } catch { /* ignore */ }
  };

  const handleMarkAllNotificationsRead = async () => {
    try {
      const res = await apiFetch('/api/user/notifications/read-all', { method: 'PATCH' });
      if (res.ok) {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      }
    } catch { /* ignore */ }
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(val);
  };

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
  const goTo = (t: PortalTab) => {
    setTab(t);
    setMobileOpen(false);
    if (t === 'overview') {
      onNavigate('/dashboard');
    } else {
      onNavigate(`/${t}`);
    }
  };

  const unreadNotificationsCount = notifications.filter(n => !n.read).length;

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
              <StatCard icon={Clipboard} label="Enquiries"    value={enquiries.length}    gradient="from-blue-600 to-blue-400" onClick={() => goTo('enquiries')} />
              <StatCard icon={Calendar}  label="Appointments" value={appointments.length} gradient="from-purple-600 to-purple-400" onClick={() => goTo('appointments')} />
              <StatCard icon={Star}      label="Saved Plans"  value={savedPlans.length}   gradient="from-amber-600 to-amber-400" onClick={() => goTo('saved-plans')} />
              <StatCard icon={Heart}     label="Wishlist"     value={wishlist.length}     gradient="from-rose-600 to-rose-400" onClick={() => goTo('wishlist')} />
            </div>

            {/* Enquiries & Appointments split layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Enquiries */}
              <div className="bg-brand-surface-high rounded-2xl border border-white/8 overflow-hidden flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between px-5 py-4 border-b border-white/8">
                    <h3 className="font-display text-xs font-black uppercase tracking-widest text-brand-on-surface">Recent Enquiries</h3>
                    <button onClick={() => goTo('enquiries')}
                      className="text-[10px] font-bold uppercase tracking-widest text-brand-gold hover:text-brand-gold/70 flex items-center gap-1 transition-colors">
                      View All <ChevronRight size={12} />
                    </button>
                  </div>
                  {enquiries.length === 0 ? (
                    <div className="px-5 py-12 text-center text-xs text-brand-on-surface-variant/50">No enquiries yet.</div>
                  ) : (
                    <div className="divide-y divide-white/5">
                      {enquiries.slice(0, 3).map((q: any) => (
                        <div key={q._id || q.id} className="flex items-center justify-between px-5 py-4">
                          <div>
                            <p className="text-xs font-bold text-white">{q.service}</p>
                            <p className="text-[10px] text-brand-on-surface-variant/65 mt-0.5 line-clamp-1">{q.message}</p>
                          </div>
                          <StatusBadge status={q.status || 'New'} />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Recent Appointments */}
              <div className="bg-brand-surface-high rounded-2xl border border-white/8 overflow-hidden flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between px-5 py-4 border-b border-white/8">
                    <h3 className="font-display text-xs font-black uppercase tracking-widest text-brand-on-surface">Recent Appointments</h3>
                    <button onClick={() => goTo('appointments')}
                      className="text-[10px] font-bold uppercase tracking-widest text-brand-gold hover:text-brand-gold/70 flex items-center gap-1 transition-colors">
                      View All <ChevronRight size={12} />
                    </button>
                  </div>
                  {appointments.length === 0 ? (
                    <div className="px-5 py-12 text-center text-xs text-brand-on-surface-variant/50">No appointments scheduled.</div>
                  ) : (
                    <div className="divide-y divide-white/5">
                      {appointments.slice(0, 3).map((a: any) => (
                        <div key={a._id || a.id} className="flex items-center justify-between px-5 py-4">
                          <div>
                            <p className="text-xs font-bold text-white">{a.service}</p>
                            <p className="text-[10px] text-brand-on-surface-variant/65 mt-0.5">{a.date} @ {a.time}</p>
                          </div>
                          <StatusBadge status={a.status || 'Pending'} />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div>
              <h3 className="font-display text-xs font-black uppercase tracking-widest text-brand-on-surface mb-4">Quick Actions</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {[
                  { label: 'New Enquiry',       icon: Clipboard, action: () => onInquire(),                  color: 'text-blue-400' },
                  { label: 'My Appointments',   icon: Calendar,  action: () => goTo('appointments'),         color: 'text-purple-400' },
                  { label: 'Browse House Plans', icon: HomeIcon, action: () => onNavigate('/house-plans'),   color: 'text-amber-400' },
                ].map((a) => (
                  <button key={a.label} onClick={a.action}
                    className="flex items-center gap-3 p-4 rounded-xl bg-brand-surface-high border border-white/8 hover:border-brand-gold/20 hover:bg-white/[0.02] transition-all text-left group">
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
                  <img src={editAvatar} alt="Avatar" className="w-20 h-20 rounded-full object-cover border-2 border-brand-gold/40 shadow-lg" />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-brand-gold/30 to-brand-gold/10 text-brand-gold font-black font-display text-2xl flex items-center justify-center border-2 border-brand-gold/30 shadow-lg">
                    {currentUser.name.trim().charAt(0).toUpperCase()}
                  </div>
                )}
                <label className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-brand-gold flex items-center justify-center cursor-pointer hover:bg-brand-gold/80 transition-colors shadow-md">
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

      /* ── Saved Plans ── */
      case 'saved-plans':
        return (
          <div className="space-y-5">
            <h2 className="font-display text-base font-black uppercase tracking-widest text-brand-on-surface">Saved Plans</h2>
            {savedPlansLoading ? (
              <div className="flex justify-center py-16"><Loader2 size={24} className="animate-spin text-brand-gold" /></div>
            ) : savedPlans.length === 0 ? (
              <EmptyState icon={BookOpen} title="No Saved Plans" desc="Explore house plans and bookmark them to review later."
                action={
                  <button onClick={() => onNavigate('/house-plans')}
                    className="px-5 py-2.5 bg-brand-gold text-[#0a0f18] text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-brand-gold/80 transition-colors">
                    Browse House Plans
                  </button>
                }
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {savedPlans.map((plan) => (
                  <div key={plan._id || plan.id} className="glass-panel border border-white/8 hover:border-brand-gold/20 rounded-2xl overflow-hidden flex flex-col justify-between group transition-all duration-300">
                    <div className="relative h-40 overflow-hidden bg-brand-surface-lowest">
                      <img src={plan.imageUrl || plan.previewImage || '/images/project-placeholder.jpg'} alt={plan.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      <div className="absolute top-3 left-3 bg-brand-gold text-black text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded">
                        {plan.category}
                      </div>
                    </div>
                    <div className="p-5 flex-1 flex flex-col justify-between">
                      <div>
                        <h3 className="text-xs font-bold text-white mb-2 uppercase tracking-wide truncate">{plan.title}</h3>
                        <p className="text-[10px] text-brand-on-surface-variant/70 leading-relaxed mb-4 line-clamp-2">{plan.description}</p>
                      </div>
                      <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-2">
                          <a href={plan.pdfUrl || plan.pdf} target="_blank" rel="noopener noreferrer"
                            className="py-2 border border-white/10 hover:border-brand-gold/30 rounded-lg text-[9px] font-bold text-center text-white hover:text-brand-gold transition-colors flex items-center justify-center gap-1.5">
                            <Eye size={11} /> View PDF
                          </a>
                          <button onClick={() => onInquire(plan.title)}
                            className="py-2 bg-brand-gold text-black rounded-lg text-[9px] font-bold text-center hover:bg-brand-gold/90 transition-colors flex items-center justify-center gap-1.5">
                            Inquire Plan
                          </button>
                        </div>
                        <button onClick={() => handleRemovePlan(plan._id || plan.id)}
                          className="w-full py-1.5 border border-red-500/10 hover:bg-red-500/10 text-red-400 rounded-lg text-[9px] font-bold transition-all">
                          Remove Plan
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      /* ── Saved Quotes ── */
      case 'saved-quotes':
        return (
          <div className="space-y-5">
            <h2 className="font-display text-base font-black uppercase tracking-widest text-brand-on-surface">Saved Quotes</h2>
            {savedQuotesLoading ? (
              <div className="flex justify-center py-16"><Loader2 size={24} className="animate-spin text-brand-gold" /></div>
            ) : savedQuotes.length === 0 ? (
              <EmptyState icon={FileText} title="No Saved Quotes" desc="Generate and save estimates to your profile from the pricing section."
                action={
                  <button onClick={() => onNavigate('/')}
                    className="px-5 py-2.5 bg-brand-gold text-[#0a0f18] text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-brand-gold/80 transition-colors">
                    Go to Pricing Calculator
                  </button>
                }
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {savedQuotes.map((quote) => (
                  <div key={quote._id} className="glass-panel border border-white/8 hover:border-brand-gold/20 p-5 rounded-2xl flex flex-col justify-between gap-4 group transition-all">
                    <div>
                      <div className="flex items-center justify-between gap-2 border-b border-white/5 pb-3">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-brand-gold">{quote.title}</span>
                        <span className="text-[9px] text-brand-on-surface-variant/40">{new Date(quote.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                      </div>
                      <div className="py-4">
                        <p className="text-[10px] uppercase tracking-widest text-brand-on-surface-variant/50">Estimated Cost</p>
                        <p className="font-display text-2xl font-black text-brand-gold mt-1">{formatCurrency(quote.amount)}</p>
                      </div>
                      {quote.area && (
                        <p className="text-[10px] text-brand-on-surface-variant/60 font-mono">Area: {quote.area} sq.ft</p>
                      )}
                      {quote.details && (
                        <p className="text-[10px] text-brand-on-surface-variant/50 italic mt-2 line-clamp-2">{quote.details}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 border-t border-white/5 pt-3">
                      <button onClick={() => {
                        const printWindow = window.open('', '_blank');
                        if (printWindow) {
                          printWindow.document.write(`
                            <html>
                              <head>
                                <title>NVS Buildcon - Quote Estimate</title>
                                <style>
                                  body { font-family: sans-serif; padding: 40px; color: #333; }
                                  h1 { color: #8a6f2e; border-bottom: 2px solid #c9a84c; padding-bottom: 10px; }
                                  .row { display: flex; justify-content: space-between; margin: 15px 0; border-bottom: 1px dashed #ddd; padding-bottom: 5px; }
                                  .total { font-size: 24px; font-weight: bold; color: #8a6f2e; margin-top: 30px; }
                                </style>
                              </head>
                              <body>
                                <h1>NVS Buildcon - Quotation Estimate</h1>
                                <div class="row"><strong>Service:</strong> <span>${quote.title}</span></div>
                                <div class="row"><strong>Date:</strong> <span>${new Date(quote.date).toLocaleDateString('en-IN')}</span></div>
                                <div class="row"><strong>Built-up Area:</strong> <span>${quote.area || 'N/A'} sq.ft</span></div>
                                <div class="row"><strong>Price:</strong> <span>${formatCurrency(quote.amount)}</span></div>
                                <div class="total">Estimated Total: ${formatCurrency(quote.amount)}</div>
                                <script>window.print();</script>
                              </body>
                            </html>
                          `);
                          printWindow.document.close();
                        }
                      }}
                        className="flex-1 py-2 border border-white/10 hover:border-brand-gold/30 rounded-lg text-[9px] font-bold text-center text-white hover:text-brand-gold transition-colors flex items-center justify-center gap-1.5">
                        <Eye size={11} /> Print Quote
                      </button>
                      <button onClick={() => handleRemoveQuote(quote._id)}
                        className="py-2 border border-red-500/10 hover:bg-red-500/10 text-red-400 rounded-lg text-[9px] font-bold px-3 transition-colors">
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      /* ── Wishlist ── */
      case 'wishlist':
        return (
          <div className="space-y-5">
            <h2 className="font-display text-base font-black uppercase tracking-widest text-brand-on-surface">Wishlist</h2>
            {wishlistLoading ? (
              <div className="flex justify-center py-16"><Loader2 size={24} className="animate-spin text-brand-gold" /></div>
            ) : wishlist.length === 0 ? (
              <EmptyState icon={Heart} title="Wishlist is Empty" desc="Save projects or gallery photos to keep design inspirations in one place."
                action={
                  <button onClick={() => onNavigate('/projects')}
                    className="px-5 py-2.5 bg-brand-gold text-[#0a0f18] text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-brand-gold/80 transition-colors">
                    Explore Projects
                  </button>
                }
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {wishlist.map((item) => (
                  <div key={item._id || item.refId} className="glass-panel border border-white/8 hover:border-brand-gold/20 rounded-2xl overflow-hidden flex flex-col justify-between group transition-all duration-300">
                    <div className="relative h-44 overflow-hidden bg-brand-surface-lowest">
                      <img src={item.imageUrl || '/images/project-placeholder.jpg'} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      {item.category && (
                        <div className="absolute top-3 left-3 bg-brand-gold text-black text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded">
                          {item.category}
                        </div>
                      )}
                    </div>
                    <div className="p-5 flex flex-col justify-between flex-1">
                      <h3 className="text-xs font-bold text-white mb-4 uppercase tracking-wide truncate">{item.title}</h3>
                      <div className="flex gap-2">
                        <button onClick={() => onInquire(item.title)}
                          className="flex-1 py-2 bg-brand-gold text-black text-[9px] font-bold rounded-lg text-center hover:bg-brand-gold/90 transition-colors flex items-center justify-center gap-1.5">
                          Request Quote
                        </button>
                        <button onClick={() => handleRemoveWishlist(item.refId)}
                          className="p-2 border border-red-500/20 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors flex items-center justify-center">
                          <X size={12} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      /* ── Notifications ── */
      case 'notifications':
        return (
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-base font-black uppercase tracking-widest text-brand-on-surface">Notifications</h2>
              {notifications.filter(n => !n.read).length > 0 && (
                <button onClick={handleMarkAllNotificationsRead}
                  className="text-[10px] font-bold uppercase tracking-widest text-brand-gold hover:text-brand-gold/70 transition-colors">
                  Mark All as Read
                </button>
              )}
            </div>
            {notificationsLoading ? (
              <div className="flex justify-center py-16"><Loader2 size={24} className="animate-spin text-brand-gold" /></div>
            ) : notifications.length === 0 ? (
              <EmptyState icon={Bell} title="No Notifications" desc="You are all caught up! Updates regarding quotes, scheduling, and files will show here." />
            ) : (
              <div className="space-y-3">
                {notifications.map((notif) => {
                  const typeColors: Record<string, string> = {
                    enquiry: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
                    appointment: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
                    download: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
                    general: 'bg-white/5 text-white border-white/10'
                  };
                  const Icon = notif.type === 'enquiry' ? Clipboard :
                               notif.type === 'appointment' ? Calendar :
                               notif.type === 'download' ? Download : Bell;
                  return (
                    <div key={notif._id} className={`p-4 rounded-2xl border ${notif.read ? 'bg-brand-surface-high/50 border-white/5 opacity-65' : 'bg-brand-surface-high border-white/10 shadow-lg'} flex items-start gap-4 transition-all`}>
                      <div className={`p-2.5 rounded-xl border ${typeColors[notif.type || 'general']}`}>
                        <Icon size={14} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-xs ${notif.read ? 'text-brand-on-surface-variant' : 'text-white font-semibold'} leading-relaxed`}>{notif.message}</p>
                        <p className="text-[9px] text-brand-on-surface-variant/40 mt-1">{new Date(notif.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</p>
                      </div>
                      {!notif.read && (
                        <button onClick={() => handleMarkNotificationRead(notif._id)}
                          className="px-2.5 py-1 text-[8px] font-bold uppercase tracking-widest text-brand-gold border border-brand-gold/20 hover:bg-brand-gold/10 rounded-lg transition-colors">
                          Mark Read
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );

      /* ── Downloads ── */
      case 'downloads':
        return (
          <div className="space-y-5">
            <h2 className="font-display text-base font-black uppercase tracking-widest text-brand-on-surface">Downloads</h2>
            {downloadsLoading ? (
              <div className="flex justify-center py-16"><Loader2 size={24} className="animate-spin text-brand-gold" /></div>
            ) : downloads.length === 0 ? (
              <EmptyState icon={Download} title="No Downloads" desc="Approved blueprints, contracts, and estimates shared by your designer will appear here." />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {downloads.map((pdf, idx) => {
                  const fileName = decodeURIComponent(pdf.split('/').pop() || 'document.pdf');
                  return (
                    <div key={idx} className="glass-panel border border-white/8 hover:border-brand-gold/20 p-5 rounded-2xl flex items-center justify-between gap-4 group transition-all">
                      <div className="flex items-center gap-4 min-w-0">
                        <div className="p-3 bg-brand-gold/10 text-brand-gold rounded-xl group-hover:scale-105 transition-transform">
                          <FileText size={20} />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-white truncate">{fileName}</p>
                          <p className="text-[10px] text-brand-on-surface-variant/50 mt-1">Shared Documents</p>
                        </div>
                      </div>
                      <a href={pdf} target="_blank" rel="noopener noreferrer"
                        className="p-3 bg-brand-surface-high hover:bg-brand-gold hover:text-black border border-white/10 hover:border-transparent text-white rounded-xl transition-all">
                        <Download size={14} />
                      </a>
                    </div>
                  );
                })}
              </div>
            )}
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
                  <button onClick={() => onInquire()} className="px-5 py-2.5 bg-brand-gold text-[#0a0f18] text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-brand-gold/80 transition-colors">
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

      default:
        return null;
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
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left transition-all text-[11px] font-bold uppercase tracking-widest ${tab === id ? 'bg-brand-gold text-[#0a0f18] shadow-md shadow-brand-gold/15' : 'text-brand-on-surface-variant hover:bg-white/5 hover:text-white'}`}>
              <div className="flex items-center gap-3">
                <Icon size={14} />
                <span>{label}</span>
              </div>
              {id === 'notifications' && unreadNotificationsCount > 0 && (
                <span className={`px-2 py-0.5 text-[9px] font-bold rounded-full transition-colors ${tab === id ? 'bg-[#0a0f18] text-brand-gold' : 'bg-red-500 text-white animate-pulse'}`}>
                  {unreadNotificationsCount}
                </span>
              )}
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
