const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/components/onboarding/OnboardingWizard.tsx');
const content = fs.readFileSync(filePath, 'utf16le');

// Search for step components or input renders
const lines = content.split('\n');
console.log('Total lines:', lines.length);

console.log('=== Step Rendering Occurrences ===');
lines.forEach((line, idx) => {
  if (line.includes('commercialRegisterNumber') || line.includes('idFrontFile') || line.includes('freelanceDocumentFile') || line.includes('bankLetterFile')) {
    console.log(`Line ${idx + 1}: ${line.trim()}`);
  }
});
process.exit(0);
