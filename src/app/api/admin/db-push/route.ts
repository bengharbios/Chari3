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
    // In Hostinger Next.js standalone container, node is not in path but available via process.execPath.
    // Also Prisma CLI is located in @prisma/client or root node_modules.
    const nodeBinary = process.execPath;
    const cmd = `${nodeBinary} ./node_modules/prisma/build/index.js db push --accept-data-loss`;
    const { stdout, stderr } = await execAsync(cmd);
    return NextResponse.json({ success: true, output: stdout, errorOutput: stderr });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ success: false, error: errorMsg, execPath: process.execPath }, { status: 500 });
  }
}
