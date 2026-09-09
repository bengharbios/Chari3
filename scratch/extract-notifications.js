const fs = require('fs');
const path = require('path');

function findNotifications(dir, results = []) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      findNotifications(fullPath, results);
    } else if (fullPath.endsWith('.ts') || fullPath.endsWith('.tsx')) {
      const content = fs.readFileSync(fullPath, 'utf8');
      if (content.includes('db.notification.create')) {
        results.push(fullPath);
      }
    }
  }
  return results;
}

const files = findNotifications(path.join(process.cwd(), 'src', 'app', 'api'));
const extracted = [];

for (const file of files) {
  const content = fs.readFileSync(file, 'utf8');
  const blocks = content.split('db.notification.create');
  blocks.shift();
  for (const block of blocks) {
    const typeMatch = block.match(/type:\s*['"`](.*?)['"`]/);
    const titleMatch = block.match(/title:\s*(?:['"`](.*?)['"`]|(.*?)\,)/);
    const titleEnMatch = block.match(/titleEn:\s*(?:['"`](.*?)['"`]|(.*?)\,)/);
    
    if (typeMatch) {
      extracted.push({
        file: file.replace(process.cwd(), ''),
        type: typeMatch[1],
        title: titleMatch ? (titleMatch[1] || titleMatch[2]) : null,
        titleEn: titleEnMatch ? (titleEnMatch[1] || titleEnMatch[2]) : null
      });
    }
  }
}

console.log(JSON.stringify(extracted, null, 2));
