const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src', 'app', 'api');

function findFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      findFiles(filePath, fileList);
    } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
      fileList.push(filePath);
    }
  }
  return fileList;
}

const apiFiles = findFiles(srcDir);

let count = 0;
for (const file of apiFiles) {
  let content = fs.readFileSync(file, 'utf8');
  if (content.includes("from 'next-auth'") || content.includes("from 'next-auth/next'")) {
    console.log('Patching:', file);
    
    // Remove next-auth imports
    content = content.replace(/import\s+{\s*getServerSession\s*}\s+from\s+['"]next-auth['"];?\r?\n/g, '');
    content = content.replace(/import\s+{\s*getServerSession\s*}\s+from\s+['"]next-auth\/next['"];?\r?\n/g, '');
    content = content.replace(/import\s+{\s*authOptions\s*}\s+from\s+['"]@\/lib\/auth['"];?\r?\n/g, '');
    content = content.replace(/import\s+{\s*authOptions\s*}\s+from\s+['"]@\/app\/api\/auth\/\[\.\.\.nextauth\]\/route['"];?\r?\n/g, '');
    
    // Add better-auth import if not present
    if (!content.includes("from '@/lib/better-auth'")) {
      content = "import { auth } from '@/lib/better-auth';\nimport { headers } from 'next/headers';\n" + content;
    }
    
    // Replace session getter
    // Example: const session = await getServerSession(authOptions);
    content = content.replace(/const\s+session\s*=\s*await\s+getServerSession\([^)]*\);?/g, 'const session = await auth.api.getSession({ headers: await headers() });');
    
    // Sometimes they do: const session = await getServerSession()
    content = content.replace(/await\s+getServerSession\([^)]*\)/g, 'await auth.api.getSession({ headers: await headers() })');

    fs.writeFileSync(file, content);
    count++;
  }
}

console.log('Patched', count, 'files.');
