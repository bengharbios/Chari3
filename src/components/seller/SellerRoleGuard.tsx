'use client';

import React from 'react';
import { useAuthStore, useAppStore } from '@/lib/store';
import { useRouter } from 'next/navigation';
import { ShieldOff, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

// Roles that are BLOCKED from financial/billing pages
const BLOCKED_ROLES = ['store_manager', 'editor', 'support', 'viewer', 'staff'];

interface SellerRoleGuardProps {
  /** If provided, only these roles are ALLOWED through. Otherwise BLOCKED_ROLES are denied. */
  allowedRoles?: string[];
  children: React.ReactNode;
}

export default function SellerRoleGuard({ allowedRoles, children }: SellerRoleGuardProps) {
  const { user } = useAuthStore();
  const { locale } = useAppStore();
  const router = useRouter();
  const isAr = locale === 'ar';

  const t = (ar: string, en: string) => (isAr ? ar : en);

  const userRole = user?.role || '';

  const isDenied = allowedRoles
    ? !allowedRoles.includes(userRole) // explicit allowlist
    : BLOCKED_ROLES.includes(userRole); // default blocklist

  if (!isDenied) return <>{children}</>;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.35 }}
      className="flex flex-col items-center justify-center min-h-[60vh] p-8 text-center"
    >
      {/* Icon */}
      <div className="relative mb-6">
        <div className="absolute inset-0 bg-destructive/20 rounded-full blur-2xl scale-150" />
        <div className="relative h-24 w-24 rounded-full bg-destructive/10 border border-destructive/30 flex items-center justify-center">
          <ShieldOff className="h-12 w-12 text-destructive" />
        </div>
      </div>

      {/* Text */}
      <h1 className="text-2xl font-black text-foreground mb-2">
        {t('⛔ وصول مقيّد', '⛔ Access Restricted')}
      </h1>
      <p className="text-sm text-muted-foreground max-w-sm leading-relaxed mb-1">
        {t(
          'هذه الصفحة مخصصة للتاجر المالك فقط. بيانات المحفظة والفواتير والباقات هي معلومات مالية حساسة لا يمكن لأعضاء الفريق الاطلاع عليها.',
          'This page is restricted to the store owner only. Wallet, billing, and subscription data are sensitive financial records not accessible to team members.'
        )}
      </p>
      <p className="text-xs text-muted-foreground/60 mb-6">
        {t(
          `دورك الحالي: ${userRole === 'store_manager' ? 'مدير المتجر' : userRole}`,
          `Your current role: ${userRole}`
        )}
      </p>

      {/* Action */}
      <Button
        variant="outline"
        className="rounded-xl font-bold gap-2"
        onClick={() => router.push('/seller/dashboard')}
      >
        <ArrowLeft className="h-4 w-4" />
        {t('العودة للوحة التحكم', 'Back to Dashboard')}
      </Button>
    </motion.div>
  );
}
