import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const distDir = path.join(rootDir, 'dist');
const templatePath = path.join(distDir, 'index.html');

const routes = [
  {
    path: '/',
    title: 'NVS Buildcon | Architectural Design & Turnkey Construction Lucknow & Delhi NCR',
    description:
      'NVS Buildcon provides Vastu-compliant architectural design, structural engineering, and turnkey construction across Lucknow and Delhi NCR.',
    html: `
      <h1>NVS Buildcon provides architecture and turnkey construction in Lucknow and Delhi NCR.</h1>
      <h2>What does NVS Buildcon do?</h2>
      <p>NVS Buildcon designs Vastu-compliant house plans, 3D elevations, structural drawings, interiors, and full turnkey construction projects.</p>
    `,
  },
  {
    path: '/projects',
    title: 'Completed Residential and Commercial Projects | NVS Buildcon',
    description:
      'NVS Buildcon project work includes residential villas, duplex homes, house elevations, interiors, and commercial spaces in North India.',
    html: `
      <h1>NVS Buildcon project examples include residential, interior, and commercial construction work.</h1>
      <h2>Where has NVS Buildcon delivered projects?</h2>
      <p>NVS Buildcon serves clients in Lucknow, Delhi NCR, Noida, Prayagraj, Kanpur, and nearby service areas.</p>
    `,
  },
  {
    path: '/house-plans',
    title: 'Vastu-Compliant 2D Floor Plans and House Layouts | NVS Buildcon',
    description:
      'NVS Buildcon prepares Vastu-compliant 2D floor plans, architectural layouts, electrical plans, and structural drawings.',
    html: `
      <h1>NVS Buildcon prepares Vastu-compliant 2D floor plans and detailed house drawings.</h1>
      <h2>What drawings are available?</h2>
      <p>The drawing services include architectural layouts, electrical plans, modular kitchen plans, and structural documentation.</p>
    `,
  },
  {
    path: '/gallery',
    title: 'Architectural Elevation and Interior Design Gallery | NVS Buildcon',
    description:
      'NVS Buildcon gallery shows house elevations, bedroom interiors, TV walls, kitchen concepts, and construction design visuals.',
    html: `
      <h1>NVS Buildcon gallery shows architectural elevations and interior design visuals.</h1>
      <h2>What can clients review in the gallery?</h2>
      <p>Clients can review exterior facade ideas, bedroom interiors, living room concepts, kitchen designs, and material palettes.</p>
    `,
  },
  {
    path: '/services',
    title: 'Architecture, Structural Engineering and Turnkey Construction Services | NVS Buildcon',
    description:
      'NVS Buildcon offers 2D floor plans, 3D elevations, structural engineering, MEP drawings, interiors, and turnkey construction.',
    html: `
      <h1>NVS Buildcon offers architecture, engineering, interiors, and turnkey construction services.</h1>
      <h2>Which services does NVS Buildcon provide?</h2>
      <p>Services include 2D planning, 3D elevation rendering, structural RCC design, MEP coordination, interior design, and construction execution.</p>
    `,
  },
  {
    path: '/process',
    title: 'Architecture and Turnkey Construction Process | NVS Buildcon',
    description:
      'NVS Buildcon follows a structured process from requirement discovery and Vastu planning to drawings, execution, and handover.',
    html: `
      <h1>NVS Buildcon follows a structured design and construction process.</h1>
      <h2>How does the process work?</h2>
      <p>The process covers consultation, Vastu planning, 3D visualization, structural design, MEP coordination, site execution, quality checks, and handover.</p>
    `,
  },
  {
    path: '/about',
    title: 'About NVS Buildcon | Architecture and Construction Company',
    description:
      'NVS Buildcon is an architecture and general contracting firm serving Lucknow and Delhi NCR with Vastu-aligned building services.',
    html: `
      <h1>NVS Buildcon is an architecture and construction company serving Lucknow and Delhi NCR.</h1>
      <h2>Who is NVS Buildcon?</h2>
      <p>NVS Buildcon is a design and construction firm focused on Vastu-aligned planning, structural precision, interiors, and turnkey delivery.</p>
    `,
  },
  {
    path: '/testimonials',
    title: 'Client Reviews and Construction Testimonials | NVS Buildcon',
    description:
      'NVS Buildcon testimonials describe client experiences with architectural drawings, 3D elevations, construction planning, and turnkey execution.',
    html: `
      <h1>NVS Buildcon clients review its architecture, planning, and turnkey construction services.</h1>
      <h2>What do clients mention?</h2>
      <p>Clients mention drawing clarity, budget planning support, responsive coordination, and practical construction guidance.</p>
    `,
  },
  {
    path: '/contact',
    title: 'Contact NVS Buildcon | Request Project Estimate and Consultation',
    description:
      'Contact NVS Buildcon to request an architecture consultation, construction estimate, house plan, or site visit in Lucknow and Delhi NCR.',
    html: `
      <h1>Contact NVS Buildcon for architecture and construction consultations.</h1>
      <h2>How can clients contact NVS Buildcon?</h2>
      <p>Clients can call +91 8009363259 or submit a project inquiry for house plans, interiors, construction estimates, and site visits.</p>
    `,
  },
];

const escapeAttribute = (value) => value.replace(/"/g, '&quot;');

const updateHead = (html, route) => {
  let next = html.replace(/<title>.*?<\/title>/s, `<title>${route.title}</title>`);
  next = next.replace(
    /<meta name="description" content=".*?" \/>/s,
    `<meta name="description" content="${escapeAttribute(route.description)}" />`
  );
  next = next.replace(
    /<link rel="canonical" href=".*?" \/>/s,
    `<link rel="canonical" href="https://nvsbuildcon.com${route.path === '/' ? '/' : route.path}" />`
  );
  return next;
};

const injectSnapshot = (html, route) => {
  const snapshot = `
    <section id="prerendered-content" aria-label="NVS Buildcon route summary">
      ${route.html}
    </section>
  `;
  return html.replace('<div id="root"></div>', `<div id="root">${snapshot}</div>`);
};

if (!fs.existsSync(templatePath)) {
  throw new Error(`Build output not found at ${templatePath}`);
}

const template = fs.readFileSync(templatePath, 'utf8');

for (const route of routes) {
  const html = injectSnapshot(updateHead(template, route), route);
  const outputDir = route.path === '/' ? distDir : path.join(distDir, route.path.slice(1));
  fs.mkdirSync(outputDir, { recursive: true });
  fs.writeFileSync(path.join(outputDir, 'index.html'), html);
}

console.info(`Prerendered ${routes.length} public routes.`);
