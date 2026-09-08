import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const platformSettings = await prisma.platformSettings.findUnique({
    where: { id: 'global' }
  });

  if (platformSettings && platformSettings.headerFooterConfig) {
    let config = JSON.parse(platformSettings.headerFooterConfig);
    
    config.footer.columns = [
      {
        id: "col1",
        titleAr: "روابط هامة",
        titleEn: "Important Links",
        titleFr: "Liens importants",
        links: [
          { id: "link1", textAr: "من نحن", textEn: "About Us", textFr: "À propos", url: "/pages/about-us" },
          { id: "link2", textAr: "تواصل معنا", textEn: "Contact Us", textFr: "Nous contacter", url: "/pages/contact-us" },
          { id: "link3", textAr: "المدونة", textEn: "Blog", textFr: "Blog", url: "/pages/blog" }
        ]
      },
      {
        id: "col2",
        titleAr: "المساعدة والدعم",
        titleEn: "Help & Support",
        titleFr: "Aide & Support",
        links: [
          { id: "link_new", textAr: "المساعدة والدعم", textEn: "Help & Support", textFr: "Aide & Support", url: "/pages/help-and-support" },
          { id: "link4", textAr: "الأسئلة الشائعة", textEn: "FAQ", textFr: "FAQ", url: "/pages/faq" },
          { id: "link5", textAr: "سياسة الشحن", textEn: "Shipping Policy", textFr: "Politique d'expédition", url: "/pages/shipping-policy" },
          { id: "link6", textAr: "سياسة الاسترجاع", textEn: "Return Policy", textFr: "Politique de retour", url: "/pages/return-policy" }
        ]
      },
      {
        id: "col3",
        titleAr: "الشؤون القانونية",
        titleEn: "Legal",
        titleFr: "Légal",
        links: [
          { id: "link7", textAr: "الشروط والأحكام", textEn: "Terms & Conditions", textFr: "Termes & Conditions", url: "/pages/terms-and-conditions" },
          { id: "link8", textAr: "سياسة الخصوصية", textEn: "Privacy Policy", textFr: "Politique de confidentialité", url: "/pages/privacy-policy" },
          { id: "link9", textAr: "اتفاقية البائع", textEn: "Seller Agreement", textFr: "Accord du vendeur", url: "/pages/seller-agreement" }
        ]
      }
    ];

    await prisma.platformSettings.update({
      where: { id: 'global' },
      data: { headerFooterConfig: JSON.stringify(config) }
    });

    console.log("Successfully updated footer configuration in database.");
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
