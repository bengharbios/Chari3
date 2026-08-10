'use client';
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAppStore } from '@/lib/store';
import { Search, ShoppingBag, Star, X, SlidersHorizontal, Filter, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetClose } from '@/components/ui/sheet';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Checkbox } from '@/components/ui/checkbox';

const fmt = (n: number) => `${n.toLocaleString('ar-DZ')} د.ج`;

// Debounce hook
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

export default function SearchPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { locale } = useAppStore();
  const isAr = locale === 'ar';
  const t = (ar: string, en: string) => isAr ? ar : en;

  // URL Params state
  const queryQ = searchParams.get('q') || '';
  const queryCategoryId = searchParams.get('categoryId') || '';
  const queryBrands = searchParams.get('brands')?.split(',').filter(Boolean) || [];
  const queryMinPrice = searchParams.get('minPrice') || '';
  const queryMaxPrice = searchParams.get('maxPrice') || '';
  
  // Extract dynamic specs from URL (specs[color]=Red,Blue)
  const querySpecs = useMemo(() => {
    const specs: Record<string, string[]> = {};
    searchParams.forEach((value, key) => {
      if (key.startsWith('specs[') && key.endsWith(']')) {
        const specKey = key.slice(6, -1);
        specs[specKey] = value.split(',').filter(Boolean);
      }
    });
    return specs;
  }, [searchParams]);

  // Local state for UI inputs (before syncing to URL)
  const [inputValue, setInputValue] = useState(queryQ);
  const [localMinPrice, setLocalMinPrice] = useState(queryMinPrice);
  const [localMaxPrice, setLocalMaxPrice] = useState(queryMaxPrice);
  
  // Debounced prices for auto-filtering
  const debouncedMinPrice = useDebounce(localMinPrice, 500);
  const debouncedMaxPrice = useDebounce(localMaxPrice, 500);

  // Data state
  const [products, setProducts] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  const [specDefs, setSpecDefs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFiltersLoading, setIsFiltersLoading] = useState(true);
  const [total, setTotal] = useState(0);

  // Sync basic search input when URL changes
  useEffect(() => {
    setInputValue(queryQ);
  }, [queryQ]);

  // Load Filters Data (Brands & Specs)
  useEffect(() => {
    setIsFiltersLoading(true);
    Promise.all([
      fetch('/api/brands').then(r => r.json()),
      fetch(`/api/specs${queryCategoryId ? `?categoryId=${queryCategoryId}` : ''}`).then(r => r.json())
    ])
    .then(([brandsData, specsData]) => {
      if (brandsData.success) setBrands(brandsData.brands || []);
      if (specsData.success) setSpecDefs(specsData.specs || []);
    })
    .catch(console.error)
    .finally(() => setIsFiltersLoading(false));
  }, [queryCategoryId]);

  // Fetch Products based on URL params
  useEffect(() => {
    // If absolutely no filters are set, we might show empty state or all. We show empty state if q and categoryId are both empty
    if (!queryQ.trim() && !queryCategoryId && queryBrands.length === 0 && Object.keys(querySpecs).length === 0 && !queryMinPrice && !queryMaxPrice) {
      setProducts([]);
      setTotal(0);
      return;
    }

    setIsLoading(true);
    const params = new URLSearchParams({ limit: '40', status: 'active' });
    if (queryQ.trim()) params.set('q', queryQ.trim());
    if (queryCategoryId) params.set('categoryId', queryCategoryId);
    if (queryBrands.length > 0) params.set('brands', queryBrands.join(','));
    if (queryMinPrice) params.set('minPrice', queryMinPrice);
    if (queryMaxPrice) params.set('maxPrice', queryMaxPrice);
    
    Object.entries(querySpecs).forEach(([key, values]) => {
      if (values.length > 0) {
        params.set(`specs[${key}]`, values.join(','));
      }
    });

    fetch(`/api/products?${params.toString()}`)
      .then(r => r.json())
      .then(d => {
        setProducts(d.products || []);
        setTotal(d.total || (d.products?.length ?? 0));
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, [queryQ, queryCategoryId, queryBrands.join(','), JSON.stringify(querySpecs), queryMinPrice, queryMaxPrice]);

  // Handle URL updates
  const updateUrlParams = (updates: Record<string, string | null>) => {
    const current = new URLSearchParams(Array.from(searchParams.entries()));
    Object.entries(updates).forEach(([key, value]) => {
      if (value === null || value === '') {
        current.delete(key);
      } else {
        current.set(key, value);
      }
    });
    router.push(`/search?${current.toString()}`, { scroll: false });
  };

  // Sync debounced prices to URL
  useEffect(() => {
    // Only update if they differ from current URL to prevent loops
    if (debouncedMinPrice !== queryMinPrice || debouncedMaxPrice !== queryMaxPrice) {
      updateUrlParams({
        minPrice: debouncedMinPrice || null,
        maxPrice: debouncedMaxPrice || null
      });
    }
  }, [debouncedMinPrice, debouncedMaxPrice]);

  // Handlers
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateUrlParams({ q: inputValue.trim() || null });
  };

  const toggleBrand = (brandId: string) => {
    const newBrands = queryBrands.includes(brandId)
      ? queryBrands.filter(id => id !== brandId)
      : [...queryBrands, brandId];
    updateUrlParams({ brands: newBrands.length > 0 ? newBrands.join(',') : null });
  };

  const toggleSpec = (specKey: string, optionValue: string) => {
    const currentValues = querySpecs[specKey] || [];
    const newValues = currentValues.includes(optionValue)
      ? currentValues.filter(v => v !== optionValue)
      : [...currentValues, optionValue];
      
    updateUrlParams({ [`specs[${specKey}]`]: newValues.length > 0 ? newValues.join(',') : null });
  };

  const clearAllFilters = () => {
    setLocalMinPrice('');
    setLocalMaxPrice('');
    setInputValue('');
    router.push(queryCategoryId ? `/search?categoryId=${queryCategoryId}` : '/search');
  };

  // Render Sidebar Component
  const renderSidebarFilters = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-lg flex items-center gap-2">
          <Filter className="w-5 h-5" />
          {t('تصفية النتائج', 'Filter Results')}
        </h3>
        {(queryBrands.length > 0 || Object.keys(querySpecs).length > 0 || queryMinPrice || queryMaxPrice) && (
          <Button variant="ghost" size="sm" onClick={clearAllFilters} className="text-destructive h-8 px-2 text-xs">
            <Trash2 className="w-3 h-3 me-1" />
            {t('مسح الكل', 'Clear All')}
          </Button>
        )}
      </div>

      {isFiltersLoading ? (
        <div className="space-y-4">
          <div className="h-20 bg-muted animate-pulse rounded-xl" />
          <div className="h-32 bg-muted animate-pulse rounded-xl" />
          <div className="h-32 bg-muted animate-pulse rounded-xl" />
        </div>
      ) : (
        <Accordion type="multiple" defaultValue={['price', 'brands', ...(specDefs.map(s => `spec-${s.key}`))]} className="w-full space-y-4">
          {/* Price Filter */}
          <AccordionItem value="price" className="border bg-card px-4 rounded-xl shadow-sm">
            <AccordionTrigger className="hover:no-underline py-3">
              <span className="font-semibold text-sm">{t('السعر', 'Price')}</span>
            </AccordionTrigger>
            <AccordionContent className="pt-1 pb-4">
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Input 
                    type="number" 
                    placeholder={t('من', 'Min')} 
                    className="h-9 text-xs" 
                    value={localMinPrice}
                    onChange={(e) => setLocalMinPrice(e.target.value)}
                  />
                </div>
                <span className="text-muted-foreground">-</span>
                <div className="relative flex-1">
                  <Input 
                    type="number" 
                    placeholder={t('إلى', 'Max')} 
                    className="h-9 text-xs"
                    value={localMaxPrice}
                    onChange={(e) => setLocalMaxPrice(e.target.value)}
                  />
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Brands Filter */}
          {brands.length > 0 && (
            <AccordionItem value="brands" className="border bg-card px-4 rounded-xl shadow-sm">
              <AccordionTrigger className="hover:no-underline py-3">
                <span className="font-semibold text-sm">{t('الماركة', 'Brand')}</span>
              </AccordionTrigger>
              <AccordionContent className="pt-1 pb-4">
                <div className="space-y-2.5 max-h-48 overflow-y-auto scrollbar-thin pe-2">
                  {brands.map(brand => (
                    <div key={brand.id} className="flex items-center space-x-2 space-x-reverse">
                      <Checkbox 
                        id={`brand-${brand.id}`} 
                        checked={queryBrands.includes(brand.id)}
                        onCheckedChange={() => toggleBrand(brand.id)}
                        className="rounded-[4px]"
                      />
                      <label htmlFor={`brand-${brand.id}`} className="text-sm font-medium leading-none cursor-pointer">
                        {isAr ? brand.name : (brand.nameEn || brand.name)}
                      </label>
                    </div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          )}

          {/* Dynamic Specs Filters */}
          {specDefs.filter(s => s.type === 'select' && s.options).map(spec => {
            let options: string[] = [];
            try { options = JSON.parse(spec.options); } catch {}
            if (options.length === 0) return null;

            return (
              <AccordionItem key={`spec-${spec.key}`} value={`spec-${spec.key}`} className="border bg-card px-4 rounded-xl shadow-sm">
                <AccordionTrigger className="hover:no-underline py-3">
                  <span className="font-semibold text-sm">{isAr ? spec.labelAr : spec.labelEn}</span>
                </AccordionTrigger>
                <AccordionContent className="pt-1 pb-4">
                  <div className="space-y-2.5 max-h-48 overflow-y-auto scrollbar-thin pe-2">
                    {options.map((opt, i) => {
                      const isChecked = (querySpecs[spec.key] || []).includes(opt);
                      return (
                        <div key={i} className="flex items-center space-x-2 space-x-reverse">
                          <Checkbox 
                            id={`spec-${spec.key}-${i}`} 
                            checked={isChecked}
                            onCheckedChange={() => toggleSpec(spec.key, opt)}
                            className="rounded-[4px]"
                          />
                          <label htmlFor={`spec-${spec.key}-${i}`} className="text-sm font-medium leading-none cursor-pointer">
                            {opt}
                          </label>
                        </div>
                      );
                    })}
                  </div>
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
      )}
    </div>
  );

  return (
    <div className="container-platform py-8">
      
      {/* Search Header */}
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-black mb-2 flex items-center gap-2">
          {queryQ
            ? t(`نتائج البحث: "${queryQ}"`, `Search Results: "${queryQ}"`)
            : queryCategoryId 
            ? t('تصفح التصنيف', 'Browse Category')
            : t('البحث المتقدم', 'Advanced Search')}
        </h1>
        {(queryQ || queryCategoryId || queryBrands.length > 0) && !isLoading && (
          <p className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <span className="inline-flex items-center justify-center bg-primary/10 text-primary px-2.5 py-0.5 rounded-full text-xs font-bold">
              {total}
            </span>
            {t(`نتيجة مطابقة`, `results found`)}
          </p>
        )}
      </div>

      <div className="flex flex-col lg:flex-row gap-8 items-start">
        
        {/* Desktop Sidebar */}
        <div className="hidden lg:block w-72 shrink-0 sticky top-24">
          {renderSidebarFilters()}
        </div>

        {/* Main Content */}
        <div className="flex-1 w-full min-w-0">
          
          {/* Top Bar: Search Input & Mobile Filter Button */}
          <div className="flex items-center gap-3 mb-6">
            <form onSubmit={handleSearchSubmit} className="flex-1 relative">
              <Search className="absolute start-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={inputValue}
                onChange={e => setInputValue(e.target.value)}
                placeholder={t('ابحث عن منتجات، ماركات...', 'Search for products, brands...')}
                className="ps-10 h-12 rounded-xl text-base shadow-sm border-border/60 focus-visible:ring-primary/20 bg-card"
              />
            </form>
            
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" className="lg:hidden h-12 px-4 rounded-xl shadow-sm border-border/60 bg-card gap-2">
                  <SlidersHorizontal className="w-4 h-4" />
                  {t('تصفية', 'Filters')}
                  {(queryBrands.length > 0 || Object.keys(querySpecs).length > 0 || queryMinPrice || queryMaxPrice) && (
                    <span className="w-2 h-2 rounded-full bg-primary absolute top-3 end-3" />
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent side={isAr ? 'right' : 'left'} className="w-[85vw] sm:w-[380px] overflow-y-auto">
                <SheetHeader className="mb-6">
                  <SheetTitle>{t('تصفية النتائج', 'Filter Results')}</SheetTitle>
                </SheetHeader>
                {renderSidebarFilters()}
                <div className="mt-8">
                  <SheetClose asChild>
                    <Button className="w-full h-11 rounded-xl">{t('عرض النتائج', 'Show Results')}</Button>
                  </SheetClose>
                </div>
              </SheetContent>
            </Sheet>
          </div>

          {/* Results Grid */}
          {isLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-5">
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="h-[280px] rounded-2xl bg-muted/60 animate-pulse border border-border/30" />
              ))}
            </div>
          ) : products.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-5">
              {products.map(product => {
                let images: string[] = [];
                try { images = JSON.parse(product.images || '[]'); } catch {}
                const discount = product.comparePrice
                  ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)
                  : 0;
                return (
                  <Card
                    key={product.id}
                    className="overflow-hidden flex flex-col group hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300 cursor-pointer border-border/50 hover:border-primary/40 rounded-[20px] bg-card"
                    onClick={() => {
                      useAppStore.getState().setSelectedProductId(product.id);
                      router.push(`/products/${product.id}`);
                    }}
                  >
                    <div className="relative aspect-square bg-slate-50 dark:bg-slate-900 overflow-hidden shrink-0">
                      {images[0] ? (
                        <img
                          src={images[0]}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ShoppingBag className="size-12 text-muted-foreground/20" />
                        </div>
                      )}
                      {discount > 0 && (
                        <Badge className="absolute top-2 start-2 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full border-0">
                          {t('خصم', 'OFF')} {discount}%
                        </Badge>
                      )}
                    </div>
                    <CardContent className="p-3 md:p-4 flex flex-col grow">
                      <p className="text-[10px] md:text-xs text-muted-foreground mb-1.5 truncate font-medium">
                        {product.category?.name || product.brand?.name || ''}
                      </p>
                      <p className="text-xs md:text-sm font-bold line-clamp-2 mb-2 leading-snug group-hover:text-primary transition-colors">
                        {isAr ? product.name : (product.nameEn || product.name)}
                      </p>
                      <div className="flex items-center gap-1 mb-3 mt-auto">
                        <div className="flex">
                          {[1, 2, 3, 4, 5].map(s => (
                            <Star
                              key={s}
                              className={`size-3 ${s <= Math.round(product.rating || 0) ? 'fill-amber-400 text-amber-400' : 'fill-muted text-muted'}`}
                            />
                          ))}
                        </div>
                        <span className="text-[10px] text-muted-foreground font-medium">({product.reviewCount || 0})</span>
                      </div>
                      <div className="flex items-end justify-between">
                        <div>
                          <p className="text-sm md:text-base font-black text-primary leading-none">{fmt(product.price)}</p>
                          {product.comparePrice && (
                            <p className="text-[10px] md:text-xs text-muted-foreground line-through mt-1">{fmt(product.comparePrice)}</p>
                          )}
                        </div>
                        <div className="w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                          <ShoppingBag className="w-3.5 h-3.5" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (queryQ || queryCategoryId || queryBrands.length > 0 || Object.keys(querySpecs).length > 0) ? (
            <div className="flex flex-col items-center justify-center py-20 px-4 text-center bg-card rounded-[24px] border border-border/50 shadow-sm min-h-[400px]">
              <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mb-6">
                <Search className="size-10 text-muted-foreground/40" />
              </div>
              <h3 className="text-xl font-bold mb-2">{t('عذراً، لم نجد أي نتائج', 'Sorry, no results found')}</h3>
              <p className="text-sm text-muted-foreground max-w-md mb-8">
                {t(
                  'حاول تعديل خيارات الفلترة أو استخدام كلمات بحث مختلفة للحصول على نتائج أفضل.',
                  'Try adjusting your filters or using different search terms to get better results.'
                )}
              </p>
              <Button onClick={clearAllFilters} className="rounded-xl px-8 h-12 shadow-md">
                {t('مسح كافة الفلاتر', 'Clear All Filters')}
              </Button>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-32 px-4 text-center">
              <Search className="size-16 text-muted-foreground/20 mb-6" />
              <p className="text-lg text-muted-foreground font-medium">
                {t('استخدم شريط البحث أو الفلاتر الجانبية لاكتشاف المنتجات', 'Use the search bar or sidebar filters to discover products')}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
