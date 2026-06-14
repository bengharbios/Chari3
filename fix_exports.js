const fs = require('fs');

let code = fs.readFileSync('src/components/storefront/SaadaBlocks.tsx', 'utf8');

const blocksToExport = [
  'FeaturesBlock',
  'CategoryCirclesRowBlock',
  'HeroSliderBlock',
  'BentoOffersBlock',
  'CategoryProductsRowBlock',
  'FeaturedProductsGridBlock',
  'TopSellersBlock',
  'TestimonialsBlock',
  'CtaBlock',
  'CustomBannerBlock'
];

blocksToExport.forEach(block => {
  // Replace `function BlockName(` with `export function BlockName(`
  // Make sure not to double-export if it's already exported
  code = code.replace(new RegExp(`export function ${block}`, 'g'), `function ${block}`); // Normalize first
  code = code.replace(new RegExp(`function ${block}\\(`, 'g'), `export function ${block}(`);
});

fs.writeFileSync('src/components/storefront/SaadaBlocks.tsx', code);
console.log('Fixed exports in SaadaBlocks');
