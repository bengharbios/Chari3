import { auth } from '@/lib/better-auth';
import { headers } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

// GET /api/admin/announcements
// Fetches active announcements (for frontend display) OR all announcements (for admin management)
export async function GET(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    const { searchParams } = new URL(req.url);
    const all = searchParams.get('all') === 'true';

    // If requesting all (admin management view), verify admin session
    if (all) {
      if (!session || session.user.role !== 'admin') {
        return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
      }
      const announcements = await db.announcement.findMany({
        orderBy: { createdAt: 'desc' },
      });
      return NextResponse.json({ success: true, data: announcements });
    }

    // Public/User view: fetch only active announcements matching the user's role
    const role = session?.user?.role || 'guest';
    
    const announcements = await db.announcement.findMany({
      where: {
        isActive: true,
        OR: [
          { targetRole: 'all' },
          { targetRole: role },
        ],
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, data: announcements });
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}

// POST /api/admin/announcements
// Creates a new announcement banner (Admin only)
export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { contentAr, contentEn, targetRole, bgColor, textColor, linkUrl, startsAt, endsAt, isActive } = body;

    if (!contentAr) {
      return NextResponse.json({ success: false, error: 'Missing required field: contentAr' }, { status: 400 });
    }

    const announcement = await db.announcement.create({
      data: {
        contentAr,
        contentEn: contentEn || null,
        targetRole: targetRole || 'all',
        bgColor: bgColor || 'bg-primary',
        textColor: textColor || 'text-white',
        linkUrl: linkUrl || null,
        startsAt: startsAt ? new Date(startsAt) : null,
        endsAt: endsAt ? new Date(endsAt) : null,
        isActive: isActive ?? true,
      },
    });

    return NextResponse.json({ success: true, data: announcement });
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}

// PUT /api/admin/announcements
// Updates an announcement banner (Admin only)
export async function PUT(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { id, contentAr, contentEn, targetRole, bgColor, textColor, linkUrl, startsAt, endsAt, isActive } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: 'Missing required field: id' }, { status: 400 });
    }

    const updated = await db.announcement.update({
      where: { id },
      data: {
        contentAr,
        contentEn,
        targetRole,
        bgColor,
        textColor,
        linkUrl,
        startsAt: startsAt ? new Date(startsAt) : null,
        endsAt: endsAt ? new Date(endsAt) : null,
        isActive,
      },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}

// DELETE /api/admin/announcements
// Deletes an announcement banner (Admin only)
export async function DELETE(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'Missing required query parameter: id' }, { status: 400 });
    }

    await db.announcement.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: 'Announcement deleted successfully' });
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
