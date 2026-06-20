const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'app', 'api', 'auth', 'verify-otp', 'route.ts');
let content = fs.readFileSync(filePath, 'utf8');

const deleteBlock = `    // OTP is valid. Delete it to prevent reuse.
    await db.verificationToken.delete({`;

const updateAuthLog = `
    // Update the most recent pending AuthLog
    const latestLog = await db.authLog.findFirst({
      where: { identifier: value, status: 'pending' },
      orderBy: { createdAt: 'desc' }
    });
    if (latestLog) {
      await db.authLog.update({
        where: { id: latestLog.id },
        data: { status: 'verified' }
      });
    }

`;
content = content.replace(deleteBlock, updateAuthLog + deleteBlock);

fs.writeFileSync(filePath, content, 'utf8');
console.log('verify-otp/route.ts patched');
