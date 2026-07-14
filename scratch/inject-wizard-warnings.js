const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/components/onboarding/OnboardingWizard.tsx');
let content = fs.readFileSync(filePath, 'utf16le');

// 1. Add verificationItems to destructuring
const targetDestruct = `    currentStep,\r\n    accountStatus,\r\n    isSubmitted,`;
const replacementDestruct = `    currentStep,\r\n    accountStatus,\r\n    isSubmitted,\r\n    verificationItems,`;

if (!content.includes(targetDestruct)) {
  console.error("Could not find destructuring target");
} else {
  content = content.replace(targetDestruct, replacementDestruct);
  console.log("Injected verificationItems into destructuring successfully");
}

// 2. Add commRegister warnings to renderStoreManagerStep Case 0
const commRegisterWarning = `          <div className="space-y-5 animate-fade-in">\r\n            {(() => {\r\n              const item = verificationItems?.find(i => i.id === 'commercial_register');\r\n              if (item?.status !== 'rejected') return null;\r\n              return (\r\n                <div className="p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 rounded-xl text-xs text-red-600 dark:text-red-400 font-medium flex items-start gap-2">\r\n                  <AlertCircle className="size-4 shrink-0 mt-0.5 text-red-600" />\r\n                  <div>\r\n                    <span className="font-bold">{locale === 'ar' ? 'مرفوض: ' : 'Rejected: '}</span>\r\n                    {item.rejectionReason || (locale === 'ar' ? 'يرجى مراجعة وتعديل مستند السجل التجاري ورقم السجل.' : 'Please review and edit the commercial register document.')}\r\n                  </div>\r\n                </div>\r\n              );\r\n            })()}`;

const targetStoreManagerCase0 = `  const renderStoreManagerStep = () => {\r\n    switch (currentStep) {\r\n      case 0:\r\n        return (\r\n          <div className="space-y-5 animate-fade-in">`;
const replacementStoreManagerCase0 = `  const renderStoreManagerStep = () => {\r\n    switch (currentStep) {\r\n      case 0:\r\n        return (\r\n` + commRegisterWarning;

if (!content.includes(targetStoreManagerCase0)) {
  console.error("Could not find StoreManagerCase0 target");
} else {
  content = content.replace(targetStoreManagerCase0, replacementStoreManagerCase0);
  console.log("Injected commRegister warnings into StoreManager Step 0 successfully");
}

// 3. Add bankAccount warnings to renderStoreManagerStep Case 1
const bankAccountWarning = `          <div className="space-y-5 animate-fade-in">\r\n            {(() => {\r\n              const item = verificationItems?.find(i => i.id === 'bank_account');\r\n              if (item?.status !== 'rejected') return null;\r\n              return (\r\n                <div className="p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 rounded-xl text-xs text-red-600 dark:text-red-400 font-medium flex items-start gap-2">\r\n                  <AlertCircle className="size-4 shrink-0 mt-0.5 text-red-600" />\r\n                  <div>\r\n                    <span className="font-bold">{locale === 'ar' ? 'مرفوض: ' : 'Rejected: '}</span>\r\n                    {item.rejectionReason || (locale === 'ar' ? 'يرجى مراجعة وتعديل كشف الحساب البنكي / البريدي.' : 'Please review and edit the bank statement document.')}\r\n                  </div>\r\n                </div>\r\n              );\r\n            })()}`;

const targetStoreManagerCase1 = `      case 1:\r\n        return (\r\n          <div className="space-y-5 animate-fade-in">`;
const replacementStoreManagerCase1 = `      case 1:\r\n        return (\r\n` + bankAccountWarning;

if (!content.includes(targetStoreManagerCase1)) {
  console.error("Could not find StoreManagerCase1 target");
} else {
  content = content.replace(targetStoreManagerCase1, replacementStoreManagerCase1);
  console.log("Injected bankAccount warnings into StoreManager Step 1 successfully");
}

// 4. Add managerId warnings to renderStoreManagerStep Case 2
const managerIdWarning = `          <div className="space-y-5 animate-fade-in">\r\n            {(() => {\r\n              const item = verificationItems?.find(i => i.id === 'manager_id');\r\n              if (item?.status !== 'rejected') return null;\r\n              return (\r\n                <div className="p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 rounded-xl text-xs text-red-600 dark:text-red-400 font-medium flex items-start gap-2">\r\n                  <AlertCircle className="size-4 shrink-0 mt-0.5 text-red-600" />\r\n                  <div>\r\n                    <span className="font-bold">{locale === 'ar' ? 'مرفوض: ' : 'Rejected: '}</span>\r\n                    {item.rejectionReason || (locale === 'ar' ? 'يرجى مراجعة وتعديل وثيقة إثبات هوية المدير.' : 'Please review and edit the manager ID document.')}\r\n                  </div>\r\n                </div>\r\n              );\r\n            })()}`;

const targetStoreManagerCase2 = `      case 2:\r\n        return (\r\n          <div className="space-y-5 animate-fade-in">`;
const replacementStoreManagerCase2 = `      case 2:\r\n        return (\r\n` + managerIdWarning;

if (!content.includes(targetStoreManagerCase2)) {
  console.error("Could not find StoreManagerCase2 target");
} else {
  content = content.replace(targetStoreManagerCase2, replacementStoreManagerCase2);
  console.log("Injected managerId warnings into StoreManager Step 2 successfully");
}

// Write file back
fs.writeFileSync(filePath, content, 'utf16le');
console.log("Done updating StoreManager Steps in OnboardingWizard");
process.exit(0);
