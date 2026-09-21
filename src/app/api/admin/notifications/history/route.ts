import { auth } from '@/lib/better-auth';
import { headers } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch the last 500 admin broadcast notifications
    const recentNotifs = await db.notification.findMany({
      where: {
        data: {
          contains: '"senderAdminId"',
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 500,
      select: {
        id: true,
        title: true,
        titleEn: true,
        body: true,
        bodyEn: true,
        type: true,
        isRead: true,
        data: true,
        createdAt: true,
        userId: true,
      },
    });

    // Group notifications by batchId (or composite key title + timestamp minute)
    const batchesMap = new Map<string, {
      batchId: string;
      title: string;
      titleEn: string | null;
      body: string;
      bodyEn: string | null;
      type: string;
      createdAt: string;
      recipientCount: number;
      readCount: number;
      unreadCount: number;
      readRate: number;
      senderAdminName: string;
      targetCriteria: any;
      parsedData: any;
    }>();

    for (const notif of recentNotifs) {
      let parsed: any = {};
      try {
        parsed = JSON.parse(notif.data || '{}');
      } catch (e) {}

      const batchId = parsed.batchId || `${notif.title}_${new Date(notif.createdAt).toISOString().slice(0, 16)}`;

      if (!batchesMap.has(batchId)) {
        batchesMap.set(batchId, {
          batchId,
          title: notif.title,
          titleEn: notif.titleEn,
          body: notif.body,
          bodyEn: notif.bodyEn,
          type: notif.type,
          createdAt: notif.createdAt.toISOString(),
          recipientCount: 1,
          readCount: notif.isRead ? 1 : 0,
          unreadCount: notif.isRead ? 0 : 1,
          readRate: notif.isRead ? 100 : 0,
          senderAdminName: parsed.senderAdminName || 'Admin',
          targetCriteria: parsed.targetCriteria || { target: 'all', targetStatus: 'all', targetLanguage: 'all' },
          parsedData: parsed,
        });
      } else {
        const existing = batchesMap.get(batchId)!;
        existing.recipientCount += 1;
        if (notif.isRead) {
          existing.readCount += 1;
        } else {
          existing.unreadCount += 1;
        }
        existing.readRate = Math.round((existing.readCount / existing.recipientCount) * 100);
      }
    }

    const history = Array.from(batchesMap.values()).slice(0, 100);

    // Calculate aggregated KPIs
    const totalDelivered = history.reduce((sum, item) => sum + item.recipientCount, 0);
    const totalRead = history.reduce((sum, item) => sum + item.readCount, 0);
    const overallReadRate = totalDelivered > 0 ? Math.round((totalRead / totalDelivered) * 100) : 0;

    const stats = {
      totalBroadcasts: history.length,
      totalDelivered,
      totalRead,
      overallReadRate,
    };

    return NextResponse.json({ success: true, history, stats });
  } catch (error) {
    console.error('[notifications-history error]', error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
