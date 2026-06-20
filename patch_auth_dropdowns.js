const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'app', 'admin-secure-internal', 'security', 'auth-logs', 'page.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// Status options
content = content.replace(
  `<SelectItem value="pending">Pending</SelectItem>`,
  `<SelectItem value="pending">{t('security.statuses.pending', 'Pending')}</SelectItem>`
);
content = content.replace(
  `<SelectItem value="verified">Verified</SelectItem>`,
  `<SelectItem value="verified">{t('security.statuses.verified', 'Verified')}</SelectItem>`
);
content = content.replace(
  `<SelectItem value="registered">Registered</SelectItem>`,
  `<SelectItem value="registered">{t('security.statuses.registered', 'Registered')}</SelectItem>`
);
content = content.replace(
  `<SelectItem value="banned">Banned</SelectItem>`,
  `<SelectItem value="banned">{t('security.statuses.banned', 'Banned')}</SelectItem>`
);

// Method options
content = content.replace(
  `<SelectItem value="phone">SMS</SelectItem>`,
  `<SelectItem value="phone">{t('security.methods.sms', 'SMS')}</SelectItem>`
);
content = content.replace(
  `<SelectItem value="email">Email</SelectItem>`,
  `<SelectItem value="email">{t('security.methods.email', 'Email')}</SelectItem>`
);
content = content.replace(
  `<SelectItem value="whatsapp">WhatsApp</SelectItem>`,
  `<SelectItem value="whatsapp">{t('security.methods.whatsapp', 'WhatsApp')}</SelectItem>`
);
content = content.replace(
  `<SelectItem value="telegram">Telegram</SelectItem>`,
  `<SelectItem value="telegram">{t('security.methods.telegram', 'Telegram')}</SelectItem>`
);

fs.writeFileSync(filePath, content, 'utf8');

// Also update AR, EN, FR dicts with `security.methods` since they might not exist
const arPath = path.join(__dirname, 'src', 'lib', 'i18n', 'dictionaries', 'ar.json');
const enPath = path.join(__dirname, 'src', 'lib', 'i18n', 'dictionaries', 'en.json');
const frPath = path.join(__dirname, 'src', 'lib', 'i18n', 'dictionaries', 'fr.json');

let ar = JSON.parse(fs.readFileSync(arPath, 'utf8'));
let en = JSON.parse(fs.readFileSync(enPath, 'utf8'));
let fr = JSON.parse(fs.readFileSync(frPath, 'utf8'));

const addMethods = (dict, sms, email, whatsapp, telegram) => {
  if (!dict.security) dict.security = {};
  if (!dict.security.methods) dict.security.methods = {};
  dict.security.methods.sms = sms;
  dict.security.methods.email = email;
  dict.security.methods.whatsapp = whatsapp;
  dict.security.methods.telegram = telegram;
};

addMethods(ar, "رسالة نصية (SMS)", "بريد إلكتروني", "واتساب", "تلغرام");
addMethods(en, "SMS", "Email", "WhatsApp", "Telegram");
addMethods(fr, "SMS", "Email", "WhatsApp", "Telegram");

fs.writeFileSync(arPath, JSON.stringify(ar, null, 2), 'utf8');
fs.writeFileSync(enPath, JSON.stringify(en, null, 2), 'utf8');
fs.writeFileSync(frPath, JSON.stringify(fr, null, 2), 'utf8');

console.log('auth-logs options patched');
