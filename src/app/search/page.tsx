import SearchPage from '@/components/storefront/SearchPage';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import AppShell from '@/components/layout/AppShell';

export default function GlobalSearchPage() {
  return (
    <AppShell>
      <Header />
      <main className="flex-1">
        <SearchPage />
      </main>
      <Footer />
    </AppShell>
  );
}
