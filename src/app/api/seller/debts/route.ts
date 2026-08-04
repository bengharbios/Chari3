import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { writeFile } from 'fs/promises';
import path from 'path';

export const dynamic = 'force-dynamic';

function getUploadDir(): string {
  const envDir = process.env.UPLOAD_DIR;
  if (envDir && !envDir.includes('/USER/')) return envDir;
  
  const cwd = process.cwd();
  if (cwd.includes('/domains/') && cwd.includes('/hbuilds/')) {
    const domainRoot = cwd.substring(0, cwd.indexOf('/hbuilds/'));
    return path.join(domainRoot, 'ChariDay_uploads');
  }
  
  return path.join(cwd, '..', 'ChariDay_uploads');
}

// GET /api/seller/debts?sellerId=xxx
export async function GET(req: NextRequest) {
  try {
    const sellerId = req.nextUrl.searchParams.get('sellerId');
    if (!sellerId) return NextResponse.json({ success: false, error: 'sellerId required' }, { status: 400 });

    const wallet = await db.wallet.findUnique({
      where: { userId: sellerId }
    });

    const receipts = await db.debtPaymentReceipt.findMany({
      where: { userId: sellerId },
      orderBy: { createdAt: 'desc' },
      take: 50
    });

    return NextResponse.json({
      success: true,
      receipts,
      debtAmount: wallet?.debt || 0,
      currency: wallet?.currency || 'DZD',
    });
  } catch (error) {
    console.error('[seller/debts GET]', error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}

// POST /api/seller/debts (multipart/form-data)
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const sellerId = formData.get('sellerId') as string;
    const amountStr = formData.get('amount') as string;
    const note = formData.get('note') as string;
    const file = formData.get('receipt') as File;

    if (!sellerId || !amountStr || !file) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }

    const amount = Number(amountStr);
    if (isNaN(amount) || amount <= 0) {
      return NextResponse.json({ success: false, error: 'Invalid amount' }, { status: 400 });
    }

    // Upload receipt image
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    // Validate file type
    const mimeType = file.type;
    if (!mimeType.startsWith('image/') && mimeType !== 'application/pdf') {
      return NextResponse.json({ success: false, error: 'Invalid file type. Only images and PDFs are allowed.' }, { status: 400 });
    }

    const extension = file.name.split('.').pop() || 'png';
    const filename = `receipt_${sellerId}_${Date.now()}.${extension}`;
    
    const UPLOAD_DIR = getUploadDir();
    // Ensure dir exists is usually handled by setup, but let's assume it exists
    const filePath = path.join(UPLOAD_DIR, filename);
    await writeFile(filePath, buffer);
    const receiptImage = `/api/files/${filename}`;

    const receipt = await db.debtPaymentReceipt.create({
      data: {
        userId: sellerId,
        amount,
        merchantNote: note,
        receiptImage,
        status: 'pending'
      }
    });

    return NextResponse.json({ success: true, receipt });
  } catch (error) {
    console.error('[seller/debts POST]', error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
