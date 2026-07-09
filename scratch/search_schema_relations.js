const fs = require('fs');
const schema = fs.readFileSync('c:\\Users\\ALsalam - Marketing\\Desktop\\ChariDay\\prisma\\schema.prisma', 'utf8');

const lines = schema.split('\n');
console.log('Searching for branch/parent/owner/relation:');
lines.forEach((line, index) => {
  if (line.toLowerCase().includes('branch') || line.toLowerCase().includes('parent') || line.toLowerCase().includes('owner') || line.toLowerCase().includes('store')) {
    if (line.trim().startsWith('model ') || line.includes('@relation') || line.includes('store') || line.includes('branch')) {
      console.log(`Line ${index + 1}: ${line.trim()}`);
    }
  }
});
