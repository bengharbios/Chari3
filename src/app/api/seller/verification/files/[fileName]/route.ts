import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import { readFile } from 'fs/promises';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

function getKycUploadDir(): string {
  return path.join(process.cwd(), '..', 'ChariDay_uploads', 'kyc_vault');
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ fileName: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    // Only sellers, store managers, and admins can view KYC files
    if (!session || !session.user || !['seller', 'store_manager', 'admin'].includes(session.user.role)) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { fileName } = await params;
    if (!fileName || fileName.includes('..')) {
      return new NextResponse('Invalid file name', { status: 400 });
    }

    const UPLOAD_DIR = getKycUploadDir();
    const filePath = path.join(UPLOAD_DIR, fileName);

    // Read file
    const fileBuffer = await readFile(filePath);

    // Determine content type based on extension
    const ext = path.extname(fileName).toLowerCase();
    let contentType = 'application/octet-stream';
    if (ext === '.jpg' || ext === '.jpeg') contentType = 'image/jpeg';
    else if (ext === '.png') contentType = 'image/png';
    else if (ext === '.pdf') contentType = 'application/pdf';

    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        // Prevent caching for secure documents
        'Cache-Control': 'no-store, max-age=0',
      },
    });
  } catch (error) {
    console.error('Error fetching secure file:', error);
    return new NextResponse('File not found', { status: 404 });
  }
}
