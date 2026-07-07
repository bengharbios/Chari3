const fs = require('fs');
let content = fs.readFileSync('prisma/schema.prisma', 'utf8');
content = content.replace('locale          String    @default("ar")', 'locale          String    @default("ar")\n  forcePasswordChange Boolean @default(false)');
fs.writeFileSync('prisma/schema.prisma', content);
console.log('Schema updated successfully');
