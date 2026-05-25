'use client';

import { useAppStore } from '@/lib/store';
import { PageHeader } from '@/components/shared/StatsCard';

export default function StoreProductsPage() {
  const { locale } = useAppStore();
  const t = (ar: string, en: string) => locale === 'ar' ? ar : en;

  return (
    <div className="space-y-6 p-4 md:p-6 text-start">
      <PageHeader
        title={t('المنتجات (Products)', 'Products')}
        description={t('إدارة وتعديل الكتالوج الخاص بمتجرك.', 'Manage and edit your store catalog.')}
      />
      
      <div className="card-surface p-6 rounded-xl flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground font-bold">
          {t('جاري تصميم الواجهة المتطورة لإدارة المنتجات...', 'Developing the advanced product management UI...')}
        </p>
      </div>
    </div>
  );
}
