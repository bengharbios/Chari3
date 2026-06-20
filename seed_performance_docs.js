const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const arabicContent = `
# المعايير العالمية لتخفيف الضغط على قاعدة البيانات

منصة ChariDay مصممة لاستيعاب مئات الآلاف من الزوار والتجار دون التأثير على سرعة الاستجابة أو استهلاك موارد الخادم. نعتمد في بنيتنا التحتية على أحدث المعايير العالمية التي تستخدمها كبرى منصات التجارة الإلكترونية لضمان أداء مستقر.

## 1. إدارة الاتصالات (Connection Pooling)
بدلاً من فتح اتصال جديد بقاعدة البيانات لكل زائر يدخل المنصة، نستخدم تقنية **Connection Pooling** عبر Prisma. هذه التقنية تقوم بإنشاء عدد محدود ومراقب من الاتصالات، وتعيد استخدامها بكفاءة عالية، مما يمنع اختناق السيرفر (Server Bottleneck) عند حدوث زيارات مفاجئة.

## 2. التخزين المؤقت (Caching)
تعتمد المنصة على مستويات متعددة من التخزين المؤقت في الذاكرة السريعة (RAM). على سبيل المثال، عندما يدخل 10,000 شخص لمشاهدة نفس المنتج، لا نقوم بإرسال 10,000 طلب لقاعدة البيانات! بل نرسل طلباً واحداً فقط، ونحتفظ بالنتيجة في الـ Cache ليتم عرضها لباقي الزوار في أجزاء من الثانية.

## 3. التحميل التدريجي (Pagination & Lazy Loading)
لا تقوم المنصة أبداً بتحميل جميع منتجات التاجر دفعة واحدة. نعتمد نظام (Pagination) الذي يحمل 20 منتجاً فقط في كل مرة. بالإضافة إلى تحميل الصور فقط عندما تظهر على شاشة المستخدم (Lazy Loading)، مما يقلل استهلاك الـ Bandwidth بنسبة 80%.

## 4. شبكة توصيل المحتوى (Cloudflare CDN)
يتم توزيع جميع الصور، الفيديوهات، وملفات التنسيق (CSS/JS) على مئات السيرفرات حول العالم عبر شبكة Cloudflare. هذا يعني أن 70% من البيانات التي يطلبها الزائر لا تصل إلى سيرفرنا الأساسي إطلاقاً، بل يتم تقديمها من أقرب خادم جغرافي للزائر، مما يترك السيرفر الأساسي مرتاحاً لمعالجة الطلبات الحساسة (مثل الدفع وتسجيل الدخول).
`;

  const englishContent = `
# International Standards for Reducing Database Pressure

The ChariDay platform is engineered to handle hundreds of thousands of visitors and merchants without compromising response times or server resources. Our infrastructure relies on the latest international standards used by major e-commerce platforms to ensure stable performance.

## 1. Connection Pooling
Instead of opening a new database connection for every visitor, we utilize **Connection Pooling** via Prisma. This technology creates a limited, monitored number of connections and reuses them highly efficiently, preventing server bottlenecks during sudden traffic spikes.

## 2. Advanced Caching
The platform relies on multi-level caching in fast memory (RAM). For instance, when 10,000 people view the same product, we do not send 10,000 requests to the database! We send only one request and store the result in the Cache to be served to the rest of the visitors in milliseconds.

## 3. Pagination & Lazy Loading
The platform never loads all a merchant's products at once. We rely on a Pagination system that loads only 20 products at a time. Additionally, images are only loaded when they appear on the user's screen (Lazy Loading), which reduces Bandwidth consumption by 80%.

## 4. Content Delivery Network (Cloudflare CDN)
All images, videos, and styling files (CSS/JS) are distributed across hundreds of servers worldwide via the Cloudflare network. This means that 70% of the data requested by a visitor never reaches our main server at all; it is served from the closest geographical server to the visitor.
`;

  const frenchContent = `
# Normes internationales pour réduire la pression sur la base de données

La plateforme ChariDay est conçue pour gérer des centaines de milliers de visiteurs et de marchands sans compromettre les temps de réponse ou les ressources du serveur. Notre infrastructure s'appuie sur les dernières normes internationales utilisées par les principales plateformes de commerce électronique pour assurer des performances stables.

## 1. Regroupement de connexions (Connection Pooling)
Au lieu d'ouvrir une nouvelle connexion à la base de données pour chaque visiteur, nous utilisons le **Connection Pooling** via Prisma. Cette technologie crée un nombre limité et surveillé de connexions et les réutilise très efficacement, évitant les goulots d'étranglement du serveur en cas de pics de trafic.

## 2. Mise en cache avancée (Caching)
La plateforme s'appuie sur une mise en cache multi-niveaux en mémoire rapide (RAM). Par exemple, lorsque 10 000 personnes consultent le même produit, nous n'envoyons pas 10 000 requêtes à la base de données ! Nous n'envoyons qu'une seule requête et stockons le résultat dans le Cache pour qu'il soit servi au reste des visiteurs en quelques millisecondes.

## 3. Pagination et chargement différé (Lazy Loading)
La plateforme ne charge jamais tous les produits d'un marchand en même temps. Nous nous appuyons sur un système de pagination qui ne charge que 20 produits à la fois. De plus, les images ne sont chargées que lorsqu'elles apparaissent sur l'écran de l'utilisateur (Lazy Loading).

## 4. Réseau de diffusion de contenu (Cloudflare CDN)
Toutes les images, vidéos et fichiers de style (CSS/JS) sont distribués sur des centaines de serveurs dans le monde entier via le réseau Cloudflare. Cela signifie que 70 % des données demandées par un visiteur n'atteignent jamais notre serveur principal.
`;

  await prisma.docArticle.upsert({
    where: { slug: 'database-performance-standards' },
    update: {
      title: 'المعايير العالمية لتخفيف الضغط على قاعدة البيانات',
      titleEn: 'International Standards for Reducing Database Pressure',
      content: arabicContent,
      contentEn: englishContent,
      translations: {
        fr: {
          title: 'Normes internationales pour réduire la pression sur la base de données',
          content: frenchContent
        }
      },
      category: 'developers',
      isPublished: true
    },
    create: {
      slug: 'database-performance-standards',
      title: 'المعايير العالمية لتخفيف الضغط على قاعدة البيانات',
      titleEn: 'International Standards for Reducing Database Pressure',
      content: arabicContent,
      contentEn: englishContent,
      translations: {
        fr: {
          title: 'Normes internationales pour réduire la pression sur la base de données',
          content: frenchContent
        }
      },
      category: 'developers',
      isPublished: true,
      sortOrder: 10
    }
  });

  console.log('Doc inserted successfully!');
}

main().catch(console.error).finally(() => prisma.$disconnect());
