import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

// GET /api/admin/verifications/check-expired
// Can be triggered by system cron to check document expirations and notify users
export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    // Secret verification cron token check
    const cronToken = process.env.CRON_SECRET || 'chari3-cron-secret';
    if (authHeader && authHeader !== `Bearer ${cronToken}`) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const now = new Date();
    const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    const expiredLogs: string[] = [];
    const warningLogs: string[] = [];

    // ============================================
    // 1. PROCESS EXPIRED VERIFICATIONS
    // ============================================
    const expiredVerifications = await db.storeVerification.findMany({
      where: {
        verificationStatus: 'approved',
        expiryDate: { lt: now },
      },
      include: {
        user: { select: { id: true, name: true } },
      },
    });

    for (const ver of expiredVerifications) {
      // Begin Transaction to update status and notify
      await db.$transaction(async (tx) => {
        // Update verification status to 'rejected' to trigger resubmission flow
        await tx.storeVerification.update({
          where: { id: ver.id },
          data: {
            verificationStatus: 'rejected',
            rejectionReasons: JSON.stringify(['commercial_register']), // CR expired
            adminNotes: 'انتهت صلاحية السجل التجاري المرفق تلقائياً.',
            reviewedAt: now,
          },
        });

        // Set user status to rejected / isVerified = false
        await tx.user.update({
          where: { id: ver.userId },
          data: {
            accountStatus: 'rejected',
            isVerified: false,
          },
        });

        // Sync with SellerProfile
        await tx.sellerProfile.updateMany({
          where: { userId: ver.userId },
          data: { isVerified: false },
        });

        // Notify user
        await tx.notification.create({
          data: {
            userId: ver.userId,
            type: 'VERIFICATION_REJECTED',
            title: 'انتهت صلاحية وثائق التوثيق الخاصة بك',
            titleEn: 'Your verification documents have expired',
            body: 'لقد انتهت صلاحية السجل التجاري الخاص بمتجرك. يرجى تعديل وإعادة إرسال وثائق سارية المفعول لتفعيل حسابك مجدداً.',
            bodyEn: 'Your store\'s commercial register has expired. Please update and resubmit valid documents to reactivate your account.',
          },
        });

        // Notify Admins
        const admins = await tx.user.findMany({
          where: { role: { in: ['admin', 'SUPER_ADMIN', 'super_admin'] } },
          select: { id: true },
        });

        const adminNotifications = admins.map((admin) => ({
          userId: admin.id,
          type: 'NEW_VERIFICATION_SUBMISSION',
          title: 'انتهاء صلاحية توثيق متجر',
          titleEn: 'Store Verification Expired',
          body: `انتهت صلاحية السجل التجاري لمتجر ${ver.user.name || ver.userId}. تم تعليق التوثيق تلقائياً.`,
          bodyEn: `The commercial register of ${ver.user.name || ver.userId} has expired. Verification suspended.`,
        }));

        if (adminNotifications.length > 0) {
          await tx.notification.createMany({
            data: adminNotifications,
          });
        }
      });

      expiredLogs.push(`Expired store verification: ${ver.userId}`);
    }

    // ============================================
    // 2. PROCESS PRE-EXPIRY WARNINGS (7 & 30 Days)
    // ============================================
    // Find verifications expiring soon and send reminders (avoid sending duplicate reminders if recently sent)
    const upcomingExpirations = await db.storeVerification.findMany({
      where: {
        verificationStatus: 'approved',
        expiryDate: {
          gt: now,
          lt: thirtyDaysFromNow,
        },
      },
      include: {
        user: { select: { id: true, name: true } },
      },
    });

    for (const ver of upcomingExpirations) {
      if (!ver.expiryDate) continue;

      const diffDays = Math.ceil((ver.expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      
      // Determine if we should send a warning (exact 30 days or 7 days reminder)
      let shouldWarn = false;
      let title = '';
      let titleEn = '';
      let body = '';
      let bodyEn = '';

      if (diffDays <= 7) {
        shouldWarn = true;
        title = 'تحذير: توثيق متجرك ينتهي قريباً جداً';
        titleEn = 'Warning: Store verification expires very soon';
        body = `تنبيه: السجل التجاري لمتجرك سينتهي خلال ${diffDays} أيام. يرجى تجهيز وثائق جديدة ورفعها لتجنب تعليق الحساب.`;
        bodyEn = `Warning: Your store's commercial register expires in ${diffDays} days. Please prepare and upload new documents to prevent account suspension.`;
      } else if (diffDays <= 30) {
        shouldWarn = true;
        title = 'تذكير: اقتراب انتهاء وثيقة التوثيق';
        titleEn = 'Reminder: Store verification document expiring soon';
        body = `تذكير: ينتهي السجل التجاري لمتجرك خلال ${diffDays} يوماً. يرجى تحديث وثائق التوثيق قبل تاريخ الانتهاء.`;
        bodyEn = `Reminder: Your store's commercial register expires in ${diffDays} days. Please update your verification documents before the expiry date.`;
      }

      if (shouldWarn) {
        // Check if we sent a warning notification in the last 6 days to prevent spamming
        const recentNotif = await db.notification.findFirst({
          where: {
            userId: ver.userId,
            title: { in: ['تحذير: توثيق متجرك ينتهي قريباً جداً', 'تذكير: اقتراب انتهاء وثيقة التوثيق'] },
            createdAt: { gte: new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000) },
          },
        });

        if (!recentNotif) {
          await db.notification.create({
            data: {
              userId: ver.userId,
              type: 'system',
              title,
              titleEn,
              body,
              bodyEn,
            },
          });
          warningLogs.push(`Warning sent to: ${ver.userId} (${diffDays} days remaining)`);
        }
      }
    }

    return NextResponse.json({
      success: true,
      processedExpirations: expiredLogs.length,
      warningsSent: warningLogs.length,
      expiredLogs,
      warningLogs,
    });
  } catch (error) {
    console.error('[check-expired GET] Error:', error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
