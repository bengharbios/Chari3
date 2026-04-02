import { NextResponse } from 'next/server';
import { validatePhone, validateEmail } from '@/lib/validators';
import { checkRateLimit } from '@/lib/rate-limiter';
import { generateOTP } from '@/lib/otp-store';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { method, value, countryCode } = body;

    // ── Validate required fields ──
    if (!method || !value) {
      return NextResponse.json(
        { success: false, message: 'Method and value are required' },
        { status: 400 }
      );
    }

    if (method !== 'phone' && method !== 'email') {
      return NextResponse.json(
        { success: false, message: 'Method must be "phone" or "email"' },
        { status: 400 }
      );
    }

    // ── Validate format based on method ──
    if (method === 'phone') {
      if (!validatePhone(value)) {
        return NextResponse.json(
          {
            success: false,
            message: 'Invalid phone number format. Please enter a valid phone number.',
          },
          { status: 400 }
        );
      }
    } else {
      if (!validateEmail(value)) {
        return NextResponse.json(
          { success: false, message: 'Invalid email address format' },
          { status: 400 }
        );
      }
    }

    // ── Rate limit: max 3 requests per minute per identifier ──
    const rateLimitKey = `otp-send:${method}:${value}`;
    const rateCheck = checkRateLimit(rateLimitKey, 3, 60_000);

    if (!rateCheck.allowed) {
      return NextResponse.json(
        {
          success: false,
          message: `Too many requests. Please try again in ${Math.ceil(rateCheck.retryAfterMs / 1000)} seconds.`,
          retryAfterMs: rateCheck.retryAfterMs,
        },
        { status: 429 }
      );
    }

    // ── Generate OTP ──
    const otpCode = generateOTP(value, method);

    // ── Log the OTP for testing (no real SMS/email service yet) ──
    console.log(`[OTP] ${method.toUpperCase()} OTP for ${value}: ${otpCode}`);

    return NextResponse.json({
      success: true,
      message: 'OTP sent successfully',
      expiresIn: 300,
      // Include the code for testing (no real SMS/email service configured yet)
      _devCode: otpCode,
    });
  } catch (error) {
    console.error('[send-otp] Error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
