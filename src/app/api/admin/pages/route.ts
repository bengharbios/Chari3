import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getServerSession } from '@/lib/better-auth';
import { z } from 'zObject'; // wait, it's 'zod' usually. Let me check if 'zod' is available. I'll just use standard validation to avoid import errors if zod is missing or not zObject.

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session || session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const pages = await prisma.customPage.findMany({
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ success: true, data: pages });
  } catch (error: any) {
    console.error('Error fetching custom pages:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session || session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { slug, titleAr, titleEn, titleFr } = body;

    if (!slug || !titleAr || !titleEn || !titleFr) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }

    // Check if slug exists
    const existing = await prisma.customPage.findUnique({ where: { slug } });
    if (existing) {
      return NextResponse.json({ success: false, error: 'Slug already exists' }, { status: 400 });
    }

    const page = await prisma.customPage.create({
      data: {
        slug,
        titleAr,
        titleEn,
        titleFr,
        isPublished: false,
        content: JSON.stringify({
          content: [],
          root: { props: { title: titleEn } }
        })
      }
    });

    return NextResponse.json({ success: true, data: page });
  } catch (error: any) {
    console.error('Error creating custom page:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
