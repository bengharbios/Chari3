import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// ============================================
// GET /api/onboarding/status?userId=xxx
// Returns detailed verification progress with per-item status,
// admin notes, and rejection details
// ============================================

interface DetailedItem {
  key: string;
  labelAr: string;
  labelEn: string;
  status: 'verified' | 'pending' | 'rejected' | 'required';
  rejectionReason?: string;
  uploaded?: boolean;
}

interface StatusResponse {
  success: boolean;
  accountStatus: string;
  role: string;
  step: string;
  progress: number;
  items: DetailedItem[];
  submittedAt?: string;
  rejectionReasons?: string[];
  adminNotes?: string | null;
}

function computeProgress(items: DetailedItem[]): number {
  if (items.length === 0) return 0;
  const completed = items.filter(
    (i) => i.status === 'verified' || i.status === 'pending'
  ).length;
  return Math.round((completed / items.length) * 100);
}

function getStepFromStatus(accountStatus: string, hasVerification: boolean): string {
  if (accountStatus === 'active') return 'done';
  if (accountStatus === 'rejected') return 'resubmit';
  if (accountStatus === 'pending') return 'review';
  if (hasVerification) return 'legal';
  return 'basic-info';
}

function parseRejectionReasons(rejectionReasons: string | null): string[] {
  if (!rejectionReasons) return [];
  try {
    const parsed = JSON.parse(rejectionReasons);
    return Array.isArray(parsed) ? parsed : [String(parsed)];
  } catch {
    return rejectionReasons ? [rejectionReasons] : [];
  }
}

/**
 * Map item keys to human-readable Arabic labels for rejection reasons.
 * Used when adminNotes is not available (legacy data).
 */
const ITEM_KEY_LABELS: Record<string, string> = {
  commercial_register: 'السجل التجاري',
  bank_account: 'الحساب البنكي (IBAN)',
  manager_id: 'هوية المدير',
  national_id: 'الهوية الوطنية',
  freelance_document: 'وثيقة العمل الحر',
  liveness: 'التحقق الحي',
  commercial_license: 'رخصة تجارية',
  import_license: 'رخصة الاستيراد',
  transport_license: 'رخصة النقل',
  insurance: 'شهادة التأمين',
  fleet_info: 'معلومات الأسطول',
};

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

    // Fetch user with all verification relations
    const user = await db.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        phone: true,
        email: true,
        role: true,
        accountStatus: true,
        storeVerification: true,
        freelancerVerification: true,
        supplierVerification: true,
        logisticsVerification: true,
        auditLogs: {
          select: {
            action: true,
            createdAt: true,
            details: true,
          },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    let items: DetailedItem[] = [];
    let submittedAt: string | undefined;
    let rejectionReasons: string[] = [];
    let adminNotes: string | null = null;

    switch (user.role) {
      case 'store_manager': {
        const v = user.storeVerification;
        const hasVerification = !!v;
        const rejectionFields = parseRejectionReasons(v?.rejectionReasons ?? null);
        rejectionReasons = rejectionFields;
        adminNotes = v?.adminNotes ?? null;

        if (v) {
          submittedAt = v.submittedAt?.toISOString();
        }

        const isApproved = v?.verificationStatus === 'approved';
        const isRejected = v?.verificationStatus === 'rejected';

        items = [
          {
            key: 'commercial_register',
            labelAr: 'السجل التجاري',
            labelEn: 'Commercial Register',
            status: isApproved
              ? 'verified'
              : v?.commercialRegisterNumber && v?.commercialRegisterFile
                ? isRejected && rejectionFields.includes('commercial_register')
                  ? 'rejected'
                  : 'pending'
                : 'required',
            rejectionReason: (isRejected && rejectionFields.includes('commercial_register'))
              ? (adminNotes || ITEM_KEY_LABELS['commercial_register'])
              : undefined,
            uploaded: !!v?.commercialRegisterFile,
          },
          {
            key: 'bank_account',
            labelAr: 'الحساب البنكي (IBAN)',
            labelEn: 'Bank Account (IBAN)',
            status: isApproved
              ? 'verified'
              : v?.iban && v?.beneficiaryName && v?.bankLetterFile
                ? isRejected && rejectionFields.includes('bank_account')
                  ? 'rejected'
                  : 'pending'
                : 'required',
            rejectionReason: (isRejected && rejectionFields.includes('bank_account'))
              ? (adminNotes || ITEM_KEY_LABELS['bank_account'])
              : undefined,
            uploaded: !!v?.bankLetterFile,
          },
          {
            key: 'manager_id',
            labelAr: 'هوية المدير',
            labelEn: 'Manager ID',
            status: isApproved
              ? 'verified'
              : v?.managerIdFront && v?.managerIdBack
                ? isRejected && rejectionFields.includes('manager_id')
                  ? 'rejected'
                  : 'pending'
                : 'required',
            rejectionReason: (isRejected && rejectionFields.includes('manager_id'))
              ? (adminNotes || ITEM_KEY_LABELS['manager_id'])
              : undefined,
            uploaded: !!(v?.managerIdFront && v?.managerIdBack),
          },
        ];

        const step = getStepFromStatus(user.accountStatus, hasVerification);
        const progress = computeProgress(items);

        return NextResponse.json({
          success: true,
          accountStatus: user.accountStatus,
          role: user.role,
          step,
          progress,
          items,
          submittedAt,
          rejectionReasons: rejectionReasons.length > 0 ? rejectionReasons : undefined,
          adminNotes,
        } satisfies StatusResponse);
      }

      case 'seller': {
        const v = user.freelancerVerification;
        const hasVerification = !!v;
        const rejectionFields = parseRejectionReasons(v?.rejectionReasons ?? null);
        rejectionReasons = rejectionFields;
        adminNotes = v?.adminNotes ?? null;

        if (v) {
          submittedAt = v.submittedAt?.toISOString();
        }

        const isApproved = v?.verificationStatus === 'approved';
        const isRejected = v?.verificationStatus === 'rejected';

        items = [
          {
            key: 'national_id',
            labelAr: 'الهوية الوطنية',
            labelEn: 'National ID',
            status: isApproved
              ? 'verified'
              : v?.nationalIdFront && v?.nationalIdBack
                ? isRejected && rejectionFields.includes('national_id')
                  ? 'rejected'
                  : 'pending'
                : 'required',
            rejectionReason: (isRejected && rejectionFields.includes('national_id'))
              ? (adminNotes || ITEM_KEY_LABELS['national_id'])
              : undefined,
            uploaded: !!(v?.nationalIdFront && v?.nationalIdBack),
          },
          {
            key: 'freelance_document',
            labelAr: 'وثيقة العمل الحر',
            labelEn: 'Freelance Document',
            status: isApproved
              ? 'verified'
              : v?.freelanceDocFile
                ? isRejected && rejectionFields.includes('freelance_document')
                  ? 'rejected'
                  : 'pending'
                : 'required',
            rejectionReason: (isRejected && rejectionFields.includes('freelance_document'))
              ? (adminNotes || ITEM_KEY_LABELS['freelance_document'])
              : undefined,
            uploaded: !!v?.freelanceDocFile,
          },
          {
            key: 'bank_account',
            labelAr: 'الحساب البنكي (IBAN)',
            labelEn: 'Bank Account (IBAN)',
            status: isApproved
              ? 'verified'
              : v?.iban
                ? isRejected && rejectionFields.includes('bank_account')
                  ? 'rejected'
                  : 'pending'
                : 'required',
            rejectionReason: (isRejected && rejectionFields.includes('bank_account'))
              ? (adminNotes || ITEM_KEY_LABELS['bank_account'])
              : undefined,
            uploaded: false,
          },
          {
            key: 'liveness',
            labelAr: 'التحقق الحي',
            labelEn: 'Liveness Check',
            status: isApproved
              ? 'verified'
              : (v?.livenessScore ?? 0) > 0
                ? isRejected && rejectionFields.includes('liveness')
                  ? 'rejected'
                  : 'pending'
                : 'required',
            rejectionReason: (isRejected && rejectionFields.includes('liveness'))
              ? (adminNotes || ITEM_KEY_LABELS['liveness'])
              : undefined,
            uploaded: false,
          },
        ];

        const step = getStepFromStatus(user.accountStatus, hasVerification);
        const progress = computeProgress(items);

        return NextResponse.json({
          success: true,
          accountStatus: user.accountStatus,
          role: user.role,
          step,
          progress,
          items,
          submittedAt,
          rejectionReasons: rejectionReasons.length > 0 ? rejectionReasons : undefined,
          adminNotes,
        } satisfies StatusResponse);
      }

      case 'logistics': {
        const v = user.logisticsVerification;
        const hasVerification = !!v;
        const rejectionFields = parseRejectionReasons(v?.rejectionReasons ?? null);
        rejectionReasons = rejectionFields;
        adminNotes = v?.adminNotes ?? null;

        if (v) {
          submittedAt = v.submittedAt?.toISOString();
        }

        const isApproved = v?.verificationStatus === 'approved';
        const isRejected = v?.verificationStatus === 'rejected';

        items = [
          {
            key: 'transport_license',
            labelAr: 'رخصة النقل',
            labelEn: 'Transport License',
            status: isApproved
              ? 'verified'
              : v?.transportLicenseFile
                ? isRejected && rejectionFields.includes('transport_license')
                  ? 'rejected'
                  : 'pending'
                : 'required',
            rejectionReason: (isRejected && rejectionFields.includes('transport_license'))
              ? (adminNotes || ITEM_KEY_LABELS['transport_license'])
              : undefined,
            uploaded: !!v?.transportLicenseFile,
          },
          {
            key: 'insurance',
            labelAr: 'شهادة التأمين',
            labelEn: 'Insurance Certificate',
            status: isApproved
              ? 'verified'
              : v?.insuranceCertificateFile
                ? isRejected && rejectionFields.includes('insurance')
                  ? 'rejected'
                  : 'pending'
                : 'required',
            rejectionReason: (isRejected && rejectionFields.includes('insurance'))
              ? (adminNotes || ITEM_KEY_LABELS['insurance'])
              : undefined,
            uploaded: !!v?.insuranceCertificateFile,
          },
          {
            key: 'fleet_info',
            labelAr: 'معلومات الأسطول',
            labelEn: 'Fleet Information',
            status: isApproved
              ? 'verified'
              : v?.numberOfVehicles && v?.numberOfDrivers
                ? isRejected && rejectionFields.includes('fleet_info')
                  ? 'rejected'
                  : 'pending'
                : 'required',
            rejectionReason: (isRejected && rejectionFields.includes('fleet_info'))
              ? (adminNotes || ITEM_KEY_LABELS['fleet_info'])
              : undefined,
            uploaded: false,
          },
          {
            key: 'bank_account',
            labelAr: 'الحساب البنكي (IBAN)',
            labelEn: 'Bank Account (IBAN)',
            status: isApproved
              ? 'verified'
              : v?.iban
                ? isRejected && rejectionFields.includes('bank_account')
                  ? 'rejected'
                  : 'pending'
                : 'required',
            rejectionReason: (isRejected && rejectionFields.includes('bank_account'))
              ? (adminNotes || ITEM_KEY_LABELS['bank_account'])
              : undefined,
            uploaded: false,
          },
        ];

        const step = getStepFromStatus(user.accountStatus, hasVerification);
        const progress = computeProgress(items);

        return NextResponse.json({
          success: true,
          accountStatus: user.accountStatus,
          role: user.role,
          step,
          progress,
          items,
          submittedAt,
          rejectionReasons: rejectionReasons.length > 0 ? rejectionReasons : undefined,
          adminNotes,
        } satisfies StatusResponse);
      }

      case 'supplier': {
        const v = user.supplierVerification;
        const hasVerification = !!v;
        const rejectionFields = parseRejectionReasons(v?.rejectionReasons ?? null);
        rejectionReasons = rejectionFields;
        adminNotes = v?.adminNotes ?? null;

        if (v) {
          submittedAt = v.submittedAt?.toISOString();
        }

        const isApproved = v?.verificationStatus === 'approved';
        const isRejected = v?.verificationStatus === 'rejected';

        items = [
          {
            key: 'commercial_license',
            labelAr: 'رخصة تجارية',
            labelEn: 'Commercial License',
            status: isApproved
              ? 'verified'
              : v?.commercialLicense
                ? isRejected && rejectionFields.includes('commercial_license')
                  ? 'rejected'
                  : 'pending'
                : 'required',
            rejectionReason: (isRejected && rejectionFields.includes('commercial_license'))
              ? (adminNotes || ITEM_KEY_LABELS['commercial_license'])
              : undefined,
            uploaded: !!v?.commercialLicense,
          },
          {
            key: 'import_license',
            labelAr: 'رخصة الاستيراد',
            labelEn: 'Import License',
            status: isApproved
              ? 'verified'
              : v?.importLicense
                ? isRejected && rejectionFields.includes('import_license')
                  ? 'rejected'
                  : 'pending'
                : 'required',
            rejectionReason: (isRejected && rejectionFields.includes('import_license'))
              ? (adminNotes || ITEM_KEY_LABELS['import_license'])
              : undefined,
            uploaded: !!v?.importLicense,
          },
          {
            key: 'bank_account',
            labelAr: 'الحساب البنكي (IBAN)',
            labelEn: 'Bank Account (IBAN)',
            status: isApproved
              ? 'verified'
              : v?.iban
                ? isRejected && rejectionFields.includes('bank_account')
                  ? 'rejected'
                  : 'pending'
                : 'required',
            rejectionReason: (isRejected && rejectionFields.includes('bank_account'))
              ? (adminNotes || ITEM_KEY_LABELS['bank_account'])
              : undefined,
            uploaded: false,
          },
        ];

        const step = getStepFromStatus(user.accountStatus, hasVerification);
        const progress = computeProgress(items);

        return NextResponse.json({
          success: true,
          accountStatus: user.accountStatus,
          role: user.role,
          step,
          progress,
          items,
          submittedAt,
          rejectionReasons: rejectionReasons.length > 0 ? rejectionReasons : undefined,
          adminNotes,
        } satisfies StatusResponse);
      }

      default: {
        // Buyer or other roles don't need verification
        return NextResponse.json({
          success: true,
          accountStatus: user.accountStatus,
          role: user.role,
          step: user.accountStatus === 'active' ? 'done' : 'basic-info',
          progress: user.accountStatus === 'active' ? 100 : 0,
          items: [],
        } satisfies StatusResponse);
      }
    }
  } catch (error) {
    console.error('Onboarding status error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch verification status' },
      { status: 500 }
    );
  }
}
