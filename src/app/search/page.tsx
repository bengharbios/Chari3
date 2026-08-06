import SearchPage from '@/components/storefront/SearchPage';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import AppShell from '@/components/layout/AppShell';
import { Suspense } from 'react';

export default function GlobalSearchPage() {
  return (
    <AppShell>
      <Header />
      <main className="flex-1">
        <Suspense fallback={<div className="container-platform py-20 text-center"><span className="loader"></span></div>}>
          <SearchPage />
        </Suspense>
      </main>
      <Footer />
    </AppShell>
  );
}
