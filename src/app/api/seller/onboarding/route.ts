import { auth, getSession } from '@/lib/better-auth';
import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { unlink } from 'fs/promises';
import path from 'path';

async function deleteOldFile(oldUrl: string | null | undefined, newUrl: string | null | undefined) {
  if (!oldUrl || !newUrl || oldUrl === newUrl) return;
  if (!oldUrl.startsWith('/api/files/')) return;
  try {
    const fileName = oldUrl.replace('/api/files/', '');
    const uploadDir = process.env.UPLOAD_DIR || path.join(process.cwd(), '..', 'ChariDay_uploads');
    const filePath = path.join(uploadDir, fileName);
    await unlink(filePath);
    console.log('[cleanup] Deleted old document:', filePath);
  } catch (err) {
    console.warn('[cleanup] Failed to delete old file:', oldUrl, err);
  }
}

const ALLOWED_FIELDS = [
  'entityType',
  'companyName',
  'countryOfRegistration',
  'country',
  'state',
  'companyAddress',
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
  'ccpNumber',
  'ccpCle',
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

    // Fetch existing record to check for old files to delete
    const existing = await db.storeVerification.findUnique({
      where: { userId }
    });

    if (existing) {
      if (dataToSave.commercialRegisterFile && existing.commercialRegisterFile) {
        await deleteOldFile(existing.commercialRegisterFile, dataToSave.commercialRegisterFile);
      }
      if (dataToSave.bankLetterFile && existing.bankLetterFile) {
        await deleteOldFile(existing.bankLetterFile, dataToSave.bankLetterFile);
      }
      if (dataToSave.powerOfAttorneyFile && existing.powerOfAttorneyFile) {
        await deleteOldFile(existing.powerOfAttorneyFile, dataToSave.powerOfAttorneyFile);
      }
      if (dataToSave.vatCertificateFile && existing.vatCertificateFile) {
        await deleteOldFile(existing.vatCertificateFile, dataToSave.vatCertificateFile);
      }
      
      // Detect RIB/Bank Details Changes
      const ribChanged = 
        (dataToSave.ccpNumber && dataToSave.ccpNumber !== existing.ccpNumber) ||
        (dataToSave.ccpCle && dataToSave.ccpCle !== existing.ccpCle) ||
        (dataToSave.iban && dataToSave.iban !== existing.iban);

      if (ribChanged && existing.verificationStatus === 'approved') {
        // Force re-verification
        dataToSave.verificationStatus = 'pending';
        // Log the change to trigger 24h/48h withdrawal freeze
        await db.auditLog.create({
          data: {
            userId,
            action: 'rib_changed',
            details: JSON.stringify({
              old: {
                ccpNumber: existing.ccpNumber,
                ccpCle: existing.ccpCle,
                iban: existing.iban
              },
              new: {
                ccpNumber: dataToSave.ccpNumber,
                ccpCle: dataToSave.ccpCle,
                iban: dataToSave.iban
              }
            })
          }
        });
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

    if (dataToSave.verificationStatus === 'pending') {
      // Update the user's account status in the database to pending
      await db.user.update({
        where: { id: userId },
        data: { accountStatus: 'pending' }
      });

      const superAdmins = await db.user.findMany({
        where: { role: { in: ['admin', 'SUPER_ADMIN', 'super_admin'] } },
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
