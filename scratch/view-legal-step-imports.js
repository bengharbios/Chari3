const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/components/seller/onboarding/LegalStep.tsx');
const content = fs.readFileSync(filePath, 'utf8');
const lines = content.split('\n');

console.log('=== LegalStep.tsx Lines 1 to 40 ===');
for (let i = 0; i < 40; i++) {
  console.log(`${i + 1}: ${lines[i]}`);
}
process.exit(0);
