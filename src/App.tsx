import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { 
  User, Lock, Mail, Phone, Calendar, Clipboard, ShieldAlert, FileText, 
  CheckCircle, Clock, Trash2, UserPlus, Eye, LogOut, Settings, 
  LayoutDashboard, ShieldCheck, Loader2, Sparkles, RefreshCw, Upload, ImagePlus
} from 'lucide-react';
import Navbar from './components/Navbar';
import Concierge from './components/Concierge';
import UserLogin from './pages/UserLogin';
import AdminLogin from './pages/AdminLogin';
import InquiryModal from './components/InquiryModal';
import Projects from './components/Projects';
import HousePlans from './components/HousePlans';
import VisualPortfolio from './components/VisualPortfolio';
import Services from './components/Services';
import Process from './components/Process';
import About from './components/About';
import Footer from './components/Footer';
import Home from './pages/Home';
import TestimonialsPage from './components/TestimonialsPage';
import Contact from './components/Contact';
import DesignWizard from './components/DesignWizard';
import Preloader from './components/Preloader';
import { ViewState, Inquiry } from './types';
import { AuthUser, fetchUserProfile, logout } from './utils/auth';
import { apiFetch } from './utils/api';

export const viewToPath: Record<ViewState, string> = {
  home: '/',
  services: '/services',
  projects: '/projects',
  'house-plans': '/house-plans',
  gallery: '/gallery',
  process: '/process',
  about: '/about',
  testimonials: '/testimonials',
  contact: '/contact',
  'design-wizard': '/design-wizard',
  login: '/login',
  'admin-login': '/admin/login',
  dashboard: '/dashboard',
  'admin-dashboard': '/admin/dashboard',
  profile: '/profile',
  enquiries: '/enquiries',
  settings: '/settings'
};

export const pathToView = (path: string): ViewState => {
  if (path === '/') return 'home';
  if (path === '/services') return 'services';
  if (path === '/projects') return 'projects';
  if (path === '/house-plans') return 'house-plans';
  if (path === '/gallery') return 'gallery';
  if (path === '/process') return 'process';
  if (path === '/about') return 'about';
  if (path === '/testimonials') return 'testimonials';
  if (path === '/contact') return 'contact';
  if (path === '/design-wizard') return 'design-wizard';
  if (path === '/login') return 'login';
  if (path === '/admin/login') return 'admin-login';
  if (path === '/dashboard') return 'dashboard';
  if (path === '/admin/dashboard') return 'admin-dashboard';
  if (path === '/profile') return 'profile';
  if (path === '/enquiries') return 'enquiries';
  if (path === '/settings') return 'settings';
  return 'home';
};

export default function App() {
  const navigate = useNavigate();
  const location = useLocation();
  
  const activeView = pathToView(location.pathname);
  const dashboardTab = activeView === 'profile' || activeView === 'enquiries' || activeView === 'settings'
    ? activeView
    : 'profile';

  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [checkingSession, setCheckingSession] = useState(true);
  
  // Modals & Inquiries
  const [isInquiryOpen, setIsInquiryOpen] = useState(false);
  const [inquiryBlueprintTitle, setInquiryBlueprintTitle] = useState<string | undefined>(undefined);
  const [inquiryService, setInquiryService] = useState<string | undefined>(undefined);

  // Dashboard Data State
  const [enquiries, setEnquiries] = useState<Inquiry[]>([]);
  const [loadingData, setLoadingData] = useState(false);
  const [dataError, setDataError] = useState<string | null>(null);

  // Profile Edit Form State
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editPassword, setEditPassword] = useState('');
  const [profileSuccessMsg, setProfileSuccessMsg] = useState<string | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);

  // Admin Dashboard State
  const [adminTab, setAdminTab] = useState<'stats' | 'users' | 'enquiries' | 'content'>('stats');
  const [adminStats, setAdminStats] = useState<any>(null);
  const [adminUsers, setAdminUsers] = useState<any[]>([]);
  const [adminEnquiries, setAdminEnquiries] = useState<any[]>([]);
  const [contentTitle, setContentTitle] = useState('');
  const [contentCategory, setContentCategory] = useState('Residential');
  const [contentDesc, setContentDesc] = useState('');
  const [contentImageUrl, setContentImageUrl] = useState('');
  const [contentStatus, setContentStatus] = useState<string | null>(null);
  const [contentLoading, setContentLoading] = useState(false);

  // Fetch profile on initial mount to check active session
  useEffect(() => {
    const checkSession = async () => {
      try {
        const user = await fetchUserProfile();
        setCurrentUser(user);
      } catch {
        // No session or network failure — handle gracefully
      } finally {
        setCheckingSession(false);
      }
    };
    checkSession();
  }, []);

  // Guard checks and redirects driven by URL changes
  useEffect(() => {
    if (checkingSession) return;

    const view = pathToView(location.pathname);

    if (currentUser) {
      if (currentUser.role === 'admin') {
        if (view === 'login' || view === 'admin-login') {
          navigate('/admin/dashboard', { replace: true });
          return;
        }
      } else {
        if (view === 'admin-dashboard') {
          navigate('/dashboard', { replace: true });
          return;
        }
        if (view === 'login' || view === 'admin-login') {
          navigate('/dashboard', { replace: true });
          return;
        }
      }
    } else {
      if (['dashboard', 'admin-dashboard', 'profile', 'enquiries', 'settings'].includes(view)) {
        navigate(view === 'admin-dashboard' ? '/admin/login' : '/login', { replace: true });
        return;
      }
    }
  }, [location.pathname, currentUser, checkingSession, navigate]);

  // Fetch dashboard or admin data when activeView changes
  useEffect(() => {
    if (!currentUser) return;
    
    if (activeView === 'dashboard' || activeView === 'enquiries' || activeView === 'profile' || activeView === 'settings') {
      fetchUserEnquiries();
      // Initialize edit profile form
      setEditName(currentUser.name);
      setEditPhone(currentUser.phone || '');
      setEditPassword('');
    } else if (activeView === 'admin-dashboard') {
      fetchAdminStats();
      fetchAdminUsers();
      fetchAdminEnquiries();
    }
  }, [activeView, currentUser]);

  const handleViewChange = (view: ViewState) => {
    const path = viewToPath[view] || '/';
    navigate(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLoginSuccess = async () => {
    const user = await fetchUserProfile();
    setCurrentUser(user);
    if (user?.role === 'admin') {
      handleViewChange('admin-dashboard');
    } else {
      handleViewChange('dashboard');
    }
  };

  const handleLogout = async () => {
    await logout();
    setCurrentUser(null);
    handleViewChange('home');
  };

  // Fetch logged-in user's enquiries
  const fetchUserEnquiries = async () => {
    setLoadingData(true);
    setDataError(null);
    try {
      const res = await apiFetch('/api/enquiries/mine');
      if (res.ok) {
        const result = await res.json();
        if (result.success) {
          setEnquiries(result.data || []);
        }
      } else {
        setDataError('Failed to load enquiries');
      }
    } catch (err) {
      setDataError('Connection error to server');
    } finally {
      setLoadingData(false);
    }
  };

  // Update profile
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSuccessMsg(null);
    setDataError(null);
    setProfileLoading(true);

    try {
      const payload: any = { name: editName };
      if (editPhone) payload.phone = editPhone;
      if (editPassword) payload.password = editPassword;

      const res = await apiFetch('/api/auth/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const result = await res.json();
      if (res.ok && result.success) {
        setProfileSuccessMsg('Profile updated successfully!');
        setEditPassword('');
        // Refresh session
        const updatedUser = await fetchUserProfile();
        setCurrentUser(updatedUser);
      } else {
        setDataError(result.message || 'Failed to update profile');
      }
    } catch (err) {
      setDataError('Network error updating profile');
    } finally {
      setProfileLoading(false);
    }
  };

  // ADMIN OPERATIONS: Fetch admin stats
  const fetchAdminStats = async () => {
    try {
      const res = await apiFetch('/api/admin/stats');
      if (res.ok) {
        const result = await res.json();
        if (result.success) setAdminStats(result.data);
      }
    } catch {
      // Network error — stats remain null; UI handles empty state
    }
  };

  // ADMIN OPERATIONS: Fetch users
  const fetchAdminUsers = async () => {
    try {
      const res = await apiFetch('/api/admin/users');
      if (res.ok) {
        const result = await res.json();
        if (result.success) setAdminUsers(result.data || []);
      }
    } catch {
      // Network error — user list remains empty; UI handles empty state
    }
  };

  // ADMIN OPERATIONS: Fetch all enquiries
  const fetchAdminEnquiries = async () => {
    try {
      const res = await apiFetch('/api/enquiries');
      if (res.ok) {
        const result = await res.json();
        if (result.success) setAdminEnquiries(result.data || []);
      }
    } catch {
      // Network error — enquiry list remains empty; UI handles empty state
    }
  };

  // ADMIN OPERATIONS: Delete user
  const handleDeleteUser = async (id: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    try {
      const res = await apiFetch(`/api/admin/users/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setAdminUsers(adminUsers.filter(u => u.id !== id && u._id !== id));
        fetchAdminStats();
      }
    } catch {
      setDataError('Failed to delete user. Please try again.');
    }
  };

  // ADMIN OPERATIONS: Block/Unblock user
  const handleToggleBlockUser = async (id: string, currentlyBlocked: boolean) => {
    try {
      const res = await apiFetch(`/api/admin/users/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ blocked: !currentlyBlocked })
      });
      if (res.ok) {
        fetchAdminUsers();
      }
    } catch {
      setDataError('Failed to update user status. Please try again.');
    }
  };

  // ADMIN OPERATIONS: Change role
  const handleChangeUserRole = async (id: string, newRole: string) => {
    try {
      const res = await apiFetch(`/api/admin/users/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole })
      });
      if (res.ok) {
        fetchAdminUsers();
        fetchAdminStats();
      }
    } catch {
      setDataError('Failed to change user role. Please try again.');
    }
  };

  const handleAdminImageUpload = async (file: File) => {
    setContentStatus(null);
    setContentLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('fileType', 'image');
      const res = await apiFetch('/api/uploads', {
        method: 'POST',
        body: formData
      });
      const result = await res.json();
      if (!res.ok || !result.success) throw new Error(result.message || 'Image upload failed');
      setContentImageUrl(result.data.url);
      setContentStatus('Image uploaded. Add a title and publish it to the gallery.');
    } catch (err) {
      setContentStatus(err instanceof Error ? err.message : 'Image upload failed');
    } finally {
      setContentLoading(false);
    }
  };

  const handleCreateGalleryItem = async (e: React.FormEvent) => {
    e.preventDefault();
    setContentStatus(null);
    setContentLoading(true);
    try {
      const res = await apiFetch('/api/gallery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: contentTitle,
          category: contentCategory,
          imageUrl: contentImageUrl,
          desc: contentDesc,
          description: contentDesc,
          alt: contentTitle
        })
      });
      const result = await res.json();
      if (!res.ok || !result.success) throw new Error(result.message || 'Gallery item could not be created');
      setContentTitle('');
      setContentDesc('');
      setContentImageUrl('');
      setContentStatus('Gallery item published successfully.');
      fetchAdminStats();
    } catch (err) {
      setContentStatus(err instanceof Error ? err.message : 'Gallery item could not be created');
    } finally {
      setContentLoading(false);
    }
  };

  const handleInquire = (blueprintTitleOrService?: string) => {
    if (blueprintTitleOrService) {
      if (
        [
          'Architectural Design Division',
          'Structural Engineering & Physics',
          'Premium Interior Architecture',
          'Full Turnkey Construction',
          'Net-Zero Thermal Engineering'
        ].includes(blueprintTitleOrService)
      ) {
        setInquiryService(blueprintTitleOrService);
        setInquiryBlueprintTitle(undefined);
      } else {
        setInquiryBlueprintTitle(blueprintTitleOrService);
        setInquiryService(undefined);
      }
    } else {
      setInquiryBlueprintTitle(undefined);
      setInquiryService(undefined);
    }
    setIsInquiryOpen(true);
  };

  // Render User Dashboard with specific view tabs
  const renderUserDashboard = () => {
    if (!currentUser) return null;

    const renderTabContent = () => {
      switch (dashboardTab) {
        case 'profile':
          return (
            <form onSubmit={handleUpdateProfile} className="space-y-6 max-w-md w-full animate-fade-in">
              <h2 className="font-display text-base font-bold uppercase tracking-widest text-brand-gold border-b border-white/5 pb-2">
                Personal Information
              </h2>
              {profileSuccessMsg && (
                <div className="p-3 bg-brand-gold/10 border border-brand-gold/20 text-brand-gold text-xs rounded-xl">
                  {profileSuccessMsg}
                </div>
              )}
              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold uppercase tracking-widest text-brand-on-surface-variant">Full Name</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-3 flex items-center text-brand-on-surface-variant/40"><User size={14} /></span>
                  <input
                    type="text"
                    required
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full bg-brand-surface-container border border-white/8 pl-9 pr-4 py-2.5 text-sm rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-gold/30 text-brand-on-surface placeholder:text-brand-on-surface/20"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold uppercase tracking-widest text-brand-on-surface-variant">Email Address</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-3 flex items-center text-brand-on-surface-variant/40"><Mail size={14} /></span>
                  <input
                    type="email"
                    disabled
                    value={currentUser.email}
                    className="w-full bg-brand-surface border border-white/5 pl-9 pr-4 py-2.5 text-sm rounded-xl text-brand-on-surface/50 cursor-not-allowed"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold uppercase tracking-widest text-brand-on-surface-variant font-display">Phone Number</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-3 flex items-center text-brand-on-surface-variant/40"><Phone size={14} /></span>
                  <input
                    type="tel"
                    placeholder="Enter phone number"
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    className="w-full bg-brand-surface-container border border-white/8 pl-9 pr-4 py-2.5 text-sm rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-gold/30 text-brand-on-surface placeholder:text-brand-on-surface/20"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold uppercase tracking-widest text-brand-on-surface-variant">New Password</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-3 flex items-center text-brand-on-surface-variant/40"><Lock size={14} /></span>
                  <input
                    type="password"
                    placeholder="•••••••• (leave blank to keep current)"
                    value={editPassword}
                    onChange={(e) => setEditPassword(e.target.value)}
                    className="w-full bg-brand-surface-container border border-white/8 pl-9 pr-4 py-2.5 text-sm rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-gold/30 text-brand-on-surface placeholder:text-brand-on-surface/20"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={profileLoading}
                className="px-6 py-3 bg-brand-gold text-[#0a0f18] font-display text-[10px] font-black uppercase tracking-widest rounded-xl hover:scale-[1.02] shadow-lg shadow-brand-gold/25 transition-all flex items-center gap-2"
              >
                {profileLoading ? <Loader2 size={13} className="animate-spin" /> : null}
                Save Profile
              </button>
            </form>
          );

        case 'enquiries':
          return (
            <div className="space-y-4 w-full animate-fade-in">
              <div className="flex justify-between items-center border-b border-white/5 pb-2">
                <h2 className="font-display text-base font-bold uppercase tracking-widest text-brand-gold">
                  My Inquiries & Estimates
                </h2>
                <button 
                  onClick={fetchUserEnquiries} 
                  className="p-1.5 text-brand-on-surface-variant/60 hover:text-brand-gold transition-colors"
                  aria-label="Refresh enquiries"
                >
                  <RefreshCw size={13} />
                </button>
              </div>

              {loadingData ? (
                <div className="flex items-center gap-2 py-8 text-brand-on-surface-variant text-sm">
                  <Loader2 size={16} className="animate-spin text-brand-gold" /> Loading your enquiries...
                </div>
              ) : dataError ? (
                <p className="text-red-400 text-xs py-4">{dataError}</p>
              ) : enquiries.length === 0 ? (
                <div className="py-12 text-center bg-brand-surface-high/20 border border-white/5 rounded-xl">
                  <Clipboard size={32} className="mx-auto text-brand-on-surface-variant/20 mb-3" />
                  <p className="text-brand-on-surface-variant/60 text-xs">You have not submitted any inquiries yet.</p>
                  <button
                    onClick={() => handleInquire()}
                    className="mt-4 px-4 py-2 bg-brand-gold/10 text-brand-gold border border-brand-gold/20 hover:bg-brand-gold hover:text-[#0a0f18] text-[10px] font-bold uppercase tracking-widest rounded-lg transition-all"
                  >
                    Submit New Inquiry
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3 max-h-[50vh] overflow-y-auto pr-1">
                  {enquiries.map((inq) => (
                    <div key={inq.id || (inq as any)._id} className="p-4 bg-brand-surface-high border border-white/8 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <span className="text-brand-gold font-display text-[10px] font-black uppercase tracking-widest bg-brand-gold/10 px-2 py-0.5 rounded">
                          {inq.service}
                        </span>
                        {inq.blueprintTitle && (
                          <span className="text-brand-on-surface text-xs font-bold block sm:inline sm:ml-2">
                            Blueprint: {inq.blueprintTitle}
                          </span>
                        )}
                        <p className="text-brand-on-surface-variant text-xs mt-2 italic">"{inq.message}"</p>
                      </div>
                      <div className="flex flex-col items-start sm:items-end gap-1.5 shrink-0">
                        <span className="px-2.5 py-0.5 bg-brand-gold/10 text-brand-gold text-[9px] font-black uppercase tracking-widest rounded-full flex items-center gap-1 border border-brand-gold/20">
                          <Clock size={9} /> Pending
                        </span>
                        <span className="text-[10px] text-brand-on-surface-variant/50">
                          {inq.date || new Date((inq as any).createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );

        case 'settings':
          return (
            <div className="space-y-6 max-w-md w-full animate-fade-in">
              <h2 className="font-display text-base font-bold uppercase tracking-widest text-brand-gold border-b border-white/5 pb-2">
                Account Settings
              </h2>
              <div className="space-y-4">
                <div className="p-4 bg-brand-surface-high border border-white/8 rounded-xl">
                  <h3 className="font-display text-xs font-black uppercase tracking-wider text-brand-on-surface mb-1">
                    System Preference
                  </h3>
                  <p className="text-[11px] text-brand-on-surface-variant/60 leading-relaxed mb-3">
                    Use cookies to maintain your login session across tabs. Disabling means you will need to sign in again.
                  </p>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                    <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">Session Active (Cookie based)</span>
                  </div>
                </div>

                <div className="p-4 bg-red-500/5 border border-red-500/10 rounded-xl">
                  <h3 className="font-display text-xs font-black uppercase tracking-wider text-red-400 mb-1">
                    Danger Zone
                  </h3>
                  <p className="text-[11px] text-brand-on-surface-variant/60 leading-relaxed mb-3">
                    Once you logout, your session keys and authentication cookies will be fully cleared.
                  </p>
                  <button
                    onClick={handleLogout}
                    className="px-4 py-2 border border-red-500/20 text-red-400 hover:bg-red-500 hover:text-white text-[10px] font-bold uppercase tracking-widest rounded-lg transition-all"
                  >
                    Logout Account
                  </button>
                </div>
              </div>
            </div>
          );
      }
    };

    return (
      <div className="min-h-[85vh] bg-[#0a0f18] text-brand-on-surface flex items-center justify-center py-12 px-6">
        <div className="w-full max-w-4xl bg-brand-surface border border-white/8 rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row min-h-[500px]">
          {/* Dashboard Left Sidebar Tabs */}
          <div className="w-full md:w-1/3 bg-brand-surface-high border-b md:border-b-0 md:border-r border-white/8 p-6 flex flex-col justify-between">
            <div className="space-y-6">
              <div className="flex items-center gap-3 border-b border-white/5 pb-4">
                <span className="w-12 h-12 bg-brand-gold/10 text-brand-gold rounded-full flex items-center justify-center text-lg font-black font-display shadow-md">
                  {currentUser.name.trim().charAt(0).toUpperCase()}
                </span>
                <div>
                  <h2 className="font-display text-xs font-black uppercase tracking-widest text-brand-on-surface">
                    {currentUser.name}
                  </h2>
                  <p className="text-[9px] text-brand-on-surface-variant/50 uppercase tracking-widest mt-0.5">
                    {currentUser.role === 'admin' ? 'Administrator' : 'Premium Client'}
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <button
                  onClick={() => handleViewChange('profile')}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl font-display text-[10px] font-bold uppercase tracking-wider text-left transition-all ${
                    dashboardTab === 'profile'
                      ? 'bg-brand-gold text-[#0a0f18] shadow-md shadow-brand-gold/15'
                      : 'text-brand-on-surface-variant hover:bg-white/5'
                  }`}
                >
                  <User size={13} />
                  My Profile
                </button>
                <button
                  onClick={() => handleViewChange('enquiries')}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl font-display text-[10px] font-bold uppercase tracking-wider text-left transition-all ${
                    dashboardTab === 'enquiries'
                      ? 'bg-brand-gold text-[#0a0f18] shadow-md shadow-brand-gold/15'
                      : 'text-brand-on-surface-variant hover:bg-white/5'
                  }`}
                >
                  <Clipboard size={13} />
                  My Enquiries
                </button>
                <button
                  onClick={() => handleViewChange('settings')}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl font-display text-[10px] font-bold uppercase tracking-wider text-left transition-all ${
                    dashboardTab === 'settings'
                      ? 'bg-brand-gold text-[#0a0f18] shadow-md shadow-brand-gold/15'
                      : 'text-brand-on-surface-variant hover:bg-white/5'
                  }`}
                >
                  <Settings size={13} />
                  Account Settings
                </button>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 py-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 font-display text-[10px] font-black uppercase tracking-widest rounded-xl transition-all border border-red-500/15"
            >
              <LogOut size={13} />
              Logout Session
            </button>
          </div>

          {/* Tab main area */}
          <div className="w-full md:w-2/3 p-8 flex flex-col justify-start">
            {renderTabContent()}
          </div>
        </div>
      </div>
    );
  };

  // Render Admin Dashboard
  const renderAdminDashboard = () => {
    if (!currentUser || currentUser.role !== 'admin') return null;

    const renderAdminTabContent = () => {
      switch (adminTab) {
        case 'stats':
          return (
            <div className="space-y-6 animate-fade-in w-full">
              <h2 className="font-display text-base font-bold uppercase tracking-widest text-brand-gold border-b border-white/5 pb-2">
                System Overview
              </h2>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-brand-surface-high border border-white/8 rounded-xl flex flex-col justify-center">
                  <p className="text-[10px] text-brand-on-surface-variant/50 font-bold uppercase tracking-widest mb-1">Total Users</p>
                  <h3 className="font-display text-3xl font-black text-brand-gold">
                    {adminStats?.totalUsers ?? '...'}
                  </h3>
                </div>
                <div className="p-4 bg-brand-surface-high border border-white/8 rounded-xl flex flex-col justify-center">
                  <p className="text-[10px] text-brand-on-surface-variant/50 font-bold uppercase tracking-widest mb-1">Total Enquiries</p>
                  <h3 className="font-display text-3xl font-black text-brand-gold">
                    {adminStats?.totalEnquiries ?? '...'}
                  </h3>
                </div>
                <div className="p-4 bg-brand-surface-high border border-white/8 rounded-xl flex flex-col justify-center">
                  <p className="text-[10px] text-brand-on-surface-variant/50 font-bold uppercase tracking-widest mb-1">Total Projects</p>
                  <h3 className="font-display text-3xl font-black text-brand-gold">
                    {adminStats?.totalProjects ?? '...'}
                  </h3>
                </div>
                <div className="p-4 bg-brand-surface-high border border-white/8 rounded-xl flex flex-col justify-center">
                  <p className="text-[10px] text-brand-on-surface-variant/50 font-bold uppercase tracking-widest mb-1">Total Blueprints</p>
                  <h3 className="font-display text-3xl font-black text-brand-gold">
                    {adminStats?.totalHousePlans ?? '...'}
                  </h3>
                </div>
              </div>

              {adminStats?.recentActivity && (
                <div className="space-y-3 pt-2">
                  <h3 className="font-display text-xs font-bold uppercase tracking-widest text-brand-on-surface-variant border-b border-white/5 pb-2">
                    Recent System Activity
                  </h3>
                  <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
                    {adminStats.recentActivity.map((act: any, idx: number) => (
                      <div key={idx} className="p-3 bg-white/[0.01] border border-white/5 rounded-lg flex justify-between items-center text-[10px]">
                        <div>
                          <span className="px-1.5 py-0.5 bg-brand-gold/10 text-brand-gold rounded font-display font-bold uppercase tracking-wider mr-2">
                            {act.type}
                          </span>
                          <span className="text-brand-on-surface-variant">{act.detail}</span>
                        </div>
                        <span className="text-brand-on-surface-variant/40">{new Date(act.date).toLocaleDateString()}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );

        case 'users':
          return (
            <div className="space-y-4 animate-fade-in w-full">
              <h2 className="font-display text-base font-bold uppercase tracking-widest text-brand-gold border-b border-white/5 pb-2">
                Manage User Accounts ({adminUsers.length})
              </h2>

              <div className="overflow-x-auto border border-white/8 rounded-xl max-h-[50vh]">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-brand-surface-high text-brand-on-surface-variant/70 border-b border-white/8 font-display text-[9px] font-bold uppercase tracking-widest">
                      <th className="p-3">Name</th>
                      <th className="p-3">Email</th>
                      <th className="p-3">Role</th>
                      <th className="p-3">Status</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {adminUsers.map((user) => (
                      <tr key={user.id || user._id} className="border-b border-white/5 hover:bg-white/[0.01]">
                        <td className="p-3 font-semibold text-brand-on-surface">{user.name}</td>
                        <td className="p-3 text-brand-on-surface-variant">{user.email}</td>
                        <td className="p-3">
                          {user.role === 'admin' ? (
                            <span className="px-2 py-0.5 bg-brand-gold/10 text-brand-gold rounded font-bold uppercase tracking-wider text-[8px]">
                              Admin
                            </span>
                          ) : (
                            <button
                              onClick={() => handleChangeUserRole(user.id || user._id, 'admin')}
                              className="text-[9px] text-brand-on-surface-variant/60 hover:text-brand-gold underline uppercase tracking-wider"
                            >
                              Make Admin
                            </button>
                          )}
                        </td>
                        <td className="p-3">
                          {user.blocked ? (
                            <span className="px-2 py-0.5 bg-red-500/10 text-red-400 rounded font-bold uppercase tracking-wider text-[8px]">
                              Blocked
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 rounded font-bold uppercase tracking-wider text-[8px]">
                              Active
                            </span>
                          )}
                        </td>
                        <td className="p-3 text-right flex justify-end gap-2 items-center h-full">
                          {user.role !== 'admin' && (
                            <>
                              <button
                                onClick={() => handleToggleBlockUser(user.id || user._id, !!user.blocked)}
                                className={`px-2 py-1 rounded text-[8px] font-bold uppercase tracking-wider transition-all border ${
                                  user.blocked 
                                    ? 'border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/10' 
                                    : 'border-amber-500/20 text-amber-400 hover:bg-amber-500/10'
                                }`}
                              >
                                {user.blocked ? 'Unblock' : 'Block'}
                              </button>
                              <button
                                onClick={() => handleDeleteUser(user.id || user._id)}
                                className="p-1 hover:text-red-400 transition-colors border border-red-500/15 hover:bg-red-500/10 rounded"
                                aria-label="Delete user"
                              >
                                <Trash2 size={12} />
                              </button>
                            </>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          );

        case 'enquiries':
          return (
            <div className="space-y-4 animate-fade-in w-full">
              <h2 className="font-display text-base font-bold uppercase tracking-widest text-brand-gold border-b border-white/5 pb-2">
                All Client Enquiries ({adminEnquiries.length})
              </h2>

              <div className="space-y-2.5 max-h-[50vh] overflow-y-auto pr-1">
                {adminEnquiries.length === 0 ? (
                  <p className="text-brand-on-surface-variant/60 text-xs py-4 text-center">No enquiries logged yet.</p>
                ) : (
                  adminEnquiries.map((inq) => (
                    <div key={inq.id || inq._id} className="p-4 bg-brand-surface-high border border-white/8 rounded-xl flex flex-col justify-between gap-3">
                      <div className="flex justify-between items-start gap-4">
                        <div>
                          <h3 className="font-semibold text-brand-on-surface text-sm">{inq.name}</h3>
                          <p className="text-[10px] text-brand-on-surface-variant/60 mt-0.5">{inq.email} | {inq.phone}</p>
                        </div>
                        <span className="text-brand-gold font-display text-[9px] font-black uppercase tracking-widest bg-brand-gold/10 px-2 py-0.5 rounded shrink-0 border border-brand-gold/20">
                          {inq.service}
                        </span>
                      </div>
                      <p className="text-brand-on-surface-variant text-xs italic bg-white/[0.01] p-2.5 rounded border border-white/5">"{inq.message}"</p>
                      {inq.blueprintTitle && (
                        <p className="text-[10px] text-brand-on-surface-variant/50">Requested Blueprint: <strong className="text-brand-gold">{inq.blueprintTitle}</strong></p>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          );

        case 'content':
          return (
            <div className="space-y-5 animate-fade-in w-full">
              <h2 className="font-display text-base font-bold uppercase tracking-widest text-brand-gold border-b border-white/5 pb-2">
                Content & Photo Add-ons
              </h2>

              {contentStatus && (
                <div className="p-3 bg-brand-gold/10 border border-brand-gold/20 text-brand-gold text-xs rounded-xl">
                  {contentStatus}
                </div>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                <div className="p-5 bg-brand-surface-high border border-white/8 rounded-xl">
                  <h3 className="font-display text-xs font-bold uppercase tracking-widest text-white mb-4 flex items-center gap-2">
                    <Upload size={14} className="text-brand-gold" />
                    Upload Photo
                  </h3>
                  <label className="flex flex-col items-center justify-center min-h-44 rounded-xl border border-dashed border-brand-gold/30 bg-brand-surface-container/35 hover:border-brand-gold/60 cursor-pointer transition-colors">
                    <ImagePlus size={28} className="text-brand-gold mb-3" />
                    <span className="font-display text-[10px] font-bold uppercase tracking-widest text-brand-on-surface">
                      Choose image
                    </span>
                    <span className="text-[10px] text-brand-on-surface-variant/60 mt-1">JPG, PNG, WEBP</span>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleAdminImageUpload(file);
                      }}
                    />
                  </label>
                  {contentImageUrl && (
                    <div className="mt-4 overflow-hidden rounded-xl border border-white/8 bg-brand-surface-lowest">
                      <img src={contentImageUrl} alt="Uploaded preview" className="w-full h-40 object-cover" />
                    </div>
                  )}
                </div>

                <form onSubmit={handleCreateGalleryItem} className="p-5 bg-brand-surface-high border border-white/8 rounded-xl space-y-3">
                  <h3 className="font-display text-xs font-bold uppercase tracking-widest text-white mb-4">
                    Publish Gallery Item
                  </h3>
                  <input
                    type="text"
                    required
                    placeholder="Title"
                    value={contentTitle}
                    onChange={(e) => setContentTitle(e.target.value)}
                    className="w-full bg-brand-surface-container border border-white/8 px-4 py-2.5 text-sm rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-gold/30 text-brand-on-surface placeholder:text-brand-on-surface/25"
                  />
                  <select
                    value={contentCategory}
                    onChange={(e) => setContentCategory(e.target.value)}
                    className="w-full bg-brand-surface-container border border-white/8 px-4 py-2.5 text-sm rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-gold/30 text-brand-on-surface"
                  >
                    <option>Residential</option>
                    <option>Commercial</option>
                    <option>Interior</option>
                    <option>Exterior</option>
                    <option>Construction</option>
                  </select>
                  <textarea
                    required
                    placeholder="Short description"
                    value={contentDesc}
                    onChange={(e) => setContentDesc(e.target.value)}
                    className="w-full min-h-24 bg-brand-surface-container border border-white/8 px-4 py-2.5 text-sm rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-gold/30 text-brand-on-surface placeholder:text-brand-on-surface/25 resize-none"
                  />
                  <input
                    type="url"
                    required
                    placeholder="Image URL"
                    value={contentImageUrl}
                    onChange={(e) => setContentImageUrl(e.target.value)}
                    className="w-full bg-brand-surface-container border border-white/8 px-4 py-2.5 text-sm rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-gold/30 text-brand-on-surface placeholder:text-brand-on-surface/25"
                  />
                  <button
                    type="submit"
                    disabled={contentLoading}
                    className="w-full flex items-center justify-center gap-2 py-3 bg-brand-gold text-[#0a0f18] font-display text-[10px] font-black uppercase tracking-widest rounded-xl hover:scale-[1.02] disabled:opacity-60 transition-all"
                  >
                    {contentLoading ? <Loader2 size={13} className="animate-spin" /> : <ImagePlus size={13} />}
                    Publish Add-on
                  </button>
                </form>
              </div>
            </div>
          );
      }
    };

    return (
      <div className="min-h-[85vh] bg-[#0a0f18] text-brand-on-surface flex items-center justify-center py-12 px-6">
        <div className="w-full max-w-5xl bg-brand-surface border border-white/8 rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row min-h-[550px]">
          {/* Admin Left Sidebar */}
          <div className="w-full md:w-1/4 bg-brand-surface-high border-b md:border-b-0 md:border-r border-white/8 p-6 flex flex-col justify-between">
            <div className="space-y-6">
              <div className="flex items-center gap-3 border-b border-white/5 pb-4">
                <span className="w-12 h-12 bg-brand-gold/10 text-brand-gold rounded-full flex items-center justify-center text-lg font-black font-display shadow-md">
                  A
                </span>
                <div>
                  <h2 className="font-display text-xs font-black uppercase tracking-widest text-brand-on-surface">
                    Admin Portal
                  </h2>
                  <p className="text-[9px] text-brand-on-surface-variant/50 uppercase tracking-widest mt-0.5">
                    NVS Root Admin
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <button
                  onClick={() => setAdminTab('stats')}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl font-display text-[10px] font-bold uppercase tracking-wider text-left transition-all ${
                    adminTab === 'stats'
                      ? 'bg-brand-gold text-[#0a0f18] shadow-md shadow-brand-gold/15'
                      : 'text-brand-on-surface-variant hover:bg-white/5'
                  }`}
                >
                  <LayoutDashboard size={13} />
                  Dashboard Stats
                </button>
                <button
                  onClick={() => setAdminTab('users')}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl font-display text-[10px] font-bold uppercase tracking-wider text-left transition-all ${
                    adminTab === 'users'
                      ? 'bg-brand-gold text-[#0a0f18] shadow-md shadow-brand-gold/15'
                      : 'text-brand-on-surface-variant hover:bg-white/5'
                  }`}
                >
                  <User size={13} />
                  Manage Users
                </button>
                <button
                  onClick={() => setAdminTab('enquiries')}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl font-display text-[10px] font-bold uppercase tracking-wider text-left transition-all ${
                    adminTab === 'enquiries'
                      ? 'bg-brand-gold text-[#0a0f18] shadow-md shadow-brand-gold/15'
                      : 'text-brand-on-surface-variant hover:bg-white/5'
                  }`}
                >
                  <Clipboard size={13} />
                  All Enquiries
                </button>
                <button
                  onClick={() => setAdminTab('content')}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl font-display text-[10px] font-bold uppercase tracking-wider text-left transition-all ${
                    adminTab === 'content'
                      ? 'bg-brand-gold text-[#0a0f18] shadow-md shadow-brand-gold/15'
                      : 'text-brand-on-surface-variant hover:bg-white/5'
                  }`}
                >
                  <ImagePlus size={13} />
                  Content & Photos
                </button>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 py-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 font-display text-[10px] font-black uppercase tracking-widest rounded-xl transition-all border border-red-500/15"
            >
              <LogOut size={13} />
              Logout Session
            </button>
          </div>

          {/* Tab main area */}
          <div className="w-full md:w-3/4 p-8 flex flex-col justify-start">
            {renderAdminTabContent()}
          </div>
        </div>
      </div>
    );
  };

  if (checkingSession) {
    return (
      <div className="min-h-screen bg-[#0a0f18] text-white flex flex-col items-center justify-center">
        <Loader2 className="animate-spin text-brand-gold mb-4" size={32} />
        <p className="font-display text-[10px] font-bold uppercase tracking-widest text-brand-on-surface-variant">Checking session state…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-surface text-brand-on-surface selection:bg-brand-gold/20 selection:text-brand-gold flex flex-col">
      {/* Premium Luxury Preloader */}
      <Preloader />

      {/* Top Navbar */}
      <Navbar 
        activeView={activeView} 
        onViewChange={handleViewChange} 
        onInquire={() => handleInquire()}
        currentUser={currentUser}
        onLogout={handleLogout}
      />

      {/* Floating Concierge Sidebar */}
      <Concierge onInquire={handleInquire} />

      {/* Interactive Main Body Content with Framer Motion Page transitions */}
      <main className="flex-grow">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.4, ease: [0.25, 1, 0.5, 1] }}
            className="w-full h-full"
          >
            <Routes location={location}>
              <Route path="/" element={
                <>
                  <Helmet>
                    <title>NVS Buildcon | Architectural Design &amp; Turnkey Construction Lucknow &amp; Delhi NCR</title>
                    <meta name="description" content="NVS Buildcon provides Vastu-compliant architectural design, structural engineering, and luxury turnkey construction services in Lucknow and Delhi NCR." />
                  </Helmet>
                  <Home onViewChange={handleViewChange} onInquire={handleInquire} />
                </>
              } />
              
              <Route path="/services" element={
                <>
                  <Helmet>
                    <title>Architecture, Structural Engineering &amp; Turnkey Construction Services | NVS Buildcon</title>
                    <meta name="description" content="NVS Buildcon offers 2D floor plans, 3D elevations, structural analysis, MEP drafting, and full-scope turnkey villa construction starting from ₹3/sq.ft." />
                  </Helmet>
                  <Services onInquire={handleInquire} />
                </>
              } />

              <Route path="/projects" element={
                <>
                  <Helmet>
                    <title>Completed Turnkey Residential &amp; Commercial Projects | NVS Buildcon</title>
                    <meta name="description" content="Explore our portfolio of completed luxury residential villas, narrow urban houses, modern duplex elevations, and retail spaces in Lucknow and Delhi NCR." />
                  </Helmet>
                  <Projects onInquire={handleInquire} />
                </>
              } />

              <Route path="/house-plans" element={
                <>
                  <Helmet>
                    <title>Vastu-Compliant 2D Floor Plans &amp; House Layout Drawings | NVS Buildcon</title>
                    <meta name="description" content="Browse architectural layouts, electrical plans, modular kitchen schematics, and detailed structural drawings prepared by NVS Buildcon." />
                  </Helmet>
                  <HousePlans onInquire={handleInquire} />
                </>
              } />

              <Route path="/gallery" element={
                <>
                  <Helmet>
                    <title>Architectural Elevation &amp; Interior Design Gallery | NVS Buildcon</title>
                    <meta name="description" content="View high-resolution renders and executed photos of modern house elevations, luxury master bedroom suites, TV walls, and vanity niches." />
                  </Helmet>
                  <VisualPortfolio />
                </>
              } />

              <Route path="/process" element={
                <>
                  <Helmet>
                    <title>Our 8-Stage Architecture &amp; Turnkey Construction Process | NVS Buildcon</title>
                    <meta name="description" content="Learn about our structured execution phases from Vastu planning, 3D renderings, structural RCC design, MEP coordination, to final construction handover." />
                  </Helmet>
                  <Process />
                </>
              } />

              <Route path="/about" element={
                <>
                  <Helmet>
                    <title>About NVS Buildcon | Premium Architecture &amp; Construction Company</title>
                    <meta name="description" content="NVS Buildcon is a professional architecture and general contracting firm delivering precision-engineered, Vastu-aligned properties in Lucknow and Delhi NCR." />
                  </Helmet>
                  <About />
                </>
              } />

              <Route path="/testimonials" element={
                <>
                  <Helmet>
                    <title>Client Reviews &amp; Construction Testimonials | NVS Buildcon</title>
                    <meta name="description" content="Read verified feedback from our residential and commercial clients regarding our architectural drawings, budget accuracy, and turnkey execution." />
                  </Helmet>
                  <TestimonialsPage />
                </>
              } />

              <Route path="/contact" element={
                <>
                  <Helmet>
                    <title>Contact NVS Buildcon | Request Project Estimate &amp; Consultation</title>
                    <meta name="description" content="Get in touch with NVS Buildcon. Request a free quote, book a site visit, or submit project specifications for Lucknow and Delhi NCR offices." />
                  </Helmet>
                  <Contact onInquire={handleInquire} />
                </>
              } />

              <Route path="/design-wizard" element={
                <>
                  <Helmet>
                    <title>Interactive Dream Home Configuration Tool | NVS Buildcon</title>
                    <meta name="description" content="Configure your custom home specifications, plot size, bedroom configuration, architectural style preference, and get a Vastu zoning recommendation." />
                  </Helmet>
                  <DesignWizard onViewChange={handleViewChange} />
                </>
              } />

              <Route path="/login" element={
                <>
                  <Helmet>
                    <title>Client Portal Login | NVS Buildcon</title>
                    <meta name="description" content="Log in to your client account portal to review specification details, blueprints, active project estimates, and milestones." />
                  </Helmet>
                  <UserLogin onLoginSuccess={handleLoginSuccess} />
                </>
              } />

              <Route path="/admin/login" element={
                <>
                  <Helmet>
                    <title>Administrator Sign In | NVS Buildcon Portal</title>
                    <meta name="description" content="Secure portal login interface for system administrators and principal designers of NVS Buildcon." />
                  </Helmet>
                  <AdminLogin onLoginSuccess={handleLoginSuccess} />
                </>
              } />

              <Route path="/dashboard" element={renderUserDashboard()} />
              <Route path="/profile" element={renderUserDashboard()} />
              <Route path="/enquiries" element={renderUserDashboard()} />
              <Route path="/settings" element={renderUserDashboard()} />
              <Route path="/admin/dashboard" element={renderAdminDashboard()} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Premium Dark Site Footer */}
      <Footer 
        onViewChange={handleViewChange} 
        onInquire={() => handleInquire()} 
      />

      {/* Fully Functional Inquiry & Spec Request Modal */}
      <InquiryModal
        isOpen={isInquiryOpen}
        onClose={() => setIsInquiryOpen(false)}
        initialBlueprintTitle={inquiryBlueprintTitle}
        initialService={inquiryService}
      />
    </div>
  );
}
