const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  try {
    const data = await prisma.platformSettings.findUnique({where:{id:'global'}});
    console.log(JSON.stringify(JSON.parse(data.publicMenuConfig), null, 2));
  } finally {
    await prisma.$disconnect();
  }
}
check();
