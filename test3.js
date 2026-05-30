const { PrismaClient } = require('@prisma/client'); 
const prisma = new PrismaClient(); 
async function main() { 
  const products = await prisma.product.findMany({ where: { storeId: { in: ['store1', 'store2'] } } }); 
  console.log(products.length); 
} 
main().catch(console.error).finally(() => prisma.$disconnect());
