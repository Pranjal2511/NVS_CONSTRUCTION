import React from 'react';
import { 
  LayoutDashboard, FolderKanban, Image as ImageIcon, FileText, 
  Settings, MessageSquare, Calendar, Home, Award, Wrench, ChevronRight
} from 'lucide-react';

export type AdminView = 
  | 'overview' 
  | 'projects' 
  | 'house-plans' 
  | 'gallery' 
  | 'services' 
  | 'blogs' 
  | 'testimonials' 
  | 'enquiries' 
  | 'appointments' 
  | 'settings';

interface AdminSidebarProps {
  activeView: AdminView;
  setActiveView: (view: AdminView) => void;
  onLogout: () => void;
}

const menuItems: { id: AdminView; label: string; icon: React.ReactNode }[] = [
  { id: 'overview', label: 'Overview', icon: <LayoutDashboard size={18} /> },
  { id: 'projects', label: 'Projects', icon: <FolderKanban size={18} /> },
  { id: 'house-plans', label: 'House Plans', icon: <Home size={18} /> },
  { id: 'gallery', label: 'Gallery', icon: <ImageIcon size={18} /> },
  { id: 'services', label: 'Services', icon: <Wrench size={18} /> },
  { id: 'blogs', label: 'Blogs', icon: <FileText size={18} /> },
  { id: 'testimonials', label: 'Testimonials', icon: <Award size={18} /> },
  { id: 'enquiries', label: 'Enquiries', icon: <MessageSquare size={18} /> },
  { id: 'appointments', label: 'Appointments', icon: <Calendar size={18} /> },
  { id: 'settings', label: 'Settings', icon: <Settings size={18} /> },
];

const AdminSidebar: React.FC<AdminSidebarProps> = ({ activeView, setActiveView, onLogout }) => {
  return (
    <aside className="w-full md:w-64 bg-brand-surface-high border-b md:border-b-0 md:border-r border-white/10 flex flex-col h-full z-10 relative">
      <div className="p-6 border-b border-white/10 flex flex-col gap-2">
        <h2 className="font-display text-xl font-black text-brand-gold uppercase tracking-widest">
          NVS Admin
        </h2>
        <p className="text-xs text-brand-on-surface-variant font-medium tracking-wide">
          Dashboard Portal
        </p>
      </div>

      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1 custom-scrollbar">
        {menuItems.map((item) => {
          const isActive = activeView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id)}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-300 group ${
                isActive 
                  ? 'bg-brand-gold/10 text-brand-gold shadow-[inset_0_0_0_1px_rgba(194,166,73,0.2)]' 
                  : 'text-brand-on-surface-variant hover:bg-white/5 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className={isActive ? 'text-brand-gold' : 'text-brand-on-surface-variant group-hover:text-white transition-colors'}>
                  {item.icon}
                </span>
                <span className="text-[11px] font-bold uppercase tracking-widest">
                  {item.label}
                </span>
              </div>
              {isActive && <ChevronRight size={14} className="text-brand-gold opacity-70" />}
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-white/10 mt-auto">
        <button
          onClick={onLogout}
          className="w-full px-4 py-3 border border-red-500/20 text-red-400 hover:bg-red-500 hover:text-white text-[10px] font-bold uppercase tracking-widest rounded-xl transition-all"
        >
          Logout Admin
        </button>
      </div>
    </aside>
  );
};

export default AdminSidebar;
