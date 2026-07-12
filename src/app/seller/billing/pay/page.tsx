import { Suspense } from 'react';
import BillingPage from '@/components/seller/BillingPage';

export default function SellerBillingPayPage() {
  return (
    <Suspense>
      <BillingPage />
    </Suspense>
  );
}
