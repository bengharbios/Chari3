const { PrismaClient } = require('@prisma/client');
const db = new PrismaClient();

async function run() {
  const user = await db.user.findUnique({
    where: { email: 'abdelkader.rapidline@gmail.com' },
    include: { storeVerification: true }
  });

  if (!user || !user.storeVerification) {
    console.log("User or verification not found");
    return;
  }

  const sv = user.storeVerification;
  console.log("FIELDS STATUS:");
  for (const [key, val] of Object.entries(sv)) {
    console.log(`- ${key}: ${val ? (typeof val === 'string' && val.startsWith('http') ? 'URL (' + val.substring(0, 30) + '...)' : (typeof val === 'object' ? JSON.stringify(val).substring(0, 50) : val)) : 'NULL/EMPTY'}`);
  }
  await db.$disconnect();
}

run();
