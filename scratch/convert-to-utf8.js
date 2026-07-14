const fs = require('fs');
const path = require('path');

const target = path.join(__dirname, '../src/components/onboarding/OnboardingWizard.tsx');
console.log('Reading file:', target);

const content = fs.readFileSync(target, 'utf16le');
fs.writeFileSync(target, content, 'utf8');

console.log('Converted OnboardingWizard.tsx to UTF-8 successfully');
process.exit(0);
