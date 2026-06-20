const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'components', 'ui', 'table.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// Replace text-left with text-start
content = content.replace(`text-left align-middle`, `text-start align-middle`);

fs.writeFileSync(filePath, content, 'utf8');

console.log('table.tsx patched');
