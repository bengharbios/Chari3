import { Suspense } from 'react';
import BillingPage from '@/components/seller/BillingPage';

export default function SellerBillingAddonsPage() {
  return (
    <Suspense>
      <BillingPage />
    </Suspense>
  );
}
