import AuthPage from '@/components/auth/AuthPage';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import AppShell from '@/components/layout/AppShell';

export default function LoginPage() {
  return (
    <AppShell>
      <Header />
      <main className="flex-1">
        <AuthPage />
      </main>
      <Footer />
    </AppShell>
  );
}
