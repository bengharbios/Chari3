// Safe Prisma generator with fallback environment variables for Hostinger CI/CD
if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = 'mysql://u584311043_charichariday4:ChariAbdelkader1417DayDB2026Admin29@72.60.86.18:3306/u584311043_charichariday4?connection_limit=15';
}
if (!process.env.NEXTAUTH_SECRET) {
  process.env.NEXTAUTH_SECRET = 'build-secret-placeholder-chariday-2026';
}
if (!process.env.NEXTAUTH_URL) {
  process.env.NEXTAUTH_URL = 'https://chariday.com';
}
if (!process.env.BETTER_AUTH_SECRET) {
  process.env.BETTER_AUTH_SECRET = 'build-secret-placeholder-chariday-2026';
}
if (!process.env.BETTER_AUTH_URL) {
  process.env.BETTER_AUTH_URL = 'https://chariday.com';
}

const { execSync } = require('child_process');

try {
  console.log('Generating Prisma client with DATABASE_URL fallback...');
  execSync('npx prisma generate', {
    stdio: 'inherit',
    env: process.env,
    shell: true
  });
  console.log('Prisma client generated successfully.');
} catch (error) {
  console.warn('Warning: prisma generate encountered an issue, proceeding anyway:', error.message);
  process.exit(0);
}
