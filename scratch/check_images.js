const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const cats = await prisma.category.findMany({take:5, select:{name:true, slug:true, image:true}});
  console.log(cats);
}
main().finally(()=>prisma.$disconnect());
