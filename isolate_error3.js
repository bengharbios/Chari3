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

// Let's do a fast binary search over the lines 1000 to 2280
let start = 1000;
let end = 2280;

while (start <= end) {
  let mid = Math.floor((start + end) / 2);
  let modified = [...lines.slice(0, 1000), ...lines.slice(mid)];
  let err = parse(modified.join('\n'));
  
  if (err === true) {
    // Removing up to 'mid' FIXES it. Meaning the error is in [1000, mid)
    end = mid - 1;
  } else {
    // Error is STILL there. Meaning the error is AFTER mid
    start = mid + 1;
  }
}

console.log("The syntax error is caused by something right around line:", start);
