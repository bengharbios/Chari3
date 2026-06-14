const fs = require('fs');

let code = fs.readFileSync('src/components/storefront/SaadaBlocks.tsx', 'utf8');

const interfaceCode = `export interface SectionProps {
  section: any;
  data: any;
  locale: string;
}

`;

// If it's missing, add it before 'const CURRENCY'
if (!code.includes('export interface SectionProps')) {
  code = code.replace('const CURRENCY', interfaceCode + 'const CURRENCY');
  fs.writeFileSync('src/components/storefront/SaadaBlocks.tsx', code);
  console.log('Added SectionProps back');
}
