'use client';

import { useAppStore } from '@/lib/store';
import { PageHeader } from '@/components/shared/StatsCard';

export default function StoreOrdersPage() {
  const { locale } = useAppStore();
  const t = (ar: string, en: string) => locale === 'ar' ? ar : en;

  return (
    <div className="space-y-6 p-4 md:p-6 text-start">
      <PageHeader
        title={t('الطلبات (Orders)', 'Orders')}
        description={t('إدارة طلبات المتجر وتحديث حالة الشحن والتوصيل.', 'Manage store orders and update shipping and delivery statuses.')}
      />
      
      <div className="card-surface p-6 rounded-xl flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground font-bold">
          {t('جاري برمجة لوحة التحكم التفاعلية للطلبات...', 'Programming the interactive orders dashboard...')}
        </p>
      </div>
    </div>
  );
}
