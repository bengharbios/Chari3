const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const u = await prisma.user.findFirst({where: {email: 'abdelkader.rapidline@gmail.com'}});
  console.log(u ? `Has password: ${!!u.password}` : 'User not found');
}
main().finally(() => prisma.$disconnect());
