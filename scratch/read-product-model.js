const fs = require('fs');
const schema = fs.readFileSync('prisma/schema.prisma', 'utf8');
const lines = schema.split('\n');
let inProduct = false;
for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  if (line.includes('model Product ')) {
    inProduct = true;
    console.log(`Line ${i+1}: ${line}`);
    continue;
  }
  if (inProduct) {
    console.log(`Line ${i+1}: ${line}`);
    if (line.trim() === '}') {
      inProduct = false;
    }
  }
}
