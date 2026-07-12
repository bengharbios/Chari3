const { PrismaClient } = require('@prisma/client');
const db = new PrismaClient();

async function run() {
  try {
    const tokens = await db.verificationToken.findMany({
      orderBy: { expires: 'desc' },
      take: 5
    });
    console.log('\n--- LATEST OTP TOKENS ---');
    tokens.forEach(t => {
      console.log(`Email/Phone: ${t.identifier} | Code: ${t.token} | Expires: ${new Date(t.expires).toLocaleString()}`);
    });
    console.log('-------------------------\n');
  } catch (error) {
    console.error(error);
  } finally {
    await db.$disconnect();
  }
}

run();
