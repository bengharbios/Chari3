import { auth } from '@/lib/better-auth';
import { headers } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

// POST /api/admin/notifications/send
// Sends a custom notification to targeted users (Admin only)
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
      target,
      userId,
      type,
      actionPage,
      actionUrl,
      actionLabelAr,
      actionLabelEn,
      urgency,
    } = body;

    if (!title || !content || !target) {
      return NextResponse.json({ success: false, error: 'Missing required fields: title, body, target' }, { status: 400 });
    }

    // 1. Determine target user IDs
    let targetUserIds: string[] = [];

    if (target === 'user') {
      if (!userId) {
        return NextResponse.json({ success: false, error: 'userId is required when target is "user"' }, { status: 400 });
      }
      const userExists = await db.user.findUnique({ where: { id: userId }, select: { id: true } });
      if (!userExists) {
        return NextResponse.json({ success: false, error: 'Target user not found' }, { status: 404 });
      }
      targetUserIds = [userId];
    } else {
      let roleFilter: string | undefined;
      if (target === 'sellers') roleFilter = 'seller';
      else if (target === 'store_managers') roleFilter = 'store_manager';
      else if (target === 'buyers') roleFilter = 'buyer';

      const users = await db.user.findMany({
        where: roleFilter ? { role: roleFilter } : undefined,
        select: { id: true },
      });
      targetUserIds = users.map((u) => u.id);
    }

    if (targetUserIds.length === 0) {
      return NextResponse.json({ success: true, message: 'No target users found, 0 notifications sent' });
    }

    // 2. Build the dynamic action data payload
    const actionData = {
      actionPage: actionPage || null,
      actionUrl: actionUrl || null,
      actionLabelAr: actionLabelAr || 'عرض التفاصيل',
      actionLabelEn: actionLabelEn || 'View Details',
      urgency: urgency || 'normal',
    };

    const dataString = JSON.stringify(actionData);

    // 3. Create notifications in bulk
    const notificationData = targetUserIds.map((uid) => ({
      userId: uid,
      title,
      titleEn: titleEn || title,
      body: content,
      bodyEn: bodyEn || content,
      type: type || 'system',
      data: dataString,
    }));

    // Use Prisma createMany for bulk insertion (highly optimized)
    const result = await db.notification.createMany({
      data: notificationData,
    });

    return NextResponse.json({
      success: true,
      message: `Successfully sent ${result.count} notifications`,
      count: result.count,
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
