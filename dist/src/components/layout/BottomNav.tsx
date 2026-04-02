'use client';

import { useAppStore, useAuthStore, useCartStore } from '@/lib/store';
import { cn } from '@/lib/utils';
import { Home, ShoppingBag, Tag, ShoppingCart, UserCircle } from 'lucide-react';
import type { PageType } from '@/types';

const t = (locale: string, ar: string, en: string) => (locale === 'ar' ? ar : en);

interface BottomNavItem {
  id: PageType;
  labelAr: string;
  labelEn: string;
  icon: React.ComponentType<{ className?: string }>;
  showBadge?: boolean;
}

const BOTTOM_NAV_ITEMS: BottomNavItem[] = [
  { id: 'buyer', labelAr: 'الرئيسية', labelEn: 'Home', icon: Home },
  { id: 'buyer-orders', labelAr: 'الطلبات', labelEn: 'Orders', icon: ShoppingBag },
  { id: 'buyer', labelAr: 'العروض', labelEn: 'Deals', icon: Tag },
  { id: 'buyer', labelAr: 'السلة', labelEn: 'Cart', icon: ShoppingCart, showBadge: true },
  { id: 'buyer', labelAr: 'حسابي', labelEn: 'Account', icon: UserCircle },
];

export default function BottomNav() {
  const { locale, currentPage, setCurrentPage } = useAppStore();
  const { isAuthenticated, user } = useAuthStore();
  const { itemCount } = useCartStore();

  if (!isAuthenticated) return null;

  return (
    <nav
      className="fixed bottom-0 inset-x-0 z-[var(--z-sticky)] md:hidden bg-background/95 backdrop-blur-md border-t border-border safe-bottom"
      dir={locale === 'ar' ? 'rtl' : 'ltr'}
    >
      <div className="flex items-center justify-around h-[var(--bottom-nav-height)] px-2">
        {BOTTOM_NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;

          return (
            <button
              key={item.id + item.labelAr}
              onClick={() => setCurrentPage(item.id)}
              className={cn(
                'flex flex-col items-center justify-center gap-0.5 flex-1 py-1 relative transition-colors',
                isActive ? 'text-brand' : 'text-muted-foreground'
              )}
            >
              <div className="relative">
                <Icon className={cn('h-5 w-5', isActive && 'stroke-[2.5]')} />
                {item.showBadge && itemCount > 0 && (
                  <span className="absolute -top-1.5 -end-2 h-4 w-4 rounded-full bg-brand text-navy text-[9px] font-bold flex items-center justify-center border border-background">
                    {itemCount > 99 ? '99+' : itemCount}
                  </span>
                )}
              </div>
              <span className="text-[10px] font-medium">{t(locale, item.labelAr, item.labelEn)}</span>
              {isActive && (
                <div className="absolute top-0 inset-x-1/4 h-0.5 bg-brand rounded-full" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
