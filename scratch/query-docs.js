const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('--- Fetching all docs from DB ---');
  const docs = await prisma.docArticle.findMany();
  console.log('Total Docs:', docs.length);
  docs.forEach(d => {
    console.log(`- ID: ${d.id}, Slug: ${d.slug}, Title: ${d.title}, Category: ${d.category}`);
  });
  process.exit(0);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
