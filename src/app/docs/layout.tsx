import React from 'react';
import Link from 'next/link';
import { db } from '@/lib/db';
import { BookOpen } from 'lucide-react';

import DocsClientLayout from './DocsClientLayout';

export const metadata = {
  title: 'التوثيق - Documentation',
  description: 'دليل المستخدم الشامل للمشترين والتجار والمطورين'
};

export default async function DocsLayout({ children }: { children: React.ReactNode }) {
  const allDocs = await db.docArticle.findMany({
    where: { isPublished: true },
    orderBy: { sortOrder: 'asc' },
    select: { id: true, title: true, titleEn: true, slug: true, category: true }
  });

  return (
    <DocsClientLayout allDocs={allDocs}>
      {children}
    </DocsClientLayout>
  );
}
