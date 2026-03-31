import { NextRequest, NextResponse } from 'next/server';
import { readFile, stat } from 'fs/promises';
import path from 'path';

// ============================================
// SECURE FILE SERVING — serves uploaded files from external directory
// Security measures:
// - Path traversal protection (resolved path must be within UPLOAD_DIR)
// - Only serves allowed file types (no .php, .html, .exe, etc.)
// - Content-Type enforced (no MIME sniffing via X-Content-Type-Options)
// - No directory listing
// - Unguessable filenames (32 hex chars) = no enumeration risk
// ============================================

const UPLOAD_DIR = process.env.UPLOAD_DIR || path.join(process.cwd(), '..', 'chariday-uploads');

const ALLOWED_EXTENSIONS = ['.pdf', '.jpg', '.jpeg', '.png'];

const MIME_MAP: Record<string, string> = {
  '.pdf':  'application/pdf',
  '.jpg':  'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png':  'image/png',
};

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path: pathSegments } = await params;
    const filename = pathSegments.join('/');

    // SECURITY: Only allow safe characters in filename (no slashes, dots, etc.)
    if (!/^[a-zA-Z0-9._-]+$/.test(filename)) {
      return NextResponse.json({ error: 'Invalid filename' }, { status: 400 });
    }

    const ext = path.extname(filename).toLowerCase();

    // SECURITY: Only serve allowed file types
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      return NextResponse.json({ error: 'File type not allowed' }, { status: 403 });
    }

    // SECURITY: Path traversal protection
    const resolvedDir = path.resolve(UPLOAD_DIR);
    const resolvedFile = path.resolve(UPLOAD_DIR, filename);
    if (!resolvedFile.startsWith(resolvedDir + path.sep) && resolvedFile !== resolvedDir) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Check file exists
    try {
      const fileStat = await stat(resolvedFile);
      if (fileStat.isDirectory()) {
        // SECURITY: No directory listing
        return NextResponse.json({ error: 'Not found' }, { status: 404 });
      }
    } catch {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    // Read and serve file
    const buffer = await readFile(resolvedFile);
    const mimeType = MIME_MAP[ext] || 'application/octet-stream';
    const basename = path.basename(filename);

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': mimeType,
        'Content-Length': buffer.length.toString(),
        'Content-Disposition': `inline; filename="${basename}"`,
        'Cache-Control': 'private, max-age=86400', // Cache for 24h (private = no CDN)
        'X-Content-Type-Options': 'nosniff',      // SECURITY: Prevent MIME sniffing
        'X-Frame-Options': 'DENY',                // SECURITY: Prevent clickjacking
        'Referrer-Policy': 'no-referrer',          // SECURITY: Don't leak URLs
      },
    });
  } catch (error) {
    console.error('[files] Serve error:', error);
    return NextResponse.json({ error: 'Failed to read file' }, { status: 500 });
  }
}
