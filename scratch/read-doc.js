const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const doc = await prisma.docArticle.findUnique({
    where: { slug: 'seller-kyc-guide' }
  });
  if (!doc) {
    console.log('Doc not found');
  } else {
    console.log('--- AR CONTENT ---');
    console.log(doc.content);
    console.log('--- EN CONTENT ---');
    console.log(doc.contentEn);
    console.log('--- TRANSLATIONS (FR etc) ---');
    console.log(JSON.stringify(doc.translations, null, 2));
  }
  process.exit(0);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
