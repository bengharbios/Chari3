const fs = require('fs');
const content = fs.readFileSync('c:\\Users\\ALsalam - Marketing\\Desktop\\ChariDay\\src\\components\\dashboards\\SellerDashboard.tsx', 'utf8');
const lines = content.split('\n');

lines.forEach((line, index) => {
  if (line.includes('StoreDashboard')) {
    console.log(`Line ${index + 1}: ${line.trim()}`);
  }
});
