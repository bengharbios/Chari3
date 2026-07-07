const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    if (isDirectory) {
      walkDir(dirPath, callback);
    } else {
      callback(dirPath);
    }
  });
}

const targetDirs = [
  path.join(__dirname, '..', 'src', 'components', 'ui'),
  path.join(__dirname, '..', 'src', 'hooks')
];

targetDirs.forEach(dir => {
  if (!fs.existsSync(dir)) return;
  walkDir(dir, (filePath) => {
    if (!filePath.endsWith('.ts') && !filePath.endsWith('.tsx')) return;
    
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Check if both exist
    const hasSimpleImport = /import\s+React\s+from\s+['"]react['"];?/g.test(content);
    const hasOtherImport = /import\s+\*\s+as\s+React/g.test(content) || /import\s+React\s*,\s*{/g.test(content);
    
    if (hasSimpleImport && hasOtherImport) {
      console.log(`Fixing duplicate React import in: ${filePath}`);
      // Remove the simple import
      let lines = content.split('\n');
      let cleanedLines = lines.filter(line => {
        return !/^\s*import\s+React\s+from\s+['"]react['"];?\s*$/.test(line);
      });
      fs.writeFileSync(filePath, cleanedLines.join('\n'), 'utf8');
    }
  });
});

console.log('Duplicate React imports clean-up complete!');
