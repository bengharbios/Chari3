import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

function createPuckData(ar, en) {
  return JSON.stringify({
    content: [
      {
        type: "Text",
        props: {
          textAr: ar,
          textEn: en,
          textFr: en,
          align: "center",
          id: "Text-" + Math.random().toString(36).substr(2, 9)
        }
      }
    ],
    root: {},
    zones: {}
  });
}

const missingPages = [
  { slug: 'about-us', titleAr: 'من نحن', titleEn: 'About Us', titleFr: 'À propos', content: createPuckData('هذه الصفحة قيد الإنشاء', 'This page is under construction'), isPublished: true },
  { slug: 'contact', titleAr: 'تواصل معنا', titleEn: 'Contact Us', titleFr: 'Nous contacter', content: createPuckData('هذه الصفحة قيد الإنشاء', 'This page is under construction'), isPublished: true },
  { slug: 'blog', titleAr: 'المدونة', titleEn: 'Blog', titleFr: 'Blog', content: createPuckData('هذه الصفحة قيد الإنشاء', 'This page is under construction'), isPublished: true },
  { slug: 'faq', titleAr: 'الأسئلة الشائعة', titleEn: 'FAQ', titleFr: 'FAQ', content: createPuckData('هذه الصفحة قيد الإنشاء', 'This page is under construction'), isPublished: true },
  { slug: 'shipping-policy', titleAr: 'سياسة الشحن', titleEn: 'Shipping Policy', titleFr: "Politique d'expédition", content: createPuckData('هذه الصفحة قيد الإنشاء', 'This page is under construction'), isPublished: true },
];

async function main() {
  for (const p of missingPages) {
    await prisma.customPage.upsert({
      where: { slug: p.slug },
      update: {},
      create: p
    });
    console.log("Created missing page:", p.slug);
  }

  const settings = await prisma.platformSettings.findFirst();
  if (settings && settings.headerFooterConfig) {
    const config = JSON.parse(settings.headerFooterConfig);
    
    // Fix URLs in the columns
    config.footer.columns.forEach(col => {
      col.links.forEach(link => {
        if (link.url === '/about-us') link.url = '/pages/about-us';
        if (link.url === '/contact') link.url = '/pages/contact';
        if (link.url === '/blog') link.url = '/pages/blog';
        if (link.url === '/faq') link.url = '/pages/faq';
        if (link.url === '/shipping-policy') link.url = '/pages/shipping-policy';
        if (link.url === '/return-policy') link.url = '/pages/return-policy';
        if (link.url === '/terms') link.url = '/pages/terms';
        if (link.url === '/privacy') link.url = '/pages/privacy-policy';
        if (link.url === '/seller-agreement') link.url = '/pages/auto-entrepreneur';
      });
    });

    await prisma.platformSettings.update({
      where: { id: settings.id },
      data: { headerFooterConfig: JSON.stringify(config) }
    });
    console.log("Fixed headerFooterConfig URLs!");
  }
}

main().finally(() => prisma.$disconnect());
