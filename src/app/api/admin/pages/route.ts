import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/better-auth';
import { headers } from 'next/headers';

export async function GET(req: NextRequest) {
  try {
    const session = await getSession(await headers());
    if (!session || (session.user as any).role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const pages = await db.customPage.findMany({
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
    const session = await getSession(await headers());
    if (!session || (session.user as any).role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { slug, titleAr, titleEn, titleFr } = body;

    if (!slug || !titleAr || !titleEn || !titleFr) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }

    // Check if slug exists
    const existing = await db.customPage.findUnique({ where: { slug } });
    if (existing) {
      return NextResponse.json({ success: false, error: 'Slug already exists' }, { status: 400 });
    }

    const page = await db.customPage.create({
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
