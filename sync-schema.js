const fs = require('fs');
const path = require('path');

// Copy schema.prisma -> schema.mysql.prisma
const src = path.join(__dirname, 'prisma', 'schema.prisma');
const dst = path.join(__dirname, 'prisma', 'schema.mysql.prisma');
fs.copyFileSync(src, dst);
console.log('✅ Copied schema.prisma → schema.mysql.prisma');
