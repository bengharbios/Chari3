import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { seedRoles } from '@/lib/seed-roles';
import {
  TOTAL_PERMISSIONS,
  PERMISSION_CATEGORIES,
  ALL_PERMISSIONS,
  filterValidPermissions,
} from '@/lib/permissions';

// ============================================
// GET — List all roles (with optional seed trigger)
// ============================================

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const shouldSeed = searchParams.get('seed') === 'true';

    // Seed roles if requested
    if (shouldSeed) {
      const seedResult = await seedRoles();
      console.log(`[GET /api/admin/roles] Seeding triggered:`, seedResult);
    }

    // Fetch all roles ordered by sortOrder
    const roles = await db.role.findMany({
      orderBy: { sortOrder: 'asc' },
      select: {
        id: true,
        key: true,
        nameAr: true,
        nameEn: true,
        descriptionAr: true,
        descriptionEn: true,
        color: true,
        icon: true,
        permissions: true,
        isSystem: true,
        sortOrder: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    // For each role, count users that have this role key in User.role
    const rolesWithCounts = await Promise.all(
      roles.map(async (role) => {
        const userCount = await db.user.count({
          where: { role: role.key },
        });

        // Parse permissions JSON for convenience
        let parsedPermissions: string[] = [];
        try {
          parsedPermissions = JSON.parse(role.permissions);
        } catch {
          parsedPermissions = [];
        }

        return {
          ...role,
          permissions: parsedPermissions,
          _count: { users: userCount },
        };
      })
    );

    return NextResponse.json({
      success: true,
      roles: rolesWithCounts,
      totalPermissions: TOTAL_PERMISSIONS,
      categories: PERMISSION_CATEGORIES.length,
    });
  } catch (error) {
    console.error('[GET /api/admin/roles] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch roles' },
      { status: 500 }
    );
  }
}

// ============================================
// POST — Create new custom role
// ============================================

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      key,
      nameAr,
      nameEn,
      descriptionAr,
      descriptionEn,
      color,
      icon,
      permissions,
      sortOrder,
    } = body;

    // ---- Validation ----

    if (!key) {
      return NextResponse.json(
        { success: false, error: 'Role key is required' },
        { status: 400 }
      );
    }

    if (!nameAr || !nameEn) {
      return NextResponse.json(
        { success: false, error: 'Both nameAr and nameEn are required' },
        { status: 400 }
      );
    }

    // Key must be lowercase, no spaces, alphanumeric + underscores only
    const keyRegex = /^[a-z][a-z0-9_]*$/;
    if (!keyRegex.test(key)) {
      return NextResponse.json(
        {
          success: false,
          error:
            'Role key must be lowercase, start with a letter, and contain only letters, numbers, and underscores (no spaces)',
        },
        { status: 400 }
      );
    }

    // Check uniqueness
    const existing = await db.role.findUnique({ where: { key } });
    if (existing) {
      return NextResponse.json(
        { success: false, error: `Role with key "${key}" already exists` },
        { status: 409 }
      );
    }

    // Validate and filter permissions
    let validatedPermissions: string[] = [];
    if (Array.isArray(permissions)) {
      validatedPermissions = filterValidPermissions(permissions);
      // Warn if some were filtered out
      if (validatedPermissions.length !== permissions.length) {
        console.warn(
          `[POST /api/admin/roles] ${permissions.length - validatedPermissions.length} invalid permission(s) filtered out`
        );
      }
    }

    // ---- Create role ----

    const role = await db.role.create({
      data: {
        key,
        nameAr,
        nameEn,
        descriptionAr: descriptionAr || null,
        descriptionEn: descriptionEn || null,
        color: color || '#6B7280',
        icon: icon || 'UserCircle',
        permissions: JSON.stringify(validatedPermissions),
        isSystem: false,
        sortOrder: typeof sortOrder === 'number' ? sortOrder : 100,
        isActive: true,
      },
    });

    // ---- Audit log ----

    await db.auditLog.create({
      data: {
        userId: body.adminId || 'system',
        adminId: body.adminId || null,
        action: 'admin_role_created',
        roleId: role.id,
        details: JSON.stringify({
          roleKey: key,
          nameAr,
          nameEn,
          permissionsCount: validatedPermissions.length,
          isSystem: false,
        }),
      },
    });

    return NextResponse.json(
      {
        success: true,
        role: {
          ...role,
          permissions: validatedPermissions,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('[POST /api/admin/roles] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create role' },
      { status: 500 }
    );
  }
}
