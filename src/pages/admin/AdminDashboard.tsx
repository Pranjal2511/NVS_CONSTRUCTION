import React, { useState, lazy, Suspense } from 'react';
import AdminSidebar, { AdminView } from '../../components/admin/AdminSidebar';
import { AuthUser } from '../../utils/auth';
import { Menu, X } from 'lucide-react';

const Overview = lazy(() => import('./Overview'));
const ProjectsManager = lazy(() => import('./ProjectsManager'));
const HousePlansManager = lazy(() => import('./HousePlansManager'));
const GalleryManager = lazy(() => import('./GalleryManager'));
const ServicesManager = lazy(() => import('./ServicesManager'));
const BlogsManager = lazy(() => import('./BlogsManager'));
const TestimonialsManager = lazy(() => import('./TestimonialsManager'));
const EnquiriesManager = lazy(() => import('./EnquiriesManager'));
const AppointmentsManager = lazy(() => import('./AppointmentsManager'));
const SettingsManager = lazy(() => import('./SettingsManager'));

const PANEL_MAP: Record<AdminView, React.ReactNode> = {
  overview: <Overview />,
  projects: <ProjectsManager />,
  'house-plans': <HousePlansManager />,
  gallery: <GalleryManager />,
  services: <ServicesManager />,
  blogs: <BlogsManager />,
  testimonials: <TestimonialsManager />,
  enquiries: <EnquiriesManager />,
  appointments: <AppointmentsManager />,
  settings: <SettingsManager />,
};

interface AdminDashboardProps {
  currentUser: AuthUser;
  onLogout: () => void;
}

const PageLoader: React.FC = () => (
  <div className="flex items-center justify-center h-64">
    <div className="w-8 h-8 border-2 border-brand-gold/30 border-t-brand-gold rounded-full animate-spin" />
  </div>
);

const AdminDashboard: React.FC<AdminDashboardProps> = ({ currentUser, onLogout }) => {
  const [activeView, setActiveView] = useState<AdminView>('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-brand-surface flex flex-col md:flex-row">
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/60 md:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar — desktop always visible, mobile slide-in */}
      <div className={`fixed md:static top-0 left-0 h-full z-50 md:z-auto transform transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        <AdminSidebar
          activeView={activeView}
          setActiveView={(v) => { setActiveView(v); setSidebarOpen(false); }}
          onLogout={onLogout}
        />
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="flex items-center justify-between px-5 py-4 border-b border-white/10 bg-brand-surface-high sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <button
              className="md:hidden p-2 rounded-xl border border-white/10 hover:bg-white/5 text-brand-on-surface-variant transition-colors"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu size={16} />
            </button>
            <div>
              <h1 className="text-xs font-black uppercase tracking-widest text-brand-on-surface">
                {activeView.replace(/-/g, ' ')}
              </h1>
              <p className="text-[10px] text-brand-on-surface-variant hidden sm:block">
                NVS Admin Portal
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2.5">
              {currentUser.avatar ? (
                <img src={currentUser.avatar} alt="Admin" className="w-8 h-8 rounded-full object-cover border border-brand-gold/30" />
              ) : (
                <span className="w-8 h-8 bg-brand-gold/10 text-brand-gold rounded-full flex items-center justify-center text-xs font-black">
                  {currentUser.name.charAt(0).toUpperCase()}
                </span>
              )}
              <div className="hidden md:block">
                <p className="text-[11px] font-bold text-white">{currentUser.name}</p>
                <p className="text-[9px] font-bold uppercase tracking-widest text-brand-gold">Administrator</p>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-5 sm:p-6 lg:p-8 overflow-y-auto">
          <Suspense fallback={<PageLoader />}>
            {PANEL_MAP[activeView]}
          </Suspense>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
