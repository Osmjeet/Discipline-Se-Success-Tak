// scripts/generate-sitemap.js
const fs = require('fs');
const path = require('path');

const SITE_ROOT = 'https://discipline-se-success-tak.vercel.app';
const OUT_FILE = path.join(process.cwd(), 'sitemap.xml');
const IGNORE = new Set(['sitemap.xml', 'robots.txt', '.DS_Store']);

function walk(dir) {
  const results = [];
  const list = fs.readdirSync(dir);
  list.forEach((file) => {
    if (file.startsWith('.')) return;
    const full = path.join(dir, file);
    const stat = fs.statSync(full);
    if (stat && stat.isDirectory()) {
      results.push(...walk(full));
    } else {
      results.push(full);
    }
  });
  return results;
}

function toUrl(filePath) {
  const rel = path.relative(process.cwd(), filePath).replace(/\\/g, '/');
  if (IGNORE.has(path.basename(rel))) return null;
  if (!rel.endsWith('.html')) return null;
  if (rel === 'index.html') return SITE_ROOT + '/';
  return SITE_ROOT + '/' + rel;
}

function lastModFor(filePath) {
  const stat = fs.statSync(filePath);
  const mtime = stat.mtime;
  return mtime.toISOString().slice(0, 10);
}

function buildSitemap(entries) {
  const header = `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n\n`;
  const footer = `</urlset>\n`;
  const body = entries.map(e => {
    return `  <url>\n    <loc>${e.loc}</loc>\n    <lastmod>${e.lastmod}</lastmod>\n    <priority>${e.priority}</priority>\n  </url>\n`;
  }).join('\n');
  return header + body + '\n' + footer;
}

function determinePriority(url) {
  if (url === SITE_ROOT + '/') return '1.0';
  if (url.endsWith('blog.html') || url.includes('/blog')) return '0.9';
  if (url.includes('#')) return '0.6';
  return '0.7';
}

function main() {
  const allFiles = walk(process.cwd());
  const rows = [];
  allFiles.forEach(f => {
    const u = toUrl(f);
    if (!u) return;
    const lastmod = lastModFor(f);
    const priority = determinePriority(u);
    rows.push({ loc: u, lastmod, priority });
  });

  rows.sort((a,b) => {
    if (a.priority === b.priority) return a.loc.localeCompare(b.loc);
    return parseFloat(b.priority) - parseFloat(a.priority);
  });

  const homepageExists = rows.some(r => r.loc === SITE_ROOT + '/');
  if (!homepageExists) {
    rows.unshift({ loc: SITE_ROOT + '/', lastmod: new Date().toISOString().slice(0,10), priority: '1.0' });
  }

  const xml = buildSitemap(rows);
  fs.writeFileSync(OUT_FILE, xml, { encoding: 'utf8' });
  console.log('Wrote sitemap.xml with', rows.length, 'items.');
}

main();
