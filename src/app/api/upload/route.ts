import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import crypto from 'crypto';

import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

const DEFAULT_MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_EXTENSIONS = ['.pdf', '.jpg', '.jpeg', '.png'];

// Strict Magic Bytes Definitions
const MAGIC_BYTES: Record<string, { ext: string[], sigs: number[][] }> = {
  'image/jpeg':      { ext: ['.jpg', '.jpeg'], sigs: [[0xFF, 0xD8, 0xFF]] },
  'image/png':       { ext: ['.png'], sigs: [[0x89, 0x50, 0x4E, 0x47]] },
  'image/webp':      { ext: ['.webp'], sigs: [[0x52, 0x49, 0x46, 0x46]] }, // RIFF
  'image/gif':       { ext: ['.gif'], sigs: [[0x47, 0x49, 0x46, 0x38]] }, // GIF8
  'application/pdf': { ext: ['.pdf'], sigs: [[0x25, 0x50, 0x44, 0x46]] },
};

function validateMagicBytes(buffer: Buffer, mimeType: string, ext: string): boolean {
  const definition = MAGIC_BYTES[mimeType];
  // If the MIME type is completely unknown to our system, we block it.
  // This prevents uploading .php or shell files with fake/unknown mimetypes.
  if (!definition) return false;

  // The extension must match the expected extensions for this MIME type
  if (!definition.ext.includes(ext)) return false;

  // The file's first bytes must match one of the known signatures
  return definition.sigs.some(sig => sig.every((byte, i) => buffer[i] === byte));
}

function sanitizeFilename(name: string): string {
  return path.basename(name).replace(/[^a-zA-Z0-9._-]/g, '_').replace(/\0/g, '').replace(/\.\./g, '');
}

function getUploadDir(): string {
  // Ignore placeholder UPLOAD_DIR set by Hostinger
  const envDir = process.env.UPLOAD_DIR;
  if (envDir && !envDir.includes('/USER/')) return envDir;
  
  const cwd = process.cwd();
  if (cwd.includes('/domains/') && cwd.includes('/hbuilds/')) {
    const domainRoot = cwd.substring(0, cwd.indexOf('/hbuilds/'));
    return path.join(domainRoot, 'ChariDay_uploads');
  }
  
  // Use persistent upload directory outside of the project root
  return path.join(cwd, '..', 'ChariDay_uploads');
}

export async function POST(request: NextRequest) {
  try {
    const UPLOAD_DIR = getUploadDir();

    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ success: false, error: 'No file provided.' }, { status: 400 });
    }

    let MAX_FILE_SIZE = DEFAULT_MAX_FILE_SIZE;
    try {
      const sizeSetting = await db.systemSetting.findUnique({
        where: { key: 'upload_max_size_mb' }
      });
      if (sizeSetting && sizeSetting.value) {
        const mb = parseInt(String(sizeSetting.value), 10);
        if (!isNaN(mb) && mb > 0) {
          MAX_FILE_SIZE = mb * 1024 * 1024;
        }
      }
    } catch (err) {
      console.error('Failed to load dynamic max size', err);
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

    const bytes = new Uint8Array(await file.arrayBuffer());
    const buffer = Buffer.from(bytes);

    if (!file.type) {
      return NextResponse.json({ success: false, error: 'Unknown file type.' }, { status: 400 });
    }

    if (!validateMagicBytes(buffer, file.type, ext)) {
      return NextResponse.json({ success: false, error: 'File signature mismatch or malicious file detected.' }, { status: 400 });
    }

    await mkdir(UPLOAD_DIR, { recursive: true });

    const uniqueId = crypto.randomBytes(16).toString('hex');
    const uniqueFileName = `${uniqueId}${ext}`;

    const resolvedDir = path.resolve(UPLOAD_DIR);
    const resolvedFile = path.resolve(UPLOAD_DIR, uniqueFileName);
    if (!resolvedFile.startsWith(resolvedDir + path.sep)) {
      return NextResponse.json({ success: false, error: 'Invalid path.' }, { status: 400 });
    }

    await writeFile(resolvedFile, buffer, { mode: 0o644 });

    console.log('[upload] File saved:', uniqueFileName, 'Dir:', UPLOAD_DIR, 'Size:', file.size);

    return NextResponse.json({
      success: true,
      url: `/api/files/${uniqueFileName}`,
      fileName: sanitizeFilename(file.name),
      size: file.size,
      mimeType: file.type,
    });
  } catch (error: unknown) {
    console.error('[upload] Error:', error);
    const msg = error instanceof Error ? error.message : String(error);
    if (msg.includes('EACCES') || msg.includes('EPERM')) {
      return NextResponse.json({ success: false, error: 'Permission denied. Upload directory not writable.' }, { status: 500 });
    }
    if (msg.includes('ENOSPC')) {
      return NextResponse.json({ success: false, error: 'Server storage full.' }, { status: 500 });
    }
    return NextResponse.json({ success: false, error: 'Upload failed.' }, { status: 500 });
  }
}
