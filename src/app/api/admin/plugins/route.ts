import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { SecurityService } from '@/lib/payment-engine/services/SecurityService';

const security = new SecurityService();

export async function GET(req: NextRequest) {
  try {
    const plugins = await prisma.platformPlugin.findMany({
      orderBy: { createdAt: 'desc' }
    });

    // We don't return the raw globalConfig to the frontend if it's encrypted API keys.
    // We just return a boolean indicating if it's set or not.
    const safePlugins = plugins.map(p => ({
      ...p,
      hasConfig: !!p.globalConfig,
      globalConfig: undefined // hide it
    }));

    return NextResponse.json({ success: true, plugins: safePlugins });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const { id, isActive, configData } = data;

    const existing = await prisma.platformPlugin.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ success: false, error: 'Plugin not found' }, { status: 404 });
    }

    let encryptedConfig = existing.globalConfig;

    if (configData) {
      // Encrypt the new config before saving
      encryptedConfig = security.encrypt(JSON.stringify(configData));
    }

    const updated = await prisma.platformPlugin.update({
      where: { id },
      data: {
        isActive: isActive !== undefined ? isActive : existing.isActive,
        globalConfig: encryptedConfig
      }
    });

    return NextResponse.json({ success: true, plugin: updated });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
