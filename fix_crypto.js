const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'app', 'api', 'auth', 'send-otp', 'route.ts');
let content = fs.readFileSync(filePath, 'utf8');

content = content.replace(`import crypto from 'crypto';\n`, '');
content = content.replace(
  `const deviceFingerprint = crypto.createHash('sha256').update(userAgent).digest('hex').substring(0, 32);`,
  `// Simple hash function for device fingerprint
    let hash = 0;
    for (let i = 0; i < userAgent.length; i++) {
      hash = ((hash << 5) - hash) + userAgent.charCodeAt(i);
      hash |= 0;
    }
    const deviceFingerprint = Math.abs(hash).toString(16);`
);

fs.writeFileSync(filePath, content, 'utf8');
console.log('send-otp fixed!');
