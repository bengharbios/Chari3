'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from '@/components/ui/navigation-menu';
import { useTranslation } from '@/lib/i18n/useTranslation';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

interface MenuItem {
  id: string;
  label: string;
  url: string;
  isMega: boolean;
  children: MenuItem[];
}

export default function PublicMenu() {
  const { t, isAr } = useTranslation();
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/public/menu')
      .then(res => res.json())
      .then(data => {
        if (data.success && Array.isArray(data.menuConfig)) {
          setMenuItems(data.menuConfig);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="h-10 flex items-center justify-center border-t border-border/50 bg-background/50"><Loader2 className="w-4 h-4 animate-spin text-muted-foreground" /></div>;
  }

  if (menuItems.length === 0) return null;

  return (
    <div className="w-full border-t border-border/50 bg-background/95 backdrop-blur-md hidden md:flex justify-center px-4">
      <div className="container-platform py-1">
        <NavigationMenu dir={isAr ? 'rtl' : 'ltr'} className="mx-auto">
          <NavigationMenuList className="gap-2">
            {menuItems.map(item => (
              <NavigationMenuItem key={item.id}>
                {item.children && item.children.length > 0 ? (
                  <>
                    <NavigationMenuTrigger className="bg-transparent hover:bg-muted/50 text-sm font-semibold h-9 px-3 transition-colors">
                      {t(item.label)}
                    </NavigationMenuTrigger>
                    <NavigationMenuContent>
                      <ul className={cn(
                        "grid gap-3 p-4",
                        item.isMega ? "md:w-[600px] lg:w-[800px] grid-cols-3" : "w-[250px] flex-col"
                      )}>
                        {item.children.map(child => (
                          <li key={child.id}>
                            <NavigationMenuLink asChild>
                              <Link
                                href={child.url}
                                className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-muted hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                              >
                                <div className="text-sm font-medium leading-none">{t(child.label)}</div>
                              </Link>
                            </NavigationMenuLink>
                          </li>
                        ))}
                      </ul>
                    </NavigationMenuContent>
                  </>
                ) : (
                  <Link href={item.url} legacyBehavior passHref>
                    <NavigationMenuLink className={cn(navigationMenuTriggerStyle(), "bg-transparent hover:bg-muted/50 text-sm font-semibold h-9 px-3 transition-colors")}>
                      {t(item.label)}
                    </NavigationMenuLink>
                  </Link>
                )}
              </NavigationMenuItem>
            ))}
          </NavigationMenuList>
        </NavigationMenu>
      </div>
    </div>
  );
}
