const { PrismaClient } = require('@prisma/client');
const db = new PrismaClient();

async function main() {
  const articles = await db.docArticle.findMany({
    select: {
      id: true,
      title: true,
      titleEn: true,
      slug: true,
      category: true,
      sortOrder: true,
      isPublished: true
    }
  });
  console.log('DocArticles in DB:', JSON.stringify(articles, null, 2));
}

main().catch(console.error).finally(() => db.$disconnect());
