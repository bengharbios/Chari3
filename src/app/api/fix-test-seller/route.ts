import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const targetEmail = 'test-seller2@chari3.com';
    
    // Find user
    const user = await db.user.findUnique({
      where: { email: targetEmail }
    });

    if (!user) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }

    // Update user accountStatus to 'incomplete'
    await db.user.update({
      where: { id: user.id },
      data: { accountStatus: 'incomplete' }
    });

    // Update storeVerification to 'incomplete' and remove submittedAt
    await db.storeVerification.update({
      where: { userId: user.id },
      data: { 
        verificationStatus: 'incomplete',
        submittedAt: null 
      }
    });

    return NextResponse.json({
      success: true,
      message: `Successfully reset user ${targetEmail} and their store verification to incomplete draft status.`
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
