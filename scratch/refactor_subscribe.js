const fs = require('fs');

const path = 'C:\\Users\\ALsalam - Marketing\\Desktop\\ChariDay\\src\\app\\api\\billing\\subscribe\\route.ts';
let code = fs.readFileSync(path, 'utf8');

// 1. Modify request destructuring
code = code.replace(
  `const { userId, packageId, billingCycle, addons, paymentMethod } = body as {`,
  `const { userId, packageId, billingCycle, addons, paymentMethod, receiptImage } = body as {`
);

code = code.replace(
  `      paymentMethod?: 'receipt' | 'wallet' | 'free';\n      addons: {`,
  `      paymentMethod?: 'receipt' | 'wallet' | 'free';\n      receiptImage?: string;\n      addons: {`
);

// 2. Locate the place where Subscription is created (around line 179)
// It creates Subscription, then DebtPaymentInvoice. If paymentMethod === 'wallet', it processes wallet.
// We need to inject receipt creation inside the transaction.
// Wait, is it a transaction?
// Let's check how it creates it.
code = code.replace(
  `    const subscription = await db.subscription.create({\n      data: {\n        userId,\n        packageId,\n        status: 'PENDING_APPROVAL',\n        startDate: now,\n        endDate,\n        trialEndsAt: null,\n        cancelReason: null,\n        totalMonthly: discountedMonthly,\n        addons: addonsObj,\n        billingCycle,\n        paymentMethod: paymentMethod || 'receipt',\n      }\n    });\n\n    // ─── 9. Create an invoice ─────────────────────────────────────────────`,
  `    const subscription = await db.subscription.create({\n      data: {\n        userId,\n        packageId,\n        status: 'PENDING_APPROVAL',\n        startDate: now,\n        endDate,\n        trialEndsAt: null,\n        cancelReason: null,\n        totalMonthly: discountedMonthly,\n        addons: addonsObj,\n        billingCycle,\n        paymentMethod: paymentMethod || 'receipt',\n      }\n    });\n\n    // ─── 9. Create an invoice ─────────────────────────────────────────────`
);

code = code.replace(
  `    const invoice = await db.debtPaymentInvoice.create({\n      data: {\n        userId,\n        amount: invoiceAmount,\n        currency: 'DZD',\n        status: isFree ? 'PAID' : 'PENDING',\n        periodStart: now,\n        periodEnd: endDate,\n        dueDate: new Date(now.getTime() + 7 * 86400000), // Due in 7 days\n      }\n    });`,
  `    const invoice = await db.debtPaymentInvoice.create({\n      data: {\n        userId,\n        amount: invoiceAmount,\n        currency: 'DZD',\n        status: isFree ? 'PAID' : 'PENDING',\n        periodStart: now,\n        periodEnd: endDate,\n        dueDate: new Date(now.getTime() + 7 * 86400000), // Due in 7 days\n        referenceId: subscription.id, // link invoice to sub\n      }\n    });\n\n    // ─── 9.5 Create receipt if provided ───────────────────────────────────\n    if (paymentMethod === 'receipt' && receiptImage && invoiceAmount > 0) {\n      await db.debtPaymentReceipt.create({\n        data: {\n          userId,\n          amount: invoiceAmount,\n          currency: 'DZD',\n          receiptImage,\n          merchantNote: 'مرفق مع طلب الاشتراك',\n          status: 'pending',\n          invoiceId: invoice.id,\n        }\n      });\n    }`
);

fs.writeFileSync(path, code);
console.log('Successfully refactored subscribe/route.ts');
