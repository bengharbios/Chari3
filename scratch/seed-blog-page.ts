import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const blogAr = `
<div style="text-align: center; padding: 40px 20px;">
    <h2 style="color: #1ABB9C; margin-bottom: 20px;">قريباً جداً!</h2>
    <p style="font-size: 1.1rem; color: #555;">نعمل حالياً على تجهيز <b>مدونة شاري داي</b> لتكون وجهتك الأولى لكل ما يخص التجارة الإلكترونية، التسويق، ونصائح البائعين.</p>
    <p style="font-size: 1.1rem; color: #555;">ترقبوا مقالات أسبوعية، دراسات حالة، وتحديثات هامة عن المنصة.</p>
</div>
`;

const blogEn = `
<div style="text-align: center; padding: 40px 20px;">
    <h2 style="color: #1ABB9C; margin-bottom: 20px;">Coming Very Soon!</h2>
    <p style="font-size: 1.1rem; color: #555;">We are currently preparing the <b>ChariDay Blog</b> to be your premier destination for e-commerce insights, marketing, and seller tips.</p>
    <p style="font-size: 1.1rem; color: #555;">Stay tuned for weekly articles, case studies, and important platform updates.</p>
</div>
`;

const blogFr = `
<div style="text-align: center; padding: 40px 20px;">
    <h2 style="color: #1ABB9C; margin-bottom: 20px;">À Venir Très Bientôt !</h2>
    <p style="font-size: 1.1rem; color: #555;">Nous préparons actuellement le <b>Blog ChariDay</b> pour qu'il devienne votre destination de choix pour les insights e-commerce, le marketing et les conseils aux vendeurs.</p>
    <p style="font-size: 1.1rem; color: #555;">Restez à l'écoute pour des articles hebdomadaires, des études de cas et des mises à jour importantes.</p>
</div>
`;

function createPagePuckData() {
  return JSON.stringify({
    content: [
      {
        type: "Hero",
        props: {
          bgImage: "https://images.unsplash.com/photo-1499750310107-5fef28a66643?q=80&w=2000&auto=format&fit=crop",
          content: [
            { locale: "ar", title: "المدونة", desc: "أخبار، مقالات، ونصائح لتعزيز تجربتك في التجارة الإلكترونية." },
            { locale: "en", title: "Blog", desc: "News, articles, and tips to boost your e-commerce experience." },
            { locale: "fr", title: "Blog", desc: "Actualités, articles et conseils pour booster votre expérience e-commerce." }
          ],
          id: "Hero-Blog"
        }
      },
      {
        type: "RichText",
        props: {
          content: [
            { locale: "ar", html: blogAr },
            { locale: "en", html: blogEn },
            { locale: "fr", html: blogFr }
          ],
          id: "RichText-Blog"
        }
      }
    ],
    root: {},
    zones: {}
  });
}

const blogPage = {
  slug: 'blog',
  titleAr: 'المدونة',
  titleEn: 'Blog',
  titleFr: 'Blog',
  titleJson: JSON.stringify({
    ar: 'المدونة',
    en: 'Blog',
    fr: 'Blog'
  }),
  content: createPagePuckData(),
  isPublished: true
};

async function main() {
  await prisma.customPage.upsert({
    where: { slug: blogPage.slug },
    update: {
      titleAr: blogPage.titleAr,
      titleEn: blogPage.titleEn,
      titleFr: blogPage.titleFr,
      titleJson: blogPage.titleJson,
      content: blogPage.content
    },
    create: blogPage
  });
  console.log("Updated Blog page.");
}

main().catch(console.error).finally(() => prisma.$disconnect());
