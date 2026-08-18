const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const adminId = 'admin';

  // Update homepage_layout (specifically the hero side cards)
  const layoutSetting = await prisma.setting.findUnique({
    where: { key: 'homepage_layout' }
  });

  let layout = [];
  if (layoutSetting && layoutSetting.value) {
    layout = JSON.parse(layoutSetting.value);
  }

  // Find the hero section and update its metadata
  const heroIndex = layout.findIndex(s => s.type === 'hero');
  if (heroIndex !== -1) {
    layout[heroIndex].metadata = {
      ...layout[heroIndex].metadata,
      
      // Card 1: Text with Background
      card1Type: "text",
      card1TitleAr: "ايفون 15 برو ماكس",
      card1TitleEn: "iPhone 15 Pro Max",
      card1BadgeAr: "خصم حصري",
      card1BadgeEn: "Exclusive",
      card1CtaAr: "اشتري الآن",
      card1CtaEn: "Buy Now",
      card1Link: "/search?q=iphone",
      card1BgImageAr: "/api/files/7d2b11950e13f2b9440dede8f9b90ce9.jpg", // Use the user's uploaded image if possible, or fallback to the demo one
      card1BgImageEn: "/api/files/7d2b11950e13f2b9440dede8f9b90ce9.jpg",

      // Card 2: Text with Background
      card2Type: "text",
      card2TitleAr: "عطر شانيل بلو",
      card2TitleEn: "Chanel Bleu Perfume",
      card2BadgeAr: "الأكثر مبيعاً",
      card2BadgeEn: "Best Seller",
      card2CtaAr: "تسوق العطور",
      card2CtaEn: "Shop Fragrances",
      card2Link: "/search?q=chanel",
      card2BgImageAr: "https://images.unsplash.com/photo-1594035910387-fea47794261f?q=80&w=600&auto=format&fit=crop",
      card2BgImageEn: "https://images.unsplash.com/photo-1594035910387-fea47794261f?q=80&w=600&auto=format&fit=crop",
    };
  }

  await prisma.setting.upsert({
    where: { key: 'homepage_layout' },
    update: { value: JSON.stringify(layout) },
    create: { key: 'homepage_layout', value: JSON.stringify(layout), type: 'string', group: 'homepage' }
  });

  console.log("Seeded homepage_layout with real info!");
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
