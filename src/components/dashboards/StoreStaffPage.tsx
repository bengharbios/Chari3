'use client';

import { useAppStore } from '@/lib/store';
import { PageHeader } from '@/components/shared/StatsCard';

export default function StoreStaffPage() {
  const { locale } = useAppStore();
  const t = (ar: string, en: string) => locale === 'ar' ? ar : en;

  return (
    <div className="space-y-6 p-4 md:p-6 text-start">
      <PageHeader
        title={t('فريق العمل (Staff)', 'Staff')}
        description={t('إدارة موظفي المتجر، الصلاحيات، وسجل النشاطات.', 'Manage store staff, roles, and activity logs.')}
      />
      
      <div className="card-surface p-6 rounded-xl flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground font-bold">
          {t('جاري تصميم نظام إدارة الفريق والصلاحيات...', 'Designing the team and roles management system...')}
        </p>
      </div>
    </div>
  );
}
