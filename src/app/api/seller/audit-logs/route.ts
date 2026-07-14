import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const userId = req.nextUrl.searchParams.get('userId');
    if (!userId) {
      return NextResponse.json({ success: false, error: 'userId is required' }, { status: 400 });
    }

    // 1. Find the store associated with the user
    // A user can be the seller/manager themselves, or a store staff member
    let store = await db.store.findFirst({
      where: { managerId: userId }
    });

    if (!store) {
      // Check if they are a staff member
      const staffLink = await db.storeStaff.findFirst({
        where: { userId },
        include: { store: true }
      });
      if (staffLink) {
        store = staffLink.store;
      }
    }

    if (!store) {
      return NextResponse.json({ success: false, error: 'Store not found' }, { status: 404 });
    }

    // 2. Fetch all user IDs in this store's team
    const staffMembers = await db.storeStaff.findMany({
      where: { storeId: store.id },
      select: { userId: true }
    });

    const teamUserIds = [store.managerId, ...staffMembers.map(s => s.userId)];

    // 3. Fetch audit logs for all team members
    const logs = await db.auditLog.findMany({
      where: {
        userId: { in: teamUserIds }
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            nameEn: true,
            email: true,
            role: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 50 // Limit to last 50 events for performance
    });

    // Formatting for client presentation
    const formattedLogs = logs.map(log => {
      let detailsObj: any = {};
      if (log.details) {
        try {
          detailsObj = JSON.parse(log.details);
        } catch (e) {
          const reasonMatch = log.details.match(/"reason"\s*:\s*"([^"]*)"/);
          const reasonEnMatch = log.details.match(/"reasonEn"\s*:\s*"([^"]*)"/);
          const partialReason = log.details.match(/"reason"\s*:\s*"([^"]*)$/);
          const partialReasonEn = log.details.match(/"reasonEn"\s*:\s*"([^"]*)$/);
          const r = reasonMatch ? reasonMatch[1] : (partialReason ? partialReason[1] : '');
          const rEn = reasonEnMatch ? reasonEnMatch[1] : (partialReasonEn ? partialReasonEn[1] : '');
          detailsObj = { reason: r, reasonEn: rEn || r };
        }
      }

      return {
        id: log.id,
        user: log.user.name,
        userEn: log.user.nameEn || log.user.name,
        role: log.user.role,
        action: log.action,
        details: detailsObj.note || detailsObj.reason || log.action,
        detailsEn: detailsObj.noteEn || detailsObj.reasonEn || log.action,
        createdAt: log.createdAt,
        ipAddress: log.ipAddress
      };
    });

    return NextResponse.json({ success: true, logs: formattedLogs });
  } catch (error) {
    console.error('[seller/audit-logs GET]', error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
