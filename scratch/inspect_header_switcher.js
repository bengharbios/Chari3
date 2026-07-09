const fs = require('fs');
const content = fs.readFileSync('c:\\Users\\ALsalam - Marketing\\Desktop\\ChariDay\\src\\components\\layout\\Header.tsx', 'utf8');
const lines = content.split('\n');

lines.forEach((line, index) => {
  if (line.toLowerCase().includes('branch') || line.toLowerCase().includes('storeid') || line.toLowerCase().includes('switch') || line.toLowerCase().includes('stores')) {
    console.log(`Line ${index + 1}: ${line.trim()}`);
  }
});
