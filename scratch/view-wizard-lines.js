const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/components/onboarding/OnboardingWizard.tsx');
const content = fs.readFileSync(filePath, 'utf16le');
const lines = content.split('\n');

const start = 890;
const end = 1065;
console.log(`Printing lines ${start} to ${end}:`);
for (let i = start - 1; i < end; i++) {
  console.log(`${i + 1}: ${lines[i]}`);
}
process.exit(0);
