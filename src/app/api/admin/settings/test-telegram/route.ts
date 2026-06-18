import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
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
      return NextResponse.json({
        success: true,
        message: 'Bot connected successfully!',
        botName: data.result.first_name,
        botUsername: data.result.username,
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
