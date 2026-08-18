const fs = require('fs');
let lines = fs.readFileSync('src/app/admin-secure-internal/settings/homepage/page.tsx', 'utf8').split('\n');

// The block to move is at index 266-283
const block = lines.splice(265, 18); 
// We want to insert it AFTER line 361. Since we removed 18 lines, line 361 is now at index 361 - 18 = 343.
lines.splice(343, 0, ...block);

fs.writeFileSync('src/app/admin-secure-internal/settings/homepage/page.tsx', lines.join('\n'));
console.log("Moved state successfully!");
