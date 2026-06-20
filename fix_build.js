const fs = require('fs');
const path = require('path');

// 1. Fix admin auth logs page imports
const authLogsPagePath = path.join(__dirname, 'src', 'app', 'admin-secure-internal', 'security', 'auth-logs', 'page.tsx');
let authLogsPageContent = fs.readFileSync(authLogsPagePath, 'utf8');
authLogsPageContent = authLogsPageContent.replace(
  `import { useLanguage } from '@/lib/i18n/LanguageContext';\nimport { useDictionary } from '@/lib/i18n/useDictionary';`,
  `import { useTranslation } from '@/lib/i18n/useTranslation';`
);
authLogsPageContent = authLogsPageContent.replace(
  `const { locale } = useLanguage();\n  const t = useDictionary();`,
  `const { t, locale } = useTranslation();`
);
// replace t.security?.xyz with t('security.xyz')
authLogsPageContent = authLogsPageContent.replace(/t\.security\?\.auth_logs\s*\|\|\s*'Auth Logs'/g, `t('security.auth_logs', 'Auth Logs')`);
authLogsPageContent = authLogsPageContent.replace(/t\.security\?\.ban_list\s*\|\|\s*'Ban this entity\?'/g, `t('security.ban_list', 'Ban this entity?')`);
authLogsPageContent = authLogsPageContent.replace(/t\.security\?\.statuses\?\.([a-zA-Z]+)\s*\|\|\s*'([A-Za-z]+)'/g, `t('security.statuses.$1', '$2')`);
fs.writeFileSync(authLogsPagePath, authLogsPageContent, 'utf8');


// 2. Fix admin bans page imports
const bansPagePath = path.join(__dirname, 'src', 'app', 'admin-secure-internal', 'security', 'bans', 'page.tsx');
let bansPageContent = fs.readFileSync(bansPagePath, 'utf8');
bansPageContent = bansPageContent.replace(
  `import { useLanguage } from '@/lib/i18n/LanguageContext';\nimport { useDictionary } from '@/lib/i18n/useDictionary';`,
  `import { useTranslation } from '@/lib/i18n/useTranslation';`
);
bansPageContent = bansPageContent.replace(
  `const { locale } = useLanguage();\n  const t = useDictionary();`,
  `const { t, locale } = useTranslation();`
);
bansPageContent = bansPageContent.replace(/t\.security\?\.ban_list\s*\|\|\s*'Ban List'/g, `t('security.ban_list', 'Ban List')`);
fs.writeFileSync(bansPagePath, bansPageContent, 'utf8');


// 3. Fix API routes auth session
function fixApiRoute(routePath) {
  const p = path.join(__dirname, routePath);
  let content = fs.readFileSync(p, 'utf8');
  content = content.replace(
    `import { getAuthSession } from '@/lib/auth';`,
    `import { getServerSession } from 'next-auth';\nimport { authOptions } from '@/lib/auth';`
  );
  content = content.replace(/getAuthSession\(\)/g, `getServerSession(authOptions)`);
  content = content.replace(/session\.user\.role !== 'SUPER_ADMIN'/g, `session.user.role !== 'admin' && session.user.role !== 'SUPER_ADMIN'`);
  fs.writeFileSync(p, content, 'utf8');
}

fixApiRoute('src/app/api/admin/security/auth-logs/route.ts');
fixApiRoute('src/app/api/admin/security/bans/route.ts');
fixApiRoute('src/app/api/admin/security/bans/[id]/route.ts');

console.log('Build issues fixed!');
