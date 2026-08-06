const fs = require('fs');
const code = fs.readFileSync('src/app/admin-secure-internal/settings/homepage/page.tsx', 'utf8');
const lines = code.split('\n');

const stack = [];
for (let i = 1163; i <= 2114; i++) {
  const line = lines[i];
  if (line.includes('{/*') || line.trim().startsWith('//')) continue;
  
  let m1 = [...line.matchAll(/<div/g)];
  for (let m of m1) stack.push(i + 1);
  
  let m2 = [...line.matchAll(/<\/div>/g)];
  for (let m of m2) stack.pop();
}
console.log("Stack at 2115:", stack);
