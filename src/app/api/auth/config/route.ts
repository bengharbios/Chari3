import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Only fetch public-facing settings
    const settings = await db.systemSetting.findMany({
      where: {
        key: { in: ['auth_captcha_enabled', 'auth_captcha_site_key', 'auth_allow_phone_skip', 'otp_telegram_enabled'] }
      }
    });

    const settingsMap = settings.reduce((acc, s) => ({ ...acc, [s.key]: s.value }), {} as Record<string, string>);

    return NextResponse.json({
      success: true,
      config: {
        captchaEnabled: settingsMap.auth_captcha_enabled === 'true',
        captchaSiteKey: settingsMap.auth_captcha_site_key || '',
        allowPhoneSkip: settingsMap.auth_allow_phone_skip !== 'false',
        telegramEnabled: settingsMap.otp_telegram_enabled === 'true',
      }
    });
  } catch (error) {
    console.error('[auth-config] Error:', error);
    return NextResponse.json(
      { success: false, config: { captchaEnabled: false, captchaSiteKey: '', allowPhoneSkip: true, telegramEnabled: false } },
      { status: 500 }
    );
  }
}
