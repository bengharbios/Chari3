import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const articleTranslations = {
  ar: {
    title: "المزايا المتقدمة لواجهة المتجر: الصفحات الديناميكية والفوتر الذكي",
    content: `
      <h2>نظرة عامة على المزايا الجديدة</h2>
      <p>تم تزويد منصة شاري داي بأحدث التقنيات لضمان مرونة فائقة وتجربة مستخدم مخصصة بالكامل لمديري المتاجر. هذه المزايا تتيح لك التحكم المطلق في واجهة متجرك دون الحاجة لأي خبرة برمجية.</p>

      <h3>1. منشئ الصفحات الديناميكي (Puck Builder) 🎨</h3>
      <p>وداعاً للصفحات الثابتة! بفضل تقنية <strong>Puck Builder</strong> المدمجة، يمكنك الآن إنشاء وتعديل صفحات كاملة (مثل الصفحة الرئيسية، من نحن، الشروط والأحكام) بطريقة السحب والإفلات (Drag & Drop). يمكنك إضافة:</p>
      <ul>
        <li>أقسام الأكورديون (Accordion) للأسئلة الشائعة.</li>
        <li>أقسام العناوين الرئيسية (Hero Sections) مع صور خلفية جذابة.</li>
        <li>نصوص غنية (Rich Text) منسقة.</li>
      </ul>
      <p>الأمر لا يقتصر على التصميم فقط، بل يمكنك إدخال المحتوى باللغات الثلاث (العربية، الإنجليزية، الفرنسية) من نفس الواجهة، ليتم عرضه للعميل بناءً على لغته المفضلة تلقائياً!</p>

      <h3>2. الفوتر الذكي والاحترافي (Smart Footer) 🚀</h3>
      <p>الفوتر هو واجهة الثقة لمتجرك. لقد قمنا بتطويره ليحتوي على ميزات فائقة الأهمية يمكن تفعيلها أو إيقافها بضغطة زر من لوحة التحكم (إعدادات المنصة > إعدادات الفوتر):</p>
      
      <h4>💳 طرق الدفع (Payment Methods)</h4>
      <p>يمكنك الآن إظهار شريط يضم أيقونات بوابات الدفع المدعومة (مثل البطاقة الذهبية Edahabia، CIB، Visa، Mastercard، والدفع عند الاستلام COD). هذا يعطي انطباعاً فورياً بالموثوقية للعميل قبل بدء التسوق.</p>

      <h4>✉️ النشرة البريدية (Newsletter)</h4>
      <p>قمنا بدمج نموذج اشتراك أنيق أعلى الفوتر. يمكنك تخصيص عنوانه ووصفه بجميع اللغات. هذا النموذج يتيح لعملائك الاشتراك لتلقي العروض، وهو أداة تسويقية جبارة لبناء قاعدة عملاء.</p>

      <h4>📱 روابط تحميل التطبيقات (App Links)</h4>
      <p>إذا كان لديك تطبيق على الهواتف الذكية، يمكنك إظهار شارات "متوفر على Google Play" و "متوفر على App Store" بروابطها المباشرة. هذه الشارات مصممة بعناية لتندمج مع أيقونات التواصل الاجتماعي.</p>

      <h3>كيف أتحكم في هذه المزايا؟ 🛠️</h3>
      <p>الأمر بسيط جداً:</p>
      <ol>
        <li>اذهب إلى <strong>لوحة تحكم الإدارة العليا (Super Admin)</strong>.</li>
        <li>اختر <strong>إعدادات المنصة (Platform Settings)</strong>.</li>
        <li>انقر على قسم <strong>إعدادات الهيدر والفوتر (Header & Footer)</strong>.</li>
        <li>ستجد هناك مفاتيح تفعيل (Toggles) لكل ميزة، وحقولاً لإدخال الترجمات الخاصة بها والروابط.</li>
      </ol>
      <p>بمجرد الحفظ، سيتم تحديث واجهة المتجر فوراً وبشكل متناسق مع الألوان الثيم الخاصة بك!</p>
    `
  },
  en: {
    title: "Advanced Storefront Features: Dynamic Pages & Smart Footer",
    content: `
      <h2>Overview of New Features</h2>
      <p>The ChariDay platform has been equipped with the latest technologies to ensure immense flexibility and a fully customized user experience for store managers. These features give you absolute control over your storefront without needing any coding experience.</p>

      <h3>1. Dynamic Page Builder (Puck Builder) 🎨</h3>
      <p>Say goodbye to static pages! Thanks to the integrated <strong>Puck Builder</strong> technology, you can now create and modify entire pages (like Homepage, About Us, Terms & Conditions) using Drag & Drop. You can add:</p>
      <ul>
        <li>Accordion sections for FAQs.</li>
        <li>Hero sections with attractive background images.</li>
        <li>Formatted Rich Text blocks.</li>
      </ul>
      <p>It's not just about design; you can input content in all three languages (Arabic, English, French) from the same interface, displaying to the customer based on their preferred language automatically!</p>

      <h3>2. Smart & Professional Footer 🚀</h3>
      <p>The footer is the trust interface of your store. We've developed it to contain highly important features that can be toggled on or off with a click from the dashboard (Platform Settings > Footer Settings):</p>
      
      <h4>💳 Payment Methods</h4>
      <p>You can now show a bar containing icons of supported payment gateways (like Edahabia, CIB, Visa, Mastercard, and COD). This immediately gives an impression of reliability to the customer before they start shopping.</p>

      <h4>✉️ Newsletter</h4>
      <p>We've integrated an elegant subscription form above the footer. You can customize its title and description in all languages. This form allows your customers to subscribe to receive offers, a powerful marketing tool for building a customer base.</p>

      <h4>📱 App Download Links</h4>
      <p>If you have a smartphone app, you can show "Get it on Google Play" and "Download on the App Store" badges with direct links. These badges are carefully designed to blend with your social media icons.</p>

      <h3>How do I control these features? 🛠️</h3>
      <p>It's very simple:</p>
      <ol>
        <li>Go to the <strong>Super Admin Dashboard</strong>.</li>
        <li>Select <strong>Platform Settings</strong>.</li>
        <li>Click on the <strong>Header & Footer Settings</strong> section.</li>
        <li>You will find toggles for each feature, along with fields to input translations and links.</li>
      </ol>
      <p>Once saved, the storefront will update instantly and consistently with your theme colors!</p>
    `
  },
  fr: {
    title: "Fonctionnalités avancées de la vitrine : Pages dynamiques et Footer intelligent",
    content: `
      <h2>Aperçu des nouvelles fonctionnalités</h2>
      <p>La plateforme ChariDay a été équipée des dernières technologies pour garantir une flexibilité immense et une expérience utilisateur entièrement personnalisée pour les gestionnaires de boutique. Ces fonctionnalités vous donnent un contrôle absolu sur votre vitrine sans aucune expérience en codage.</p>

      <h3>1. Constructeur de pages dynamiques (Puck Builder) 🎨</h3>
      <p>Dites adieu aux pages statiques ! Grâce à la technologie intégrée <strong>Puck Builder</strong>, vous pouvez désormais créer et modifier des pages entières (comme l'Accueil, À propos, Conditions générales) en utilisant le Glisser-Déposer. Vous pouvez ajouter :</p>
      <ul>
        <li>Des sections Accordéon pour les FAQ.</li>
        <li>Des sections Héro avec de belles images de fond.</li>
        <li>Des blocs de texte riche formaté.</li>
      </ul>
      <p>Il ne s'agit pas seulement de design ; vous pouvez saisir du contenu dans les trois langues (Arabe, Anglais, Français) depuis la même interface, s'affichant automatiquement pour le client en fonction de sa langue préférée !</p>

      <h3>2. Footer intelligent et professionnel 🚀</h3>
      <p>Le footer est l'interface de confiance de votre boutique. Nous l'avons développé pour contenir des fonctionnalités très importantes qui peuvent être activées ou désactivées en un clic depuis le tableau de bord (Paramètres de la plateforme > Paramètres du Footer) :</p>
      
      <h4>💳 Méthodes de paiement</h4>
      <p>Vous pouvez désormais afficher une barre contenant les icônes des passerelles de paiement prises en charge (comme Edahabia, CIB, Visa, Mastercard et COD). Cela donne immédiatement une impression de fiabilité au client avant qu'il ne commence ses achats.</p>

      <h4>✉️ Newsletter</h4>
      <p>Nous avons intégré un élégant formulaire d'abonnement au-dessus du footer. Vous pouvez personnaliser son titre et sa description dans toutes les langues. Ce formulaire permet à vos clients de s'abonner pour recevoir des offres, un puissant outil marketing.</p>

      <h4>📱 Liens de téléchargement d'applications</h4>
      <p>Si vous avez une application pour smartphone, vous pouvez afficher les badges "Disponible sur Google Play" et "Télécharger dans l'App Store". Ces badges sont soigneusement conçus pour s'intégrer avec vos icônes de réseaux sociaux.</p>

      <h3>Comment contrôler ces fonctionnalités ? 🛠️</h3>
      <p>C'est très simple :</p>
      <ol>
        <li>Allez sur le <strong>Tableau de bord Super Admin</strong>.</li>
        <li>Sélectionnez <strong>Paramètres de la plateforme</strong>.</li>
        <li>Cliquez sur la section <strong>Paramètres de Header & Footer</strong>.</li>
        <li>Vous trouverez des commutateurs pour chaque fonctionnalité, ainsi que des champs pour saisir les traductions et les liens.</li>
      </ol>
      <p>Une fois enregistré, la vitrine se mettra à jour instantanément et de manière cohérente avec les couleurs de votre thème !</p>
    `
  }
};

async function main() {
  const article = await prisma.docArticle.upsert({
    where: { slug: 'storefront-advanced-features' },
    update: {
      title: articleTranslations.ar.title,
      titleEn: articleTranslations.en.title,
      content: articleTranslations.ar.content,
      contentEn: articleTranslations.en.content,
      translations: {
        fr: {
          title: articleTranslations.fr.title,
          content: articleTranslations.fr.content
        }
      },
      category: 'sellers',
      isPublished: true
    },
    create: {
      title: articleTranslations.ar.title,
      titleEn: articleTranslations.en.title,
      slug: 'storefront-advanced-features',
      content: articleTranslations.ar.content,
      contentEn: articleTranslations.en.content,
      translations: {
        fr: {
          title: articleTranslations.fr.title,
          content: articleTranslations.fr.content
        }
      },
      category: 'sellers',
      sortOrder: 1,
      isPublished: true
    }
  });

  console.log('Successfully seeded the Documentation article:', article.slug);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
