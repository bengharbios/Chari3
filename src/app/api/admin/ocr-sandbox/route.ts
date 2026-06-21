import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import Tesseract from 'tesseract.js';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    if (!file) {
      return NextResponse.json({ success: false, error: 'No file provided' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    // Run Tesseract OCR
    const { data: { text } } = await Tesseract.recognize(buffer, 'ara+fra+eng', {
      logger: m => console.log(m),
    });

    // Attempt simple extraction for MRZ or specific Algerian ID patterns
    // Example MRZ pattern for ID cards
    const mrzRegex = /[A-Z0-9<]{30,}/g;
    const mrzMatches = text.match(mrzRegex);

    return NextResponse.json({ 
      success: true, 
      text,
      mrzMatches: mrzMatches || [],
      extracted: {
        raw: text
      }
    });

  } catch (error) {
    console.error('[OCR Error]', error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
