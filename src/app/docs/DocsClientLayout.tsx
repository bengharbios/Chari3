'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { BookOpen, Menu, X, ArrowRight, ArrowLeft } from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { localeDirections } from '@/lib/i18n/config';
import { Button } from '@/components/ui/button';
import { LanguageSwitcher } from '@/components/ui/language-switcher';

export default function DocsClientLayout({ children, allDocs }: { children: React.ReactNode, allDocs: any[] }) {
  const { locale } = useAppStore();
  const isRTL = localeDirections[locale] === 'rtl';
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const categories = {
    general: isRTL ? 'عام' : 'General',
    buyers: isRTL ? 'المشترين' : 'Buyers',
    sellers: isRTL ? 'التجار' : 'Sellers',
    developers: isRTL ? 'المطورين' : 'Developers'
  };

  const groupedDocs = allDocs.reduce((acc: any, doc) => {
    if (!acc[doc.category]) acc[doc.category] = [];
    acc[doc.category].push(doc);
    return acc;
  }, {});

  const SidebarContent = () => (
    <div className="py-6 px-6">
      {Object.keys(categories).map((catKey) => (
        groupedDocs[catKey] && groupedDocs[catKey].length > 0 ? (
          <div key={catKey} className="pb-4 text-start">
            <h4 className="mb-2 rounded-md px-2 py-1 text-sm font-bold text-foreground/90 uppercase tracking-wider">
              {categories[catKey as keyof typeof categories]}
            </h4>
            <div className="grid grid-flow-row auto-rows-max text-sm gap-1">
              {groupedDocs[catKey].map((doc: any) => (
                <Link
                  key={doc.id}
                  href={`/docs/${doc.slug}`}
                  onClick={() => setMobileMenuOpen(false)}
                  className="group flex w-full items-center rounded-md border border-transparent px-2 py-1.5 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                >
                  {isRTL ? doc.title : (doc.titleEn || doc.title)}
                </Link>
              ))}
            </div>
          </div>
        ) : null
      ))}
    </div>
  );

  return (
    <div className="flex min-h-screen flex-col bg-background" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Docs Header */}
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center px-4 gap-4">
          <Button 
            variant="ghost" 
            size="icon" 
            className="md:hidden" 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
          
          <Link href="/docs" className="flex items-center gap-2 font-bold hover:text-brand transition-colors">
            <BookOpen className="h-5 w-5 text-brand" />
            <span>ChariDay Docs</span>
          </Link>
          
          <div className="flex flex-1 items-center justify-end">
            <nav className="flex items-center gap-4 text-sm font-medium">
              <LanguageSwitcher className="h-9 px-2" />
              <Link href="/" className="flex items-center gap-1.5 hover:text-brand transition-colors">
                {isRTL ? <ArrowRight className="h-4 w-4" /> : <ArrowLeft className="h-4 w-4" />}
                {isRTL ? 'العودة للمتجر' : 'Back to Store'}
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <div className="container flex-1 items-start md:grid md:grid-cols-[220px_minmax(0,1fr)] md:gap-6 lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-10 px-4 py-8 relative">
        
        {/* Desktop Sidebar */}
        <aside className="fixed top-14 z-30 hidden h-[calc(100vh-3.5rem)] w-full shrink-0 md:sticky md:block overflow-y-auto border-border">
          <div className={isRTL ? 'border-l pl-4' : 'border-r pr-4'}>
            <SidebarContent />
          </div>
        </aside>

        {/* Mobile Sidebar Overlay */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 top-14 z-50 bg-background/80 backdrop-blur-sm md:hidden">
            <div className="fixed inset-y-0 start-0 z-50 h-full w-3/4 max-w-sm border-e bg-background shadow-lg animate-in slide-in-from-start">
              <div className="h-full overflow-y-auto">
                <SidebarContent />
              </div>
            </div>
            <div className="absolute inset-0 z-40" onClick={() => setMobileMenuOpen(false)} />
          </div>
        )}

        {/* Main Content */}
        <main className="relative py-2 lg:gap-10 xl:grid xl:grid-cols-[1fr_200px]">
          <div className="mx-auto w-full min-w-0 prose prose-slate dark:prose-invert max-w-3xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
