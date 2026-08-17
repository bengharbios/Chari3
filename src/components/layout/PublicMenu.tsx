'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useTranslation } from '@/lib/i18n/useTranslation';
import { cn } from '@/lib/utils';
import { Loader2, PackageSearch, ChevronDown, ChevronRight, ArrowLeft, ArrowRight } from 'lucide-react';
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

const RecursiveMenuItem = ({ item, level = 0, getLabel, t, isAr }: any) => {
  const hasChildren = item.children && item.children.length > 0;
  
  return (
    <div className="relative group/subitem">
       <Link href={item.url || '#'} className="px-5 py-2.5 flex items-center justify-between hover:bg-primary/5 text-sm font-medium transition-colors text-muted-foreground hover:text-primary">
          <span className="flex items-center gap-3">
             {item.iconUrl ? (
               <div className="w-4 h-4 relative shrink-0">
                  <Image src={item.iconUrl} alt="icon" fill className="object-contain" sizes="16px" unoptimized />
               </div>
             ) : item.icon ? (
               <span className="text-lg leading-none">{item.icon}</span>
             ) : null}
             {t(getLabel(item))}
          </span>
          {hasChildren && <ChevronRight className={cn("w-4 h-4 opacity-50", isAr ? "rotate-180" : "")} />}
       </Link>
       
       {hasChildren && (
         <div className={cn(
            "absolute top-0 opacity-0 invisible translate-y-2 pointer-events-none",
            "group-hover/subitem:opacity-100 group-hover/subitem:visible group-hover/subitem:translate-y-0 group-hover/subitem:pointer-events-auto",
            "transition-all duration-300 ease-in-out bg-background border border-border/60 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.1)] rounded-xl z-50",
            "w-[240px]",
            "ltr:left-full ltr:-ml-2 rtl:right-full rtl:-mr-2" 
         )}>
           <div className="py-2 flex flex-col">
              {item.children.map((child: any) => (
                <RecursiveMenuItem key={child.id} item={child} level={level + 1} getLabel={getLabel} t={t} isAr={isAr} />
              ))}
           </div>
         </div>
       )}
    </div>
  );
};

export default function PublicMenu() {
  const { t, isAr, locale: currentLocale } = useTranslation();

  const [config, setConfig] = useState<MenuWrapper | null>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/public/menu', { cache: 'no-store' })
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
    return <div className="h-14 flex items-center justify-center border-t border-border/50 bg-background/50"><Loader2 className="w-4 h-4 animate-spin text-muted-foreground" /></div>;
  }

  if (!config || !config.items || config.items.length === 0) return null;

  const fontFamilyStyle = config.fontFamily ? { fontFamily: config.fontFamily } : {};

  const getLabel = (item: MenuItem) => {
    if (item.labels && item.labels[currentLocale]) return item.labels[currentLocale];
    if ((item as any).label) return (item as any).label;
    if (item.labels) return Object.values(item.labels)[0] || 'Menu Item';
    return 'Menu Item';
  };

  const getCatName = (cat: any) => {
    if (!cat) return '';
    if (currentLocale === 'ar') return cat.name;
    if (currentLocale === 'en' && cat.nameEn) return cat.nameEn;
    if (cat.translations && typeof cat.translations === 'object') {
       if (cat.translations[currentLocale]) return cat.translations[currentLocale];
    }
    return cat.nameEn || cat.name;
  };

  return (
    <div className="w-full hidden md:block z-[100] border-y border-border/40 bg-background/95 backdrop-blur-md relative" dir={isAr ? 'rtl' : 'ltr'}>
      <div className="container-platform relative" style={fontFamilyStyle}>
        
        <nav className="flex h-14 items-center px-4 w-full overflow-x-auto overflow-y-hidden no-scrollbar">
          <ul className="flex items-center gap-1 h-full m-0 p-0 list-none">
            {config.items.map((item) => {
              const hasDropdown = item.type === 'mega-custom' || item.type === 'categories-grid' || (item.children && item.children.length > 0);
              const label = getLabel(item);
              
              let directCat = null;
              if (item.type === 'direct-category' && item.categoryId) {
                 directCat = categories.find(c => c.id === item.categoryId);
              }

              return (
                <li 
                  key={item.id} 
                  className="h-full flex items-center group/navitem px-1 xl:px-2 shrink-0 static"
                >
                  <Link href={item.type === 'direct-category' && directCat ? `/search?category=${directCat.id}` : (item.url || '#')} className={cn(
                    "text-[13px] xl:text-sm font-semibold flex items-center gap-1.5 xl:gap-2 h-10 px-2 xl:px-3 rounded-lg text-foreground transition-all duration-300 whitespace-nowrap",
                    "group-hover/navitem:bg-primary/5 group-hover/navitem:text-primary z-10"
                  )}>
                    {item.iconUrl && (
                      <div className="w-4 h-4 relative shrink-0">
                         <Image src={item.iconUrl} alt="icon" fill className="object-contain" sizes="16px" unoptimized />
                      </div>
                    )}
                    {t(label)}
                    {hasDropdown && (
                      <ChevronDown className="w-3.5 h-3.5 transition-transform duration-300 group-hover/navitem:rotate-180" />
                    )}
                  </Link>

                  {hasDropdown && (
                    <div className={cn(
                      "absolute top-full opacity-0 invisible translate-y-3 pointer-events-none",
                      "group-hover/navitem:opacity-100 group-hover/navitem:visible group-hover/navitem:translate-y-0 group-hover/navitem:pointer-events-auto",
                      "transition-all duration-300 ease-in-out bg-background border border-border/60 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] z-50",
                      item.type === 'standard' ? "w-[260px] ltr:left-2 rtl:right-2 rounded-2xl" : 
                      item.type === 'direct-category' ? "start-0 end-0 w-full xl:max-w-7xl mx-auto rounded-2xl mt-1 overflow-hidden" :
                      "start-0 end-0 w-full min-w-[800px] xl:max-w-7xl mx-auto rounded-2xl mt-1 overflow-hidden"
                    )}>
                      {/* 1. Standard Dropdown */}
                      {item.type === 'standard' && (
                        <div className="py-2 flex flex-col max-h-[70vh] overflow-visible">
                          {item.children.map(child => (
                            <RecursiveMenuItem key={child.id} item={child} getLabel={getLabel} t={t} isAr={isAr} />
                          ))}
                        </div>
                      )}

                      {/* 2. Direct Category Dropdown (Mega Menu Style) */}
                      {item.type === 'direct-category' && directCat && (
                         <div className="flex bg-background w-full max-h-[70vh] overflow-y-auto">
                           {/* Main Category Info */}
                           <div className="w-[30%] min-w-[280px] p-8 bg-primary/5 flex flex-col justify-center items-center gap-5 text-center shrink-0">
                              <div className="w-40 h-40 shrink-0 rounded-2xl overflow-hidden border border-border/50 relative bg-background flex items-center justify-center shadow-sm group-hover/navitem:shadow-md transition-all">
                                 {directCat.image ? (
                                    <Image src={directCat.image} alt={directCat.name} fill className="object-cover group-hover/navitem:scale-110 transition-transform duration-700" sizes="160px" unoptimized />
                                 ) : directCat.icon ? (
                                    <span className="text-7xl relative z-10 group-hover/navitem:scale-110 transition-transform duration-700">{directCat.icon}</span>
                                 ) : <PackageSearch className="w-16 h-16 text-muted-foreground/40" />}
                              </div>
                              <div>
                                 <h4 className="font-bold text-xl mb-3 text-primary">{getCatName(directCat)}</h4>
                                 <Link href={`/search?category=${directCat.id}`} className="text-sm font-bold hover:underline inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-full hover:bg-primary/90 transition-colors shadow-sm">
                                    {t('تصفح القسم', 'Browse Category')}
                                    {isAr ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
                                 </Link>
                              </div>
                           </div>
                           
                           {/* Subcategories Grid */}
                           <div className="flex-1 p-8">
                             {item.children && item.children.length > 0 ? (
                               <div className="grid grid-cols-2 xl:grid-cols-3 gap-8">
                                  {item.children.map(child => (
                                     <div key={child.id} className="space-y-4">
                                        <Link href={`/search?category=${child.id}`} className="font-bold text-foreground hover:text-primary transition-colors text-base block border-b border-border/40 pb-2">
                                           {t(getLabel(child))}
                                        </Link>
                                        {child.children && child.children.length > 0 && (
                                           <ul className="space-y-3">
                                              {child.children.slice(0, 7).map((grandChild: any) => (
                                                 <li key={grandChild.id}>
                                                    <Link href={`/search?category=${grandChild.id}`} className="text-sm text-muted-foreground hover:text-primary transition-colors">
                                                       {t(getLabel(grandChild))}
                                                    </Link>
                                                 </li>
                                              ))}
                                              {child.children.length > 7 && (
                                                 <li>
                                                    <Link href={`/search?category=${child.id}`} className="text-sm font-semibold text-primary hover:underline inline-flex items-center gap-1 mt-1">
                                                       {t('المزيد...', 'More...')}
                                                    </Link>
                                                 </li>
                                              )}
                                           </ul>
                                        )}
                                     </div>
                                  ))}
                               </div>
                             ) : (
                               <div className="flex h-full flex-col items-center justify-center text-muted-foreground gap-3 opacity-60">
                                  <PackageSearch className="w-12 h-12" />
                                  <span className="text-lg font-medium">{t('لا توجد أقسام فرعية', 'No subcategories found')}</span>
                               </div>
                             )}
                           </div>

                           {/* Ads / Promotions Section */}
                           {item.imageUrls && item.imageUrls.length > 0 ? (
                              <div className="w-[22%] min-w-[220px] p-6 bg-muted/20 shrink-0 border-s border-border/40 flex flex-col gap-4">
                                 {item.imageUrls.map((img: string, idx: number) => (
                                    <Link key={idx} href={item.url || '#'} className="relative w-full h-full min-h-[160px] rounded-2xl overflow-hidden group/ad shadow-sm hover:shadow-md transition-all">
                                       <Image src={img} alt="Promo" fill className="object-cover group-hover/ad:scale-110 transition-transform duration-700" unoptimized />
                                    </Link>
                                 ))}
                              </div>
                           ) : (
                              <div className="w-[22%] min-w-[220px] p-6 bg-muted/20 shrink-0 border-s border-border/40 flex flex-col gap-4 justify-center items-center group/adspace cursor-pointer" onClick={() => window.location.href = directCat ? `/search?category=${directCat.id}` : '#'}>
                                 <div className="w-full h-full min-h-[220px] rounded-2xl flex flex-col items-center justify-center text-muted-foreground/80 bg-background/50 relative overflow-hidden shadow-sm group-hover/adspace:shadow-md transition-all">
                                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-primary/10"></div>
                                    <div className="relative z-10 flex flex-col items-center gap-2 p-4 text-center">
                                       <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-2 group-hover/adspace:scale-110 transition-transform">
                                          <Megaphone className="w-6 h-6 text-primary" />
                                       </div>
                                       <span className="text-base font-bold text-primary">{t('عروض حصرية', 'Exclusive Offers')}</span>
                                       <span className="text-xs text-muted-foreground">{t('تصفح أحدث الخصومات في قسم', 'Browse latest discounts in')} {getCatName(directCat)}</span>
                                    </div>
                                 </div>
                              </div>
                           )}
                         </div>
                      )}

                      {/* 3. Auto Categories Grid */}
                      {item.type === 'categories-grid' && (
                        <div className="p-8 grid grid-cols-4 md:grid-cols-5 lg:grid-cols-7 gap-6">
                          {categories.map((cat, i) => (
                            <Link key={cat.id} href={`/search?category=${cat.id}`} className="flex flex-col items-center gap-3 group/cat p-3 rounded-2xl hover:bg-muted/50 transition-all duration-300">
                              <div className="w-20 h-20 rounded-full overflow-hidden border border-border/50 shadow-sm flex items-center justify-center bg-background relative z-10 transition-transform duration-300 group-hover/cat:scale-110 group-hover/cat:-translate-y-1">
                                {cat.image ? (
                                  <Image src={cat.image} alt={cat.name} fill className="object-cover" sizes="80px" unoptimized />
                                ) : cat.icon ? (
                                  <span className="text-4xl">{cat.icon}</span>
                                ) : (
                                  <PackageSearch className="w-8 h-8 text-muted-foreground/40" />
                                )}
                              </div>
                              <span className="text-sm text-center font-bold text-muted-foreground group-hover/cat:text-primary transition-colors line-clamp-2">
                                {getCatName(cat)}
                              </span>
                            </Link>
                          ))}
                        </div>
                      )}

                      {/* 4. Custom Mega Menu with Multiple Banners */}
                      {item.type === 'mega-custom' && (
                        <div className="p-8 flex gap-10">
                          <div className="flex-1">
                            <h3 className="text-xl font-bold mb-6 border-b pb-4 text-primary flex items-center gap-3">
                               {item.iconUrl && (
                                 <div className="w-6 h-6 relative shrink-0">
                                    <Image src={item.iconUrl} alt="icon" fill className="object-contain" sizes="24px" unoptimized />
                                 </div>
                               )}
                               {t(label)}
                            </h3>
                            <div className="grid grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-2">
                              {item.children.map(child => (
                                <Link key={child.id} href={child.url} className="flex items-center justify-between group/child p-3 rounded-xl hover:bg-primary/5 transition-all">
                                  <div className="flex items-center gap-3">
                                    {child.iconUrl ? (
                                      <div className="w-4 h-4 relative shrink-0">
                                         <Image src={child.iconUrl} alt="icon" fill className="object-contain" sizes="16px" unoptimized />
                                      </div>
                                    ) : (
                                      <div className="w-1.5 h-1.5 rounded-full bg-primary/20 group-hover/child:bg-primary group-hover/child:scale-125 transition-all" />
                                    )}
                                    <span className="text-sm font-medium text-muted-foreground group-hover/child:text-primary transition-colors">{t(getLabel(child))}</span>
                                  </div>
                                  {isAr ? <ArrowLeft className="w-4 h-4 opacity-0 group-hover/child:opacity-100 -translate-x-2 group-hover/child:translate-x-0 transition-all text-primary" /> : <ArrowRight className="w-4 h-4 opacity-0 group-hover/child:opacity-100 translate-x-2 group-hover/child:translate-x-0 transition-all text-primary" />}
                                </Link>
                              ))}
                            </div>
                          </div>
                          
                          {/* Multiple Banners Container */}
                          {item.imageUrls && item.imageUrls.length > 0 && (
                            <div className="w-[300px] lg:w-[400px] shrink-0 grid gap-4 grid-rows-2">
                              {item.imageUrls.slice(0,2).map((imgUrl, bIdx) => (
                                 <div 
                                   key={bIdx}
                                   className="rounded-2xl overflow-hidden shadow-sm relative group/banner border border-border/40 w-full h-[160px] lg:h-[180px]"
                                 >
                                   <Image src={imgUrl} alt={`Banner ${bIdx + 1}`} fill className="object-cover transition-transform duration-700 group-hover/banner:scale-110" sizes="400px" unoptimized />
                                   <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-6">
                                     <span className="text-white font-bold text-xl drop-shadow-lg flex items-center gap-2">
                                       {t('تسوق الآن', 'Shop Now', 'Achetez maintenant')} 
                                       <span className={cn("transition-transform duration-300", isAr ? "group-hover/banner:-translate-x-2" : "group-hover/banner:translate-x-2")}>→</span>
                                     </span>
                                   </div>
                                 </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}

                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </div>
  );
}
