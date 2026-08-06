const fs = require('fs');

const code = fs.readFileSync('src/app/admin-secure-internal/settings/homepage/page.tsx', 'utf8');
const lines = code.split('\n');

let openDivs = 0;

for (let i = 1163; i <= 2205; i++) {
  const line = lines[i];
  
  // Exclude comments when counting
  if (line.includes('{/*') || line.trim().startsWith('//')) {
    // very simplistic, assume whole line is comment if it has {/*
    // wait, we only want to count <div and </div
  }
  
  const divsMatch = line.match(/<div/g);
  if (divsMatch) openDivs += divsMatch.length;
  
  const closeDivsMatch = line.match(/<\/div>/g);
  if (closeDivsMatch) openDivs -= closeDivsMatch.length;
  
  if (openDivs < 0) {
    console.log("Too many </div> at line", i + 1, ":", line);
    break;
  }
}

console.log("Total open divs at end:", openDivs);
