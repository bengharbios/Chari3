import React from 'react';
import UpgradePage from '@/components/seller/UpgradePage';

export const metadata = {
  title: 'طلب ترقية الحساب | ChariDay',
  description: 'ترقية حساب التاجر الفردي إلى متجر أعمال لتفعيل إدارة الفروع والموظفين المتقدمة.',
};

export default function Page() {
  return (
    <div className="container mx-auto py-6">
      <UpgradePage />
    </div>
  );
}
