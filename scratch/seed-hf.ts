import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const headerFooterConfig = {
  header: {
    topBarLink: '/offers',
    topBarBgColor: '#0f172a',
    topBarTextColor: '#ffffff',
    logoType: 'both',
    logoUrl: '',
    logoWidth: 140,
    primaryColor: '#1ABB9C',
    topBarTextAr: '🚀 عرض حصري: خصم 50% على جميع المنتجات لفترة محدودة!',
    topBarTextEn: '🚀 Exclusive Offer: 50% off all products for a limited time!',
    topBarTextFr: '🚀 Offre Exclusive: 50% de réduction sur tous les produits pour une durée limitée!',
    logoTitleAr: 'شاري داي',
    logoTitleEn: 'CharyDay',
    logoTitleFr: 'CharyDay',
    logoSubtitleAr: 'المنصة الأولى للتجارة الرقمية',
    logoSubtitleEn: 'The #1 Digital Commerce Platform',
    logoSubtitleFr: 'La 1ère Plateforme de Commerce Numérique'
  },
  footer: {
    titleSize: 'base',
    textSize: 'sm',
    aboutTextAr: 'منصة شاري داي هي بوابتك نحو تجارة إلكترونية سلسة ومربحة. نقدم أفضل الأدوات والخدمات لتنمية أعمالك وبناء متجرك الإلكتروني بسهولة تامة.',
    aboutTextEn: 'CharyDay is your gateway to seamless and profitable e-commerce. We provide the best tools and services to grow your business and build your online store effortlessly.',
    aboutTextFr: 'CharyDay est votre passerelle vers un e-commerce fluide et rentable. Nous fournissons les meilleurs outils et services pour développer votre entreprise.',
    copyrightTextAr: '© 2026 منصة شاري داي. جميع الحقوق محفوظة.',
    copyrightTextEn: '© 2026 CharyDay Platform. All rights reserved.',
    copyrightTextFr: '© 2026 Plateforme CharyDay. Tous droits réservés.',
    dynamicSocials: [
      { id: 'soc1', network: 'facebook', url: 'https://facebook.com/charyday' },
      { id: 'soc2', network: 'twitter', url: 'https://twitter.com/charyday' },
      { id: 'soc3', network: 'instagram', url: 'https://instagram.com/charyday' },
      { id: 'soc4', network: 'linkedin', url: 'https://linkedin.com/company/charyday' },
      { id: 'soc5', network: 'whatsapp', url: 'https://wa.me/1234567890' }
    ],
    columns: [
      {
        id: 'col1',
        titleAr: 'روابط هامة',
        titleEn: 'Important Links',
        titleFr: 'Liens importants',
        links: [
          { id: 'link1', textAr: 'من نحن', textEn: 'About Us', textFr: 'À propos', url: '/about-us' },
          { id: 'link2', textAr: 'تواصل معنا', textEn: 'Contact Us', textFr: 'Nous contacter', url: '/contact' },
          { id: 'link3', textAr: 'المدونة', textEn: 'Blog', textFr: 'Blog', url: '/blog' }
        ]
      },
      {
        id: 'col2',
        titleAr: 'المساعدة والدعم',
        titleEn: 'Help & Support',
        titleFr: 'Aide & Support',
        links: [
          { id: 'link4', textAr: 'الأسئلة الشائعة', textEn: 'FAQ', textFr: 'FAQ', url: '/faq' },
          { id: 'link5', textAr: 'سياسة الشحن', textEn: 'Shipping Policy', textFr: "Politique d'expédition", url: '/shipping-policy' },
          { id: 'link6', textAr: 'سياسة الاسترجاع', textEn: 'Return Policy', textFr: 'Politique de retour', url: '/return-policy' }
        ]
      },
      {
        id: 'col3',
        titleAr: 'الشؤون القانونية',
        titleEn: 'Legal',
        titleFr: 'Légal',
        links: [
          { id: 'link7', textAr: 'الشروط والأحكام', textEn: 'Terms & Conditions', textFr: 'Termes & Conditions', url: '/terms' },
          { id: 'link8', textAr: 'سياسة الخصوصية', textEn: 'Privacy Policy', textFr: 'Politique de confidentialité', url: '/privacy' },
          { id: 'link9', textAr: 'اتفاقية البائع', textEn: 'Seller Agreement', textFr: 'Accord du vendeur', url: '/seller-agreement' }
        ]
      }
    ]
  }
};

async function main() {
  console.log('Seeding Platform Settings with rich Header & Footer data...');
  
  await prisma.platformSettings.upsert({
    where: { id: 'global' },
    update: {
      headerFooterConfig: JSON.stringify(headerFooterConfig)
    },
    create: {
      id: 'global',
      isUpgradeFreePromo: true,
      upgradeFeaturesConfig: '{}',
      headerFooterConfig: JSON.stringify(headerFooterConfig)
    }
  });

  console.log('Successfully updated Platform Settings!');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
