const fs = require('fs');

const path = 'C:\\Users\\ALsalam - Marketing\\Desktop\\ChariDay\\src\\app\\api\\billing\\subscribe\\route.ts';
let code = fs.readFileSync(path, 'utf8');

code = code.replace(/referenceId: subscription.id/g, 'subscriptionId: subscription.id');

fs.writeFileSync(path, code);
console.log('Fixed referenceId in subscribe/route.ts');
