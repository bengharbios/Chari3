const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'app', 'api', 'auth', 'send-otp', 'route.ts');
let content = fs.readFileSync(filePath, 'utf8');

// Replace the duplicate declaration
content = content.replace(
  `const countryCode = request.headers.get('cf-ipcountry') || 'Unknown';`,
  `const detectedCountry = request.headers.get('cf-ipcountry') || 'Unknown';`
);

// Replace its usage in AuthLog and BannedEntity check
content = content.replace(
  `(ban.type === 'country' && ban.value === countryCode)`,
  `(ban.type === 'country' && ban.value === detectedCountry)`
);

content = content.replace(
  `countryCode,\n        deviceFingerprint,`,
  `countryCode: detectedCountry,\n        deviceFingerprint,`
);

fs.writeFileSync(filePath, content, 'utf8');
console.log('send-otp countryCode fixed!');
