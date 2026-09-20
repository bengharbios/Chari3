import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/better-auth';
import { headers } from 'next/headers';

export async function POST(req: Request) {
  try {
    const session = await getSession(await headers());
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { storeIds, action, value } = body;

    if (!Array.isArray(storeIds) || storeIds.length === 0) {
      return NextResponse.json({ success: false, error: 'No stores selected' }, { status: 400 });
    }

    if (!action) {
      return NextResponse.json({ success: false, error: 'Action is required' }, { status: 400 });
    }

    const updateData: any = {};

    if (action === 'activate') {
      updateData.isActive = true;
    } else if (action === 'suspend') {
      updateData.isActive = false;
    } else if (action === 'set_commission') {
      const numVal = parseFloat(value);
      if (isNaN(numVal) || numVal < 0 || numVal > 100) {
        return NextResponse.json({ success: false, error: 'Invalid commission value (0-100)' }, { status: 400 });
      }
      updateData.commission = numVal;
    } else if (action === 'set_package') {
      updateData.packageId = value || null;
    } else {
      return NextResponse.json({ success: false, error: 'Unsupported bulk action' }, { status: 400 });
    }

    // Execute bulk update
    const result = await db.store.updateMany({
      where: { id: { in: storeIds } },
      data: updateData
    });

    // Record in AdminAuditLog
    const reqHeaders = await headers();
    const ip = reqHeaders.get('x-forwarded-for')?.split(',')[0]?.trim() || reqHeaders.get('x-real-ip') || '127.0.0.1';

    await db.adminAuditLog.create({
      data: {
        adminId: session.user.id,
        action: `BULK_${action.toUpperCase()}`,
        targetId: `Count: ${result.count}`,
        details: {
          storeIds,
          action,
          value,
          updatedCount: result.count
        },
        ipAddress: ip
      }
    });

    return NextResponse.json({
      success: true,
      message: `Successfully updated ${result.count} stores`,
      updatedCount: result.count
    });

  } catch (error: any) {
    console.error('[API admin/stores/bulk POST] Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
