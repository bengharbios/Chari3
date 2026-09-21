import { auth } from '@/lib/better-auth';
import { headers } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

// POST /api/admin/notifications/send
// Sends a custom notification to targeted users with full role, status, language, and nested translations support
export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const {
      title,
      titleEn,
      body: content,
      bodyEn,
      target, // 'all', 'seller', 'store_manager', 'buyer', 'logistics', 'supplier', 'admin', 'user', 'specific_store'
      targetStatus = 'all', // 'all', 'active', 'incomplete', 'pending', 'suspended', 'rejected'
      targetLanguage = 'all', // 'all', 'ar', 'en', 'fr', 'es'
      userId,
      storeId,
      type = 'system',
      actionPage,
      actionUrl,
      actionLabelAr,
      actionLabelEn,
      urgency = 'normal',
      translations = {}, // Clean nested structure: { ar: { title, body, actionLabel }, en: ..., fr: ..., es: ... }
    } = body;

    // The primary title/content comes from either direct fields or translations.ar / translations.en
    const primaryTitle = title || translations?.ar?.title || translations?.en?.title;
    const primaryBody = content || translations?.ar?.body || translations?.en?.body;

    if (!primaryTitle || !primaryBody || !target) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: title, body, target',
      }, { status: 400 });
    }

    // 1. Determine target user IDs
    let targetUserIds: string[] = [];

    if (target === 'user') {
      if (!userId) {
        return NextResponse.json({ success: false, error: 'userId is required when target is "user"' }, { status: 400 });
      }
      const targetUser = await db.user.findFirst({
        where: {
          OR: [
            { id: userId },
            { email: userId }
          ]
        },
        select: { id: true },
      });
      if (!targetUser) {
        return NextResponse.json({ success: false, error: 'Target user not found' }, { status: 404 });
      }
      targetUserIds = [targetUser.id];
    } else if (target === 'specific_store' && storeId) {
      const store = await db.store.findUnique({
        where: { id: storeId },
        select: {
          managerId: true,
          staff: { select: { userId: true } }
        }
      });
      if (!store) {
        return NextResponse.json({ success: false, error: 'Store not found' }, { status: 404 });
      }
      const idSet = new Set<string>();
      if (store.managerId) idSet.add(store.managerId);
      store.staff.forEach(s => idSet.add(s.userId));
      targetUserIds = Array.from(idSet);
    } else {
      const whereClause: any = {};

      // Role filter
      if (target && target !== 'all') {
        if (target === 'seller' || target === 'sellers') {
          whereClause.role = { in: ['seller', 'store'] };
        } else if (target === 'store_manager' || target === 'store_managers') {
          whereClause.role = 'store_manager';
        } else if (target === 'buyer' || target === 'buyers') {
          whereClause.role = 'buyer';
        } else if (target === 'logistics' || target === 'delivery') {
          whereClause.role = { in: ['logistics', 'delivery'] };
        } else if (target === 'supplier' || target === 'suppliers') {
          whereClause.role = 'supplier';
        } else if (target === 'admin' || target === 'admins') {
          whereClause.role = { in: ['admin', 'super_admin'] };
        } else {
          whereClause.role = target;
        }
      }

      // Status filter
      if (targetStatus && targetStatus !== 'all') {
        if (targetStatus === 'active') {
          whereClause.accountStatus = 'active';
          whereClause.isActive = true;
        } else if (targetStatus === 'incomplete') {
          whereClause.accountStatus = 'incomplete';
        } else if (targetStatus === 'pending') {
          whereClause.accountStatus = 'pending';
        } else if (targetStatus === 'suspended') {
          whereClause.OR = [
            { accountStatus: 'suspended' },
            { isActive: false }
          ];
        } else if (targetStatus === 'rejected') {
          whereClause.accountStatus = 'rejected';
        }
      }

      // Language filter
      if (targetLanguage && targetLanguage !== 'all') {
        whereClause.locale = targetLanguage;
      }

      const users = await db.user.findMany({
        where: whereClause,
        select: { id: true },
      });
      targetUserIds = users.map((u) => u.id);
    }

    if (targetUserIds.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No target users matched the criteria, 0 notifications sent',
        count: 0,
      });
    }

    // 2. Generate batchId & build unified data payload
    const batchId = `broadcast_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

    // Prepare unified translations map
    const unifiedTranslations: Record<string, { title: string; body: string; actionLabel?: string }> = {
      ...(translations || {}),
    };

    if (!unifiedTranslations.ar) {
      unifiedTranslations.ar = {
        title: primaryTitle,
        body: primaryBody,
        actionLabel: actionLabelAr || 'عرض التفاصيل',
      };
    }
    if (!unifiedTranslations.en && (titleEn || bodyEn)) {
      unifiedTranslations.en = {
        title: titleEn || primaryTitle,
        body: bodyEn || primaryBody,
        actionLabel: actionLabelEn || 'View Details',
      };
    }

    const actionData = {
      batchId,
      senderAdminId: session.user.id,
      senderAdminName: session.user.name || 'Admin',
      actionPage: actionPage || null,
      actionUrl: actionUrl || null,
      actionLabelAr: actionLabelAr || unifiedTranslations.ar?.actionLabel || 'عرض التفاصيل',
      actionLabelEn: actionLabelEn || unifiedTranslations.en?.actionLabel || 'View Details',
      urgency: urgency || 'normal',
      targetCriteria: {
        target,
        targetStatus,
        targetLanguage,
        storeId: storeId || null,
      },
      translations: unifiedTranslations,
    };

    const dataString = JSON.stringify(actionData);

    // 3. Create notifications in bulk
    const effectiveTitleEn = unifiedTranslations.en?.title || titleEn || primaryTitle;
    const effectiveBodyEn = unifiedTranslations.en?.body || bodyEn || primaryBody;

    const notificationData = targetUserIds.map((uid) => ({
      userId: uid,
      title: primaryTitle,
      titleEn: effectiveTitleEn,
      body: primaryBody,
      bodyEn: effectiveBodyEn,
      type: type || 'system',
      data: dataString,
    }));

    const result = await db.notification.createMany({
      data: notificationData,
    });

    // 4. Record audit log
    try {
      await db.auditLog.create({
        data: {
          userId: session.user.id,
          action: 'BROADCAST_NOTIFICATION',
          entityType: 'NOTIFICATION',
          entityId: batchId,
          details: JSON.stringify({
            batchId,
            target,
            targetStatus,
            targetLanguage,
            sentCount: result.count,
            primaryTitle,
            urgency,
          }),
        },
      });
    } catch (auditErr) {
      console.warn('[AuditLog notification broadcast error]', auditErr);
    }

    return NextResponse.json({
      success: true,
      message: `Successfully sent ${result.count} notifications`,
      count: result.count,
      batchId,
    });
  } catch (error) {
    console.error('[send-notification error]', error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
