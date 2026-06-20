const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'app', 'admin-secure-internal', 'settings', 'translations', 'page.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// Add to TABS
if (!content.includes(`id: 'security'`)) {
  content = content.replace(
    `{ id: 'notifications', labelAr: '🔔 الإشعارات والرسائل', labelEn: '🔔 Notifications' },`,
    `{ id: 'notifications', labelAr: '🔔 الإشعارات والرسائل', labelEn: '🔔 Notifications' },\n  { id: 'security', labelAr: '🛡️ الأمان والدخول', labelEn: '🛡️ Security & Access' },`
  );
}

// Add to getTabForKey
if (!content.includes(`if (prefix === 'security') return 'security';`)) {
  content = content.replace(
    `if (prefix === 'notifications') return 'notifications';`,
    `if (prefix === 'notifications') return 'notifications';\n  if (prefix === 'security') return 'security';`
  );
}

fs.writeFileSync(filePath, content, 'utf8');
console.log('Translations page patched.');
