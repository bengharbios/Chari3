'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAppStore } from '@/lib/store';
import SellerProfilePage from '@/components/storefront/SellerProfilePage';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import BottomNav from '@/components/layout/BottomNav';
import AppShell from '@/components/layout/AppShell';
import { Loader2 } from 'lucide-react';

export default function StorePublicPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const router = useRouter();
  const setSelectedSellerId = useAppStore(state => state.setSelectedSellerId);
  const setCurrentPage = useAppStore(state => state.setCurrentPage);
  const [isResolving, setIsResolving] = useState(true);

  useEffect(() => {
    if (!slug) return;
    setIsResolving(true);
    fetch(`/api/stores/${slug}`)
      .then(r => r.json())
      .then(data => {
        if (data.success && data.store) {
          setSelectedSellerId(data.store.id);
          setCurrentPage('seller-profile');
        } else {
          router.push('/');
        }
      })
      .catch(() => router.push('/'))
      .finally(() => setIsResolving(false));
  }, [slug, setSelectedSellerId, setCurrentPage, router]);

  return (
    <AppShell>
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <main className="flex-1 pb-16 md:pb-0">
          {isResolving ? (
            <div className="flex-1 flex items-center justify-center min-h-[50vh]">
              <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto" />
            </div>
          ) : (
            <SellerProfilePage />
          )}
        </main>
        <Footer />
        <BottomNav />
      </div>
    </AppShell>
  );
}
