'use client';

import { useState } from 'react';
import { useAuthStore, useAppStore } from '@/lib/store';
import { useOnboardingStore } from '@/lib/store/onboarding';
import OtpLogin from '@/components/onboarding/OtpLogin';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
  ShieldCheck, Store, UserCircle, Truck, ShoppingBag,
  Globe, Moon, Sun, Zap, ChevronDown, ChevronUp
} from 'lucide-react';
import type { UserRole } from '@/types';
import { cn } from '@/lib/utils';

const t = (locale: string, ar: string, en: string) => (locale === 'ar' ? ar : en);

const DEMO_ACCOUNTS: { role: UserRole; labelAr: string; labelEn: string; email: string; icon: React.ComponentType<{ className?: string }>; color: string; status: string }[] = [
  { role: 'admin', labelAr: 'مدير النظام', labelEn: 'System Admin', email: 'admin@charyday.com', icon: ShieldCheck, color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400', status: 'active' },
  { role: 'store_manager', labelAr: 'مدير متجر', labelEn: 'Store Manager', email: 'store@charyday.com', icon: Store, color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400', status: 'active' },
  { role: 'seller', labelAr: 'تاجر مستقل', labelEn: 'Individual Seller', email: 'seller@charyday.com', icon: UserCircle, color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400', status: 'active' },
  { role: 'logistics', labelAr: 'مندوب شحن', labelEn: 'Courier', email: 'delivery@charyday.com', icon: Truck, color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400', status: 'active' },
  { role: 'buyer', labelAr: 'مشتري', labelEn: 'Buyer', email: 'buyer@charyday.com', icon: ShoppingBag, color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400', status: 'active' },
  { role: 'store_manager', labelAr: 'متجر معلق (بانتظار المراجعة)', labelEn: 'Store (Pending Review)', email: 'pending@charyday.com', icon: Store, color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400', status: 'pending' },
  { role: 'seller', labelAr: 'تاجر (مرفوض - يعيد التقديم)', labelEn: 'Seller (Rejected - Resubmit)', email: 'rejected@charyday.com', icon: UserCircle, color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400', status: 'rejected' },
];

export default function LoginPage() {
  const { loginAsDemo } = useAuthStore();
  const { locale, setLocale, theme, setTheme } = useAppStore();
  const { resetOnboarding, setAccountStatus, setVerificationItems, setRejectionReason, setRejectedItems, setOtpStep } = useOnboardingStore();
  const [showDemo, setShowDemo] = useState(false);
  const [loadingRole, setLoadingRole] = useState<UserRole | null>(null);

  const handleDemoLogin = async (role: UserRole, status: string) => {
    setLoadingRole(role);

    // Reset onboarding state for clean slate
    resetOnboarding();
    setOtpStep('phone');

    if (status === 'pending') {
      setAccountStatus('pending');
      setVerificationItems([
        { id: 'phone', labelAr: 'رقم الهاتف', labelEn: 'Phone Number', status: 'verified' },
        { id: 'commercial_register', labelAr: 'السجل التجاري', labelEn: 'Commercial Register', status: 'pending' },
        { id: 'bank_account', labelAr: 'الحساب البنكي', labelEn: 'Bank Account', status: 'pending' },
        { id: 'manager_id', labelAr: 'هوية المدير', labelEn: 'Manager ID', status: 'pending' },
      ]);
    } else if (status === 'rejected') {
      setAccountStatus('rejected');
      setRejectionReason('صورة الهوية غير واضحة، يرجى إعادة التصوير بمكان مضيء وبوضوح تام');
      setRejectedItems(['manager_id']);
      setVerificationItems([
        { id: 'phone', labelAr: 'رقم الهاتف', labelEn: 'Phone Number', status: 'verified' },
        { id: 'commercial_register', labelAr: 'السجل التجاري', labelEn: 'Commercial Register', status: 'verified' },
        { id: 'bank_account', labelAr: 'الحساب البنكي', labelEn: 'Bank Account', status: 'verified' },
        { id: 'manager_id', labelAr: 'هوية المدير', labelEn: 'Manager ID', status: 'rejected', rejectionReason: 'صورة غير واضحة' },
      ]);
    } else {
      setAccountStatus('approved');
      setVerificationItems([]);
    }

    await new Promise((r) => setTimeout(r, 500));
    loginAsDemo(role);
  };

  return (
    <div className="min-h-[calc(100dvh-var(--header-height))] flex flex-col" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
      {/* Top Controls */}
      <div className="fixed top-4 start-4 end-4 flex items-center justify-between z-10">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setLocale(locale === 'ar' ? 'en' : 'ar')}
          className="gap-1 bg-background/80 backdrop-blur-sm"
        >
          <Globe className="h-3.5 w-3.5" />
          {locale === 'ar' ? 'English' : 'العربية'}
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="h-9 w-9 bg-background/80 backdrop-blur-sm"
          onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
        >
          {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
        </Button>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-6">
          {/* Brand */}
          <div className="text-center space-y-2">
            <div className="gradient-brand rounded-xl px-5 py-2.5 font-bold text-navy text-2xl inline-block shadow-[var(--shadow-brand)]">
              شاري داي
            </div>
            <p className="text-muted-foreground text-sm mt-3">
              {t(locale, 'منصة التجارة الإلكترونية الأولى', 'The Leading E-Commerce Platform')}
            </p>
          </div>

          {/* OTP Login - Primary */}
          <OtpLogin />

          {/* Divider */}
          <div className="relative flex items-center gap-3">
            <Separator className="flex-1" />
            <button
              onClick={() => setShowDemo(!showDemo)}
              className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              {t(locale, 'أو الدخول التجريبي السريع', 'Or Quick Demo Access')}
              {showDemo ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
            </button>
            <Separator className="flex-1" />
          </div>

          {/* Demo Accounts - Expandable */}
          {showDemo && (
            <div className="space-y-2 animate-fade-in">
              <p className="text-xs text-muted-foreground text-center">
                {t(locale, 'اختر دوراً للدخول المباشر (رمز OTP: 123456)', 'Select a role for instant access (OTP code: 123456)')}
              </p>
              {DEMO_ACCOUNTS.map((account) => {
                const Icon = account.icon;
                return (
                  <button
                    key={account.email}
                    onClick={() => handleDemoLogin(account.role, account.status)}
                    disabled={loadingRole !== null}
                    className={cn(
                      'card-surface w-full text-start p-3 flex items-center gap-3 transition-all',
                      'hover:shadow-md',
                      'disabled:opacity-50 disabled:pointer-events-none'
                    )}
                  >
                    <div className={cn('h-10 w-10 rounded-lg flex items-center justify-center shrink-0', account.color)}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm leading-tight">
                        {t(locale, account.labelAr, account.labelEn)}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] text-muted-foreground truncate">{account.email}</span>
                        {account.status !== 'active' && (
                          <span className={cn(
                            'text-[9px] px-1.5 py-0.5 rounded-full font-medium',
                            account.status === 'pending' && 'bg-yellow-100 text-yellow-700',
                            account.status === 'rejected' && 'bg-red-100 text-red-700'
                          )}>
                            {account.status === 'pending' ? t(locale, 'معلق', 'Pending') : t(locale, 'مرفوض', 'Rejected')}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="shrink-0">
                      {loadingRole === account.role ? (
                        <div className="h-5 w-5 border-2 border-brand border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Zap className="h-4 w-4 text-muted-foreground" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
