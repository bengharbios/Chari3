'use client';

import React, { useState, useEffect } from 'react';
import { useAdminAuthStore } from '@/lib/store/admin-auth';
import AdminSidebar from './AdminSidebar';
import { Button } from '@/components/ui/button';
import { Globe, LogOut, Menu, LayoutDashboard, Settings, Sliders, ToggleRight, TrendingUp, ShoppingCart, Users, Store, Wallet, Tag, FolderTree, Boxes } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import Link from 'next/link';

export default function AdminLayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const { adminLocale, setAdminLocale, logout, adminUser, isAdminAuthenticated } = useAdminAuthStore();
  const [isMounted, setIsMounted] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const toggleLocale = () => {
    setAdminLocale(adminLocale === 'ar' ? 'en' : 'ar');
  };

  const handleLogout = () => {
    logout();
    window.location.reload();
  };

  if (!isMounted) {
    return <div className="min-h-screen bg-slate-50 dark:bg-slate-900" />;
  }

  const isRTL = adminLocale === 'ar';
  const isLoginPage = pathname.includes('/login');

  const getAdminPath = (subPath: string) => {
    if (typeof window === 'undefined') return '';
    const segments = window.location.pathname.split('/');
    const baseSlug = segments[1] || 'super-admin';
    return subPath === '' ? `/${baseSlug}` : `/${baseSlug}/${subPath}`;
  };

  // CRITICAL FIX: Do not show sidebar or header if not authenticated OR on login page
  if (!isAdminAuthenticated || isLoginPage) {
    return (
      <div dir={isRTL ? 'rtl' : 'ltr'} className="min-h-screen bg-slate-50 dark:bg-slate-900">
        {children}
      </div>
    );
  }

  return (
    <div 
      dir={isRTL ? 'rtl' : 'ltr'} 
      className="flex h-screen overflow-hidden bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100"
    >
      {/* Sidebar (Desktop) */}
      <AdminSidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="bg-navy text-white h-16 flex items-center justify-between px-6 shadow-md flex-shrink-0">
          <div className="flex items-center gap-3">
            {/* Mobile Menu Button with Sheet */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden text-white">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side={isRTL ? "right" : "left"} className="p-0 bg-navy text-white w-64 border-none">
                <div className="h-16 flex items-center px-4 border-b border-slate-700">
                  <span className="font-bold text-lg text-brand">{isRTL ? 'الإدارة' : 'Admin Panel'}</span>
                </div>
                <nav className="p-4 space-y-4 overflow-y-auto max-h-[85vh]">
                  {/* Overview & Reports */}
                  <div className="space-y-1">
                    <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold px-3 py-1">
                      {isRTL ? "نظرة عامة وتقارير" : "Overview & Reports"}
                    </p>
                    <Link href={getAdminPath('')} className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-800 text-white text-sm">
                      <LayoutDashboard className="h-4.5 w-4.5 text-blue-500" />
                      <span>{isRTL ? 'لوحة التحكم الرئيسية' : 'Dashboard Overview'}</span>
                    </Link>
                    <Link href={getAdminPath('?tab=products')} className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-800 text-white text-sm">
                      <TrendingUp className="h-4.5 w-4.5 text-yellow-500" />
                      <span>{isRTL ? 'المنتجات الأكثر مبيعاً' : 'Top Selling Products'}</span>
                    </Link>
                  </div>

                  {/* Orders & Direct Control */}
                  <div className="space-y-1">
                    <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold px-3 py-1">
                      {isRTL ? "الطلب والتحكم الفوري" : "Orders & Control"}
                    </p>
                    <Link href={getAdminPath('?tab=orders')} className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-800 text-white text-sm">
                      <ShoppingCart className="h-4.5 w-4.5 text-indigo-500" />
                      <span>{isRTL ? 'إدارة الطلبات المنفذة' : 'Fulfilled Orders'}</span>
                    </Link>
                    <Link href={getAdminPath('?tab=order-statuses')} className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-800 text-white text-sm">
                      <Sliders className="h-4.5 w-4.5 text-cyan-500" />
                      <span>{isRTL ? 'إعدادات الحالات' : 'Order Statuses'}</span>
                    </Link>
                  </div>

                  {/* Accounts & Merchants */}
                  <div className="space-y-1">
                    <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold px-3 py-1">
                      {isRTL ? "الحسابات والتجارة" : "Accounts & Merchants"}
                    </p>
                    <Link href={getAdminPath('?tab=users')} className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-800 text-white text-sm">
                      <Users className="h-4.5 w-4.5 text-purple-500" />
                      <span>{isRTL ? 'إدارة حسابات المستخدمين' : 'User Accounts'}</span>
                    </Link>
                    <Link href={getAdminPath('?tab=stores-sellers')} className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-800 text-white text-sm">
                      <Store className="h-4.5 w-4.5 text-emerald-500" />
                      <span>{isRTL ? 'المتاجر والتجار' : 'Stores & Sellers'}</span>
                    </Link>
                  </div>

                  {/* Finance & Subscriptions */}
                  <div className="space-y-1">
                    <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold px-3 py-1">
                      {isRTL ? "المالية والاشتراكات" : "Finance & Subscriptions"}
                    </p>
                    <Link href={getAdminPath('?tab=billing')} className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-800 text-white text-sm">
                      <Wallet className="h-4.5 w-4.5 text-rose-500" />
                      <span>{isRTL ? 'الاشتراكات والمديونية' : 'Subscriptions & Debt'}</span>
                    </Link>
                  </div>

                  {/* Platform Settings */}
                  <div className="space-y-1">
                    <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold px-3 py-1">
                      {isRTL ? "إعدادات المنصة" : "Platform Settings"}
                    </p>
                    <Link href={getAdminPath('coupons')} className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-800 text-white text-sm">
                      <Tag className="h-4.5 w-4.5 text-amber-500" />
                      <span>{isRTL ? 'الكوبونات العامة' : 'Global Coupons'}</span>
                    </Link>
                    <Link href={getAdminPath('categories')} className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-800 text-white text-sm">
                      <FolderTree className="h-4.5 w-4.5 text-sky-500" />
                      <span>{isRTL ? 'إدارة التصنيفات' : 'Manage Categories'}</span>
                    </Link>
                    <Link href={getAdminPath('brands')} className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-800 text-white text-sm">
                      <Boxes className="h-4.5 w-4.5 text-teal-500" />
                      <span>{isRTL ? 'إدارة الماركات' : 'Manage Brands'}</span>
                    </Link>
                    <Link href={getAdminPath('cms')} className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-800 text-white text-sm">
                      <Sliders className="h-4.5 w-4.5 text-pink-500" />
                      <span>{isRTL ? 'إدارة الواجهة (CMS)' : 'Storefront CMS'}</span>
                    </Link>
                    <Link href={getAdminPath('flags')} className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-800 text-white text-sm">
                      <ToggleRight className="h-4.5 w-4.5 text-red-500" />
                      <span>{isRTL ? 'مفاتيح الميزات' : 'Feature Flags'}</span>
                    </Link>
                    <Link href={getAdminPath('settings')} className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-800 text-white text-sm">
                      <Settings className="h-4.5 w-4.5 text-slate-500" />
                      <span>{isRTL ? 'الإعدادات العامة' : 'General Settings'}</span>
                    </Link>
                  </div>
                </nav>
              </SheetContent>
            </Sheet>

            <span className="font-bold text-lg hidden md:block">
              {isRTL ? 'لوحة تحكم النظام' : 'System Dashboard'}
            </span>
          </div>

          <div className="flex items-center gap-4">
            {/* Language Toggle */}
            <Button 
              variant="ghost" 
              size="sm" 
              className="gap-2 text-white hover:bg-slate-700"
              onClick={toggleLocale}
            >
              <Globe className="h-4 w-4" />
              <span>{isRTL ? 'English' : 'عربي'}</span>
            </Button>

            <div className="text-sm hidden sm:block">
              <span className="text-slate-300">{isRTL ? 'مرحباً، ' : 'Welcome, '}</span>
              <span className="font-medium text-brand">{adminUser?.name || 'Admin'}</span>
            </div>
            
            <Button 
              variant="destructive" 
              size="sm" 
              className="gap-2 bg-red-600 hover:bg-red-700"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">{isRTL ? 'خروج آمن' : 'Logout'}</span>
            </Button>
          </div>
        </header>

        {/* Dynamic Children Content */}
        <main className="flex-1 overflow-auto p-6">
          <div className="max-w-[1750px] mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
