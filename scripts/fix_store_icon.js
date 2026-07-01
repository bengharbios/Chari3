const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = dir + '/' + file;
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) results = results.concat(walk(file));
    else if (file.endsWith('.tsx') || file.endsWith('.ts')) results.push(file);
  });
  return results;
}

const filesToFix = [];

walk('src').forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let originalContent = content;
  
  // Replace `import { ..., Store, ... } from 'lucide-react'` with `Store as StoreIcon`
  const importRegex = /import\s+({[^}]*)\bStore\b([^}]*})\s+from\s+['"]lucide-react['"]/g;
  if (importRegex.test(content)) {
    content = content.replace(importRegex, (match, p1, p2) => {
      // Avoid replacing if it's already "Store as StoreIcon"
      if (match.includes('Store as StoreIcon')) return match;
      
      // Just replace the word Store with Store as StoreIcon
      return `import ${p1}Store as StoreIcon${p2} from 'lucide-react'`;
    });
    
    // Replace <Store with <StoreIcon
    content = content.replace(/<Store\b/g, '<StoreIcon');
    // Replace icon: Store with icon: StoreIcon
    content = content.replace(/icon:\s*Store\b/g, 'icon: StoreIcon');
    // Replace array/object values that just use Store
    content = content.replace(/\bStore\b/g, (match, offset, string) => {
      // Check if it's part of <Store, icon: Store, or import ... which we already handled
      // Also check if it's a type like `Store | null`, we should NOT replace type usages if they refer to the local interface,
      // Wait, we can't do a global replace of `Store` to `StoreIcon` easily because `Store` might be an interface or type!
      // Actually, if we just replace the JSX tags `<Store` and known icon maps like `icon: Store`, and `[Store, ...]` in lucide-react imports.
      return match; // return match to not do global replace
    });

    // Specifically for Sidebar.tsx and similar: 
    // iconMap: { ..., Store, ... } -> iconMap: { ..., Store: StoreIcon, ... }
    content = content.replace(/({[\s\S]*?)\bStore\b([\s\S]*?})/g, (match, p1, p2) => {
      // Only do this if we are inside iconMap or similar object literal
      if (match.includes('iconMap')) {
         return match.replace(/\bStore\b/, 'Store: StoreIcon');
      }
      return match;
    });

    if (content !== originalContent) {
      filesToFix.push(file);
      fs.writeFileSync(file, content, 'utf8');
      console.log('Fixed:', file);
    }
  }
});
