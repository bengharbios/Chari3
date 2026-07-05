import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

// ============================================
// SUPER_ADMIN PROTECTION GUARD
// ============================================
// Prevents any admin from modifying, suspending, or deleting the SUPER_ADMIN account.
// Call this at the start of any sensitive admin API handler.

export const SUPER_ADMIN_ROLE = 'super_admin';

/**
 * Check if a user is a SUPER_ADMIN and block any modification attempt.
 * Returns a 403 NextResponse if blocked, or null if safe to proceed.
 */
export async function guardAgainstSuperAdminModification(
  targetUserId: string,
  locale?: string
): Promise<NextResponse | null> {
  const target = await db.user.findUnique({
    where: { id: targetUserId },
    select: { id: true, role: true },
  });

  if (target?.role === SUPER_ADMIN_ROLE) {
    const messageAr = 'لا يمكن تعديل أو حذف حساب المدير الأعلى (SUPER_ADMIN). هذه الحماية غير قابلة للتجاوز.';
    const messageEn = 'Cannot modify or delete the SUPER_ADMIN account. This protection cannot be bypassed.';
    return NextResponse.json(
      {
        success: false,
        error: locale === 'ar' ? messageAr : messageEn,
        errorAr: messageAr,
        errorEn: messageEn,
        blocked: true,
        code: 'SUPER_ADMIN_PROTECTED',
      },
      { status: 403 }
    );
  }

  return null;
}

/**
 * Check if a requesting admin has the right level to perform critical actions.
 * SUPER_ADMIN can do anything.
 * Other admins cannot touch SUPER_ADMIN accounts.
 */
export async function getAdminLevel(adminId: string): Promise<'super_admin' | 'admin' | null> {
  if (!adminId) return null;
  const admin = await db.user.findUnique({
    where: { id: adminId },
    select: { role: true },
  });
  if (!admin) return null;
  if (admin.role === SUPER_ADMIN_ROLE) return 'super_admin';
  if (admin.role === 'admin') return 'admin';
  return null;
}

/**
 * List of action types that require Two-Person approval.
 * SUPER_ADMIN is exempt from this requirement.
 */
export const CRITICAL_ACTION_TYPES = [
  'FORCE_DELETE_USER',
  'CHANGE_DEBT_LIMIT',
  'CREATE_ADMIN',
  'BULK_SUSPEND',
  'OVERRIDE_SUBSCRIPTION',
  'RESET_USER_PASSWORD',
  'REVOKE_ALL_SESSIONS',
] as const;

export type CriticalActionType = typeof CRITICAL_ACTION_TYPES[number];

/**
 * Labels for critical actions (for display in the UI).
 */
export const CRITICAL_ACTION_LABELS: Record<CriticalActionType, { ar: string; en: string }> = {
  FORCE_DELETE_USER:      { ar: 'حذف مستخدم نهائياً',           en: 'Force Delete User' },
  CHANGE_DEBT_LIMIT:      { ar: 'تعديل حد الديون لتاجر',         en: 'Change Merchant Debt Limit' },
  CREATE_ADMIN:           { ar: 'إنشاء حساب مدير جديد',          en: 'Create Admin Account' },
  BULK_SUSPEND:           { ar: 'تعليق أكثر من 5 حسابات دفعة',  en: 'Bulk Suspend Accounts' },
  OVERRIDE_SUBSCRIPTION:  { ar: 'إلغاء اشتراك مدفوع يدوياً',    en: 'Manually Override Subscription' },
  RESET_USER_PASSWORD:    { ar: 'إعادة تعيين كلمة سر مستخدم',    en: 'Reset User Password' },
  REVOKE_ALL_SESSIONS:    { ar: 'إنهاء جميع جلسات مستخدم',       en: 'Revoke All User Sessions' },
};
