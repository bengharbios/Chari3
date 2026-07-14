const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/app/api/admin/review/route.ts');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Update Store Manager Block
const storeVerBlockStart = `      const storeVer = storeVerMap.get(user.id);\r\n      if (storeVer) {`;
const storeVerBlockInject = `      const storeVer = storeVerMap.get(user.id);\r\n      if (storeVer) {\r\n        let storeRejectedKeys = [];\r\n        try {\r\n          if (storeVer.rejectionReasons) {\r\n            storeRejectedKeys = JSON.parse(storeVer.rejectionReasons);\r\n          }\r\n        } catch (e) {}\r\n`;

content = content.replace(storeVerBlockStart, storeVerBlockInject);

// Replace status logic in storeVer block
content = content.replaceAll(
  `status: storeVer.verificationStatus === 'approved' ? 'verified' : (storeVer.verificationStatus === 'rejected' ? 'rejected' : 'pending'),`,
  (match, offset, string) => {
    // We want to be context sensitive or replace with item specific matches
    return match; // We will use precise string replacements below instead
  }
);

// Precise replacements for storeVer verification items
content = content.replace(
  `            id: 'commercial_register',\r\n            labelAr: 'مستند السجل التجاري المرفوع',\r\n            labelEn: 'Commercial Register File',\r\n            status: storeVer.verificationStatus === 'approved' ? 'verified' : (storeVer.verificationStatus === 'rejected' ? 'rejected' : 'pending'),`,
  `            id: 'commercial_register',\r\n            labelAr: 'مستند السجل التجاري المرفوع',\r\n            labelEn: 'Commercial Register File',\r\n            status: storeVer.verificationStatus === 'approved' ? 'verified' : (storeRejectedKeys.includes('commercial_register') ? 'rejected' : 'pending'),`
);

content = content.replace(
  `            id: 'commercial_register_number',\r\n            labelAr: 'رقم السجل التجاري (الرقم المدخل)',\r\n            labelEn: 'Commercial Register Number',\r\n            status: storeVer.verificationStatus === 'approved' ? 'verified' : (storeVer.verificationStatus === 'rejected' ? 'rejected' : 'pending'),`,
  `            id: 'commercial_register_number',\r\n            labelAr: 'رقم السجل التجاري (الرقم المدخل)',\r\n            labelEn: 'Commercial Register Number',\r\n            status: storeVer.verificationStatus === 'approved' ? 'verified' : (storeRejectedKeys.includes('commercial_register_number') ? 'rejected' : 'pending'),`
);

content = content.replace(
  `            id: 'expiry_date',\r\n            labelAr: 'تاريخ انتهاء الرخصة / السجل',\r\n            labelEn: 'License Expiry Date',\r\n            status: storeVer.verificationStatus === 'approved' ? 'verified' : (storeVer.verificationStatus === 'rejected' ? 'rejected' : 'pending'),`,
  `            id: 'expiry_date',\r\n            labelAr: 'تاريخ انتهاء الرخصة / السجل',\r\n            labelEn: 'License Expiry Date',\r\n            status: storeVer.verificationStatus === 'approved' ? 'verified' : (storeRejectedKeys.includes('expiry_date') ? 'rejected' : 'pending'),`
);

content = content.replace(
  `            id: 'bank_account',\r\n            labelAr: 'مستند إثبات الحساب البنكي المرفوع',\r\n            labelEn: 'Bank Letter File',\r\n            status: storeVer.verificationStatus === 'approved' ? 'verified' : (storeVer.verificationStatus === 'rejected' ? 'rejected' : 'pending'),`,
  `            id: 'bank_account',\r\n            labelAr: 'مستند إثبات الحساب البنكي المرفوع',\r\n            labelEn: 'Bank Letter File',\r\n            status: storeVer.verificationStatus === 'approved' ? 'verified' : (storeRejectedKeys.includes('bank_account') ? 'rejected' : 'pending'),`
);

content = content.replace(
  `            id: 'bank_details',\r\n            labelAr: 'تفاصيل الحساب المالي (CCP أو الآيبان البنكي)',\r\n            labelEn: 'CCP or IBAN financial details',\r\n            status: storeVer.verificationStatus === 'approved' ? 'verified' : (storeVer.verificationStatus === 'rejected' ? 'rejected' : 'pending'),`,
  `            id: 'bank_details',\r\n            labelAr: 'تفاصيل الحساب المالي (CCP أو الآيبان البنكي)',\r\n            labelEn: 'CCP or IBAN financial details',\r\n            status: storeVer.verificationStatus === 'approved' ? 'verified' : ((storeRejectedKeys.includes('bank_details') || storeRejectedKeys.includes('bank_account')) ? 'rejected' : 'pending'),`
);

content = content.replace(
  `            id: 'manager_id',\r\n            labelAr: 'مستند هوية المدير المرفوعة (الوجهين)',\r\n            labelEn: 'Manager ID Document',\r\n            status: storeVer.verificationStatus === 'approved' ? 'verified' : (storeVer.verificationStatus === 'rejected' ? 'rejected' : 'pending'),`,
  `            id: 'manager_id',\r\n            labelAr: 'مستند هوية المدير المرفوعة (الوجهين)',\r\n            labelEn: 'Manager ID Document',\r\n            status: storeVer.verificationStatus === 'approved' ? 'verified' : (storeRejectedKeys.includes('manager_id') ? 'rejected' : 'pending'),`
);

content = content.replace(
  `            id: 'signatory_info',\r\n            labelAr: 'بيانات المدير / المفوض بالتوقيع (الاسم والبريد)',\r\n            labelEn: 'Signatory Name and Email info',\r\n            status: storeVer.verificationStatus === 'approved' ? 'verified' : (storeVer.verificationStatus === 'rejected' ? 'rejected' : 'pending'),`,
  `            id: 'signatory_info',\r\n            labelAr: 'بيانات المدير / المفوض بالتوقيع (الاسم والبريد)',\r\n            labelEn: 'Signatory Name and Email info',\r\n            status: storeVer.verificationStatus === 'approved' ? 'verified' : (storeRejectedKeys.includes('signatory_info') ? 'rejected' : 'pending'),`
);

content = content.replace(
  `            id: 'power_of_attorney',\r\n            labelAr: 'مستند تفويض التوقيع (POA)',\r\n            labelEn: 'Power of Attorney file',\r\n            status: storeVer.verificationStatus === 'approved' ? 'verified' : (storeVer.verificationStatus === 'rejected' ? 'rejected' : 'pending'),`,
  `            id: 'power_of_attorney',\r\n            labelAr: 'مستند تفويض التوقيع (POA)',\r\n            labelEn: 'Power of Attorney file',\r\n            status: storeVer.verificationStatus === 'approved' ? 'verified' : (storeRejectedKeys.includes('power_of_attorney') ? 'rejected' : 'pending'),`
);

content = content.replace(
  `            id: 'vat_certificate',\r\n            labelAr: 'شهادة الضريبة الرقمية المرفوعة',\r\n            labelEn: 'VAT Certificate file',\r\n            status: storeVer.verificationStatus === 'approved' ? 'verified' : (storeVer.verificationStatus === 'rejected' ? 'rejected' : 'pending'),`,
  `            id: 'vat_certificate',\r\n            labelAr: 'شهادة الضريبة الرقمية المرفوعة',\r\n            labelEn: 'VAT Certificate file',\r\n            status: storeVer.verificationStatus === 'approved' ? 'verified' : (storeRejectedKeys.includes('vat_certificate') ? 'rejected' : 'pending'),`
);


// 2. Update Freelancer Block
const freeVerBlockStart = `      const freeVer = freeVerMap.get(user.id);\r\n      if (freeVer) {`;
const freeVerBlockInject = `      const freeVer = freeVerMap.get(user.id);\r\n      if (freeVer) {\r\n        let freeRejectedKeys = [];\r\n        try {\r\n          if (freeVer.rejectionReasons) {\r\n            freeRejectedKeys = JSON.parse(freeVer.rejectionReasons);\r\n          }\r\n        } catch (e) {}\r\n`;

content = content.replace(freeVerBlockStart, freeVerBlockInject);

content = content.replace(
  `            id: 'freelance_document',\r\n            labelAr: 'مستند وثيقة العمل الحر / حرفي المرفوع',\r\n            labelEn: 'Freelance Document file',\r\n            status: freeVer.verificationStatus === 'approved' ? 'verified' : (freeVer.verificationStatus === 'rejected' ? 'rejected' : 'pending'),`,
  `            id: 'freelance_document',\r\n            labelAr: 'مستند وثيقة العمل الحر / حرفي المرفوع',\r\n            labelEn: 'Freelance Document file',\r\n            status: freeVer.verificationStatus === 'approved' ? 'verified' : (freeRejectedKeys.includes('freelance_document') ? 'rejected' : 'pending'),`
);

content = content.replace(
  `            id: 'national_id',\r\n            labelAr: 'مستند بطاقة الهوية الوطنية المرفوع',\r\n            labelEn: 'National ID card files',\r\n            status: freeVer.verificationStatus === 'approved' ? 'verified' : (freeVer.verificationStatus === 'rejected' ? 'rejected' : 'pending'),`,
  `            id: 'national_id',\r\n            labelAr: 'مستند بطاقة الهوية الوطنية المرفوع',\r\n            labelEn: 'National ID card files',\r\n            status: freeVer.verificationStatus === 'approved' ? 'verified' : (freeRejectedKeys.includes('national_id') ? 'rejected' : 'pending'),`
);

content = content.replace(
  `            id: 'bank_account',\r\n            labelAr: 'تفاصيل الحساب المالي (الآيبان البنكي)',\r\n            labelEn: 'Bank Account (IBAN) info',\r\n            status: freeVer.verificationStatus === 'approved' ? 'verified' : (freeVer.verificationStatus === 'rejected' ? 'rejected' : 'pending'),`,
  `            id: 'bank_account',\r\n            labelAr: 'تفاصيل الحساب المالي (الآيبان البنكي)',\r\n            labelEn: 'Bank Account (IBAN) info',\r\n            status: freeVer.verificationStatus === 'approved' ? 'verified' : (freeRejectedKeys.includes('bank_account') ? 'rejected' : 'pending'),`
);


// 3. Update Supplier Block
const supplierVerBlockStart = `      const supplierVer = supplierVerMap.get(user.id);\r\n      if (supplierVer) {`;
const supplierVerBlockInject = `      const supplierVer = supplierVerMap.get(user.id);\r\n      if (supplierVer) {\r\n        let supplierRejectedKeys = [];\r\n        try {\r\n          if (supplierVer.rejectionReasons) {\r\n            supplierRejectedKeys = JSON.parse(supplierVer.rejectionReasons);\r\n          }\r\n        } catch (e) {}\r\n`;

content = content.replace(supplierVerBlockStart, supplierVerBlockInject);

content = content.replace(
  `            id: 'commercial_license',\r\n            labelAr: 'مستند رخصة النشاط التجاري المرفوع',\r\n            labelEn: 'Commercial License file',\r\n            status: supplierVer.verificationStatus === 'approved' ? 'verified' : (supplierVer.verificationStatus === 'rejected' ? 'rejected' : 'pending'),`,
  `            id: 'commercial_license',\r\n            labelAr: 'مستند رخصة النشاط التجاري المرفوع',\r\n            labelEn: 'Commercial License file',\r\n            status: supplierVer.verificationStatus === 'approved' ? 'verified' : (supplierRejectedKeys.includes('commercial_license') ? 'rejected' : 'pending'),`
);

content = content.replace(
  `            id: 'import_license',\r\n            labelAr: 'مستند رخصة الاستيراد المرفوع',\r\n            labelEn: 'Import License file',\r\n            status: supplierVer.verificationStatus === 'approved' ? 'verified' : (supplierVer.verificationStatus === 'rejected' ? 'rejected' : 'pending'),`,
  `            id: 'import_license',\r\n            labelAr: 'مستند رخصة الاستيراد المرفوع',\r\n            labelEn: 'Import License file',\r\n            status: supplierVer.verificationStatus === 'approved' ? 'verified' : (supplierRejectedKeys.includes('import_license') ? 'rejected' : 'pending'),`
);

content = content.replace(
  `            id: 'bank_account',\r\n            labelAr: 'تفاصيل الحساب المالي (الآيبان البنكي)',\r\n            labelEn: 'Bank Account (IBAN) info',\r\n            status: supplierVer.verificationStatus === 'approved' ? 'verified' : (supplierVer.verificationStatus === 'rejected' ? 'rejected' : 'pending'),`,
  `            id: 'bank_account',\r\n            labelAr: 'تفاصيل الحساب المالي (الآيبان البنكي)',\r\n            labelEn: 'Bank Account (IBAN) info',\r\n            status: supplierVer.verificationStatus === 'approved' ? 'verified' : (supplierRejectedKeys.includes('bank_account') ? 'rejected' : 'pending'),`
);


// 4. Update Logistics Block
const logVerBlockStart = `      const logVer = logisticsVerMap.get(user.id);\r\n      if (logVer) {`;
const logVerBlockInject = `      const logVer = logisticsVerMap.get(user.id);\r\n      if (logVer) {\r\n        let logRejectedKeys = [];\r\n        try {\r\n          if (logVer.rejectionReasons) {\r\n            logRejectedKeys = JSON.parse(logVer.rejectionReasons);\r\n          }\r\n        } catch (e) {}\r\n`;

content = content.replace(logVerBlockStart, logVerBlockInject);

content = content.replace(
  `            id: 'transport_license',\r\n            labelAr: 'مستند رخصة النقل المرفوع',\r\n            labelEn: 'Transport License file',\r\n            status: logVer.verificationStatus === 'approved' ? 'verified' : (logVer.verificationStatus === 'rejected' ? 'rejected' : 'pending'),`,
  `            id: 'transport_license',\r\n            labelAr: 'مستند رخصة النقل المرفوع',\r\n            labelEn: 'Transport License file',\r\n            status: logVer.verificationStatus === 'approved' ? 'verified' : (logRejectedKeys.includes('transport_license') ? 'rejected' : 'pending'),`
);

content = content.replace(
  `            id: 'insurance',\r\n            labelAr: 'شهادة التأمين المرفوعة',\r\n            labelEn: 'Insurance Certificate file',\r\n            status: logVer.verificationStatus === 'approved' ? 'verified' : (logVer.verificationStatus === 'rejected' ? 'rejected' : 'pending'),`,
  `            id: 'insurance',\r\n            labelAr: 'شهادة التأمين المرفوعة',\r\n            labelEn: 'Insurance Certificate file',\r\n            status: logVer.verificationStatus === 'approved' ? 'verified' : (logRejectedKeys.includes('insurance') ? 'rejected' : 'pending'),`
);

content = content.replace(
  `            id: 'bank_account',\r\n            labelAr: 'تفاصيل الحساب المالي (الآيبان البنكي)',\r\n            labelEn: 'Bank Account (IBAN) info',\r\n            status: logVer.verificationStatus === 'approved' ? 'verified' : (logVer.verificationStatus === 'rejected' ? 'rejected' : 'pending'),`,
  `            id: 'bank_account',\r\n            labelAr: 'تفاصيل الحساب المالي (الآيبان البنكي)',\r\n            labelEn: 'Bank Account (IBAN) info',\r\n            status: logVer.verificationStatus === 'approved' ? 'verified' : (logRejectedKeys.includes('bank_account') ? 'rejected' : 'pending'),`
);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Successfully updated API review status to map rejectionReasons correctly.');
process.exit(0);
