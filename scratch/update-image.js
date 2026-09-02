const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const products = await prisma.product.findMany({
    select: { id: true, name: true, images: true },
    where: { name: { contains: "غطاء حماية" } },
    take: 1
  });
  if (products.length === 0) return console.log("Product not found");
  const p = products[0];
  let imgs = [];
  try {
    imgs = JSON.parse(p.images);
    if (!Array.isArray(imgs)) imgs = [p.images];
  } catch(e) { imgs = [p.images] }
  
  const mainImage = imgs[0] || "https://images.unsplash.com/photo-1523275335684-37898b6baf30";
  const newImages = JSON.stringify([mainImage, "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500"]);
  await prisma.product.update({
    where: { id: p.id },
    data: { images: newImages }
  });
  console.log("Updated product: " + p.name);
}

main().finally(() => prisma.$disconnect());
