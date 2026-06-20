const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'app', 'admin-secure-internal', '_components', 'AdminSidebar.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// Remove ShieldAlert from the wrong import
content = content.replace(
  `import {\n  ShieldAlert, useAdminAuthStore } from '@/lib/store/admin-auth';`,
  `import { useAdminAuthStore } from '@/lib/store/admin-auth';`
);

// Add ShieldAlert to the correct import (lucide-react)
content = content.replace(
  `import { \n  LayoutDashboard,`,
  `import { \n  ShieldAlert, LayoutDashboard,`
);

// If the first replace didn't work (due to formatting), try a more generic replace
content = content.replace(/ShieldAlert,\s*useAdminAuthStore/g, 'useAdminAuthStore');

fs.writeFileSync(filePath, content, 'utf8');
console.log('Sidebar imports fixed');
