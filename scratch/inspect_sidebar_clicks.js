const fs = require('fs');
const content = fs.readFileSync('c:\\Users\\ALsalam - Marketing\\Desktop\\ChariDay\\src\\components\\layout\\Sidebar.tsx', 'utf8');
const lines = content.split('\n');

lines.forEach((line, index) => {
  if (line.includes('BUSINESS_SELLER_ITEMS') || line.includes('seller-branches') || line.includes('seller-staff')) {
    console.log(`Line ${index + 1}: ${line.trim()}`);
  }
});
