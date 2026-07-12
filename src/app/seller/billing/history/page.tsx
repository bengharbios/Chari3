import { Suspense } from 'react';
import BillingPage from '@/components/seller/BillingPage';

export default function SellerBillingHistoryPage() {
  return (
    <Suspense>
      <BillingPage />
    </Suspense>
  );
}
