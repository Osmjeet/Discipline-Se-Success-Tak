// scripts/generate-robots.js
const fs = require('fs');
const path = require('path');

const SITE = 'https://discipline-se-success-tak.vercel.app'; // <-- change if needed

const txt = `User-agent: *
Allow: /

Sitemap: ${SITE}/sitemap.xml
`;

fs.writeFileSync(path.join(process.cwd(), 'robots.txt'), txt, 'utf8');
console.log('✅ robots.txt generated');
