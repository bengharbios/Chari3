const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'app', 'admin-secure-internal', '_components', 'AdminSidebar.tsx');
let content = fs.readFileSync(filePath, 'utf8');

const targetStr = `    {\n      id: 'platform',`;
const securityItems = `    {
      id: 'security',
      title: t('security.section_title', 'Security & Access'),
      icon: ShieldAlert,
      items: [
        { label: t('security.auth_logs', 'Auth Logs'), path: 'security/auth-logs' },
        { label: t('security.ban_list', 'Ban List'), path: 'security/bans' },
      ]
    },
    {
      id: 'platform',`;
content = content.replace(targetStr, securityItems);

if (!content.includes('ShieldAlert')) {
  content = content.replace(`import {`, `import {\n  ShieldAlert,`);
}

fs.writeFileSync(filePath, content, 'utf8');
console.log('Sidebar fixed');
