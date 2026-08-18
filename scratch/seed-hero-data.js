const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const adminId = 'admin';

  // 1. Update homepage_hero_slides
  const heroSlides = [
    {
      id: "slide-iphone-16",
      titleAr: "ايفون 16 برو ماكس",
      titleEn: "iPhone 16 Pro Max",
      titleFr: "iPhone 16 Pro Max",
      subtitleAr: "قوة تفوق الخيال بأسعار حصرية",
      subtitleEn: "Strength beyond imagination at exclusive prices",
      subtitleFr: "Une force au-delà de l'imagination",
      bg: "from-slate-900 via-indigo-950 to-black",
      badgeAr: "جديد وحصري",
      badgeEn: "New & Exclusive",
      badgeFr: "Nouveau et exclusif",
      ctaAr: "تسوق الآن",
      ctaEn: "Shop Now",
      ctaFr: "Acheter",
      linkUrl: "/search?q=iphone",
      imageUrl: "/demo/iphone_banner.png"
    },
    {
      id: "slide-fashion-spring",
      titleAr: "أزياء الربيع 2026",
      titleEn: "Spring Fashion 2026",
      titleFr: "Mode Printemps 2026",
      subtitleAr: "أناقة لا تضاهى بخصومات تصل إلى 50%",
      subtitleEn: "Unmatched elegance with up to 50% off",
      subtitleFr: "Élégance inégalée jusqu'à 50% de réduction",
      bg: "from-pink-900 via-rose-800 to-amber-900",
      badgeAr: "عروض الموسم",
      badgeEn: "Seasonal Offers",
      badgeFr: "Offres de saison",
      ctaAr: "اكتشف التشكيلة",
      ctaEn: "Discover Collection",
      ctaFr: "Découvrir la collection",
      linkUrl: "/search?category=fashion",
      imageUrl: "/demo/fashion_banner.png"
    }
  ];

  await prisma.setting.upsert({
    where: { key: 'homepage_hero_slides' },
    update: { value: JSON.stringify(heroSlides) },
    create: { key: 'homepage_hero_slides', value: JSON.stringify(heroSlides), type: 'string', group: 'homepage' }
  });

  console.log("Seeded homepage_hero_slides!");

  // 2. Update homepage_layout (specifically the hero side cards)
  const layoutSetting = await prisma.setting.findUnique({
    where: { key: 'homepage_layout' }
  });

  let layout = [];
  const defaultLayout = ['hero', 'features', 'categories', 'mega_offers_timer', 'featured_products', 'top_sellers', 'testimonials', 'cta'];
  
  if (layoutSetting && layoutSetting.value) {
    layout = JSON.parse(layoutSetting.value);
    // If it's still an array of strings, map it
    if (layout.length > 0 && typeof layout[0] === 'string') {
       layout = layout.map(sect => ({
         id: sect,
         type: sect,
         titleAr: sect,
         titleEn: sect,
         visible: true,
         metadata: {},
       }));
    }
  } else {
    layout = defaultLayout.map(sect => ({
       id: sect,
       type: sect,
       titleAr: sect,
       titleEn: sect,
       visible: true,
       metadata: {},
    }));
  }

  // Find the hero section and update its metadata
  const heroIndex = layout.findIndex(s => s.type === 'hero');
  if (heroIndex !== -1) {
    layout[heroIndex].metadata = {
      ...layout[heroIndex].metadata,
      
      // Card 1: Text with Background
      card1Type: "text",
      card1TitleAr: "أحدث الهواتف الذكية",
      card1TitleEn: "Latest Smartphones",
      card1BadgeAr: "وفر 80%",
      card1BadgeEn: "Save 80%",
      card1CtaAr: "تسوق الأجهزة",
      card1CtaEn: "Shop Devices",
      card1Link: "/search?category=smartphones",
      // Add background image to card 1
      card1BgImageAr: "/demo/tech_bg.png",
      card1BgImageEn: "/demo/tech_bg.png",

      // Card 2: Text with Background
      card2Type: "text",
      card2TitleAr: "الجمال والعطور",
      card2TitleEn: "Beauty & Perfumes",
      card2BadgeAr: "عطور أصلية",
      card2BadgeEn: "Authentic",
      card2CtaAr: "اكتشف العطور",
      card2CtaEn: "Explore Now",
      card2Link: "/search?category=perfumes",
      // Add background image to card 2
      card2BgImageAr: "/demo/perfume_bg.png",
      card2BgImageEn: "/demo/perfume_bg.png",
    };
  }

  await prisma.setting.upsert({
    where: { key: 'homepage_layout' },
    update: { value: JSON.stringify(layout) },
    create: { key: 'homepage_layout', value: JSON.stringify(layout), type: 'string', group: 'homepage' }
  });

  console.log("Seeded homepage_layout (Side Promo Cards)!");
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
