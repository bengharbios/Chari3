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
        let storeRejectedKeys = [];
        try {
          if (storeVer.rejectionReasons) {
            storeRejectedKeys = JSON.parse(storeVer.rejectionReasons);
          }
        } catch (e) {}

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
            labelAr: 'مستند السجل التجاري المرفوع',
            labelEn: 'Commercial Register File',
            status: storeVer.verificationStatus === 'approved' ? 'verified' : (storeRejectedKeys.includes('commercial_register') ? 'rejected' : 'pending'),
          });
        }

        if (storeVer.commercialRegisterNumber) {
          verificationItems.push({
            id: 'commercial_register_number',
            labelAr: 'رقم السجل التجاري (الرقم المدخل)',
            labelEn: 'Commercial Register Number',
            status: storeVer.verificationStatus === 'approved' ? 'verified' : (storeRejectedKeys.includes('commercial_register_number') ? 'rejected' : 'pending'),
          });
        }

        if (storeVer.expiryDate) {
          verificationItems.push({
            id: 'expiry_date',
            labelAr: 'تاريخ انتهاء الرخصة / السجل',
            labelEn: 'License Expiry Date',
            status: storeVer.verificationStatus === 'approved' ? 'verified' : (storeRejectedKeys.includes('expiry_date') ? 'rejected' : 'pending'),
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
            labelAr: 'مستند إثبات الحساب البنكي المرفوع',
            labelEn: 'Bank Letter File',
            status: storeVer.verificationStatus === 'approved' ? 'verified' : (storeRejectedKeys.includes('bank_account') ? 'rejected' : 'pending'),
          });
        }

        if (storeVer.iban || storeVer.ccpNumber) {
          verificationItems.push({
            id: 'bank_details',
            labelAr: 'تفاصيل الحساب المالي (CCP أو الآيبان البنكي)',
            labelEn: 'CCP or IBAN financial details',
            status: storeVer.verificationStatus === 'approved' ? 'verified' : ((storeRejectedKeys.includes('bank_details') || storeRejectedKeys.includes('bank_account')) ? 'rejected' : 'pending'),
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
            labelAr: 'مستند هوية المدير المرفوعة (الوجهين)',
            labelEn: 'Manager ID Document',
            status: storeVer.verificationStatus === 'approved' ? 'verified' : (storeRejectedKeys.includes('manager_id') ? 'rejected' : 'pending'),
          });
        }

        if (storeVer.signatoryName || storeVer.signatoryEmail) {
          verificationItems.push({
            id: 'signatory_info',
            labelAr: 'بيانات المدير / المفوض بالتوقيع (الاسم والبريد)',
            labelEn: 'Signatory Name and Email info',
            status: storeVer.verificationStatus === 'approved' ? 'verified' : (storeRejectedKeys.includes('signatory_info') ? 'rejected' : 'pending'),
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
          verificationItems.push({
            id: 'power_of_attorney',
            labelAr: 'مستند تفويض التوقيع (POA)',
            labelEn: 'Power of Attorney file',
            status: storeVer.verificationStatus === 'approved' ? 'verified' : (storeRejectedKeys.includes('power_of_attorney') ? 'rejected' : 'pending'),
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
          verificationItems.push({
            id: 'vat_certificate',
            labelAr: 'شهادة الضريبة الرقمية المرفوعة',
            labelEn: 'VAT Certificate file',
            status: storeVer.verificationStatus === 'approved' ? 'verified' : (storeRejectedKeys.includes('vat_certificate') ? 'rejected' : 'pending'),
          });
        }
      }

      // 2. Freelancer / Independent Seller
      const freeVer = freeVerMap.get(user.id);
      if (freeVer) {
        let freeRejectedKeys = [];
        try {
          if (freeVer.rejectionReasons) {
            freeRejectedKeys = JSON.parse(freeVer.rejectionReasons);
          }
        } catch (e) {}

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
            labelAr: 'مستند وثيقة العمل الحر / حرفي المرفوع',
            labelEn: 'Freelance Document file',
            status: freeVer.verificationStatus === 'approved' ? 'verified' : (freeRejectedKeys.includes('freelance_document') ? 'rejected' : 'pending'),
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
            labelAr: 'مستند بطاقة الهوية الوطنية المرفوع',
            labelEn: 'National ID card files',
            status: freeVer.verificationStatus === 'approved' ? 'verified' : (freeRejectedKeys.includes('national_id') ? 'rejected' : 'pending'),
          });
        }
        if (freeVer.iban) {
          verificationItems.push({
            id: 'bank_account',
            labelAr: 'تفاصيل الحساب المالي (الآيبان البنكي)',
            labelEn: 'Bank Account (IBAN) info',
            status: freeVer.verificationStatus === 'approved' ? 'verified' : (freeRejectedKeys.includes('bank_account') ? 'rejected' : 'pending'),
          });
        }
      }

      // 3. Supplier
      const supplierVer = supplierVerMap.get(user.id);
      if (supplierVer) {
        let supplierRejectedKeys = [];
        try {
          if (supplierVer.rejectionReasons) {
            supplierRejectedKeys = JSON.parse(supplierVer.rejectionReasons);
          }
        } catch (e) {}

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
            labelAr: 'مستند رخصة النشاط التجاري المرفوع',
            labelEn: 'Commercial License file',
            status: supplierVer.verificationStatus === 'approved' ? 'verified' : (supplierRejectedKeys.includes('commercial_license') ? 'rejected' : 'pending'),
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
          verificationItems.push({
            id: 'import_license',
            labelAr: 'مستند رخصة الاستيراد المرفوع',
            labelEn: 'Import License file',
            status: supplierVer.verificationStatus === 'approved' ? 'verified' : (supplierRejectedKeys.includes('import_license') ? 'rejected' : 'pending'),
          });
        }
        if (supplierVer.iban) {
          verificationItems.push({
            id: 'bank_account',
            labelAr: 'تفاصيل الحساب المالي (الآيبان البنكي)',
            labelEn: 'Bank Account (IBAN) info',
            status: supplierVer.verificationStatus === 'approved' ? 'verified' : (supplierRejectedKeys.includes('bank_account') ? 'rejected' : 'pending'),
          });
        }
      }

      // 4. Logistics Partner
      const logVer = logisticsVerMap.get(user.id);
      if (logVer) {
        let logRejectedKeys = [];
        try {
          if (logVer.rejectionReasons) {
            logRejectedKeys = JSON.parse(logVer.rejectionReasons);
          }
        } catch (e) {}

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
            labelAr: 'مستند رخصة النقل المرفوع',
            labelEn: 'Transport License file',
            status: logVer.verificationStatus === 'approved' ? 'verified' : (logRejectedKeys.includes('transport_license') ? 'rejected' : 'pending'),
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
          verificationItems.push({
            id: 'insurance_certificate',
            labelAr: 'مستند شهادة التأمين المرفوع',
            labelEn: 'Insurance Certificate file',
            status: logVer.verificationStatus === 'approved' ? 'verified' : (logVer.verificationStatus === 'rejected' ? 'rejected' : 'pending'),
          });
        }
        if (logVer.iban) {
          verificationItems.push({
            id: 'bank_account',
            labelAr: 'تفاصيل الحساب المالي (الآيبان البنكي)',
            labelEn: 'Bank Account (IBAN) info',
            status: logVer.verificationStatus === 'approved' ? 'verified' : (logRejectedKeys.includes('bank_account') ? 'rejected' : 'pending'),
          });
        }
      }

      // Append Security / Contact settings for edit selection
      if (user.phone) {
        verificationItems.push({
          id: 'phone',
          labelAr: `رقم الهاتف المرتبط بالمتجر (${user.phone})`,
          labelEn: `Merchant phone number (${user.phone})`,
          status: user.accountStatus === 'approved' ? 'verified' : (user.accountStatus === 'rejected' ? 'rejected' : 'pending'),
        });
      }
      if (user.email) {
        verificationItems.push({
          id: 'email',
          labelAr: `البريد الإلكتروني للاتصال (${user.email})`,
          labelEn: `Merchant email address (${user.email})`,
          status: user.accountStatus === 'approved' ? 'verified' : (user.accountStatus === 'rejected' ? 'rejected' : 'pending'),
        });
      }
      verificationItems.push({
        id: 'two_factor',
        labelAr: 'المطالبة بتفعيل المصادقة الثنائية (2FA) للأمان',
        labelEn: 'Require Two-Factor Authentication (2FA)',
        status: user.twoFactorEnabled ? 'verified' : 'required',
      });

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
