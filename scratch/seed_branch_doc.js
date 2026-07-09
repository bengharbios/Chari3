const { PrismaClient } = require('@prisma/client');
const db = new PrismaClient();

const contentAr = `
# دليل إدارة الفروع وتعدد المتاجر (Multi-Store & Branches)

يوفر نظام **ChariDay** معمارية متقدمة لإدارة فروع متعددة ومتاجر فرعية تحت حساب تاجر واحد، مما يتيح للشركات والكيانات التجارية الكبرى التوسع وإدارة عملياتها بكفاءة متناهية تتوافق مع المعايير العالمية.

---

## 1. المفاهيم الأساسية لنظام الفروع
في الأنظمة العالمية (مثل Shopify Plus و Amazon Merchant)، يُعامل كل فرع ككيان متجر مستقل بذاته له:
* **رابط فريد (Slug):** للعملاء للوصول للمتجر المخصص للفرع.
* **إعدادات منفصلة:** طرق الدفع، خيارات الشحن، الشعار والهوية البصرية.
* **موظفين وصلاحيات:** طاقم عمل مخصص للفرع بصلاحيات محددة.
* **مخزون ومنتجات:** إدارة مبيعات الفرع بشكل مستقل.

---

## 2. آلية الربط والتحكم الفني
لتفادي التعارض في قواعد البيانات وتسهيل المصادقة:
1. **المالك التقني للفرع (Technical Owner):** يتم إنشاء حساب مستخدم تلقائي (Dummy User) ذو دور \`seller\` ليمتلك المتجر الفرعي تقنياً.
2. **الربط الإداري (StoreStaff):** يتم ربط حساب التاجر الفعلي (المالك الأصلي) بهذا الفرع في جدول موظفي المتجر برتبة **مدير متجر (\`store_manager\` أو \`admin\`)**.
3. **لوحة التحكم الموحدة:** يستطيع التاجر التبديل بسلاسة بين متجره الرئيسي وفروعه الأخرى عبر **مُبدل المتاجر** الموجود في أعلى شريط التنقل (Header Switcher) دون الحاجة لتسجيل الخروج والولوج بحساب آخر.

---

## 3. كيفية إدارة الفروع والتبديل بينها
* **عرض الفروع:** اذهب إلى القائمة الجانبية -> **إدارة الفروع** (\`/seller/branches\`). ستشاهد قائمة بجميع الفروع المرتبطة بحسابك، حالتها، وأعضاء الفريق في كل فرع.
* **التبديل بين الفروع:** 
  1. انقر على زر **"تبديل إلى هذا الفرع"** في بطاقة الفرع.
  2. أو استخدم القائمة المنسدلة في أعلى لوحة التحكم بجوار اسمك للتبديل السريع.
* **تعديل الإعدادات:** بمجرد التبديل إلى أي فرع، ستعرض صفحات الإعدادات والمنتجات والطلبات والتحليلات البيانات الخاصة بهذا الفرع النشط حصراً.

---

## 4. إدارة طاقم عمل الفرع (Team/Staff)
يمكنك تعيين موظفين محددين لكل فرع من خلال صفحة **"الفريق"** (\`/seller/staff\`):
* **مدير فرع (\`store_manager\`):** يتحكم بكامل الفرع بما في ذلك تعديل الإعدادات.
* **مشرف (\`admin\`):** صلاحيات واسعة لإدارة المنتجات والطلبات.
* **موظف (\`staff\`):** لمعالجة الطلبات فقط.
`;

const contentEn = `
# Multi-Store & Branch Management Guide

The **ChariDay** platform offers an advanced architecture for managing multiple branches and sub-stores under a single merchant account. This enables large enterprises and B2B entities to scale and orchestrate operations efficiently in compliance with international standards.

---

## 1. Core Branch Concepts
Following global enterprise standards (like Shopify Plus and Amazon Merchant), each branch is treated as an independent store entity with its own:
* **Unique Link (Slug):** A dedicated URL for customers to visit.
* **Isolated Settings:** Tailored shipping rates, payment configurations, and design branding.
* **Staff & Roles:** A local team assigned to run the specific branch.
* **Inventory & Products:** Dedicated product listings and order processing.

---

## 2. Technical Linkage & Authentication
To prevent schema conflicts and simplify access management:
1. **Technical Owner:** A virtual user account (Dummy User) with a \`seller\` role is auto-created to own the branch store.
2. **Administrative Linkage (StoreStaff):** The actual merchant (owner account) is linked to this branch via the \`StoreStaff\` table with a **\`store_manager\`** or **\`admin\`** role.
3. **Unified Dashboard:** The merchant can switch between their primary store and other branches using the **Store Switcher** in the top navigation bar, eliminating the need to log out and log back in.

---

## 3. How to Manage and Switch Branches
* **Viewing Branches:** Go to the sidebar -> **Branches** (\`/seller/branches\`). Here you will see a list of all branches associated with your account, their active status, and staff.
* **Switching Branches:** 
  1. Click **"Switch to Branch"** on any branch card.
  2. Or use the dropdown in the Header next to your profile for quick switching.
* **Updating Settings:** Once switched, settings pages, product catalogs, orders, and analytics will exclusively display and modify data for that active branch.

---

## 4. Managing Branch Staff (Team)
You can assign specific employees to run each branch through the **"Team"** page (\`/seller/staff\`):
* **Branch Manager (\`store_manager\`):** Full control over the branch including core settings.
* **Admin (\`admin\`):** Broad authority to manage products and orders.
* **Staff (\`staff\`):** Restricted access focused on order fulfillment.
`;

async function main() {
  const article = await db.docArticle.upsert({
    where: { slug: 'multi-store-branches' },
    update: {
      title: 'إدارة الفروع والمتاجر المتعددة (Multi-Store & Branches)',
      titleEn: 'Multi-Store & Branch Management',
      content: contentAr,
      contentEn: contentEn,
      category: 'sellers',
      sortOrder: 4,
      isPublished: true
    },
    create: {
      title: 'إدارة الفروع والمتاجر المتعددة (Multi-Store & Branches)',
      titleEn: 'Multi-Store & Branch Management',
      slug: 'multi-store-branches',
      content: contentAr,
      contentEn: contentEn,
      category: 'sellers',
      sortOrder: 4,
      isPublished: true
    }
  });

  console.log('Upserted branch management documentation article:', JSON.stringify(article, null, 2));
}

main().catch(console.error).finally(() => db.$disconnect());
