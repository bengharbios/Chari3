const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Seeding advanced security documentation...');

  const slug = 'admin-advanced-security-hardening';

  const title = 'نظام الأمان المتقدم والرقابة الثنائية (Two-Person Rule)';
  const titleEn = 'Advanced Security Hardening & Two-Person Approval';

  const content = `
# دليل الأمان المتقدم لحسابات الإدارة والرقابة الثنائية

يركز هذا الدليل على شرح التدابير الأمنية المضافة لحماية حساب المدير الأعلى (SUPER_ADMIN) وإدارة صلاحيات الموظفين الإداريين بكفاءة.

---

## 1. حماية حساب SUPER_ADMIN
حساب المدير الأعلى محمي برمجياً بشكل كامل ولا يمكن لأي مستخدم آخر (حتى لو كان يمتلك رتبة مدير Admin) إجراء التعديلات التالية عليه:
- تعديل رتبة أو دور SUPER_ADMIN.
- تعطيل أو تعليق الحساب.
- حذف الحساب نهائياً من قاعدة البيانات.

أي محاولة للقيام بذلك ستواجه مباشرة برسالة حظر صريحة \`403 Forbidden\`.

---

## 2. نظام الرقابة الثنائية (Two-Person Rule)
تم تصميم هذا النظام للحد من مخاطر الأخطاء أو القرارات الانفرادية الخطيرة من قبل موظفي الإدارة العاديين.

### كيف يعمل؟
عندما يقوم مدير عادي (Admin) بمحاولة إجراء حساس مثل:
- حذف مستخدم نهائياً (\`FORCE_DELETE_USER\`).
- تعديل حد مديونية التاجر (\`CHANGE_DEBT_LIMIT\`).
- إنشاء حساب مدير جديد (\`CREATE_ADMIN\`).
- إلغاء أو تجاوز اشتراك مدفوع يدوياً (\`OVERRIDE_SUBSCRIPTION\`).

**لن يتم تنفيذ الإجراء فوراً**، بل سيتم جدولته كطلب معلق (\`Pending Action\`) في لوحة المتابعة الأمنية. ويتطلب موافقة وتأكيد مدير إداري ثانٍ مختلف عن صاحب الطلب لاعتماده وتنفيذه.

### تفعيل وتعطيل الخاصية:
يمكن للمدير الأعلى تفعيل أو تعطيل هذا النظام بالكامل من صفحة الإعدادات الأمنية:
- اذهب إلى **الإدارة العامة > الأمان والدخول > إعدادات الأمان المتقدمة**.
- قم بتفعيل أو إيقاف خيار **الرقابة الثنائية (Two-Person Approval)**.

*ملاحظة: المدير الأعلى (SUPER_ADMIN) مستثنى دائماً وتُنفذ طلباته فوراً دون انتظار موافقة.*

---

## 3. تغيير البيانات الحساسة (البريد وكلمة المرور)
- **تغيير البريد الإلكتروني المزدوج:** يتطلب إدخال رمزي تحقق (OTP)؛ الرمز الأول يُرسل للبريد الحالي لتأكيد الهوية، والرمز الثاني يُرسل للبريد الجديد للتحقق من صحته.
- **تغيير كلمة المرور بمصادقة ثنائية:** إذا كان التحقق الثنائي (2FA) مفعلاً، فلن يكتمل تغيير كلمة المرور إلا بإدخال رمز الـ TOTP الحي من الهاتف.

---

## 4. رموز الاسترداد الطارئة (Recovery Codes)
في حال فقدان جهاز الهاتف الخاص بالتحقق الثنائي (2FA)، يمكنك استخدام أحد رموز الاسترداد العشرة (Recovery Codes) التي قمت بتحميلها مسبقاً من صفحة **أمان حسابي**. كل رمز صالح للاستخدام لمرة واحدة فقط للدخول للحساب لإعادة ضبط الإعدادات.
`;

  const contentEn = `
# Advanced Security Hardening & Two-Person Approval Manual

This manual outlines the robust security measures added to protect the SUPER_ADMIN account and govern administrative operations through split-authority validation.

---

## 1. SUPER_ADMIN Immutable Protection
The primary SUPER_ADMIN account is structurally locked. No other administrative account can:
- Change the SUPER_ADMIN's role or access level.
- Suspend, ban, or toggle the status of the SUPER_ADMIN.
- Delete or purge the SUPER_ADMIN account from the database.

Any unauthorized attempts to alter this account will return a strict \`403 Forbidden\` error.

---

## 2. Two-Person Approval (Two-Person Rule)
To prevent internal collusion or catastrophic accidental changes, critical actions requested by standard admins require a secondary signature.

### Affected Actions
- Permanent user deletion (\`FORCE_DELETE_USER\`).
- Modifying merchant debt limits (\`CHANGE_DEBT_LIMIT\`).
- Creating new administrative profiles (\`CREATE_ADMIN\`).
- Manually cancelling/overriding paid merchant packages (\`OVERRIDE_SUBSCRIPTION\`).

### How it Works
When a standard admin triggers a protected action, the system queues the request under **Pending Actions**. A secondary, different admin must review and press "Approve" for the database script to execute.

### Dynamic Toggle Configuration
The SUPER_ADMIN can configure this behavior platform-wide:
- Navigate to **Admin Panel > Security & Access > Advanced Security**.
- Toggle the **Two-Person Approval** switch.

*Note: SUPER_ADMIN actions bypass this check and execute immediately.*

---

## 3. High-Security Personal Account Operations
- **Dual-OTP Email Update:** Enforces OTP confirmations sent to both the legacy email address and the new proposed email. Both must match.
- **2FA-Enforced Password Modifications:** Standard password changes require a valid live TOTP code if Two-Factor auth is active on the account.

---

## 4. Break-Glass Recovery Codes
If you lose your authenticator application/device, use one of your 10 one-time recovery codes generated from the **My Account Security** tab to log in and reset your settings.
`;

  await prisma.docArticle.upsert({
    where: { slug },
    update: {
      title,
      titleEn,
      content,
      contentEn,
      category: 'security',
      isPublished: true,
      sortOrder: 1,
    },
    create: {
      title,
      titleEn,
      slug,
      content,
      contentEn,
      category: 'security',
      isPublished: true,
      sortOrder: 1,
    }
  });

  console.log('Documentation seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
