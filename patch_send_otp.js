const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'app', 'api', 'auth', 'send-otp', 'route.ts');
let content = fs.readFileSync(filePath, 'utf8');

const cryptoImport = `import crypto from 'crypto';\n`;
if (!content.includes('import crypto from')) {
  content = content.replace(`import { db } from '@/lib/db';`, `import { db } from '@/lib/db';\n${cryptoImport}`);
}

const ipExtract = `    const ip = request.headers.get('x-forwarded-for') || '127.0.0.1';`;
const extraExtract = `
    const countryCode = request.headers.get('cf-ipcountry') || 'Unknown';
    const userAgent = request.headers.get('user-agent') || 'Unknown';
    const deviceFingerprint = crypto.createHash('sha256').update(userAgent).digest('hex').substring(0, 32);
    
    // ── Security Check: Banned Entities ──
    const activeBans = await db.bannedEntity.findMany({
      where: {
        isActive: true,
        OR: [
          { expiresAt: null },
          { expiresAt: { gt: new Date() } }
        ]
      }
    });

    let isBanned = false;
    let banReason = null;

    for (const ban of activeBans) {
      if (
        (ban.type === 'ip' && ban.value === ip) ||
        (ban.type === 'phone' && ban.value === value && (method === 'phone' || method === 'whatsapp' || method === 'telegram')) ||
        (ban.type === 'email' && ban.value === value && method === 'email') ||
        (ban.type === 'device' && ban.value === deviceFingerprint) ||
        (ban.type === 'country' && ban.value === countryCode)
      ) {
        isBanned = true;
        banReason = ban.reason || 'Security Policy';
        break;
      }
    }

    if (isBanned) {
      // Log the banned attempt
      await db.authLog.create({
        data: {
          identifier: value,
          method,
          ipAddress: ip,
          userAgent,
          countryCode,
          deviceFingerprint,
          status: 'banned',
          isBanned: true,
          banReason
        }
      });
      return NextResponse.json(
        { success: false, message: 'عذراً، لا يمكنك الوصول إلى هذه الخدمة.' },
        { status: 403 }
      );
    }
`;
content = content.replace(ipExtract, ipExtract + extraExtract);

const upsertBlock = `    await db.verificationToken.upsert({`;
const authLogCreate = `
    // Log the attempt
    await db.authLog.create({
      data: {
        identifier: value,
        method,
        ipAddress: ip,
        userAgent,
        countryCode,
        deviceFingerprint,
        status: 'pending',
      }
    });

`;
content = content.replace(upsertBlock, authLogCreate + upsertBlock);

fs.writeFileSync(filePath, content, 'utf8');
console.log('send-otp/route.ts patched');
