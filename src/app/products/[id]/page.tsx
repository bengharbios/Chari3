'use client';

import { useEffect } from 'react';
import { useAppStore } from '@/lib/store';
import ProductDetailPage from '@/components/storefront/ProductDetailPage';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import BottomNav from '@/components/layout/BottomNav';
import AppShell from '@/components/layout/AppShell';
import { useParams } from 'next/navigation';

export default function DynamicProductPage() {
  const { id } = useParams();
  const setSelectedProductId = useAppStore(state => state.setSelectedProductId);
  const setCurrentPage = useAppStore(state => state.setCurrentPage);

  useEffect(() => {
    if (id) {
      setSelectedProductId(id as string);
      setCurrentPage('product-detail');
    }
  }, [id, setSelectedProductId, setCurrentPage]);

  return (
    <AppShell>
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pb-16 md:pb-0">
          <ProductDetailPage />
        </main>
        <Footer />
        <BottomNav />
      </div>
    </AppShell>
  );
}
