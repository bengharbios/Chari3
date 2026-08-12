'use client';

import React, { useEffect, useState } from 'react';
import { useTranslation } from '@/lib/i18n/useTranslation';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Menu, ChevronDown, ChevronUp, PackageSearch } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { usePathname } from 'next/navigation';
import Image from 'next/image';

interface MenuItem {
  id: string;
  type: 'standard' | 'categories-grid' | 'mega-custom' | 'direct-category';
  labels: Record<string, string>;
  url: string;
  iconUrl?: string;
  imageUrls?: string[];
  categoryId?: string;
  children: MenuItem[];
}

interface MenuWrapper {
  alignment: 'start' | 'center' | 'end';
  fontFamily: string;
  items: MenuItem[];
}

const RecursiveMobileMenuItem = ({ item, level, getLabel, t, isAr, setIsOpen }: any) => {
  const [isOpenLocal, setIsOpenLocal] = useState(false);
  const hasChildren = item.children && item.children.length > 0;

  if (hasChildren) {
    return (
      <div className="w-full">
         <button
            onClick={() => setIsOpenLocal(!isOpenLocal)}
            className="flex items-center justify-between w-full py-2.5 px-3 text-sm font-semibold hover:bg-muted rounded-md transition-colors"
         >
            <div className="flex items-center gap-2">
               {item.iconUrl && <Image src={item.iconUrl} alt="icon" width={14} height={14} className="object-contain" />}
               <span className="text-foreground">{t(getLabel(item))}</span>
            </div>
            {isOpenLocal ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
         </button>
         <div className={cn("overflow-hidden transition-all duration-300", isOpenLocal ? "max-h-[800px] opacity-100" : "max-h-0 opacity-0")}>
            <div className="ps-4 ms-2 space-y-1 border-s border-primary/20">
               {item.children.map((child: any) => (
                  <RecursiveMobileMenuItem key={child.id} item={child} level={level + 1} getLabel={getLabel} t={t} isAr={isAr} setIsOpen={setIsOpen} />
               ))}
            </div>
         </div>
      </div>
    );
  }

  return (
      <Link
         href={item.url || '#'}
         className="flex items-center gap-2 py-2.5 px-3 text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-md transition-colors"
         onClick={() => setIsOpen(false)}
      >
         {item.iconUrl && <Image src={item.iconUrl} alt="icon" width={14} height={14} className="object-contain" />}
         {t(getLabel(item))}
      </Link>
  );
};

export default function MobilePublicMenu() {
  const { t, isAr } = useTranslation();
  const currentLocale = isAr ? 'ar' : 'en';
  const pathname = usePathname();
  const [wrapper, setWrapper] = useState<MenuWrapper | null>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [openSection, setOpenSection] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    fetch('/api/public/menu')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.menuConfig) {
          setWrapper(data.menuConfig);
          if (data.categories) {
            setCategories(data.categories);
          }
        }
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  if (!wrapper || !wrapper.items || wrapper.items.length === 0) return null;

  const fontFamilyStyle = wrapper.fontFamily ? { fontFamily: wrapper.fontFamily } : {};

  const getLabel = (item: MenuItem) => {
    if (item.labels && item.labels[currentLocale]) return item.labels[currentLocale];
    if ((item as any).label) return (item as any).label;
    if (item.labels) return Object.values(item.labels)[0] || 'Menu Item';
    return 'Menu Item';
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden me-2">
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side={isAr ? 'right' : 'left'} className="w-[300px] sm:w-[350px] overflow-y-auto" dir={isAr ? 'rtl' : 'ltr'} style={fontFamilyStyle}>
        <SheetHeader>
          <SheetTitle className="text-start">{t('القائمة الرئيسية', 'Main Menu')}</SheetTitle>
        </SheetHeader>
        <div className="py-6 space-y-2">
          {wrapper.items.map(item => {
             let directCat = null;
             if (item.type === 'direct-category' && item.categoryId) {
                directCat = categories.find(c => c.id === item.categoryId);
             }

             return (
            <div key={item.id} className="border-b border-border/50 pb-2 mb-2 last:border-0">
              
              {item.type === 'categories-grid' ? (
                <>
                  <button
                    onClick={() => setOpenSection(openSection === item.id ? null : item.id)}
                    className="flex items-center justify-between w-full py-3 px-3 font-semibold hover:bg-muted rounded-lg transition-colors"
                  >
                    <div className="flex items-center gap-2">
                       {item.iconUrl && <Image src={item.iconUrl} alt="icon" width={16} height={16} className="object-contain" />}
                       <span>{t(getLabel(item))}</span>
                    </div>
                    {openSection === item.id ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </button>
                  <div className={cn(
                    "overflow-hidden transition-all duration-300",
                    openSection === item.id ? "max-h-[1000px] mt-2 opacity-100" : "max-h-0 opacity-0"
                  )}>
                    <div className="grid grid-cols-3 gap-3 p-2 bg-muted/20 rounded-xl border border-border/50">
                      {categories.map(cat => (
                         <Link key={cat.id} href={`/search?category=${cat.id}`} className="flex flex-col items-center gap-2 p-2 hover:bg-muted rounded-lg transition-colors" onClick={() => setIsOpen(false)}>
                            <div className="w-12 h-12 rounded-full overflow-hidden border border-border/50 relative bg-background flex items-center justify-center shadow-sm">
                               {cat.image ? (
                                  <Image src={cat.image} alt={cat.name} fill className="object-cover" sizes="48px" />
                               ) : (
                                  <PackageSearch className="w-5 h-5 text-muted-foreground/50" />
                               )}
                            </div>
                            <span className="text-[10px] text-center font-medium line-clamp-2 leading-tight">{isAr ? cat.name : (cat.nameEn || cat.name)}</span>
                         </Link>
                      ))}
                    </div>
                  </div>
                </>
              ) : item.type === 'direct-category' && directCat ? (
                 <>
                   <button
                     onClick={() => setOpenSection(openSection === item.id ? null : item.id)}
                     className="flex items-center justify-between w-full py-3 px-3 font-semibold hover:bg-muted rounded-lg transition-colors"
                   >
                     <div className="flex items-center gap-2">
                        {item.iconUrl && <Image src={item.iconUrl} alt="icon" width={16} height={16} className="object-contain" />}
                        <span>{isAr ? directCat.name : (directCat.nameEn || directCat.name)}</span>
                     </div>
                     {item.children && item.children.length > 0 ? (
                        openSection === item.id ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
                     ) : (
                        <Link href={`/search?category=${directCat.id}`} onClick={() => setIsOpen(false)} className="absolute inset-0 z-10" />
                     )}
                   </button>
                   {item.children && item.children.length > 0 && (
                     <div className={cn(
                       "overflow-hidden transition-all duration-300",
                       openSection === item.id ? "max-h-[800px] mt-2 opacity-100" : "max-h-0 opacity-0"
                     )}>
                       <div className="ps-4 ms-2 space-y-1 border-s border-primary/20 relative before:content-[''] before:absolute before:start-[-1px] before:top-0 before:bottom-0 before:w-px before:bg-gradient-to-b before:from-primary/50 before:to-transparent">
                         <Link href={`/search?category=${directCat.id}`} className="block py-2.5 px-3 text-sm font-semibold text-primary hover:bg-primary/10 rounded-md transition-colors" onClick={() => setIsOpen(false)}>
                           {t('عرض جميع المنتجات', 'View All Products')}
                         </Link>
                         {item.children.map(child => (
                           <RecursiveMobileMenuItem key={child.id} item={child} level={1} getLabel={getLabel} t={t} isAr={isAr} setIsOpen={setIsOpen} />
                         ))}
                       </div>
                     </div>
                   )}
                 </>
              ) : item.children && item.children.length > 0 ? (
                <>
                  <button
                    onClick={() => setOpenSection(openSection === item.id ? null : item.id)}
                    className="flex items-center justify-between w-full py-3 px-3 font-semibold hover:bg-muted rounded-lg transition-colors"
                  >
                    <div className="flex items-center gap-2">
                       {item.iconUrl && <Image src={item.iconUrl} alt="icon" width={16} height={16} className="object-contain" />}
                       <span>{t(getLabel(item))}</span>
                    </div>
                    {openSection === item.id ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </button>
                  <div className={cn(
                    "overflow-hidden transition-all duration-300",
                    openSection === item.id ? "max-h-[800px] mt-2 opacity-100" : "max-h-0 opacity-0"
                  )}>
                    <div className="ps-4 ms-2 space-y-1 border-s border-primary/20 relative before:content-[''] before:absolute before:start-[-1px] before:top-0 before:bottom-0 before:w-px before:bg-gradient-to-b before:from-primary/50 before:to-transparent">
                      {item.children.map((child: any) => (
                        <RecursiveMobileMenuItem key={child.id} item={child} level={1} getLabel={getLabel} t={t} isAr={isAr} setIsOpen={setIsOpen} />
                      ))}
                    </div>
                    {item.type === 'mega-custom' && item.imageUrls && item.imageUrls.length > 0 && (
                      <div className="mt-4 rounded-lg overflow-hidden border border-border/50 relative h-[120px]">
                         <Image src={item.imageUrls[0]} alt="Banner" fill className="object-cover" />
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <Link
                  href={item.url || '#'}
                  className="flex items-center gap-2 py-3 px-3 font-semibold hover:bg-muted rounded-lg transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  {item.iconUrl && <Image src={item.iconUrl} alt="icon" width={16} height={16} className="object-contain" />}
                  {t(getLabel(item))}
                </Link>
              )}
            </div>
            );
          })}
        </div>
      </SheetContent>
    </Sheet>
  );
}
