const fs = require('fs');

const path = 'C:\\Users\\ALsalam - Marketing\\Desktop\\ChariDay\\src\\app\\api\\admin\\subscriptions\\[id]\\route.ts';
let code = fs.readFileSync(path, 'utf8');

code = code.replace(/referenceId: subscription.id/g, 'subscriptionId: subscription.id');

fs.writeFileSync(path, code);
console.log('Fixed referenceId in admin [id]/route.ts');
