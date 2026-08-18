const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const generateId = () => Math.random().toString(36).substring(2, 9);

const heroSlides = [
  {
    id: generateId(),
    // Fallback + Arabic
    title: 'تخفيضات العودة للمدارس',
    subtitle: 'خصومات تصل إلى 50% على الحقائب، القرطاسية والإلكترونيات.',
    badge: 'لفترة محدودة',
    cta: 'تسوق الآن',
    
    // Explicit Arabic
    titleAr: 'تخفيضات العودة للمدارس',
    subtitleAr: 'خصومات تصل إلى 50% على الحقائب، القرطاسية والإلكترونيات.',
    badgeAr: 'لفترة محدودة',
    ctaAr: 'تسوق الآن',

    // English
    titleEn: 'Back to School Sale',
    subtitleEn: 'Up to 50% off on bags, stationery, and electronics.',
    badgeEn: 'Limited Time',
    ctaEn: 'Shop Now',

    // French
    titleFr: 'Soldes de Rentrée',
    subtitleFr: "Jusqu'à 50% de réduction sur les sacs, la papeterie et l'électronique.",
    badgeFr: 'Temps Limité',
    ctaFr: 'Achetez maintenant',
    
    imageUrl: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?q=80&w=1200&auto=format&fit=crop',
    url: '/search?q=school',
  },
  {
    id: generateId(),
    // Fallback + Arabic
    title: 'أحدث التشكيلات العصرية',
    subtitle: 'اكتشف أحدث صيحات الموضة والأزياء لجميع أفراد العائلة بأفضل الأسعار.',
    badge: 'تشكيلة جديدة',
    cta: 'استكشف الموضة',

    // Explicit Arabic
    titleAr: 'أحدث التشكيلات العصرية',
    subtitleAr: 'اكتشف أحدث صيحات الموضة والأزياء لجميع أفراد العائلة بأفضل الأسعار.',
    badgeAr: 'تشكيلة جديدة',
    ctaAr: 'استكشف الموضة',

    // English
    titleEn: 'Latest Trendy Collections',
    subtitleEn: 'Discover the latest fashion trends for the whole family at the best prices.',
    badgeEn: 'New Arrival',
    ctaEn: 'Explore Fashion',

    // French
    titleFr: 'Dernières Collections Tendances',
    subtitleFr: 'Découvrez les dernières tendances mode pour toute la famille aux meilleurs prix.',
    badgeFr: 'Nouvelle Arrivée',
    ctaFr: 'Explorer la Mode',
    
    imageUrl: 'https://images.unsplash.com/photo-1445205170230-053b83016050?q=80&w=1200&auto=format&fit=crop',
    url: '/search?category=fashion',
  },
  {
    id: generateId(),
    // Fallback + Arabic
    title: 'ترقية منزلك الذكي',
    subtitle: 'شاشات ذكية، أجهزة منزلية حديثة وكل ما يسهل حياتك اليومية.',
    badge: 'حصرياً',
    cta: 'تصفح الأجهزة',

    // Explicit Arabic
    titleAr: 'ترقية منزلك الذكي',
    subtitleAr: 'شاشات ذكية، أجهزة منزلية حديثة وكل ما يسهل حياتك اليومية.',
    badgeAr: 'حصرياً',
    ctaAr: 'تصفح الأجهزة',

    // English
    titleEn: 'Upgrade Your Smart Home',
    subtitleEn: 'Smart TVs, modern home appliances and everything to make your daily life easier.',
    badgeEn: 'Exclusive',
    ctaEn: 'Browse Appliances',

    // French
    titleFr: 'Améliorez Votre Maison Intelligente',
    subtitleFr: 'Téléviseurs intelligents, appareils électroménagers modernes et tout pour vous faciliter la vie.',
    badgeFr: 'Exclusif',
    ctaFr: 'Parcourir les Appareils',
    
    imageUrl: 'https://images.unsplash.com/photo-1550009158-9ebf69173e03?q=80&w=1200&auto=format&fit=crop',
    url: '/search?category=electronics',
  }
];

async function seed() {
  try {
    const existing = await prisma.setting.findUnique({ where: { key: 'homepage_hero_slides' } });
    
    if (!existing) {
      await prisma.setting.create({
        data: {
          key: 'homepage_hero_slides',
          value: JSON.stringify(heroSlides),
          group: 'homepage'
        }
      });
    } else {
      await prisma.setting.update({
        where: { key: 'homepage_hero_slides' },
        data: {
          value: JSON.stringify(heroSlides)
        }
      });
    }

    console.log('Successfully seeded real-world hero slides data!');
  } catch (err) {
    console.error('Error seeding hero slides:', err);
  } finally {
    await prisma.$disconnect();
  }
}

seed();
