const fs = require('fs');
const lines = fs.readFileSync('c:\\Users\\ALsalam - Marketing\\Desktop\\ChariDay\\src\\components\\dashboards\\SellerDashboard.tsx', 'utf8').split('\n');

for (let i = 305; i < 415; i++) {
  if (lines[i]) console.log(`${i + 1}: ${lines[i]}`);
}
