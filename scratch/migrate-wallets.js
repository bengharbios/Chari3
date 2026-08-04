const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Fetching all current wallets...');
  const wallets = await prisma.wallet.findMany();
  
  if (wallets.length === 0) {
    console.log('No wallets to archive.');
    return;
  }
  
  console.log(`Found ${wallets.length} wallets. Archiving to LegacyWalletSnapshot...`);
  
  let count = 0;
  for (const wallet of wallets) {
    await prisma.legacyWalletSnapshot.create({
      data: {
        walletId: wallet.id,
        userId: wallet.userId,
        balance: wallet.balance,
        pendingBalance: wallet.pendingBalance,
        availableBalance: wallet.availableBalance,
        debt: wallet.debt,
        totalEarned: wallet.totalEarned,
        notes: "Pre-Ledger Architecture Migration Snapshot"
      }
    });
    count++;
  }
  
  console.log(`Successfully archived ${count} wallets.`);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
