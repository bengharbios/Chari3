import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import nodemailer from 'nodemailer';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 403 });
    }

    const { host, port, user, pass, from } = await req.json();

    if (!host || !port || !user || !pass || !from) {
      return NextResponse.json({ success: false, error: 'Missing SMTP credentials' }, { status: 400 });
    }

    const transporter = nodemailer.createTransport({
      host: host,
      port: Number(port),
      secure: Number(port) === 465, // true for 465, false for other ports
      auth: {
        user: user,
        pass: pass,
      },
    });

    // Verify connection configuration
    await transporter.verify();

    // Send a test email to the same 'user' email (or admin's email)
    const info = await transporter.sendMail({
      from: from,
      to: user, // Send to themselves for testing
      subject: 'ChariDay - Test SMTP Connection',
      text: 'Congratulations! Your SMTP connection to ChariDay is working perfectly.',
      html: '<p>Congratulations! Your SMTP connection to <strong>ChariDay</strong> is working perfectly.</p>',
    });

    return NextResponse.json({ success: true, message: 'Connection successful. Test email sent!' });
  } catch (error: any) {
    console.error('[TEST_SMTP_ERROR]', error);
    return NextResponse.json({ success: false, error: error.message || 'Failed to connect to SMTP server' }, { status: 500 });
  }
}
