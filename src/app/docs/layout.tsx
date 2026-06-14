import React from 'react';
import Link from 'next/link';
import { db } from '@/lib/db';
import { BookOpen } from 'lucide-react';

export const metadata = {
  title: 'التوثيق - Documentation',
  description: 'دليل المستخدم الشامل للمشترين والتجار والمطورين'
};

export default async function DocsLayout({ children }: { children: React.ReactNode }) {
  const allDocs = await db.docArticle.findMany({
    where: { isPublished: true },
    orderBy: { sortOrder: 'asc' },
    select: { id: true, title: true, slug: true, category: true }
  });

  const categories = {
    general: 'عام',
    buyers: 'المشترين',
    sellers: 'التجار',
    developers: 'المطورين'
  };

  const groupedDocs = allDocs.reduce((acc: any, doc) => {
    if (!acc[doc.category]) acc[doc.category] = [];
    acc[doc.category].push(doc);
    return acc;
  }, {});

  return (
    <div className="flex min-h-screen flex-col bg-background" dir="rtl">
      {/* Docs Header */}
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center px-4">
          <Link href="/docs" className="flex items-center gap-2 font-bold">
            <BookOpen className="h-5 w-5 text-brand" />
            <span>ChariDay Docs</span>
          </Link>
          <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
            <nav className="flex items-center gap-4 text-sm font-medium pr-6">
              <Link href="/">العودة للمتجر</Link>
            </nav>
          </div>
        </div>
      </header>

      <div className="container flex-1 items-start md:grid md:grid-cols-[220px_minmax(0,1fr)] md:gap-6 lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-10 px-4 py-8">
        {/* Sidebar */}
        <aside className="fixed top-14 z-30 -ml-2 hidden h-[calc(100vh-3.5rem)] w-full shrink-0 md:sticky md:block overflow-y-auto border-l pl-4">
          <div className="py-6 pr-6">
            {Object.keys(categories).map((catKey) => (
              groupedDocs[catKey] && groupedDocs[catKey].length > 0 ? (
                <div key={catKey} className="pb-4">
                  <h4 className="mb-1 rounded-md px-2 py-1 text-sm font-semibold">
                    {categories[catKey as keyof typeof categories]}
                  </h4>
                  <div className="grid grid-flow-row auto-rows-max text-sm">
                    {groupedDocs[catKey].map((doc: any) => (
                      <Link
                        key={doc.id}
                        href={`/docs/${doc.slug}`}
                        className="group flex w-full items-center rounded-md border border-transparent px-2 py-1 hover:underline text-muted-foreground"
                      >
                        {doc.title}
                      </Link>
                    ))}
                  </div>
                </div>
              ) : null
            ))}
          </div>
        </aside>

        {/* Main Content */}
        <main className="relative py-6 lg:gap-10 lg:py-8 xl:grid xl:grid-cols-[1fr_300px]">
          <div className="mx-auto w-full min-w-0">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
