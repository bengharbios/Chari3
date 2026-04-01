import { NextRequest, NextResponse } from 'next/server';
import { readFile, stat } from 'fs/promises';
import path from 'path';

const ALLOWED_EXTENSIONS = ['.pdf', '.jpg', '.jpeg', '.png'];

const MIME_MAP: Record<string, string> = {
  '.pdf':  'application/pdf',
  '.jpg':  'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png':  'image/png',
};

function getUploadDir(): string {
  const envDir = process.env.UPLOAD_DIR;
  if (envDir && !envDir.includes('/USER/')) return envDir;
  return path.join(process.cwd(), 'upload');
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path: pathSegments } = await params;
    const filename = pathSegments.join('/');
    const UPLOAD_DIR = getUploadDir();

    if (!/^[a-zA-Z0-9._-]+$/.test(filename)) {
      return NextResponse.json({ error: 'Invalid filename' }, { status: 400 });
    }

    const ext = path.extname(filename).toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      return NextResponse.json({ error: 'File type not allowed' }, { status: 403 });
    }

    const resolvedDir = path.resolve(UPLOAD_DIR);
    const resolvedFile = path.resolve(UPLOAD_DIR, filename);
    if (!resolvedFile.startsWith(resolvedDir + path.sep) && resolvedFile !== resolvedDir) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    try {
      const fileStat = await stat(resolvedFile);
      if (fileStat.isDirectory()) {
        return NextResponse.json({ error: 'Not found' }, { status: 404 });
      }
    } catch {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    const buffer = await readFile(resolvedFile);
    const mimeType = MIME_MAP[ext] || 'application/octet-stream';
    const basename = path.basename(filename);

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': mimeType,
        'Content-Length': buffer.length.toString(),
        'Content-Disposition': `inline; filename="${basename}"`,
        'Cache-Control': 'private, max-age=86400',
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY',
        'Referrer-Policy': 'no-referrer',
      },
    });
  } catch (error) {
    console.error('[files] Serve error:', error);
    return NextResponse.json({ error: 'Failed to read file' }, { status: 500 });
  }
}
