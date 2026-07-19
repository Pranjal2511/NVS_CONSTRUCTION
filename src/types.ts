export interface Blueprint {
  id: string;
  title: string;
  category: string;
  area?: string;
  beds?: number;
  baths?: number;
  cars?: number;
  imageUrl: string;
  pdfUrl: string;
  description: string;
  specs?: {
    foundation?: string;
    superstructure?: string;
    flooring?: string;
    glazing?: string;
    hvac?: string;
    automation?: string;
  };
}

export interface GalleryItem {
  id: string;
  title: string;
  category: 'Residential' | 'Commercial' | 'Interior' | 'Exterior' | 'House Plans' | string;
  imageUrl: string;
  desc: string;
  alt: string;
}

export interface Project {
  id: string;
  title: string;
  category: 'Residential' | 'Commercial' | 'Interior' | 'Exterior';
  imageUrl: string;
  beforeImageUrl?: string;
  description: string;
  location?: string;
  year?: string;
  area?: string;
  budget?: string;
  duration?: string;
  materials?: string[];
}

export interface Inquiry {
  id: string;
  name: string;
  email: string;
  phone: string;
  service: string;
  blueprintTitle?: string;
  message: string;
  date: string;
  status?: 'pending' | 'in-progress' | 'completed';
}

export interface DreamHomeRequest {
  id?: string;
  name: string;
  email: string;
  phone: string;
  plotSize: string;
  floors: string;
  bedrooms: string;
  budget: string;
  style: 'Modern' | 'Classic' | 'Luxury' | 'Minimal';
  additionalNotes?: string;
  date?: string;
  status?: 'pending' | 'consultation' | 'site-visit' | 'planning' | '2d-layout' | '3d-elevation' | 'construction' | 'interior' | 'handover';
}

export interface AdminStats {
  totalProjects: number;
  totalUsers: number;
  totalEnquiries: number;
  totalDreamHomeRequests: number;
}

export interface Notification {
  id: string;
  userId: string;
  message: string;
  read: boolean;
  date: string;
  type: 'enquiry' | 'appointment' | 'download' | 'general';
}

export interface SiteSettings {
  heroHeading: string;
  heroSubheading: string;
  whatsappNumber: string;
  email: string;
  address: string;
  metaTitle: string;
  metaDescription: string;
  metaKeywords: string;
  projectsCount: number;
  citiesCount: number;
  yearsCount: number;
}

export type AppointmentStage =
  | 'consultation'
  | 'site-visit'
  | 'planning'
  | '2d-layout'
  | '3d-elevation'
  | 'construction'
  | 'interior'
  | 'handover';

export type ViewState =
  | 'home'
  | 'projects'
  | 'house-plans'
  | 'gallery'
  | 'services'
  | 'process'
  | 'calculator'
  | 'about'
  | 'testimonials'
  | 'contact'
  | 'design-wizard'
  | 'login'
  | 'admin-login'
  | 'dashboard'
  | 'admin-dashboard'
  | 'profile'
  | 'enquiries'
  | 'settings'
  | 'reset-password';

export interface Testimonial {
  id?: string;
  name: string;
  role: string;
  rating: number;
  review: string;
}

export interface FAQItem {
  question: string;
  answer: string;
}
