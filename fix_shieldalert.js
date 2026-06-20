const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'app', 'admin-secure-internal', '_components', 'AdminSidebar.tsx');
let content = fs.readFileSync(filePath, 'utf8');

content = content.replace(
  `import { \n  LayoutDashboard,`,
  `import { \n  ShieldAlert, LayoutDashboard,`
);

// Fallback if formatting was different
if (!content.includes('ShieldAlert, LayoutDashboard')) {
  content = content.replace('LayoutDashboard, Settings,', 'ShieldAlert, LayoutDashboard, Settings,');
}

fs.writeFileSync(filePath, content, 'utf8');
console.log('ShieldAlert added to lucide-react');
