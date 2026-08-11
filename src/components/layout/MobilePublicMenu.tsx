'use client';

import React, { useEffect, useState } from 'react';
import { useTranslation } from '@/lib/i18n/useTranslation';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Menu, ChevronDown, ChevronUp } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { usePathname } from 'next/navigation';

interface MenuItem {
  id: string;
  label: string;
  url: string;
  isMega: boolean;
  children: MenuItem[];
}

export default function MobilePublicMenu() {
  const { t, isAr } = useTranslation();
  const pathname = usePathname();
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [openSection, setOpenSection] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    fetch('/api/public/menu')
      .then(res => res.json())
      .then(data => {
        if (data.success && Array.isArray(data.menuConfig)) {
          setMenuItems(data.menuConfig);
        }
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  if (menuItems.length === 0) return null;

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden me-2">
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side={isAr ? 'right' : 'left'} className="w-[300px] sm:w-[350px] overflow-y-auto" dir={isAr ? 'rtl' : 'ltr'}>
        <SheetHeader>
          <SheetTitle className="text-start">{t('القائمة الرئيسية', 'Main Menu')}</SheetTitle>
        </SheetHeader>
        <div className="py-6 space-y-2">
          {menuItems.map(item => (
            <div key={item.id} className="border-b border-border/50 pb-2 mb-2 last:border-0">
              {item.children && item.children.length > 0 ? (
                <>
                  <button
                    onClick={() => setOpenSection(openSection === item.id ? null : item.id)}
                    className="flex items-center justify-between w-full py-2 px-3 font-semibold hover:bg-muted rounded-lg transition-colors"
                  >
                    <span>{t(item.label)}</span>
                    {openSection === item.id ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </button>
                  <div className={cn(
                    "overflow-hidden transition-all duration-200",
                    openSection === item.id ? "max-h-[500px] mt-2 opacity-100" : "max-h-0 opacity-0"
                  )}>
                    <div className="ps-4 ms-2 space-y-1 border-s border-primary/20 relative before:content-[''] before:absolute before:start-[-1px] before:top-0 before:bottom-0 before:w-px before:bg-gradient-to-b before:from-brand/50 before:to-transparent">
                      {item.children.map(child => (
                        <Link
                          key={child.id}
                          href={child.url}
                          className="block py-2 px-3 text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-md transition-colors"
                          onClick={() => setIsOpen(false)}
                        >
                          {t(child.label)}
                        </Link>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                <Link
                  href={item.url}
                  className="block py-2 px-3 font-semibold hover:bg-muted rounded-lg transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  {t(item.label)}
                </Link>
              )}
            </div>
          ))}
        </div>
      </SheetContent>
    </Sheet>
  );
}
