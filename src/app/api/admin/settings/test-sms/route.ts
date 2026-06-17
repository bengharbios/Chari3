import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 403 });
    }

    const { url, token, template, phone } = await req.json();

    if (!url || !phone) {
      return NextResponse.json({ success: false, error: 'Missing Webhook URL or Phone Number' }, { status: 400 });
    }

    const otpCode = '123456';
    const rawTemplate = template || 'رمز التحقق الخاص بك هو: {otp} (صالح لمدة 5 دقائق)';
    const smsText = rawTemplate.replace('{otp}', otpCode);

    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) {
      headers['Authorization'] = token.startsWith('Basic ') || token.startsWith('Bearer ')
        ? token
        : `Bearer ${token}`;
    }

    const urlObj = new URL(url);
    urlObj.searchParams.set('to', phone);
    urlObj.searchParams.set('message', smsText);

    const gwRes = await fetch(urlObj.toString(), {
      method: 'POST',
      headers,
      body: JSON.stringify({
        to: phone,
        phone: phone, // For Capcom6
        message: smsText,
        otp: otpCode,
        type: 'SMS Test',
        phoneNumbers: [phone] // Capcom6 new spec
      })
    });

    if (!gwRes.ok) {
      const errorText = await gwRes.text();
      return NextResponse.json({ success: false, error: `Gateway Error (${gwRes.status}): ${errorText}` }, { status: 400 });
    }

    return NextResponse.json({ success: true, message: 'Test SMS request sent successfully!' });
  } catch (error: any) {
    console.error('[TEST_SMS_ERROR]', error);
    return NextResponse.json({ success: false, error: error.message || 'Failed to connect to Custom SMS Gateway' }, { status: 500 });
  }
}
