'use client';

import React, { useState } from 'react';
import {
  Store,
  UserCircle,
  Package,
  Truck,
  ShoppingCart,
  Check,
  ArrowRight,
  ArrowLeft,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useAuthFlowStore } from '@/lib/store/auth-flow';
import { useAppStore } from '@/lib/store';
import { cn } from '@/lib/utils';
import type { UserRole, Locale } from '@/types';

// ============================================
// HELPERS
// ============================================

function t(locale: Locale, ar: string, en: string) {
  return locale === 'ar' ? ar : en;
}

function maskPhone(phone: string): string {
  if (phone.length < 3) return phone;
  const visible = phone.slice(-3);
  const masked = '*'.repeat(Math.max(0, phone.length - 3));
  return masked + visible;
}

// ============================================
// ROLE CONFIG
// ============================================

interface RoleOption {
  id: UserRole;
  labelAr: string;
  labelEn: string;
  descAr: string;
  descEn: string;
  icon: React.ElementType;
  bgClass: string;
  emoji: string;
}

const ROLES: RoleOption[] = [
  {
    id: 'store_manager',
    labelAr: 'متجر رسمي',
    labelEn: 'Official Store',
    descAr: 'متجر كامل مع فريق عمل',
    descEn: 'Full store with team access',
    icon: Store,
    bgClass: 'bg-[var(--navy)]',
    emoji: '🏢',
  },
  {
    id: 'seller',
    labelAr: 'تاجر مستقل',
    labelEn: 'Freelancer',
    descAr: 'بيع منتجاتك بسهولة',
    descEn: 'Sell your products easily',
    icon: UserCircle,
    bgClass: 'bg-purple-600',
    emoji: '👤',
  },
  {
    id: 'supplier',
    labelAr: 'مورد',
    labelEn: 'Supplier',
    descAr: 'توريد بالجملة',
    descEn: 'Wholesale supply',
    icon: Package,
    bgClass: 'bg-orange-500',
    emoji: '📦',
  },
  {
    id: 'logistics',
    labelAr: 'شركة شحن',
    labelEn: 'Logistics',
    descAr: 'إدارة الشحن',
    descEn: 'Manage shipping',
    icon: Truck,
    bgClass: 'bg-cyan-600',
    emoji: '🚚',
  },
  {
    id: 'buyer',
    labelAr: 'مشتري',
    labelEn: 'Buyer',
    descAr: 'تسوق أونلاين',
    descEn: 'Shop online',
    icon: ShoppingCart,
    bgClass: 'bg-green-600',
    emoji: '🛒',
  },
];

// ============================================
// REGISTER STEP COMPONENT
// ============================================

export default function RegisterStep() {
  const locale = useAppStore((s) => s.locale);
  const {
    method,
    phone,
    email,
    fullName,
    storeName,
    selectedRole,
    isLoading,
    error,
    verifiedContact,
    setFullName,
    setStoreName,
    setEmail,
    setSelectedRole,
    setError,
    register,
    setStep,
  } = useAuthFlowStore();

  const [errors, setErrors] = useState<{ name?: string; store?: string; role?: string }>({});

  const showStoreField = selectedRole !== null && selectedRole !== 'buyer';
  const displayPhone = verifiedContact?.method === 'phone'
    ? `${maskPhone(verifiedContact.value)}`
    : phone
      ? maskPhone(phone)
      : '';
  const displayEmail = verifiedContact?.method === 'email'
    ? verifiedContact.value
    : email;

  const handleCreateAccount = async () => {
    // Validate
    const newErrors: { name?: string; store?: string; role?: string } = {};

    if (!fullName.trim()) {
      newErrors.name = t(locale, 'الاسم مطلوب', 'Name is required');
    }
    if (!selectedRole) {
      newErrors.role = t(locale, 'اختر نوع الحساب', 'Select an account type');
    }
    if (showStoreField && !storeName.trim()) {
      newErrors.store = t(locale, 'اسم المتجر مطلوب', 'Store name is required');
    }
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    const ok = await register();
    if (ok) {
      toast.success(
        t(locale, `مرحباً ${fullName.trim()}! تم إنشاء حسابك بنجاح`, `Welcome ${fullName.trim()}! Account created`)
      );
    }
  };

  const handleBack = () => {
    setStep('otp');
  };

  return (
    <div className="animate-fade-in space-y-5">
      {/* Header */}
      <div className="text-center space-y-1">
        <h2 className="text-xl font-bold">
          {t(locale, 'إنشاء حساب جديد', 'Create Account')}
        </h2>
        <p className="text-sm text-[var(--muted-foreground)]">
          {t(locale, 'أكمل بياناتك لإنشاء الحساب', 'Complete your details to create your account')}
        </p>
      </div>

      {/* Full Name */}
      <div className="space-y-1.5">
        <label className="text-sm font-medium text-[var(--foreground)]">
          {t(locale, 'الاسم الكامل', 'Full Name')} <span className="text-[var(--destructive)]">*</span>
        </label>
        <Input
          type="text"
          placeholder={locale === 'ar' ? 'أحمد محمد' : 'Ahmed Mohammed'}
          value={fullName}
          onChange={(e) => { setFullName(e.target.value); setErrors((p) => ({ ...p, name: undefined })); setError(null); }}
          className={cn('h-11', errors.name && 'border-[var(--destructive)]')}
          autoFocus
          onKeyDown={(e) => e.key === 'Enter' && handleCreateAccount()}
        />
        {errors.name && (
          <p className="text-xs text-[var(--destructive)]">{errors.name}</p>
        )}
      </div>

      {/* Role Selection */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-[var(--foreground)]">
          {t(locale, 'نوع الحساب', 'Account Type')} <span className="text-[var(--destructive)]">*</span>
        </label>
        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
          {ROLES.map((role) => {
            const Icon = role.icon;
            const isSelected = selectedRole === role.id;
            return (
              <button
                key={role.id}
                type="button"
                onClick={() => {
                  setSelectedRole(isSelected ? null : role.id);
                  setErrors((p) => ({ ...p, role: undefined }));
                  setError(null);
                }}
                className={cn(
                  'relative flex flex-col items-center gap-1.5 rounded-xl border-2 p-3 transition-all duration-200 text-center',
                  'hover:shadow-md hover:-translate-y-0.5',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand)] focus-visible:ring-offset-2',
                  isSelected
                    ? 'border-[var(--brand)] bg-[var(--brand)]/5 shadow-[var(--shadow-brand)]'
                    : 'border-[var(--border)] bg-[var(--card)]',
                )}
              >
                {/* Icon */}
                <div className={cn(
                  'w-9 h-9 rounded-lg flex items-center justify-center text-white transition-transform',
                  role.bgClass,
                  isSelected && 'scale-110',
                )}>
                  <Icon className="size-4.5" />
                </div>

                {/* Label */}
                <span className="text-xs font-semibold leading-tight">
                  {locale === 'ar' ? role.labelAr : role.labelEn}
                </span>

                {/* Description */}
                <span className="text-[10px] text-[var(--muted-foreground)] leading-tight">
                  {locale === 'ar' ? role.descAr : role.descEn}
                </span>

                {/* Checkmark */}
                {isSelected && (
                  <div className="absolute -top-1.5 -end-1.5 w-5 h-5 rounded-full gradient-brand flex items-center justify-center shadow-sm animate-scale-in">
                    <Check className="size-3 text-[var(--navy)]" />
                  </div>
                )}
              </button>
            );
          })}
        </div>
        {errors.role && (
          <p className="text-xs text-[var(--destructive)]">{errors.role}</p>
        )}
      </div>

      {/* Store Name (conditional) */}
      {showStoreField && (
        <div className="space-y-1.5 animate-fade-in">
          <label className="text-sm font-medium text-[var(--foreground)]">
            {t(locale, 'اسم المتجر / النشاط التجاري', 'Store / Business Name')}{' '}
            <span className="text-[var(--destructive)]">*</span>
          </label>
          <Input
            type="text"
            placeholder={locale === 'ar' ? 'متجر النون' : 'Noon Store'}
            value={storeName}
            onChange={(e) => { setStoreName(e.target.value); setErrors((p) => ({ ...p, store: undefined })); setError(null); }}
            className={cn('h-11', errors.store && 'border-[var(--destructive)]')}
            onKeyDown={(e) => e.key === 'Enter' && handleCreateAccount()}
          />
          {errors.store && (
            <p className="text-xs text-[var(--destructive)]">{errors.store}</p>
          )}
        </div>
      )}

      {/* Phone (read-only, masked) */}
      {(method === 'phone' || verifiedContact?.method === 'phone') && displayPhone && (
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-[var(--foreground)]">
            {t(locale, 'رقم الهاتف', 'Phone Number')}
          </label>
          <Input
            type="text"
            dir="ltr"
            value={displayPhone}
            readOnly
            className="text-start bg-[var(--surface)] cursor-default h-11"
          />
        </div>
      )}

      {/* Email (editable if method was phone) */}
      <div className="space-y-1.5">
        <label className="text-sm font-medium text-[var(--foreground)]">
          {t(locale, 'البريد الإلكتروني', 'Email')}
        </label>
        <Input
          type="email"
          dir="ltr"
          value={email}
          placeholder={verifiedContact?.method === 'phone' ? t(locale, 'email@example.com', 'email@example.com') : undefined}
          onChange={(e) => setEmail(e.target.value)}
          readOnly={verifiedContact?.method === 'email' || method === 'email'}
          className={cn(
            'text-start h-11',
            (verifiedContact?.method === 'email' || method === 'email') && 'bg-[var(--surface)]',
          )}
        />
      </div>

      {/* Error from server */}
      {error && (
        <p className="text-sm text-[var(--destructive)] text-center animate-fade-in">{error}</p>
      )}

      {/* Create Account Button */}
      <Button
        onClick={handleCreateAccount}
        disabled={isLoading}
        className="w-full h-11 gradient-navy text-[var(--navy-foreground)] font-semibold rounded-lg hover:opacity-90 transition-opacity"
      >
        {isLoading ? (
          <span className="flex items-center gap-2">
            <Loader2 className="size-4 animate-spin" />
            {t(locale, 'جاري الإنشاء...', 'Creating...')}
          </span>
        ) : (
          t(locale, 'إنشاء الحساب', 'Create Account')
        )}
      </Button>

      {/* Back link */}
      <button
        type="button"
        onClick={handleBack}
        className="flex items-center justify-center gap-1 w-full text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
      >
        {locale === 'ar'
          ? <ArrowRight className="size-3.5" />
          : <ArrowLeft className="size-3.5" />
        }
        {t(locale, 'رجوع', 'Back')}
      </button>
    </div>
  );
}
