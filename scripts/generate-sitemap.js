// scripts/generate-sitemap.js
const fs = require('fs');
const path = require('path');

const SITE = 'https://discipline-se-success-tak.vercel.app'; // <-- change if needed

// Add all public pages/anchors you want in sitemap
const urls = [
  { loc: `${SITE}/`, priority: 1.0 },
  { loc: `${SITE}/index.html`, priority: 0.9 },
  { loc: `${SITE}/blog.html`, priority: 0.8 },
  { loc: `${SITE}/#sample`, priority: 0.8 },
  { loc: `${SITE}/#feedback`, priority: 0.7 },
  { loc: `${SITE}/#about`, priority: 0.7 },
  // You can add more URLs below
  { loc: 'https://www.amazon.in/dp/B0FPHVNRBK', priority: 0.6 }
];

function formatDateISO(d = new Date()) {
  return d.toISOString().split('T')[0];
}

const lastmod = formatDateISO(new Date());

let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

urls.forEach(u => {
  xml += `  <url>\n`;
  xml += `    <loc>${u.loc}</loc>\n`;
  xml += `    <lastmod>${lastmod}</lastmod>\n`;
  xml += `    <priority>${u.priority}</priority>\n`;
  xml += `  </url>\n`;
});

xml += `</urlset>\n`;

fs.writeFileSync(path.join(process.cwd(), 'sitemap.xml'), xml, 'utf8');
console.log('✅ sitemap.xml generated');
