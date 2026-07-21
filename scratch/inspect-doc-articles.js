const { PrismaClient } = require('@prisma/client');
const db = new PrismaClient();

async function main() {
  const articles = await db.docArticle.findMany({
    select: {
      id: true,
      title: true,
      slug: true,
      category: true,
    }
  });
  console.log('Existing Articles:', JSON.stringify(articles, null, 2));
  process.exit(0);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
