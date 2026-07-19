import { NextResponse } from 'next/server';
import { db, ensureDbConnection } from '@/lib/db';

export const dynamic = 'force-dynamic';

// PATCH — Update a spec definition
export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    await ensureDbConnection();
    const body = await request.json();
    const { id } = params;

    const spec = await db.productSpecDefinition.update({
      where: { id },
      data: {
        ...(body.labelAr !== undefined && { labelAr: body.labelAr }),
        ...(body.labelEn !== undefined && { labelEn: body.labelEn }),
        ...(body.labelFr !== undefined && { labelFr: body.labelFr || null }),
        ...(body.type !== undefined && { type: body.type }),
        ...(body.options !== undefined && {
          options: body.options
            ? JSON.stringify(String(body.options).split(',').map((s: string) => s.trim()).filter(Boolean))
            : null,
        }),
        ...(body.isRequired !== undefined && { isRequired: !!body.isRequired }),
        ...(body.sortOrder !== undefined && { sortOrder: Number(body.sortOrder) }),
        ...(body.isActive !== undefined && { isActive: !!body.isActive }),
        ...(body.categoryId !== undefined && { categoryId: body.categoryId || null }),
      },
    });

    return NextResponse.json({ success: true, spec });
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}

// DELETE — Hard-delete a spec definition
export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  try {
    await ensureDbConnection();
    await db.productSpecDefinition.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
