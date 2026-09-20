'use client';

import { useEffect, useState } from 'react';
import { useAppStore, useAuthStore } from '@/lib/store';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import type { PageType, UserRole } from '@/types';
import { useGentelellaTheme } from './theme';
import {
  LayoutDashboard, Users, Package, ShoppingCart, BarChart3, Settings,
  Store as StoreIcon, UserCircle, FileText, ShieldCheck, Truck, MapPin, Navigation,
  Wallet, Heart, Star, Bell, ChevronLeft, ChevronRight, LogOut,
  TrendingUp, CreditCard, Boxes, ChevronUp, ChevronDown, ArrowLeftRight, Layers,
  Receipt, Sparkles, Monitor, KeyRound, MoreHorizontal, MessageSquare,
  RotateCcw, HelpCircle
} from 'lucide-react';

import { usePathname, useRouter } from 'next/navigation';
import { useTranslation } from '@/lib/i18n/useTranslation';
import { localeDirections } from '@/lib/i18n/config';

// Type for the nested sidebar structure
type GentelellaNavSubItem = {
  id: PageType;
  labelKey: string;
  badge?: number;
  path?: string;
};

type GentelellaNavTree = {
  id: string;
  labelKey: string;
  icon: any;
  badge?: number | string;
  badgeKey?: string;
  badgeColor?: string;
  children?: GentelellaNavSubItem[];
  directPageId?: PageType; // If it has no children, it links directly
  path?: string;
};

type GentelellaNavGroup = {
  id: string;
  labelKey: string;
  trees: GentelellaNavTree[];
};

// 8 Core Modules Architecture - STORE MANAGER
const STORE_GROUPS: GentelellaNavGroup[] = [
  // 1. Overview & Analytics
  {
    id: 'overview',
    labelKey: 'sidebar.modOverview',
    trees: [
      {
        id: 'overview-tree',
        labelKey: 'sidebar.dashboard',
        icon: LayoutDashboard,
        directPageId: 'store',
        path: '/seller/dashboard'
      },
      {
        id: 'analytics-tree',
        labelKey: 'sidebar.analytics',
        icon: BarChart3,
        directPageId: 'store-analytics',
        path: '/seller/analytics'
      }
    ]
  },
  // 2. Catalog & Inventory
  {
    id: 'catalog',
    labelKey: 'sidebar.modCatalog',
    trees: [
      {
        id: 'products-tree',
        labelKey: 'sidebar.products',
        icon: Boxes,
        directPageId: 'store-products',
        path: '/seller/products'
      },
      {
        id: 'stock-tree',
        labelKey: 'sidebar.stock',
        icon: Package,
        badgeKey: 'sidebar.soon',
        badgeColor: 'bg-amber-500/80',
        directPageId: 'seller-inventory',
        path: '/seller/products?tab=inventory'
      },
      {
        id: 'categories-tree',
        labelKey: 'sidebar.categories',
        icon: Layers,
        badgeKey: 'sidebar.soon',
        badgeColor: 'bg-amber-500/80',
        directPageId: 'seller-categories',
        path: '/seller/products?tab=categories'
      }
    ]
  },
  // 3. Sales & Orders
  {
    id: 'sales',
    labelKey: 'sidebar.modSales',
    trees: [
      {
        id: 'orders-tree',
        labelKey: 'sidebar.orders',
        icon: ShoppingCart,
        directPageId: 'store-orders',
        path: '/seller/orders'
      },
      {
        id: 'returns-tree',
        labelKey: 'sidebar.returns',
        icon: RotateCcw,
        badgeKey: 'sidebar.soon',
        badgeColor: 'bg-amber-500/80',
        directPageId: 'seller-returns',
        path: '/seller/returns'
      }
    ]
  },
  // 4. Shipping & Logistics
  {
    id: 'shipping',
    labelKey: 'sidebar.modShipping',
    trees: [
      {
        id: 'shipping-tree',
        labelKey: 'sidebar.shipments',
        icon: Truck,
        directPageId: 'store-shipping',
        path: '/seller/shipping'
      },
      {
        id: 'carriers-tree',
        labelKey: 'sidebar.carriers',
        icon: Navigation,
        badgeKey: 'sidebar.soon',
        badgeColor: 'bg-amber-500/80',
        directPageId: 'seller-carriers',
        path: '/seller/shipping'
      }
    ]
  },
  // 5. Marketing & CRM
  {
    id: 'marketing',
    labelKey: 'sidebar.modMarketing',
    trees: [
      {
        id: 'messages-tree',
        labelKey: 'sidebar.messages',
        icon: MessageSquare,
        directPageId: 'seller-messages',
        path: '/seller/messages'
      },
      {
        id: 'coupons-tree',
        labelKey: 'sidebar.coupons',
        icon: Sparkles,
        directPageId: 'store-coupons',
        path: '/seller/coupons'
      },
      {
        id: 'customers-tree',
        labelKey: 'sidebar.customers',
        icon: UserCircle,
        badgeKey: 'sidebar.soon',
        badgeColor: 'bg-amber-500/80',
        directPageId: 'seller-customers',
        path: '/seller/customers'
      }
    ]
  },
  // 6. Branches & Staff
  {
    id: 'business',
    labelKey: 'sidebar.modBusiness',
    trees: [
      {
        id: 'branches-tree',
        labelKey: 'sidebar.branches',
        icon: StoreIcon,
        directPageId: 'seller-branches',
        path: '/seller/branches'
      },
      {
        id: 'staff-tree',
        labelKey: 'sidebar.team',
        icon: Users,
        directPageId: 'store-staff',
        path: '/seller/staff'
      }
    ]
  },
  // 7. Finance & Subscriptions
  {
    id: 'finance',
    labelKey: 'sidebar.modFinance',
    trees: [
      {
        id: 'wallet-tree',
        labelKey: 'sidebar.wallet',
        icon: Wallet,
        directPageId: 'seller-wallet',
        path: '/seller/wallet'
      },
      {
        id: 'billing-tree',
        labelKey: 'sidebar.billing',
        icon: Receipt,
        children: [
          { id: 'store-billing', labelKey: 'sidebar.currentInvoice', path: '/seller/billing' },
          { id: 'store-billing-plans', labelKey: 'sidebar.plans', path: '/seller/billing/plans' },
          { id: 'store-billing-addons', labelKey: 'sidebar.addons', path: '/seller/billing/addons' },
          { id: 'store-billing-pay', labelKey: 'sidebar.payment', path: '/seller/billing/pay' },
          { id: 'store-billing-history', labelKey: 'sidebar.history', path: '/seller/billing/history' }
        ]
      },
      {
        id: 'taxes-tree',
        labelKey: 'sidebar.taxes',
        icon: FileText,
        badgeKey: 'sidebar.soon',
        badgeColor: 'bg-amber-500/80',
        directPageId: 'seller-taxes',
        path: '#'
      }
    ]
  },
  // 8. Settings & Documentation
  {
    id: 'settings',
    labelKey: 'sidebar.modSettings',
    trees: [
      {
        id: 'settings-tree',
        labelKey: 'sidebar.settings',
        icon: Settings,
        directPageId: 'store-settings',
        path: '/seller/settings'
      },
      {
        id: 'verification-tree',
        labelKey: 'sidebar.verification',
        icon: ShieldCheck,
        directPageId: 'verification',
        path: '/seller/verification'
      },
      {
        id: 'help-tree',
        labelKey: 'sidebar.help',
        icon: HelpCircle,
        badgeKey: 'sidebar.soon',
        badgeColor: 'bg-amber-500/80',
        directPageId: 'seller-help',
        path: '/docs'
      }
    ]
  }
];

// 8 Core Modules Architecture - SELLER
const SELLER_GROUPS: GentelellaNavGroup[] = [
  // 1. Overview & Analytics
  {
    id: 'overview',
    labelKey: 'sidebar.modOverview',
    trees: [
      {
        id: 'overview-tree',
        labelKey: 'sidebar.dashboard',
        icon: LayoutDashboard,
        directPageId: 'seller',
        path: '/seller/dashboard'
      },
      {
        id: 'analytics-tree',
        labelKey: 'sidebar.analytics',
        icon: BarChart3,
        directPageId: 'store-analytics',
        path: '/seller/analytics'
      }
    ]
  },
  // 2. Catalog & Inventory
  {
    id: 'catalog',
    labelKey: 'sidebar.modCatalog',
    trees: [
      {
        id: 'products-tree',
        labelKey: 'sidebar.products',
        icon: Boxes,
        directPageId: 'seller-products',
        path: '/seller/products'
      },
      {
        id: 'stock-tree',
        labelKey: 'sidebar.stock',
        icon: Package,
        badgeKey: 'sidebar.soon',
        badgeColor: 'bg-amber-500/80',
        directPageId: 'seller-inventory',
        path: '/seller/products?tab=inventory'
      },
      {
        id: 'categories-tree',
        labelKey: 'sidebar.categories',
        icon: Layers,
        badgeKey: 'sidebar.soon',
        badgeColor: 'bg-amber-500/80',
        directPageId: 'seller-categories',
        path: '/seller/products?tab=categories'
      }
    ]
  },
  // 3. Sales & Orders
  {
    id: 'sales',
    labelKey: 'sidebar.modSales',
    trees: [
      {
        id: 'orders-tree',
        labelKey: 'sidebar.orders',
        icon: ShoppingCart,
        directPageId: 'seller-orders',
        path: '/seller/orders'
      },
      {
        id: 'returns-tree',
        labelKey: 'sidebar.returns',
        icon: RotateCcw,
        badgeKey: 'sidebar.soon',
        badgeColor: 'bg-amber-500/80',
        directPageId: 'seller-returns',
        path: '/seller/returns'
      }
    ]
  },
  // 4. Shipping & Logistics
  {
    id: 'shipping',
    labelKey: 'sidebar.modShipping',
    trees: [
      {
        id: 'shipping-tree',
        labelKey: 'sidebar.shipments',
        icon: Truck,
        directPageId: 'seller-shipping',
        path: '/seller/shipping'
      },
      {
        id: 'carriers-tree',
        labelKey: 'sidebar.carriers',
        icon: Navigation,
        badgeKey: 'sidebar.soon',
        badgeColor: 'bg-amber-500/80',
        directPageId: 'seller-carriers',
        path: '/seller/shipping'
      }
    ]
  },
  // 5. Marketing & CRM
  {
    id: 'marketing',
    labelKey: 'sidebar.modMarketing',
    trees: [
      {
        id: 'messages-tree',
        labelKey: 'sidebar.messages',
        icon: MessageSquare,
        directPageId: 'seller-messages',
        path: '/seller/messages'
      },
      {
        id: 'coupons-tree',
        labelKey: 'sidebar.coupons',
        icon: Sparkles,
        directPageId: 'seller-coupons',
        path: '/seller/coupons'
      },
      {
        id: 'customers-tree',
        labelKey: 'sidebar.customers',
        icon: UserCircle,
        badgeKey: 'sidebar.soon',
        badgeColor: 'bg-amber-500/80',
        directPageId: 'seller-customers',
        path: '/seller/customers'
      }
    ]
  },
  // 6. Branches & Staff
  {
    id: 'business',
    labelKey: 'sidebar.modBusiness',
    trees: [
      {
        id: 'branches-tree',
        labelKey: 'sidebar.branches',
        icon: StoreIcon,
        directPageId: 'seller-branches',
        path: '/seller/branches'
      },
      {
        id: 'staff-tree',
        labelKey: 'sidebar.team',
        icon: Users,
        directPageId: 'seller-staff',
        path: '/seller/staff'
      }
    ]
  },
  // 7. Finance & Subscriptions
  {
    id: 'finance',
    labelKey: 'sidebar.modFinance',
    trees: [
      {
        id: 'wallet-tree',
        labelKey: 'sidebar.wallet',
        icon: Wallet,
        directPageId: 'seller-wallet',
        path: '/seller/wallet'
      },
      {
        id: 'billing-tree',
        labelKey: 'sidebar.billing',
        icon: Receipt,
        children: [
          { id: 'seller-billing', labelKey: 'sidebar.currentInvoice', path: '/seller/billing' },
          { id: 'seller-billing-plans', labelKey: 'sidebar.plans', path: '/seller/billing/plans' },
          { id: 'seller-billing-addons', labelKey: 'sidebar.addons', path: '/seller/billing/addons' },
          { id: 'seller-billing-pay', labelKey: 'sidebar.payment', path: '/seller/billing/pay' },
          { id: 'seller-billing-history', labelKey: 'sidebar.history', path: '/seller/billing/history' }
        ]
      },
      {
        id: 'taxes-tree',
        labelKey: 'sidebar.taxes',
        icon: FileText,
        badgeKey: 'sidebar.soon',
        badgeColor: 'bg-amber-500/80',
        directPageId: 'seller-taxes',
        path: '#'
      }
    ]
  },
  // 8. Settings & Documentation
  {
    id: 'settings',
    labelKey: 'sidebar.modSettings',
    trees: [
      {
        id: 'settings-tree',
        labelKey: 'sidebar.settings',
        icon: Settings,
        directPageId: 'seller-settings',
        path: '/seller/settings'
      },
      {
        id: 'verification-tree',
        labelKey: 'sidebar.verification',
        icon: ShieldCheck,
        directPageId: 'verification',
        path: '/seller/verification'
      },
      {
        id: 'help-tree',
        labelKey: 'sidebar.help',
        icon: HelpCircle,
        badgeKey: 'sidebar.soon',
        badgeColor: 'bg-amber-500/80',
        directPageId: 'seller-help',
        path: '/docs'
      }
    ]
  }
];

const LOGISTICS_GROUPS: GentelellaNavGroup[] = [
  {
    id: 'logistics-main',
    labelKey: 'sidebar.logistics',
    trees: [
      {
        id: 'logistics-overview',
        labelKey: 'sidebar.overview',
        icon: LayoutDashboard,
        directPageId: 'logistics' as PageType,
        path: '/logistics'
      },
      {
        id: 'logistics-active-tree',
        labelKey: 'sidebar.activeShipments',
        icon: Navigation,
        directPageId: 'logistics-active' as PageType,
        badge: 4,
        badgeColor: 'bg-emerald-500',
        path: '/logistics/active'
      },
      {
        id: 'logistics-manifests-tree',
        labelKey: 'sidebar.manifests',
        icon: FileText,
        directPageId: 'logistics-manifests' as PageType,
        path: '/logistics/manifests'
      },
      {
        id: 'logistics-history-tree',
        labelKey: 'sidebar.history',
        icon: Receipt,
        directPageId: 'logistics-history' as PageType,
        path: '/logistics/history'
      },
      {
        id: 'logistics-documents-tree',
        labelKey: 'sidebar.verification',
        icon: ShieldCheck,
        directPageId: 'verification' as PageType,
        path: '/verification'
      },
      {
        id: 'logistics-earnings-tree',
        labelKey: 'sidebar.wallet',
        icon: Wallet,
        directPageId: 'logistics-earnings' as PageType,
        path: '/logistics/earnings'
      }
    ]
  }
];

export default function GentelellaSidebar({ className }: { className?: string }) {
  const { locale, currentPage, setCurrentPage, isSidebarOpen, setSidebarOpen, isDesktopSidebarCollapsed } = useAppStore();
  const { user, isBuyerMode, logout } = useAuthStore();
  const { isDark } = useGentelellaTheme();
  const { t } = useTranslation();
  const isRTL = localeDirections[locale] === 'rtl';
  const pathname = usePathname();
  const router = useRouter();
  
  // Track open accordion trees
  const [openTrees, setOpenTrees] = useState<Record<string, boolean>>(() => {
    if (typeof window !== 'undefined') {
      const path = window.location.pathname;
      const initialOpen: Record<string, boolean> = {};
      const allGroups = [...STORE_GROUPS, ...SELLER_GROUPS, ...LOGISTICS_GROUPS];
      allGroups.forEach((group) => {
        group.trees.forEach((tree) => {
          const hasActiveChild = tree.children?.some(
            (c) => c.path && (path === c.path || path.startsWith(c.path + '/'))
          );
          const hasActiveDirect = tree.path && (path === tree.path || path.startsWith(tree.path + '/'));
          if (hasActiveChild || hasActiveDirect) {
            initialOpen[tree.id] = true;
          }
        });
      });
      return initialOpen;
    }
    return {};
  });

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024 && isSidebarOpen) {
        setSidebarOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isSidebarOpen, setSidebarOpen]);

  const [paymentModel, setPaymentModel] = useState<string>('mixed');
  const [merchantType, setMerchantType] = useState<string>('individual');
  const [isOwner, setIsOwner] = useState(false);

  useEffect(() => {
    if ((user?.role === 'seller' || user?.role === 'store' || user?.role === 'freelancer' || user?.role === 'store_manager') && !isBuyerMode) {
      fetch('/api/settings/public')
        .then(res => res.json())
        .then(pub => {
          let model = 'mixed';
          if (pub.success && pub.settings?.platform_payment_model) {
            model = pub.settings.platform_payment_model;
          }
          fetch(`/api/seller/settings?userId=${user.id}`)
            .then(res => res.json())
            .then(data => {
              if (data.success && data.settings) {
                setIsOwner(!!data.isOwner);
                if (data.settings.paymentModel && data.settings.paymentModel !== 'default') {
                  setPaymentModel(data.settings.paymentModel);
                } else {
                  setPaymentModel(model);
                }
                if (data.settings.merchantType) {
                  setMerchantType(data.settings.merchantType);
                }
                if (data.isOwner && ['store_manager', 'store'].includes(user?.role || '')) {
                  setMerchantType('business');
                }
              } else {
                setPaymentModel(model);
                setIsOwner(false);
              }
            })
            .catch(() => {
              setPaymentModel(model);
              setIsOwner(false);
            });
        })
        .catch(() => {});
    }
  }, [user, isBuyerMode]);

  // Open the tree that contains the current page automatically on load
  useEffect(() => {
    const groups = user?.role === 'store_manager' ? STORE_GROUPS : (user?.role === 'logistics' || user?.role === 'driver' || user?.role === 'carrier') ? LOGISTICS_GROUPS : (user?.role === 'seller' || user?.role === 'store' || user?.role === 'freelancer') ? SELLER_GROUPS : [];
    const newOpenTrees = { ...openTrees };
    let changed = false;
    
    groups.forEach(group => {
      group.trees.forEach(tree => {
        if (tree.children?.some(child => child.path ? pathname === child.path || pathname.startsWith(child.path + '/') : child.id === currentPage) || (tree.path ? pathname === tree.path || pathname.startsWith(tree.path + '/') : tree.directPageId === currentPage)) {
          if (!newOpenTrees[tree.id]) {
            newOpenTrees[tree.id] = true;
            changed = true;
          }
        }
      });
    });
    
    if (changed) setOpenTrees(newOpenTrees);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, pathname, user?.role]);

  if (!user) return null;

  // Filter wallet/debts based on payment model
  let activeGroups = user.role === 'store_manager' ? STORE_GROUPS : (user.role === 'logistics' || user.role === 'driver' || user.role === 'carrier') ? LOGISTICS_GROUPS : (user.role === 'seller' || user.role === 'store' || user.role === 'freelancer') ? SELLER_GROUPS : [];

  const isBusiness = merchantType === 'business' || ['store_manager', 'store'].includes(user.role) || (user.role === 'store_manager' && isOwner);

  if (user.role === 'seller' || user.role === 'store' || user.role === 'freelancer' || user.role === 'store_manager') {
    activeGroups = activeGroups.map(group => {
      if (group.id !== 'finance') return group;
      return {
        ...group,
        trees: group.trees.map(tree => {
          if (tree.id !== 'wallet-tree') return tree;
          if (!tree.children) return tree;
          return {
            ...tree,
            children: tree.children?.filter(child => {
              if ((child.id as string) === 'seller-wallet' && paymentModel === 'decentralized') return false;
              if ((child.id as string) === 'seller-debts' && paymentModel === 'centralized') return false;

              return true;
            })
          };
        }).filter(tree => !tree.children || tree.children.length > 0)
      };
    }).filter(Boolean) as GentelellaNavGroup[];
  }

  const initials = user.name
    .split(' ')
    .map((n: string) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const themeBg = '#1a2332'; // Gentelella v4 signature sidebar color
  const ChevronIcon = isRTL ? ChevronLeft : ChevronRight;
  
  const toggleTree = (treeId: string) => {
    if (isDesktopSidebarCollapsed) return; // Don't toggle in collapsed mode
    setOpenTrees(prev => {
      // Accordion behavior: close all others
      if (prev[treeId]) return {};
      return { [treeId]: true };
    });
  };

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
          isDesktopSidebarCollapsed ? 'lg:w-[76px]' : 'lg:w-[260px]',
          className
        )}
        style={{ backgroundColor: themeBg }}
      >
        {/* Fixed Logo Section */}
        <div className="flex items-center gap-3 px-6 h-[72px] shrink-0 border-b border-white/5 cursor-pointer" onClick={() => useAppStore.getState().toggleDesktopSidebar()}>
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#1ABB9C] text-white font-bold text-lg shrink-0 shadow-[0_0_15px_rgba(26,187,156,0.3)]">
            C
          </div>
          <div className={cn("flex flex-col transition-opacity duration-300", isDesktopSidebarCollapsed ? "opacity-0 hidden" : "opacity-100")}>
            <span className="text-white text-lg font-bold tracking-wide">
              ChariDay <span className="text-[11px] text-[#1ABB9C] align-top ml-1">v4</span>
            </span>
          </div>
        </div>

        <div className="flex-1 flex flex-col overflow-y-auto overflow-x-hidden no-scrollbar">

          {/* User Profile Info (Top of sidebar like v4) */}
          <div className={cn("flex items-center gap-3 p-4", isDesktopSidebarCollapsed ? "justify-center" : "")}>
            <div className="relative shrink-0">
              <div className={cn("rounded-full flex items-center justify-center text-white font-bold border-2 border-white/20", isDesktopSidebarCollapsed ? "h-10 w-10" : "h-14 w-14", "bg-[#1ABB9C]")}>
                {initials}
              </div>
            </div>
            <div className={cn("flex flex-col flex-1 min-w-0 transition-opacity", isDesktopSidebarCollapsed ? "hidden opacity-0" : "opacity-100")}>
              <span className="text-[13px] text-[#BAB8B8]">{t('common.welcome')}</span>
              <span className="text-[15px] font-semibold text-[#E7E7E7] truncate">{user.name}</span>
            </div>
          </div>
          <div className="w-full h-px bg-white/5 mb-2" />

          {/* Sidebar Menu */}
          <div className="flex-1 py-2">
            <nav className="flex flex-col w-full">
              {activeGroups.map((group, gIdx) => (
                <div key={group.id} className={cn("mb-2", gIdx > 0 && "pt-2 mt-1 border-t border-white/10")}>
                  <div className={cn("px-4 mb-1 transition-opacity", isDesktopSidebarCollapsed ? "opacity-0 hidden" : "opacity-100")}>
                    <span className="text-[11px] font-bold text-[#94a3b8]/75 tracking-wider">
                      {t(group.labelKey)}
                    </span>
                  </div>
                  
                  <ul className="flex flex-col px-2.5 gap-0.5">
                    {group.trees.map(tree => {
                      const hasChildren = tree.children && tree.children.length > 0;
                      const isOpen = openTrees[tree.id] || false;
                      const isTreeActive = hasChildren 
                        ? tree.children!.some(c => c.path ? pathname === c.path || pathname.startsWith(c.path + '/') : c.id === currentPage)
                        : (tree.path ? pathname === tree.path || pathname.startsWith(tree.path + '/') : tree.directPageId === currentPage);
                      
                      const Icon = tree.icon;

                      return (
                        <li key={tree.id} className="relative group">
                          <button
                            id={tree.id === 'products-tree' ? 'tour-products-menu' : tree.id === 'settings-tree' ? 'tour-settings-menu' : undefined}
                            dir={isRTL ? 'rtl' : 'ltr'}
                            onClick={() => {
                              if (hasChildren) {
                                toggleTree(tree.id);
                              } else if (tree.path) {
                                router.push(tree.path);
                                if (window.innerWidth < 1024) setSidebarOpen(false);
                              } else if (tree.directPageId) {
                                setCurrentPage(tree.directPageId);
                                if (window.innerWidth < 1024) setSidebarOpen(false);
                              }
                            }}
                            className={cn(
                              'w-full flex items-center justify-between px-3 py-2 rounded-lg text-[13.5px] font-medium transition-all duration-200 outline-none',
                              isTreeActive && !hasChildren
                                ? 'bg-white/10 text-white font-semibold' 
                                : isOpen 
                                  ? 'text-white font-semibold'
                                  : 'text-[#e2e8f0] hover:bg-white/10 hover:text-white',
                              isDesktopSidebarCollapsed && 'justify-center px-0'
                            )}
                            title={isDesktopSidebarCollapsed ? t(tree.labelKey) : undefined}
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <Icon className={cn(
                                "h-[18px] w-[18px] shrink-0 transition-colors", 
                                isTreeActive ? "text-[#1ABB9C]" : "group-hover:text-[#1ABB9C]"
                              )} strokeWidth={isTreeActive ? 2.5 : 2} />
                              <span className={cn("text-start truncate transition-opacity", isDesktopSidebarCollapsed ? "opacity-0 hidden" : "opacity-100")}>
                                {t(tree.labelKey)}
                              </span>
                            </div>
                            
                            {!isDesktopSidebarCollapsed && (
                              <div className="flex items-center gap-1.5 shrink-0">
                                {(tree.badge || tree.badgeKey) && (
                                  <Badge className={cn("h-[18px] px-1.5 text-[10px] font-semibold text-white border-0 shrink-0", tree.badgeColor || 'bg-blue-500')}>
                                    {tree.badgeKey ? t(tree.badgeKey) : tree.badge}
                                  </Badge>
                                )}
                                {hasChildren && (
                                  <ChevronDown className={cn(
                                    "h-3.5 w-3.5 transition-transform duration-200 opacity-60",
                                    isOpen && (isRTL ? "rotate-90" : "-rotate-90") // Depending on RTL, point up/down
                                  )} />
                                )}
                              </div>
                            )}
                          </button>
                          
                          {/* Nested Children Accordion */}
                          {hasChildren && !isDesktopSidebarCollapsed && (
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
                                
                                {tree.children!.map(child => {
                                  const isChildActive = child.path ? pathname === child.path || pathname.startsWith(child.path + '/') : currentPage === child.id;
                                  return (
                                    <li key={child.id} className="relative">
                                      <button
                                        onClick={() => {
                                          if (child.path) {
                                            router.push(child.path);
                                          } else {
                                            setCurrentPage(child.id);
                                          }
                                          if (window.innerWidth < 1024) setSidebarOpen(false);
                                        }}
                                        className={cn(
                                          "w-full flex items-center justify-between py-1.5 px-2.5 rounded-lg text-[12.5px] transition-colors relative",
                                          isChildActive ? "text-[#1ABB9C] bg-white/10 font-semibold" : "text-[#cbd5e1] hover:text-white hover:bg-white/5"
                                        )}
                                      >
                                        {/* Horizontal line connector for active item */}
                                        {isChildActive && (
                                          <div className={cn(
                                            "absolute top-1/2 -translate-y-1/2 w-3 h-px bg-[#1ABB9C]",
                                            isRTL ? "-right-4" : "-left-4"
                                          )} />
                                        )}
                                        
                                        <span>{t(child.labelKey)}</span>
                                        {child.badge && (
                                          <span className="text-[10px] font-bold bg-white/10 px-1.5 py-0.5 rounded text-white">
                                            {child.badge}
                                          </span>
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
                              <div className="bg-white text-[#1e293b] text-xs font-bold px-3 py-2 rounded-md whitespace-nowrap shadow-xl">
                                {t(tree.labelKey)}
                              </div>
                            </div>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}
            </nav>
          </div>
        </div>

        {/* Gentelella Footer Icons */}
        <div className={cn(
          "shrink-0 bg-[#171f2d] flex",
          isDesktopSidebarCollapsed ? "hidden" : ""
        )}>
          <button 
            className="flex-1 py-3 flex justify-center text-[#5A738E] hover:text-white transition-colors hover:bg-[#1a2332]"
            title={t('common.settings')}
            onClick={() => setCurrentPage(user.role === 'store_manager' ? 'store-settings' : 'seller-settings')}
          >
            <Settings className="h-[18px] w-[18px]" />
          </button>
          <button 
            className="flex-1 py-3 flex justify-center text-[#5A738E] hover:text-white transition-colors hover:bg-[#1a2332]"
            title={t('common.fullScreen')}
            onClick={toggleFullScreen}
          >
            <Monitor className="h-[18px] w-[18px]" />
          </button>
          <button 
            className="flex-1 py-3 flex justify-center text-[#5A738E] hover:text-white transition-colors hover:bg-[#1a2332]"
            title={t('common.lock')}
          >
            <KeyRound className="h-[18px] w-[18px]" />
          </button>
          <button 
            onClick={logout}
            className="flex-1 py-3 flex justify-center text-[#5A738E] hover:text-red-400 transition-colors hover:bg-[#1a2332]"
            title={t('common.logout')}
          >
            <LogOut className="h-[18px] w-[18px]" />
          </button>
        </div>
      </aside>
    </>
  );
}
