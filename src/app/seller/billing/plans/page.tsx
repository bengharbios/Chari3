import { Suspense } from 'react';
import BillingPage from '@/components/seller/BillingPage';

export default function SellerBillingPlansPage() {
  return (
    <Suspense>
      <BillingPage />
    </Suspense>
  );
}
