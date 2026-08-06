const fs = require('fs');

const code = fs.readFileSync('src/app/admin-secure-internal/settings/homepage/page.tsx', 'utf8');
const lines = code.split('\n');

const stack = [];
for (let i = 2116; i < 2202; i++) {
  const line = lines[i];
  if (line.includes('{/*') || line.trim().startsWith('//')) continue;
  
  let m1 = [...line.matchAll(/<div/g)];
  for (let m of m1) {
    stack.push(i + 1);
    console.log(`Line ${i+1}: <div (stack = ${stack.length})`);
  }
  
  let m2 = [...line.matchAll(/<\/div>/g)];
  for (let m of m2) {
    if (stack.length > 0) {
      let openedAt = stack.pop();
      console.log(`Line ${i+1}: </div (closed div from ${openedAt}, stack = ${stack.length})`);
    } else {
      console.log(`Line ${i+1}: EXTRA </div!`);
    }
  }
}
console.log("Remaining stack:", stack);
