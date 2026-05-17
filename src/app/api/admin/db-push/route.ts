import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('token');
  if (token !== 'chari3-push-2026') {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const nodeBinary = process.execPath;
    const npxBinary = nodeBinary.replace(/\/node$/, '/npx');
    
    // List of commands to try depending on the environment structure
    const commands = [
      `${npxBinary} prisma db push --accept-data-loss`,
      `npx prisma db push --accept-data-loss`,
      `${nodeBinary} ./node_modules/prisma/build/index.js db push --accept-data-loss`,
      `${nodeBinary} ./node_modules/.bin/prisma db push --accept-data-loss`,
      `${nodeBinary} ../node_modules/prisma/build/index.js db push --accept-data-loss`
    ];

    let errors = [];
    for (const cmd of commands) {
      try {
        const { stdout, stderr } = await execAsync(cmd);
        return NextResponse.json({ success: true, cmd_used: cmd, output: stdout, errorOutput: stderr });
      } catch (err: any) {
        errors.push({ cmd, error: err.message });
      }
    }

    return NextResponse.json({ 
      success: false, 
      error: 'All push commands failed', 
      details: errors 
    }, { status: 500 });

  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ success: false, error: errorMsg }, { status: 500 });
  }
}
