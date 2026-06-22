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
      content: `# Security Architecture & Better Auth\n\nChariDay has migrated to a unified, edge-compatible security system using Better Auth. This document outlines the new architecture and how to interact with it.\n\n## 1. Edge Middleware Protection\nThe platform utilizes Next.js Edge Middleware (\`src/middleware.ts\`) to intercept requests to protected routes (e.g., \`/seller\`, \`/buyer\`, \`/admin-secure-internal\`).\nInstead of relying on Client-Side Rendering to evaluate Auth state, the Middleware validates the HTTP-Only cookie via Better Auth before returning any content. This prevents layout flashing and infinite hydration loops.\n\n## 2. Better Auth Configuration\nThe core configuration is located in \`src/lib/better-auth.ts\`. It defines the Prisma Adapter, the \`twoFactor\` plugin, and the custom \`User\` model fields.\n\n## 3. Zustand Bridge (AuthSync)\nBecause many legacy UI components still use \`useAuthStore\` (Zustand), we use a bridge component \`<AuthSync />\` inside \`AppShell.tsx\`. This component reads the real session using \`useSession()\` and seamlessly updates the Zustand store. This ensures backward compatibility while we gradually refactor the codebase.\n\n## 4. Two-Factor Authentication (2FA)\n2FA is fully supported natively. To implement a 2FA workflow in the frontend, use the \`twoFactorClient\` from \`better-auth/client/plugins\`.\nExample:\n\`\`\`typescript\nconst { data } = await twoFactorClient.enable({ password });\n// data.totpURI contains the QR Code payload\n\`\`\`\n`,
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
