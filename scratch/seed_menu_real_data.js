const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const generateId = () => Math.random().toString(36).substring(2, 9);

const menuConfig = {
  alignment: 'start', // Default alignment
  fontFamily: 'var(--font-cairo)', // Let's use Cairo for an elegant Arabic look
  items: [
    {
      id: generateId(),
      type: 'standard',
      labels: { ar: 'الصفحة الرئيسية', en: 'Home', fr: 'Accueil' },
      url: '/',
      children: []
    },
    {
      id: generateId(),
      type: 'mega-custom',
      labels: { ar: 'الإلكترونيات الذكية', en: 'Smart Electronics', fr: 'Électronique intelligente' },
      url: '#',
      imageUrls: [
        'https://images.unsplash.com/photo-1498049794561-7780e7231661?q=80&w=600&auto=format&fit=crop', // Banner 1 (Electronics)
        'https://images.unsplash.com/photo-1550009158-9ebf69173e03?q=80&w=600&auto=format&fit=crop'  // Banner 2 (Smart home)
      ],
      children: [
        { id: generateId(), type: 'standard', labels: { ar: 'الهواتف المحمولة', en: 'Mobile Phones', fr: 'Téléphones portables' }, url: '/search?q=phones', children: [] },
        { id: generateId(), type: 'standard', labels: { ar: 'أجهزة الكمبيوتر المحمولة', en: 'Laptops', fr: 'Ordinateurs portables' }, url: '/search?q=laptops', children: [] },
        { id: generateId(), type: 'standard', labels: { ar: 'التلفزيونات الذكية', en: 'Smart TVs', fr: 'Téléviseurs intelligents' }, url: '/search?q=tv', children: [] },
        { id: generateId(), type: 'standard', labels: { ar: 'الإكسسوارات الذكية', en: 'Smart Accessories', fr: 'Accessoires intelligents' }, url: '/search?q=accessories', children: [] },
        { id: generateId(), type: 'standard', labels: { ar: 'أجهزة الألعاب', en: 'Gaming Consoles', fr: 'Consoles de jeux' }, url: '/search?q=gaming', children: [] },
        { id: generateId(), type: 'standard', labels: { ar: 'الساعات الذكية', en: 'Smartwatches', fr: 'Montres intelligentes' }, url: '/search?q=smartwatches', children: [] },
      ]
    },
    {
      id: generateId(),
      type: 'mega-custom',
      labels: { ar: 'الأزياء والموضة', en: 'Fashion', fr: 'Mode' },
      url: '#',
      imageUrls: [
        'https://images.unsplash.com/photo-1445205170230-053b83016050?q=80&w=600&auto=format&fit=crop', // Banner 1 (Fashion)
        'https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=600&auto=format&fit=crop'  // Banner 2 (Shopping bags)
      ],
      children: [
        { id: generateId(), type: 'standard', labels: { ar: 'ملابس رجالية', en: 'Men\'s Clothing', fr: 'Vêtements pour hommes' }, url: '/search?category=mens', children: [] },
        { id: generateId(), type: 'standard', labels: { ar: 'ملابس نسائية', en: 'Women\'s Clothing', fr: 'Vêtements pour femmes' }, url: '/search?category=womens', children: [] },
        { id: generateId(), type: 'standard', labels: { ar: 'أحذية رياضية', en: 'Sports Shoes', fr: 'Chaussures de sport' }, url: '/search?category=shoes', children: [] },
        { id: generateId(), type: 'standard', labels: { ar: 'حقائب ومحافظ', en: 'Bags & Wallets', fr: 'Sacs et portefeuilles' }, url: '/search?category=bags', children: [] },
        { id: generateId(), type: 'standard', labels: { ar: 'ساعات فاخرة', en: 'Luxury Watches', fr: 'Montres de luxe' }, url: '/search?category=watches', children: [] },
        { id: generateId(), type: 'standard', labels: { ar: 'نظارات شمسية', en: 'Sunglasses', fr: 'Lunettes de soleil' }, url: '/search?category=sunglasses', children: [] },
      ]
    },
    {
      id: generateId(),
      type: 'categories-grid',
      labels: { ar: 'المنزل والديكور', en: 'Home & Decor', fr: 'Maison et déco' },
      url: '#',
      children: [
        { id: generateId(), type: 'standard', labels: { ar: 'أثاث غرفة المعيشة', en: 'Living Room Furniture', fr: 'Meubles de salon' }, url: '/search', iconUrl: 'https://cdn-icons-png.flaticon.com/512/2627/2627181.png', children: [] },
        { id: generateId(), type: 'standard', labels: { ar: 'ديكورات عصرية', en: 'Modern Decor', fr: 'Décoration moderne' }, url: '/search', iconUrl: 'https://cdn-icons-png.flaticon.com/512/3284/3284566.png', children: [] },
        { id: generateId(), type: 'standard', labels: { ar: 'أدوات المطبخ', en: 'Kitchen Tools', fr: 'Ustensiles de cuisine' }, url: '/search', iconUrl: 'https://cdn-icons-png.flaticon.com/512/2917/2917633.png', children: [] },
        { id: generateId(), type: 'standard', labels: { ar: 'مفروشات', en: 'Bedding', fr: 'Literie' }, url: '/search', iconUrl: 'https://cdn-icons-png.flaticon.com/512/2627/2627196.png', children: [] },
        { id: generateId(), type: 'standard', labels: { ar: 'إضاءة', en: 'Lighting', fr: 'Éclairage' }, url: '/search', iconUrl: 'https://cdn-icons-png.flaticon.com/512/2627/2627252.png', children: [] },
        { id: generateId(), type: 'standard', labels: { ar: 'أجهزة منزلية', en: 'Home Appliances', fr: 'Appareils électroménagers' }, url: '/search', iconUrl: 'https://cdn-icons-png.flaticon.com/512/2881/2881472.png', children: [] },
        { id: generateId(), type: 'standard', labels: { ar: 'تنظيف وعناية', en: 'Cleaning & Care', fr: 'Nettoyage' }, url: '/search', iconUrl: 'https://cdn-icons-png.flaticon.com/512/3034/3034873.png', children: [] },
      ]
    },
    {
      id: generateId(),
      type: 'standard',
      labels: { ar: 'الصحة والجمال', en: 'Health & Beauty', fr: 'Santé et beauté' },
      url: '/search',
      children: [
        { id: generateId(), type: 'standard', labels: { ar: 'العناية بالبشرة', en: 'Skincare', fr: 'Soins de la peau' }, url: '/search', children: [] },
        { id: generateId(), type: 'standard', labels: { ar: 'عطور عالمية', en: 'Global Perfumes', fr: 'Parfums mondiaux' }, url: '/search', children: [] },
        { id: generateId(), type: 'standard', labels: { ar: 'مكياج', en: 'Makeup', fr: 'Maquillage' }, url: '/search', children: [] },
        { id: generateId(), type: 'standard', labels: { ar: 'منتجات العناية بالشعر', en: 'Haircare', fr: 'Soins des cheveux' }, url: '/search', children: [] },
      ]
    },
    {
      id: generateId(),
      type: 'standard',
      labels: { ar: 'عروض كبرى 🔥', en: 'Super Deals 🔥', fr: 'Super offres 🔥' },
      url: '/deals',
      children: []
    }
  ]
};

async function seed() {
  try {
    const existing = await prisma.platformSettings.findUnique({ where: { id: 'global' } });
    
    if (!existing) {
      await prisma.platformSettings.create({
        data: {
          id: 'global',
          publicMenuConfig: JSON.stringify(menuConfig)
        }
      });
    } else {
      await prisma.platformSettings.update({
        where: { id: 'global' },
        data: {
          publicMenuConfig: JSON.stringify(menuConfig)
        }
      });
    }

    console.log('Successfully seeded stunning real-world menu data!');
  } catch (err) {
    console.error('Error seeding menu data:', err);
  } finally {
    await prisma.$disconnect();
  }
}

seed();
