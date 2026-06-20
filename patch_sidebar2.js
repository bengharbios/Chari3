const fs = require('fs');
const path = require('path');

const sidebarPath = path.join(__dirname, 'src', 'app', 'admin-secure-internal', '_components', 'AdminSidebar.tsx');
let sidebar = fs.readFileSync(sidebarPath, 'utf8');

const otpLine = `        { label: locale === 'ar' ? 'إعدادات التوثيق والدخول' : 'Auth & OTP', path: 'settings/otp' },`;

if (sidebar.includes(otpLine)) {
  sidebar = sidebar.replace(otpLine + '\n', '');
  
  const banListLine = `{ label: t('security.ban_list', 'Ban List'), path: 'security/bans' },`;
  sidebar = sidebar.replace(banListLine, `${banListLine}\n        { label: locale === 'ar' ? 'إعدادات التوثيق والدخول' : 'Auth & OTP', path: 'settings/otp' },`);
}

fs.writeFileSync(sidebarPath, sidebar, 'utf8');
console.log('Sidebar OTP moved');
