const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/components/admin/UserManagementPage.tsx');
const content = fs.readFileSync(filePath, 'utf8');

const nonAsciiNonArabic = new Set();
for (let i = 0; i < content.length; i++) {
  const char = content[i];
  const code = char.charCodeAt(0);
  // If it's not ASCII (0-127) and not standard Arabic block (0x0600-0x06FF)
  if (code > 127 && (code < 0x0600 || code > 0x06FF)) {
    nonAsciiNonArabic.add(char);
  }
}

console.log('Unique non-ASCII non-Arabic characters in file:');
console.log(Array.from(nonAsciiNonArabic).join(' '));
console.log('Codes:', Array.from(nonAsciiNonArabic).map(c => `${c}:${c.charCodeAt(0).toString(16)}`).join(', '));
