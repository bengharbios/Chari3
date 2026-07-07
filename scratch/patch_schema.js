const fs = require('fs');
const path = require('path');

const schemaPath = path.join(__dirname, '..', 'prisma', 'schema.prisma');
let content = fs.readFileSync(schemaPath, 'utf8');

// Target string with either CRLF or LF
const target = 'model StoreStaff {\n  id        String   @id @default(cuid())\n  role      String   @default("staff")\n  joinedAt  DateTime @default(now())';
const targetCRLF = 'model StoreStaff {\r\n  id        String   @id @default(cuid())\r\n  role      String   @default("staff")\r\n  joinedAt  DateTime @default(now())';

const replacement = 'model StoreStaff {\n  id        String   @id @default(cuid())\n  role      String   @default("staff")\n  status    String   @default("active") // active, pending, rejected\n  joinedAt  DateTime @default(now())';
const replacementCRLF = 'model StoreStaff {\r\n  id        String   @id @default(cuid())\r\n  role      String   @default("staff")\r\n  status    String   @default("active") // active, pending, rejected\r\n  joinedAt  DateTime @default(now())';

if (content.includes(targetCRLF)) {
  content = content.replace(targetCRLF, replacementCRLF);
  console.log('CRLF match found and replaced!');
} else if (content.includes(target)) {
  content = content.replace(target, replacement);
  console.log('LF match found and replaced!');
} else {
  console.log('Could not find the target string!');
}

fs.writeFileSync(schemaPath, content, 'utf8');
console.log('Schema patched successfully.');
