const { PrismaClient } = require('@prisma/client');
const db = new PrismaClient();

async function main() {
  const article = await db.docArticle.findUnique({
    where: { slug: 'seller-kyc-guide' }
  });
  console.log('Article details:', JSON.stringify({
    title: article.title,
    titleEn: article.titleEn,
    category: article.category,
    content: article.content.substring(0, 500) + '...',
  }, null, 2));
  process.exit(0);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
