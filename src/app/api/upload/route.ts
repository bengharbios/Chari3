import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import crypto from 'crypto';

const UPLOAD_DIR = process.env.UPLOAD_DIR || path.join(process.cwd(), 'upload');

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_EXTENSIONS = ['.pdf', '.jpg', '.jpeg', '.png'];
const ALLOWED_MIME_TYPES = ['application/pdf', 'image/jpeg', 'image/png'];

// SECURITY: Magic bytes validation
const MAGIC_BYTES: Record<string, number[]> = {
  'image/jpeg':      [0xFF, 0xD8, 0xFF],
  'image/png':       [0x89, 0x50, 0x4E, 0x47],
  'application/pdf': [0x25, 0x50, 0x44, 0x46],
};

function validateMagicBytes(buffer: Buffer, mimeType: string): boolean {
  const expected = MAGIC_BYTES[mimeType];
  if (!expected) return true; // If unknown type, skip validation
  return expected.every((byte, i) => buffer[i] === byte);
}

function sanitizeFilename(name: string): string {
  return path.basename(name).replace(/[^a-zA-Z0-9._-]/g, '_').replace(/\0/g, '').replace(/\.\./g, '');
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ success: false, error: 'No file provided.' }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ success: false, error: `File too large. Max ${MAX_FILE_SIZE / 1024 / 1024}MB.` }, { status: 400 });
    }

    if (file.size === 0) {
      return NextResponse.json({ success: false, error: 'File is empty.' }, { status: 400 });
    }

    const ext = path.extname(file.name).toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      return NextResponse.json({ success: false, error: `Invalid type "${ext}".` }, { status: 400 });
    }

    // Read buffer
    const bytes = new Uint8Array(await file.arrayBuffer());
    const buffer = Buffer.from(bytes);

    // SECURITY: Magic byte validation (skip if no MIME type)
    if (file.type && MAGIC_BYTES[file.type] && !validateMagicBytes(buffer, file.type)) {
      return NextResponse.json({ success: false, error: 'File content mismatch.' }, { status: 400 });
    }

    // Ensure upload directory exists
    await mkdir(UPLOAD_DIR, { recursive: true });

    // SECURITY: Unguessable filename
    const uniqueId = crypto.randomBytes(16).toString('hex');
    const uniqueFileName = `${uniqueId}${ext}`;

    // SECURITY: Path traversal check
    const resolvedDir = path.resolve(UPLOAD_DIR);
    const resolvedFile = path.resolve(UPLOAD_DIR, uniqueFileName);
    if (!resolvedFile.startsWith(resolvedDir + path.sep)) {
      return NextResponse.json({ success: false, error: 'Invalid path.' }, { status: 400 });
    }

    await writeFile(resolvedFile, buffer, '0o644');

    console.log('[upload] File saved:', uniqueFileName, 'Size:', file.size, 'MIME:', file.type);

    return NextResponse.json({
      success: true,
      url: `/api/files/${uniqueFileName}`,
      fileName: sanitizeFilename(file.name),
      size: file.size,
      mimeType: file.type,
    });
  } catch (error) {
    console.error('[upload] Error:', error);
    return NextResponse.json({ success: false, error: 'Upload failed.' }, { status: 500 });
  }
}
