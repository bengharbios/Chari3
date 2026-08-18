import HomepagePage from '@/components/storefront/HomepagePage';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import BottomNav from '@/components/layout/BottomNav';
import AppShell from '@/components/layout/AppShell';
import ChatWidget from '@/components/chat/ChatWidget';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default function RootHomePage() {
  return (
    <AppShell>
      <Header />
      <main className="flex-1">
        <HomepagePage />
      </main>
      <Footer />
      <BottomNav />
      <ChatWidget />
    </AppShell>
  );
}
