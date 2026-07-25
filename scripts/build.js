const { execSync } = require('child_process');

// Ensure essential build-time environment variables exist to prevent Hostinger / CI build failures
if (!process.env.DATABASE_URL) {
  console.log('⚠️ DATABASE_URL not set in build environment. Setting default database fallback URL...');
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

try {
  console.log('📦 Generating Prisma Client...');
  execSync('npx prisma generate', { stdio: 'inherit', env: process.env });

  console.log('⚡ Building Next.js application...');
  execSync('npx next build', { stdio: 'inherit', env: process.env });

  console.log('✅ Build completed successfully!');
} catch (error) {
  console.error('❌ Build script failed:', error.message);
  process.exit(1);
}
