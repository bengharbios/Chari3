import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// ============================================
// Helper: Build verification items for a role
// ============================================

type ItemStatus = 'verified' | 'pending' | 'rejected' | 'required';

interface VerificationItemResponse {
  key: string;
  labelAr: string;
  labelEn: string;
  status: ItemStatus;
}

function buildStoreItems(data: {
  commercialRegisterNumber?: string | null;
  commercialRegisterFile?: string | null;
  iban?: string | null;
  beneficiaryName?: string | null;
  bankLetterFile?: string | null;
  managerIdFront?: string | null;
  managerIdBack?: string | null;
  verificationStatus?: string;
  rejectionReasons?: string | null;
}): VerificationItemResponse[] {
  const isRejected = data.verificationStatus === 'rejected';
  let rejectedFields: string[] = [];
  if (isRejected && data.rejectionReasons) {
    try { rejectedFields = JSON.parse(data.rejectionReasons); } catch { /* ignore */ }
  }

  const items: VerificationItemResponse[] = [
    {
      key: 'commercial_register',
      labelAr: 'السجل التجاري',
      labelEn: 'Commercial Register',
      status: 'required',
    },
    {
      key: 'bank_account',
      labelAr: 'الحساب البنكي',
      labelEn: 'Bank Account (IBAN)',
      status: 'required',
    },
    {
      key: 'manager_id',
      labelAr: 'هوية المدير',
      labelEn: 'Manager ID',
      status: 'required',
    },
  ];

  // Mark items based on what's filled
  if (data.commercialRegisterNumber && data.commercialRegisterFile) {
    items[0].status = isRejected && rejectedFields.includes('commercial_register') ? 'rejected' : 'pending';
  }
  if (data.iban && data.beneficiaryName && data.bankLetterFile) {
    items[1].status = isRejected && rejectedFields.includes('bank_account') ? 'rejected' : 'pending';
  }
  if (data.managerIdFront && data.managerIdBack) {
    items[2].status = isRejected && rejectedFields.includes('manager_id') ? 'rejected' : 'pending';
  }

  // If approved, mark all as verified
  if (data.verificationStatus === 'approved') {
    items.forEach(i => { i.status = 'verified'; });
  }

  return items;
}

function buildFreelancerItems(data: {
  freelanceDocFile?: string | null;
  nationalIdFront?: string | null;
  nationalIdBack?: string | null;
  iban?: string | null;
  verificationStatus?: string;
  rejectionReasons?: string | null;
}): VerificationItemResponse[] {
  const isRejected = data.verificationStatus === 'rejected';
  let rejectedFields: string[] = [];
  if (isRejected && data.rejectionReasons) {
    try { rejectedFields = JSON.parse(data.rejectionReasons); } catch { /* ignore */ }
  }

  const items: VerificationItemResponse[] = [
    {
      key: 'national_id',
      labelAr: 'الهوية الوطنية',
      labelEn: 'National ID',
      status: 'required',
    },
    {
      key: 'freelance_document',
      labelAr: 'وثيقة العمل الحر',
      labelEn: 'Freelance Document',
      status: 'required',
    },
    {
      key: 'bank_account',
      labelAr: 'الحساب البنكي',
      labelEn: 'Bank Account (IBAN)',
      status: 'required',
    },
  ];

  if (data.nationalIdFront && data.nationalIdBack) {
    items[0].status = isRejected && rejectedFields.includes('national_id') ? 'rejected' : 'pending';
  }
  if (data.freelanceDocFile) {
    items[1].status = isRejected && rejectedFields.includes('freelance_document') ? 'rejected' : 'pending';
  }
  if (data.iban) {
    items[2].status = isRejected && rejectedFields.includes('bank_account') ? 'rejected' : 'pending';
  }

  if (data.verificationStatus === 'approved') {
    items.forEach(i => { i.status = 'verified'; });
  }

  return items;
}

function buildSupplierItems(data: {
  commercialLicense?: string | null;
  importLicense?: string | null;
  iban?: string | null;
  verificationStatus?: string;
  rejectionReasons?: string | null;
}): VerificationItemResponse[] {
  const isRejected = data.verificationStatus === 'rejected';
  let rejectedFields: string[] = [];
  if (isRejected && data.rejectionReasons) {
    try { rejectedFields = JSON.parse(data.rejectionReasons); } catch { /* ignore */ }
  }

  const items: VerificationItemResponse[] = [
    {
      key: 'commercial_license',
      labelAr: 'الرخصة التجارية',
      labelEn: 'Commercial License',
      status: 'required',
    },
    {
      key: 'import_license',
      labelAr: 'رخصة الاستيراد',
      labelEn: 'Import License',
      status: 'required',
    },
    {
      key: 'bank_account',
      labelAr: 'الحساب البنكي',
      labelEn: 'Bank Account (IBAN)',
      status: 'required',
    },
  ];

  if (data.commercialLicense) {
    items[0].status = isRejected && rejectedFields.includes('commercial_license') ? 'rejected' : 'pending';
  }
  if (data.importLicense) {
    items[1].status = isRejected && rejectedFields.includes('import_license') ? 'rejected' : 'pending';
  }
  if (data.iban) {
    items[2].status = isRejected && rejectedFields.includes('bank_account') ? 'rejected' : 'pending';
  }

  if (data.verificationStatus === 'approved') {
    items.forEach(i => { i.status = 'verified'; });
  }

  return items;
}

function buildLogisticsItems(data: {
  transportLicenseFile?: string | null;
  insuranceCertificateFile?: string | null;
  numberOfVehicles?: string | null;
  numberOfDrivers?: string | null;
  iban?: string | null;
  verificationStatus?: string;
  rejectionReasons?: string | null;
}): VerificationItemResponse[] {
  const isRejected = data.verificationStatus === 'rejected';
  let rejectedFields: string[] = [];
  if (isRejected && data.rejectionReasons) {
    try { rejectedFields = JSON.parse(data.rejectionReasons); } catch { /* ignore */ }
  }

  const items: VerificationItemResponse[] = [
    {
      key: 'transport_license',
      labelAr: 'رخصة النقل',
      labelEn: 'Transport License',
      status: 'required',
    },
    {
      key: 'insurance',
      labelAr: 'شهادة التأمين',
      labelEn: 'Insurance Certificate',
      status: 'required',
    },
    {
      key: 'fleet_info',
      labelAr: 'معلومات الأسطول',
      labelEn: 'Fleet Information',
      status: 'required',
    },
    {
      key: 'bank_account',
      labelAr: 'الحساب البنكي',
      labelEn: 'Bank Account (IBAN)',
      status: 'required',
    },
  ];

  if (data.transportLicenseFile) {
    items[0].status = isRejected && rejectedFields.includes('transport_license') ? 'rejected' : 'pending';
  }
  if (data.insuranceCertificateFile) {
    items[1].status = isRejected && rejectedFields.includes('insurance') ? 'rejected' : 'pending';
  }
  if (data.numberOfVehicles && data.numberOfDrivers) {
    items[2].status = isRejected && rejectedFields.includes('fleet_info') ? 'rejected' : 'pending';
  }
  if (data.iban) {
    items[3].status = isRejected && rejectedFields.includes('bank_account') ? 'rejected' : 'pending';
  }

  if (data.verificationStatus === 'approved') {
    items.forEach(i => { i.status = 'verified'; });
  }

  return items;
}

// ============================================
// GET /api/onboarding?userId=xxx
// ============================================

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'userId query parameter is required' },
        { status: 400 }
      );
    }

    // Get user with verification data
    const user = await db.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        role: true,
        accountStatus: true,
        storeVerification: true,
        freelancerVerification: true,
        supplierVerification: true,
        logisticsVerification: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    let verificationData: Record<string, unknown> | null = null;
    let verificationItems: VerificationItemResponse[] = [];

    switch (user.role) {
      case 'store_manager':
        if (user.storeVerification) {
          verificationData = user.storeVerification as unknown as Record<string, unknown>;
          verificationItems = buildStoreItems({
            commercialRegisterNumber: user.storeVerification.commercialRegisterNumber,
            commercialRegisterFile: user.storeVerification.commercialRegisterFile,
            iban: user.storeVerification.iban,
            beneficiaryName: user.storeVerification.beneficiaryName,
            bankLetterFile: user.storeVerification.bankLetterFile,
            managerIdFront: user.storeVerification.managerIdFront,
            managerIdBack: user.storeVerification.managerIdBack,
            verificationStatus: user.storeVerification.verificationStatus,
            rejectionReasons: user.storeVerification.rejectionReasons,
          });
        }
        break;

      case 'seller':
        if (user.freelancerVerification) {
          verificationData = user.freelancerVerification as unknown as Record<string, unknown>;
          verificationItems = buildFreelancerItems({
            freelanceDocFile: user.freelancerVerification.freelanceDocFile,
            nationalIdFront: user.freelancerVerification.nationalIdFront,
            nationalIdBack: user.freelancerVerification.nationalIdBack,
            iban: user.freelancerVerification.iban,
            verificationStatus: user.freelancerVerification.verificationStatus,
            rejectionReasons: user.freelancerVerification.rejectionReasons,
          });
        }
        break;

      case 'supplier':
        if (user.supplierVerification) {
          verificationData = user.supplierVerification as unknown as Record<string, unknown>;
          verificationItems = buildSupplierItems({
            commercialLicense: user.supplierVerification.commercialLicense,
            importLicense: user.supplierVerification.importLicense,
            iban: user.supplierVerification.iban,
            verificationStatus: user.supplierVerification.verificationStatus,
            rejectionReasons: user.supplierVerification.rejectionReasons,
          });
        }
        break;

      case 'logistics':
        if (user.logisticsVerification) {
          verificationData = user.logisticsVerification as unknown as Record<string, unknown>;
          verificationItems = buildLogisticsItems({
            transportLicenseFile: user.logisticsVerification.transportLicenseFile,
            insuranceCertificateFile: user.logisticsVerification.insuranceCertificateFile,
            numberOfVehicles: user.logisticsVerification.numberOfVehicles,
            numberOfDrivers: user.logisticsVerification.numberOfDrivers,
            iban: user.logisticsVerification.iban,
            verificationStatus: user.logisticsVerification.verificationStatus,
            rejectionReasons: user.logisticsVerification.rejectionReasons,
          });
        }
        break;

      default:
        break;
    }

    return NextResponse.json({
      success: true,
      accountStatus: user.accountStatus,
      role: user.role,
      verificationData,
      verificationItems,
    });
  } catch (error) {
    console.error('Onboarding GET error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch onboarding status' },
      { status: 500 }
    );
  }
}

// ============================================
// Validation helpers per role
// ============================================

function validateStoreFields(body: Record<string, unknown>): string[] {
  const missing: string[] = [];
  if (!body.commercialRegisterNumber) missing.push('commercialRegisterNumber');
  if (!body.commercialRegisterFile) missing.push('commercialRegisterFile');
  if (!body.iban) missing.push('iban');
  if (!body.beneficiaryName) missing.push('beneficiaryName');
  if (!body.bankLetterFile) missing.push('bankLetterFile');
  if (!body.idFrontFile) missing.push('idFrontFile');
  if (!body.idBackFile) missing.push('idBackFile');
  return missing;
}

function validateFreelancerFields(body: Record<string, unknown>): string[] {
  const missing: string[] = [];
  if (!body.freelancerIdFrontFile) missing.push('freelancerIdFrontFile');
  if (!body.freelancerIdBackFile) missing.push('freelancerIdBackFile');
  if (!body.freelancerIban) missing.push('freelancerIban');
  return missing;
}

function validateLogisticsFields(body: Record<string, unknown>): string[] {
  const missing: string[] = [];
  if (!body.transportLicenseFile) missing.push('transportLicenseFile');
  if (!body.insuranceCertificateFile) missing.push('insuranceCertificateFile');
  if (!body.numberOfVehicles) missing.push('numberOfVehicles');
  if (!body.numberOfDrivers) missing.push('numberOfDrivers');
  return missing;
}

function validateSupplierFields(body: Record<string, unknown>): string[] {
  const missing: string[] = [];
  if (!body.commercialLicenseFile) missing.push('commercialLicenseFile');
  if (!body.importLicenseFile) missing.push('importLicenseFile');
  if (!body.supplierIban) missing.push('supplierIban');
  return missing;
}

// ============================================
// POST /api/onboarding/submit
// ============================================

async function handleSubmit(body: Record<string, unknown>) {
  const { userId, role } = body;

  if (!userId || typeof userId !== 'string') {
    return { success: false, error: 'userId is required', status: 400 };
  }

  if (!role || typeof role !== 'string') {
    return { success: false, error: 'role is required', status: 400 };
  }

  const validRoles = ['store_manager', 'seller', 'supplier', 'logistics'];
  if (!validRoles.includes(role)) {
    return { success: false, error: `Invalid role: ${role}. Must be one of: ${validRoles.join(', ')}`, status: 400 };
  }

  // Check user exists
  const user = await db.user.findUnique({
    where: { id: userId as string },
    select: { id: true, role: true, accountStatus: true },
  });

  if (!user) {
    return { success: false, error: 'User not found', status: 404 };
  }

  // Validate role matches user
  if (user.role !== role) {
    return { success: false, error: `User role is "${user.role}" but submitted role is "${role}"`, status: 400 };
  }

  // Validate required fields per role
  let missingFields: string[] = [];

  switch (role) {
    case 'store_manager':
      missingFields = validateStoreFields(body);
      break;
    case 'seller':
      missingFields = validateFreelancerFields(body);
      break;
    case 'supplier':
      missingFields = validateSupplierFields(body);
      break;
    case 'logistics':
      missingFields = validateLogisticsFields(body);
      break;
  }

  if (missingFields.length > 0) {
    return {
      success: false,
      error: `Missing required fields: ${missingFields.join(', ')}`,
      missingFields,
      status: 400,
    };
  }

  // Create or update verification record
  let verificationId = '';

  try {
    switch (role) {
      case 'store_manager': {
        const record = await db.storeVerification.upsert({
          where: { userId: userId as string },
          create: {
            userId: userId as string,
            commercialRegisterNumber: body.commercialRegisterNumber as string,
            commercialRegisterFile: body.commercialRegisterFile as string,
            iban: body.iban as string,
            beneficiaryName: body.beneficiaryName as string,
            bankLetterFile: body.bankLetterFile as string,
            managerIdFront: body.idFrontFile as string,
            managerIdBack: body.idBackFile as string,
            verificationStatus: 'pending',
            rejectionReasons: null,
            adminNotes: null,
            reviewedBy: null,
            reviewedAt: null,
            submittedAt: new Date(),
          },
          update: {
            commercialRegisterNumber: body.commercialRegisterNumber as string,
            commercialRegisterFile: body.commercialRegisterFile as string,
            iban: body.iban as string,
            beneficiaryName: body.beneficiaryName as string,
            bankLetterFile: body.bankLetterFile as string,
            managerIdFront: body.idFrontFile as string,
            managerIdBack: body.idBackFile as string,
            verificationStatus: 'pending',
            rejectionReasons: null,
            adminNotes: null,
            reviewedBy: null,
            reviewedAt: null,
            submittedAt: new Date(),
          },
        });
        verificationId = record.id;
        break;
      }

      case 'seller': {
        // Save liveness selfie if provided
        const livenessSelfie = body.livenessSelfie as string | undefined;
        const selfieJson = livenessSelfie ? JSON.stringify([livenessSelfie]) : undefined;
        const livenessScore = livenessSelfie ? 0.85 : null;

        const record = await db.freelancerVerification.upsert({
          where: { userId: userId as string },
          create: {
            userId: userId as string,
            freelanceDocFile: (body.freelanceDocumentFile as string) || null,
            nationalIdFront: body.freelancerIdFrontFile as string,
            nationalIdBack: body.freelancerIdBackFile as string,
            iban: body.freelancerIban as string,
            selfieUrls: selfieJson,
            livenessScore: livenessScore,
            verificationStatus: 'pending',
            rejectionReasons: null,
            adminNotes: null,
            reviewedBy: null,
            reviewedAt: null,
            submittedAt: new Date(),
          },
          update: {
            freelanceDocFile: (body.freelanceDocumentFile as string) || null,
            nationalIdFront: body.freelancerIdFrontFile as string,
            nationalIdBack: body.freelancerIdBackFile as string,
            iban: body.freelancerIban as string,
            selfieUrls: selfieJson,
            livenessScore: livenessScore,
            verificationStatus: 'pending',
            rejectionReasons: null,
            adminNotes: null,
            reviewedBy: null,
            reviewedAt: null,
            submittedAt: new Date(),
          },
        });
        verificationId = record.id;
        break;
      }

      case 'supplier': {
        const record = await db.supplierVerification.upsert({
          where: { userId: userId as string },
          create: {
            userId: userId as string,
            commercialLicense: body.commercialLicenseFile as string,
            importLicense: body.importLicenseFile as string,
            iban: body.supplierIban as string,
            verificationStatus: 'pending',
            rejectionReasons: null,
            adminNotes: null,
            reviewedBy: null,
            reviewedAt: null,
            submittedAt: new Date(),
          },
          update: {
            commercialLicense: body.commercialLicenseFile as string,
            importLicense: body.importLicenseFile as string,
            iban: body.supplierIban as string,
            verificationStatus: 'pending',
            rejectionReasons: null,
            adminNotes: null,
            reviewedBy: null,
            reviewedAt: null,
            submittedAt: new Date(),
          },
        });
        verificationId = record.id;
        break;
      }

      case 'logistics': {
        const record = await db.logisticsVerification.upsert({
          where: { userId: userId as string },
          create: {
            userId: userId as string,
            transportLicenseFile: body.transportLicenseFile as string,
            insuranceCertificateFile: body.insuranceCertificateFile as string,
            numberOfVehicles: body.numberOfVehicles as string,
            numberOfDrivers: body.numberOfDrivers as string,
            iban: (body.logisticsIban as string) || null,
            verificationStatus: 'pending',
            rejectionReasons: null,
            adminNotes: null,
            reviewedBy: null,
            reviewedAt: null,
            submittedAt: new Date(),
          },
          update: {
            transportLicenseFile: body.transportLicenseFile as string,
            insuranceCertificateFile: body.insuranceCertificateFile as string,
            numberOfVehicles: body.numberOfVehicles as string,
            numberOfDrivers: body.numberOfDrivers as string,
            iban: (body.logisticsIban as string) || null,
            verificationStatus: 'pending',
            rejectionReasons: null,
            adminNotes: null,
            reviewedBy: null,
            reviewedAt: null,
            submittedAt: new Date(),
          },
        });
        verificationId = record.id;
        break;
      }
    }

    // Update user accountStatus to 'pending'
    await db.user.update({
      where: { id: userId as string },
      data: { accountStatus: 'pending' },
    });

    // Create audit log
    await db.auditLog.create({
      data: {
        userId: userId as string,
        action: 'submitted',
        details: JSON.stringify({ role, verificationId }),
      },
    });

    return {
      success: true,
      verificationId,
      accountStatus: 'pending',
    };
  } catch (error) {
    console.error('Submit error:', error);
    return { success: false, error: 'Failed to submit verification', httpStatus: 500 };
  }
}

// ============================================
// POST /api/onboarding/resubmit
// ============================================

async function handleResubmit(body: Record<string, unknown>) {
  const { userId } = body;

  if (!userId || typeof userId !== 'string') {
    return { success: false, error: 'userId is required', status: 400 };
  }

  // Check user exists and is rejected
  const user = await db.user.findUnique({
    where: { id: userId as string },
    select: {
      id: true,
      role: true,
      accountStatus: true,
      storeVerification: { select: { id: true, verificationStatus: true } },
      freelancerVerification: { select: { id: true, verificationStatus: true } },
      supplierVerification: { select: { id: true, verificationStatus: true } },
      logisticsVerification: { select: { id: true, verificationStatus: true } },
    },
  });

  if (!user) {
    return { success: false, error: 'User not found', status: 404 };
  }

  // Only allow resubmission when rejected
  if (user.accountStatus !== 'rejected') {
    return {
      success: false,
      error: `Cannot resubmit. Current account status is "${user.accountStatus}". Only "rejected" accounts can resubmit.`,
      status: 400,
    };
  }

  // Delegate to submit handler — it will upsert and reset status
  const result = await handleSubmit(body);

  if (result.success) {
    // Create additional audit log for resubmission
    await db.auditLog.create({
      data: {
        userId: userId as string,
        action: 'edited',
        details: JSON.stringify({ role: user.role, previousStatus: 'rejected' }),
      },
    });
  }

  return result;
}

// ============================================
// POST /api/onboarding — Route handler
// ============================================

export async function POST(request: NextRequest) {
  try {
    // Check for sub-action via header or body field
    const body = await request.json();
    const action = body._action;

    if (action === 'resubmit') {
      const { _action, ...rest } = body;
      const result = await handleResubmit(rest);
      return NextResponse.json(result, result.status ? { status: result.status as 400 | 404 | 500 } : undefined);
    }

    // Default: submit
    const result = await handleSubmit(body);
    return NextResponse.json(result, result.status ? { status: result.status as 400 | 404 | 500 } : undefined);
  } catch (error) {
    console.error('Onboarding POST error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process onboarding request' },
      { status: 500 }
    );
  }
}
