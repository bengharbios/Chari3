const fs = require('fs');
const babel = require('@babel/parser');

try {
  const code = fs.readFileSync('src/app/admin-secure-internal/settings/homepage/page.tsx', 'utf8');
  babel.parse(code, {
    sourceType: 'module',
    plugins: ['jsx', 'typescript']
  });
  console.log("Parsed successfully!");
} catch (e) {
  console.error("Parse Error:", e.message);
  console.error("Line:", e.loc.line, "Column:", e.loc.column);
}
