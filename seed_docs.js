const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const existing = await prisma.docArticle.findUnique({
    where: { slug: 'system-documentation' }
  });

  if (!existing) {
    await prisma.docArticle.create({
      data: {
        title: 'مقدمة في نظام التوثيق الخاص بـ ChariDay',
        titleEn: 'Introduction to ChariDay Documentation System',
        slug: 'system-documentation',
        category: 'developers',
        isPublished: true,
        sortOrder: 1,
        content: `
# مرحباً بك في نظام التوثيق الخاص بـ ChariDay 📚

تم بناء هذا النظام لمساعدة (التجار، المشترين، والمطورين) على فهم خصائص وميزات منصة ChariDay وكيفية الاستفادة منها بأقصى قدر ممكن.

## 🌟 ميزات النظام:
1. **سهولة الإدارة:** يمكن إضافة وتعديل المقالات مباشرة من لوحة تحكم الإدارة.
2. **دعم أكواد البرمجة:** يدعم النظام كتابة وعرض الأكواد بشكل منسق مع تلوين الأكواد (Syntax Highlighting).
3. **تصنيفات ذكية:** يتم تقسيم المقالات تلقائياً بناءً على الجمهور المستهدف.

### مثال على كتابة كود (للمطورين):
\`\`\`javascript
function greetPlatform() {
    console.log("Welcome to ChariDay - The Next Generation E-commerce Platform");
}
greetPlatform();
\`\`\`

> **ملاحظة هامة:** سيتم تحديث هذا التوثيق بشكل تلقائي عند إضافة أي ميزة جديدة للمنصة لضمان بقائه المرجع الأول والشامل.
        `,
        contentEn: 'Welcome to ChariDay Docs'
      }
    });
    console.log("Seeded first documentation article successfully.");
  } else {
    console.log("Article already exists.");
  }
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
