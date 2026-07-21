const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/components/onboarding/AdminReviewQueue.tsx');
const content = fs.readFileSync(filePath, 'utf8');
const lines = content.split('\n');

console.log('=== AdminReviewQueue.tsx Lines 1 to 250 ===');
for (let i = 0; i < 250; i++) {
  console.log(`${i + 1}: ${lines[i]}`);
}
process.exit(0);
