import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Only fetch public-facing settings
    const settings = await db.systemSetting.findMany({
      where: {
        key: { in: ['auth_captcha_enabled', 'auth_captcha_site_key', 'auth_allow_phone_skip'] }
      }
    });

    const settingsMap = settings.reduce((acc, s) => ({ ...acc, [s.key]: s.value }), {} as Record<string, string>);

    return NextResponse.json({
      success: true,
      config: {
        captchaEnabled: settingsMap.auth_captcha_enabled !== 'false',
        captchaSiteKey: settingsMap.auth_captcha_site_key || '',
        allowPhoneSkip: settingsMap.auth_allow_phone_skip !== 'false',
      }
    });
  } catch (error) {
    console.error('[auth-config] Error:', error);
    return NextResponse.json(
      { success: false, config: { captchaEnabled: false, captchaSiteKey: '', allowPhoneSkip: true } },
      { status: 500 }
    );
  }
}
