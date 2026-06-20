const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'app', 'api', 'auth', 'register', 'route.ts');
let content = fs.readFileSync(filePath, 'utf8');

const targetStr = `    const newUser = await db.user.create({`;
const updateAuthLog = `
    // Update the most recent verified AuthLog to registered
    const identifier = phone || email;
    if (identifier) {
      const latestLog = await db.authLog.findFirst({
        where: { identifier: identifier, status: 'verified' },
        orderBy: { createdAt: 'desc' }
      });
      if (latestLog) {
        await db.authLog.update({
          where: { id: latestLog.id },
          data: { status: 'registered' }
        });
      }
    }

`;
content = content.replace(targetStr, updateAuthLog + targetStr);

fs.writeFileSync(filePath, content, 'utf8');
console.log('register/route.ts patched');
