const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const contentAr = `
# إدارة الصلاحيات وتسجيل الحسابات
في هذه الصفحة، يمكنك كمدير للنظام التحكم في أنواع الحسابات المسموح لها بالتسجيل في المنصة.

## التحكم في التسجيل
من خلال "الإعدادات > إعدادات النظام"، ستجد قسماً باسم **الصلاحيات وإعدادات التسجيل**.
- يمكنك إيقاف أو تفعيل تسجيل (التاجر، المشتري، المورد، إلخ).
- عند تعطيل أي دور، سيختفي تلقائياً من صفحة تسجيل الدخول للمستخدمين الجدد.

## التفرقة بين حساب التاجر الفردي والشركات
- **التاجر المستقل (Freelancer):** تظهر له واجهة مبسطة لإدارة المنتجات والطلبات فقط.
- **حساب الشركات (Business):** تظهر له ميزات متقدمة في القائمة الجانبية (مثل: إدارة الفريق، التقارير الضريبية B2B، والفروع).
- يمكن للتاجر المستقل طلب الترقية إلى حساب شركة من خلال زر "ترقية لمتجر" في إعداداته.
  `;

  const contentEn = `
# Roles and Registration Management
On this page, as a system administrator, you can control which account types are allowed to register on the platform.

## Registration Toggles
Through "Settings > System Settings", you will find a section called **Roles & Registration Settings**.
- You can enable or suspend registration for (Seller, Buyer, Supplier, etc.).
- When a role is suspended, it is automatically hidden from the registration page for new users.

## Individual vs Business Accounts
- **Freelancer / Individual:** Sees a simplified interface for managing products and orders.
- **Business / Corporate:** Accesses advanced features in the sidebar (e.g., Team Management, B2B Tax Reports, Branches).
- An individual seller can request an upgrade to a business account via the "Upgrade to Store" button in their settings.
  `;

  const doc = await prisma.docArticle.upsert({
    where: { slug: 'roles-registration-management' },
    update: {
      title: 'إدارة الصلاحيات والتسجيل',
      titleEn: 'Roles & Registration Management',
      content: contentAr,
      contentEn: contentEn,
      category: 'general',
    },
    create: {
      slug: 'roles-registration-management',
      title: 'إدارة الصلاحيات والتسجيل',
      titleEn: 'Roles & Registration Management',
      content: contentAr,
      contentEn: contentEn,
      category: 'general',
      isPublished: true,
      sortOrder: 1,
    }
  });

  console.log('Successfully inserted Roles & Registration Management Doc:', doc.slug);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
