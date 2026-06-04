const fs = require('fs');

const adminPath = 'C:\\Users\\ALsalam - Marketing\\Desktop\\ChariDay\\src\\app\\admin-secure-internal\\billing\\merchants\\page.tsx';
let adminCode = fs.readFileSync(adminPath, 'utf8');

if(!adminCode.includes('FileText')) {
  adminCode = adminCode.replace(
    /import { ([^}]+) } from "lucide-react";/,
    'import { $1, FileText } from "lucide-react";'
  );
}

// Ensure zoomImage is defined
if(!adminCode.includes('setZoomImage(')) {
    // If somehow it wasn't added correctly
}

fs.writeFileSync(adminPath, adminCode);

const billingPath = 'C:\\Users\\ALsalam - Marketing\\Desktop\\ChariDay\\src\\components\\seller\\BillingPage.tsx';
let billingCode = fs.readFileSync(billingPath, 'utf8');

// I injected `isPendingPlan` in the old layout loop, but my `refactor_billing_layout.js` replaced the loop with the NEW layout!
// Let's add it before `const selectedPackage = packages.find(p => p.id === selectedPackageId);`
billingCode = billingCode.replace(
  `const selectedPackage = packages.find(p => p.id === selectedPackageId);`,
  `const selectedPackage = packages.find(p => p.id === selectedPackageId);\n  const isCurrent = sub?.packageId === selectedPackageId && sub?.status === 'ACTIVE';\n  const isPendingPlan = sub?.packageId === selectedPackageId && sub?.status === 'PENDING_APPROVAL';`
);

// We still have the package list loop around line 620
// Let's fix `isCurrent` and `isPendingPlan` there inside the loop!
billingCode = billingCode.replace(
  /const isCurrent = sub\?\.packageId === pkg\.id;/g,
  `const isCurrent = sub?.packageId === pkg.id && sub?.status === 'ACTIVE';\n                    const isPendingPlan = sub?.packageId === pkg.id && sub?.status === 'PENDING_APPROVAL';`
);

fs.writeFileSync(billingPath, billingCode);
console.log('Fixed TS errors');
