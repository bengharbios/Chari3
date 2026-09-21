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

    // Fetch the last 200 admin broadcast notifications
    const recentNotifs = await db.notification.findMany({
      where: {
        data: {
          contains: '"senderAdminId"',
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 300,
      select: {
        id: true,
        title: true,
        titleEn: true,
        body: true,
        bodyEn: true,
        type: true,
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
          senderAdminName: parsed.senderAdminName || 'Admin',
          targetCriteria: parsed.targetCriteria || { role: 'all' },
          parsedData: parsed,
        });
      } else {
        const existing = batchesMap.get(batchId)!;
        existing.recipientCount += 1;
      }
    }

    const history = Array.from(batchesMap.values()).slice(0, 50);

    return NextResponse.json({ success: true, history });
  } catch (error) {
    console.error('[notifications-history error]', error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
