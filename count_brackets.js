const fs = require('fs');

const code = fs.readFileSync('src/app/admin-secure-internal/settings/homepage/page.tsx', 'utf8');
const lines = code.split('\n');

let openDivs = 0;
let openBraces = 0;
let openParens = 0;

for (let i = 1170; i < 2120; i++) {
  const line = lines[i];
  
  const divsMatch = line.match(/<div/g);
  if (divsMatch) openDivs += divsMatch.length;
  
  const closeDivsMatch = line.match(/<\/div>/g);
  if (closeDivsMatch) openDivs -= closeDivsMatch.length;
  
  const openBracesMatch = line.match(/\{/g);
  if (openBracesMatch) openBraces += openBracesMatch.length;
  
  const closeBracesMatch = line.match(/\}/g);
  if (closeBracesMatch) openBraces -= closeBracesMatch.length;
  
  const openParensMatch = line.match(/\(/g);
  if (openParensMatch) openParens += openParensMatch.length;
  
  const closeParensMatch = line.match(/\)/g);
  if (closeParensMatch) openParens -= closeParensMatch.length;
}

console.log({ openDivs, openBraces, openParens });
