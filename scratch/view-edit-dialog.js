const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/components/onboarding/AdminReviewQueue.tsx');
const content = fs.readFileSync(filePath, 'utf8'); // Wait, let's make sure if this file is utf8 or utf16le
// Wait! Let's check the encoding. Let's try reading as utf8 first.
// If it has null bytes, we can try utf16le.
const lines = content.includes('\0') ? fs.readFileSync(filePath, 'utf16le').split('\n') : content.split('\n');

const start = 780;
const end = 900;
console.log(`Printing lines ${start} to ${end}:`);
for (let i = start - 1; i < end; i++) {
  console.log(`${i + 1}: ${lines[i]}`);
}
process.exit(0);
