const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function seedSidePromoAds() {
  try {
    const existing = await prisma.setting.findUnique({ where: { key: 'homepage_layout' } });
    
    if (existing && existing.value) {
      let layout = JSON.parse(existing.value);
      
      const heroSection = layout.find(s => s.type === 'hero');
      
      if (heroSection) {
        heroSection.metadata = {
          ...heroSection.metadata,
          
          // Card 1: Set to full ad image
          card1Type: 'ad', 
          card1AdLink: '/search?category=smartphones',
          card1AdImageAr: 'https://images.unsplash.com/photo-1601784551446-20c9e07cd8d3?q=80&w=600&auto=format&fit=crop', 
          card1AdImageEn: 'https://images.unsplash.com/photo-1601784551446-20c9e07cd8d3?q=80&w=600&auto=format&fit=crop',
          card1AdImageFr: 'https://images.unsplash.com/photo-1601784551446-20c9e07cd8d3?q=80&w=600&auto=format&fit=crop',

          // Card 2: Set to full ad image
          card2Type: 'ad',
          card2AdLink: '/search?category=perfumes',
          card2AdImageAr: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?q=80&w=600&auto=format&fit=crop', 
          card2AdImageEn: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?q=80&w=600&auto=format&fit=crop',
          card2AdImageFr: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?q=80&w=600&auto=format&fit=crop',
        };

        await prisma.setting.update({
          where: { key: 'homepage_layout' },
          data: {
            value: JSON.stringify(layout)
          }
        });
        console.log('Successfully seeded Side Promo Ads!');
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

seedSidePromoAds();
