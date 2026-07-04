'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { useAppStore, useAuthStore } from '@/lib/store';
import { Toaster } from 'sonner';
import FloatingCart from './FloatingCart';
import AuthSync from '@/components/auth/AuthSync';
import AppInitializer from '@/components/layout/AppInitializer';
import ResizeObserverPatcher from '@/components/layout/ResizeObserverPatcher';

import { Wrench, Eye, Loader2 } from 'lucide-react';
import { useAdminAuthStore } from '@/lib/store/admin-auth';

interface AppShellProps {
  children: ReactNode;
}

export default function AppShell({ children }: AppShellProps) {
  const { locale, theme, isMaintenance } = useAppStore();
  const { isAuthenticated, user } = useAuthStore();
  const { isAdminAuthenticated } = useAdminAuthStore();
  const [isImpersonating, setIsImpersonating] = useState(false);
  const [isReverting, setIsReverting] = useState(false);

  useEffect(() => {
    const dir = locale === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.setAttribute('dir', dir);
    document.documentElement.setAttribute('lang', locale);
    if (typeof document !== 'undefined') {
      setIsImpersonating(document.cookie.includes('chari_impersonator_id'));
    }
  }, [locale]);

  if (isMaintenance && !isAdminAuthenticated && user?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 flex flex-col items-center justify-center p-6 text-white text-center font-cairo">
        {/* Glowing glassmorphic container */}
        <div className="max-w-2xl w-full p-8 md:p-12 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl shadow-2xl space-y-8 relative overflow-hidden">
          {/* Subtle ambient light shapes */}
          <div className="absolute -top-24 -left-24 w-48 h-48 bg-amber-400/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />

          {/* Animated tool icon */}
          <div className="flex justify-center">
            <div className="p-5 rounded-2xl bg-gradient-to-br from-amber-400/20 to-indigo-500/20 border border-amber-400/30 shadow-inner animate-pulse">
              <Wrench className="h-12 w-12 text-amber-400 animate-bounce" />
            </div>
          </div>

          {/* Content */}
          <div className="space-y-4">
            <h1 className="text-3xl md:text-4xl font-black leading-tight bg-gradient-to-r from-amber-400 via-white to-amber-400 bg-clip-text text-transparent">
              {locale === 'ar' ? 'أعمال صيانة مجدولة' : 'Scheduled Maintenance'}
            </h1>
            <p className="text-sm md:text-base text-slate-300 leading-relaxed">
              {locale === 'ar' 
                ? 'نعمل حالياً على ترقية خوادمنا وتطوير ميزات المنصة لنقدم لكم تجربة تسوق فائقة السرعة والأمان. سنعود للعمل قريباً جداً!'
                : 'We are currently upgrading our cloud infrastructure and core systems to deliver a premium, high-speed trading environment. We will be back online shortly!'}
            </p>
          </div>

          {/* Details / ETA */}
          <div className="p-4 rounded-xl bg-white/5 border border-white/5 text-xs text-slate-400">
            {locale === 'ar' 
              ? 'يرجى مراجعة منصة الدعم الفني أو التواصل معنا لمزيد من التفاصيل.' 
              : 'Please contact support or consult your account manager if you require urgent assistance.'}
          </div>

          {/* Logo brand */}
          <div className="pt-4 border-t border-white/10 flex items-center justify-center gap-2">
            <span className="font-black text-lg text-amber-400">شاري داي</span>
            <span className="text-slate-500 font-light">|</span>
            <span className="font-extrabold text-sm tracking-wider">ChariDay</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`min-h-dvh max-w-full overflow-x-hidden flex flex-col bg-background text-foreground transition-colors duration-300 ${
        locale === 'ar' ? 'font-[Cairo]' : 'font-[Inter]'
      }`}
      dir={locale === 'ar' ? 'rtl' : 'ltr'}
    >
      <ResizeObserverPatcher />
      <AuthSync />
      <AppInitializer />
      
      {/* Dynamic Maintenance Warning Bar for Admins */}
      {isMaintenance && (isAdminAuthenticated || user?.role === 'admin') && (
        <div className="bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 py-2.5 px-4 text-center text-xs md:text-sm font-bold flex items-center justify-center gap-2 z-50 relative font-cairo shadow-md select-none">
          <Wrench className="h-4 w-4 animate-bounce text-slate-950" />
          <span>
            {locale === 'ar' 
              ? '⚠️ وضع الصيانة نشط حالياً — المنصة مغلقة أمام الزوار، وتظهر لك فقط بصفتك مسؤولاً للنظام.' 
              : '⚠️ Maintenance Mode Active — Storefront is offline for visitors, visible to you as administrator.'}
          </span>
        </div>
      )}

      {/* Impersonation Banner */}
      {isImpersonating && (
        <div className="bg-purple-600 text-white py-2 px-4 text-center text-xs md:text-sm font-bold flex flex-wrap items-center justify-center gap-3 z-50 relative font-cairo shadow-md">
          <div className="flex items-center gap-2">
            <Eye className="h-4 w-4 animate-pulse" />
            <span>
              {locale === 'ar' 
                ? 'أنت تتصفح المنصة حالياً بهوية هذا المستخدم (Login As).' 
                : 'You are currently impersonating this user (Login As).'}
            </span>
          </div>
          <button 
            disabled={isReverting}
            onClick={async () => {
              try {
                setIsReverting(true);
                toast.info(locale === 'ar' ? 'جاري العودة للوحة التحكم...' : 'Returning to Admin...');
                const res = await fetch('/api/admin/impersonate/revert', { method: 'POST' });
                const data = await res.json();
                if (data.success) {
                  window.location.href = data.redirectUrl;
                } else {
                  toast.error(data.error);
                  setIsReverting(false);
                }
              } catch (err) {
                toast.error('Error returning to admin');
                setIsReverting(false);
              }
            }}
            className="bg-white/20 hover:bg-white/30 text-white px-3 py-1 rounded-full text-xs transition-colors disabled:opacity-50"
          >
            {isReverting ? <Loader2 className="h-3 w-3 animate-spin" /> : (locale === 'ar' ? 'العودة للوحة الإدارة' : 'Return to Admin')}
          </button>
        </div>
      )}

      {children}
      <FloatingCart />
    </div>
  );
}
