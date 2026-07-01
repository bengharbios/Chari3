import SecurityCenterPage from '@/components/security/SecurityCenterPage';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import AppShell from '@/components/layout/AppShell';

export default function SecurityPage() {
  return (
    <AppShell>
      <Header />
      <main className="flex-1">
        <SecurityCenterPage />
      </main>
      <Footer />
    </AppShell>
  );
}
