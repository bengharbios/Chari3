const fs = require('fs');
const path = require('path');

function processDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDir(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      if (content.includes('React.') && !content.includes("import React")) {
        // Find the first line that is not a 'use client' directive
        let lines = content.split('\n');
        let insertIndex = 0;
        if (lines[0] && lines[0].includes('use client')) {
          insertIndex = 1;
        }
        lines.splice(insertIndex, 0, "import React from 'react';");
        fs.writeFileSync(fullPath, lines.join('\n'));
        console.log(`Fixed React import in ${fullPath}`);
      }
    }
  }
}

processDir(path.join(__dirname, 'src'));
console.log('Done.');
