const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function seedSidePromo() {
  try {
    const existing = await prisma.setting.findUnique({ where: { key: 'homepage_layout' } });
    
    if (existing && existing.value) {
      let layout = JSON.parse(existing.value);
      
      const heroSection = layout.find(s => s.type === 'hero');
      
      if (heroSection) {
        heroSection.metadata = {
          ...heroSection.metadata,
          
          // Card 1
          card1Type: 'text', // Or 'image' if they want a pure image banner
          
          card1BadgeAr: 'أحدث الهواتف',
          card1BadgeEn: 'Latest Mobiles',
          card1BadgeFr: 'Derniers Mobiles',
          
          card1TitleAr: 'وفر مع شاري داي إلى 80%',
          card1TitleEn: 'Save up 80 % with Chariday',
          card1TitleFr: 'Économisez jusqu\'à 80% sur iPhone et Xiaomi',
          
          card1CtaAr: 'تسوق الأجهزة',
          card1CtaEn: 'Shop Devices',
          card1CtaFr: 'Acheter des Appareils',
          
          card1Link: '/search?category=smartphones',
          card1AdImageAr: 'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?q=80&w=600&auto=format&fit=crop', // Provide an actual image just in case they switch to image type!
          card1AdImageEn: 'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?q=80&w=600&auto=format&fit=crop',
          card1AdImageFr: 'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?q=80&w=600&auto=format&fit=crop',

          // Card 2
          card2Type: 'text',

          card2BadgeAr: 'الجمال والعطور',
          card2BadgeEn: 'Beauty Deals',
          card2BadgeFr: 'Beauté et Parfums',
          
          card2TitleAr: 'روائح تسحر الجميع بأسعار لا تقاوم',
          card2TitleEn: 'Fragrances that captivate at unbeatable prices',
          card2TitleFr: 'Des parfums qui captivent à des prix imbattables',
          
          card2CtaAr: 'اكتشف العطور',
          card2CtaEn: 'Explore Now',
          card2CtaFr: 'Découvrir',
          
          card2Link: '/search?category=perfumes',
          card2AdImageAr: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?q=80&w=600&auto=format&fit=crop', // Optional image
          card2AdImageEn: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?q=80&w=600&auto=format&fit=crop',
          card2AdImageFr: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?q=80&w=600&auto=format&fit=crop',
        };

        await prisma.setting.update({
          where: { key: 'homepage_layout' },
          data: {
            value: JSON.stringify(layout)
          }
        });
        console.log('Successfully seeded Side Promo Cards!');
      } else {
        console.log('Hero section not found in layout.');
      }
    } else {
      console.log('No homepage layout found.');
    }

  } catch (err) {
    console.error('Error seeding side promos:', err);
  } finally {
    await prisma.$disconnect();
  }
}

seedSidePromo();
