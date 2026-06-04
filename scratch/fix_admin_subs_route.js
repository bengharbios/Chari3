const fs = require('fs');

const path = 'C:\\Users\\ALsalam - Marketing\\Desktop\\ChariDay\\src\\app\\api\\admin\\subscriptions\\route.ts';
let code = fs.readFileSync(path, 'utf8');

// Revert the include: { receipts: true }
code = code.replace(
  `          invoices: {\n            orderBy: { createdAt: 'desc' },\n            take: 1,\n            include: { receipts: { orderBy: { createdAt: 'desc' }, take: 1 } }\n          },`,
  `          invoices: {\n            orderBy: { createdAt: 'desc' },\n            take: 1,\n          },`
);

// Fetch receipts manually and attach
code = code.replace(
  `    const [subscriptions, total] = await Promise.all([\n      prisma.subscription.findMany({`,
  `    const [rawSubscriptions, total] = await Promise.all([\n      prisma.subscription.findMany({`
);

code = code.replace(
  `      prisma.subscription.count({ where }),\n    ]);\n\n    return NextResponse.json({\n      success: true,\n      subscriptions,`,
  `      prisma.subscription.count({ where }),\n    ]);\n\n    // Attach receipts manually because no direct Prisma relation on Invoice model\n    const invoiceIds = rawSubscriptions.flatMap(s => s.invoices.map(i => i.id));\n    const receipts = await prisma.debtPaymentReceipt.findMany({\n      where: { invoiceId: { in: invoiceIds } }\n    });\n    \n    const subscriptions = rawSubscriptions.map(sub => {\n      const subInvoices = sub.invoices.map(inv => ({\n        ...inv,\n        receipts: receipts.filter(r => r.invoiceId === inv.id)\n      }));\n      return { ...sub, invoices: subInvoices };\n    });\n\n    return NextResponse.json({\n      success: true,\n      subscriptions,`
);

fs.writeFileSync(path, code);
console.log('Fixed admin subscriptions route');
