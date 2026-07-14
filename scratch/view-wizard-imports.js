const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/components/seller/onboarding/OnboardingWizard.tsx');
const content = fs.readFileSync(filePath, 'utf8');
const lines = content.split('\n');

console.log('=== OnboardingWizard.tsx Lines 1 to 50 ===');
for (let i = 0; i < 50; i++) {
  console.log(`${i + 1}: ${lines[i]}`);
}
process.exit(0);
