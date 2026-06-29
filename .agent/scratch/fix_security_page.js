const fs = require('fs');
const file = 'src/components/security/SecurityCenterPage.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  /const isAr = locale === 'ar';/,
  "const isAr = locale === 'ar';\n  const tStr = (ar: string, en: string, fr: string = en) => { if (locale === 'ar') return ar; if (locale === 'fr') return fr; return en; };"
);

// Replace isAr ? '...' : '...' with tStr('...', '...')
content = content.replace(/isAr\s*\?\s*'([^']+)'\s*:\s*'([^']+)'/g, "tStr('$1', '$2')");
// Do the same for template literals if any
content = content.replace(/isAr\s*\?\s*`([^`]+)`\s*:\s*`([^`]+)`/g, "tStr(`$1`, `$2`)");

// Replace {isAr ? '...' : '...'} with {tStr('...', '...')}
// The regex above handles it because we replaced the inner part.

// Fix the location display if city/country is empty
content = content.replace(
  /\{session\.city\}, \{session\.countryCode\}/g,
  "{session.city && session.countryCode ? `${session.city}, ${session.countryCode}` : tStr('غير معروف', 'Unknown')}"
);

fs.writeFileSync(file, content);
console.log('Fixed SecurityCenterPage.tsx');
