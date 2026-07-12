import { Suspense } from 'react';
import BillingPage from '@/components/seller/BillingPage';

export default function SellerBillingPage() {
  return (
    <Suspense>
      <BillingPage />
    </Suspense>
  );
}
