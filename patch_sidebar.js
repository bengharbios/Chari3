const fs = require('fs');
const path = require('path');

// 1. Fix emojis in JSON
const arPath = path.join(__dirname, 'src', 'lib', 'i18n', 'dictionaries', 'ar.json');
const enPath = path.join(__dirname, 'src', 'lib', 'i18n', 'dictionaries', 'en.json');
const frPath = path.join(__dirname, 'src', 'lib', 'i18n', 'dictionaries', 'fr.json');

let ar = fs.readFileSync(arPath, 'utf8');
let en = fs.readFileSync(enPath, 'utf8');
let fr = fs.readFileSync(frPath, 'utf8');

ar = ar.replace(`"section_title": "🛡️ الأمان والدخول"`, `"section_title": "الأمان والدخول"`);
en = en.replace(`"section_title": "🛡️ Security & Access"`, `"section_title": "Security & Access"`);
fr = fr.replace(`"section_title": "Sécurité et Accès"`, `"section_title": "Sécurité et Accès"`); // already no emoji

fs.writeFileSync(arPath, ar, 'utf8');
fs.writeFileSync(enPath, en, 'utf8');
fs.writeFileSync(frPath, fr, 'utf8');

// 2. Fix AdminSidebar.tsx
const sidebarPath = path.join(__dirname, 'src', 'app', 'admin-secure-internal', '_components', 'AdminSidebar.tsx');
let sidebar = fs.readFileSync(sidebarPath, 'utf8');

// Extract the OTP row
const otpRow = `        { label: locale === 'ar' ? 'إعدادات التوثيق والدخول' : 'Auth & OTP', path: 'settings/otp' },\n`;

if (sidebar.includes(otpRow)) {
  sidebar = sidebar.replace(otpRow, '');
  
  // Insert it into security section
  const banListRow = `{ label: t('security.ban_list', 'Ban List'), path: 'security/bans' },`;
  sidebar = sidebar.replace(banListRow, `${banListRow}\n        { label: locale === 'ar' ? 'إعدادات التوثيق والدخول' : 'Auth & OTP', path: 'settings/otp' },`);
}

fs.writeFileSync(sidebarPath, sidebar, 'utf8');
console.log('Sidebar and JSONs patched');
