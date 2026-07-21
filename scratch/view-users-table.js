const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/components/admin/UserManagementPage.tsx');
const content = fs.readFileSync(filePath, 'utf8');
const lines = content.split('\n');

console.log('=== Table Search in UserManagementPage.tsx ===');
lines.forEach((line, idx) => {
  if (line.includes('<Table') || line.includes('totalPages') || line.includes('page - 1')) {
    console.log(`Line ${idx + 1}: ${line.trim()}`);
  }
});
process.exit(0);
