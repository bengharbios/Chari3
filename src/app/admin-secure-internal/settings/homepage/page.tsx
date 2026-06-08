'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useAdminAuthStore } from '@/lib/store/admin-auth';
import { useTranslation } from '@/lib/i18n/useTranslation';
import { 
  Loader2, Save, ArrowRight, Home, LayoutGrid, Pin, Clock, 
  ChevronUp, ChevronDown, Trash, Search, Plus, Eye, EyeOff, Sparkles, CheckCircle2
} from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

interface SectionItem {
  id: string;
  nameAr: string;
  nameEn: string;
  visible: boolean;
}

export default function AdminHomepageManager() {
  const { isAdminAuthenticated, adminUser } = useAdminAuthStore();
  const { locale } = useTranslation();
  const dir = locale === 'ar' ? 'rtl' : 'ltr';
  const isAr = locale === 'ar';

  const getAdminPath = (subPath: string = '') => {
    if (typeof window === 'undefined') return '/super-admin';
    const segments = window.location.pathname.split('/');
    const baseSlug = segments[1] || 'super-admin';
    return subPath === '' ? `/${baseSlug}` : `/${baseSlug}/${subPath}`;
  };

  const t = (ar: string, en: string) => (isAr ? ar : en);

  const fmt = (amount: number) => {
    return `${amount.toLocaleString(locale === 'ar' ? 'ar-DZ' : 'en-US')} ${t('د.ج', 'DZD')}`;
  };

  const [isMounted, setIsMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<'layout' | 'pinning' | 'timer' | 'slides'>('layout');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Hero slides state
  const [heroSlides, setHeroSlides] = useState<any[]>([]);
  const [editingSlideIndex, setEditingSlideIndex] = useState<number | null>(null);
  const [editSlideData, setEditSlideData] = useState<any>({
    title: '',
    titleEn: '',
    titleFr: '',
    subtitle: '',
    subtitleEn: '',
    subtitleFr: '',
    bg: 'from-blue-950 via-indigo-900 to-slate-900',
    badge: '',
    badgeFr: '',
    cta: 'تسوق الآن',
    ctaFr: '',
    linkUrl: '',
  });

  const handleStartAddSlide = () => {
    setEditSlideData({
      title: '',
      titleEn: '',
      titleFr: '',
      subtitle: '',
      subtitleEn: '',
      subtitleFr: '',
      bg: 'from-blue-950 via-indigo-900 to-slate-900',
      badge: '',
      badgeFr: '',
      cta: 'تسوق الآن',
      ctaFr: '',
      linkUrl: '',
    });
    setEditingSlideIndex(heroSlides.length);
  };

  const handleStartEditSlide = (index: number) => {
    const slide = heroSlides[index];
    setEditSlideData({
      title: slide.title || '',
      titleEn: slide.titleEn || '',
      titleFr: slide.titleFr || '',
      subtitle: slide.subtitle || '',
      subtitleEn: slide.subtitleEn || '',
      subtitleFr: slide.subtitleFr || '',
      bg: slide.bg || 'from-blue-950 via-indigo-900 to-slate-900',
      badge: slide.badge || '',
      badgeFr: slide.badgeFr || '',
      cta: slide.cta || 'تسوق الآن',
      ctaFr: slide.ctaFr || '',
      linkUrl: slide.linkUrl || '',
    });
    setEditingSlideIndex(index);
  };

  const handleSaveSlide = () => {
    if (editingSlideIndex === null) return;
    const updated = [...heroSlides];
    if (editingSlideIndex === heroSlides.length) {
      updated.push({ ...editSlideData, id: String(Date.now()) });
    } else {
      updated[editingSlideIndex] = { ...updated[editingSlideIndex], ...editSlideData };
    }
    setHeroSlides(updated);
    setEditingSlideIndex(null);
    toast.success(t('تم تحديث السلايد مؤقتاً، اضغط حفظ في الأسفل لتأكيد الحفظ بالداتابيز', 'Slide updated locally. Press save below to confirm.'));
  };

  const handleDeleteSlide = (index: number) => {
    const updated = heroSlides.filter((_, i) => i !== index);
    setHeroSlides(updated);
    if (editingSlideIndex === index) {
      setEditingSlideIndex(null);
    } else if (editingSlideIndex !== null && editingSlideIndex > index) {
      setEditingSlideIndex(editingSlideIndex - 1);
    }
    toast.success(t('تم حذف السلايد مؤقتاً', 'Slide removed locally'));
  };

  const moveSlide = (index: number, direction: 'up' | 'down') => {
    const nextIndex = direction === 'up' ? index - 1 : index + 1;
    if (nextIndex < 0 || nextIndex >= heroSlides.length) return;
    const updated = [...heroSlides];
    const temp = updated[index];
    updated[index] = updated[nextIndex]!;
    updated[nextIndex] = temp!;
    setHeroSlides(updated);
    if (editingSlideIndex === index) {
      setEditingSlideIndex(nextIndex);
    } else if (editingSlideIndex === nextIndex) {
      setEditingSlideIndex(index);
    }
  };

  // Layout state
  const [layout, setLayout] = useState<SectionItem[]>([]);

  // Pinned items state
  const [pinned, setPinned] = useState<{
    products: any[];
    stores: any[];
    sellers: any[];
  }>({ products: [], stores: [], sellers: [] });

  // Countdown state
  const [countdown, setCountdown] = useState({
    enabled: false,
    endDate: '',
    titleAr: '',
    titleEn: '',
  });

  // Searching state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searchType, setSearchType] = useState<'product' | 'store' | 'seller'>('product');
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMounted && !isAdminAuthenticated) {
      const currentPath = window.location.pathname.replace('/settings/homepage', '');
      window.location.href = `${currentPath}/login`;
    }
  }, [isMounted, isAdminAuthenticated]);

  const fetchHomepageConfig = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/homepage');
      const d = await res.json();
      if (d.success) {
        // Map layout keys to translations
        const sectionNames: Record<string, { ar: string; en: string }> = {
          hero: { ar: 'البانر الترويجي الرئيسي (Slides)', en: 'Hero Promotion Slides' },
          features: { ar: 'شريط الميزات والضمانات', en: 'Platform Features & Guarantees' },
          categories: { ar: 'أيقونات التصنيفات الدائرية', en: 'Circular Categories Icons' },
          bento_offers: { ar: 'شبكة عروض ميجا والمكعبات الترويجية (Noon Bento)', en: 'Mega Offers & Bento Grid' },
          featured_products: { ar: 'شبكة المنتجات المتميزة', en: 'Featured Products Grid' },
          top_sellers: { ar: 'سلايدر المتاجر الكبرى والتجار الموثقين', en: 'Top Stores & Verified Sellers' },
          testimonials: { ar: 'آراء وتقييمات العملاء', en: 'Customer Testimonials' },
          cta: { ar: 'لوحة دعوة التجار للتسجيل (CTA)', en: 'Seller Invitation Panel' }
        };

        const mappedLayout = (d.layout || []).map((sect: any) => {
          const id = typeof sect === 'string' ? sect : sect.id;
          const visible = typeof sect === 'string' ? true : sect.visible !== false;
          return {
            id,
            nameAr: sectionNames[id]?.ar || id,
            nameEn: sectionNames[id]?.en || id,
            visible,
          };
        });
        setLayout(mappedLayout);

        // Fetch detailed pinned lists
        setPinned({
          products: d.pinned?.products || [],
          stores: d.pinned?.stores || [],
          sellers: d.pinned?.sellers || [],
        });

        setCountdown({
          enabled: d.countdown?.enabled || false,
          endDate: d.countdown?.endDate ? d.countdown.endDate.substring(0, 16) : '',
          titleAr: d.countdown?.titleAr || '',
          titleEn: d.countdown?.titleEn || '',
        });

        setHeroSlides(d.heroSlides || []);
      }
    } catch (err) {
      console.error('Failed to load configs', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isMounted && isAdminAuthenticated) {
      fetchHomepageConfig();
    }
  }, [isMounted, isAdminAuthenticated, fetchHomepageConfig]);

  // Handle Search for Pinning
  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    try {
      let url = '';
      if (searchType === 'product') {
        url = `/api/products?q=${encodeURIComponent(searchQuery)}&limit=10`;
      } else if (searchType === 'store') {
        url = `/api/stores?q=${encodeURIComponent(searchQuery)}`;
      } else {
        url = `/api/sellers?q=${encodeURIComponent(searchQuery)}`;
      }
      
      const res = await fetch(url);
      const d = await res.json();
      if (searchType === 'product') {
        setSearchResults(d.products || []);
      } else if (searchType === 'store') {
        setSearchResults(d.stores || []);
      } else {
        setSearchResults(d.sellers || []);
      }
    } catch {
      toast.error(t('فشل البحث', 'Failed to search items'));
    } finally {
      setIsSearching(false);
    }
  };

  const handlePinItem = (item: any) => {
    const listKey = searchType === 'product' ? 'products' : searchType === 'store' ? 'stores' : 'sellers';
    const currentList = pinned[listKey];

    if (currentList.some((i: any) => i.id === item.id)) {
      toast.error(t('هذا العنصر مثبت بالفعل!', 'This item is already pinned!'));
      return;
    }

    const newItem = {
      id: item.id,
      name: item.name || item.storeName || item.title || item.user?.name || '',
      price: item.price || 0,
      image: item.logo || item.user?.avatar || (Array.isArray(item.images) ? item.images[0] : null) || ''
    };

    setPinned(prev => ({
      ...prev,
      [listKey]: [...prev[listKey], newItem]
    }));
    toast.success(t('تم تثبيت العنصر بنجاح', 'Item pinned successfully'));
  };

  const handleUnpinItem = (id: string, type: 'products' | 'stores' | 'sellers') => {
    setPinned(prev => ({
      ...prev,
      [type]: prev[type].filter((i: any) => i.id !== id)
    }));
  };

  // Section Layout order changes
  const moveSection = (index: number, direction: 'up' | 'down') => {
    const nextIndex = direction === 'up' ? index - 1 : index + 1;
    if (nextIndex < 0 || nextIndex >= layout.length) return;

    const updated = [...layout];
    const temp = updated[index];
    updated[index] = updated[nextIndex];
    updated[nextIndex] = temp!;
    setLayout(updated);
  };

  const toggleSectionVisibility = (index: number) => {
    const updated = [...layout];
    updated[index]!.visible = !updated[index]!.visible;
    setLayout(updated);
  };

  // Save Settings
  const handleSave = async () => {
    setIsSaving(true);
    try {
      const payload = {
        layout: layout.map(sect => ({ id: sect.id, visible: sect.visible })),
        pinned: {
          products: pinned.products.map((p, idx) => ({ id: p.id, order: idx + 1, name: p.name, price: p.price, image: p.image })),
          stores: pinned.stores.map((s, idx) => ({ id: s.id, order: idx + 1, name: s.name, image: s.image })),
          sellers: pinned.sellers.map((s, idx) => ({ id: s.id, order: idx + 1, name: s.name, image: s.image })),
        },
        countdown: {
          enabled: countdown.enabled,
          endDate: countdown.endDate ? new Date(countdown.endDate).toISOString() : '',
          titleAr: countdown.titleAr,
          titleEn: countdown.titleEn,
        },
        heroSlides,
      };

      const res = await fetch('/api/admin/homepage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const d = await res.json();
      if (d.success) {
        toast.success(t('تم حفظ إعدادات الصفحة الرئيسية بنجاح', 'Homepage settings saved successfully'), {
          icon: <CheckCircle2 className="text-emerald-500 w-5 h-5" />
        });
      } else {
        throw new Error(d.error);
      }
    } catch (err: any) {
      toast.error(t('فشل حفظ التعديلات', 'Failed to save changes'));
    } finally {
      setIsSaving(false);
    }
  };

  if (!isMounted || !isAdminAuthenticated) return null;

  return (
    <div dir={dir} className="max-w-[1750px] mx-auto p-4 sm:p-6 lg:p-8 space-y-6 text-start font-cairo">
      <div className="flex items-center gap-4 mb-6">
        <Link href={getAdminPath('/settings')}>
          <Button variant="outline" size="icon" className="rounded-full">
            <ArrowRight className={`h-5 w-5 ${locale === 'ar' ? '' : 'rotate-180'}`} />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-black text-foreground flex items-center gap-2">
            <Home className="h-6 w-6 text-brand" />
            {t('إدارة وتصميم الصفحة الرئيسية', 'Homepage Manager & Designer')}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {t('تحكم في هيكل الصفحة الرئيسية، تثبيت المنتجات، وتفعيل عروض ميجا التنازلية', 'Control homepage layout, pin entities, and adjust Mega countdown deals')}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap p-1 bg-muted/50 rounded-2xl border max-w-2xl gap-1 select-none w-fit">
        <button onClick={() => setActiveTab('layout')} className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs md:text-sm font-bold transition-all ${activeTab === 'layout' ? 'bg-white text-slate-950 shadow' : 'text-muted-foreground hover:text-foreground'}`}>
          <LayoutGrid className="w-4 h-4" />
          {t('ترتيب الأقسام', 'Sections Layout')}
        </button>
        <button onClick={() => setActiveTab('pinning')} className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs md:text-sm font-bold transition-all ${activeTab === 'pinning' ? 'bg-white text-slate-950 shadow' : 'text-muted-foreground hover:text-foreground'}`}>
          <Pin className="w-4 h-4" />
          {t('التثبيت والترتيب اليدوي', 'Manual Pinning')}
        </button>
        <button onClick={() => setActiveTab('timer')} className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs md:text-sm font-bold transition-all ${activeTab === 'timer' ? 'bg-white text-slate-950 shadow' : 'text-muted-foreground hover:text-foreground'}`}>
          <Clock className="w-4 h-4" />
          {t('عداد العروض التنازلية', 'Countdown Timer')}
        </button>
        <button onClick={() => setActiveTab('slides')} className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs md:text-sm font-bold transition-all ${activeTab === 'slides' ? 'bg-white text-slate-950 shadow' : 'text-muted-foreground hover:text-foreground'}`}>
          <Sparkles className="w-4 h-4" />
          {t('سلايدر البانر الرئيسي', 'Hero Slides')}
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center p-12">
          <Loader2 className="h-8 w-8 animate-spin text-brand" />
        </div>
      ) : (
        <div className="space-y-6">
          {/* Layout Tab */}
          {activeTab === 'layout' && (
            <Card className="card-surface rounded-[24px]">
              <CardHeader>
                <CardTitle className="text-lg font-bold">{t('هيكل وترتيب أقسام الصفحة الرئيسية', 'Homepage Section Order')}</CardTitle>
                <CardDescription>
                  {t('اسحب أو استخدم الأسهم لتغيير ترتيب ظهور الأقسام، واضغط على أيقونة العين لإخفاء/إظهار أي قسم.', 'Adjust the ordering indexes of sections and toggle visibility flags.')}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="border border-border/80 rounded-[20px] divide-y overflow-hidden bg-background">
                  {layout.map((sect, idx) => (
                    <div key={sect.id} className={`flex items-center justify-between p-4 transition-colors ${sect.visible ? 'bg-background' : 'bg-muted/30 opacity-70'}`}>
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-xs text-muted-foreground w-6">#{idx + 1}</span>
                        <div className="font-bold text-sm">
                          {isAr ? sect.nameAr : sect.nameEn}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" disabled={idx === 0} onClick={() => moveSection(idx, 'up')} className="rounded-full">
                          <ChevronUp className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" disabled={idx === layout.length - 1} onClick={() => moveSection(idx, 'down')} className="rounded-full">
                          <ChevronDown className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="icon" onClick={() => toggleSectionVisibility(idx)} className="rounded-full">
                          {sect.visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4 text-destructive" />}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex justify-end pt-4">
                  <Button onClick={handleSave} disabled={isSaving} className="font-bold gap-2 rounded-xl">
                    {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                    {t('حفظ التعديلات', 'Save Layout Changes')}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Pinning Tab */}
          {activeTab === 'pinning' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column: Search & Add */}
              <Card className="lg:col-span-5 card-surface rounded-[24px]">
                <CardHeader>
                  <CardTitle className="text-lg font-bold">{t('ابحث وثبّت العناصر', 'Search & Pin Items')}</CardTitle>
                  <CardDescription>
                    {t('ابحث في المنصة لإضافة عناصر محددة إلى قوائم الصفحة الرئيسية.', 'Find items to pin on the storefront homepage.')}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-2 mb-3 select-none">
                    <button onClick={() => { setSearchType('product'); setSearchResults([]); }} className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${searchType === 'product' ? 'bg-brand text-slate-950' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}>
                      🛒 {t('منتجات', 'Products')}
                    </button>
                    <button onClick={() => { setSearchType('store'); setSearchResults([]); }} className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${searchType === 'store' ? 'bg-brand text-slate-950' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}>
                      🏪 {t('متاجر كبرى', 'Premium Stores')}
                    </button>
                    <button onClick={() => { setSearchType('seller'); setSearchResults([]); }} className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${searchType === 'seller' ? 'bg-brand text-slate-950' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}>
                      👤 {t('تجار أحرار', 'Freelance Sellers')}
                    </button>
                  </div>
                  <div className="flex gap-2">
                    <Input
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      placeholder={t('اكتب للبحث هنا...', 'Type search query here...')}
                      className="rounded-xl"
                      onKeyDown={e => e.key === 'Enter' && handleSearch()}
                    />
                    <Button onClick={handleSearch} disabled={isSearching} className="rounded-xl shrink-0 gap-1 font-bold">
                      {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                      {t('بحث', 'Search')}
                    </Button>
                  </div>

                  <div className="border border-border/80 rounded-[20px] bg-background max-h-[340px] overflow-y-auto divide-y">
                    {searchResults.length === 0 ? (
                      <p className="text-center py-8 text-xs text-muted-foreground">{t('اكتب كلمة بحث واضغط زر البحث للبدء', 'Search to fetch items')}</p>
                    ) : (
                      searchResults.map((item: any) => {
                        const name = item.name || item.storeName || item.title || item.user?.name || '';
                        return (
                          <div key={item.id} className="flex items-center justify-between p-3">
                            <div className="min-w-0">
                              <p className="text-xs font-bold truncate">{name}</p>
                              {item.price && <p className="text-[10px] text-amber-500 font-bold mt-0.5">{fmt(item.price)}</p>}
                            </div>
                            <Button size="sm" variant="ghost" onClick={() => handlePinItem(item)} className="rounded-full text-emerald-500 hover:text-emerald-600">
                              <Plus className="w-4 h-4" />
                            </Button>
                          </div>
                        );
                      })
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Right Column: Manage Pinned lists */}
              <Card className="lg:col-span-7 card-surface rounded-[24px]">
                <CardHeader>
                  <CardTitle className="text-lg font-bold flex items-center gap-1.5">
                    <Pin className="w-5 h-5 text-brand" />
                    {t('العناصر المثبتة حالياً', 'Pinned Items')}
                  </CardTitle>
                  <CardDescription>
                    {t('قم بترتيب العناصر يدوياً أو حذفها لإعطاء الأولوية لهذه العناصر.', 'Pin order matches displays priority.')}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-4">
                    {['products', 'stores', 'sellers'].map((type) => {
                      const list = pinned[type as 'products' | 'stores' | 'sellers'] || [];
                      const typeLabel = type === 'products' ? t('المنتجات المثبتة', 'Pinned Products') : type === 'stores' ? t('المتاجر المثبتة', 'Pinned Stores') : t('التجار المستقلين المثبتين', 'Pinned Sellers');
                      return (
                        <div key={type} className="space-y-2">
                          <Label className="text-xs font-black text-slate-500 uppercase tracking-wider">{typeLabel}</Label>
                          {list.length === 0 ? (
                            <div className="p-4 border border-dashed rounded-xl text-center text-xs text-muted-foreground">{t('لا توجد عناصر مثبتة حالياً', 'No items pinned yet')}</div>
                          ) : (
                            <div className="border border-border/80 rounded-xl divide-y bg-background max-h-[220px] overflow-y-auto">
                              {list.map((item: any, idx: number) => (
                                <div key={item.id} className="flex items-center justify-between p-2.5">
                                  <div className="flex items-center gap-2.5 min-w-0">
                                    <span className="font-mono text-[10px] text-muted-foreground">#{idx + 1}</span>
                                    <p className="text-xs font-bold truncate text-slate-800 dark:text-slate-100">{item.name}</p>
                                  </div>
                                  <Button size="icon" variant="ghost" className="text-destructive rounded-full" onClick={() => handleUnpinItem(item.id, type as any)}>
                                    <Trash className="w-4 h-4" />
                                  </Button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                  <div className="flex justify-end pt-4 border-t border-border/60">
                    <Button onClick={handleSave} disabled={isSaving} className="font-bold gap-2 rounded-xl">
                      {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                      {t('حفظ التثبيت اليدوي', 'Save Pinned Items')}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Timer Tab */}
          {activeTab === 'timer' && (
            <Card className="card-surface rounded-[24px] max-w-2xl mx-auto">
              <CardHeader>
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                  <Clock className="w-5 h-5 text-brand" />
                  {t('إعدادات عروض ميجا التنازلية', 'Mega Countdown Deals settings')}
                </CardTitle>
                <CardDescription>
                  {t('قم بتفعيل عداد تنازلي نشط على الصفحة الرئيسية لعرض حملات الخصم الكبرى.', 'Toggle countdown deal settings showing target date.')}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-2xl border border-border bg-background mb-4">
                  <div className="space-y-0.5">
                    <Label htmlFor="timer_enabled" className="text-sm font-bold">{t('حالة العداد التنازلي الترويجي', 'Countdown timer status')}</Label>
                    <p className="text-xs text-muted-foreground">{t('تفعيل عداد تنازلي يعرض عروض الخصومات الكبرى', 'Enable countdown banner detailing hours/minutes/seconds')}</p>
                  </div>
                  <select
                    id="timer_enabled"
                    value={countdown.enabled ? 'true' : 'false'}
                    onChange={(e) => setCountdown(prev => ({ ...prev, enabled: e.target.value === 'true' }))}
                    className="bg-background border border-border text-foreground px-3 py-1.5 rounded-xl text-xs font-bold"
                  >
                    <option value="true">{t('نشط (يظهر العداد في الصفحة)', 'Active')}</option>
                    <option value="false">{t('معطل (إخفاء العداد بالكامل)', 'Disabled')}</option>
                  </select>
                </div>

                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="titleAr" className="text-xs font-bold">{t('عنوان الحملة بالعربية', 'Campaign Title (Arabic)')}</Label>
                      <Input
                        id="titleAr"
                        value={countdown.titleAr}
                        onChange={e => setCountdown(prev => ({ ...prev, titleAr: e.target.value }))}
                        className="rounded-xl text-sm"
                        placeholder="عروض ميجا"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="titleEn" className="text-xs font-bold">{t('عنوان الحملة بالإنجليزية', 'Campaign Title (English)')}</Label>
                      <Input
                        id="titleEn"
                        value={countdown.titleEn}
                        onChange={e => setCountdown(prev => ({ ...prev, titleEn: e.target.value }))}
                        className="rounded-xl text-sm"
                        placeholder="Mega Offers"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="endDate" className="text-xs font-bold">{t('تاريخ ووقت انتهاء الحملة', 'Campaign End Date & Time')}</Label>
                    <Input
                      id="endDate"
                      type="datetime-local"
                      value={countdown.endDate}
                      onChange={e => setCountdown(prev => ({ ...prev, endDate: e.target.value }))}
                      className="rounded-xl text-sm font-mono"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-4 border-t border-border/60">
                  <Button onClick={handleSave} disabled={isSaving} className="font-bold gap-2 rounded-xl">
                    {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                    {t('حفظ إعدادات العداد', 'Save Timer Settings')}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Slides Tab */}
          {activeTab === 'slides' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left side: Slides List & Order */}
              <Card className="lg:col-span-5 card-surface rounded-[24px]">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <div>
                    <CardTitle className="text-lg font-bold">{t('سلايدر البانر الترويجي', 'Hero Slider Manager')}</CardTitle>
                    <CardDescription>
                      {t('أضف ورتب السلايدات المعروضة في البانر الرئيسي.', 'Manage and reorder slides on the main home banner.')}
                    </CardDescription>
                  </div>
                  <Button size="sm" onClick={handleStartAddSlide} className="rounded-xl font-bold gap-1">
                    <Plus className="w-4 h-4" />
                    {t('إضافة سلايد', 'Add Slide')}
                  </Button>
                </CardHeader>
                <CardContent className="space-y-4">
                  {heroSlides.length === 0 ? (
                    <div className="p-8 border border-dashed rounded-2xl text-center text-sm text-muted-foreground">
                      <Sparkles className="w-8 h-8 mx-auto mb-2 opacity-35 text-amber-500 animate-pulse" />
                      {t('لا توجد سلايدات مخصصة حالياً. سيتم استخدام السلايدات الافتراضية.', 'No slides added yet. Storefront will display fallback defaults.')}
                    </div>
                  ) : (
                    <div className="border border-border/80 rounded-[20px] divide-y overflow-hidden bg-background">
                      {heroSlides.map((s, idx) => (
                        <div key={s.id || idx} className={`flex items-center justify-between p-4 transition-colors ${editingSlideIndex === idx ? 'bg-muted/40 border-l-4 border-l-brand' : 'bg-background'}`}>
                          <div className="min-w-0 flex items-center gap-3">
                            <span className="font-mono text-xs text-muted-foreground">#{idx + 1}</span>
                            <div className="min-w-0">
                              <p className="font-bold text-sm truncate">{isAr ? s.title : (s.titleEn || s.title || t('بلا عنوان', 'Untitled'))}</p>
                              <div className="flex items-center gap-1.5 mt-1">
                                <div className={`w-3.5 h-3.5 rounded bg-gradient-to-br ${s.bg || 'from-blue-950 to-slate-900'} border border-white/10`} />
                                <span className="text-[10px] text-muted-foreground font-mono truncate max-w-[120px]">{s.bg}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            <Button variant="ghost" size="icon" disabled={idx === 0} onClick={() => moveSlide(idx, 'up')} className="rounded-full h-8 w-8">
                              <ChevronUp className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="icon" disabled={idx === heroSlides.length - 1} onClick={() => moveSlide(idx, 'down')} className="rounded-full h-8 w-8">
                              <ChevronDown className="w-4 h-4" />
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => handleStartEditSlide(idx)} className="rounded-xl text-xs px-2.5 h-8">
                              {t('تعديل', 'Edit')}
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleDeleteSlide(idx)} className="rounded-full text-destructive h-8 w-8 hover:bg-destructive/10">
                              <Trash className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex justify-end pt-4 border-t border-border/60">
                    <Button onClick={handleSave} disabled={isSaving} className="font-bold gap-2 rounded-xl">
                      {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                      {t('حفظ السلايدات بالداتابيز', 'Save Banner Configuration')}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Right side: Add / Edit Form */}
              <Card className="lg:col-span-7 card-surface rounded-[24px]">
                <CardHeader>
                  <CardTitle className="text-lg font-bold flex items-center gap-1.5">
                    <Sparkles className="w-5 h-5 text-brand" />
                    {editingSlideIndex !== null
                      ? editingSlideIndex === heroSlides.length
                        ? t('إضافة سلايد ترويجي جديد', 'Add New Promotion Slide')
                        : `${t('تعديل السلايد', 'Edit Slide')} #${editingSlideIndex + 1}`
                      : t('اختر سلايد لتعديله أو أضف جديداً', 'Select a slide or add one')}
                  </CardTitle>
                  <CardDescription>
                    {editingSlideIndex !== null
                      ? t('املأ الحقول التالية لتخصيص محتوى السلايد. يدعم العربية والإنجليزية والفرنسية.', 'Provide content parameters for the selected hero slide.')
                      : t('اضغط على "تعديل" بجانب أي سلايد أو "إضافة سلايد" للبدء.', 'Click edit or add to initialize form fields.')}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {editingSlideIndex === null ? (
                    <div className="flex flex-col items-center justify-center py-20 text-muted-foreground border border-dashed rounded-[20px] bg-background">
                      <Sparkles className="w-12 h-12 text-slate-300 dark:text-slate-700 mb-3" />
                      <p className="text-sm font-medium">{t('لم يتم اختيار أي سلايد لتعديله', 'No slide selected for editing')}</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {/* Live preview */}
                      <div className="border border-border/80 rounded-[20px] overflow-hidden p-6 bg-slate-950 text-white relative">
                        <div className={`absolute inset-0 bg-gradient-to-br ${editSlideData.bg || 'from-blue-950 to-slate-900'} opacity-90`} />
                        <div className="relative z-10 space-y-3 text-start">
                          {editSlideData.badge && (
                            <Badge className="bg-white/10 text-white border-white/10 text-[10px]">
                              {editSlideData.badge}
                            </Badge>
                          )}
                          <h4 className="text-xl font-black">{editSlideData.title || t('عنوان السلايد الرئيسي', 'Slide Title')}</h4>
                          <p className="text-xs text-white/70 max-w-md">{editSlideData.subtitle || t('العنوان الفرعي للسلايد أو وصف العرض الترويجي المتاح للمشترين', 'Slide Subtitle or promotion description')}</p>
                          <Button size="sm" className="bg-amber-500 text-slate-950 font-black rounded-lg pointer-events-none mt-2">
                            {editSlideData.cta || t('تسوق الآن', 'Shop Now')}
                          </Button>
                        </div>
                        <span className="absolute bottom-2 end-3 text-[9px] font-mono text-white/40 tracking-wider uppercase select-none">{t('معاينة حية', 'Live Preview')}</span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label className="text-xs font-bold">{t('العنوان الرئيسي (العربية)', 'Title (Arabic)')}</Label>
                          <Input
                            value={editSlideData.title}
                            onChange={e => setEditSlideData(prev => ({ ...prev, title: e.target.value }))}
                            className="rounded-xl text-sm"
                            placeholder="تسوق بثقة"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-xs font-bold">{t('العنوان الرئيسي (الإنجليزية)', 'Title (English)')}</Label>
                          <Input
                            value={editSlideData.titleEn}
                            onChange={e => setEditSlideData(prev => ({ ...prev, titleEn: e.target.value }))}
                            className="rounded-xl text-sm"
                            placeholder="Shop with Confidence"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-xs font-bold">{t('العنوان الرئيسي (الفرنسية)', 'Title (French)')}</Label>
                          <Input
                            value={editSlideData.titleFr}
                            onChange={e => setEditSlideData(prev => ({ ...prev, titleFr: e.target.value }))}
                            className="rounded-xl text-sm"
                            placeholder="Achetez en toute confiance"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label className="text-xs font-bold">{t('الوصف/العنوان الفرعي (العربية)', 'Subtitle (Arabic)')}</Label>
                          <Input
                            value={editSlideData.subtitle}
                            onChange={e => setEditSlideData(prev => ({ ...prev, subtitle: e.target.value }))}
                            className="rounded-xl text-sm"
                            placeholder="آلاف المنتجات من تجار موثوقين"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-xs font-bold">{t('الوصف/العنوان الفرعي (الإنجليزية)', 'Subtitle (English)')}</Label>
                          <Input
                            value={editSlideData.subtitleEn}
                            onChange={e => setEditSlideData(prev => ({ ...prev, subtitleEn: e.target.value }))}
                            className="rounded-xl text-sm"
                            placeholder="Thousands of products from verified sellers"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-xs font-bold">{t('الوصف/العنوان الفرعي (الفرنسية)', 'Subtitle (French)')}</Label>
                          <Input
                            value={editSlideData.subtitleFr}
                            onChange={e => setEditSlideData(prev => ({ ...prev, subtitleFr: e.target.value }))}
                            className="rounded-xl text-sm"
                            placeholder="Des milliers de produits de vendeurs vérifiés"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-xs font-bold">{t('شارة مميزة (العربية)', 'Badge text (Arabic)')}</Label>
                          <Input
                            value={editSlideData.badge}
                            onChange={e => setEditSlideData(prev => ({ ...prev, badge: e.target.value }))}
                            className="rounded-xl text-sm"
                            placeholder="🔥 عروض حصرية"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-xs font-bold">{t('شارة مميزة (الفرنسية)', 'Badge text (French)')}</Label>
                          <Input
                            value={editSlideData.badgeFr}
                            onChange={e => setEditSlideData(prev => ({ ...prev, badgeFr: e.target.value }))}
                            className="rounded-xl text-sm"
                            placeholder="🔥 Offres exclusives"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-xs font-bold">{t('نص زر الشراء/الدعوة (العربية)', 'CTA Text (Arabic)')}</Label>
                          <Input
                            value={editSlideData.cta}
                            onChange={e => setEditSlideData(prev => ({ ...prev, cta: e.target.value }))}
                            className="rounded-xl text-sm"
                            placeholder="تسوق الآن"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-xs font-bold">{t('نص زر الشراء/الدعوة (الفرنسية)', 'CTA Text (French)')}</Label>
                          <Input
                            value={editSlideData.ctaFr}
                            onChange={e => setEditSlideData(prev => ({ ...prev, ctaFr: e.target.value }))}
                            className="rounded-xl text-sm"
                            placeholder="Acheter maintenant"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-xs font-bold">{t('رابط التوجيه المباشر (Link URL)', 'CTA Target Link URL')}</Label>
                        <Input
                          value={editSlideData.linkUrl}
                          onChange={e => setEditSlideData(prev => ({ ...prev, linkUrl: e.target.value }))}
                          className="rounded-xl text-sm font-mono text-start"
                          placeholder="/search?categoryId=optics-id"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="text-xs font-bold">{t('الخلفية المتدرجة (Gradient Background CSS Class)', 'Gradient Background CSS')}</Label>
                        <Input
                          value={editSlideData.bg}
                          onChange={e => setEditSlideData(prev => ({ ...prev, bg: e.target.value }))}
                          className="rounded-xl text-sm font-mono mb-2 text-start"
                          placeholder="from-blue-950 via-indigo-900 to-slate-900"
                        />
                        <div className="flex flex-wrap gap-2 select-none">
                          {[
                            { name: t('كحلي داكن', 'Navy Dark'), val: 'from-blue-950 via-indigo-900 to-slate-900' },
                            { name: t('زمردي زيتي', 'Emerald Teal'), val: 'from-emerald-950 via-teal-900 to-slate-900' },
                            { name: t('بنفسجي ملكي', 'Royal Purple'), val: 'from-purple-950 via-violet-900 to-slate-900' },
                            { name: t('غروب الشمس', 'Sunset Amber'), val: 'from-orange-950 via-amber-900 to-slate-900' },
                            { name: t('أحمر ياقوتي', 'Ruby Rose'), val: 'from-rose-950 via-red-900 to-slate-900' },
                            { name: t('وردي مستقبلي', 'Cyberpunk Pink'), val: 'from-pink-950 via-purple-900 to-slate-900' }
                          ].map(grad => (
                            <button
                              key={grad.val}
                              onClick={() => setEditSlideData(prev => ({ ...prev, bg: grad.val }))}
                              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold border ${editSlideData.bg === grad.val ? 'border-brand bg-brand/10 text-slate-900 dark:text-slate-100' : 'border-border bg-background text-muted-foreground hover:text-foreground'}`}
                            >
                              <div className={`w-3.5 h-3.5 rounded-full bg-gradient-to-br ${grad.val}`} />
                              {grad.name}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="flex justify-end gap-2 pt-4 border-t border-border/60">
                        <Button variant="ghost" onClick={() => setEditingSlideIndex(null)} className="rounded-xl text-xs font-bold">
                          {t('إلغاء', 'Cancel')}
                        </Button>
                        <Button onClick={handleSaveSlide} className="rounded-xl text-xs font-bold gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          {t('تأكيد السلايد وتحديث اللائحة', 'Confirm & Update list')}
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
