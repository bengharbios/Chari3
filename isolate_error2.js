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

// Try isolating line by line
for (let i = 1000; i < lines.length - 100; i++) {
  // If removing lines 1000 to i fixes the error, the error is inside that block!
  const modified = [...lines.slice(0, 1000), ...lines.slice(i)];
  const err = parse(modified.join('\n'));
  if (err === true) {
    console.log("Removing up to line", i, "FIXES the error!");
    break;
  }
}
