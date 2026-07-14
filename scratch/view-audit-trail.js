const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/components/onboarding/AdminReviewQueue.tsx');
const content = fs.readFileSync(filePath, 'utf8');
const lines = content.includes('\0') ? fs.readFileSync(filePath, 'utf16le').split('\n') : content.split('\n');

const start = 890;
const end = 970;
console.log(`Printing lines ${start} to ${end}:`);
for (let i = start - 1; i < end; i++) {
  console.log(`${i + 1}: ${lines[i]}`);
}
process.exit(0);
