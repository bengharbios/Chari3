'use client';

import { useAppStore } from '@/lib/store';
import { PageHeader } from '@/components/shared/StatsCard';

export default function StoreSettingsPage() {
  const { locale } = useAppStore();
  const t = (ar: string, en: string) => locale === 'ar' ? ar : en;

  return (
    <div className="space-y-6 p-4 md:p-6 text-start">
      <PageHeader
        title={t('إعدادات المتجر (Settings)', 'Settings')}
        description={t('إدارة الهوية البصرية، خيارات الشحن والتوصيل، وسياسات المتجر.', 'Manage visual identity, shipping options, and store policies.')}
      />
      
      <div className="card-surface p-6 rounded-xl flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground font-bold">
          {t('جاري برمجة واجهة إعدادات المتجر الشاملة...', 'Programming the comprehensive store settings interface...')}
        </p>
      </div>
    </div>
  );
}
