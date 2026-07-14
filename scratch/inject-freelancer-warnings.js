const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/components/onboarding/OnboardingWizard.tsx');
let content = fs.readFileSync(filePath, 'utf16le');

// 1. Add warnings to renderFreelancerStep Case 0 (Freelance Document)
const freelanceWarning = `          <div className="space-y-5 animate-fade-in">\r\n            {(() => {\r\n              const item = verificationItems?.find(i => i.id === 'freelance_document');\r\n              if (item?.status !== 'rejected') return null;\r\n              return (\r\n                <div className="p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 rounded-xl text-xs text-red-600 dark:text-red-400 font-medium flex items-start gap-2">\r\n                  <AlertCircle className="size-4 shrink-0 mt-0.5 text-red-600" />\r\n                  <div>\r\n                    <span className="font-bold">{locale === 'ar' ? 'مرفوض: ' : 'Rejected: '}</span>\r\n                    {item.rejectionReason || (locale === 'ar' ? 'يرجى مراجعة وتعديل وثيقة العمل الحر / بطاقة فنان.' : 'Please review and edit the freelance document.')}\r\n                  </div>\r\n                </div>\r\n              );\r\n            })()}`;

const targetFreelancerCase0 = `  // -- FREELANCER / SELLER STEPS --\r\n  const renderFreelancerStep = () => {\r\n    switch (currentStep) {\r\n      case 0:\r\n        return (\r\n          <div className="space-y-5 animate-fade-in">`;
const replacementFreelancerCase0 = `  // -- FREELANCER / SELLER STEPS --\r\n  const renderFreelancerStep = () => {\r\n    switch (currentStep) {\r\n      case 0:\r\n        return (\r\n` + freelanceWarning;

if (!content.includes(targetFreelancerCase0)) {
  console.error("Could not find FreelancerCase0 target");
} else {
  content = content.replace(targetFreelancerCase0, replacementFreelancerCase0);
  console.log("Injected freelance warnings into Freelancer Step 0 successfully");
}

// 2. Add warnings to renderFreelancerStep Case 1 (National ID Front/Back)
const nationalIdWarning = `          <div className="space-y-5 animate-fade-in">\r\n            {(() => {\r\n              const item = verificationItems?.find(i => i.id === 'national_id');\r\n              if (item?.status !== 'rejected') return null;\r\n              return (\r\n                <div className="p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 rounded-xl text-xs text-red-600 dark:text-red-400 font-medium flex items-start gap-2">\r\n                  <AlertCircle className="size-4 shrink-0 mt-0.5 text-red-600" />\r\n                  <div>\r\n                    <span className="font-bold">{locale === 'ar' ? 'مرفوض: ' : 'Rejected: '}</span>\r\n                    {item.rejectionReason || (locale === 'ar' ? 'يرجى مراجعة وتعديل مستند الهوية الوطنية الخاص بك.' : 'Please review and edit your national ID document.')}\r\n                  </div>\r\n                </div>\r\n              );\r\n            })()}`;

const targetFreelancerCase1 = `      case 1:\r\n        return (\r\n          <div className="space-y-5 animate-fade-in">`;
// Wait, we replaced case 1 in StoreManager too. Let's make sure we match the one inside renderFreelancerStep!
// Let's check how they differ.
// In renderFreelancerStep, Case 1 has a bg-indigo-100 dark:bg-indigo-900/30 background.
const targetFreelancerCase1Specific = `      case 1:\r\n        return (\r\n          <div className="space-y-5 animate-fade-in">\r\n            <div className="flex items-center gap-3 mb-2">\r\n              <div className="h-10 w-10 rounded-xl bg-indigo-100`;

const replacementFreelancerCase1Specific = `      case 1:\r\n        return (\r\n` + nationalIdWarning + `\r\n            <div className="flex items-center gap-3 mb-2">\r\n              <div className="h-10 w-10 rounded-xl bg-indigo-100`;

if (!content.includes(targetFreelancerCase1Specific)) {
  console.error("Could not find FreelancerCase1 specific target");
} else {
  content = content.replace(targetFreelancerCase1Specific, replacementFreelancerCase1Specific);
  console.log("Injected nationalId warnings into Freelancer Step 1 successfully");
}

// 3. Add warnings to renderFreelancerStep Case 2 (Bank Account / IBAN)
const freelancerBankWarning = `          <div className="space-y-5 animate-fade-in">\r\n            {(() => {\r\n              const item = verificationItems?.find(i => i.id === 'bank_account');\r\n              if (item?.status !== 'rejected') return null;\r\n              return (\r\n                <div className="p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 rounded-xl text-xs text-red-600 dark:text-red-400 font-medium flex items-start gap-2">\r\n                  <AlertCircle className="size-4 shrink-0 mt-0.5 text-red-600" />\r\n                  <div>\r\n                    <span className="font-bold">{locale === 'ar' ? 'مرفوض: ' : 'Rejected: '}</span>\r\n                    {item.rejectionReason || (locale === 'ar' ? 'يرجى مراجعة وتعديل تفاصيل الحساب المالي (CCP/IBAN).' : 'Please review and edit your financial details.')}\r\n                  </div>\r\n                </div>\r\n              );\r\n            })()}`;

const targetFreelancerCase2Specific = `      case 2:\r\n        return (\r\n          <div className="space-y-5 animate-fade-in">\r\n            <div className="flex items-center gap-3 mb-2">\r\n              <div className="h-10 w-10 rounded-xl bg-green-100`;

const replacementFreelancerCase2Specific = `      case 2:\r\n        return (\r\n` + freelancerBankWarning + `\r\n            <div className="flex items-center gap-3 mb-2">\r\n              <div className="h-10 w-10 rounded-xl bg-green-100`;

if (!content.includes(targetFreelancerCase2Specific)) {
  console.error("Could not find FreelancerCase2 specific target");
} else {
  content = content.replace(targetFreelancerCase2Specific, replacementFreelancerCase2Specific);
  console.log("Injected bank warnings into Freelancer Step 2 successfully");
}

fs.writeFileSync(filePath, content, 'utf16le');
console.log("Done updating Freelancer Steps in OnboardingWizard");
process.exit(0);
