import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import User from '../models/User.js';
import Project from '../models/Project.js';
import HousePlan from '../models/HousePlan.js';
import Gallery from '../models/Gallery.js';
import SiteSettings from '../models/SiteSettings.js';
import Blog from '../models/Blog.js';
import Service from '../models/Service.js';
import Testimonial from '../models/Testimonial.js';
import env from '../config/env.js';
import logger from './logger.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const loadSeedData = () => {
  const seedPath = path.join(__dirname, '../data/seedData.json');
  if (!fs.existsSync(seedPath)) return null;
  return JSON.parse(fs.readFileSync(seedPath, 'utf-8'));
};

export const seedDatabase = async () => {
  try {
    const settingsCount = await SiteSettings.countDocuments();
    if (settingsCount === 0) {
      await SiteSettings.create({
        companyPhone: '+918009363259',
        whatsappNumber: '+918009363259',
        emailForNotifications: 'admin@nvsbuildcon.com',
        contactEmail: 'nishant.designs13@gmail.com',
        contactPhone: '+91 8009363259',
        address: 'Lucknow, Uttar Pradesh, India',
        heroHeading: 'Engineering Luxury. Crafting Legacy.',
        heroSubheading:
          'Bespoke architectural execution, Vastu-compliant layouts, and structural blueprints engineered for precision.',
      });
      logger.info('Seeded default site settings');
    }

    const adminCount = await User.countDocuments({ role: 'admin' });
    if (adminCount === 0) {
      const hashedPassword = await bcrypt.hash('AdminPassword123!', env.BCRYPT_ROUNDS);
      await User.create({
        name: 'NVS Admin',
        email: 'admin@nvsbuildcon.com',
        phone: '+918009363259',
        password: hashedPassword,
        role: 'admin',
      });
      logger.info('Seeded default admin: admin@nvsbuildcon.com');
    }

    const seedData = loadSeedData();

    if (seedData && (await Project.countDocuments()) === 0) {
      const mapped = seedData.PROJECTS_DATA.map((p) => ({
        customId: p.id,
        title: p.title,
        category: p.category,
        imageUrl: p.imageUrl,
        beforeImageUrl: p.beforeImageUrl,
        description: p.description,
        location: p.location,
        year: p.year,
        area: p.area,
        budget: p.budget,
        duration: p.duration,
        materials: p.materials || [],
        images: [p.imageUrl],
        pdfs: [],
      }));
      await Project.insertMany(mapped);
      logger.info(`Seeded ${mapped.length} projects`);
    }

    if (seedData && (await HousePlan.countDocuments()) === 0) {
      const mapped = seedData.BLUEPRINTS_DATA.map((bp) => ({
        customId: bp.id,
        title: bp.title,
        category: bp.category,
        imageUrl: bp.imageUrl,
        previewImage: bp.imageUrl,
        pdfUrl: bp.pdfUrl,
        pdf: bp.pdfUrl,
        description: bp.description,
        area: bp.area || 'N/A',
        bedrooms: bp.beds || 0,
        bathrooms: bp.baths || 0,
        beds: bp.beds || 0,
        baths: bp.baths || 0,
        cars: bp.cars || 0,
        specs: bp.specs || {},
      }));
      await HousePlan.insertMany(mapped);
      logger.info(`Seeded ${mapped.length} house plans`);
    }

    if (seedData && (await Gallery.countDocuments()) === 0) {
      const mapped = seedData.GALLERY_DATA.map((g) => ({
        title: g.title,
        category: g.category,
        imageUrl: g.imageUrl,
        desc: g.desc,
        alt: g.alt,
      }));
      await Gallery.insertMany(mapped);
      logger.info(`Seeded ${mapped.length} gallery items`);
    }

    if ((await Service.countDocuments()) === 0) {
      await Service.insertMany([
        {
          title: 'Architectural Design Division',
          description:
            'Millimeter-precision floor plans, structural layouts, and customized Vastu-aligned residential/commercial blueprint packages.',
          icon: 'Compass',
          details: ['2D Floor Plans', '3D Elevations', 'Vastu Consultation', 'Site Layouts'],
        },
        {
          title: 'Structural Engineering & Physics',
          description:
            'High-strength structural moments analysis, reinforcement framing detailing, and foundation drawings for high-rise commercial structures.',
          icon: 'Layers',
          details: ['Seismic Foundations', 'Moment Frame Columns', 'Reinforcement Detail', 'MEP Integrations'],
        },
        {
          title: 'Premium Interior Architecture',
          description:
            'Rare bookmatched marble panel routing, concealed linear lighting coves, and custom premium kitchen configurations.',
          icon: 'Landmark',
          details: ['Luxury Master Suites', 'Modular Kitchen Layouts', 'Acoustic Wall Panels', 'Architectural Light Fields'],
        },
      ]);
      logger.info('Seeded default services');
    }

    if (seedData && (await Testimonial.countDocuments()) === 0) {
      const mapped = seedData.TESTIMONIALS_DATA.map((t) => ({
        name: t.name,
        clientName: t.name,
        role: t.role,
        rating: t.rating,
        review: t.review,
      }));
      await Testimonial.insertMany(mapped);
      logger.info(`Seeded ${mapped.length} testimonials`);
    }

    if ((await Blog.countDocuments()) === 0) {
      await Blog.insertMany([
        {
          title: 'The Principles of Modernist Residential Vastu',
          slug: 'modernist-residential-vastu',
          content:
            'Vastu is architectural layout thermodynamics. Aligning energy lines with natural solar light voids creates spaces that feel harmonious, healthy, and premium.',
          imageUrl: '/images/WhatsApp Image 2026-06-29 at 13.04.30.jpeg',
          featuredImage: '/images/WhatsApp Image 2026-06-29 at 13.04.30.jpeg',
          category: 'Residential',
          tags: ['vastu', 'residential', 'architecture'],
        },
        {
          title: 'High-Strength Steel Frame Structures in Retail Design',
          slug: 'steel-frame-structures-retail',
          content:
            'Open layouts in luxury showrooms require extreme column-free spans. Composite moment-resisting steel-concrete columns create safe, sprawling interior layouts.',
          imageUrl: '/images/WhatsApp Image 2026-06-29 at 13.04.31 (1).jpeg',
          featuredImage: '/images/WhatsApp Image 2026-06-29 at 13.04.31 (1).jpeg',
          category: 'Commercial',
          tags: ['steel', 'commercial', 'engineering'],
        },
      ]);
      logger.info('Seeded default blogs');
    }
  } catch (err) {
    logger.error('Database seeding failed', { message: err.message });
  }
};
