const fs = require('fs');

const pathSub = 'C:\\Users\\ALsalam - Marketing\\Desktop\\ChariDay\\src\\app\\api\\admin\\subscriptions\\route.ts';
let codeSub = fs.readFileSync(pathSub, 'utf8');

// Include receipts inside invoices
codeSub = codeSub.replace(
  `          invoices: {\n            orderBy: { createdAt: 'desc' },\n            take: 1,\n          },`,
  `          invoices: {\n            orderBy: { createdAt: 'desc' },\n            take: 1,\n            include: { receipts: { orderBy: { createdAt: 'desc' }, take: 1 } }\n          },`
);

fs.writeFileSync(pathSub, codeSub);

const pathSubId = 'C:\\Users\\ALsalam - Marketing\\Desktop\\ChariDay\\src\\app\\api\\admin\\subscriptions\\[id]\\route.ts';
let codeSubId = fs.readFileSync(pathSubId, 'utf8');

// Approve receipts and invoices when activating a subscription
codeSubId = codeSubId.replace(
  `    if (status === 'ACTIVE') {\n      // Expire other active subscriptions for this user`,
  `    if (status === 'ACTIVE') {\n      // Approve associated invoice and receipt\n      const invoices = await prisma.debtPaymentInvoice.findMany({ where: { referenceId: subscription.id } });\n      for (const inv of invoices) {\n        await prisma.debtPaymentInvoice.update({ where: { id: inv.id }, data: { status: 'PAID' } });\n        await prisma.debtPaymentReceipt.updateMany({ where: { invoiceId: inv.id }, data: { status: 'approved' } });\n      }\n      // Expire other active subscriptions for this user`
);

fs.writeFileSync(pathSubId, codeSubId);
console.log('Successfully refactored admin subscriptions APIs');
