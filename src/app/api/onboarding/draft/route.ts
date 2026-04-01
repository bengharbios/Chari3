import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// ============================================
// GET /api/onboarding/draft?userId=xxx
// Loads saved draft data from DB to resume onboarding
// ============================================

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'userId is required' },
        { status: 400 }
      );
    }

    const user = await db.user.findUnique({
      where: { id: userId },
      select: { id: true, role: true, accountStatus: true },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    const data: Record<string, unknown> = { role: user.role, hasDraft: false };

    switch (user.role) {
      case 'store_manager': {
        const v = await db.storeVerification.findUnique({
          where: { userId },
        });
        if (v && (!v.submittedAt || v.verificationStatus === 'rejected')) {
          data.hasDraft = true;
          data.step = inferStep('store_manager', v);
          data.commercialRegisterNumber = v.commercialRegisterNumber;
          data.commercialRegisterFile = v.commercialRegisterFile;
          data.iban = v.iban;
          data.beneficiaryName = v.beneficiaryName;
          data.bankLetterFile = v.bankLetterFile;
          data.idFrontFile = v.managerIdFront;
          data.idBackFile = v.managerIdBack;
        }
        break;
      }

      case 'seller': {
        const v = await db.freelancerVerification.findUnique({
          where: { userId },
        });
        if (v && (!v.submittedAt || v.verificationStatus === 'rejected')) {
          data.hasDraft = true;
          data.step = inferStep('seller', v);
          data.freelanceDocumentFile = v.freelanceDocFile;
          data.freelancerIdFrontFile = v.nationalIdFront;
          data.freelancerIdBackFile = v.nationalIdBack;
          data.freelancerIban = v.iban;
          data.livenessCompleted = (v.livenessScore ?? 0) > 0;
        }
        break;
      }

      case 'supplier': {
        const v = await db.supplierVerification.findUnique({
          where: { userId },
        });
        if (v && (!v.submittedAt || v.verificationStatus === 'rejected')) {
          data.hasDraft = true;
          data.step = inferStep('supplier', v);
          data.commercialLicenseFile = v.commercialLicense;
          data.importLicenseFile = v.importLicense;
          data.supplierIban = v.iban;
        }
        break;
      }

      case 'logistics': {
        const v = await db.logisticsVerification.findUnique({
          where: { userId },
        });
        if (v && (!v.submittedAt || v.verificationStatus === 'rejected')) {
          data.hasDraft = true;
          data.step = inferStep('logistics', v);
          data.transportLicenseFile = v.transportLicenseFile;
          data.insuranceCertificateFile = v.insuranceCertificateFile;
          data.numberOfVehicles = v.numberOfVehicles;
          data.numberOfDrivers = v.numberOfDrivers;
          data.logisticsIban = v.iban;
        }
        break;
      }
    }

    return NextResponse.json({ success: true, ...data });
  } catch (error) {
    console.error('[draft load] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to load draft' },
      { status: 500 }
    );
  }
}

// ============================================
// POST /api/onboarding/draft
// Saves onboarding progress as a draft (partial data) to DB
// ============================================

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, role, step } = body;

    if (!userId || !role) {
      return NextResponse.json(
        { success: false, error: 'userId and role are required' },
        { status: 400 }
      );
    }

    // Client sends file URLs from /api/upload (e.g. "/api/files/{uuid}.jpg::filename")
    // Only URL is stored in DB — actual file saved to disk by upload endpoint

    const user = await db.user.findUnique({
      where: { id: userId },
      select: { id: true, role: true, accountStatus: true },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    switch (role) {
      case 'store_manager': {
        await db.storeVerification.upsert({
          where: { userId },
          create: {
            userId,
            commercialRegisterNumber: body.commercialRegisterNumber || undefined,
            commercialRegisterFile: body.commercialRegisterFile || undefined,
            iban: body.iban || undefined,
            beneficiaryName: body.beneficiaryName || undefined,
            bankLetterFile: body.bankLetterFile || undefined,
            managerIdFront: body.idFrontFile || undefined,
            managerIdBack: body.idBackFile || undefined,
          },
          update: {
            commercialRegisterNumber: body.commercialRegisterNumber || undefined,
            commercialRegisterFile: body.commercialRegisterFile || undefined,
            iban: body.iban || undefined,
            beneficiaryName: body.beneficiaryName || undefined,
            bankLetterFile: body.bankLetterFile || undefined,
            managerIdFront: body.idFrontFile || undefined,
            managerIdBack: body.idBackFile || undefined,
          },
        });
        break;
      }

      case 'seller': {
        await db.freelancerVerification.upsert({
          where: { userId },
          create: {
            userId,
            freelanceDocFile: body.freelanceDocumentFile || undefined,
            nationalIdFront: body.freelancerIdFrontFile || undefined,
            nationalIdBack: body.freelancerIdBackFile || undefined,
            iban: body.freelancerIban || undefined,
            selfieUrls: body.livenessCompleted ? JSON.stringify(['__UPLOADED__']) : undefined,
            livenessScore: body.livenessCompleted ? 0.85 : undefined,
          },
          update: {
            freelanceDocFile: body.freelanceDocumentFile || undefined,
            nationalIdFront: body.freelancerIdFrontFile || undefined,
            nationalIdBack: body.freelancerIdBackFile || undefined,
            iban: body.freelancerIban || undefined,
            selfieUrls: body.livenessCompleted ? JSON.stringify(['__UPLOADED__']) : undefined,
            livenessScore: body.livenessCompleted ? 0.85 : undefined,
          },
        });
        break;
      }

      case 'supplier': {
        await db.supplierVerification.upsert({
          where: { userId },
          create: {
            userId,
            commercialLicense: body.commercialLicenseFile || undefined,
            importLicense: body.importLicenseFile || undefined,
            iban: body.supplierIban || undefined,
          },
          update: {
            commercialLicense: body.commercialLicenseFile || undefined,
            importLicense: body.importLicenseFile || undefined,
            iban: body.supplierIban || undefined,
          },
        });
        break;
      }

      case 'logistics': {
        await db.logisticsVerification.upsert({
          where: { userId },
          create: {
            userId,
            transportLicenseFile: body.transportLicenseFile || undefined,
            insuranceCertificateFile: body.insuranceCertificateFile || undefined,
            numberOfVehicles: body.numberOfVehicles || undefined,
            numberOfDrivers: body.numberOfDrivers || undefined,
            iban: body.logisticsIban || undefined,
          },
          update: {
            transportLicenseFile: body.transportLicenseFile || undefined,
            insuranceCertificateFile: body.insuranceCertificateFile || undefined,
            numberOfVehicles: body.numberOfVehicles || undefined,
            numberOfDrivers: body.numberOfDrivers || undefined,
            iban: body.logisticsIban || undefined,
          },
        });
        break;
      }

      default:
        break;
    }

    // Audit log — best-effort, don't fail draft save if this fails
    try {
      await db.auditLog.create({
        data: {
          userId,
          action: 'draft_saved',
          details: JSON.stringify({ role, step: step || 0 }),
        },
      });
    } catch (auditErr) {
      console.warn('[draft save] Audit log failed (non-blocking):', auditErr);
    }

    return NextResponse.json({ success: true, saved: true });
  } catch (error) {
    console.error('[draft save] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to save draft' },
      { status: 500 }
    );
  }
}

// ============================================
// Helper: infer the last step user was on based on filled fields
// ============================================

function inferStep(
  role: string,
  v: Record<string, unknown>
): number {
  switch (role) {
    case 'store_manager': {
      // Steps: 0=legal(commercial+id), 1=financial(iban+bank), 2=review
      if (v.iban && v.beneficiaryName && v.bankLetterFile) return 2;
      if (v.commercialRegisterNumber && v.commercialRegisterFile) return 1;
      return 0;
    }
    case 'seller': {
      // Steps: 0=optional(freelance doc), 1=identity(id+selfie), 2=financial(iban)
      if (v.iban) return 2;
      if (v.nationalIdFront && v.nationalIdBack && (v.livenessScore ?? 0) > 0) return 2;
      if (v.nationalIdFront && v.nationalIdBack) return 1;
      if (v.freelanceDocFile) return 1;
      return 0;
    }
    case 'supplier': {
      // Steps: 0=licenses, 1=financial(iban)
      if (v.iban) return 1;
      if (v.commercialLicense) return 1;
      return 0;
    }
    case 'logistics': {
      // Steps: 0=licenses+fleet, 1=financial(iban)
      if (v.iban) return 1;
      if (v.transportLicenseFile && v.insuranceCertificateFile) return 1;
      if (v.transportLicenseFile) return 0;
      return 0;
    }
    default:
      return 0;
  }
}
