'use client';

import React, { useState } from 'react';
import { useAdminAuthStore } from '@/lib/store/admin-auth';
import { 
  LayoutDashboard, 
  Settings, 
  Sliders, 
  ToggleRight, 
  ChevronRight, 
  ChevronLeft,
  Menu,
  FolderTree,
  Tag,
  TrendingUp,
  ShoppingCart,
  Users,
  Store,
  Wallet,
  Boxes
} from 'lucide-react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';

export default function AdminSidebar() {
  const { adminLocale } = useAdminAuthStore();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const isRTL = adminLocale === 'ar';
  const currentTab = searchParams.get('tab') || 'overview';

  const dict = {
    ar: {
      title: "الإدارة العامة",
      collapse: "طي القائمة",
      expand: "توسيع",
    },
    en: {
      title: "Admin Panel",
      collapse: "Collapse",
      expand: "Expand",
    }
  };

  const t = dict[adminLocale] || dict.ar;

  const getIsActive = (path: string) => {
    const isBasePage = pathname.split('/').filter(Boolean).length === 1;
    if (path.startsWith('?tab=')) {
      const tabName = path.split('=')[1];
      return isBasePage && currentTab === tabName;
    }
    if (path === '') {
      return isBasePage && currentTab === 'overview';
    }
    return pathname.includes(path);
  };

  const navGroups = [
    {
      titleAr: "نظرة عامة وتقارير",
      titleEn: "Overview & Reports",
      items: [
        { 
          icon: LayoutDashboard, 
          labelAr: "لوحة التحكم الرئيسية", 
          labelEn: "Dashboard Overview", 
          path: '', 
          color: 'text-blue-400' 
        },
        { 
          icon: TrendingUp, 
          labelAr: "المنتجات الأكثر مبيعاً", 
          labelEn: "Top Selling Products", 
          path: '?tab=products', 
          color: 'text-yellow-400' 
        },
      ]
    },
    {
      titleAr: "الطلبات والتحكم الفوري",
      titleEn: "Orders & Direct Control",
      items: [
        { 
          icon: ShoppingCart, 
          labelAr: "إدارة الطلبات المنفذة", 
          labelEn: "Fulfilled Orders", 
          path: '?tab=orders', 
          color: 'text-indigo-400' 
        },
        { 
          icon: Sliders, 
          labelAr: "إعدادات الحالات", 
          labelEn: "Order Statuses", 
          path: '?tab=order-statuses', 
          color: 'text-cyan-400' 
        },
      ]
    },
    {
      titleAr: "الحسابات والتجارة",
      titleEn: "Accounts & Merchants",
      items: [
        { 
          icon: Users, 
          labelAr: "إدارة حسابات المستخدمين", 
          labelEn: "User Accounts", 
          path: '?tab=users', 
          color: 'text-purple-400' 
        },
        { 
          icon: Store, 
          labelAr: "المتاجر والتجار", 
          labelEn: "Stores & Sellers", 
          path: '?tab=stores-sellers', 
          color: 'text-emerald-400' 
        },
      ]
    },
    {
      titleAr: "المالية والاشتراكات",
      titleEn: "Finance & Subscriptions",
      items: [
        { 
          icon: Wallet, 
          labelAr: "الاشتراكات والمديونية", 
          labelEn: "Subscriptions & Debt", 
          path: '?tab=billing', 
          color: 'text-rose-400' 
        },
      ]
    },
    {
      titleAr: "إعدادات المنصة",
      titleEn: "Platform Settings",
      items: [
        { 
          icon: Tag, 
          labelAr: "الكوبونات العامة", 
          labelEn: "Global Coupons", 
          path: 'coupons', 
          color: 'text-amber-400' 
        },
        { 
          icon: FolderTree, 
          labelAr: "إدارة التصنيفات", 
          labelEn: "Manage Categories", 
          path: 'categories', 
          color: 'text-sky-400' 
        },
        { 
          icon: Boxes, 
          labelAr: "إدارة الماركات", 
          labelEn: "Manage Brands", 
          path: 'brands', 
          color: 'text-teal-400' 
        },
        { 
          icon: Sliders, 
          labelAr: "إدارة الواجهة (CMS)", 
          labelEn: "Storefront CMS", 
          path: 'cms', 
          color: 'text-pink-400' 
        },
        { 
          icon: ToggleRight, 
          labelAr: "مفاتيح الميزات", 
          labelEn: "Feature Flags", 
          path: 'flags', 
          color: 'text-red-400' 
        },
        { 
          icon: Settings, 
          labelAr: "الإعدادات العامة", 
          labelEn: "General Settings", 
          path: 'settings', 
          color: 'text-slate-400' 
        },
      ]
    }
  ];

  const getAdminPath = (subPath: string) => {
    if (typeof window === 'undefined') return '';
    const segments = window.location.pathname.split('/');
    const baseSlug = segments[1] || 'super-admin';
    return subPath === '' ? `/${baseSlug}` : `/${baseSlug}/${subPath}`;
  };

  return (
    <div 
      dir={isRTL ? 'rtl' : 'ltr'}
      className={`relative h-screen bg-navy text-white transition-all duration-300 ease-in-out flex flex-col z-20 ${
        isCollapsed ? 'w-20' : 'w-64'
      } hidden lg:flex`}
    >
      {/* Sidebar Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-slate-700">
        {!isCollapsed && (
          <span className="font-bold text-lg text-brand">{t.title}</span>
        )}
        <Button 
          variant="ghost" 
          size="icon" 
          className="text-white hover:bg-slate-700"
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          {isCollapsed ? (
            <Menu className="h-5 w-5" />
          ) : isRTL ? (
            <ChevronRight className="h-5 w-5" />
          ) : (
            <ChevronLeft className="h-5 w-5" />
          )}
        </Button>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 py-4 space-y-4 px-2 overflow-y-auto">
        {navGroups.map((group, gIdx) => (
          <div key={gIdx} className="space-y-1">
            {!isCollapsed && (
              <div className="px-3 py-1.5 text-[10px] font-black tracking-wider text-slate-400 uppercase select-none">
                {isRTL ? group.titleAr : group.titleEn}
              </div>
            )}
            {group.items.map((item) => {
              const isActive = getIsActive(item.path);
              const label = isRTL ? item.labelAr : item.labelEn;
              return (
                <Link 
                  key={item.path} 
                  href={getAdminPath(item.path)}
                  dir={isRTL ? 'rtl' : 'ltr'}
                  className={`flex items-center gap-3 px-3 py-2 rounded-xl transition-all group ${
                    isActive 
                      ? 'bg-brand text-navy font-bold shadow-md' 
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <item.icon className={`h-4.5 w-4.5 flex-shrink-0 ${isActive ? 'text-navy' : item.color} group-hover:scale-110 transition-transform`} />
                  
                  {!isCollapsed && (
                    <span className="text-xs font-semibold truncate">{label}</span>
                  )}
                  
                  {isCollapsed && (
                    <div className={`absolute ${isRTL ? 'right-24' : 'left-24'} bg-white text-navy text-xs font-bold py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity shadow-lg pointer-events-none whitespace-nowrap z-30`}>
                      {label}
                    </div>
                  )}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Footer / Info */}
      <div className="p-4 border-t border-slate-700 text-xs text-slate-400">
        {!isCollapsed ? (
          <p className="text-center">ChariDay v2.0</p>
        ) : (
          <p className="text-center">v2</p>
        )}
      </div>
    </div>
  );
}
