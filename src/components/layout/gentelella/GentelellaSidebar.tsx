'use client';

import { useEffect, useState } from 'react';
import { useAppStore, useAuthStore } from '@/lib/store';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import type { PageType, UserRole } from '@/types';
import { useGentelellaTheme } from './theme';
import {
  LayoutDashboard, Users, Package, ShoppingCart, BarChart3, Settings,
  Store, UserCircle, FileText, ShieldCheck, Truck, MapPin, Navigation,
  Wallet, Heart, Star, Bell, ChevronLeft, ChevronRight, LogOut,
  TrendingUp, CreditCard, Boxes, ChevronUp, ChevronDown, ArrowLeftRight, Layers,
  Receipt, Sparkles, Monitor, KeyRound, MoreHorizontal
} from 'lucide-react';

const t = (locale: string, ar: string, en: string) => (locale === 'ar' ? ar : en);

// Type for the nested sidebar structure
type GentelellaNavSubItem = {
  id: PageType;
  labelAr: string;
  labelEn: string;
  badge?: number;
};

type GentelellaNavTree = {
  id: string;
  labelAr: string;
  labelEn: string;
  icon: any;
  badge?: number | string;
  badgeColor?: string;
  children?: GentelellaNavSubItem[];
  directPageId?: PageType; // If it has no children, it links directly
};

type GentelellaNavGroup = {
  id: string;
  labelAr: string;
  labelEn: string;
  trees: GentelellaNavTree[];
};

// Define structure for STORE MANAGER
const STORE_GROUPS: GentelellaNavGroup[] = [
  {
    id: 'general',
    labelAr: 'عام',
    labelEn: 'General',
    trees: [
      {
        id: 'dashboards',
        labelAr: 'لوحات القيادة',
        labelEn: 'Dashboards',
        icon: LayoutDashboard,
        children: [
          { id: 'store', labelAr: 'العمليات', labelEn: 'Operations' },
          { id: 'store-analytics', labelAr: 'التحليلات', labelEn: 'Analytics' },
        ]
      },
      {
        id: 'team',
        labelAr: 'الفريق',
        labelEn: 'Team',
        icon: Users,
        directPageId: 'store-staff'
      }
    ]
  },
  {
    id: 'ecommerce',
    labelAr: 'التجارة الإلكترونية',
    labelEn: 'E-commerce',
    trees: [
      {
        id: 'products-tree',
        labelAr: 'المنتجات',
        labelEn: 'Products',
        icon: Boxes,
        directPageId: 'store-products',
        badge: 5,
        badgeColor: 'bg-blue-500'
      },
      {
        id: 'orders-tree',
        labelAr: 'الطلبات',
        labelEn: 'Orders',
        icon: Package,
        children: [
          { id: 'store-orders', labelAr: 'كل الطلبات', labelEn: 'All orders', badge: 12 },
        ]
      },
      {
        id: 'marketing-tree',
        labelAr: 'التسويق',
        labelEn: 'Marketing',
        icon: CreditCard,
        directPageId: 'store-coupons'
      }
    ]
  },
  {
    id: 'finance',
    labelAr: 'المالية',
    labelEn: 'Finance',
    trees: [
      {
        id: 'billing-tree',
        labelAr: 'الفواتير',
        labelEn: 'Billing',
        icon: Receipt,
        children: [
          { id: 'store-billing', labelAr: 'فاتورتي الحالية', labelEn: 'Current Invoice' },
          { id: 'store-billing-plans', labelAr: 'الخطط', labelEn: 'Plans' },
          { id: 'store-billing-addons', labelAr: 'الإضافات', labelEn: 'Add-ons' },
          { id: 'store-billing-pay', labelAr: 'الدفع', labelEn: 'Payment' },
          { id: 'store-billing-history', labelAr: 'سجل الفواتير', labelEn: 'History' },
        ]
      }
    ]
  },
  {
    id: 'admin',
    labelAr: 'الإدارة',
    labelEn: 'Admin',
    trees: [
      {
        id: 'settings-tree',
        labelAr: 'الإعدادات',
        labelEn: 'Settings',
        icon: Settings,
        directPageId: 'store-settings'
      }
    ]
  }
];

// Define structure for SELLER
const SELLER_GROUPS: GentelellaNavGroup[] = [
  {
    id: 'general',
    labelAr: 'عام',
    labelEn: 'General',
    trees: [
      {
        id: 'dashboards',
        labelAr: 'لوحات القيادة',
        labelEn: 'Dashboards',
        icon: LayoutDashboard,
        children: [
          { id: 'seller', labelAr: 'العمليات', labelEn: 'Operations' },
        ]
      }
    ]
  },
  {
    id: 'ecommerce',
    labelAr: 'التجارة الإلكترونية',
    labelEn: 'E-commerce',
    trees: [
      {
        id: 'products-tree',
        labelAr: 'المنتجات',
        labelEn: 'Products',
        icon: Boxes,
        directPageId: 'seller-products'
      },
      {
        id: 'orders-tree',
        labelAr: 'الطلبات',
        labelEn: 'Orders',
        icon: Package,
        children: [
          { id: 'seller-orders', labelAr: 'كل الطلبات', labelEn: 'All orders', badge: 4 },
        ]
      }
    ]
  },
  {
    id: 'finance',
    labelAr: 'المالية',
    labelEn: 'Finance',
    trees: [
      {
        id: 'wallet-tree',
        labelAr: 'المحفظة',
        labelEn: 'Wallet',
        icon: Wallet,
        children: [
          { id: 'seller-wallet', labelAr: 'الأرباح', labelEn: 'Payouts' },
          { id: 'seller-debts', labelAr: 'المديونية', labelEn: 'Debts' },
        ]
      },
      {
        id: 'billing-tree',
        labelAr: 'الفواتير',
        labelEn: 'Billing',
        icon: Receipt,
        children: [
          { id: 'seller-billing', labelAr: 'الفاتورة', labelEn: 'Invoice' },
          { id: 'seller-billing-plans', labelAr: 'الخطط', labelEn: 'Plans' },
          { id: 'seller-billing-addons', labelAr: 'الإضافات', labelEn: 'Add-ons' },
          { id: 'seller-billing-pay', labelAr: 'الدفع', labelEn: 'Payment' },
          { id: 'seller-billing-history', labelAr: 'السجل', labelEn: 'History' },
        ]
      }
    ]
  },
  {
    id: 'admin',
    labelAr: 'الإدارة',
    labelEn: 'Admin',
    trees: [
      {
        id: 'settings-tree',
        labelAr: 'الإعدادات',
        labelEn: 'Settings',
        icon: Settings,
        directPageId: 'seller-settings'
      },
      {
        id: 'upgrade-tree',
        labelAr: 'ترقية',
        labelEn: 'Upgrade',
        icon: TrendingUp,
        directPageId: 'seller-upgrade',
        badge: 'New',
        badgeColor: 'bg-teal-500'
      }
    ]
  }
];

export default function GentelellaSidebar({ className }: { className?: string }) {
  const { locale, currentPage, setCurrentPage, isSidebarOpen, setSidebarOpen, isDesktopSidebarCollapsed } = useAppStore();
  const { user, isBuyerMode, logout } = useAuthStore();
  const { isDark } = useGentelellaTheme();
  const isRTL = locale === 'ar';
  
  // Track open accordion trees
  const [openTrees, setOpenTrees] = useState<Record<string, boolean>>({});

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

  useEffect(() => {
    if (user?.role === 'seller' && !isBuyerMode) {
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
              if (data.success && data.settings?.paymentModel && data.settings.paymentModel !== 'default') {
                setPaymentModel(data.settings.paymentModel);
              } else {
                setPaymentModel(model);
              }
            })
            .catch(() => setPaymentModel(model));
        })
        .catch(() => {});
    }
  }, [user, isBuyerMode]);

  // Open the tree that contains the current page automatically on load
  useEffect(() => {
    const groups = user?.role === 'store_manager' ? STORE_GROUPS : user?.role === 'seller' ? SELLER_GROUPS : [];
    const newOpenTrees = { ...openTrees };
    let changed = false;
    
    groups.forEach(group => {
      group.trees.forEach(tree => {
        if (tree.children?.some(child => child.id === currentPage)) {
          if (!newOpenTrees[tree.id]) {
            newOpenTrees[tree.id] = true;
            changed = true;
          }
        }
      });
    });
    
    if (changed) setOpenTrees(newOpenTrees);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, user?.role]);

  if (!user) return null;

  // Filter wallet/debts based on payment model
  let activeGroups = user.role === 'store_manager' ? STORE_GROUPS : user.role === 'seller' ? SELLER_GROUPS : [];
  
  if (user.role === 'seller') {
    activeGroups = activeGroups.map(group => {
      if (group.id !== 'finance') return group;
      return {
        ...group,
        trees: group.trees.map(tree => {
          if (tree.id !== 'wallet-tree') return tree;
          return {
            ...tree,
            children: tree.children?.filter(child => {
              if (child.id === 'seller-wallet' && paymentModel === 'decentralized') return false;
              if (child.id === 'seller-debts' && paymentModel === 'centralized') return false;
              return true;
            })
          };
        }).filter(tree => tree.children && tree.children.length > 0)
      };
    });
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
            G
          </div>
          <div className={cn("flex flex-col transition-opacity duration-300", isDesktopSidebarCollapsed ? "opacity-0 hidden" : "opacity-100")}>
            <span className="text-white text-lg font-bold tracking-wide">
              Gentelella <span className="text-[11px] text-[#1ABB9C] align-top ml-1">v4</span>
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
              <span className="text-[13px] text-[#BAB8B8]">{t(locale, 'مرحباً بك،', 'Welcome,')}</span>
              <span className="text-[15px] font-semibold text-[#E7E7E7] truncate">{user.name}</span>
            </div>
          </div>
          <div className="w-full h-px bg-white/5 mb-2" />

          {/* Sidebar Menu */}
          <div className="flex-1 py-2">
            <nav className="flex flex-col w-full">
              {activeGroups.map((group, gIdx) => (
                <div key={group.id} className="mb-4">
                  <div className={cn("px-6 mb-2 transition-opacity", isDesktopSidebarCollapsed ? "opacity-0 hidden" : "opacity-100")}>
                    <span className="text-[11px] font-bold text-[#64748b] uppercase tracking-widest">
                      {t(locale, group.labelAr, group.labelEn)}
                    </span>
                  </div>
                  
                  <ul className="flex flex-col px-3 gap-0.5">
                    {group.trees.map(tree => {
                      const hasChildren = tree.children && tree.children.length > 0;
                      const isOpen = openTrees[tree.id] || false;
                      const isTreeActive = hasChildren 
                        ? tree.children!.some(c => c.id === currentPage)
                        : tree.directPageId === currentPage;
                      
                      const Icon = tree.icon;

                      return (
                        <li key={tree.id} className="relative group">
                          <button
                            dir={isRTL ? 'rtl' : 'ltr'}
                            onClick={() => {
                              if (hasChildren) {
                                toggleTree(tree.id);
                              } else if (tree.directPageId) {
                                setCurrentPage(tree.directPageId);
                                if (window.innerWidth < 1024) setSidebarOpen(false);
                              }
                            }}
                            className={cn(
                              'w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-[14px] font-medium transition-all duration-200 outline-none',
                              isTreeActive && !hasChildren
                                ? 'bg-white/10 text-white' 
                                : isOpen 
                                  ? 'text-white'
                                  : 'text-[#94a3b8] hover:bg-white/5 hover:text-white',
                              isDesktopSidebarCollapsed && 'justify-center px-0'
                            )}
                            title={isDesktopSidebarCollapsed ? t(locale, tree.labelAr, tree.labelEn) : undefined}
                          >
                            <div className="flex items-center gap-3">
                              <Icon className={cn(
                                "h-[20px] w-[20px] shrink-0 transition-colors", 
                                isTreeActive ? "text-[#1ABB9C]" : "group-hover:text-[#1ABB9C]"
                              )} strokeWidth={isTreeActive ? 2.5 : 2} />
                              <span className={cn("text-start transition-opacity", isDesktopSidebarCollapsed ? "opacity-0 hidden" : "opacity-100")}>
                                {t(locale, tree.labelAr, tree.labelEn)}
                              </span>
                            </div>
                            
                            {!isDesktopSidebarCollapsed && (
                              <div className="flex items-center gap-2">
                                {tree.badge && (
                                  <Badge className={cn("h-[20px] px-2 text-[10px] font-bold text-white border-0 shrink-0", tree.badgeColor || 'bg-blue-500')}>
                                    {tree.badge}
                                  </Badge>
                                )}
                                {hasChildren && (
                                  <ChevronDown className={cn(
                                    "h-4 w-4 transition-transform duration-200 opacity-50",
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
                                  const isChildActive = currentPage === child.id;
                                  return (
                                    <li key={child.id} className="relative">
                                      <button
                                        onClick={() => {
                                          setCurrentPage(child.id);
                                          if (window.innerWidth < 1024) setSidebarOpen(false);
                                        }}
                                        className={cn(
                                          "w-full flex items-center justify-between py-2 px-3 rounded-lg text-[13px] transition-colors relative",
                                          isChildActive ? "text-white font-semibold" : "text-[#64748b] hover:text-white hover:bg-white/5"
                                        )}
                                      >
                                        {/* Horizontal line connector for active item */}
                                        {isChildActive && (
                                          <div className={cn(
                                            "absolute top-1/2 -translate-y-1/2 w-3 h-px bg-[#1ABB9C]",
                                            isRTL ? "-right-4" : "-left-4"
                                          )} />
                                        )}
                                        
                                        <span>{t(locale, child.labelAr, child.labelEn)}</span>
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
                                {t(locale, tree.labelAr, tree.labelEn)}
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
            title={t(locale, 'الإعدادات', 'Settings')}
            onClick={() => setCurrentPage(user.role === 'store_manager' ? 'store-settings' : 'seller-settings')}
          >
            <Settings className="h-[18px] w-[18px]" />
          </button>
          <button 
            className="flex-1 py-3 flex justify-center text-[#5A738E] hover:text-white transition-colors hover:bg-[#1a2332]"
            title={t(locale, 'ملء الشاشة', 'Full Screen')}
            onClick={toggleFullScreen}
          >
            <Monitor className="h-[18px] w-[18px]" />
          </button>
          <button 
            className="flex-1 py-3 flex justify-center text-[#5A738E] hover:text-white transition-colors hover:bg-[#1a2332]"
            title={t(locale, 'قفل الشاشة', 'Lock')}
          >
            <KeyRound className="h-[18px] w-[18px]" />
          </button>
          <button 
            onClick={logout}
            className="flex-1 py-3 flex justify-center text-[#5A738E] hover:text-red-400 transition-colors hover:bg-[#1a2332]"
            title={t(locale, 'تسجيل الخروج', 'Logout')}
          >
            <LogOut className="h-[18px] w-[18px]" />
          </button>
        </div>
      </aside>
    </>
  );
}
