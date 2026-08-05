'use client';
import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAppStore } from '@/lib/store';
import { Search, ShoppingBag, Star, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

const fmt = (n: number) => `${n.toLocaleString('ar-DZ')} د.ج`;

export default function SearchPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { locale } = useAppStore();
  const isAr = locale === 'ar';
  const t = (ar: string, en: string) => isAr ? ar : en;

  const [inputValue, setInputValue] = useState('');
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [total, setTotal] = useState(0);

  const queryQ = searchParams.get('q') || '';
  const queryCategoryId = searchParams.get('categoryId') || '';

  // Sync input value with URL query when it changes
  useEffect(() => {
    setInputValue(queryQ);
  }, [queryQ]);

  // Fetch products based on search params
  useEffect(() => {
    if (!queryQ.trim() && !queryCategoryId) {
      setProducts([]);
      setTotal(0);
      return;
    }

    setIsLoading(true);
    const params = new URLSearchParams({ limit: '40', status: 'active' });
    if (queryQ.trim()) params.set('q', queryQ.trim());
    if (queryCategoryId) params.set('categoryId', queryCategoryId);

    fetch(`/api/products?${params.toString()}`)
      .then(r => r.json())
      .then(d => {
        setProducts(d.products || []);
        setTotal(d.total || (d.products?.length ?? 0));
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, [queryQ, queryCategoryId]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      router.push(`/search?q=${encodeURIComponent(inputValue.trim())}`);
    } else {
      router.push(`/search`);
    }
  };

  return (
    <div className="container-platform py-8 space-y-6">
      {/* Search Header */}
      <div>
        <h1 className="text-2xl font-black mb-2">
          {queryQ
            ? t(`نتائج البحث: "${queryQ}"`, `Search Results: "${queryQ}"`)
            : queryCategoryId 
            ? t('نتائج التصنيف', 'Category Results')
            : t('البحث', 'Search')}
        </h1>
        {(queryQ || queryCategoryId) && !isLoading && (
          <p className="text-sm text-muted-foreground">
            {t(`${total} نتيجة وجدت`, `${total} results found`)}
          </p>
        )}
      </div>

      {/* Search Input */}
      <form onSubmit={handleSearch} className="flex gap-2 max-w-2xl">
        <div className="relative flex-1">
          <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={inputValue}
            onChange={e => setInputValue(e.target.value)}
            placeholder={t('ابحث عن منتجات، ماركات...', 'Search for products, brands...')}
            className="ps-10 h-11 rounded-xl"
          />
        </div>
        <Button type="submit" className="h-11 px-6">
          {t('بحث', 'Search')}
        </Button>
      </form>

      {/* Results Grid */}
      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-64 rounded-2xl bg-muted animate-pulse" />
          ))}
        </div>
      ) : products.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4">
          {products.map(product => {
            let images: string[] = [];
            try { images = JSON.parse(product.images || '[]'); } catch {}
            const discount = product.comparePrice
              ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)
              : 0;
            return (
              <Card
                key={product.id}
                className="overflow-hidden flex flex-col group hover:shadow-lg transition-all duration-300 cursor-pointer border-border hover:border-primary/30"
                onClick={() => {
                  useAppStore.getState().setSelectedProductId(product.id);
                  router.push(`/products/${product.id}`);
                }}
              >
                <div className="relative aspect-square bg-muted overflow-hidden shrink-0">
                  {images[0] ? (
                    <img
                      src={images[0]}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ShoppingBag className="size-10 text-primary/30" />
                    </div>
                  )}
                  {discount > 0 && (
                    <Badge className="absolute top-2 start-2 bg-red-500 text-white text-xs">
                      -{discount}%
                    </Badge>
                  )}
                </div>
                <CardContent className="p-2.5 md:p-3 flex flex-col grow">
                  <p className="text-[10px] md:text-xs text-muted-foreground mb-1 truncate">
                    {product.category?.name || ''}
                  </p>
                  <p className="text-xs md:text-sm font-semibold line-clamp-2 mb-1.5">
                    {isAr ? product.name : (product.nameEn || product.name)}
                  </p>
                  <div className="flex items-center gap-1 mb-2">
                    {[1, 2, 3, 4, 5].map(s => (
                      <Star
                        key={s}
                        className={`size-3 ${s <= Math.round(product.rating || 0) ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}`}
                      />
                    ))}
                    <span className="text-[10px] text-muted-foreground">({product.soldCount || 0})</span>
                  </div>
                  <div className="mt-auto">
                    <p className="text-sm md:text-base font-bold text-primary">{fmt(product.price)}</p>
                    {product.comparePrice && (
                      <p className="text-[10px] text-muted-foreground line-through">{fmt(product.comparePrice)}</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (queryQ || queryCategoryId) ? (
        <div className="text-center py-20 space-y-4">
          <Search className="size-16 mx-auto text-muted-foreground/30" />
          <p className="text-lg font-semibold">{t('لا توجد نتائج', 'No Results Found')}</p>
          <p className="text-sm text-muted-foreground">
            {queryQ ? t(
              `لم نجد أي منتجات تطابق "${queryQ}"`,
              `We couldn't find any products matching "${queryQ}"`
            ) : t(
              'لا توجد منتجات في هذا التصنيف حالياً',
              'No products found in this category'
            )}
          </p>
          <Button variant="outline" onClick={() => { router.push('/search'); }}>
            {t('مسح البحث', 'Clear Search')}
          </Button>
        </div>
      ) : (
        <div className="text-center py-20">
          <Search className="size-16 mx-auto text-muted-foreground/30 mb-4" />
          <p className="text-muted-foreground">
            {t('ابدأ الكتابة للبحث عن المنتجات', 'Start typing to search for products')}
          </p>
        </div>
      )}
    </div>
  );
}
