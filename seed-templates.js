const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  await prisma.setting.upsert({
    where: { key: 'active_homepage_template' },
    update: { value: 'homepage_layout' },
    create: { key: 'active_homepage_template', value: 'homepage_layout', type: 'string', group: 'homepage' }
  });

  const modernTemplate = {
    content: [
      { type: 'HeroSlider', props: { title: 'مرحباً بك في متجرنا الحديث', subtitle: 'أحدث المنتجات العصرية بأفضل الأسعار', alignment: 'text-center items-center', bgOverlay: 'bg-black/40', imageUrl: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&q=80&w=2000' } },
      { type: 'PaddingWrapper', props: { padding: 'py-8', bgColor: 'bg-white dark:bg-slate-950' }, nodes: { content: [
        { type: 'DynamicCategoryCircles', props: { title: 'التصنيفات الشائعة', parentId: 'main' } }
      ]}},
      { type: 'PaddingWrapper', props: { padding: 'py-8', bgColor: 'bg-slate-50 dark:bg-slate-900' }, nodes: { content: [
        { type: 'DynamicProductGrid', props: { title: 'المنتجات المميزة', filterType: 'newest', limit: 10, layoutStyle: 'carousel' } }
      ]}}
    ],
    root: {}, zones: {}
  };

  await prisma.setting.upsert({
    where: { key: 'saada_modern_template' },
    update: { value: JSON.stringify(modernTemplate) },
    create: { key: 'saada_modern_template', value: JSON.stringify(modernTemplate), type: 'json', group: 'homepage' }
  });

  console.log('Successfully seeded SAADA templates.');
}

main().catch(console.error).finally(() => prisma.$disconnect());
