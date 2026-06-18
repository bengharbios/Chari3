import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const update = await request.json();

    if (update.message) {
      const chatId = update.message.chat.id;

      // 1. If user shared their contact
      if (update.message.contact) {
        const contact = update.message.contact;
        
        // Security check: ensure the contact belongs to the sender
        if (contact.user_id !== update.message.from.id) {
          await sendTelegramMessage(chatId, 'عذراً، يجب مشاركة رقم هاتفك الخاص بك عبر الزر المخصص أسفل الشاشة.');
          return NextResponse.json({ success: true });
        }

        // Normalize the phone number (add + if missing)
        let phone = contact.phone_number;
        if (!phone.startsWith('+')) phone = '+' + phone;

        // Check if there is an active OTP for this phone in the DB
        const tokenEntry = await db.verificationToken.findFirst({
          where: {
            identifier: phone,
            expires: { gt: new Date() }
          },
          orderBy: { expires: 'desc' }
        });

        if (tokenEntry) {
          // Success! Send the code
          await sendTelegramMessage(chatId, `تم التحقق بنجاح! ✅\n\nرمز الدخول الخاص بك هو:\n*${tokenEntry.token}*\n\nالرمز صالح لمدة 5 دقائق.`, true); 
        } else {
          // No active OTP
          await sendTelegramMessage(chatId, `عذراً، لم أجد أي طلب تسجيل دخول نشط للرقم ${phone}.\nيرجى طلب رمز جديد من الموقع ثم المحاولة.`);
        }
        return NextResponse.json({ success: true });
      }

      // 2. If user sent a text message (like /start)
      if (update.message.text) {
        await sendContactRequest(chatId, 'مرحباً بك في ChariDay! 🚀\n\nلحماية حسابك والتحقق من هويتك، يرجى الضغط على زر **"📱 مشاركة رقم الهاتف"** بالأسفل 👇');
        return NextResponse.json({ success: true });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Telegram Webhook] Error:', error);
    return NextResponse.json({ success: true });
  }
}

async function sendTelegramMessage(chatId: string | number, text: string, removeKeyboard = false) {
  try {
    const setting = await db.systemSetting.findUnique({ where: { key: 'otp_telegram_bot_token' } });
    if (!setting || !setting.value) return;

    const body: any = {
      chat_id: chatId,
      text: text,
      parse_mode: 'Markdown',
    };

    if (removeKeyboard) {
      body.reply_markup = { remove_keyboard: true };
    }

    await fetch(`https://api.telegram.org/bot${setting.value}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  } catch (error) {
    console.error('[Telegram Webhook] Error sending message:', error);
  }
}

async function sendContactRequest(chatId: string | number, text: string) {
  try {
    const setting = await db.systemSetting.findUnique({ where: { key: 'otp_telegram_bot_token' } });
    if (!setting || !setting.value) return;

    await fetch(`https://api.telegram.org/bot${setting.value}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: text,
        parse_mode: 'Markdown',
        reply_markup: {
          keyboard: [[{ text: '📱 مشاركة رقم الهاتف', request_contact: true }]],
          resize_keyboard: true,
          one_time_keyboard: true
        }
      }),
    });
  } catch (error) {
    console.error('[Telegram Webhook] Error sending contact request:', error);
  }
}
