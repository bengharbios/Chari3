'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Loader2, Search, Frown } from 'lucide-react';
import { useAppStore } from '@/lib/store';
import ProductCard from './ProductCard';

export default function SearchPage() {
  const { locale } = useAppStore();
  const t = (ar: string, en: string) => locale === 'ar' ? ar : en;
  const searchParams = useSearchParams();
  const query = searchParams?.get('q') || '';
  
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchResults() {
      if (!query) {
        setResults([]);
        setLoading(false);
        return;
      }
      
      setLoading(true);
      try {
        const res = await fetch(`/api/products?q=${encodeURIComponent(query)}&limit=50&status=active`);
        const data = await res.json();
        if (data.products) {
          setResults(data.products);
        } else {
          setResults([]);
        }
      } catch (err) {
        console.error('Failed to search products', err);
        setResults([]);
      } finally {
        setLoading(false);
      }
    }
    
    fetchResults();
  }, [query]);

  return (
    <div className="container mx-auto px-4 py-8 mt-16 min-h-[70vh]">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-navy mb-2">
          {t('نتائج البحث', 'Search Results')}
        </h1>
        <p className="text-muted-foreground flex items-center gap-2">
          <Search className="w-4 h-4" />
          <span>
            {query 
              ? `${t('البحث عن', 'Searching for')} "${query}" (${results.length} ${t('نتيجة', 'results')})` 
              : t('أدخل كلمة للبحث', 'Enter a keyword to search')}
          </span>
        </p>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="w-10 h-10 animate-spin text-brand mb-4" />
          <p className="text-muted-foreground">{t('جاري البحث...', 'Searching...')}</p>
        </div>
      ) : results.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {results.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 bg-background/50 rounded-3xl border border-border/50">
          <div className="w-20 h-20 bg-muted/50 rounded-full flex items-center justify-center mb-6">
            <Frown className="w-10 h-10 text-muted-foreground" />
          </div>
          <h2 className="text-2xl font-bold text-navy mb-2">
            {t('لا توجد نتائج', 'No results found')}
          </h2>
          <p className="text-muted-foreground max-w-md text-center">
            {t('لم نتمكن من العثور على أي منتجات تطابق', 'We could not find any products matching')} "{query}". {t('جرب استخدام كلمات مختلفة.', 'Try using different keywords.')}
          </p>
        </div>
      )}
    </div>
  );
}
