import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const update = await request.json();

    // Log for debugging
    console.log('[Telegram Webhook] Received update:', JSON.stringify(update, null, 2));

    // Ensure it's a message
    if (update.message && update.message.text) {
      const text = update.message.text.trim();
      const chatId = update.message.chat.id;

      // Handle the /start command which contains the OTP payload
      if (text.startsWith('/start ')) {
        const payload = text.split(' ')[1];

        // Ensure the payload is a valid 6-digit code
        if (/^\d{6}$/.test(payload)) {
          // Send the OTP back to the user
          await sendTelegramMessage(chatId, `مرحباً بك في ChariDay! 🚀\n\nرمز الدخول الخاص بك هو:\n*${payload}*\n\nالرمز صالح لمدة 5 دقائق.`);
          return NextResponse.json({ success: true });
        }
      }

      // Default response for any other message
      await sendTelegramMessage(chatId, `مرحباً بك في ChariDay! 👋\nعذراً، هذا البوت مخصص فقط لإرسال رموز التحقق (OTP) الخاصة بالمنصة.`);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Telegram Webhook] Error:', error);
    // Always return 200 to Telegram so they don't retry endlessly
    return NextResponse.json({ success: true });
  }
}

// Helper function to send messages
async function sendTelegramMessage(chatId: string | number, text: string) {
  try {
    // Get the bot token from the database
    const setting = await db.systemSetting.findUnique({
      where: { key: 'otp_telegram_bot_token' }
    });

    if (!setting || !setting.value) {
      console.error('[Telegram Webhook] Bot token not found in settings');
      return;
    }

    const token = setting.value;
    const url = `https://api.telegram.org/bot${token}/sendMessage`;

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: text,
        parse_mode: 'Markdown',
      }),
    });

    if (!res.ok) {
      console.error('[Telegram Webhook] Failed to send message:', await res.text());
    }
  } catch (error) {
    console.error('[Telegram Webhook] Error sending message:', error);
  }
}
