'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useTranslation } from '@/lib/i18n/useTranslation';
import { cn } from '@/lib/utils';
import { Loader2, PackageSearch } from 'lucide-react';
import Image from 'next/image';

interface MenuItem {
  id: string;
  type: 'standard' | 'categories-grid' | 'mega-custom';
  label: string;
  url: string;
  imageUrl?: string;
  children: MenuItem[];
}

interface MenuWrapper {
  alignment: 'start' | 'center' | 'end';
  fontFamily: string;
  items: MenuItem[];
}

export default function PublicMenu() {
  const { t, isAr } = useTranslation();
  const [config, setConfig] = useState<MenuWrapper | null>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/public/menu')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.menuConfig) {
          setConfig(data.menuConfig);
          if (data.categories) {
            setCategories(data.categories);
          }
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="h-12 flex items-center justify-center border-t border-border/50 bg-background/50"><Loader2 className="w-4 h-4 animate-spin text-muted-foreground" /></div>;
  }

  if (!config || !config.items || config.items.length === 0) return null;

  const alignmentClass = 
    config.alignment === 'start' ? 'justify-start' : 
    config.alignment === 'end' ? 'justify-end' : 'justify-center';

  const fontFamilyStyle = config.fontFamily ? { fontFamily: config.fontFamily } : {};

  return (
    <div className="w-full border-t border-border/50 bg-background/95 backdrop-blur-md hidden md:block border-b shadow-sm z-[100]" dir={isAr ? 'rtl' : 'ltr'}>
      <div className="container-platform relative" style={fontFamilyStyle}>
        <ul className={cn("flex gap-8 h-14 items-stretch", alignmentClass)}>
          {config.items.map(item => (
            <li key={item.id} className={cn("group flex items-center", item.type === 'standard' && "relative")}>
              
              <Link href={item.url} className={cn(
                "text-sm font-semibold hover:text-primary transition-colors flex items-center h-full px-2 border-b-2 border-transparent",
                "group-hover:border-primary group-hover:text-primary"
              )}>
                {t(item.label)}
              </Link>

              {/* Standard Dropdown */}
              {item.type === 'standard' && item.children && item.children.length > 0 && (
                <div className="absolute top-full start-0 min-w-[220px] bg-background border border-border/60 shadow-xl rounded-b-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 py-3 z-50 transform translate-y-2 group-hover:translate-y-0">
                  {item.children.map(child => (
                    <Link key={child.id} href={child.url} className="block px-5 py-2.5 hover:bg-muted/60 text-sm font-medium transition-colors">
                      {t(child.label)}
                    </Link>
                  ))}
                </div>
              )}

              {/* Auto Categories Grid Mega Menu */}
              {item.type === 'categories-grid' && categories.length > 0 && (
                <div className="absolute top-full start-0 end-0 bg-background border-x border-b border-border/60 shadow-2xl rounded-b-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 p-8 z-50 transform translate-y-2 group-hover:translate-y-0">
                  <div className="grid grid-cols-4 md:grid-cols-5 lg:grid-cols-7 gap-6">
                    {categories.map(cat => (
                      <Link key={cat.id} href={`/search?category=${cat.id}`} className="flex flex-col items-center gap-3 group/cat hover:bg-muted/30 p-3 rounded-xl transition-all hover:scale-105">
                        <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-transparent group-hover/cat:border-primary/50 shadow-sm flex items-center justify-center bg-muted/20 relative">
                          {cat.image ? (
                            <Image src={cat.image} alt={cat.name} fill className="object-cover" sizes="80px" />
                          ) : (
                            <PackageSearch className="w-8 h-8 text-muted-foreground/50" />
                          )}
                        </div>
                        <span className="text-xs text-center font-bold text-muted-foreground group-hover/cat:text-primary transition-colors line-clamp-2">
                          {t(cat.name)}
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Custom Mega Menu with Banner */}
              {item.type === 'mega-custom' && item.children && item.children.length > 0 && (
                <div className="absolute top-full start-0 end-0 bg-background border-x border-b border-border/60 shadow-2xl rounded-b-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 p-8 z-50 transform translate-y-2 group-hover:translate-y-0">
                  <div className="flex gap-10">
                    <div className="flex-1">
                      <h3 className="text-lg font-bold mb-6 border-b pb-2 text-primary">{t(item.label)}</h3>
                      <div className="grid grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-4">
                        {item.children.map(child => (
                          <Link key={child.id} href={child.url} className="flex items-center gap-2 group/child p-2 rounded-lg hover:bg-muted/50 transition-colors">
                            <div className="w-1.5 h-1.5 rounded-full bg-primary/30 group-hover/child:bg-primary transition-colors" />
                            <span className="text-sm font-medium group-hover/child:text-primary transition-colors">{t(child.label)}</span>
                          </Link>
                        ))}
                      </div>
                    </div>
                    {item.imageUrl && (
                      <div className="w-[300px] lg:w-[400px] shrink-0 rounded-xl overflow-hidden shadow-md relative group/banner border border-border/50">
                        <Image src={item.imageUrl} alt="Banner" fill className="object-cover transition-transform duration-700 group-hover/banner:scale-110" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-6">
                          <span className="text-white font-bold text-lg drop-shadow-md">{t('اكتشف المزيد', 'Discover More')} →</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
