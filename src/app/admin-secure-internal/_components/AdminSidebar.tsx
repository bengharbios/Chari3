'use client';

import React, { useState, useEffect } from 'react';
import { useAdminAuthStore } from '@/lib/store/admin-auth';
import { useAppStore } from '@/lib/store';
import { 
  ShieldAlert, LayoutDashboard, Settings, Sliders, ToggleRight, ChevronRight, ChevronLeft,
  FolderTree, Tag, TrendingUp, ShoppingCart, Users, Store as StoreIcon, Wallet,
  Boxes, Banknote, Palette, ChevronDown, Monitor, KeyRound, LogOut, Globe, Plug, Truck
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


  const getIsActive = (path: string) => {
    const isBasePage = pathname.split('/').filter(Boolean).length === 1;
    if (path.startsWith('?tab=')) {
      const tabName = path.split('=')[1];
      return isBasePage && currentTab === tabName;
    }
    if (path === '') {
      return isBasePage && currentTab === 'overview';
    }
    // Exact segment matching: split both paths and compare
    const pathSegments = path.split('/').filter(Boolean);
    const pathnameSegments = pathname.split('/').filter(Boolean);
    // The admin base segment is 'admin-secure-internal'
    const adminBase = pathnameSegments.findIndex((s) => s === 'admin-secure-internal');
    if (adminBase === -1) return false;
    const relativeSegments = pathnameSegments.slice(adminBase + 1);
    if (pathSegments.length === 0) return relativeSegments.length === 0;
    // Compare segments position by position up to the path length
    if (pathSegments.length > relativeSegments.length) return false;
    return pathSegments.every((seg, i) => relativeSegments[i] === seg) &&
      relativeSegments.length === pathSegments.length;
  };


  const navGroups = [
    {
      id: 'overview',
      title: t('admin.overview'),
      icon: LayoutDashboard,
      items: [
        { label: t('admin.dashboardOverview'), path: '' },
        { label: t('admin.topProducts'), path: '?tab=products' },
      ]
    },
    {
      id: 'orders',
      title: t('admin.ordersControl'),
      icon: ShoppingCart,
      items: [
        { label: t('admin.fulfilledOrders'), path: '?tab=orders' },
        { label: t('admin.orderStatuses'), path: '?tab=order-statuses' },
      ]
    },
    {
      id: 'accounts',
      title: t('admin.accounts'),
      icon: Users,
      items: [
        { label: locale === 'ar' ? 'إدارة المستخدمين' : 'User Management', path: 'users' },
        { label: t('admin.storesSellers'), path: '?tab=stores-sellers' },
        { label: locale === 'ar' ? 'توثيق المتاجر (KYC/KYB)' : 'KYC/KYB Verification', path: 'verifications' },
        { label: locale === 'ar' ? 'سجل التدقيق' : 'Audit Trail', path: 'verifications/audit' },
        { label: locale === 'ar' ? 'طلبات ترقية الأعمال' : 'Business Upgrades', path: 'upgrade-requests' },
        { label: locale === 'ar' ? 'مختبر سحب البيانات (OCR)' : 'OCR Sandbox', path: 'ocr-sandbox' },
      ]
    },
    {
      id: 'finance',
      title: t('admin.financeSubscriptions'),
      icon: Wallet,
      items: [
        { label: t('admin.paymentMethods', 'طرق الدفع'), path: 'payment-methods' },
        { label: locale === 'ar' ? 'محرك بوابات الدفع' : 'Payment Engine', path: 'billing/payment-engine' },
        { label: t('admin.commissionSettings'), path: 'billing/settings' },
        { label: t('admin.subscriptionPackages'), path: 'billing/packages' },
        { label: t('admin.merchantsSubscriptions'), path: 'billing/merchants' },
        { label: t('admin.walletsDebts'), path: 'billing/wallets' },
        { label: t('admin.payoutRequests'), path: 'billing/withdrawals' },
        { label: t('admin.reviewReceipts'), path: 'billing/receipts' },
        { label: t('admin.revenueReports'), path: 'billing/revenue' },
      ]
    },
    {
      id: 'logistics',
      title: locale === 'ar' ? 'اللوجستيات والشحن' : 'Logistics & Shipping',
      icon: Truck,
      items: [
        { label: locale === 'ar' ? 'مركز اللوجستيات والمناطق' : 'Logistics Hub', path: 'logistics' },
        { label: locale === 'ar' ? 'إدارة المناطق والولايات' : 'States & Regions', path: 'shipping' },
      ]
    },
    {
      id: 'extensions',
      title: locale === 'ar' ? 'الإضافات والتطبيقات' : 'Plugins & Extensions',
      icon: Plug,
      items: [
        { label: locale === 'ar' ? 'متجر الإضافات (App Store)' : 'Plugin Manager', path: 'plugins' },
      ]
    },
    {
      id: 'security',
      title: t('security.section_title', 'Security & Access'),
      icon: ShieldAlert,
      items: [
        { label: locale === 'ar' ? 'أمان حسابي' : 'My Account Security', path: 'security/my-account' },
        { label: locale === 'ar' ? 'الإجراءات المعلقة' : 'Pending Actions', path: 'security/pending-actions' },
        { label: locale === 'ar' ? 'الأدوار والصلاحيات' : 'Roles & Permissions', path: 'security/roles' },
        { label: t('security.auth_logs', 'Auth Logs'), path: 'security/auth-logs' },
        { label: t('security.ban_list', 'Ban List'), path: 'security/bans' },
        { label: locale === 'ar' ? 'استئنافات التعليق' : 'Suspension Appeals', path: 'appeals' },
        { label: locale === 'ar' ? 'إعدادات التوثيق والدخول' : 'Auth & OTP', path: 'settings/otp' },
        { label: locale === 'ar' ? 'إعدادات الأمان المتقدمة' : 'Advanced Security', path: 'security/settings' },
      ]
    },
    {
      id: 'platform',
      title: t('admin.platformSettings'),
      icon: Settings,
      items: [
        { label: t('admin.globalCoupons'), path: 'coupons' },
        { label: t('admin.manageCategories'), path: 'categories' },
        { label: locale === 'ar' ? 'مواصفات المنتجات' : 'Product Specs', path: 'products/spec-definitions' },
        { label: locale === 'ar' ? 'إعدادات وخصائص المنتجات' : 'Product Settings', path: 'products/settings' },
        { label: locale === 'ar' ? 'مراجعة وقبول المنتجات' : 'Product Approvals', path: 'products/approvals' },
        { label: t('admin.manageBrands'), path: 'brands' },
        { label: t('admin.storefrontCMS'), path: 'cms' },
        { label: 'SAADA Builder', path: 'cms/saada-builder' },
        { label: t('admin.manageDocs'), path: 'cms/docs' },
        { label: t('admin.homepageSettings'), path: 'settings/homepage' },
        { label: t('admin.manageAdvertisements'), path: 'advertisements' },
        { label: t('admin.featureFlags'), path: 'flags' },
        { label: 'إعدادات الخرائط', path: 'settings/maps' },
        { label: t('admin.manageTranslations'), path: 'settings/translations' },
        { label: t('admin.generalSettings'), path: 'settings' },
        { label: t('admin.themeDesign'), path: 'settings/theme' },
      ]
    }
  ];

  useEffect(() => {
    const activeGroupIndex = navGroups.findIndex(g => g.items.some(i => getIsActive(i.path)));
    const initialCollapsed: Record<string, boolean> = {};
    navGroups.forEach(g => {
      initialCollapsed[g.title] = true;
    });
    if (activeGroupIndex !== -1) {
      const activeGroupTitle = navGroups[activeGroupIndex].title;
      initialCollapsed[activeGroupTitle] = false;
    }
    setCollapsedSections(initialCollapsed);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, currentTab]);

  const toggleSection = (sectionTitle: string) => {
    if (isCollapsed) return;
    setCollapsedSections(prev => {
      const isCurrentlyCollapsed = prev[sectionTitle] ?? true;
      const newCollapsed: Record<string, boolean> = {};
      navGroups.forEach(g => {
        newCollapsed[g.title] = true;
      });
      newCollapsed[sectionTitle] = !isCurrentlyCollapsed;
      return newCollapsed;
    });
  };

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
              {navGroups.map((group, gIdx) => {
                const isSectionCollapsed = collapsedSections[group.title] ?? true;
                const isOpen = !isSectionCollapsed;
                const isGroupActive = group.items.some(item => getIsActive(item.path));
                const Icon = group.icon;

                return (
                  <div key={group.id} className="relative group">
                    <button
                      dir={isRTL ? 'rtl' : 'ltr'}
                      onClick={() => toggleSection(group.title)}
                      className={cn(
                        'w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-[14px] font-medium transition-all duration-200 outline-none relative text-start',
                        isGroupActive
                          ? 'text-white font-semibold' 
                          : isOpen && !isCollapsed
                            ? 'text-white'
                            : 'text-[#94a3b8] hover:bg-white/5 hover:text-white',
                        isCollapsed && 'justify-center px-0'
                      )}
                      title={isCollapsed ? group.title : undefined}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className={cn(
                          "h-[20px] w-[20px] shrink-0 transition-colors",
                          isGroupActive ? "text-[#1ABB9C]" : "group-hover:text-[#1ABB9C]"
                        )} strokeWidth={isGroupActive ? 2.5 : 2} />
                        <span className={cn("text-start transition-opacity truncate", isCollapsed ? "opacity-0 hidden" : "opacity-100")}>
                          {group.title}
                        </span>
                      </div>

                      {!isCollapsed && (
                        <ChevronDown className={cn(
                          "h-4 w-4 transition-transform duration-200 opacity-50",
                          isOpen && (isRTL ? "rotate-90" : "-rotate-90")
                        )} />
                      )}

                      {/* Active indicator line like gentelella v4 */}
                      {isGroupActive && isCollapsed && (
                        <div className={cn(
                          "absolute top-1/2 -translate-y-1/2 w-1.5 h-6 bg-[#1ABB9C] rounded-full",
                          isRTL ? "right-0" : "left-0"
                        )} />
                      )}
                    </button>

                    {/* Nested Children Accordion */}
                    {!isCollapsed && (
                      <div className={cn(
                        "overflow-hidden transition-all duration-300 ease-in-out",
                        isOpen ? "max-h-[1000px] opacity-100 mt-1" : "max-h-0 opacity-0"
                      )}>
                        <ul className={cn(
                          "relative flex flex-col gap-1 py-1",
                          isRTL ? "pr-9" : "pl-9"
                        )}>
                          {/* Vertical line connector */}
                          <div className={cn(
                            "absolute top-0 bottom-0 w-px bg-white/10",
                            isRTL ? "right-5" : "left-5"
                          )} />

                          {group.items.map((item) => {
                            const isActive = getIsActive(item.path);
                            return (
                              <li key={item.path} className="relative">
                                <Link
                                  dir={isRTL ? 'rtl' : 'ltr'}
                                  href={getAdminPath(item.path)}
                                  className={cn(
                                    "w-full flex items-center justify-between py-2 px-3 rounded-lg text-[13px] transition-colors relative text-start",
                                    isActive ? "text-white font-semibold" : "text-[#94a3b8]/70 hover:text-white hover:bg-white/5"
                                  )}
                                >
                                  {/* Horizontal line connector for active item */}
                                  {isActive && (
                                    <div className={cn(
                                      "absolute top-1/2 -translate-y-1/2 w-3 h-px bg-[#1ABB9C]",
                                      isRTL ? "-right-4" : "-left-4"
                                    )} />
                                  )}
                                  <span>{item.label}</span>
                                </Link>
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    )}

                    {/* Hover tooltip for collapsed state */}
                    {isCollapsed && (
                      <div className={cn(
                        "absolute top-1/2 -translate-y-1/2 opacity-0 pointer-events-none group-hover:opacity-100 transition-all z-[100]",
                        isRTL ? "right-[110%] -translate-x-2 group-hover:translate-x-0" : "left-[110%] translate-x-2 group-hover:translate-x-0"
                      )}>
                        <div className="bg-white text-[#1e293b] text-xs font-bold px-3 py-2 rounded-md whitespace-nowrap shadow-xl">
                          {group.title}
                        </div>
                      </div>
                    )}
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
