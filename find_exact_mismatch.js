const fs = require('fs');

const code = fs.readFileSync('src/app/admin-secure-internal/settings/homepage/page.tsx', 'utf8');
const lines = code.split('\n');

const stack = [];
let extraClose = null;

// The block starts at 1164. Let's trace it down.
// Wait, to be perfectly accurate, we should only count <div and </div when they are not in comments or strings.
// A simple regex approach works 99% of the time, but let's be careful.

for (let i = 1163; i < 2120; i++) {
  const line = lines[i];
  
  if (line.includes('{/*') || line.trim().startsWith('//')) {
    continue; // naive ignore
  }

  // Count matches
  let m1 = [...line.matchAll(/<div/g)];
  for (let m of m1) {
    stack.push(i + 1);
  }
  
  let m2 = [...line.matchAll(/<\/div>/g)];
  for (let m of m2) {
    if (stack.length > 0) {
      stack.pop();
    } else {
      extraClose = i + 1;
      console.log(`Extra </div> at line ${i + 1}: ${line}`);
      break;
    }
  }
  if (extraClose) break;
}

if (!extraClose) {
  console.log("Unclosed divs started at lines:", stack);
}
