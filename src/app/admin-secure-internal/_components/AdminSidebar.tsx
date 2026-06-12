'use client';

import React, { useState, useEffect } from 'react';
import { useAdminAuthStore } from '@/lib/store/admin-auth';
import { useAppStore } from '@/lib/store';
import { 
  LayoutDashboard, Settings, Sliders, ToggleRight, ChevronRight, ChevronLeft,
  FolderTree, Tag, TrendingUp, ShoppingCart, Users, Store, Wallet,
  Boxes, Banknote, Palette, ChevronDown, Monitor, KeyRound, LogOut, Globe
} from 'lucide-react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { cn } from '@/lib/utils';

import { useTranslation } from '@/lib/i18n/useTranslation';

export default function AdminSidebar({ className }: { className?: string }) {
  const { adminUser, logout } = useAdminAuthStore();
  const { isSidebarOpen, setSidebarOpen } = useAppStore();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({});
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

  const toggleSection = (sectionTitle: string) => {
    if (isCollapsed) return;
    setCollapsedSections(prev => ({ ...prev, [sectionTitle]: !prev[sectionTitle] }));
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
        { icon: Monitor, label: t('admin.manageAdvertisements'), path: 'advertisements' },
        { icon: ToggleRight, label: t('admin.featureFlags'), path: 'flags' },
        { icon: Globe, label: t('admin.manageTranslations'), path: 'settings/translations' },
        { icon: Settings, label: t('admin.generalSettings'), path: 'settings' },
        { icon: Palette, label: t('admin.themeDesign'), path: 'settings/theme' },
      ]
    }
  ];

  useEffect(() => {
    const activeGroupIndex = navGroups.findIndex(g => g.items.some(i => getIsActive(i.path)));
    if (activeGroupIndex !== -1) {
      const activeGroupTitle = navGroups[activeGroupIndex].title;
      setCollapsedSections(prev => ({ ...prev, [activeGroupTitle]: false }));
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

  const CloseIcon = isRTL ? ChevronRight : ChevronLeft;

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
          isSidebarOpen ? 'start-0 w-[var(--sidebar-width)]' : '-start-[280px] w-[var(--sidebar-width)]',
          'lg:start-0',
          isCollapsed ? 'lg:w-[80px]' : 'lg:w-[var(--sidebar-width)]',
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
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-1 rounded hover:bg-white/10 shrink-0"
              aria-label={isRTL ? 'إغلاق' : 'Close'}
            >
              <CloseIcon className="h-4 w-4" />
            </button>
          </div>
          <div className="w-full h-px bg-white/5 mb-2" />

          {/* Sidebar Menu */}
          <div className="flex-1 py-4">
            <nav className={cn("flex flex-col w-full space-y-1.5", isCollapsed ? "px-2" : "px-3")}>
              {navGroups.flatMap((group, gIdx) => {
                const isSectionCollapsed = collapsedSections[group.title] ?? false;

                const headerButton = (
                  <button
                    key={`section-${gIdx}`}
                    onClick={() => toggleSection(group.title)}
                    className={cn(
                      "w-full flex items-center justify-between px-4 py-2 mt-4 first:mt-0 transition-opacity duration-300 group hover:bg-white/5 rounded-md text-start",
                      isCollapsed ? "opacity-0 hidden" : "opacity-100"
                    )}
                  >
                    <span className="text-[10px] font-bold text-[#94a3b8]/50 uppercase tracking-wider group-hover:text-[#94a3b8]/85 transition-colors">
                      {group.title}
                    </span>
                    {isSectionCollapsed ? (
                      <ChevronLeft className={cn("h-3 w-3 text-[#94a3b8]/50", isRTL ? "" : "-rotate-90")} />
                    ) : (
                      <ChevronDown className="h-3 w-3 text-[#94a3b8]/50" />
                    )}
                  </button>
                );

                if (isSectionCollapsed && !isCollapsed) {
                  return [headerButton];
                }

                const items = group.items.map((item) => {
                  const isActive = getIsActive(item.path);
                  const label = item.label;
                  const Icon = item.icon;

                  return (
                    <Link
                      key={item.path}
                      dir={isRTL ? 'rtl' : 'ltr'}
                      href={getAdminPath(item.path)}
                      className={cn(
                        'w-full flex items-center gap-3 py-2.5 rounded-lg text-sm transition-all duration-200 group relative',
                        isCollapsed ? 'justify-center px-0' : 'px-3',
                        isActive
                          ? 'bg-white/10 text-white font-semibold shadow-sm'
                          : 'text-[#94a3b8]/70 hover:bg-white/5 hover:text-white'
                      )}
                      title={isCollapsed ? label : undefined}
                    >
                      {/* Active indicator line like gentelella v4 */}
                      {isActive && !isCollapsed && (
                        <div className={cn(
                          "absolute top-1/2 -translate-y-1/2 w-1 h-5 bg-[#1ABB9C] rounded-full",
                          isRTL ? "right-0" : "left-0"
                        )} />
                      )}

                      <Icon className={cn(
                        "h-5 w-5 shrink-0 transition-colors",
                        isActive ? "text-[#1ABB9C]" : "group-hover:text-[#1ABB9C]"
                      )} strokeWidth={isActive ? 2.5 : 2} />

                      <span className={cn("text-start transition-opacity truncate", isCollapsed ? "opacity-0 hidden" : "opacity-100")}>
                        {label}
                      </span>

                      {/* Tooltip for collapsed state */}
                      {isCollapsed && (
                        <div className="absolute start-14 opacity-0 invisible group-hover:opacity-100 group-hover:visible bg-slate-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap z-50 transition-all shadow-lg pointer-events-none">
                          {label}
                        </div>
                      )}
                    </Link>
                  );
                });

                return [headerButton, ...items];
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
