import { Blueprint, GalleryItem, Project } from './types';

export const PROJECTS_DATA: Project[] = [
  {
    id: 'narrow-urban-residence',
    title: 'Narrow Urban Residence',
    category: 'Residential',
    imageUrl: '/images/WhatsApp Image 2026-06-29 at 13.04.30 (1).jpeg',
    beforeImageUrl: '/images/WhatsApp Image 2026-06-29 at 13.04.33.jpeg',
    location: 'Lucknow, India',
    year: '2026',
    area: '18 ft frontage',
    duration: 'Design + build scope',
    budget: 'Custom quote',
    description: 'A slim multi-storey home elevation with stone cladding, balcony planting, warm soffit lighting, and a compact street-facing gate composition.'
  },
  {
    id: 'luxury-duplex-elevation',
    title: 'Luxury Duplex Elevation',
    category: 'Residential',
    imageUrl: '/images/WhatsApp Image 2026-06-29 at 13.04.31 (1).jpeg',
    beforeImageUrl: '/images/WhatsApp Image 2026-06-29 at 13.04.32 (1).jpeg',
    location: 'Delhi NCR, India',
    year: '2025',
    area: '30x50 ft plot',
    duration: '10-14 months',
    budget: 'Premium finish',
    description: 'A contemporary duplex facade with bold vertical fins, layered balcony slabs, glass railings, and warm facade lighting for evening visibility.'
  },
  {
    id: 'olive-bedroom-suite',
    title: 'Olive Bedroom Suite',
    category: 'Interior',
    imageUrl: '/images/WhatsApp Image 2026-06-29 at 13.04.31 (3).jpeg',
    beforeImageUrl: '/images/WhatsApp Image 2026-06-29 at 13.04.30.jpeg',
    location: 'Prayagraj, India',
    year: '2026',
    area: 'Master bedroom',
    duration: '6-8 weeks',
    budget: 'Modular interior',
    description: 'A soft neutral master bedroom with ceiling-height wardrobes, ribbed wall panels, concealed warm lighting, bedside storage, and a compact lounge corner.'
  },
  {
    id: 'contemporary-lighting-villa',
    title: 'Contemporary Lighting Villa',
    category: 'Residential',
    imageUrl: '/images/WhatsApp Image 2026-06-29 at 13.04.32 (1).jpeg',
    location: 'Varanasi, India',
    year: '2026',
    area: '22x45 ft plot',
    duration: 'Elevation package',
    budget: 'Premium lighting',
    description: 'A vertical villa facade using tall window frames, roofline strip lighting, textured cladding, and layered balconies for a polished night elevation.'
  },
  {
    id: 'sage-media-bedroom',
    title: 'Sage Media Bedroom',
    category: 'Interior',
    imageUrl: '/images/WhatsApp Image 2026-06-29 at 13.04.39.jpeg',
    location: 'Lucknow, India',
    year: '2026',
    area: 'Bedroom + TV unit',
    duration: '5-7 weeks',
    budget: 'Custom furniture',
    description: 'A calm bedroom interior with a sage TV wall, floating shelves, wooden media ledge, integrated storage, and a connected vanity niche.'
  },
  {
    id: 'completed-living-hall',
    title: 'Completed Living Hall',
    category: 'Interior',
    imageUrl: '/images/WhatsApp Image 2026-06-29 at 13.04.40.jpeg',
    location: 'Kanpur, India',
    year: '2026',
    area: 'Family lounge',
    duration: '6 weeks',
    budget: 'Turnkey interior',
    description: 'A finished living hall with L-shaped sofa seating, full-height curtains, wall moulding, ribbed ceiling treatment, and warm display shelving.'
  },
  {
    id: 'single-floor-modern-home',
    title: 'Single-Floor Modern Home',
    category: 'Residential',
    imageUrl: '/images/WhatsApp Image 2026-06-29 at 13.04.46.jpeg',
    location: 'Noida, India',
    year: '2026',
    area: '35x60 ft plot',
    duration: '8-10 months',
    budget: 'Premium exterior',
    description: 'A balanced single-floor residence with a central wood door, glass balcony edge, striped cladding, garden lighting, and a detailed entrance gate.'
  },
  {
    id: 'compact-modern-facade',
    title: 'Compact Modern Facade',
    category: 'Exterior',
    imageUrl: '/images/WhatsApp Image 2026-06-29 at 13.04.33.jpeg',
    location: 'Delhi, India',
    year: '2026',
    area: 'Compact frontage',
    duration: '3D elevation',
    budget: 'Facade package',
    description: 'A compact front elevation with warm vertical LED bands, textured wall finish, clean glazing, and a sheltered entrance for tight urban plots.'
  }
];

export const GALLERY_DATA: GalleryItem[] = [
  {
    id: 'gal-1',
    title: 'Narrow Home Front Elevation',
    category: 'Residential',
    imageUrl: '/images/WhatsApp Image 2026-06-29 at 13.04.30 (1).jpeg',
    desc: 'Completed narrow residential elevation with stone texture, balcony greenery, glass railing, warm ceiling lights, and street-facing gate.',
    alt: 'NVS Buildcon narrow residential exterior elevation'
  },
  {
    id: 'gal-2',
    title: 'Completed Bed With Storage',
    category: 'Interior',
    imageUrl: '/images/WhatsApp Image 2026-06-29 at 13.04.30.jpeg',
    desc: 'Executed bedroom with hydraulic storage bed, sliding wardrobe, wall panelling, false ceiling, fan, bedside ledges, and window treatment.',
    alt: 'Completed bedroom interior with storage bed and wardrobe'
  },
  {
    id: 'gal-3',
    title: 'Luxury Duplex Night Elevation',
    category: 'Residential',
    imageUrl: '/images/WhatsApp Image 2026-06-29 at 13.04.31 (1).jpeg',
    desc: 'Contemporary duplex exterior with vertical fins, framed volumes, balcony glass, wooden entry doors, and warm architectural lighting.',
    alt: 'Luxury duplex elevation with warm exterior lighting'
  },
  {
    id: 'gal-4',
    title: 'Study Niche And Stair Partition',
    category: 'Interior',
    imageUrl: '/images/WhatsApp Image 2026-06-29 at 13.04.31 (2).jpeg',
    desc: 'Compact study counter with sage accent wall, floating shelves, wardrobe storage, wooden stair screen, and display shelving.',
    alt: 'Compact interior study niche with wooden stair partition'
  },
  {
    id: 'gal-5',
    title: 'Neutral Master Bedroom Render',
    category: 'Interior',
    imageUrl: '/images/WhatsApp Image 2026-06-29 at 13.04.31 (3).jpeg',
    desc: 'Master bedroom render with full-height wardrobes, upholstered bed, bedside ledges, floral wall art, ceiling lights, and lounge seating.',
    alt: 'Neutral master bedroom interior render'
  },
  {
    id: 'gal-6',
    title: 'Completed Bedroom In Progress',
    category: 'Interior',
    imageUrl: '/images/WhatsApp Image 2026-06-29 at 13.04.33.jpeg',
    desc: 'Bedroom execution view showing wardrobe installation, ceiling panel, storage bed, side tables, wall panel details, and finishing material on site.',
    alt: 'Bedroom interior execution work in progress'
  },
  {
    id: 'gal-7',
    title: 'Three-Storey Villa Elevation',
    category: 'Residential',
    imageUrl: '/images/WhatsApp Image 2026-06-29 at 13.04.32 (1).jpeg',
    desc: 'Tall residential exterior with strip lighting, vertical cladding, glass balcony railings, framed terrace, and a detailed entry gate.',
    alt: 'Three storey modern villa elevation with lighting'
  },
  {
    id: 'gal-8',
    title: 'Bedroom TV Wall Render',
    category: 'Interior',
    imageUrl: '/images/WhatsApp Image 2026-06-29 at 13.04.33.jpeg',
    desc: 'Bedroom TV wall concept with textured feature wall, floating console, sage drawers, display shelf, and connected vanity passage.',
    alt: 'Bedroom TV wall and vanity interior render'
  },
  {
    id: 'gal-9',
    title: 'Wardrobe And Vanity Wall',
    category: 'Interior',
    imageUrl: '/images/WhatsApp Image 2026-06-29 at 13.04.32.jpeg',
    desc: 'Bedroom view with wardrobe elevation, AC panel, framed art, vanity mirror lighting, sofa corner, and clean neutral finishes.',
    alt: 'Bedroom wardrobe and vanity wall design'
  },
  {
    id: 'gal-10',
    title: 'Compact Facade With LED Bands',
    category: 'Exterior',
    imageUrl: '/images/WhatsApp Image 2026-06-29 at 13.04.33.jpeg',
    desc: 'Compact modern facade with large window panels, warm vertical LED accents, glass balcony railing, and a protected ground-floor entrance.',
    alt: 'Compact modern home exterior facade with lighting'
  },
  {
    id: 'gal-11',
    title: 'Sage Bedroom Media Wall',
    category: 'Interior',
    imageUrl: '/images/WhatsApp Image 2026-06-29 at 13.04.39.jpeg',
    desc: 'Bedroom interior with mounted TV, long floating shelf, sage accent wall, bed backrest, framed art, and passage to a study nook.',
    alt: 'Sage bedroom media wall and bed interior'
  },
  {
    id: 'gal-12',
    title: 'Completed Living Hall',
    category: 'Interior',
    imageUrl: '/images/WhatsApp Image 2026-06-29 at 13.04.40.jpeg',
    desc: 'Executed living hall with L-shaped cream sofa, full-height curtains, ceiling detail, marble floor, wall moulding, and display niches.',
    alt: 'Completed living hall interior with sofa and curtains'
  },
  {
    id: 'gal-13',
    title: 'Wardrobe Bedroom Render',
    category: 'Interior',
    imageUrl: '/images/WhatsApp Image 2026-06-29 at 13.04.41.jpeg',
    desc: 'Bedroom render with full-height wardrobes, headboard panelling, display shelves, vanity mirror, framed art, and warm cove lighting.',
    alt: 'Wardrobe focused bedroom interior render'
  },
  {
    id: 'gal-14',
    title: 'Vanity Niche Detail',
    category: 'Interior',
    imageUrl: '/images/WhatsApp Image 2026-06-29 at 13.04.42 (1).jpeg',
    desc: 'Detailed vanity niche with arched mirror, wooden counter, soft stool, sage wall, display shelving, and wooden partition screen.',
    alt: 'Bedroom vanity niche with arched mirror'
  },
  {
    id: 'gal-15',
    title: 'Bedroom TV Wall Close View',
    category: 'Interior',
    imageUrl: '/images/WhatsApp Image 2026-06-29 at 13.04.42.jpeg',
    desc: 'Close bedroom media wall view with textured TV backdrop, floating storage, sage drawers, wooden shelf, and framed wall art.',
    alt: 'Close view of bedroom TV wall design'
  },
  {
    id: 'gal-16',
    title: 'Wardrobe Passage Detail',
    category: 'Interior',
    imageUrl: '/images/WhatsApp Image 2026-06-29 at 13.04.46 (1).jpeg',
    desc: 'Wardrobe passage with cream shutters, wooden trims, tall handles, open shelving, mirror niche, and vertical wooden partition.',
    alt: 'Wardrobe passage interior with wood partition'
  },
  {
    id: 'gal-17',
    title: 'Single-Floor Modern Residence',
    category: 'Exterior',
    imageUrl: '/images/WhatsApp Image 2026-06-29 at 13.04.46.jpeg',
    desc: 'Single-floor modern residence with central entry, striped wall cladding, balcony glass, landscaped boundary, and warm gate lighting.',
    alt: 'Single floor modern residential exterior'
  }
];

export const BLUEPRINTS_DATA: Blueprint[] = [
  {
    id: 'standard-2d-floor-plan-7',
    title: 'Standard 2D Floor Plan (Layout 7)',
    category: 'House Plans',
    pdfUrl: '/pdfs/7..pdf',
    imageUrl: '/images/WhatsApp Image 2026-06-29 at 13.04.33.jpeg',
    description: 'Standard 2D floor planning layout specifying spatial geometry, doors, windows, and partition walls.',
    specs: {
      foundation: '2D Architectural Layout Drafting',
      superstructure: 'Standard Brick Masonry planning',
      flooring: 'General space allocation schematics'
    }
  },
  {
    id: 'boys-bedroom-layout',
    title: "Boy's Bedroom Layout Plan",
    category: 'Interior',
    pdfUrl: '/pdfs/BOY BED ROOM.pdf',
    imageUrl: '/images/WhatsApp Image 2026-06-29 at 13.04.31.jpeg',
    description: 'Millimeter-precision interior blueprint mapping furniture placement, lighting layout, and electrical sockets.',
    specs: {
      foundation: 'Electrical & Cabinet detailed drawings',
      superstructure: 'Premium timber and lighting layouts',
      flooring: 'Laminated wooden plank allocation plan'
    }
  },
  {
    id: 'delhi-project-structural-layout',
    title: 'Delhi Project Structural Layout',
    category: 'Residential',
    pdfUrl: '/pdfs/Delhi-bak.pdf',
    imageUrl: '/images/WhatsApp Image 2026-06-29 at 13.04.31 (1).jpeg',
    description: 'Residential planning and structural layout package for a modern Delhi project, covering room placement and construction-ready details.',
    specs: {
      foundation: 'Seismic isolating pile foundation drawing',
      superstructure: 'High-strength structural concrete layout',
      flooring: 'Heavy load structural slab planning'
    }
  },
  {
    id: 'residential-house-plan-77',
    title: 'Residential House Plan (Layout 77)',
    category: 'House Plans',
    pdfUrl: '/pdfs/DOC-20260527-WA0077..pdf',
    imageUrl: '/images/WhatsApp Image 2026-06-29 at 13.04.30 (1).jpeg',
    description: 'Vastu-compliant residential zoning map detailing room layouts, staircase direction, and furniture configurations.',
    specs: {
      foundation: 'Standard spread footing planning map',
      superstructure: 'Vastu-aligned wall alignments',
      flooring: 'Vitrifed tiles structural mappings'
    }
  },
  {
    id: 'girls-bedroom-layout',
    title: "Girl's Bedroom Layout Plan",
    category: 'Interior',
    pdfUrl: '/pdfs/GIRL BED ROOM (2).pdf',
    imageUrl: '/images/WhatsApp Image 2026-06-29 at 13.04.31 (3).jpeg',
    description: 'Detailed interior blueprint drawing showing modern pastel wardrobes, study lounge, and concealed lights layout.',
    specs: {
      foundation: 'Detailed electrical wiring layout',
      superstructure: 'Ceiling layout and cabinet profile plans',
      flooring: 'Textured tile flooring layout schematic'
    }
  },
  {
    id: 'kitchen-dining-floor-plan',
    title: 'Kitchen & Dining Floor Plan',
    category: 'Interior',
    pdfUrl: '/pdfs/KITCHEN DINING.pdf',
    imageUrl: '/images/WhatsApp Image 2026-06-29 at 13.04.31 (2).jpeg',
    description: 'Millimeter-precision modular kitchen schematic specifying plumbing points, gas ducts, and cabinet dimensions.',
    specs: {
      foundation: 'MEP (Mechanical, Electrical, Plumbing) mapping',
      superstructure: 'Modular cabinetry and appliance spacing',
      flooring: 'Anti-skid quartz tile spacing plan'
    }
  },
  {
    id: 'living-hall-architectural-drawing',
    title: 'Living Hall Architectural Drawing',
    category: 'Interior',
    pdfUrl: '/pdfs/LIVING HALL.pdf',
    imageUrl: '/images/WhatsApp Image 2026-06-29 at 13.04.40.jpeg',
    description: 'Premium living space layout showing detailed wall panelling drawings, custom TV console layout, and ceiling profile.',
    specs: {
      foundation: 'Millimeter-precision framing drawings',
      superstructure: 'Ceiling height and lighting matrix layout',
      flooring: 'Bookmatched Italian marble pattern plan'
    }
  },
  {
    id: 'mr-vikram-ji-epd-drawing',
    title: 'Mr. Vikram Ji EPD Structural Drawing',
    category: 'Commercial',
    pdfUrl: '/pdfs/Mr Vikram ji .epd drawing .pdf 20-01-2026.pdf',
    imageUrl: '/images/WhatsApp Image 2026-06-29 at 13.04.32 (1).jpeg',
    description: 'Complete engineering package (Electrical, Plumbing, Drainage) layout drawings checked for compliance.',
    specs: {
      foundation: 'Drainage and sewage layout schematics',
      superstructure: 'MEP conduits layout blueprint',
      flooring: 'Concealed services slab routing map'
    }
  },
  {
    id: 'mr-divyaraj-singh-epd-drawing',
    title: 'Mr. Divyaraj Singh EPD Structural Drawing',
    category: 'Commercial',
    pdfUrl: '/pdfs/mr.divyaraj singh epd drawing pdf 21-11-2025.pdf',
    imageUrl: '/images/WhatsApp Image 2026-06-29 at 13.04.46.jpeg',
    description: 'RCC detailing and beam reinforcement layout drawings engineered for high load tolerances.',
    specs: {
      foundation: 'Raft foundation concrete reinforcement rebar plan',
      superstructure: 'RCC column and beam steel detailing layout',
      flooring: 'Slab reinforcement steel wire schematic'
    }
  },
  {
    id: 'nvs-buildcon-price-list',
    title: 'NVS Buildcon Services & Price List',
    category: 'House Plans',
    pdfUrl: '/pdfs/NVS BUILDCON  Architectural & Design Services Price List.pdf',
    imageUrl: '/images/WhatsApp Image 2026-06-29 at 13.04.46.jpeg',
    description: 'Detailed service pricing matrix for 2D planning, 3D elevation, structural design, MEP drawings, and complete turnkey packages.',
    specs: {
      foundation: 'Design packages starting from Rs. 3/sq.ft',
      superstructure: 'Turnkey architectural layouts Rs. 15/sq.ft onwards',
      flooring: 'Complete MEP packages Rs. 3/sq.ft'
    }
  }
];

export const TESTIMONIALS_DATA = [
  {
    id: 'test-1',
    name: 'Vikram Singh',
    role: 'Commercial Client, Delhi NCR',
    rating: 5,
    review: 'The team prepared clear drawings and guided us through the planning process. Communication was professional from start to finish.'
  },
  {
    id: 'test-2',
    name: 'Divyaraj Singh',
    role: 'Homeowner, Varanasi',
    rating: 5,
    review: 'Our house plan and elevation were handled carefully. They explained options clearly and kept the design practical for construction.'
  },
  {
    id: 'test-3',
    name: 'Ananya Sharma',
    role: 'Residential Client, Lucknow',
    rating: 5,
    review: 'The 3D elevation helped us understand the final look before starting work. The team was responsive and easy to coordinate with.'
  },
  {
    id: 'test-4',
    name: 'Rajesh Malhotra',
    role: 'Retail Project Owner, Noida',
    rating: 5,
    review: 'They provided drawings, BOQ guidance, and site-related suggestions that helped us plan the project budget with more confidence.'
  }
];

export const FAQ_DATA = [
  {
    question: 'What is the typical timeline for a turnkey construction project?',
    answer: 'A standard turnkey residential villa typically takes between 10 to 14 months from site preparation to final handover. This timeline includes architectural planning, 3D elevation, structural drafting, and finishing work.'
  },
  {
    question: 'Do you offer Vastu-compliant architectural planning?',
    answer: 'Yes. We prepare our floor plans, window placement, staircase layouts, and room zoning in alignment with Vastu Shastra principles according to your requirements.'
  },
  {
    question: 'How do you ensure structural safety and stability?',
    answer: 'We design all projects in accordance with standard civil engineering principles. Our structural engineers prepare detailed drawings for foundations, columns, and beams to ensure safety and stability.'
  },
  {
    question: 'Can I customize the interior finishes and materials?',
    answer: 'Yes. We assist clients in choosing finishes, flooring, lighting, and wardrobe layouts. We provide recommendations and options that fit your budget and taste.'
  },
  {
    question: 'What is your pricing model for design and drafting services?',
    answer: 'Our architectural planning and 2D layout services start at ₹3/sq.ft. Structural design, MEP drawings, and 3D elevations are priced competitively. Complete design packages are quoted based on the size and scope of your plot.'
  }
];
