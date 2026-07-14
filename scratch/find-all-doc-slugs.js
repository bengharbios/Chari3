const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const articles = await prisma.docArticle.findMany({
    select: {
      slug: true,
      title: true
    }
  });
  console.log('All Doc Slugs:');
  console.log(articles);
  process.exit(0);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
