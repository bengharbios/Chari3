const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/components/onboarding/AdminReviewQueue.tsx');
const content = fs.readFileSync(filePath, 'utf8');
const lines = content.split('\n');

console.log('=== Fetch Occurrences ===');
lines.forEach((line, idx) => {
  if (line.includes('fetch(') || line.includes('/api/')) {
    console.log(`Line ${idx + 1}: ${line.trim()}`);
  }
});
process.exit(0);
