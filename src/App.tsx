import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Loader2 } from 'lucide-react';

import Navbar from './components/Navbar';
import Concierge from './components/Concierge';
import UserLogin from './pages/UserLogin';
import AdminLogin from './pages/AdminLogin';
import ResetPassword from './pages/ResetPassword';
import AdminDashboard from './pages/admin/AdminDashboard';
import ClientPortal from './pages/ClientPortal';
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
import PricingSection from './components/PricingSection';
import Preloader from './components/Preloader';
import { ViewState, Inquiry } from './types';
import { AuthUser, fetchUserProfile, logout, signOutAllDevices } from './utils/auth';
import { apiFetch } from './utils/api';

export const viewToPath: Record<ViewState, string> = {
  home: '/',
  services: '/services',
  projects: '/projects',
  'house-plans': '/house-plans',
  gallery: '/gallery',
  process: '/process',
  calculator: '/calculator',
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
  settings: '/settings',
  'reset-password': '/reset-password'
};

export const pathToView = (path: string): ViewState => {
  if (path === '/') return 'home';
  if (path === '/services') return 'services';
  if (path === '/projects') return 'projects';
  if (path === '/house-plans') return 'house-plans';
  if (path === '/gallery') return 'gallery';
  if (path === '/process') return 'process';
  if (path === '/calculator') return 'calculator';
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
  if (path === '/reset-password') return 'reset-password';
  return 'home';
};

export default function App() {
  const navigate = useNavigate();
  const location = useLocation();
  


  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [checkingSession, setCheckingSession] = useState(true);
  
  // Modals & Inquiries
  const [isInquiryOpen, setIsInquiryOpen] = useState(false);
  const [inquiryBlueprintTitle, setInquiryBlueprintTitle] = useState<string | undefined>(undefined);
  const [inquiryService, setInquiryService] = useState<string | undefined>(undefined);

  // Derived active view from URL
  const activeView: ViewState = pathToView(location.pathname);

  const handleInquire = (serviceOrTitle?: string, asBlueprint?: boolean) => {
    if (asBlueprint) {
      setInquiryBlueprintTitle(serviceOrTitle);
      setInquiryService(undefined);
    } else {
      setInquiryService(serviceOrTitle);
      setInquiryBlueprintTitle(undefined);
    }
    setIsInquiryOpen(true);
  };



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



  if (checkingSession) {
    return (
      <div className="min-h-screen bg-[#0a0f18] text-white flex flex-col items-center justify-center">
        <Loader2 className="animate-spin text-brand-gold mb-4" size={32} />
        <p className="font-display text-[10px] font-bold uppercase tracking-widest text-brand-on-surface-variant">Checking session state…</p>
      </div>
    );
  }

  // Determine if we should hide the site chrome (navbar, footer) for full-screen portals
  const isPortalRoute = location.pathname.startsWith('/admin') || 
                        location.pathname.startsWith('/dashboard') || 
                        ['profile','enquiries','settings','saved-plans','saved-quotes','wishlist','notifications','downloads','appointments'].some(p => location.pathname === `/${p}`);

  return (
    <div className="min-h-screen bg-brand-surface text-brand-on-surface selection:bg-brand-gold/20 selection:text-brand-gold flex flex-col">
      {/* Premium Luxury Preloader */}
      <Preloader />

      {/* Top Navbar — hidden on admin/client portal routes */}
      {!isPortalRoute && (
        <Navbar 
          activeView={activeView} 
          onViewChange={handleViewChange} 
          onInquire={() => handleInquire()}
          currentUser={currentUser}
          onLogout={handleLogout}
        />
      )}

      {/* Floating Concierge Sidebar — hidden on portal routes */}
      {!isPortalRoute && <Concierge onInquire={handleInquire} />}

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

              <Route path="/calculator" element={
                <>
                  <Helmet>
                    <title>Price Calculator | NVS Buildcon</title>
                    <meta name="description" content="Calculate the estimated cost for architectural and construction services." />
                  </Helmet>
                  <PricingSection onOpenQuoteForm={(service) => handleInquire(service)} />
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

              <Route path="/reset-password" element={
                <>
                  <Helmet>
                    <title>Reset Password | NVS Buildcon</title>
                  </Helmet>
                  <ResetPassword />
                </>
              } />

              <Route path="/dashboard" element={currentUser ? <ClientPortal currentUser={currentUser} onLogout={handleLogout} onNavigate={(p) => navigate(p)} onInquire={() => handleInquire()} /> : <Navigate to="/login" replace />} />
              <Route path="/profile" element={currentUser ? <ClientPortal currentUser={currentUser} onLogout={handleLogout} onNavigate={(p) => navigate(p)} onInquire={() => handleInquire()} /> : <Navigate to="/login" replace />} />
              <Route path="/saved-plans" element={currentUser ? <ClientPortal currentUser={currentUser} onLogout={handleLogout} onNavigate={(p) => navigate(p)} onInquire={() => handleInquire()} /> : <Navigate to="/login" replace />} />
              <Route path="/saved-quotes" element={currentUser ? <ClientPortal currentUser={currentUser} onLogout={handleLogout} onNavigate={(p) => navigate(p)} onInquire={() => handleInquire()} /> : <Navigate to="/login" replace />} />
              <Route path="/wishlist" element={currentUser ? <ClientPortal currentUser={currentUser} onLogout={handleLogout} onNavigate={(p) => navigate(p)} onInquire={() => handleInquire()} /> : <Navigate to="/login" replace />} />
              <Route path="/notifications" element={currentUser ? <ClientPortal currentUser={currentUser} onLogout={handleLogout} onNavigate={(p) => navigate(p)} onInquire={() => handleInquire()} /> : <Navigate to="/login" replace />} />
              <Route path="/downloads" element={currentUser ? <ClientPortal currentUser={currentUser} onLogout={handleLogout} onNavigate={(p) => navigate(p)} onInquire={() => handleInquire()} /> : <Navigate to="/login" replace />} />
              <Route path="/appointments" element={currentUser ? <ClientPortal currentUser={currentUser} onLogout={handleLogout} onNavigate={(p) => navigate(p)} onInquire={() => handleInquire()} /> : <Navigate to="/login" replace />} />
              <Route path="/enquiries" element={currentUser ? <ClientPortal currentUser={currentUser} onLogout={handleLogout} onNavigate={(p) => navigate(p)} onInquire={() => handleInquire()} /> : <Navigate to="/login" replace />} />
              <Route path="/settings" element={currentUser ? <ClientPortal currentUser={currentUser} onLogout={handleLogout} onNavigate={(p) => navigate(p)} onInquire={() => handleInquire()} /> : <Navigate to="/login" replace />} />
              <Route path="/admin/dashboard" element={<AdminDashboard currentUser={currentUser!} onLogout={handleLogout} />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Premium Dark Site Footer — hidden on portal routes */}
      {!isPortalRoute && (
        <Footer 
          onViewChange={handleViewChange} 
          onInquire={() => handleInquire()} 
        />
      )}

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
