const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const slug = 'b2b-taxes-documentation';
  
  const titleAr = 'التقارير الضريبية والفواتير (B2B)';
  const titleEn = 'B2B Tax Reports & Invoicing';
  const titleFr = 'Rapports fiscaux et facturation (B2B)';

  const contentAr = `
# التقارير الضريبية والفواتير (B2B) للشركات والمتاجر

تتيح ميزة **التقارير الضريبية (B2B)** للمتاجر والشركات إدارة الالتزامات المالية والضريبية بشكل مؤتمت بالكامل، وتصدير التقارير المتوافقة مع القوانين المحلية.

---

### 📋 مميزات النظام الضريبي B2B

1. **الاحتساب التلقائي للضرائب:**
   - يقوم النظام باحتساب معدل الضريبة تلقائياً بناءً على نوع التوثيق ونوع النشاط المختار.
   - يدعم النظام الضريبة المخصصة للتأمين الذاتي والنشاطات المستقلة (مثل معدل الـ Auto-Entrepreneur البالغ 0.5% أو المعدلات العامة).

2. **تصدير الفواتير الضريبية:**
   - إصدار فواتير قانونية تحتوي على الرقم التعريفي الضريبي (TIN/NIF) للطرفين (المتجر والمشتري).
   - تحميل الفواتير بصيغة PDF فورياً.

3. **تقارير دورية وفصلية:**
   - إمكانية فلترة وتصدير تقارير المبيعات الخاضعة للضريبة مقسمة حسب الفترات الزمنية (شهرياً، ربع سنوي، أو سنوياً).
   - متوفرة بصيغة Excel لتقديمها مباشرة للمحاسب المالي أو مصلحة الضرائب.

---

### ⚙️ كيفية تفعيل واستخدام التقارير الضريبية

1. **إدخال الرقم الضريبي:**
   - يجب أولاً إدخال الرقم التعريفي الضريبي الخاص بمتجرك في صفحة **التحقق من الهوية (KYB)**.
2. **الوصول للتقارير:**
   - اذهب إلى **إدارة الأعمال ← التقارير الضريبية (B2B)**.
3. **توليد التقرير:**
   - حدد الفترة الزمنية المطلوبة ثم اضغط على **تصدير التقرير**.
  `;

  const contentEn = `
# B2B Tax Reports & Invoicing for Merchants

The **B2B Tax Reports** feature allows merchants and corporate stores to manage their financial and tax liabilities in a fully automated environment.

---

### 📋 Key Features

1. **Automated Tax Calculation:**
   - The platform calculates appropriate tax rates based on the merchant's business type and local tax rules (e.g. 0.5% auto-entrepreneur rate).
2. **B2B Compliant Invoices:**
   - Generate legal tax invoices containing Tax Identification Numbers (TIN) for both the store and the buyer.
   - Download in PDF format instantly.
3. **Periodic Tax Reporting:**
   - Filter and export taxable sales reports segmented by periods (monthly, quarterly, or annually) in Excel format.

---

### ⚙️ How to Generate Tax Reports

1. Go to **Business Management → B2B Tax Reports**.
2. Select your reporting period (Month / Quarter).
3. Click **Export Report** to download the spreadsheet.
  `;

  const contentFr = `
# Rapports fiscaux et facturation (B2B) pour les vendeurs

La fonctionnalité **Rapports fiscaux (B2B)** permet aux commerçants et aux entreprises de gérer leurs obligations financières et fiscales de manière automatisée.

---

### 📋 Caractéristiques principales

1. **Calcul automatisé des taxes :**
   - Calcul automatique selon le type d'entreprise (par exemple, taux de 0,5 % pour l'auto-entrepreneur).
2. **Factures conformes B2B :**
   - Génération de factures légales contenant le numéro d'identification fiscale (TIN) des deux parties.
   - Téléchargement instantané au format PDF.
3. **Rapports périodiques :**
   - Exportation de rapports de ventes taxables par période en format Excel.
  `;

  const translations = {
    en: {
      title: titleEn,
      content: contentEn
    },
    fr: {
      title: titleFr,
      content: contentFr
    }
  };

  const existing = await prisma.docArticle.findUnique({ where: { slug } });
  if (existing) {
    await prisma.docArticle.update({
      where: { slug },
      data: {
        title: titleAr,
        content: contentAr,
        contentEn,
        translations: translations,
        isPublished: true
      }
    });
    console.log('Updated existing B2B Tax doc article');
  } else {
    await prisma.docArticle.create({
      data: {
        slug,
        title: titleAr,
        content: contentAr,
        contentEn,
        translations: translations,
        category: 'sellers',
        sortOrder: 12,
        isPublished: true
      }
    });
    console.log('Created new B2B Tax doc article');
  }

  process.exit(0);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
