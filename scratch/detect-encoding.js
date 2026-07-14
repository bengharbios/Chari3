const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/components/onboarding/OnboardingWizard.tsx');

// Read as UTF-8
const contentUtf8 = fs.readFileSync(filePath, 'utf8');
const linesUtf8 = contentUtf8.split('\n');

console.log('=== UTF-8 Read ===');
for (let i = 890; i < 915; i++) {
  console.log(`${i + 1}: ${linesUtf8[i]}`);
}

process.exit(0);
