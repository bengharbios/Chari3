'use client';

import React, { useState, useEffect } from 'react';
import { useAdminAuthStore } from '@/lib/store/admin-auth';
import { useAppStore } from '@/lib/store';
import { 
  LayoutDashboard, Settings, Sliders, ToggleRight, ChevronRight, ChevronLeft,
  Menu, FolderTree, Tag, TrendingUp, ShoppingCart, Users, Store, Wallet,
  Boxes, Banknote, Palette, ChevronDown, Monitor, KeyRound, LogOut, Globe
} from 'lucide-react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useTheme } from 'next-themes';

import { useTranslation } from '@/lib/i18n/useTranslation';

export default function AdminSidebar({ className }: { className?: string }) {
  const { adminUser, logout } = useAdminAuthStore();
  const { isSidebarOpen, setSidebarOpen } = useAppStore();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeGroup, setActiveGroup] = useState<number | null>(null);
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { t, locale } = useTranslation();

  const isRTL = locale === 'ar';
  const currentTab = searchParams.get('tab') || 'overview';

  useEffect(() => {
    const handleToggle = () => setIsCollapsed(prev => !prev);
    window.addEventListener('toggleAdminSidebar', handleToggle);
    return () => window.removeEventListener('toggleAdminSidebar', handleToggle);
  }, []);

  const toggleGroup = (idx: number) => {
    if (isCollapsed) return;
    setActiveGroup(prev => prev === idx ? null : idx);
  };

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
      title: t('admin.overview'),
      items: [
        { icon: LayoutDashboard, label: t('admin.dashboardOverview'), path: '' },
        { icon: TrendingUp, label: t('admin.topProducts'), path: '?tab=products' },
      ]
    },
    {
      title: t('admin.ordersControl'),
      items: [
        { icon: ShoppingCart, label: t('admin.fulfilledOrders'), path: '?tab=orders' },
        { icon: Sliders, label: t('admin.orderStatuses'), path: '?tab=order-statuses' },
      ]
    },
    {
      title: t('admin.accounts'),
      items: [
        { icon: Users, label: t('admin.userAccounts'), path: '?tab=users' },
        { icon: Store, label: t('admin.storesSellers'), path: '?tab=stores-sellers' },
      ]
    },
    {
      title: t('admin.financeSubscriptions'),
      items: [
        { icon: Settings, label: t('admin.commissionSettings'), path: 'billing/settings' },
        { icon: Tag, label: t('admin.subscriptionPackages'), path: 'billing/packages' },
        { icon: Users, label: t('admin.merchantsSubscriptions'), path: 'billing/merchants' },
        { icon: Wallet, label: t('admin.walletsDebts'), path: 'billing/wallets' },
        { icon: Banknote, label: t('admin.payoutRequests'), path: 'billing/withdrawals' },
        { icon: Sliders, label: t('admin.reviewReceipts'), path: 'billing/receipts' },
        { icon: TrendingUp, label: t('admin.revenueReports'), path: 'billing/revenue' },
      ]
    },
    {
      title: t('admin.platformSettings'),
      items: [
        { icon: Tag, label: t('admin.globalCoupons'), path: 'coupons' },
        { icon: FolderTree, label: t('admin.manageCategories'), path: 'categories' },
        { icon: Boxes, label: t('admin.manageBrands'), path: 'brands' },
        { icon: Sliders, label: t('admin.storefrontCMS'), path: 'cms' },
        { icon: Settings, label: t('admin.homepageSettings'), path: 'settings/homepage' },
        { icon: ToggleRight, label: t('admin.featureFlags'), path: 'flags' },
        { icon: Globe, label: t('admin.manageTranslations'), path: 'settings/translations' },
        { icon: Settings, label: t('admin.generalSettings'), path: 'settings' },
        { icon: Palette, label: t('admin.themeDesign'), path: 'settings/theme' },
      ]
    }
  ];

  useEffect(() => {
    const idx = navGroups.findIndex(g => g.items.some(i => getIsActive(i.path)));
    if (idx !== -1) {
      setActiveGroup(idx);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, currentTab]);

  const getAdminPath = (subPath: string) => {
    if (typeof window === 'undefined') return '';
    const segments = window.location.pathname.split('/');
    const baseSlug = segments[1] || 'super-admin';
    return subPath === '' ? `/${baseSlug}` : `/${baseSlug}/${subPath}`;
  };

  const initials = adminUser?.name
    ? adminUser.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
    : 'A';

  const themeBg = '#1a2332'; // Gentelella Admin Signature Color

  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  return (
    <>
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-[9998] lg:hidden backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        dir={isRTL ? 'rtl' : 'ltr'}
        className={cn(
          'fixed top-0 bottom-0 z-[9999] lg:z-auto flex flex-col font-sans',
          'transition-all duration-300 ease-in-out',
          'lg:sticky lg:h-screen text-[#94a3b8]',
          isSidebarOpen ? 'start-0 w-[260px]' : '-start-[260px] w-[260px]',
          'lg:start-0',
          isCollapsed ? 'lg:w-[76px]' : 'lg:w-[260px]',
          className
        )}
        style={{ backgroundColor: themeBg }}
      >
      {/* Logo Section */}
      <div className="flex items-center gap-3 px-6 h-[72px] shrink-0 border-b border-white/5 cursor-pointer" onClick={() => setIsCollapsed(!isCollapsed)}>
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#1ABB9C] text-white font-bold text-lg shrink-0 shadow-[0_0_15px_rgba(26,187,156,0.3)]">
          A
        </div>
        <div className={cn("flex flex-col transition-opacity duration-300", isCollapsed ? "opacity-0 hidden" : "opacity-100")}>
          <span className="text-white text-lg font-bold tracking-wide">
            {t('admin.title')}
          </span>
        </div>
      </div>

      <div className="flex flex-1 flex-col overflow-y-auto overflow-x-hidden no-scrollbar">

        {/* User Profile Info */}
        <div className={cn("flex items-center gap-3 p-4", isCollapsed ? "justify-center" : "")}>
          <div className="relative shrink-0">
            <div className={cn("rounded-full flex items-center justify-center text-white font-bold border-2 border-white/20", isCollapsed ? "h-10 w-10" : "h-14 w-14", "bg-[#1ABB9C]")}>
              {initials}
            </div>
          </div>
          <div className={cn("flex flex-col flex-1 min-w-0 transition-opacity", isCollapsed ? "hidden opacity-0" : "opacity-100")}>
            <span className="text-[13px] text-[#BAB8B8]">{t('common.welcome')}</span>
            <span className="text-[15px] font-semibold text-[#E7E7E7] truncate">{adminUser?.name || 'Admin'}</span>
          </div>
        </div>
        <div className="w-full h-px bg-white/5 mb-2" />

        {/* Sidebar Menu */}
        <div className="flex-1 py-2">
          <nav className="flex flex-col w-full">
            {navGroups.map((group, gIdx) => {
              const isOpen = activeGroup === gIdx;
              return (
                <div key={gIdx} className="mb-4">
                  <div 
                    className={cn("px-6 mb-2 transition-opacity cursor-pointer flex justify-between items-center", isCollapsed ? "opacity-0 hidden" : "opacity-100")}
                    onClick={() => toggleGroup(gIdx)}
                  >
                    <span className="text-[11px] font-bold text-[#64748b] uppercase tracking-widest select-none hover:text-[#94a3b8] transition-colors">
                      {group.title}

                    </span>
                    <ChevronDown className={cn("h-3 w-3 text-[#64748b] transition-transform", !isOpen && (isRTL ? "rotate-90" : "-rotate-90"))} />
                  </div>
                  
                    <ul className={cn("flex flex-col px-3 gap-0.5 overflow-hidden transition-all duration-300 ease-in-out", (!isOpen && !isCollapsed) ? "max-h-0 opacity-0" : "max-h-[1000px] opacity-100")}>
                      {group.items.map((item) => {
                        const isActive = getIsActive(item.path);
                        const label = item.label;
                        const Icon = item.icon;

                        return (
                        <li key={item.path} className="relative group">
                          <Link
                            dir={isRTL ? 'rtl' : 'ltr'}
                            href={getAdminPath(item.path)}
                            className={cn(
                              'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[14px] font-medium transition-all duration-200 outline-none relative',
                              isActive
                                ? 'bg-white/10 text-white' 
                                : 'text-[#94a3b8] hover:bg-white/5 hover:text-white',
                              isCollapsed && 'justify-center px-0'
                            )}
                          >
                            {/* Horizontal line connector for active item to mimic gentelella v4 */}
                            {isActive && !isCollapsed && (
                              <div className={cn(
                                "absolute top-1/2 -translate-y-1/2 w-1.5 h-6 bg-[#1ABB9C] rounded-full",
                                isRTL ? "right-0" : "left-0"
                              )} />
                            )}
                            
                            <Icon className={cn(
                              "h-[20px] w-[20px] shrink-0 transition-colors", 
                              isActive ? "text-[#1ABB9C]" : "group-hover:text-[#1ABB9C]"
                            )} strokeWidth={isActive ? 2.5 : 2} />
                            
                            <span className={cn("text-start transition-opacity truncate", isCollapsed ? "opacity-0 hidden" : "opacity-100")}>
                              {label}
                            </span>
                            
                            {/* Hover tooltip for collapsed state */}
                            {isCollapsed && (
                              <div className={cn(
                                "absolute top-1/2 -translate-y-1/2 opacity-0 pointer-events-none group-hover:opacity-100 transition-all z-[100]",
                                isRTL ? "right-[110%] -translate-x-2 group-hover:translate-x-0" : "left-[110%] translate-x-2 group-hover:translate-x-0"
                              )}>
                                <div className="bg-white text-[#1e293b] text-xs font-bold px-3 py-2 rounded-md whitespace-nowrap shadow-xl">
                                  {label}
                                </div>
                              </div>
                            )}
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Gentelella Footer Icons */}
      <div className={cn(
        "shrink-0 bg-[#171f2d] flex mt-auto",
        isCollapsed ? "hidden" : ""
      )}>
        <Link 
          href={getAdminPath('settings')}
          className="flex-1 py-3 flex justify-center text-[#5A738E] hover:text-white transition-colors hover:bg-[#1a2332]"
        >
          <Settings className="h-[18px] w-[18px]" />
        </Link>
        <button 
          className="flex-1 py-3 flex justify-center text-[#5A738E] hover:text-white transition-colors hover:bg-[#1a2332]"
          onClick={toggleFullScreen}
        >
          <Monitor className="h-[18px] w-[18px]" />
        </button>
        <button 
          className="flex-1 py-3 flex justify-center text-[#5A738E] hover:text-white transition-colors hover:bg-[#1a2332]"
        >
          <KeyRound className="h-[18px] w-[18px]" />
        </button>
        <button 
          onClick={() => { logout(); window.location.reload(); }}
          className="flex-1 py-3 flex justify-center text-[#5A738E] hover:text-red-400 transition-colors hover:bg-[#1a2332]"
        >
          <LogOut className="h-[18px] w-[18px]" />
        </button>
      </div>
    </aside>
    </>
  );
}
