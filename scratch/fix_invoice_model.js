const fs = require('fs');

const path = 'C:\\Users\\ALsalam - Marketing\\Desktop\\ChariDay\\src\\app\\api\\admin\\subscriptions\\[id]\\route.ts';
let code = fs.readFileSync(path, 'utf8');

code = code.replace(/prisma\.debtPaymentInvoice/g, 'prisma.invoice');

fs.writeFileSync(path, code);
console.log('Fixed invoice model name in admin [id]/route.ts');
