const { PrismaClient } = require('@prisma/client'); 
const prisma = new PrismaClient(); 
async function main() { 
  const users = await prisma.user.findMany({ where: { phone: '0556503201' }}); 
  const user = users[0]; 
  console.log('User:', user.id); 
  const stores = await prisma.store.findMany({ where: { managerId: user.id }}); 
  console.log('Stores:', stores.map(s=>s.id)); 
  const sellerProfiles = await prisma.sellerProfile.findMany({ where: { userId: user.id }}); 
  console.log('SellerProfiles:', sellerProfiles.map(s=>s.id)); 
  const products = await prisma.product.findMany({ where: { 
    OR: [ 
      { storeId: { in: stores.map(s=>s.id) } }, 
      { sellerId: { in: sellerProfiles.map(s=>s.id) } } 
    ] 
  }}); 
  console.log('Products:', products.map(p=>({id: p.id, name: p.name, storeId: p.storeId, sellerId: p.sellerId, createdAt: p.createdAt}))); 
} 
main().catch(console.error).finally(() => prisma.$disconnect());
