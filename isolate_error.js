const fs = require('fs');
const babel = require('@babel/parser');

function parse(code) {
  try {
    babel.parse(code, {
      sourceType: 'module',
      plugins: ['jsx', 'typescript']
    });
    return true;
  } catch (e) {
    return e;
  }
}

const code = fs.readFileSync('src/app/admin-secure-internal/settings/homepage/page.tsx', 'utf8');
const lines = code.split('\n');

// Try removing hero block
const heroStart = 1484; // 0-indexed: 1483
const heroEnd = 1893;   // 0-indexed: 1892
let modified = [...lines.slice(0, heroStart - 1), ...lines.slice(heroEnd)];

let err = parse(modified.join('\n'));
if (err === true) {
  console.log("Error is IN the hero block!");
} else {
  console.log("Error is STILL THERE after removing hero block:", err.message);
  
  // Try removing bento block
  const bentoStart = 1895;
  const bentoEnd = 2284;
  modified = [...lines.slice(0, bentoStart - 1), ...lines.slice(bentoEnd)];
  
  err = parse(modified.join('\n'));
  if (err === true) {
    console.log("Error is IN the bento block!");
  } else {
    console.log("Error is STILL THERE after removing bento block:", err.message);
  }
}
