const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../prisma/schema.prisma');
const content = fs.readFileSync(filePath, 'utf8');
const lines = content.split('\n');

console.log('=== AuditLog Model Search ===');
let found = false;
let blockLines = [];
lines.forEach((line, idx) => {
  if (line.includes('model AuditLog')) {
    found = true;
  }
  if (found) {
    blockLines.push(`${idx + 1}: ${line}`);
    if (line.includes('}') && blockLines.length > 2) {
      found = false;
    }
  }
});
console.log(blockLines.join('\n'));
process.exit(0);
