const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function updateDictFile(locale, newKeys) {
  const filePath = path.join(__dirname, '../src/lib/i18n/dictionaries', `${locale}.json`);
  if (!fs.existsSync(filePath)) {
    console.log(`File not found: ${filePath}`);
    return;
  }
  
  const content = fs.readFileSync(filePath, 'utf8');
  const dict = JSON.parse(content);
  
  if (!dict.homepage) dict.homepage = {};
  
  Object.assign(dict.homepage, newKeys);
  
  fs.writeFileSync(filePath, JSON.stringify(dict, null, 2), 'utf8');
  console.log(`Updated dictionary file for ${locale}`);
  
  // Update DB if exists
  const dbKey = `i18n_dict_${locale}`;
  const setting = await prisma.systemSetting.findUnique({ where: { key: dbKey } });
  if (setting) {
    let dbDict = setting.value;
    if (typeof dbDict === 'string') dbDict = JSON.parse(dbDict);
    if (!dbDict.homepage) dbDict.homepage = {};
    Object.assign(dbDict.homepage, newKeys);
    
    await prisma.systemSetting.update({
      where: { key: dbKey },
      data: { value: dbDict }
    });
    console.log(`Updated database translation for ${locale}`);
  }
}

async function main() {
  // 1. Update Translations
  const arKeys = {
    cardTypeText: "✍️ نصوص مع خلفية اختيارية",
    cardTypeImage: "🖼️ بانر إعلاني (صورة فقط)",
    cardTypeAd: "📢 إعلان مدفوع من النظام",
    selectAdvertisement: "اختر الإعلان",
    searchAdvertisement: "ابحث عن الإعلان...",
    backgroundImage: "صورة الخلفية للنصوص",
    backgroundImageDesc: "ستظهر هذه الصورة كخلفية تحت النصوص بشكل أنيق (اختياري)",
    advertisementBadge: "إعلان"
  };
  
  const enKeys = {
    cardTypeText: "✍️ Text with optional background",
    cardTypeImage: "🖼️ Image Banner (Image Only)",
    cardTypeAd: "📢 System Advertisement",
    selectAdvertisement: "Select Advertisement",
    searchAdvertisement: "Search for advertisement...",
    backgroundImage: "Text Background Image",
    backgroundImageDesc: "This image will appear elegantly behind the text (optional)",
    advertisementBadge: "Ad"
  };
  
  const frKeys = {
    cardTypeText: "✍️ Texte avec fond optionnel",
    cardTypeImage: "🖼️ Bannière image (Image seule)",
    cardTypeAd: "📢 Publicité du système",
    selectAdvertisement: "Sélectionner la publicité",
    searchAdvertisement: "Rechercher une publicité...",
    backgroundImage: "Image de fond du texte",
    backgroundImageDesc: "Cette image apparaîtra élégamment derrière le texte (optionnel)",
    advertisementBadge: "Pub"
  };

  await updateDictFile('ar', arKeys);
  await updateDictFile('en', enKeys);
  await updateDictFile('fr', frKeys);
  
  // 2. Add DocArticle
  const slug = 'side-promo-cards-guide';
  const title = 'إدارة البطاقات الجانبية الترويجية (Side Promo Cards)';
  const titleEn = 'Side Promo Cards Management Guide';
  
  const content = `
# دليل إدارة البطاقات الجانبية الترويجية (Side Promo Cards)

تم تطوير البطاقات الجانبية في الصفحة الرئيسية لتوفر مرونة وجمالية أكثر في عرض محتواك الترويجي أو إعلاناتك.

---

## أنواع البطاقات المتاحة:

### 1. ✍️ نصوص مع خلفية اختيارية (Text with Optional Background)
- يتيح لك هذا الخيار كتابة **عناوين ونصوص جذابة** مع زر دعوة لاتخاذ إجراء (Call to Action).
- **الميزة الجديدة:** يمكنك الآن رفع **صورة خلفية اختيارية**. سيقوم النظام بدمج الصورة خلف النصوص بذكاء مع تدرج لوني يضمن بقاء نصوصك مقروءة وواضحة، مما يضفي مظهراً احترافياً وحيوياً.

### 2. 🖼️ بانر إعلاني (صورة فقط) (Image Banner)
- يعتمد هذا الخيار الكلاسيكي على رفع صورة واحدة تمثل البانر بالكامل. بمجرد نقر المستخدم عليها، سيتم توجيهه للرابط المرفق.

### 3. 📢 إعلان مدفوع من النظام (System Advertisement)
- **ميزة متقدمة جديدة!** يتيح لك هذا الخيار ربط البطاقة الجانبية مباشرة بـ **نظام الإعلانات** المدمج في المنصة.
- سيظهر لك مربع بحث يتيح لك اختيار أي إعلان مفعل. سيقوم المتجر تلقائياً بجلب صورة الإعلان ورابطه ليتم عرضهما، مع وضع شارة صغيرة أنيقة تحمل كلمة "إعلان" في الزاوية لإضفاء مزيد من الشفافية والتنظيم.

---
**كيفية الوصول للإعدادات؟**
توجه إلى لوحة التحكم الإدارية، ثم اذهب إلى **الإعدادات > إعدادات الصفحة الرئيسية**. قم بالتمرير إلى أسفل قسم "البانر الترويجي الرئيسي" لتخصيص البطاقات الجانبية (Card 1 و Card 2).
  `;
  
  const contentEn = `
# Side Promo Cards Management Guide

The Side Promo Cards on the homepage have been upgraded to provide greater flexibility and aesthetics for showcasing your promotional content or advertisements.

---

## Available Card Types:

### 1. ✍️ Text with Optional Background
- Allows you to write **compelling titles and texts** alongside a Call to Action button.
- **New Feature:** You can now upload an **optional background image**. The system will intelligently blend the image behind your texts using a color gradient overlay, ensuring your texts remain readable while looking highly professional.

### 2. 🖼️ Image Banner (Image Only)
- The classic option relying entirely on a single uploaded image. Clicking the image redirects the user to the specified link.

### 3. 📢 System Advertisement
- **New Advanced Feature!** This option allows you to link the side promo card directly to the platform's built-in **Advertisements System**.
- A searchable dropdown will appear, allowing you to select any active advertisement. The storefront will automatically fetch the ad's image and link, elegantly placing a small "Ad" badge in the corner for transparency.

---
**How to access these settings?**
Navigate to the Admin Dashboard, go to **Settings > Homepage Settings**. Scroll down to the "Hero Promotion Slides" section to customize the side cards (Card 1 and Card 2).
  `;

  const article = await prisma.docArticle.upsert({
    where: { slug },
    update: {
      title,
      titleEn,
      content,
      contentEn,
      category: 'general',
      isPublished: true,
      translations: {
        fr: {
          title: "Guide de gestion des cartes promotionnelles latérales",
          content: "# Guide de gestion des cartes promotionnelles latérales\n\nLes cartes promotionnelles latérales ont été améliorées pour offrir une plus grande flexibilité esthétique.\n\n### Types de cartes :\n\n1. **Texte avec fond optionnel** : Rédigez des textes captivants et ajoutez une image de fond optionnelle avec un dégradé de couleur élégant.\n2. **Bannière Image** : Utilisez une image complète classique.\n3. **Publicité du système** : Liez directement la carte aux publicités du système avec une liste déroulante et un badge de publicité automatique."
        }
      }
    },
    create: {
      slug,
      title,
      titleEn,
      content,
      contentEn,
      category: 'general',
      isPublished: true,
      sortOrder: 10,
      translations: {
        fr: {
          title: "Guide de gestion des cartes promotionnelles latérales",
          content: "# Guide de gestion des cartes promotionnelles latérales\n\nLes cartes promotionnelles latérales ont été améliorées pour offrir une plus grande flexibilité esthétique.\n\n### Types de cartes :\n\n1. **Texte avec fond optionnel** : Rédigez des textes captivants et ajoutez une image de fond optionnelle avec un dégradé de couleur élégant.\n2. **Bannière Image** : Utilisez une image complète classique.\n3. **Publicité du système** : Liez directement la carte aux publicités du système avec une liste déroulante et un badge de publicité automatique."
        }
      }
    },
  });

  console.log('Successfully seeded side promo doc article:', article.id, article.slug);
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
