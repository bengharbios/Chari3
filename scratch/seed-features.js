const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const adminId = 'admin';

  const realFeatures = [
    {
      id: "f1",
      icon: "Shield",
      title: "دفع آمن وموثوق",
      titleEn: "Secure Payment",
      titleFr: "Paiement Sécurisé",
      desc: "حماية كاملة لبياناتك بفضل التشفير",
      descEn: "Full data protection with encryption",
      descFr: "Protection totale de vos données par cryptage"
    },
    {
      id: "f2",
      icon: "Truck",
      title: "توصيل لـ 58 ولاية",
      titleEn: "58 Wilayas Delivery",
      titleFr: "Livraison 58 wilayas",
      desc: "خدمة توصيل سريعة ومضمونة لباب منزلك",
      descEn: "Fast and guaranteed delivery to your door",
      descFr: "Livraison rapide et garantie à votre porte"
    },
    {
      id: "f3",
      icon: "Award",
      title: "ضمان الاسترجاع",
      titleEn: "Return Guarantee",
      titleFr: "Garantie de retour",
      desc: "إمكانية الاستبدال والاسترجاع مجاناً",
      descEn: "Free replacement and return policy",
      descFr: "Politique de remplacement et de retour gratuit"
    },
    {
      id: "f4",
      icon: "Star",
      title: "منتجات أصلية 100%",
      titleEn: "100% Authentic",
      titleFr: "100% Authentique",
      desc: "جميع السلع من مصادر معتمدة",
      descEn: "All goods are from certified sources",
      descFr: "Tous les articles proviennent de sources certifiées"
    },
    {
      id: "f5",
      icon: "Sparkles",
      title: "خدمة عملاء 24/7",
      titleEn: "24/7 Support",
      titleFr: "Support 24/7",
      desc: "فريق دعم جاهز لخدمتك في أي وقت",
      descEn: "Support team ready to assist you anytime",
      descFr: "Équipe d'assistance prête à vous aider à tout moment"
    }
  ];

  await prisma.setting.upsert({
    where: { key: 'homepage_features' },
    update: { value: JSON.stringify(realFeatures) },
    create: { key: 'homepage_features', value: JSON.stringify(realFeatures), type: 'string', group: 'homepage' }
  });

  console.log("Seeded homepage_features with real data!");
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
