const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const stores = await prisma.store.findMany();
  for (let i = 0; i < stores.length; i++) {
    // Generate a unique, professional icon logo for each store based on its name
    const seed = encodeURIComponent(stores[i].name || 'Store');
    // Using dicebear 'icons' style which generates a nice centered icon with a colored background
    // We add some parameters to make it look like a real app/store logo
    const logo = `https://api.dicebear.com/9.x/icons/svg?seed=${seed}&radius=20&backgroundColor=b6e3f4,c0aede,d1d4f9,ffdfbf,ffd5dc`;
    
    await prisma.store.update({
      where: { id: stores[i].id },
      data: { logo },
    });
    console.log(`Updated store ${stores[i].name} with logo`);
  }

  const sellers = await prisma.sellerProfile.findMany({
    include: { user: true }
  });
  for (let i = 0; i < sellers.length; i++) {
    const seed = encodeURIComponent(sellers[i].storeName || sellers[i].user?.name || 'Seller');
    // Using 'shapes' or 'initials' style for sellers
    const logo = `https://api.dicebear.com/9.x/shapes/svg?seed=${seed}&radius=20&backgroundColor=b6e3f4,c0aede,d1d4f9,ffdfbf,ffd5dc`;
    
    await prisma.sellerProfile.update({
      where: { id: sellers[i].id },
      data: { logo },
    });
    console.log(`Updated seller ${sellers[i].storeName} with logo`);
  }
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
