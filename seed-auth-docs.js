const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const article = await prisma.docArticle.upsert({
    where: { slug: 'security-architecture' },
    update: {},
    create: {
      title: 'Security Architecture & Better Auth',
      titleEn: 'Security Architecture & Better Auth',
      slug: 'security-architecture',
      content: `# Security Architecture & Better Auth

ChariDay has migrated to a unified, edge-compatible security system using Better Auth. This document outlines the architecture, configuration, and recent critical integrations and bug fixes.

## 1. Edge Middleware Protection
The platform utilizes Next.js Edge Middleware (\`src/middleware.ts\`) to intercept requests to protected routes (e.g., \`/seller\`, \`/buyer\`, \`/admin-secure-internal\`).
Instead of relying on Client-Side Rendering to evaluate Auth state, the Middleware validates the HTTP-Only cookie via Better Auth before returning any content. This prevents layout flashing and infinite hydration loops.

## 2. Password Hashing & Legacy Compatibility
* **Hashing Algorithm:** By default, Better Auth uses \`scrypt\`. To maintain compatibility with legacy users created via Prisma seed scripts (which use \`bcrypt\` / \`bcryptjs\`), the Better Auth configuration in \`src/lib/better-auth.ts\` has been explicitly configured to use \`bcryptjs\` for password verification and generation.
* **Automatic Account Fallback:** Legacy users created without an \`Account\` record (but having a password in the \`User\` table) are automatically migrated during their first password login. The \`/api/auth/login-password\` endpoint intercepts the login, validates the password against the \`User\` table, and dynamically creates the required \`Account\` record in the database, allowing Better Auth to authenticate them seamlessly.

## 3. Next.js Headers Constructor Bug (Undici Symbol Crash)
* **The Issue:** Next.js \`request.headers\` contains internal Next.js symbols and headers. Passing this raw headers object directly to Better Auth API functions (like \`signInEmail\`) causes internal fetch requests inside Undici/better-auth to crash with a \`Headers constructor\` error (resulting in 500 Internal Server Error).
* **The Fix:** In \`/api/auth/login-password/route.ts\`, the headers are sanitized by copying them into a clean, native \`Headers\` instance before calling the Better Auth API:
  \`\`\`typescript
  const safeHeaders = new Headers();
  request.headers.forEach((value, key) => {
    safeHeaders.append(key, value);
  });
  \`\`\`

## 4. Zustand Bridge (AuthSync) & Client-Side SignOut
* **AuthSync Bridge:** Because many legacy UI components still use \`useAuthStore\` (Zustand), a bridge component \`<AuthSync />\` inside \`AppShell.tsx\` reads the real session using \`useSession()\` and updates the Zustand store, maintaining backward compatibility.
* **SignOut Bug Fix:** On client-side logout, simply resetting the Zustand store is not enough because the browser cookie remains active, causing \`AuthSync\` to automatically re-authenticate the user on page reload. The \`logout\` action in the Zustand store has been updated to be asynchronous and call the Better Auth \`signOut()\` client method first:
  \`\`\`typescript
  const { signOut } = await import('@/lib/auth-client');
  await signOut();
  // ... clear local Zustand state and reload
  \`\`\`

## 5. Two-Factor Authentication (2FA)
2FA is fully supported natively. To implement a 2FA workflow in the frontend, use the \`twoFactorClient\` from \`better-auth/client/plugins\`.
Example:
\`\`\`typescript
const { data } = await twoFactorClient.enable({ password });
// data.totpURI contains the QR Code payload
\`\`\`
`,
      category: 'developers',
      isPublished: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
  });

  console.log('Seeded DocArticle:', article.slug);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
