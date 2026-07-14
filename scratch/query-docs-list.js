const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const articles = await prisma.docArticle.findMany({
    select: {
      id: true,
      slug: true,
      title: true,
      content: true
    }
  });
  console.log('Doc Articles:');
  console.log(JSON.stringify(articles, null, 2));
  process.exit(0);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
