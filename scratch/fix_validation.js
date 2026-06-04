const fs = require('fs');

const path = 'C:\\Users\\ALsalam - Marketing\\Desktop\\ChariDay\\src\\components\\seller\\BillingPage.tsx';
let code = fs.readFileSync(path, 'utf8');

code = code.replace(
  `    if (paymentMethod === 'receipt' && !payReceiptFile && upgradeCalc?.invoiceAmount > 0) {`,
  `    const amountToPay = upgradeCalc ? upgradeCalc.invoiceAmount : totalBilled;\n    if (paymentMethod === 'receipt' && !payReceiptFile && amountToPay > 0) {`
);

fs.writeFileSync(path, code);
console.log('Fixed handleSubscribe validation');
