const fs = require('fs');

// 1. Fix HomepagePage.tsx
let homeCode = fs.readFileSync('src/components/storefront/HomepagePage.tsx', 'utf8');
homeCode = homeCode.replace(
  /const \[heroIndex, setHeroIndex\] = useState\(0\);/,
  "};\n\n  const [heroIndex, setHeroIndex] = useState(0);"
);
fs.writeFileSync('src/components/storefront/HomepagePage.tsx', homeCode);
console.log('Fixed HomepagePage.tsx');

// 2. Fix SaadaBlocks.tsx duplicate imports and syntax error
let saadaCode = fs.readFileSync('src/components/storefront/SaadaBlocks.tsx', 'utf8');

const interfaceIndex = saadaCode.indexOf('export interface SectionProps');
const top = saadaCode.substring(0, interfaceIndex);
let body = saadaCode.substring(interfaceIndex);

// Strip all lines that look like imports
// This will match 'import {', '  ChevronLeft,', '} from ...'
// A better way is to use a regular expression that finds complete import statements.
body = body.replace(/import\s+(?:\{[\s\S]*?\}|.*?)\s+from\s+['"].*?['"];?\s*/g, '');

// There is one stray 'import "@measured/puck/puck.css";'
body = body.replace(/import\s+['"].*?['"];?\s*/g, '');

fs.writeFileSync('src/components/storefront/SaadaBlocks.tsx', top + body);
console.log('Fixed SaadaBlocks.tsx');
