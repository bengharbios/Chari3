const fs = require('fs');

const code = fs.readFileSync('src/app/admin-secure-internal/settings/homepage/page.tsx', 'utf8');
const lines = code.split('\n');

let openDivs = 1; // Start with 1 for the <div className="space-y-4"> at 1175

for (let i = 1175; i < 2120; i++) {
  const line = lines[i];
  
  const divsMatch = line.match(/<div/g);
  if (divsMatch) openDivs += divsMatch.length;
  
  const closeDivsMatch = line.match(/<\/div>/g);
  if (closeDivsMatch) openDivs -= closeDivsMatch.length;
  
  if (openDivs < 0) {
    console.log("Too many </div> at line", i + 1, ":", line);
    break;
  }
}
