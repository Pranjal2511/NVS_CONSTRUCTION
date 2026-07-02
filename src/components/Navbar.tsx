import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Menu, X, Sun, Moon, ChevronRight, User, ShieldCheck, LogIn, LogOut, Settings } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ViewState } from '../types';
import { AuthUser } from '../utils/auth';

interface NavbarProps {
  activeView: ViewState;
  onViewChange: (view: ViewState) => void;
  onInquire: () => void;
  currentUser: AuthUser | null;
  onLogout: () => void;
}

export default function Navbar({
  activeView,
  onViewChange,
  onInquire,
  currentUser,
  onLogout
}: NavbarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoginDropdownOpen, setIsLoginDropdownOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const loginDropdownRef = useRef<HTMLDivElement>(null);

  // Persist & apply theme from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('theme') || 'dark';
    setTheme(saved as 'dark' | 'light');
    document.documentElement.classList.toggle('light', saved === 'light');
  }, []);

  // Show solid background after scrolling 60px
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close login dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (loginDropdownRef.current && !loginDropdownRef.current.contains(e.target as Node)) {
        setIsLoginDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    document.documentElement.classList.toggle('light', next === 'light');
    localStorage.setItem('theme', next);
  };

  const navLinks: { label: string; value: ViewState; path: string }[] = [
    { label: 'Home',         value: 'home',         path: '/' },
    { label: 'Services',     value: 'services',     path: '/services' },
    { label: 'Projects',     value: 'projects',     path: '/projects' },
    { label: 'Gallery',      value: 'gallery',      path: '/gallery' },
    { label: 'Contact',      value: 'contact',      path: '/contact' },
  ];

  const handleNav = (view: ViewState) => {
    onViewChange(view);
    setIsMobileMenuOpen(false);
    setIsLoginDropdownOpen(false);
  };

  const getInitial = (name: string) => {
    return name ? name.trim().charAt(0).toUpperCase() : '?';
  };

  return (
    <nav
      className={`sticky top-0 w-full z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-brand-surface/95 backdrop-blur-xl shadow-2xl shadow-black/20 border-b border-brand-gold/20'
          : 'bg-brand-surface/80 backdrop-blur-md border-b border-brand-gold/10'
      }`}
    >
      <div className="flex justify-between items-center px-6 md:px-12 h-[68px] w-full max-w-[1400px] mx-auto">

        {/* ── Logo ─────────────────────────────────────────────────── */}
        <Link
          to="/"
          onClick={() => handleNav('home')}
          className="group flex items-center gap-3 focus:outline-none"
          aria-label="NVS Buildcon home"
        >
          <span className="relative flex items-center justify-center w-9 h-9 bg-brand-gold rounded-lg shadow-lg shadow-brand-gold/30 group-hover:scale-105 transition-transform duration-200">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0a0f18" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="3 11 12 2 21 11 12 22 3 11"/>
            </svg>
          </span>
          <div className="flex flex-col items-start leading-none">
            <span className="font-display text-[15px] font-black tracking-[0.18em] text-brand-on-surface uppercase">
              NVS Buildcon
            </span>
            <span className="font-display text-[8px] font-semibold tracking-[0.35em] text-brand-gold uppercase mt-0.5">
              Architecture & Construction
            </span>
          </div>
        </Link>

        {/* ── Desktop Nav Links ─────────────────────────────────────── */}
        <div className="hidden xl:flex items-center h-full gap-1">
          {navLinks.map((link) => {
            const isActive = activeView === link.value;
            return (
              <Link
                key={link.value}
                to={link.path}
                onClick={() => handleNav(link.value)}
                className={`relative px-3 py-1.5 font-display text-[10px] font-bold tracking-[0.15em] uppercase rounded-md transition-all duration-200 ${
                  isActive
                    ? 'text-[#0a0f18] bg-brand-gold shadow-md shadow-brand-gold/20'
                    : 'text-brand-on-surface-variant hover:text-brand-gold hover:bg-brand-gold/10'
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </div>

        {/* ── Right Actions ─────────────────────────────────────────── */}
        <div className="flex items-center gap-2.5">

          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            className="p-2.5 rounded-lg border border-brand-gold/20 bg-brand-surface-high text-brand-gold hover:bg-brand-gold hover:text-[#0a0f18] transition-all duration-200 shadow-sm"
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
          </button>

          {/* Free Quote CTA — desktop */}
          <button
            onClick={onInquire}
            className="hidden xl:flex items-center gap-1.5 px-5 py-2.5 bg-brand-gold text-[#0a0f18] font-display text-[10px] font-black uppercase tracking-widest rounded-lg shadow-lg shadow-brand-gold/25 hover:scale-[1.03] hover:shadow-brand-gold/40 transition-all duration-200"
          >
            Free Quote <ChevronRight size={12} />
          </button>

          {/* ── Auth Avatar or Login button + dropdown ── */}
          <div className="relative hidden xl:block" ref={loginDropdownRef}>
            {currentUser ? (
              // Circular avatar after login
              <button
                onClick={() => setIsLoginDropdownOpen(!isLoginDropdownOpen)}
                className="w-9 h-9 rounded-full bg-brand-gold text-[#0a0f18] font-display font-black text-sm flex items-center justify-center shadow-lg shadow-brand-gold/25 hover:scale-[1.05] transition-transform duration-200 focus:outline-none"
              >
                {getInitial(currentUser.name)}
              </button>
            ) : (
              // Login button before login
              <button
                onClick={() => setIsLoginDropdownOpen(!isLoginDropdownOpen)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-brand-gold/25 bg-brand-surface-high text-brand-on-surface font-display text-[10px] font-bold uppercase tracking-widest hover:border-brand-gold/60 hover:text-brand-gold transition-all duration-200"
              >
                <LogIn size={13} />
                Login
              </button>
            )}

            {/* Dropdown */}
            <AnimatePresence>
              {isLoginDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 6, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 6, scale: 0.97 }}
                  transition={{ duration: 0.15, ease: 'easeOut' }}
                  className="absolute right-0 mt-2 w-52 bg-brand-surface-container border border-brand-gold/20 rounded-xl shadow-2xl shadow-black/30 overflow-hidden z-50"
                >
                  {currentUser ? (
                    // Dropdown for Logged in User
                    <>
                      <div className="px-5 py-4 border-b border-white/5 bg-white/[0.02]">
                        <p className="font-display text-[11px] font-bold uppercase tracking-wider text-brand-on-surface truncate">
                          {currentUser.name}
                        </p>
                        <p className="text-[9px] text-brand-on-surface-variant/60 truncate mt-0.5">
                          {currentUser.email}
                        </p>
                      </div>

                      <button
                        onClick={() => handleNav('profile')}
                        className="w-full flex items-center gap-3 px-5 py-3.5 hover:bg-brand-gold/10 transition-colors text-left text-brand-on-surface font-display text-[10px] font-bold uppercase tracking-wider group"
                      >
                        <span className="text-brand-gold group-hover:scale-105 transition-transform"><User size={13} /></span>
                        My Profile
                      </button>

                      <button
                        onClick={() => handleNav(currentUser.role === 'admin' ? 'admin-dashboard' : 'dashboard')}
                        className="w-full flex items-center gap-3 px-5 py-3.5 hover:bg-brand-gold/10 transition-colors text-left text-brand-on-surface font-display text-[10px] font-bold uppercase tracking-wider group"
                      >
                        <span className="text-brand-gold group-hover:scale-105 transition-transform"><ShieldCheck size={13} /></span>
                        {currentUser.role === 'admin' ? 'Admin Panel' : 'Dashboard'}
                      </button>

                      <button
                        onClick={() => handleNav('enquiries')}
                        className="w-full flex items-center gap-3 px-5 py-3.5 hover:bg-brand-gold/10 transition-colors text-left text-brand-on-surface font-display text-[10px] font-bold uppercase tracking-wider group"
                      >
                        <span className="text-brand-gold group-hover:scale-105 transition-transform">
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                          </svg>
                        </span>
                        My Enquiries
                      </button>

                      <button
                        onClick={() => handleNav('settings')}
                        className="w-full flex items-center gap-3 px-5 py-3.5 hover:bg-brand-gold/10 transition-colors text-left text-brand-on-surface font-display text-[10px] font-bold uppercase tracking-wider group"
                      >
                        <span className="text-brand-gold group-hover:scale-105 transition-transform"><Settings size={13} /></span>
                        Settings
                      </button>

                      <button
                        onClick={() => {
                          setIsLoginDropdownOpen(false);
                          onLogout();
                        }}
                        className="w-full flex items-center gap-3 px-5 py-4 border-t border-white/5 hover:bg-red-500/10 transition-colors text-left text-red-400 font-display text-[10px] font-black uppercase tracking-wider group"
                      >
                        <span className="group-hover:scale-105 transition-transform"><LogOut size={13} /></span>
                        Logout
                      </button>
                    </>
                  ) : (
                    // Dropdown for Unauthenticated User (Login option selection)
                    <>
                      <button
                        onClick={() => handleNav('login')}
                        className="w-full flex items-center gap-3 px-5 py-4 hover:bg-brand-gold/10 transition-colors text-left border-b border-white/5 group"
                      >
                        <span className="p-2 rounded-lg bg-brand-gold/10 text-brand-gold group-hover:bg-brand-gold group-hover:text-[#0a0f18] transition-all">
                          <User size={14} />
                        </span>
                        <div>
                          <p className="font-display text-[10px] font-bold uppercase tracking-wider text-brand-on-surface">User Portal</p>
                          <p className="text-[9px] text-brand-on-surface-variant/60 mt-0.5">Access or register</p>
                        </div>
                      </button>

                      <button
                        onClick={() => handleNav('admin-login')}
                        className="w-full flex items-center gap-3 px-5 py-4 hover:bg-brand-gold/10 transition-colors text-left group"
                      >
                        <span className="p-2 rounded-lg bg-brand-gold/10 text-brand-gold group-hover:bg-brand-gold group-hover:text-[#0a0f18] transition-all">
                          <ShieldCheck size={14} />
                        </span>
                        <div>
                          <p className="font-display text-[10px] font-bold uppercase tracking-wider text-brand-on-surface">Admin Login</p>
                          <p className="text-[9px] text-brand-on-surface-variant/60 mt-0.5">Manage dashboard</p>
                        </div>
                      </button>
                    </>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Hamburger — mobile / tablet */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="xl:hidden p-2.5 rounded-lg border border-brand-gold/15 bg-brand-surface-high text-brand-on-surface hover:text-brand-gold transition-all"
            aria-label="Toggle mobile menu"
          >
            <AnimatePresence mode="wait" initial={false}>
              {isMobileMenuOpen
                ? <motion.span key="x"    initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.15 }}><X size={20} /></motion.span>
                : <motion.span key="menu" initial={{ rotate:  90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.15 }}><Menu size={20} /></motion.span>
              }
            </AnimatePresence>
          </button>
        </div>
      </div>

      {/* ── Mobile Drawer ─────────────────────────────────────────────── */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            key="drawer"
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25, ease: [0.25, 1, 0.5, 1] }}
            className="xl:hidden absolute top-full left-0 w-full bg-brand-surface-container/98 backdrop-blur-xl border-b border-brand-gold/20 shadow-2xl z-40 overflow-hidden"
          >
            {/* Nav links */}
            <div className="px-6 pt-4 pb-2 flex flex-col">
              {navLinks.map((link, i) => {
                const isActive = activeView === link.value;
                return (
                  <motion.button
                    key={link.value}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.03 }}
                    onClick={() => handleNav(link.value)}
                    className={`flex items-center justify-between py-3.5 border-b font-display text-xs font-bold tracking-widest uppercase transition-all ${
                      isActive
                        ? 'text-brand-gold border-brand-gold/20 pl-2'
                        : 'text-brand-on-surface-variant/80 border-white/5 hover:text-brand-gold hover:pl-1'
                    }`}
                  >
                    {link.label}
                    {isActive && <span className="w-1.5 h-1.5 rounded-full bg-brand-gold" />}
                  </motion.button>
                );
              })}
            </div>

            {/* Mobile Auth options */}
            {currentUser ? (
              // Logged in User Menu in Mobile Drawer
              <div className="px-6 py-4 border-t border-white/5 flex flex-col gap-1">
                <div className="py-2.5 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-brand-gold text-[#0a0f18] font-display font-black text-xs flex items-center justify-center">
                    {getInitial(currentUser.name)}
                  </div>
                  <div>
                    <p className="font-display text-[10px] font-bold uppercase tracking-wider text-brand-on-surface truncate">
                      {currentUser.name}
                    </p>
                    <p className="text-[9px] text-brand-on-surface-variant/60 truncate mt-0.5">
                      {currentUser.email}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => handleNav('profile')}
                  className="flex items-center gap-3.5 py-3 font-display text-[10px] font-bold uppercase tracking-wider text-brand-on-surface-variant hover:text-brand-gold border-b border-white/5 transition-all text-left"
                >
                  <User size={13} /> My Profile
                </button>

                <button
                  onClick={() => handleNav(currentUser.role === 'admin' ? 'admin-dashboard' : 'dashboard')}
                  className="flex items-center gap-3.5 py-3 font-display text-[10px] font-bold uppercase tracking-wider text-brand-on-surface-variant hover:text-brand-gold border-b border-white/5 transition-all text-left"
                >
                  <ShieldCheck size={13} /> {currentUser.role === 'admin' ? 'Admin Panel' : 'Dashboard'}
                </button>

                <button
                  onClick={() => handleNav('enquiries')}
                  className="flex items-center gap-3.5 py-3 font-display text-[10px] font-bold uppercase tracking-wider text-brand-on-surface-variant hover:text-brand-gold border-b border-white/5 transition-all text-left"
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                  </svg> My Enquiries
                </button>

                <button
                  onClick={() => handleNav('settings')}
                  className="flex items-center gap-3.5 py-3 font-display text-[10px] font-bold uppercase tracking-wider text-brand-on-surface-variant hover:text-brand-gold border-b border-white/5 transition-all text-left"
                >
                  <Settings size={13} /> Settings
                </button>

                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    onLogout();
                  }}
                  className="flex items-center gap-3.5 py-3.5 font-display text-[10px] font-black uppercase tracking-wider text-red-400 hover:text-red-300 transition-all text-left"
                >
                  <LogOut size={13} /> Logout
                </button>
              </div>
            ) : (
              // Unauthenticated Logins in Mobile Drawer
              <div className="px-6 py-4 border-t border-white/5">
                <p className="text-[9px] font-bold uppercase tracking-widest text-brand-on-surface-variant/50 mb-3">Login As</p>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => handleNav('login')}
                    className="flex items-center justify-center gap-2 py-3 bg-brand-surface-high border border-white/10 text-brand-on-surface font-display text-[10px] font-bold uppercase tracking-widest rounded-xl hover:border-brand-gold/30 hover:text-brand-gold transition-all"
                  >
                    <User size={13} /> User
                  </button>
                  <button
                    onClick={() => handleNav('admin-login')}
                    className="flex items-center justify-center gap-2 py-3 bg-brand-surface-high border border-brand-gold/20 text-brand-gold font-display text-[10px] font-bold uppercase tracking-widest rounded-xl hover:bg-brand-gold hover:text-[#0a0f18] transition-all"
                  >
                    <ShieldCheck size={13} /> Admin
                  </button>
                </div>
              </div>
            )}

            {/* Free Quote CTA */}
            <div className="px-6 pb-5">
              <button
                onClick={() => { setIsMobileMenuOpen(false); onInquire(); }}
                className="w-full py-3.5 bg-brand-gold text-[#0a0f18] font-display text-[10px] font-black uppercase tracking-widest rounded-xl shadow-lg shadow-brand-gold/20 hover:scale-[1.01] transition-all"
              >
                Get a Free Quote
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
