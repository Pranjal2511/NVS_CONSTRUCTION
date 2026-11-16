import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import Project from '../models/Project.js';
import HousePlan from '../models/HousePlan.js';
import Gallery from '../models/Gallery.js';
import SiteSettings from '../models/SiteSettings.js';
import Blog from '../models/Blog.js';
import Service from '../models/Service.js';
import Testimonial from '../models/Testimonial.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const loadSeedData = () => {
  const seedPath = path.join(__dirname, '../data/seedData.json');
  if (!fs.existsSync(seedPath)) return null;
  return JSON.parse(fs.readFileSync(seedPath, 'utf-8'));
};

export const getSeedEntries = async () => {
  const entries = [];
  const add = (Model, records, keys) => { for (const record of records) entries.push({ Model, record, keys }); };
  try {
    {
      add(SiteSettings, [{
        companyPhone: '+918009363259',
        whatsappNumber: '+918009363259',
        emailForNotifications: 'admin@nvsbuildcon.com',
        contactEmail: 'nishant.designs13@gmail.com',
        contactPhone: '+91 8009363259',
        address: 'Lucknow, Uttar Pradesh, India',
        heroHeading: 'Engineering Luxury. Crafting Legacy.',
        heroSubheading:
          'Bespoke architectural execution, Vastu-compliant layouts, and structural blueprints engineered for precision.',
      }], []);
    }

    const seedData = loadSeedData();

    if (seedData) {
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
      add(Project, mapped, ["customId"]);

    }

    if (seedData) {
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
      add(HousePlan, mapped, ["customId"]);

    }

    if (seedData) {
      const mapped = seedData.GALLERY_DATA.map((g) => ({
        title: g.title,
        category: g.category,
        imageUrl: g.imageUrl,
        desc: g.desc,
        alt: g.alt,
      }));
      add(Gallery, mapped, ["title","imageUrl"]);

    }

    if (true) {
      add(Service, [
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
      ], ['title']);
    }

    if (seedData) {
      const mapped = seedData.TESTIMONIALS_DATA.map((t) => ({
        name: t.name,
        clientName: t.name,
        role: t.role,
        rating: t.rating,
        review: t.review,
      }));
      add(Testimonial, mapped, ["name","review"]);

    }

    if (true) {
      add(Blog, [
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
      ], ['slug']);
    }
    return entries;
  } catch (err) { throw err; }
};

export const seedDatabase = async ({ apply = false } = {}) => {
  const entries = await getSeedEntries();
  // Validate every supplied record before any writes.
  for (const { Model, record } of entries) await new Model(record).validate();
  const result = { existing: 0, missing: 0, inserted: 0 };
  for (const { Model, record, keys } of entries) {
    const filter = Object.fromEntries(keys.map(key => [key, record[key]]));
    if (await Model.exists(filter)) { result.existing++; continue; }
    result.missing++;
    if (apply) {
      const outcome = await Model.updateOne(filter, { $setOnInsert: record }, { upsert: true, runValidators: true, setDefaultsOnInsert: true });
      result.inserted += outcome.upsertedCount;
    }
  }
  return result;
};
