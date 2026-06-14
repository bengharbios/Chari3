const fs = require('fs');
let code = fs.readFileSync('src/components/storefront/SaadaBlocks.tsx', 'utf8');
const regex = /t\('([^']+)',\s*'([^']+)'\)/g;
code = code.replace(regex, "(locale === 'ar' ? '$1' : '$2')");
fs.writeFileSync('src/components/storefront/SaadaBlocks.tsx', code);
console.log('Replaced invalid t() calls');
