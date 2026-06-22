import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import { db as prisma } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

const ALLOWED_EXTENSIONS = ['.pdf', '.jpg', '.jpeg', '.png'];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB for KYC docs

function getKycUploadDir(): string {
  return path.join(process.cwd(), '..', 'ChariDay_uploads', 'kyc_vault');
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const formData = await request.formData();
    const userIdParam = formData.get('userId') as string | null;

    let userId = session?.user?.id;
    let role = session?.user?.role;

    if (!userId && userIdParam) {
      const dbUser = await prisma.user.findUnique({ where: { id: userIdParam } });
      if (dbUser) {
        userId = dbUser.id;
        role = dbUser.role;
      }
    }

    if (!userId || !['seller', 'store_manager'].includes(role || '')) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const sellerProfile = await prisma.sellerProfile.findUnique({
      where: { userId }
    });

    if (!sellerProfile) {
      return NextResponse.json({ success: false, error: 'Seller profile not found' }, { status: 404 });
    }

    const file = formData.get('file') as File | null;
    const documentType = formData.get('type') as string;

    if (!file || !documentType) {
      return NextResponse.json({ success: false, error: 'File and type are required.' }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ success: false, error: 'File too large. Max 10MB.' }, { status: 400 });
    }

    const ext = path.extname(file.name).toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      return NextResponse.json({ success: false, error: `Invalid type "${ext}".` }, { status: 400 });
    }

    const bytes = new Uint8Array(await file.arrayBuffer());
    const buffer = Buffer.from(bytes);

    const UPLOAD_DIR = getKycUploadDir();
    await mkdir(UPLOAD_DIR, { recursive: true });

    const uniqueId = crypto.randomBytes(16).toString('hex');
    const uniqueFileName = `kyc_${sellerProfile.id}_${uniqueId}${ext}`;
    const resolvedFile = path.resolve(UPLOAD_DIR, uniqueFileName);

    await writeFile(resolvedFile, buffer, { mode: 0o600 }); // Restrictive permissions

    // Upsert the Verification record if it doesn't exist
    const verification = await prisma.sellerVerification.upsert({
      where: { sellerId: sellerProfile.id },
      update: {},
      create: {
        sellerId: sellerProfile.id,
        status: 'NOT_SUBMITTED',
      }
    });

    // Create the document record
    const document = await prisma.verificationDocument.create({
      data: {
        verificationId: verification.id,
        type: documentType as any,
        url: `/api/seller/verification/files/${uniqueFileName}`, // Secure route
        status: 'PENDING',
      }
    });

    return NextResponse.json({
      success: true,
      document
    });
  } catch (error) {
    console.error('KYC Upload Error:', error);
    return NextResponse.json({ success: false, error: 'Upload failed' }, { status: 500 });
  }
}
