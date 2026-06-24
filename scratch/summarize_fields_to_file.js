const { PrismaClient } = require('@prisma/client');
const db = new PrismaClient();
const fs = require('fs');

async function run() {
  const user = await db.user.findUnique({
    where: { email: 'abdelkader.rapidline@gmail.com' },
    include: { storeVerification: true }
  });

  if (!user || !user.storeVerification) {
    fs.writeFileSync('scratch/fields_output.txt', "User or verification not found");
    await db.$disconnect();
    return;
  }

  const sv = user.storeVerification;
  let out = "FIELDS STATUS:\n";
  for (const [key, val] of Object.entries(sv)) {
    out += `- ${key}: ${val !== null && val !== undefined ? (typeof val === 'object' ? JSON.stringify(val) : val) : 'NULL/EMPTY'}\n`;
  }
  fs.writeFileSync('scratch/fields_output.txt', out);
  console.log("Written to scratch/fields_output.txt");
  await db.$disconnect();
}

run();
