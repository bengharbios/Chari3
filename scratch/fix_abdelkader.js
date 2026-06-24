const { PrismaClient } = require('@prisma/client');
const db = new PrismaClient();

async function run() {
  console.log("Updating accountStatus to 'pending' for user abdelkader.rapidline@gmail.com...");
  try {
    const updated = await db.user.update({
      where: { email: 'abdelkader.rapidline@gmail.com' },
      data: { accountStatus: 'pending' }
    });
    console.log("Success! Updated user:", {
      id: updated.id,
      email: updated.email,
      accountStatus: updated.accountStatus,
    });
  } catch (error) {
    console.error("Error updating user:", error);
  } finally {
    await db.$disconnect();
  }
}

run();
