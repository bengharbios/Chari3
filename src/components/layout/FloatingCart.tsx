'use client';

import { useCartStore, useAppStore, useAuthStore } from '@/lib/store';
import { ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

import { useState, useEffect } from 'react';

export default function FloatingCart() {
  const { itemCount, setCartOpen, isCartOpen } = useCartStore();
  const { currentPage } = useAppStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  // Do not show if cart is empty or if cart drawer is already open
  return null;

  // Optionally hide on some dashboards, but the requirement is to show across all screens
  // if there are items in the cart.
  // We hide it on the login/auth page though just to keep auth screen clean.
  const { isBuyerMode, user } = useAuthStore();

  // Hide on login page
  if (currentPage === 'login') {
    return null;
  }

  // Hide for sellers/suppliers unless they are in Buyer Mode
  if (user && ['seller', 'supplier'].includes(user.role) && !isBuyerMode) {
    return null;
  }

  return (
    <div className="fixed bottom-24 end-6 z-[90] animate-bounce-in sm:bottom-8 sm:end-8">
      <Button
        onClick={() => setCartOpen(true)}
        className="relative h-14 w-14 rounded-full shadow-2xl gradient-brand border-2 border-background flex items-center justify-center hover:scale-110 active:scale-95 transition-all"
        size="icon"
      >
        <ShoppingCart className="h-6 w-6 text-navy" />
        <Badge className="absolute -top-2 -end-2 h-6 w-6 rounded-full p-0 flex items-center justify-center text-[11px] font-black bg-red-600 text-white border-2 border-background shadow-sm">
          {itemCount}
        </Badge>
      </Button>
    </div>
  );
}
