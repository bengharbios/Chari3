'use client';

import { useEffect } from 'react';
import { useAppStore } from '@/lib/store';
import SellerProfilePage from '@/components/storefront/SellerProfilePage';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import BottomNav from '@/components/layout/BottomNav';
import AppShell from '@/components/layout/AppShell';
import { useParams } from 'next/navigation';

export default function DynamicSellerPage() {
  const { id } = useParams();
  const setSelectedSellerId = useAppStore(state => state.setSelectedSellerId);
  const setCurrentPage = useAppStore(state => state.setCurrentPage);

  useEffect(() => {
    if (id) {
      setSelectedSellerId(id as string);
      setCurrentPage('seller-profile');
    }
  }, [id, setSelectedSellerId, setCurrentPage]);

  return (
    <AppShell>
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pb-16 md:pb-0">
          <SellerProfilePage />
        </main>
        <Footer />
        <BottomNav />
      </div>
    </AppShell>
  );
}
