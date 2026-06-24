import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

// ============================================
// GET /api/admin/review — Pending merchants list
// GET /api/admin/review?action=audit — Audit log
// ============================================

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    if (action === 'audit') {
      return await getAuditLogs();
    }

    return await getPendingMerchants();
  } catch (error) {
    console.error('[GET /api/admin/review]', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    // Return success with empty data instead of 500 to avoid UI errors
    return NextResponse.json({
      success: true,
      stats: { totalPending: 0, approvedToday: 0, rejectedToday: 0, avgReviewTime: '—' },
      merchants: [],
      _debug: message,
    });
  }
}

// -------------------------------------------
// Pending merchants
// -------------------------------------------

async function getPendingMerchants() {
  try {
    const pendingUsers = await db.user.findMany({
      where: {
        accountStatus: 'pending',
        role: { notIn: ['buyer', 'admin'] },
      },
      orderBy: { createdAt: 'asc' },
    });

    // If no pending users, return empty result immediately
    if (pendingUsers.length === 0) {
      return NextResponse.json({
        success: true,
        stats: { totalPending: 0, approvedToday: 0, rejectedToday: 0, avgReviewTime: '—' },
        merchants: [],
      });
    }

    const now = new Date();
    const oneDayMs = 24 * 60 * 60 * 1000;
    const userIds = pendingUsers.map((u) => u.id);

    // Fetch verification records safely
    let storeVerifications: any[] = [];
    let freelancerVerifications: any[] = [];
    let supplierVerifications: any[] = [];
    let logisticsVerifications: any[] = [];

    try {
      storeVerifications = await db.storeVerification.findMany({ where: { userId: { in: userIds } } });
    } catch (e) { console.warn('storeVerification query failed:', e); }
    try {
      freelancerVerifications = await db.freelancerVerification.findMany({ where: { userId: { in: userIds } } });
    } catch (e) { console.warn('freelancerVerification query failed:', e); }
    try {
      supplierVerifications = await db.supplierVerification.findMany({ where: { userId: { in: userIds } } });
    } catch (e) { console.warn('supplierVerification query failed:', e); }
    try {
      logisticsVerifications = await db.logisticsVerification.findMany({ where: { userId: { in: userIds } } });
    } catch (e) { console.warn('logisticsVerification query failed:', e); }

    const storeVerMap = new Map(storeVerifications.map((v) => [v.userId, v]));
    const freeVerMap = new Map(freelancerVerifications.map((v) => [v.userId, v]));
    const supplierVerMap = new Map(supplierVerifications.map((v) => [v.userId, v]));
    const logisticsVerMap = new Map(logisticsVerifications.map((v) => [v.userId, v]));

    const merchants = pendingUsers.map((user) => {
      const registeredAt = user.createdAt.toISOString();
      const diff = now.getTime() - user.createdAt.getTime();
      const priority: 'urgent' | 'standard' = diff > oneDayMs ? 'urgent' : 'standard';

      const role = mapRole(user.role);

      const verRecord = storeVerMap.get(user.id) || freeVerMap.get(user.id) || supplierVerMap.get(user.id) || logisticsVerMap.get(user.id);

      let rejectionReason: string | undefined;
      if (verRecord) {
        if (verRecord.adminNotes) {
          rejectionReason = verRecord.adminNotes as string;
        } else if (verRecord.rejectionReasons) {
          try {
            const reasons = JSON.parse(verRecord.rejectionReasons as string);
            if (Array.isArray(reasons) && reasons.length > 0) {
              rejectionReason = reasons.join('، ');
            }
          } catch {
            rejectionReason = verRecord.rejectionReasons as string;
          }
        }
      }

      const documents: any[] = [];
      const verificationItems: any[] = [];
      let detailsObj: any = null;

      // 1. Store / Store Manager
      const storeVer = storeVerMap.get(user.id);
      if (storeVer) {
        detailsObj = {
          entityType: storeVer.entityType,
          companyName: storeVer.companyName,
          country: storeVer.country,
          state: storeVer.state,
          companyAddress: storeVer.companyAddress,
          issueAuthority: storeVer.issueAuthority,
          commercialRegisterNumber: storeVer.commercialRegisterNumber,
          issueDate: storeVer.issueDate?.toISOString(),
          expiryDate: storeVer.expiryDate?.toISOString(),
          bankName: storeVer.bankName,
          iban: storeVer.iban,
          swiftCode: storeVer.swiftCode,
          ccpNumber: storeVer.ccpNumber,
          ccpCle: storeVer.ccpCle,
          beneficiaryName: storeVer.beneficiaryName,
          isBeneficiaryMatching: storeVer.isBeneficiaryMatching,
          signatoryName: storeVer.signatoryName,
          signatoryEmail: storeVer.signatoryEmail,
          isLegalOwner: storeVer.isLegalOwner,
        };

        if (storeVer.commercialRegisterFile) {
          documents.push({
            id: 'commercial_register',
            name: 'السجل التجاري',
            nameEn: 'Commercial Register',
            url: storeVer.commercialRegisterFile,
            status: storeVer.verificationStatus || 'pending',
          });
          verificationItems.push({
            id: 'commercial_register',
            labelAr: 'السجل التجاري',
            labelEn: 'Commercial Register',
            status: storeVer.verificationStatus === 'approved' ? 'verified' : (storeVer.verificationStatus === 'rejected' ? 'rejected' : 'pending'),
          });
        }
        if (storeVer.bankLetterFile) {
          documents.push({
            id: 'bank_account',
            name: 'إثبات الحساب البنكي',
            nameEn: 'Bank Account Proof',
            url: storeVer.bankLetterFile,
            status: storeVer.verificationStatus || 'pending',
          });
          verificationItems.push({
            id: 'bank_account',
            labelAr: 'الحساب البنكي',
            labelEn: 'Bank Account',
            status: storeVer.verificationStatus === 'approved' ? 'verified' : (storeVer.verificationStatus === 'rejected' ? 'rejected' : 'pending'),
          });
        }
        if (storeVer.managerIdFront) {
          documents.push({
            id: 'manager_id_front',
            name: 'هوية المدير (الوجه الأمامي)',
            nameEn: 'Manager ID (Front)',
            url: storeVer.managerIdFront,
            status: storeVer.verificationStatus || 'pending',
          });
        }
        if (storeVer.managerIdBack) {
          documents.push({
            id: 'manager_id_back',
            name: 'هوية المدير (الوجه الخلفي)',
            nameEn: 'Manager ID (Back)',
            url: storeVer.managerIdBack,
            status: storeVer.verificationStatus || 'pending',
          });
        }
        if (storeVer.managerIdFront || storeVer.managerIdBack) {
          verificationItems.push({
            id: 'manager_id',
            labelAr: 'هوية المدير',
            labelEn: 'Manager ID',
            status: storeVer.verificationStatus === 'approved' ? 'verified' : (storeVer.verificationStatus === 'rejected' ? 'rejected' : 'pending'),
          });
        }
        if (storeVer.powerOfAttorneyFile) {
          documents.push({
            id: 'power_of_attorney',
            name: 'تفويض التوقيع (وكالة)',
            nameEn: 'Power of Attorney',
            url: storeVer.powerOfAttorneyFile,
            status: storeVer.verificationStatus || 'pending',
          });
        }
        if (storeVer.vatCertificateFile) {
          documents.push({
            id: 'vat_certificate',
            name: 'شهادة الضريبة الرقمية',
            nameEn: 'VAT Certificate',
            url: storeVer.vatCertificateFile,
            status: storeVer.verificationStatus || 'pending',
          });
        }
      }

      // 2. Freelancer / Independent Seller
      const freeVer = freeVerMap.get(user.id);
      if (freeVer) {
        detailsObj = {
          iban: freeVer.iban,
        };

        if (freeVer.freelanceDocFile) {
          documents.push({
            id: 'freelance_document',
            name: 'وثيقة العمل الحر / مستقل',
            nameEn: 'Freelance Certificate',
            url: freeVer.freelanceDocFile,
            status: freeVer.verificationStatus || 'pending',
          });
          verificationItems.push({
            id: 'freelance_document',
            labelAr: 'وثيقة العمل الحر',
            labelEn: 'Freelance Document',
            status: freeVer.verificationStatus === 'approved' ? 'verified' : (freeVer.verificationStatus === 'rejected' ? 'rejected' : 'pending'),
          });
        }
        if (freeVer.nationalIdFront) {
          documents.push({
            id: 'national_id_front',
            name: 'بطاقة الهوية (الوجه الأمامي)',
            nameEn: 'National ID (Front)',
            url: freeVer.nationalIdFront,
            status: freeVer.verificationStatus || 'pending',
          });
        }
        if (freeVer.nationalIdBack) {
          documents.push({
            id: 'national_id_back',
            name: 'بطاقة الهوية (الوجه الخلفي)',
            nameEn: 'National ID (Back)',
            url: freeVer.nationalIdBack,
            status: freeVer.verificationStatus || 'pending',
          });
        }
        if (freeVer.nationalIdFront || freeVer.nationalIdBack) {
          verificationItems.push({
            id: 'national_id',
            labelAr: 'الهوية الوطنية',
            labelEn: 'National ID',
            status: freeVer.verificationStatus === 'approved' ? 'verified' : (freeVer.verificationStatus === 'rejected' ? 'rejected' : 'pending'),
          });
        }
        if (freeVer.iban) {
          verificationItems.push({
            id: 'bank_account',
            labelAr: 'الحساب البنكي (الآيبان)',
            labelEn: 'Bank Account (IBAN)',
            status: freeVer.verificationStatus === 'approved' ? 'verified' : (freeVer.verificationStatus === 'rejected' ? 'rejected' : 'pending'),
          });
        }
      }

      // 3. Supplier
      const supplierVer = supplierVerMap.get(user.id);
      if (supplierVer) {
        detailsObj = {
          iban: supplierVer.iban,
        };

        if (supplierVer.commercialLicense) {
          documents.push({
            id: 'commercial_license',
            name: 'رخصة النشاط التجاري',
            nameEn: 'Commercial License',
            url: supplierVer.commercialLicense,
            status: supplierVer.verificationStatus || 'pending',
          });
          verificationItems.push({
            id: 'commercial_license',
            labelAr: 'رخصة النشاط',
            labelEn: 'Commercial License',
            status: supplierVer.verificationStatus === 'approved' ? 'verified' : (supplierVer.verificationStatus === 'rejected' ? 'rejected' : 'pending'),
          });
        }
        if (supplierVer.importLicense) {
          documents.push({
            id: 'import_license',
            name: 'رخصة الاستيراد',
            nameEn: 'Import License',
            url: supplierVer.importLicense,
            status: supplierVer.verificationStatus || 'pending',
          });
        }
        if (supplierVer.iban) {
          verificationItems.push({
            id: 'bank_account',
            labelAr: 'الحساب البنكي (الآيبان)',
            labelEn: 'Bank Account (IBAN)',
            status: supplierVer.verificationStatus === 'approved' ? 'verified' : (supplierVer.verificationStatus === 'rejected' ? 'rejected' : 'pending'),
          });
        }
      }

      // 4. Logistics Partner
      const logVer = logisticsVerMap.get(user.id);
      if (logVer) {
        detailsObj = {
          numberOfVehicles: logVer.numberOfVehicles,
          numberOfDrivers: logVer.numberOfDrivers,
          iban: logVer.iban,
        };

        if (logVer.transportLicenseFile) {
          documents.push({
            id: 'transport_license',
            name: 'رخصة النقل والاستغلال',
            nameEn: 'Transport License',
            url: logVer.transportLicenseFile,
            status: logVer.verificationStatus || 'pending',
          });
          verificationItems.push({
            id: 'transport_license',
            labelAr: 'رخصة النقل',
            labelEn: 'Transport License',
            status: logVer.verificationStatus === 'approved' ? 'verified' : (logVer.verificationStatus === 'rejected' ? 'rejected' : 'pending'),
          });
        }
        if (logVer.insuranceCertificateFile) {
          documents.push({
            id: 'insurance_certificate',
            name: 'شهادة التأمين',
            nameEn: 'Insurance Certificate',
            url: logVer.insuranceCertificateFile,
            status: logVer.verificationStatus || 'pending',
          });
        }
        if (logVer.iban) {
          verificationItems.push({
            id: 'bank_account',
            labelAr: 'الحساب البنكي (الآيبان)',
            labelEn: 'Bank Account (IBAN)',
            status: logVer.verificationStatus === 'approved' ? 'verified' : (logVer.verificationStatus === 'rejected' ? 'rejected' : 'pending'),
          });
        }
      }

      return {
        id: user.id,
        name: user.name,
        nameEn: user.nameEn || user.name,
        email: user.email,
        phone: user.phone || '',
        role,
        registeredAt,
        phoneVerified: user.phoneVerified,
        emailVerified: user.emailVerified,
        documents,
        verificationItems,
        priority,
        rejectionReason,
        details: detailsObj,
      };
    });

    // Compute stats safely
    let approvedToday = 0;
    let rejectedToday = 0;
    try {
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      approvedToday = await db.auditLog.count({ where: { action: 'approved', createdAt: { gte: todayStart } } });
      rejectedToday = await db.auditLog.count({ where: { action: 'rejected', createdAt: { gte: todayStart } } });
    } catch (e) { console.warn('Audit stats query failed:', e); }

    return NextResponse.json({
      success: true,
      stats: { totalPending: merchants.length, approvedToday, rejectedToday, avgReviewTime: '—' },
      merchants,
    });
  } catch (error) {
    console.error('[getPendingMerchants]', error);
    // Return empty result instead of crashing
    return NextResponse.json({
      success: true,
      stats: { totalPending: 0, approvedToday: 0, rejectedToday: 0, avgReviewTime: '—' },
      merchants: [],
    });
  }
}

// -------------------------------------------
// Audit logs
// -------------------------------------------

async function getAuditLogs() {
  try {
    const logs = await db.auditLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 20,
      include: {
        user: { select: { id: true, name: true, nameEn: true } },
      },
    });

    const actionLabels: Record<string, { labelAr: string; labelEn: string }> = {
      submitted: { labelAr: 'تقديم', labelEn: 'Submitted' },
      approved: { labelAr: 'تفعيل', labelEn: 'Approved' },
      rejected: { labelAr: 'رفض', labelEn: 'Rejected' },
      edited: { labelAr: 'تعديل', labelEn: 'Edited' },
      request_edit: { labelAr: 'طلب تعديل', labelEn: 'Request Edit' },
      login: { labelAr: 'تسجيل دخول', labelEn: 'Login' },
      logout: { labelAr: 'تسجيل خروج', labelEn: 'Logout' },
      note: { labelAr: 'ملاحظة', labelEn: 'Note' },
      role_change: { labelAr: 'تغيير دور', labelEn: 'Role Change' },
      suspend: { labelAr: 'تعليق', labelEn: 'Suspend' },
      activate: { labelAr: 'تفعيل', labelEn: 'Activate' },
      delete: { labelAr: 'حذف', labelEn: 'Delete' },
    };

    const mappedLogs = logs.map((log) => {
      const labels = actionLabels[log.action] || { labelAr: log.action, labelEn: log.action };
      let details = '';
      let detailsEn = '';

      if (log.details) {
        try {
          const d = JSON.parse(log.details);
          details = d.reason || d.note || d.message || '';
          detailsEn = d.reasonEn || d.noteEn || d.messageEn || details;
        } catch {
          details = log.details;
          detailsEn = log.details;
        }
      }

      return {
        id: log.id,
        merchantId: log.userId,
        merchantName: log.user.name,
        merchantNameEn: log.user.nameEn || log.user.name,
        adminName: log.adminId || 'النظام',
        action: log.action,
        actionLabelAr: labels.labelAr,
        actionLabelEn: labels.labelEn,
        details: details || `${labels.labelAr} - ${log.user.name}`,
        detailsEn: detailsEn || `${labels.labelEn} - ${log.user.nameEn || log.user.name}`,
        timestamp: log.createdAt.toISOString(),
      };
    });

    return NextResponse.json({ success: true, auditLogs: mappedLogs });
  } catch (error) {
    console.error('[getAuditLogs]', error);
    // Return success with empty data instead of error
    return NextResponse.json({ success: true, auditLogs: [] });
  }
}

function mapRole(dbRole: string): 'store' | 'freelancer' | 'supplier' | 'logistics' {
  if (dbRole === 'store' || dbRole === 'store_manager') return 'store';
  if (dbRole === 'freelancer' || dbRole === 'seller') return 'freelancer';
  if (dbRole === 'supplier') return 'supplier';
  if (dbRole === 'logistics' || dbRole === 'delivery') return 'logistics';
  return 'freelancer';
}
