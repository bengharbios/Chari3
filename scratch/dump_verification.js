const { PrismaClient } = require('@prisma/client');
const db = new PrismaClient();

async function run() {
  const user = await db.user.findUnique({
    where: { email: 'abdelkader.rapidline@gmail.com' },
    include: { storeVerification: true }
  });

  if (!user) {
    console.log("User not found");
    return;
  }

  console.log("StoreVerification record for abdelkader:");
  console.log(JSON.stringify(user.storeVerification, null, 2));
  await db.$disconnect();
}

run();
