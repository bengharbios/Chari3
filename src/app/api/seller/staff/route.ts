import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import bcrypt from 'bcryptjs';

export const dynamic = 'force-dynamic';

// GET /api/seller/staff?userId=xxx
export async function GET(req: NextRequest) {
  try {
    const userId = req.nextUrl.searchParams.get('userId');
    if (!userId) return NextResponse.json({ success: false, error: 'userId required' }, { status: 400 });

    const store = await db.store.findFirst({
      where: { managerId: userId },
      include: { package: true },
    });

    if (!store) {
      return NextResponse.json({ success: false, error: 'Store not found' }, { status: 404 });
    }

    const staffList = await db.storeStaff.findMany({
      where: { storeId: store.id },
      include: {
        user: { select: { id: true, name: true, nameEn: true, email: true, phone: true, isActive: true, role: true, avatar: true } }
      },
      orderBy: { joinedAt: 'desc' }
    });

    const maxTeamMembers = store.package?.maxTeamMembers || 1;

    return NextResponse.json({
      success: true,
      staff: staffList,
      maxTeamMembers,
      currentTeamSize: staffList.length,
    });
  } catch (error) {
    console.error('[GET /api/seller/staff]', error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}

// POST /api/seller/staff
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, name, email, phone, role } = body;

    if (!userId || !email || !name) {
      return NextResponse.json({ success: false, error: 'userId, name, and email are required' }, { status: 400 });
    }

    const store = await db.store.findFirst({
      where: { managerId: userId },
      include: { package: true },
    });

    if (!store) {
      return NextResponse.json({ success: false, error: 'Store not found' }, { status: 404 });
    }

    // Phase 3: Enforce maxTeamMembers
    const currentStaffCount = await db.storeStaff.count({ where: { storeId: store.id } });
    const maxTeamMembers = store.package?.maxTeamMembers || 1;

    if (currentStaffCount >= maxTeamMembers) {
      return NextResponse.json({ 
        success: false, 
        error: `تجاوزت الحد الأقصى للموظفين (${maxTeamMembers}). يرجى ترقية باقتك لإضافة المزيد.`
      }, { status: 403 });
    }

    // Check if user exists
    let staffUser = await db.user.findUnique({ where: { email } });

    if (!staffUser) {
      // Create new user with default password 'password123'
      const hashedPassword = await bcrypt.hash('password123', 10);
      staffUser = await db.user.create({
        data: {
          email,
          name,
          phone: phone || null,
          password: hashedPassword,
          role: role || 'staff',
        }
      });
    } else {
      // Update role if changed
      if (staffUser.role !== role) {
        await db.user.update({
          where: { id: staffUser.id },
          data: { role: role || 'staff' }
        });
      }
    }

    // Check if already in this store
    const existingStaff = await db.storeStaff.findUnique({
      where: {
        storeId_userId: {
          storeId: store.id,
          userId: staffUser.id
        }
      }
    });

    if (existingStaff) {
      return NextResponse.json({ success: false, error: 'الموظف موجود بالفعل في هذا المتجر' }, { status: 400 });
    }

    // Create staff mapping
    const newStaff = await db.storeStaff.create({
      data: {
        storeId: store.id,
        userId: staffUser.id,
        role: role || 'staff'
      },
      include: {
        user: { select: { id: true, name: true, nameEn: true, email: true, phone: true, isActive: true, role: true, avatar: true } }
      }
    });

    return NextResponse.json({ success: true, staff: newStaff });
  } catch (error) {
    console.error('[POST /api/seller/staff]', error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}

// PUT /api/seller/staff
// For updating roles or suspending staff
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, staffUserId, newRole, suspendAction } = body;

    if (!userId || !staffUserId) {
      return NextResponse.json({ success: false, error: 'userId and staffUserId required' }, { status: 400 });
    }

    const store = await db.store.findFirst({ where: { managerId: userId } });
    if (!store) {
      return NextResponse.json({ success: false, error: 'Store not found' }, { status: 404 });
    }

    const staffMapping = await db.storeStaff.findUnique({
      where: {
        storeId_userId: { storeId: store.id, userId: staffUserId }
      }
    });

    if (!staffMapping) {
      return NextResponse.json({ success: false, error: 'Staff member not found in this store' }, { status: 404 });
    }

    if (newRole) {
      // Update both User role and StoreStaff role for consistency
      await db.user.update({
        where: { id: staffUserId },
        data: { role: newRole }
      });
      await db.storeStaff.update({
        where: { id: staffMapping.id },
        data: { role: newRole }
      });
    }

    if (suspendAction !== undefined) {
      await db.user.update({
        where: { id: staffUserId },
        data: { isActive: !suspendAction } // if suspendAction is true, isActive becomes false
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[PUT /api/seller/staff]', error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}

// DELETE /api/seller/staff
export async function DELETE(req: NextRequest) {
  try {
    const userId = req.nextUrl.searchParams.get('userId');
    const staffUserId = req.nextUrl.searchParams.get('staffUserId');

    if (!userId || !staffUserId) {
      return NextResponse.json({ success: false, error: 'userId and staffUserId required' }, { status: 400 });
    }

    const store = await db.store.findFirst({ where: { managerId: userId } });
    if (!store) {
      return NextResponse.json({ success: false, error: 'Store not found' }, { status: 404 });
    }

    await db.storeStaff.delete({
      where: {
        storeId_userId: { storeId: store.id, userId: staffUserId }
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[DELETE /api/seller/staff]', error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
