import { auth } from '@/lib/better-auth';
import { headers } from 'next/headers';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const { token } = await request.json();

    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Telegram Bot Token is required' },
        { status: 400 }
      );
    }

    const url = `https://api.telegram.org/bot${token}/getMe`;
    const response = await fetch(url);
    const data = await response.json();

    if (data.ok && data.result) {
      // Automatically register the webhook if not on localhost
      const host = request.headers.get('host') || '';
      const protocol = host.includes('localhost') ? 'http' : 'https';
      
      let webhookStatus = 'Not registered (localhost)';
      if (!host.includes('localhost')) {
        const webhookUrl = `${protocol}://${host}/api/webhooks/telegram`;
        const setWebhookRes = await fetch(`https://api.telegram.org/bot${token}/setWebhook?url=${webhookUrl}`);
        const webhookData = await setWebhookRes.json();
        if (webhookData.ok) {
          webhookStatus = 'Registered automatically';
        } else {
          webhookStatus = `Failed to register: ${webhookData.description}`;
        }
      }

      return NextResponse.json({
        success: true,
        message: 'Bot connected successfully!',
        botName: data.result.first_name,
        botUsername: data.result.username,
        webhookStatus
      });
    } else {
      return NextResponse.json(
        { success: false, message: data.description || 'Invalid Telegram Bot Token' },
        { status: 400 }
      );
    }
  } catch (error: any) {
    console.error('[test-telegram] Error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to connect to Telegram' },
      { status: 500 }
    );
  }
}
