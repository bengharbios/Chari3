import VerificationStatusPage from '@/components/onboarding/VerificationStatusPage';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import AppShell from '@/components/layout/AppShell';

export default function VerificationPage() {
  return (
    <AppShell>
      <Header />
      <main className="flex-1">
        <VerificationStatusPage />
      </main>
      <Footer />
    </AppShell>
  );
}
