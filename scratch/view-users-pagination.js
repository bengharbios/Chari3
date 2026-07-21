const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/components/admin/UserManagementPage.tsx');
const content = fs.readFileSync(filePath, 'utf8');
const lines = content.split('\n');

const start = 1120;
const end = 1230;
console.log(`Printing lines ${start} to ${end}:`);
for (let i = start - 1; i < end; i++) {
  console.log(`${i + 1}: ${lines[i]}`);
}
process.exit(0);
