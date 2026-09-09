const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  const notifications = await prisma.notification.findMany({
    where: { user: { email: 'basmatlmdz@gmail.com' } }
  });
  console.log('Total notifications for user:', notifications.length);
  if (notifications.length > 0) {
    console.log(notifications[0]);
  }
}

check().catch(console.error).finally(() => prisma.$disconnect());
