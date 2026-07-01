const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.findFirst({
    where: { email: 'nana2026naaa@gmail.com' }
  });
  console.log(user);
}

main().catch(e => console.error(e)).finally(() => prisma.$disconnect());
