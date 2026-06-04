const fs = require('fs');

const path = 'C:\\Users\\ALsalam - Marketing\\Desktop\\ChariDay\\src\\components\\seller\\BillingPage.tsx';
let code = fs.readFileSync(path, 'utf8');

// 1. Fix toast notification
code = code.replace(
  `toast.success(data.actionType === 'upgrade' \n          ? t(locale, 'تم ترقية الباقة بنجاح! 🎉', 'Package upgraded successfully! 🎉') \n          : t(locale, 'تم إرسال طلب الاشتراك بنجاح! 🎉', 'Subscription request submitted! 🎉'));`,
  `toast.success(data.actionType === 'upgrade' \n          ? t(locale, 'تم إرسال طلب الترقية للمراجعة بنجاح! 🎉', 'Upgrade request submitted for review! 🎉') \n          : t(locale, 'تم إرسال طلب الاشتراك بنجاح! 🎉', 'Subscription request submitted! 🎉'));`
);

// 2. Fix 'isCurrent' and button text for pending plans
code = code.replace(
  `const isCurrent = sub?.packageId === pkg.id;`,
  `const isCurrent = sub?.packageId === pkg.id && sub?.status === 'ACTIVE';\n    const isPendingPlan = sub?.packageId === pkg.id && sub?.status === 'PENDING_APPROVAL';`
);

code = code.replace(
  `{isSelected ? t(locale, 'تم الاختيار', 'Selected') : (isCurrent ? t(locale, 'باقتك الحالية', 'Current Plan') : t(locale, 'اختر هذه الباقة', 'Choose Plan'))}`,
  `{isSelected ? t(locale, 'تم الاختيار', 'Selected') : (isCurrent ? t(locale, 'باقتك الحالية', 'Current Plan') : (isPendingPlan ? t(locale, 'قيد المراجعة ⏳', 'Under Review ⏳') : t(locale, 'اختر هذه الباقة', 'Choose Plan')))}`
);

code = code.replace(
  `{sub?.packageId === selectedPackageId ? t(locale, 'تجديد الباقة', 'Renew Plan') : (sub ? t(locale, 'ترقية الباقة الآن', 'Upgrade Plan Now') : t(locale, 'اشترك الآن', 'Subscribe Now'))}`,
  `{isPendingPlan ? t(locale, 'بانتظار الموافقة', 'Pending Approval') : (isCurrent ? t(locale, 'تجديد الباقة', 'Renew Plan') : (sub ? t(locale, 'ترقية الباقة الآن', 'Upgrade Plan Now') : t(locale, 'اشترك الآن', 'Subscribe Now')))}`
);

fs.writeFileSync(path, code);
console.log('Fixed BillingPage UI logic');
