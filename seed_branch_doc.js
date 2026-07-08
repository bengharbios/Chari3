const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const article = {
    title: 'دليل إدارة الفروع وطاقم العمل (Branches & Team Staff)',
    titleEn: 'Branches and Team Staff Management Guide',
    slug: 'branches-team-management',
    category: 'sellers',
    isPublished: true,
    sortOrder: 10,
    content: `
# 🏢 دليل إدارة الفروع وطاقم العمل في منصة ChariDay

تم بناء نظام إدارة المتاجر والفروع في منصة **ChariDay** ليتوافق مع أفضل المعايير العالمية في إدارة التجارة متعددة الفروع والموظفين (Multi-branch / Multi-store Staff).

---

## 🌟 1. أنواع الحسابات والفرق بين التاجر والشركة
تدعم المنصة نوعين رئيسيين من حسابات التجار:
1. **تاجر مستقل (Individual Seller):** حساب مخصص للأفراد الذين يديرون متجراً واحداً فقط. لا يتطلب هذا الحساب إدارة فروع أو موظفين، وتكون خيارات "الفروع" مخفية تلقائياً من لوحة التحكم الخاصة به.
2. **متجر / شركة (Business Store):** حساب مخصص للمؤسسات والشركات التي تمتلك وتدير فروعاً متعددة تحت مظلة حساب رئيسي واحد. يتيح هذا الحساب إضافة موظفين وتخصيصهم لفروع معينة بصلاحيات محددة.

---

## 👥 2. نظام طاقم العمل وتوزيع الصلاحيات (Store Staff Permissions)
يمكن لمالك الحساب الرئيسي (Business Owner) دعوة موظفين وإضافتهم إلى متجر رئيسي أو فرع معين بالصلاحيات التالية:
* **مدير فرع (store_manager / admin):** يمتلك كامل الصلاحيات لإدارة المتجر/الفرع المعين له، بما في ذلك تعديل الإعدادات وتصفح المنتجات والطلبات.
* **محرر (editor):** يمتلك صلاحية إضافة وتعديل المنتجات، وإدارة المخزون والأسعار دون صلاحية تعديل الإعدادات الحساسة للفرع.
* **دعم فني (support):** يمتلك صلاحية معالجة الطلبات، التحدث مع العملاء، ومتابعة الشحنات.
* **مشاهد (viewer):** صلاحية القراءة فقط للمبيعات والتقارير دون إمكانية تعديل أي بيانات.

---

## 🔄 3. التنقل السلس بين الفروع (Store Switcher)
إذا كان الموظف أو التاجر مرتبطاً بأكثر من فرع (سواء كمالك رئيسي أو كمدير/موظف في فروع متعددة):
* يظهر له **مبدل المتاجر (Store Switcher)** في الشريط العلوي (Header) للوحة التحكم.
* يتيح المبدل الانتقال الفوري بين لوحات تحكم الفروع المختلفة دون الحاجة لتسجيل الخروج والدخول مرة أخرى.
* يقوم النظام تلقائياً بتحديث صلاحيات الجلسة الحالية بناءً على الفرع النشط الذي يتصفحه المستخدم.

---

## ⚙️ 4. الأمان والتحقق من الصلاحيات (Security & Access Control)
لحماية البيانات الحساسة لكل فرع، يطبق النظام القواعد التالية:
* **حماية الإعدادات:** لا يمكن تعديل إعدادات أي فرع إلا لمالك الحساب الرئيسي أو مدير الفرع (store_manager) المعين رسمياً في هذا الفرع.
* **حل مشكلة الوصول:** تم إصلاح نظام التحقق ليتيح لمدراء الفروع الفرعية (المرتبطين عبر جدول طاقم العمل StoreStaff) الوصول الكامل للإعدادات دون مواجهة خطأ "فشل تحميل الإعدادات من الخادم".
* **عزل البيانات:** يتم فلترة المنتجات، الطلبات، والتقارير المالية تلقائياً لتظهر فقط البيانات الخاصة بالفرع الحالي النشط.
    `,
    contentEn: `
# 🏢 Branches and Team Staff Management Guide for ChariDay

The store and branch management system in **ChariDay** is built to comply with global e-commerce standards for multi-branch operations and team role-delegation.

---

## 🌟 1. Account Types: Individual vs. Business
The platform supports two types of merchant accounts:
1. **Individual Seller:** Designed for single-store merchants. This account type does not manage multiple branches or employees, and the "Branches" tab is automatically hidden from their dashboard sidebar.
2. **Business Store:** Tailored for corporate entities or merchants running multiple branches/outlets under one primary umbrella account. This enables full team staff allocation and branch switching.

---

## 👥 2. Store Staff & Permission Levels
The primary Business Owner can add staff members and assign them to specific branches with granular roles:
* **Branch Manager (store_manager / admin):** Full control over the designated store/branch, including updating settings, managing products, and viewing orders.
* **Editor:** Permission to add/modify products, update inventory, and manage pricing, but cannot modify critical store settings.
* **Support:** Responsible for processing orders, interacting with customers, and monitoring shipments.
* **Viewer:** Read-only access to sales charts and reports without modifying any data.

---

## 🔄 3. Seamless Multi-Branch Switching (Store Switcher)
For owners and employees associated with multiple stores/branches:
* A **Store Switcher** dropdown is displayed in the dashboard header.
* This allows instant navigation between different store dashboards without logging out and back in.
* The system dynamically evaluates and applies the user's role and permissions relative to the currently active store.

---

## ⚙️ 4. Security & Access Control
To protect sensitive store data, the platform enforces strict security logic:
* **Settings Protection:** Only the primary owner or the formally assigned Branch Manager can access and modify store settings.
* **Resolved Settings Bug:** Authorized branch managers associated via the \`StoreStaff\` model can now access settings without encountering the "Failed to load settings from server" error.
* **Data Isolation:** Products, invoices, orders, and financial summaries are isolated per active store/branch.
    `
  };

  const existing = await prisma.docArticle.findUnique({
    where: { slug: article.slug }
  });

  if (!existing) {
    await prisma.docArticle.create({ data: article });
    console.log("Seeded Branches & Team documentation article successfully.");
  } else {
    await prisma.docArticle.update({
      where: { slug: article.slug },
      data: article
    });
    console.log("Updated Branches & Team documentation article successfully.");
  }
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
