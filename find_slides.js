const fs = require('fs');
const lines = fs.readFileSync('src/app/admin-secure-internal/settings/homepage/page.tsx', 'utf8').split('\n');

for (let i = 0; i < lines.length; i++) {
  if (lines[i].toLowerCase().includes("slide")) {
    console.log(`Line ${i+1}: ${lines[i].trim()}`);
  }
}
