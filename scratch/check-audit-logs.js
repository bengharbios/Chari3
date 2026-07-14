const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const logs = await prisma.auditLog.findMany({
    where: { action: 'request_edit' },
    orderBy: { createdAt: 'desc' },
    take: 5
  });
  console.log('Audit Logs for request_edit:');
  logs.forEach(log => {
    console.log(`ID: ${log.id}`);
    console.log(`Action: ${log.action}`);
    console.log(`Details raw: ${log.details}`);
    try {
      const parsed = JSON.parse(log.details);
      console.log('Parsed successfully:', parsed);
    } catch (e) {
      console.log('Parse failed:', e.message);
    }
    console.log('---');
  });
  process.exit(0);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
