const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const setting = await prisma.systemSetting.findUnique({ where: { key: 'otp_telegram_bot_token' } });
  if (!setting || !setting.value) {
    console.log('Bot token not found in DB!');
    return;
  }
  const token = setting.value;
  const webhookUrl = `https://chariday.com/api/webhooks/telegram`;
  
  const res = await fetch(`https://api.telegram.org/bot${token}/setWebhook?url=${webhookUrl}`);
  const data = await res.json();
  console.log('Webhook registration response:', data);
}
main().catch(console.error).finally(() => prisma.$disconnect());
