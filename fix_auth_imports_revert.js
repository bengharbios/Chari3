const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.resolve(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
      results.push(file);
    }
  });
  return results;
}

const files = walk('src/app/api');
let count = 0;

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  if (content.includes("from '@/app/api/auth/[...nextauth]/route'")) {
    const newContent = content.replace(/from '@\/app\/api\/auth\/\[\.\.\.nextauth\]\/route'/g, "from '@/lib/auth'");
    fs.writeFileSync(file, newContent);
    console.log('Fixed ' + file);
    count++;
  }
});

console.log('Fixed ' + count + ' files.');
