'use client';

import React, { useEffect, useState } from 'react';
import { useAppStore, useAuthStore } from '@/lib/store';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import type { NavItem, PageType, UserRole } from '@/types';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard, Users, Package, ShoppingCart, BarChart3, Settings,
  Store as StoreIcon, UserCircle, FileText, ShieldCheck, Truck, MapPin, Navigation,
  Wallet, Heart, Star, Bell, ChevronLeft, ChevronRight, LogOut,
  TrendingUp, CreditCard, Boxes, ChevronUp, ChevronDown, ArrowLeftRight, Layers,
  Receipt, Sparkles, MessageSquare
} from 'lucide-react';

import { useTranslation } from '@/lib/i18n/useTranslation';

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  LayoutDashboard, Users, Package, ShoppingCart, BarChart3, Settings,
  Store: StoreIcon, UserCircle, FileText, ShieldCheck, Truck, MapPin, Navigation,
  Wallet, Heart, Star, Bell, LogOut, TrendingUp, CreditCard, Boxes,
  ChevronUp, ArrowLeftRight, Layers, Receipt, Sparkles, MessageSquare,
};


export interface NavGroup {
  id: string;
  labelAr: string;
  labelEn: string;
  icon: string;
  items: NavItem[];
}

const STORE_NAV_GROUPS: NavGroup[] = [
  {
    id: 'store-group',
    labelAr: 'المتجر',
    labelEn: 'Store',
    icon: 'Store',
    items: [
      { id: 'store', labelAr: 'نظرة عامة', labelEn: 'Overview', icon: 'LayoutDashboard', path: '/seller/dashboard' },
      { id: 'store-products', labelAr: 'المنتجات', labelEn: 'Products', icon: 'Boxes', badge: 5, path: '/seller/products' },
      { id: 'store-orders', labelAr: 'الطلبات', labelEn: 'Orders', icon: 'Package', badge: 12, path: '/seller/orders' },
      { id: 'store-coupons', labelAr: 'الكوبونات والخصومات', labelEn: 'Coupons', icon: 'CreditCard', path: '/seller/coupons' },
      { id: 'store-staff', labelAr: 'الفريق', labelEn: 'Team', icon: 'Users', path: '/seller/staff' },
      { id: 'store-analytics', labelAr: 'التحليلات', labelEn: 'Analytics', icon: 'BarChart3', path: '/seller/analytics' },
    ]
  },
  {
    id: 'billing-group',
    labelAr: 'المالية والاشتراكات',
    labelEn: 'Billing & Subscriptions',
    icon: 'Wallet',
    items: [
      { id: 'store-billing', labelAr: 'فاتورتي الحالية', labelEn: 'Current Invoice', icon: 'Receipt', path: '/seller/billing' },
      { id: 'store-billing-plans', labelAr: 'اختر باقة', labelEn: 'Choose Plan', icon: 'Package', path: '/seller/billing/plans' },
      { id: 'store-billing-addons', labelAr: 'الميزات الإضافية', labelEn: 'Add-ons', icon: 'Sparkles', path: '/seller/billing/addons' },
      { id: 'store-billing-pay', labelAr: 'الدفع والتسديد', labelEn: 'Payment', icon: 'CreditCard', path: '/seller/billing/pay' },
      { id: 'store-billing-history', labelAr: 'سجل الفواتير', labelEn: 'Invoice History', icon: 'FileText', path: '/seller/billing/history' },
    ]
  },
  {
    id: 'settings-group',
    labelAr: 'الإعدادات',
    labelEn: 'Settings',
    icon: 'Settings',
    items: [
      { id: 'store-settings', labelAr: 'إعدادات المتجر', labelEn: 'Store Settings', icon: 'Settings', path: '/seller/settings' },
    ]
  }
];

const SELLER_NAV_GROUPS: NavGroup[] = [
  {
    id: 'seller-group',
    labelAr: 'التاجر',
    labelEn: 'Seller',
    icon: 'UserCircle',
    items: [
      { id: 'seller', labelAr: 'نظرة عامة', labelEn: 'Overview', icon: 'LayoutDashboard', path: '/seller/dashboard' },
      { id: 'seller-products', labelAr: 'منتجاتي', labelEn: 'My Products', icon: 'Boxes', path: '/seller/products' },
      { id: 'seller-orders', labelAr: 'الطلبات', labelEn: 'Orders', icon: 'Package', badge: 4, path: '/seller/orders' },
      { id: 'seller-messages', labelAr: 'الرسائل والمحادثات', labelEn: 'Messages', icon: 'MessageSquare', path: '/seller/messages' },
    ]
  },
  {
    id: 'billing-group',
    labelAr: 'المالية والاشتراكات',
    labelEn: 'Billing & Subscriptions',
    icon: 'Wallet',
    items: [
      { id: 'seller-wallet', labelAr: 'محفظتي والأرباح', labelEn: 'Wallet & Payouts', icon: 'Wallet', path: '/seller/wallet' },
      { id: 'seller-debts', labelAr: 'سداد المديونية', labelEn: 'Pay Debts', icon: 'Receipt', path: '/seller/debts' },
      { id: 'seller-billing', labelAr: 'فاتورتي الحالية', labelEn: 'Current Invoice', icon: 'Receipt', path: '/seller/billing' },
      { id: 'seller-billing-plans', labelAr: 'اختر باقة', labelEn: 'Choose Plan', icon: 'Package', path: '/seller/billing/plans' },
      { id: 'seller-billing-addons', labelAr: 'الميزات الإضافية', labelEn: 'Add-ons', icon: 'Sparkles', path: '/seller/billing/addons' },
      { id: 'seller-billing-pay', labelAr: 'الدفع والتسديد', labelEn: 'Payment', icon: 'CreditCard', path: '/seller/billing/pay' },
      { id: 'seller-billing-history', labelAr: 'سجل الفواتير', labelEn: 'Invoice History', icon: 'FileText', path: '/seller/billing/history' },
    ]
  },
  {
    id: 'settings-group',
    labelAr: 'الإعدادات',
    labelEn: 'Settings',
    icon: 'Settings',
    items: [
      { id: 'seller-settings', labelAr: 'الإعدادات', labelEn: 'Settings', icon: 'Settings', path: '/seller/settings' },
      { id: 'seller-upgrade', labelAr: 'ترقية لمتجر', labelEn: 'Upgrade to Store', icon: 'TrendingUp', path: '/seller/upgrade' },
    ]
  }
];

// Items exclusively for business accounts
const BUSINESS_SELLER_ITEMS = [
  { id: 'seller-staff', labelAr: 'الفريق', labelEn: 'Team', icon: 'Users' },
  { id: 'seller-taxes', labelAr: 'التقارير الضريبية (B2B)', labelEn: 'Taxes (B2B)', icon: 'Receipt' },
  { id: 'seller-branches', labelAr: 'إدارة الفروع', labelEn: 'Branches', icon: 'Store' },
];

// Helper to filter nav items based on payment model and merchantType
const getSellerNavGroups = (paymentModel: string, merchantType: string): NavGroup[] => {
  return SELLER_NAV_GROUPS.map(group => {
    let items = [...group.items];
    
    if (group.id === 'seller-group') {
      // Inject business items for 'business' merchantType
      if (merchantType === 'business') {
        items.splice(2, 0, ...BUSINESS_SELLER_ITEMS); // Insert after products
      }
    }
    
    if (group.id === 'settings-group') {
      // Hide 'Upgrade to Store' if they are already 'business'
      if (merchantType === 'business') {
        items = items.filter(item => item.id !== 'seller-upgrade');
      }
    }

    if (group.id === 'billing-group') {
      items = items.filter(item => {
        if (item.id === 'seller-wallet' && paymentModel === 'decentralized') return false; // Hide wallet for decentralized
        if (item.id === 'seller-debts' && paymentModel === 'centralized') return false; // Hide debts for centralized
        return true;
      });
    }

    return { ...group, items };
  });
};

const SUPPLIER_NAV_GROUPS: NavGroup[] = [
  {
    id: 'supplier-group',
    labelAr: 'المورد',
    labelEn: 'Supplier',
    icon: 'Store',
    items: [
      { id: 'supplier', labelAr: 'نظرة عامة', labelEn: 'Overview', icon: 'LayoutDashboard', path: '/supplier' },
      { id: 'supplier-products', labelAr: 'المنتجات', labelEn: 'Products', icon: 'Boxes', path: '/supplier/products' },
      { id: 'supplier-orders', labelAr: 'الطلبات', labelEn: 'Orders', icon: 'Package', badge: 3, path: '/supplier/orders' },
      { id: 'supplier-inventory', labelAr: 'المخزون', labelEn: 'Inventory', icon: 'Layers', path: '/supplier/inventory' },
    ]
  }
];

const LOGISTICS_NAV_GROUPS: NavGroup[] = [
  {
    id: 'logistics-group',
    labelAr: 'مندوب الشحن',
    labelEn: 'Logistics',
    icon: 'Truck',
    items: [
      { id: 'logistics', labelAr: 'نظرة عامة', labelEn: 'Overview', icon: 'LayoutDashboard', path: '/logistics' },
      { id: 'logistics-active', labelAr: 'الشحنات النشطة', labelEn: 'Active Shipments', icon: 'Navigation', badge: 7, path: '/logistics/active' },
      { id: 'logistics-deliveries', labelAr: 'التوصيلات', labelEn: 'Deliveries', icon: 'MapPin', path: '/logistics/deliveries' },
      { id: 'logistics-history', labelAr: 'السجل', labelEn: 'History', icon: 'FileText', path: '/logistics/history' },
      { id: 'logistics-earnings', labelAr: 'الأرباح', labelEn: 'Earnings', icon: 'Wallet', path: '/logistics/earnings' },
    ]
  }
];

const BUYER_NAV_GROUPS: NavGroup[] = [
  {
    id: 'buyer-group',
    labelAr: 'المشتري',
    labelEn: 'Buyer',
    icon: 'UserCircle',
    items: [
      { id: 'buyer', labelAr: 'نظرة عامة', labelEn: 'Overview', icon: 'LayoutDashboard', path: '/buyer' },
      { id: 'buyer-orders', labelAr: 'طلباتي', labelEn: 'My Orders', icon: 'Package', badge: 2, path: '/buyer/orders' },
      { id: 'buyer-wishlist', labelAr: 'المفضلة', labelEn: 'Wishlist', icon: 'Heart', path: '/buyer/wishlist' },
      { id: 'buyer-addresses', labelAr: 'العناوين', labelEn: 'Addresses', icon: 'MapPin', path: '/buyer/addresses' },
      { id: 'buyer-wallet', labelAr: 'المحفظة', labelEn: 'Wallet', icon: 'Wallet', path: '/buyer/wallet' },
      { id: 'buyer-reviews', labelAr: 'التقييمات', labelEn: 'Reviews', icon: 'Star', path: '/buyer/reviews' },
    ]
  }
];

interface SidebarProps {
  className?: string;
}

  export default function Sidebar({ className }: SidebarProps) {
    const { locale, currentPage, setCurrentPage, isSidebarOpen, setSidebarOpen, isDesktopSidebarCollapsed, toggleDesktopSidebar } = useAppStore();
    const { user, logout, isBuyerMode } = useAuthStore();
    const isRTL = locale === 'ar';
    const { t: globalT } = useTranslation();
    const pathname = usePathname();
    const router = useRouter();

    const isBuyerRoute = pathname?.startsWith('/buyer') || false;
    const effectiveBuyerMode = isBuyerMode || isBuyerRoute;

    const getSidebarKey = (id: string, labelAr: string): string => {
      const idMap: Record<string, string> = {
        'store-group': 'sidebar.sectionStore',
        'seller-group': 'sidebar.sectionSeller',
        'supplier-group': 'sidebar.sectionSupplier',
        'logistics-group': 'sidebar.sectionLogistics',
        'buyer-group': 'sidebar.sectionBuyer',
        'billing-group': 'sidebar.sectionBilling',
        'settings-group': 'sidebar.sectionSettings',
        'store': 'sidebar.overview',
        'store-products': 'sidebar.products',
        'store-orders': 'sidebar.orders',
        'store-coupons': 'sidebar.coupons',
        'store-staff': 'sidebar.team',
        'store-analytics': 'sidebar.analytics',
        'store-billing': 'sidebar.currentInvoice',
        'store-billing-plans': 'sidebar.plans',
        'store-billing-addons': 'sidebar.addons',
        'store-billing-pay': 'sidebar.payment',
        'store-billing-history': 'sidebar.history',
        'store-settings': 'sidebar.settings',
        'seller': 'sidebar.overview',
        'seller-products': 'sidebar.myProducts',
        'seller-orders': 'sidebar.orders',
        'seller-messages': 'sidebar.messages',
        'seller-wallet': 'sidebar.wallet',
        'seller-debts': 'sidebar.debts',
        'seller-billing': 'sidebar.currentInvoice',
        'seller-billing-plans': 'sidebar.plans',
        'seller-billing-addons': 'sidebar.addons',
        'seller-billing-pay': 'sidebar.payment',
        'seller-billing-history': 'sidebar.history',
        'seller-settings': 'sidebar.settings',
        'seller-upgrade': 'sidebar.upgrade',
        'supplier': 'sidebar.overview',
        'supplier-products': 'sidebar.products',
        'supplier-orders': 'sidebar.orders',
        'supplier-inventory': 'sidebar.inventory',
        'logistics': 'sidebar.overview',
        'logistics-active': 'sidebar.activeShipments',
        'logistics-deliveries': 'sidebar.deliveries',
        'logistics-history': 'sidebar.history',
        'logistics-earnings': 'sidebar.earnings',
        'buyer': 'sidebar.overview',
        'buyer-orders': 'sidebar.myOrders',
        'buyer-wishlist': 'sidebar.wishlist',
        'buyer-addresses': 'sidebar.addresses',
        'buyer-wallet': 'sidebar.wallet',
        'buyer-reviews': 'sidebar.reviews',
      };
      return idMap[id] || `sidebar.${id}`;
    };

    const t = (loc: string, ar: string, en: string, itemId?: string) => {
      if (itemId) {
        const key = getSidebarKey(itemId, ar);
        return globalT(key);
      }
      if (ar === 'مدير النظام') return globalT('header.roleAdmin');
      if (ar === 'مدير متجر') return globalT('header.roleStoreManager');
      if (ar === 'تاجر مستقل') return globalT('header.roleSeller');
      if (ar === 'مورد') return globalT('header.roleSupplier') || 'مورد';
      if (ar === 'مندوب شحن') return globalT('header.roleLogistics');
      if (ar === 'مشتري') return globalT('header.roleBuyer');
      if (ar === 'تسجيل الخروج') return globalT('common.logout');
      return loc === 'ar' ? ar : en;
    };
  
    // Automatically collapse sidebar when window is resized below 1024px (tablet/mobile)
    useEffect(() => {
      const handleResize = () => {
        if (window.innerWidth < 1024 && isSidebarOpen) {
          setSidebarOpen(false);
        }
      };
      
    // Check immediately on mount
    if (typeof window !== 'undefined' && window.innerWidth < 1024 && isSidebarOpen) {
      setSidebarOpen(false);
    }

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isSidebarOpen, setSidebarOpen]);

  const [paymentModel, setPaymentModel] = useState<string>('mixed');
  const [merchantType, setMerchantType] = useState<string>('individual');
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({});

  const toggleSection = (sectionId: string) => {
    setCollapsedSections(prev => ({ ...prev, [sectionId]: !prev[sectionId] }));
  };

  useEffect(() => {
    if ((user?.role === 'seller' || user?.role === 'store' || user?.role === 'freelancer') && !isBuyerMode) {
      // 1. Fetch Global Settings First
      fetch('/api/settings/public')
        .then(res => res.json())
        .then(pub => {
          let model = 'mixed';
          if (pub.success && pub.settings?.platform_payment_model) {
            model = pub.settings.platform_payment_model;
          }
          
          // 2. Fetch Seller Profile Override
          fetch(`/api/seller/settings?userId=${user.id}`)
            .then(res => res.json())
            .then(data => {
              if (data.success && data.settings) {
                if (data.settings.paymentModel && data.settings.paymentModel !== 'default') {
                  setPaymentModel(data.settings.paymentModel);
                } else {
                  setPaymentModel(model); // fallback to global
                }
                if (data.settings.merchantType) {
                  setMerchantType(data.settings.merchantType);
                }
              } else {
                setPaymentModel(model); // fallback to global
              }
            })
            .catch(() => setPaymentModel(model)); // fallback to global
        })
        .catch(() => {});
    }
  }, [user, isBuyerMode]);

  const isStoreStaff = ['editor', 'support', 'viewer', 'staff'].includes(user?.role || '');

  const getStaffNavGroups = (): NavGroup[] => {
    return STORE_NAV_GROUPS.map(group => {
      // Hide billing and settings for staff
      if (group.id === 'billing-group' || group.id === 'settings-group') return null;

      let items = [...group.items];
      
      if ((user?.role as string) === 'viewer') {
        items = items.filter(i => ['store', 'store-analytics'].includes(i.id));
      } else if ((user?.role as string) === 'support') {
        items = items.filter(i => ['store', 'store-orders', 'seller-messages'].includes(i.id));
      } else if ((user?.role as string) === 'editor') {
        items = items.filter(i => ['store', 'store-products', 'store-coupons'].includes(i.id));
      }

      return { ...group, items };
    }).filter(Boolean) as NavGroup[];
  };

  // store_manager sees store operations but NOT billing/finance (those belong to the owning seller)
  const getStoreManagerNavGroups = (): NavGroup[] => {
    return STORE_NAV_GROUPS.map(group => {
      // Completely hide billing and settings groups from store managers
      if (group.id === 'billing-group') return null;
      if (group.id === 'settings-group') return null;
      return group;
    }).filter(Boolean) as NavGroup[];
  };

  const navGroups = effectiveBuyerMode
    ? BUYER_NAV_GROUPS
    : user?.role === 'store_manager'
    ? getStoreManagerNavGroups()
    : user?.role === 'admin'
    ? STORE_NAV_GROUPS
    : isStoreStaff
    ? getStaffNavGroups()
    : (user?.role === 'seller' || user?.role === 'store' || user?.role === 'freelancer')
    ? getSellerNavGroups(paymentModel, merchantType)
    : user?.role === 'supplier'
    ? SUPPLIER_NAV_GROUPS
    : user?.role === 'logistics'
    ? LOGISTICS_NAV_GROUPS
    : BUYER_NAV_GROUPS;

  // Auto-expand active group on mount or page change
  useEffect(() => {
    const activeGroup = navGroups.find(group => 
      group.items.some(item => (item as any).path ? pathname === (item as any).path || pathname.startsWith((item as any).path + '/') : item.id === currentPage)
    );
    if (activeGroup) {
      setCollapsedSections(prev => ({ ...prev, [activeGroup.id]: false }));
    }
  }, [currentPage, pathname, navGroups]);

  if (!user) return null;

  const CloseIcon = isRTL ? ChevronRight : ChevronLeft;
  
    return (
      <>
        {/* Mobile Overlay */}
        {isSidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-[var(--z-overlay)] lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
  
        <aside
          dir={isRTL ? 'rtl' : 'ltr'}
          className={cn(
          'fixed top-[var(--header-height)] bottom-0 z-[var(--z-overlay)] lg:z-auto',
            'bg-sidebar text-sidebar-foreground flex flex-col',
            'transition-all duration-300 ease-in-out',
            'lg:sticky lg:top-[var(--header-height)] lg:h-[calc(100dvh-var(--header-height))]',
            // On mobile: fixed width, slide in/out
            isSidebarOpen ? 'start-0 w-[var(--sidebar-width)]' : '-start-[280px] w-[var(--sidebar-width)]',
            // On desktop: width depends on collapse state
            'lg:start-0',
            isDesktopSidebarCollapsed ? 'lg:w-[80px]' : 'lg:w-[var(--sidebar-width)]',
            className
          )}
        >
          {/* Collapse Toggle (Desktop Only) */}
          <button
            onClick={toggleDesktopSidebar}
            className="hidden lg:flex absolute top-4 -end-3 bg-brand text-navy rounded-full p-1 shadow-md hover:scale-110 transition-transform z-10 border border-border"
          >
            {isDesktopSidebarCollapsed ? (
              isRTL ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />
            ) : (
              isRTL ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />
            )}
          </button>

          {/* User Info */}
          <div className="p-4 border-b border-sidebar-border relative">
            <div className={cn("flex items-center gap-3 transition-all duration-300", isDesktopSidebarCollapsed ? "justify-center" : "justify-start")}>
              <Avatar className="h-10 w-10 border-2 border-brand shrink-0">
                <AvatarFallback className="bg-brand text-navy font-bold">
                  {user.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className={cn("flex-1 min-w-0 transition-opacity duration-300", isDesktopSidebarCollapsed ? "opacity-0 hidden" : "opacity-100")}>
                <p className="text-sm font-semibold truncate">{user.name}</p>
                <Badge variant="secondary" className="text-[10px] mt-0.5 bg-sidebar-accent text-sidebar-accent-foreground border-sidebar-border">
                  {t(locale,
                    effectiveBuyerMode ? 'مشتري' : { admin: 'مدير النظام', store_manager: 'مدير متجر', seller: 'تاجر مستقل', store: 'تاجر مستقل', freelancer: 'تاجر مستقل', supplier: 'مورد', logistics: 'مندوب شحن', buyer: 'مشتري' }[user?.role || 'buyer'] || 'مشتري',
                    effectiveBuyerMode ? 'Buyer' : { admin: 'Admin', store_manager: 'Store Manager', seller: 'Seller', store: 'Seller', freelancer: 'Seller', supplier: 'Supplier', logistics: 'Courier', buyer: 'Buyer' }[user?.role || 'buyer'] || 'Buyer'
                  )}
                </Badge>
              </div>
              <button
                onClick={() => setSidebarOpen(false)}
                className="lg:hidden p-1 rounded hover:bg-sidebar-accent/20 shrink-0"
                aria-label={isRTL ? 'إغلاق' : 'Close'}
              >
                <CloseIcon className="h-4 w-4" />
              </button>
            </div>
          </div>
  
          {/* Navigation */}
          <div className="flex-1 py-4 overflow-y-auto overflow-x-hidden">
            <div className={cn("space-y-1.5", isDesktopSidebarCollapsed ? "px-2" : "px-3")}>
              {navGroups.map((group) => {
                const isSectionCollapsed = collapsedSections[group.id] ?? true;
                const isOpen = !isSectionCollapsed;
                const isGroupActive = group.items.some(item => (item as any).path ? pathname === (item as any).path || pathname.startsWith((item as any).path + '/') : currentPage === item.id);
                const GroupIcon = iconMap[group.icon] || StoreIcon;

                return (
                  <div key={group.id} className="relative group">
                    <button
                      dir={isRTL ? 'rtl' : 'ltr'}
                      onClick={() => toggleSection(group.id)}
                      className={cn(
                        'w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 outline-none relative text-start',
                        isGroupActive
                          ? 'text-brand font-bold bg-sidebar-accent/10' 
                          : isOpen && !isDesktopSidebarCollapsed
                            ? 'text-white'
                            : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/10 hover:text-white',
                        isDesktopSidebarCollapsed && 'justify-center px-0'
                      )}
                      title={isDesktopSidebarCollapsed ? t(locale, group.labelAr, group.labelEn, group.id) : undefined}
                    >
                      <div className="flex items-center gap-3">
                        <GroupIcon className={cn(
                          "h-5 w-5 shrink-0 transition-colors",
                          isGroupActive ? "text-brand" : "group-hover:text-brand"
                        )} />
                        <span className={cn("text-start transition-opacity truncate", isDesktopSidebarCollapsed ? "opacity-0 hidden" : "opacity-100")}>
                          {t(locale, group.labelAr, group.labelEn, group.id)}
                        </span>
                      </div>

                      {!isDesktopSidebarCollapsed && (
                        <ChevronDown className={cn(
                          "h-4 w-4 transition-transform duration-200 opacity-50",
                          isOpen && (isRTL ? "rotate-90" : "-rotate-90")
                        )} />
                      )}

                      {/* Active indicator line when collapsed */}
                      {isGroupActive && isDesktopSidebarCollapsed && (
                        <div className={cn(
                          "absolute top-1/2 -translate-y-1/2 w-1.5 h-6 bg-brand rounded-full",
                          isRTL ? "right-0" : "left-0"
                        )} />
                      )}
                    </button>

                    {/* Nested Children Accordion */}
                    {!isDesktopSidebarCollapsed && (
                      <div className={cn(
                        "overflow-hidden transition-all duration-300 ease-in-out",
                        isOpen ? "max-h-[500px] opacity-100 mt-1" : "max-h-0 opacity-0"
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

                          {group.items.map((item: any) => {
                            const isActive = item.path ? pathname === item.path || pathname.startsWith(item.path + '/') : currentPage === item.id;
                            const SubIcon = iconMap[item.icon || 'LayoutDashboard'] || LayoutDashboard;
                            
                            return (
                              <li key={item.id} className="relative">
                                <button
                                  dir={isRTL ? 'rtl' : 'ltr'}
                                  onClick={() => {
                                    if (item.path) {
                                      router.push(item.path);
                                    } else {
                                      setCurrentPage(item.id as PageType);
                                    }
                                    if (window.innerWidth < 1024) setSidebarOpen(false);
                                  }}
                                  className={cn(
                                    "w-full flex items-center gap-3 py-2 px-3 rounded-lg text-[13px] transition-colors relative text-start",
                                    isActive 
                                      ? "text-brand font-semibold bg-sidebar-accent/5" 
                                      : "text-sidebar-foreground/70 hover:text-white hover:bg-sidebar-accent/5"
                                  )}
                                >
                                  {/* Horizontal line connector for active item */}
                                  {isActive && (
                                    <div className={cn(
                                      "absolute top-1/2 -translate-y-1/2 w-3 h-px bg-brand",
                                      isRTL ? "-right-4" : "-left-4"
                                    )} />
                                  )}
                                  <SubIcon className="h-4 w-4 shrink-0 opacity-70" />
                                  <span>{t(locale, item.labelAr, item.labelEn, item.id)}</span>

                                  {item.badge && item.badge > 0 && (
                                    <Badge className="h-4 min-w-[16px] flex items-center justify-center px-1 text-[9px] bg-brand text-navy border-0 shrink-0 ms-auto">
                                      {item.badge}
                                    </Badge>
                                  )}
                                </button>
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    )}

                    {/* Hover tooltip for collapsed state */}
                    {isDesktopSidebarCollapsed && (
                      <div className={cn(
                        "absolute top-1/2 -translate-y-1/2 opacity-0 pointer-events-none group-hover:opacity-100 transition-all z-[100]",
                        isRTL ? "right-[110%] -translate-x-2 group-hover:translate-x-0" : "left-[110%] translate-x-2 group-hover:translate-x-0"
                      )}>
                        <div className="bg-slate-800 text-white text-xs font-bold px-3 py-2 rounded-md whitespace-nowrap shadow-xl">
                          {t(locale, group.labelAr, group.labelEn, group.id)}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Logout */}
        <div className="p-3 border-t border-sidebar-border">
          <button
            onClick={logout}
            dir={isRTL ? 'rtl' : 'ltr'}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-sidebar-foreground/70 hover:bg-destructive/10 hover:text-destructive transition-colors"
          >
            <LogOut className="h-5 w-5 shrink-0" />
            <span className="flex-1 truncate text-start">{t(locale, 'تسجيل الخروج', 'Logout')}</span>
          </button>
        </div>
      </aside>
    </>
  );
}
