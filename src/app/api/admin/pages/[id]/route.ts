import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getServerSession } from '@/lib/better-auth';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession();
    if (!session || session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const page = await prisma.customPage.findUnique({
      where: { id: params.id }
    });

    if (!page) {
      return NextResponse.json({ success: false, error: 'Page not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: page });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession();
    if (!session || session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    // Body can include full Puck content updates OR just metadata updates
    
    // Check if updating slug to something that already exists
    if (body.slug) {
      const existing = await prisma.customPage.findFirst({
        where: { slug: body.slug, id: { not: params.id } }
      });
      if (existing) {
        return NextResponse.json({ success: false, error: 'Slug already exists on another page' }, { status: 400 });
      }
    }

    const updated = await prisma.customPage.update({
      where: { id: params.id },
      data: {
        ...(body.slug && { slug: body.slug }),
        ...(body.titleAr && { titleAr: body.titleAr }),
        ...(body.titleEn && { titleEn: body.titleEn }),
        ...(body.titleFr && { titleFr: body.titleFr }),
        ...(body.content && { content: typeof body.content === 'object' ? JSON.stringify(body.content) : body.content }),
        ...(typeof body.isPublished === 'boolean' && { isPublished: body.isPublished })
      }
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    console.error('Error updating custom page:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession();
    if (!session || session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    await prisma.customPage.delete({
      where: { id: params.id }
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
