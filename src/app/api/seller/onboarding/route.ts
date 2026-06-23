import { auth, getSession } from '@/lib/better-auth';
import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

const ALLOWED_FIELDS = [
  'entityType',
  'companyName',
  'countryOfRegistration',
  'issueAuthority',
  'commercialRegisterNumber',
  'issueDate',
  'expiryDate',
  'commercialRegisterFile',
  'hasVat',
  'vatNumber',
  'vatCertificateFile',
  'bankName',
  'iban',
  'swiftCode',
  'beneficiaryName',
  'isBeneficiaryMatching',
  'bankLetterFile',
  'signatoryName',
  'signatoryEmail',
  'isLegalOwner',
  'powerOfAttorneyFile',
  'managerIdFront',
  'managerIdBack',
  'extractedIdData',
  'agreedToTerms',
  'agreedAt',
  'verificationStatus',
  'rejectionReasons',
  'adminNotes',
  'reviewedBy',
  'reviewedAt',
  'submittedAt'
];

export async function POST(req: Request) {
  try {
    const session = await getSession(await headers());
    const body = await req.json();
    const url = new URL(req.url);
    const userId = session?.user?.id || url.searchParams.get('userId') || body.userId;

    if (!userId) {
      return NextResponse.json({ success: false, error: 'Unauthorized or missing userId' }, { status: 401 });
    }

    // Sanitize data to only include valid StoreVerification schema fields
    const rawData = body.data || {};
    const dataToSave: Record<string, any> = {};
    
    for (const key of ALLOWED_FIELDS) {
      if (rawData[key] !== undefined) {
        // Convert date strings to Date objects for database compatibility
        if (['issueDate', 'expiryDate', 'agreedAt', 'reviewedAt', 'submittedAt'].includes(key) && rawData[key]) {
          dataToSave[key] = new Date(rawData[key]);
        } else {
          dataToSave[key] = rawData[key];
        }
      }
    }

    const updated = await db.storeVerification.upsert({
      where: { userId },
      update: {
        ...dataToSave,
        updatedAt: new Date(),
      },
      create: {
        userId,
        ...dataToSave
      }
    });

    if (dataToSave.submittedAt || dataToSave.verificationStatus === 'pending') {
      const superAdmins = await db.user.findMany({
        where: { role: 'super_admin' },
        select: { id: true }
      });
      
      const adminNotifications = superAdmins.map(admin => ({
        userId: admin.id,
        type: 'NEW_VERIFICATION_SUBMISSION',
        title: 'طلب توثيق جديد',
        titleEn: 'New Verification Request',
        body: `تم تقديم طلب توثيق جديد بواسطة ${session?.user?.name || userId}. يرجى مراجعته.`,
        bodyEn: `A new verification request has been submitted by ${session?.user?.name || userId}. Please review it.`,
      }));

      if (adminNotifications.length > 0) {
        await db.notification.createMany({
          data: adminNotifications
        });
      }
    }

    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    console.error('Onboarding POST error:', error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const session = await getSession(await headers());
    const url = new URL(req.url);
    const userId = session?.user?.id || url.searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ success: false, error: 'Unauthorized or missing userId' }, { status: 401 });
    }
    const verification = await db.storeVerification.findUnique({
      where: { userId }
    });

    return NextResponse.json({ success: true, data: verification });
  } catch (error: any) {
    console.error('Onboarding GET error:', error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
