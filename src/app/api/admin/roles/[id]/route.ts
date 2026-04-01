import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { filterValidPermissions } from '@/lib/permissions';

// ============================================
// GET — Get single role by ID
// ============================================

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const role = await db.role.findUnique({
      where: { id },
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

    if (!role) {
      return NextResponse.json(
        { success: false, error: 'Role not found' },
        { status: 404 }
      );
    }

    // Count users with this role
    const userCount = await db.user.count({
      where: { role: role.key },
    });

    // Parse permissions
    let parsedPermissions: string[] = [];
    try {
      parsedPermissions = JSON.parse(role.permissions);
    } catch {
      parsedPermissions = [];
    }

    return NextResponse.json({
      success: true,
      role: {
        ...role,
        permissions: parsedPermissions,
        _count: { users: userCount },
      },
    });
  } catch (error) {
    console.error('[GET /api/admin/roles/[id]] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch role' },
      { status: 500 }
    );
  }
}

// ============================================
// PATCH — Update role
// ============================================
// Cannot update: key, isSystem
// System roles CAN be edited (permissions, descriptions) but NOT deleted.

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const existing = await db.role.findUnique({ where: { id } });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Role not found' },
        { status: 404 }
      );
    }

    const updateData: Record<string, unknown> = {};
    const changes: string[] = [];

    // ---- nameAr ----
    if (body.nameAr !== undefined && body.nameAr !== existing.nameAr) {
      updateData.nameAr = body.nameAr;
      changes.push('nameAr');
    }

    // ---- nameEn ----
    if (body.nameEn !== undefined && body.nameEn !== existing.nameEn) {
      updateData.nameEn = body.nameEn;
      changes.push('nameEn');
    }

    // ---- descriptionAr ----
    if (body.descriptionAr !== undefined && body.descriptionAr !== existing.descriptionAr) {
      updateData.descriptionAr = body.descriptionAr;
      changes.push('descriptionAr');
    }

    // ---- descriptionEn ----
    if (body.descriptionEn !== undefined && body.descriptionEn !== existing.descriptionEn) {
      updateData.descriptionEn = body.descriptionEn;
      changes.push('descriptionEn');
    }

    // ---- color ----
    if (body.color !== undefined && body.color !== existing.color) {
      updateData.color = body.color;
      changes.push('color');
    }

    // ---- icon ----
    if (body.icon !== undefined && body.icon !== existing.icon) {
      updateData.icon = body.icon;
      changes.push('icon');
    }

    // ---- permissions ----
    if (body.permissions !== undefined) {
      if (!Array.isArray(body.permissions)) {
        return NextResponse.json(
          { success: false, error: 'Permissions must be an array of permission keys' },
          { status: 400 }
        );
      }

      const validated = filterValidPermissions(body.permissions);

      if (validated.length !== body.permissions.length) {
        const invalid = (body.permissions as string[]).filter(
          (p) => !validated.includes(p)
        );
        return NextResponse.json(
          {
            success: false,
            error: 'Invalid permission keys found',
            invalidKeys: invalid,
          },
          { status: 400 }
        );
      }

      updateData.permissions = JSON.stringify(validated);
      changes.push(`permissions(${validated.length})`);
    }

    // ---- isActive ----
    if (typeof body.isActive === 'boolean' && body.isActive !== existing.isActive) {
      updateData.isActive = body.isActive;
      changes.push(`isActive→${body.isActive}`);
    }

    // ---- sortOrder ----
    if (typeof body.sortOrder === 'number' && body.sortOrder !== existing.sortOrder) {
      updateData.sortOrder = body.sortOrder;
      changes.push('sortOrder');
    }

    // ---- Reject updates to protected fields ----
    if (body.key !== undefined) {
      return NextResponse.json(
        { success: false, error: 'Cannot update role key' },
        { status: 400 }
      );
    }

    if (body.isSystem !== undefined) {
      return NextResponse.json(
        { success: false, error: 'Cannot update isSystem flag' },
        { status: 400 }
      );
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { success: false, error: 'No valid fields to update' },
        { status: 400 }
      );
    }

    // ---- Apply update ----

    const updated = await db.role.update({
      where: { id },
      data: updateData,
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

    // ---- Audit log ----

    let parsedPermissions: string[] = [];
    try {
      parsedPermissions = JSON.parse(updated.permissions);
    } catch {
      parsedPermissions = [];
    }

    await db.auditLog.create({
      data: {
        userId: body.adminId || 'system',
        adminId: body.adminId || null,
        action: 'admin_role_updated',
        roleId: id,
        details: JSON.stringify({
          roleKey: updated.key,
          changes,
          previousValues: {
            nameAr: existing.nameAr,
            nameEn: existing.nameEn,
            color: existing.color,
            icon: existing.icon,
            isActive: existing.isActive,
            sortOrder: existing.sortOrder,
          },
          newValues: updateData,
        }),
      },
    });

    return NextResponse.json({
      success: true,
      role: {
        ...updated,
        permissions: parsedPermissions,
      },
      changes,
    });
  } catch (error) {
    console.error('[PATCH /api/admin/roles/[id]] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update role' },
      { status: 500 }
    );
  }
}

// ============================================
// DELETE — Delete role (non-system only)
// ============================================
// System roles (isSystem=true) CANNOT be deleted.
// If any users have this role, returns error asking to reassign first.

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json().catch(() => ({}));

    const existing = await db.role.findUnique({
      where: { id },
      select: {
        id: true,
        key: true,
        nameAr: true,
        nameEn: true,
        isSystem: true,
      },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Role not found' },
        { status: 404 }
      );
    }

    // ---- Cannot delete system roles ----
    if (existing.isSystem) {
      return NextResponse.json(
        {
          success: false,
          error: `Cannot delete system role "${existing.key}". System roles can only be edited, not deleted.`,
          isSystem: true,
          roleKey: existing.key,
        },
        { status: 403 }
      );
    }

    // ---- Check if any users have this role ----
    const userCount = await db.user.count({
      where: { role: existing.key },
    });

    if (userCount > 0) {
      return NextResponse.json(
        {
          success: false,
          error: `Cannot delete role "${existing.key}" because ${userCount} user(s) are still assigned to it. Please reassign these users to another role before deleting.`,
          userCount,
          roleKey: existing.key,
          requiresReassignment: true,
        },
        { status: 409 }
      );
    }

    // ---- Delete the role ----
    await db.role.delete({ where: { id } });

    // ---- Audit log ----
    await db.auditLog.create({
      data: {
        userId: body.adminId || 'system',
        adminId: body.adminId || null,
        action: 'admin_role_deleted',
        details: JSON.stringify({
          deletedRoleKey: existing.key,
          deletedRoleNameAr: existing.nameAr,
          deletedRoleNameEn: existing.nameEn,
          isSystem: existing.isSystem,
        }),
      },
    });

    return NextResponse.json({
      success: true,
      deleted: {
        id: existing.id,
        key: existing.key,
        nameAr: existing.nameAr,
        nameEn: existing.nameEn,
      },
    });
  } catch (error) {
    console.error('[DELETE /api/admin/roles/[id]] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete role' },
      { status: 500 }
    );
  }
}
