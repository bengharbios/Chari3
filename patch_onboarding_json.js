const fs = require('fs');
const fileAr = 'src/lib/i18n/dictionaries/ar.json';
const dataAr = JSON.parse(fs.readFileSync(fileAr));
dataAr.onboarding = {
  title: 'تسجيل الأعمال',
  steps: {
    legal: 'التوثيق القانوني',
    tax: 'التفاصيل الضريبية',
    bank: 'التوثيق المالي',
    identity: 'توثيق الهوية',
    terms: 'الشروط والأحكام'
  },
  legal: {
    entityType: 'نوع النشاط',
    natural: 'شخص طبيعي (فرد)',
    legal: 'شخص معنوي (شركة)',
    crNumber: 'رقم السجل التجاري (10 أرقام)',
    companyName: 'اسم الشركة / المتجر',
    country: 'بلد تسجيل الأعمال',
    issueAuthority: 'جهة إصدار الرخصة',
    issueDate: 'تاريخ الإصدار',
    expiryDate: 'تاريخ الانتهاء',
    uploadDoc: 'قم بتحميل وثيقة تسجيل الأعمال الخاصة بك.'
  },
  tax: {
    hasVat: 'هل شركتك مسجلة لضريبة القيمة المضافة؟',
    yesVat: 'نعم، لدي تسجيل ضريبي',
    noVat: 'لا، ليس لدي تسجيل ضريبي',
    trn: 'رقم التسجيل الضريبي (NIF / TRN)',
    uploadDoc: 'قم بتحميل وثيقة التسجيل الضريبي.'
  },
  bank: {
    method: 'طريقة الدفع',
    bankAccount: 'حساب بنكي',
    beneficiaryName: 'اسم المستفيد',
    sameAsCompany: 'هذا هو نفس اسم شركتك',
    diffFromCompany: 'اسم المستفيد يختلف عن اسم الشركة',
    bankName: 'اسم البنك',
    iban: 'رقم الحساب (RIB / IBAN)',
    swift: 'رمز البنك (SWIFT)',
    uploadDoc: 'تحميل إثبات بنكي (شيك ملغى أو شهادة)'
  },
  identity: {
    signatoryName: 'الاسم الكامل',
    signatoryEmail: 'البريد الإلكتروني',
    isOwner: 'هل أنت المالك القانوني للشركة؟',
    yes: 'نعم',
    no: 'لا',
    poa: 'وثيقة التوكيل الرسمي',
    uploadId: 'هوية الممثل التجاري',
    idDesc: 'قم بتحميل وثيقة هوية صادرة عن جهة حكومية أو استخدم الكاميرا لالتقاط صورة.'
  },
  submit: 'تقديم للموافقة',
  next: 'التالي',
  prev: 'السابق',
  saveDraft: 'حفظ المسودة والخروج'
};
fs.writeFileSync(fileAr, JSON.stringify(dataAr, null, 2));

const fileEn = 'src/lib/i18n/dictionaries/en.json';
const dataEn = JSON.parse(fs.readFileSync(fileEn));
dataEn.onboarding = {
  title: 'Business Registration',
  steps: {
    legal: 'Legal Docs',
    tax: 'Tax Details',
    bank: 'Financials',
    identity: 'Identity',
    terms: 'T&C'
  },
  legal: {
    entityType: 'Entity Type',
    natural: 'Natural Person',
    legal: 'Legal Entity',
    crNumber: 'CR Number (10 digits)',
    companyName: 'Company Name',
    country: 'Registration Country',
    issueAuthority: 'Issuing Authority',
    issueDate: 'Issue Date',
    expiryDate: 'Expiry Date',
    uploadDoc: 'Upload your business registration document.'
  },
  tax: {
    hasVat: 'Are you VAT registered?',
    yesVat: 'Yes',
    noVat: 'No',
    trn: 'Tax Registration Number (TRN)',
    uploadDoc: 'Upload VAT registration document.'
  },
  bank: {
    method: 'Payment Method',
    bankAccount: 'Bank Account',
    beneficiaryName: 'Beneficiary Name',
    sameAsCompany: 'Same as company name',
    diffFromCompany: 'Different from company name',
    bankName: 'Bank Name',
    iban: 'IBAN / RIB',
    swift: 'SWIFT Code',
    uploadDoc: 'Upload bank proof (voided check/certificate)'
  },
  identity: {
    signatoryName: 'Full Name',
    signatoryEmail: 'Email',
    isOwner: 'Are you the legal owner?',
    yes: 'Yes',
    no: 'No',
    poa: 'Power of Attorney Document',
    uploadId: 'Identity Verification',
    idDesc: 'Upload a government issued ID or use camera.'
  },
  submit: 'Submit for Approval',
  next: 'Next',
  prev: 'Previous',
  saveDraft: 'Save Draft & Exit'
};
fs.writeFileSync(fileEn, JSON.stringify(dataEn, null, 2));
