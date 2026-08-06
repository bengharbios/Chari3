'use client';

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useAdminAuthStore } from '@/lib/store/admin-auth';
import { useTranslationStore } from '@/lib/store/translation-store';
import { useTranslation } from '@/lib/i18n/useTranslation';
import { 
  Loader2, Save, ArrowRight, Home, LayoutGrid, Pin, Clock, 
  ChevronUp, ChevronDown, Trash, Search, Plus, Eye, EyeOff, Sparkles, CheckCircle2,
  Edit, Settings, Sparkle, Monitor, Shield, MessageCircle, Megaphone
} from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { ImageUploader } from '@/components/ui/ImageUploader';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { SortableSectionItem } from './_components/SortableSectionItem';

interface SectionItem {
  id: string;
  type: string;
  titleAr?: string;
  titleEn?: string;
  categoryId?: string;
  storeId?: string;
  sellerId?: string;
  layoutStyle?: string;
  imageArUrl?: string;
  imageEnUrl?: string;
  linkUrl?: string;
  visible: boolean;
  filterType?: string;
  limit?: number;
  metadata?: {
    customText1Ar?: string;
    customText1En?: string;
    customText2Ar?: string;
    customText2En?: string;
    customTextCenterAr?: string;
    customTextCenterEn?: string;
    badgeAr?: string;
    badgeEn?: string;
    enableTimer?: boolean;
    timerEndDate?: string;
    subFilter1?: string;
    subFilter2?: string;
    subFilterCenter?: string;
    rightCategory?: string;
    rightStore?: string;
    rightSeller?: string;
    leftCategory?: string;
    leftStore?: string;
    leftSeller?: string;
    centerCategory?: string;
    centerStore?: string;
    centerSeller?: string;
    // Hero Side Cards (card1 & card2) ad settings
    card1Type?: string;
    card1AdImageAr?: string;
    card1AdImageEn?: string;
    card1AdLink?: string;
    card1BadgeAr?: string;
    card1BadgeEn?: string;
    card1TitleAr?: string;
    card1TitleEn?: string;
    card1CtaAr?: string;
    card1CtaEn?: string;
    card1Link?: string;
    card2Type?: string;
    card2AdImageAr?: string;
    card2AdImageEn?: string;
    card2AdLink?: string;
    card2BadgeAr?: string;
    card2BadgeEn?: string;
    card2TitleAr?: string;
    card2TitleEn?: string;
    card2CtaAr?: string;
    card2CtaEn?: string;
    card2Link?: string;
    // Bento Cards ad settings
    rightCardType?: string;
    rightCardAdImageAr?: string;
    rightCardAdImageEn?: string;
    rightCardAdLink?: string;
    centerCardType?: string;
    centerCardAdImageAr?: string;
    centerCardAdImageEn?: string;
    centerCardAdLink?: string;
    leftCardType?: string;
    leftCardAdImageAr?: string;
    leftCardAdImageEn?: string;
    leftCardAdLink?: string;
    // Ad Zone section settings
    adZone?: string;
  };
}

// -------------------------------------------------------------
// Beautiful Custom Combobox / Searchable Dropdown Selector
// -------------------------------------------------------------
interface SelectorOption {
  id: string;
  name: string;
  price?: number;
  image?: string;
  subText?: string;
}

function SearchableSelector({
  items,
  selectedValue,
  onSelect,
  placeholder,
  emptyText,
  isAr,
}: {
  items: SelectorOption[];
  selectedValue: string;
  onSelect: (value: string) => void;
  placeholder: string;
  emptyText: string;
  isAr: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredItems = items.filter(item =>
    item.name.toLowerCase().includes(search.toLowerCase()) ||
    (item.subText && item.subText.toLowerCase().includes(search.toLowerCase()))
  );

  const selectedItem = items.find(item => item.id === selectedValue);

  return (
    <div className="relative w-full text-start" ref={containerRef}>
      <button
        type="button"
        onClick={() => {
          setIsOpen(!isOpen);
          setSearch('');
        }}
        className="flex items-center justify-between w-full bg-background border border-border px-4 py-3 rounded-xl text-sm font-bold text-start hover:border-slate-400 dark:hover:border-slate-600 transition-all outline-none focus:ring-2 focus:ring-brand/20 select-none"
      >
        {selectedItem ? (
          <div className="flex items-center gap-2.5 min-w-0">
            {selectedItem.image ? (
              <img src={selectedItem.image} alt="" className="w-6 h-6 rounded-md object-cover bg-slate-100 shrink-0" />
            ) : (
              <div className="w-6 h-6 rounded-md bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-xs shrink-0">📦</div>
            )}
            <div className="min-w-0">
              <p className="font-bold truncate text-xs text-slate-800 dark:text-slate-200">{selectedItem.name}</p>
              {selectedItem.price !== undefined && (
                <p className="text-[10px] text-amber-500 font-bold">{selectedItem.price.toLocaleString()} د.ج</p>
              )}
            </div>
          </div>
        ) : (
          <span className="text-muted-foreground text-xs">{placeholder}</span>
        )}
        <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />
      </button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-2.5 space-y-2 max-h-72 overflow-y-auto animate-in fade-in slide-in-from-top-1">
          <div className="relative flex items-center">
            <Search className="absolute start-3 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder={isAr ? "ابحث..." : "Search..."}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-border rounded-xl ps-9 pe-3 py-2 text-xs font-bold outline-none focus:border-brand"
            />
          </div>

          <div className="divide-y divide-border/40 overflow-y-auto max-h-48 scrollbar-thin">
            {filteredItems.length === 0 ? (
              <p className="text-center py-4 text-xs text-muted-foreground">{emptyText}</p>
            ) : (
              filteredItems.map(item => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    onSelect(item.id);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center gap-2.5 p-2 rounded-lg text-start hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors ${selectedValue === item.id ? 'bg-brand/10 text-brand' : ''}`}
                >
                  {item.image ? (
                    <img src={item.image} alt="" className="w-8 h-8 rounded-lg object-cover bg-slate-100 shrink-0" />
                  ) : (
                    <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-sm shrink-0">📦</div>
                  )}
                  <div className="min-w-0">
                    <p className="text-xs font-bold truncate text-slate-850 dark:text-slate-200">{item.name}</p>
                    {item.price !== undefined ? (
                      <p className="text-[10px] text-amber-500 font-bold mt-0.5">{item.price.toLocaleString()} د.ج</p>
                    ) : item.subText ? (
                      <p className="text-[10px] text-muted-foreground truncate mt-0.5">{item.subText}</p>
                    ) : null}
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminHomepageManager() {
  const { isAdminAuthenticated } = useAdminAuthStore();
  const rawLanguages = useTranslationStore(state => state.languages);
  const languages = rawLanguages.filter((l: any) => l.isActive !== false);
  const { t, locale } = useTranslation();
  const dir = locale === 'ar' ? 'rtl' : 'ltr';
  const isAr = locale === 'ar';

  const getAdminPath = (subPath: string = '') => {
    if (typeof window === 'undefined') return '/super-admin';
    const segments = window.location.pathname.split('/');
    const baseSlug = segments[1] || 'super-admin';
    return subPath === '' ? `/${baseSlug}` : `/${baseSlug}/${subPath}`;
  };

  
  
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = layout.findIndex((item) => item.id === active.id);
      const newIndex = layout.findIndex((item) => item.id === over.id);
      const updatedLayout = arrayMove(layout, oldIndex, newIndex);
      setLayout(updatedLayout);
      await persistConfig(updatedLayout, pinned, countdown, heroSlides);
    }
  };

  const [isMounted, setIsMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<'layout' | 'pinning' | 'timer' | 'slides' | 'features' | 'trending' | 'testimonials' | 'cta'>('layout');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // preloaded selector data
  const [allProducts, setAllProducts] = useState<any[]>([]);
  const [allStores, setAllStores] = useState<any[]>([]);
  const [allSellers, setAllSellers] = useState<any[]>([]);
  const [allAds, setAllAds] = useState<Record<string, any[]>>({});
  const [categoriesList, setCategoriesList] = useState<any[]>([]);

  // Selected state for selectors
  const [selectedProdId, setSelectedProdId] = useState('');
  const [selectedStoreId, setSelectedStoreId] = useState('');
  const [selectedSellerId, setSelectedSellerId] = useState('');
  const [sourceSelectType, setSourceSelectType] = useState<'all' | 'store' | 'seller'>('all');

  // Editing structures
  const [editingSectId, setEditingSectId] = useState<string | null>(null);
  const [editSectData, setEditSectData] = useState<any>({
    titleAr: '',
    titleEn: '',
    categoryId: '',
    layoutStyle: 'carousel',
    imageArUrl: '',
    imageEnUrl: '',
    linkUrl: '',
    filterType: 'smart',
    limit: 10,
  });
  const [newSectType, setNewSectType] = useState<string>('category_products');

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
    imageUrl: '',
  });

  // Layout state
  const [layout, setLayout] = useState<SectionItem[]>([]);
  
  // Custom sections state
  const [features, setFeatures] = useState<any[]>([]);
  const [trendingSearches, setTrendingSearches] = useState<any>({ ar: [], en: [], fr: [] });
  const [realTrendingCategories, setRealTrendingCategories] = useState<any[]>([]);
  const [isResettingTrending, setIsResettingTrending] = useState(false);
  const [testimonials, setTestimonials] = useState<any[]>([]);
  const [ctaSettings, setCtaSettings] = useState<any>({});


  // Pinned items state
  const [pinned, setPinned] = useState<{
    products: any[];
    stores: any[];
    sellers: any[];
  }>({ products: [], stores: [], sellers: [] });

  // Countdown state
  const [countdown, setCountdown] = useState<any>({
    enabled: false,
    endDate: '',
  });

  // Live Validation Matching Products Count State
  const [liveMatchingCount, setLiveMatchingCount] = useState(null);
  const [isValidatingCount, setIsValidatingCount] = useState(false);

  useEffect(() => {
    const showWarning = (sourceSelectType === 'store' && editSectData.storeId) || 
                         (sourceSelectType === 'seller' && editSectData.sellerId) || 
                         editSectData.categoryId;
    if (!showWarning) {
      setLiveMatchingCount(null);
      return;
    }

    setIsValidatingCount(true);
    let url = `/api/products?limit=1&status=active`;
    if (sourceSelectType === 'store' && editSectData.storeId) {
      url += `&storeId=${editSectData.storeId}`;
    } else if (sourceSelectType === 'seller' && editSectData.sellerId) {
      url += `&sellerId=${editSectData.sellerId}`;
    }
    if (editSectData.categoryId) {
      url += `&categoryId=${editSectData.categoryId}`;
    }

    fetch(url)
      .then(res => res.json())
      .then(data => {
        if (data && typeof data.total === 'number') {
          setLiveMatchingCount(data.total);
        }
      })
      .catch(() => {})
      .finally(() => setIsValidatingCount(false));
  }, [editSectData.storeId, editSectData.sellerId, editSectData.categoryId, sourceSelectType]);

  useEffect(() => {
    setIsMounted(true);
    fetch('/api/categories')
      .then(res => res.json())
      .then(d => {
        if (Array.isArray(d)) {
          setCategoriesList(d.filter(c => c && c.id));
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (isMounted && !isAdminAuthenticated) {
      const currentPath = window.location.pathname.replace('/settings/homepage', '');
      window.location.href = `${currentPath}/login`;
    }
  }, [isMounted, isAdminAuthenticated]);

  // Load all configurations & preloaded selector lists
  const fetchHomepageConfig = useCallback(async () => {
    try {
      const [homeRes, prodRes, storeRes, sellerRes] = await Promise.all([
        fetch(`/api/admin/homepage?t=${Date.now()}`, { cache: 'no-store' }),
        fetch('/api/products?limit=200'),
        fetch('/api/stores'),
        fetch('/api/sellers'),
      ]);

      const d = await homeRes.json();
      const prodData = await prodRes.json();
      const storeData = await storeRes.json();
      const sellerData = await sellerRes.json();

      if (prodData.products) setAllProducts(prodData.products);
      if (storeData.stores) setAllStores(storeData.stores);
      if (sellerData.sellers) setAllSellers(sellerData.sellers);
      if (d.advertisements) setAllAds(d.advertisements);

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

        const rawLayout = d.layout && d.layout.length > 0
          ? d.layout
          : ['hero', 'features', 'categories', 'bento_offers', 'featured_products', 'top_sellers', 'testimonials', 'cta'];
        const mappedLayout = rawLayout.map((sect: any) => {
          if (typeof sect === 'string') {
            const id = sect === 'mega_offers_timer' ? 'bento_offers' : sect;
            return {
              id,
              type: id,
              titleAr: sectionNames[id]?.ar || id,
              titleEn: sectionNames[id]?.en || id,
              visible: true,
            };
          }
          return {
            id: sect.id,
            type: sect.type || sect.id,
            titleAr: sect.titleAr || sectionNames[sect.type || sect.id]?.ar || sect.id,
            titleEn: sect.titleEn || sectionNames[sect.type || sect.id]?.en || sect.id,
            categoryId: sect.categoryId || '',
            storeId: sect.storeId || '',
            sellerId: sect.sellerId || '',
            layoutStyle: sect.layoutStyle || 'carousel',
            imageArUrl: sect.imageArUrl || '',
            imageEnUrl: sect.imageEnUrl || '',
            linkUrl: sect.linkUrl || '',
            visible: sect.visible !== false,
            filterType: sect.filterType || 'smart',
            limit: sect.limit || 10,
            metadata: sect.metadata || null,
          };
        });
        // Ensure ALL core sections exist - append missing ones
        const coreSections = ['hero', 'features', 'categories', 'bento_offers', 'featured_products', 'top_sellers', 'testimonials', 'cta'];
        const existingTypes = new Set(mappedLayout.map((s: SectionItem) => s.type));
        for (const coreType of coreSections) {
          if (!existingTypes.has(coreType)) {
            mappedLayout.push({
              id: coreType,
              type: coreType,
              titleAr: sectionNames[coreType]?.ar || coreType,
              titleEn: sectionNames[coreType]?.en || coreType,
              visible: true,
            });
          }
        }
        setLayout(mappedLayout);

        setPinned({
          products: d.pinned?.products || [],
          stores: d.pinned?.stores || [],
          sellers: d.pinned?.sellers || [],
        });

        setCountdown({
          ...d.countdown,
          enabled: d.countdown?.enabled || false,
          endDate: d.countdown?.endDate ? d.countdown.endDate.substring(0, 16) : '',
        });

        setHeroSlides(d.heroSlides || []);
        setFeatures(d.features || []);
        setTrendingSearches(d.trendingSearches || { ar: [], en: [], fr: [] });
        setCtaSettings(d.cta || {});
        setTestimonials(d.testimonials || []);
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

  const persistConfig = async (
    updatedLayout = layout,
    updatedPinned = pinned,
    updatedCountdown = countdown,
    updatedHeroSlides = heroSlides,
    updatedFeatures = features,
    updatedTrendingSearches = trendingSearches,
    updatedTestimonials = testimonials,
    updatedCtaSettings = ctaSettings
  ) => {
    setIsSaving(true);
    try {
      const payload = {
        layout: updatedLayout.map(sect => ({
          ...sect,
          metadata: sect.metadata || null,
        })),
        pinned: {
          products: (updatedPinned.products || []).map((p: any, idx: number) => ({ id: p.id, order: idx + 1, name: p.name, price: p.price, image: p.image })),
          stores: (updatedPinned.stores || []).map((s: any, idx: number) => ({ id: s.id, order: idx + 1, name: s.name, image: s.image })),
          sellers: (updatedPinned.sellers || []).map((s: any, idx: number) => ({ id: s.id, order: idx + 1, name: s.name, image: s.image })),
        },
        countdown: {
          ...updatedCountdown,
          enabled: updatedCountdown.enabled,
          endDate: updatedCountdown.endDate ? new Date(updatedCountdown.endDate).toISOString() : '',
        },
        heroSlides: updatedHeroSlides,
        features: updatedFeatures,
        trendingSearches: updatedTrendingSearches,
        testimonials: updatedTestimonials,
        cta: updatedCtaSettings,
      };

      const res = await fetch('/api/admin/homepage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const d = await res.json();
      if (d.success) {
        toast.success(t('homepage.changesSavedSuccessfullyToDatabase'), {
          icon: <CheckCircle2 className="text-emerald-500 w-5 h-5" />
        });
      } else {
        throw new Error(d.error);
      }
    } catch (err: any) {
      toast.error(t('homepage.failedToSaveChanges'));
    } finally {
      setIsSaving(false);
    }
  };

  // Slides handlers
  const handleStartAddSlide = () => {
    const initialSlide: any = {
      bg: 'from-blue-950 via-indigo-900 to-slate-900',
      linkUrl: '',
      imageUrl: '',
    };
    languages.forEach((lang: any) => {
      const codeSuffix = lang.code.charAt(0).toUpperCase() + lang.code.slice(1);
      initialSlide[`title${codeSuffix}`] = '';
      initialSlide[`subtitle${codeSuffix}`] = '';
      initialSlide[`badge${codeSuffix}`] = '';
      initialSlide[`cta${codeSuffix}`] = '';
      if (lang.code === 'ar') {
        initialSlide.title = '';
        initialSlide.subtitle = '';
        initialSlide.badge = '';
        initialSlide.cta = 'تسوق الآن';
      }
    });
    setEditSlideData(initialSlide);
    setEditingSlideIndex(heroSlides.length);
  };

  const handleStartEditSlide = (index: number) => {
    const slide = heroSlides[index];
    if (!slide) return;
    const initialSlide: any = {
      bg: slide.bg || 'from-blue-950 via-indigo-900 to-slate-900',
      linkUrl: slide.linkUrl || '',
      imageUrl: slide.imageUrl || '',
    };
    languages.forEach((lang: any) => {
      const codeSuffix = lang.code.charAt(0).toUpperCase() + lang.code.slice(1);
      const isArabic = lang.code === 'ar';
      initialSlide[`title${codeSuffix}`] = slide[`title${codeSuffix}`] || (isArabic ? slide.title : '') || '';
      initialSlide[`subtitle${codeSuffix}`] = slide[`subtitle${codeSuffix}`] || (isArabic ? slide.subtitle : '') || '';
      initialSlide[`badge${codeSuffix}`] = slide[`badge${codeSuffix}`] || (isArabic ? slide.badge : '') || '';
      initialSlide[`cta${codeSuffix}`] = slide[`cta${codeSuffix}`] || (isArabic ? slide.cta : '') || '';
      if (isArabic) {
        initialSlide.title = slide.title || '';
        initialSlide.subtitle = slide.subtitle || '';
        initialSlide.badge = slide.badge || '';
        initialSlide.cta = slide.cta || 'تسوق الآن';
      }
    });
    setEditSlideData(initialSlide);
    setEditingSlideIndex(index);
  };

  const handleSaveSlide = async () => {
    if (editingSlideIndex === null) return;
    const updated = [...heroSlides];
    if (editingSlideIndex === heroSlides.length) {
      updated.push({ ...editSlideData, id: String(Date.now()) });
    } else {
      updated[editingSlideIndex] = { ...updated[editingSlideIndex], ...editSlideData };
    }
    setHeroSlides(updated);
    setEditingSlideIndex(null);
    await persistConfig(layout, pinned, countdown, updated);
  };

  const handleDeleteSlide = async (index: number) => {
    const updated = heroSlides.filter((_, i) => i !== index);
    setHeroSlides(updated);
    if (editingSlideIndex === index) {
      setEditingSlideIndex(null);
    } else if (editingSlideIndex !== null && editingSlideIndex > index) {
      setEditingSlideIndex(editingSlideIndex - 1);
    }
    await persistConfig(layout, pinned, countdown, updated);
  };

  const handleHeroSlideChange = (index: number, key: keyof HeroSlide, value: any) => {
    const newSlides = [...heroSlides];
    newSlides[index] = { ...newSlides[index], [key]: value };
    setHeroSlides(newSlides);
  };

  useEffect(() => {
    if (activeTab === 'trending') {
      fetch('/api/search/trending')
        .then(res => res.json())
        .then(data => {
          if (data.trendingCategories) {
            setRealTrendingCategories(data.trendingCategories);
          }
        })
        .catch(console.error);
    }
  }, [activeTab]);

  const moveSlide = async (index: number, direction: 'up' | 'down') => {
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
    await persistConfig(layout, pinned, countdown, updated);
  };

  // Pinned items handlers (triggered from Selectors)
  const handlePinPreloadedItem = async (type: 'product' | 'store' | 'seller') => {
    let itemToPin: any = null;
    let listKey: 'products' | 'stores' | 'sellers' = 'products';

    if (type === 'product') {
      itemToPin = allProducts.find(p => p.id === selectedProdId);
      listKey = 'products';
    } else if (type === 'store') {
      itemToPin = allStores.find(s => s.id === selectedStoreId);
      listKey = 'stores';
    } else if (type === 'seller') {
      itemToPin = allSellers.find(s => s.id === selectedSellerId);
      listKey = 'sellers';
    }

    if (!itemToPin) {
      toast.error(t('homepage.pleaseSelectAnItemFirst'));
      return;
    }

    const currentList = pinned[listKey] || [];

    if (currentList.some((i: any) => i.id === itemToPin.id)) {
      toast.error(t('homepage.thisItemIsAlreadyPinned'));
      return;
    }

    let pImage = '';
    if (type === 'product') {
      let images: string[] = [];
      if (Array.isArray(itemToPin.images)) images = itemToPin.images;
      else if (typeof itemToPin.images === 'string') {
        try { images = JSON.parse(itemToPin.images); } catch {}
      }
      pImage = images[0] || '';
    } else {
      pImage = itemToPin.logo || itemToPin.user?.avatar || '';
    }

    const newItem = {
      id: itemToPin.id,
      name: itemToPin.name || itemToPin.storeName || itemToPin.title || itemToPin.user?.name || '',
      price: itemToPin.price || 0,
      image: pImage,
    };

    const updatedPinned = {
      ...pinned,
      [listKey]: [...currentList, newItem]
    };

    setPinned(updatedPinned);

    // Clear selection state
    if (type === 'product') setSelectedProdId('');
    else if (type === 'store') setSelectedStoreId('');
    else if (type === 'seller') setSelectedSellerId('');

    await persistConfig(layout, updatedPinned, countdown, heroSlides);
  };

  const handleUnpinItem = async (id: string, type: 'products' | 'stores' | 'sellers') => {
    const updatedPinned = {
      ...pinned,
      [type]: (pinned[type] || []).filter((i: any) => i.id !== id)
    };
    setPinned(updatedPinned);
    await persistConfig(layout, updatedPinned, countdown, heroSlides);
  };

  // Section Layout order changes
  const moveSection = async (index: number, direction: 'up' | 'down') => {
    const nextIndex = direction === 'up' ? index - 1 : index + 1;
    if (nextIndex < 0 || nextIndex >= layout.length) return;

    const updated = [...layout];
    const temp = updated[index];
    updated[index] = updated[nextIndex]!;
    updated[nextIndex] = temp!;
    setLayout(updated);
    await persistConfig(updated, pinned, countdown, heroSlides);
  };

  const toggleSectionVisibility = async (index: number) => {
    const updated = [...layout];
    updated[index]!.visible = !updated[index]!.visible;
    setLayout(updated);
    await persistConfig(updated, pinned, countdown, heroSlides);
  };

  // Core section types that cannot be deleted (only hidden)
  const CORE_SECTION_TYPES = new Set(['hero', 'features', 'categories', 'bento_offers', 'featured_products', 'top_sellers', 'testimonials', 'cta']);

  const deleteSection = async (index: number) => {
    const sect = layout[index];
    if (!sect) return;
    // Block deletion of core sections
    if (CORE_SECTION_TYPES.has(sect.type)) {
      toast.error(t('homepage.coreSectionsCannotBeDeletedYouCanHideThe'));
      return;
    }
    const updated = layout.filter((_, i) => i !== index);
    setLayout(updated);
    await persistConfig(updated, pinned, countdown, heroSlides);
  };

  const startEditSection = (index: number) => {
    const sect = layout[index];
    if (!sect) return;
    setEditingSectId(sect.id);
    if (sect.storeId) {
      setSourceSelectType('store');
    } else if (sect.sellerId) {
      setSourceSelectType('seller');
    } else {
      setSourceSelectType('all');
    }
    setEditSectData({ ...sect, metadata: { ...sect.metadata } });
  };

  const saveSectionSettings = async () => {
    if (!editingSectId) return;
    const updated = layout.map(sect => {
      if (sect.id === editingSectId) {
        return {
          ...sect,
          ...editSectData,
        };
      }
      return sect;
    });
    setLayout(updated);
    setEditingSectId(null);
    await persistConfig(updated, pinned, countdown, heroSlides);
  };

  const addSection = async () => {
    const sectionNames: Record<string, { ar: string; en: string }> = {
      hero: { ar: 'البانر الترويجي الرئيسي (Slides)', en: 'Hero Promotion Slides' },
      features: { ar: 'شريط الميزات والضمانات', en: 'Platform Features & Guarantees' },
      categories: { ar: 'أيقونات التصنيفات الدائرية العامة', en: 'Circular Categories Icons' },
      bento_offers: { ar: 'شبكة عروض ميجا والمكعبات الترويجية (Noon Bento)', en: 'Mega Offers & Bento Grid' },
      featured_products: { ar: 'شبكة المنتجات المميزة الذكية', en: 'Featured Products Grid' },
      top_sellers: { ar: 'سلايدر المتاجر الكبرى والتجار الموثقين', en: 'Top Stores & Verified Sellers' },
      testimonials: { ar: 'آراء وتقييمات العملاء', en: 'Customer Testimonials' },
      cta: { ar: 'لوحة دعوة التجار للتسجيل (CTA)', en: 'Seller Invitation Panel' },
      category_products: { ar: 'منتجات تصنيف مخصصة', en: 'Category Showcase Products' },
      category_circles: { ar: 'أيقونات تصنيفات فرعية دائرية', en: 'Category Subcategories Circles' },
      banner: { ar: 'إعلان ترويجي مخصص', en: 'Custom Promo Banner' },
      ad_zone: { ar: 'منطقة إعلانية عامة', en: 'General Ad Zone Banner' }
    };

    const newId = `sec_${Date.now()}`;
    const newSect: SectionItem = {
      id: newId,
      type: newSectType,
      titleAr: sectionNames[newSectType]?.ar || newSectType,
      titleEn: sectionNames[newSectType]?.en || newSectType,
      categoryId: '',
      storeId: '',
      sellerId: '',
      layoutStyle: 'carousel',
      imageArUrl: '',
      imageEnUrl: '',
      linkUrl: '',
      visible: true,
      filterType: 'smart',
      limit: 10,
      metadata: {
        customText1Ar: '', customText1En: '',
        customText2Ar: '', customText2En: '',
        customTextCenterAr: '', customTextCenterEn: '',
        badgeAr: '', badgeEn: '',
        enableTimer: false, timerEndDate: '',
        subFilter1: 'smart', subFilter2: 'smart', subFilterCenter: 'smart',
        rightCategory: '', rightStore: '', rightSeller: '',
        leftCategory: '', leftStore: '', leftSeller: '',
        centerCategory: '', centerStore: '', centerSeller: '',
        card1Type: 'text', card1AdImageAr: '', card1AdImageEn: '', card1AdLink: '',
        card2Type: 'text', card2AdImageAr: '', card2AdImageEn: '', card2AdLink: '',
        rightCardType: 'products', rightCardAdImageAr: '', rightCardAdImageEn: '', rightCardAdLink: '',
        centerCardType: 'products', centerCardAdImageAr: '', centerCardAdImageEn: '', centerCardAdLink: '',
        leftCardType: 'products', leftCardAdImageAr: '', leftCardAdImageEn: '', leftCardAdLink: '',
        adZone: 'banner_mid',
      },
    };
    const updated = [...layout, newSect];
    setLayout(updated);
    setEditingSectId(newId);
    setSourceSelectType('all');
    setEditSectData({
      titleAr: newSect.titleAr || '',
      titleEn: newSect.titleEn || '',
      categoryId: '',
      storeId: '',
      sellerId: '',
      layoutStyle: 'carousel',
      imageArUrl: '',
      imageEnUrl: '',
      linkUrl: '',
      filterType: 'smart',
      limit: 10,
      metadata: { ...newSect.metadata },
    });
    await persistConfig(updated, pinned, countdown, heroSlides);
  };

  const handleSave = async () => {
    await persistConfig(layout, pinned, countdown, heroSlides);
  };

  // Adapt lists for searchable selectors
  const productOptions: SelectorOption[] = allProducts.map(p => {
    let images: string[] = [];
    if (Array.isArray(p.images)) images = p.images;
    else if (typeof p.images === 'string') {
      try { images = JSON.parse(p.images); } catch {}
    }
    return {
      id: p.id,
      name: isAr ? p.name : (p.nameEn || p.name),
      price: p.price,
      image: images[0] || '',
    };
  });

  const storeOptions: SelectorOption[] = allStores.map(s => ({
    id: s.id,
    name: isAr ? s.name : (s.nameEn || s.name),
    image: s.logo || '',
    subText: s.manager?.name || '',
  }));

  const sellerOptions: SelectorOption[] = allSellers.map(s => ({
    id: s.id,
    name: s.storeName || s.user?.name || '',
    image: s.logo || s.user?.avatar || '',
    subText: s.user?.name || '',
  }));

  const categoryOptions: SelectorOption[] = categoriesList.map(c => ({
    id: c.id,
    name: isAr ? c.name : (c.nameEn || c.name),
    subText: c.parentId ? t('homepage.subcategory') : t('homepage.mainCategory'),
  }));

  if (!isMounted || !isAdminAuthenticated) return null;

  return (
    <div dir={dir} className="max-w-[1750px] mx-auto p-4 sm:p-6 lg:p-8 space-y-6 text-start font-cairo">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          <Link href={getAdminPath('/settings')}>
            <Button variant="outline" size="icon" className="rounded-full">
              <ArrowRight className={`h-5 w-5 ${locale === 'ar' ? '' : 'rotate-180'}`} />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-black text-foreground flex items-center gap-2">
              <Home className="h-6 w-6 text-brand" />
              {t('homepage.homepageManagerDesigner')}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {t('homepage.controlHomepageLayoutPinEntitiesAndAdjus')}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0 select-none">
          <Link href={getAdminPath('advertisements')}>
            <Button variant="outline" className="font-bold rounded-xl gap-2 border-brand/35 hover:border-brand hover:bg-brand/5 text-brand">
              <Monitor className="h-4 w-4" />
              {t('homepage.globalAdsBanners')}
            </Button>
          </Link>
        </div>
      </div>

      <div className="flex flex-wrap p-1.5 bg-slate-100 dark:bg-slate-800 rounded-2xl border max-w-2xl gap-1 select-none w-fit">
        <button onClick={() => setActiveTab('layout')} className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs md:text-sm font-bold transition-all ${activeTab === 'layout' ? 'bg-white dark:bg-slate-900 text-slate-950 dark:text-white shadow-md' : 'text-muted-foreground hover:text-foreground'}`}>
          <LayoutGrid className="w-4 h-4" />
          {t('homepage.sectionsLayout')}
        </button>
        <button onClick={() => setActiveTab('pinning')} className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs md:text-sm font-bold transition-all ${activeTab === 'pinning' ? 'bg-white dark:bg-slate-900 text-slate-950 dark:text-white shadow-md' : 'text-muted-foreground hover:text-foreground'}`}>
          <Pin className="w-4 h-4" />
          {t('homepage.manualPinning')}
        </button>
        <button onClick={() => setActiveTab('timer')} className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs md:text-sm font-bold transition-all ${activeTab === 'timer' ? 'bg-white dark:bg-slate-900 text-slate-950 dark:text-white shadow-md' : 'text-muted-foreground hover:text-foreground'}`}>
          <Clock className="w-4 h-4" />
          {t('homepage.countdownTimer')}
        </button>
        <button onClick={() => setActiveTab('slides')} className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs md:text-sm font-bold transition-all ${activeTab === 'slides' ? 'bg-white dark:bg-slate-900 text-slate-950 dark:text-white shadow-md' : 'text-muted-foreground hover:text-foreground'}`}>
          <Sparkles className="w-4 h-4" />
          {t('homepage.heroSlides')}
        </button>
        <button onClick={() => setActiveTab('features')} className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs md:text-sm font-bold transition-all ${activeTab === 'features' ? 'bg-white dark:bg-slate-900 text-slate-950 dark:text-white shadow-md' : 'text-muted-foreground hover:text-foreground'}`}>
          <Shield className="w-4 h-4" />
          الميزات والضمانات
        </button>
        <button onClick={() => setActiveTab('trending')} className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs md:text-sm font-bold transition-all ${activeTab === 'trending' ? 'bg-white dark:bg-slate-900 text-slate-950 dark:text-white shadow-md' : 'text-muted-foreground hover:text-foreground'}`}>
          <Search className="w-4 h-4" />
          البحث الشائع
        </button>
        <button onClick={() => setActiveTab('testimonials')} className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs md:text-sm font-bold transition-all ${activeTab === 'testimonials' ? 'bg-white dark:bg-slate-900 text-slate-950 dark:text-white shadow-md' : 'text-muted-foreground hover:text-foreground'}`}>
          <MessageCircle className="w-4 h-4" />
          آراء العملاء
        </button>
        <button onClick={() => setActiveTab('cta')} className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs md:text-sm font-bold transition-all ${activeTab === 'cta' ? 'bg-white dark:bg-slate-900 text-slate-950 dark:text-white shadow-md' : 'text-muted-foreground hover:text-foreground'}`}>
          <Megaphone className="w-4 h-4" />
          لوحة الـ CTA
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center p-24">
          <Loader2 className="h-10 w-10 animate-spin text-brand" />
        </div>
      ) : (
        <div className="space-y-6">
          {/* Layout Tab */}
          {activeTab === 'layout' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column: Sections List & Ordering */}
              <Card className="lg:col-span-6 card-surface rounded-[24px] shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg font-bold">{t('homepage.homepageSectionOrder')}</CardTitle>
                  <CardDescription>
                    {t('homepage.reorderToggleOrDeleteSectionsAndAppendNe')}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="border border-border/85 rounded-[20px] overflow-hidden bg-background shadow-inner">
                    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                      <SortableContext items={layout.map(s => s.id)} strategy={verticalListSortingStrategy}>
                    {layout.map((sect, idx) => {
                      const sectionNames: Record<string, { ar: string; en: string }> = {
                        hero: { ar: 'البانر الترويجي الرئيسي (Slides)', en: 'Hero Promotion Slides' },
                        features: { ar: 'شريط الميزات والضمانات', en: 'Platform Features & Guarantees' },
                        categories: { ar: 'أيقونات التصنيفات الدائرية العامة', en: 'Circular Categories Icons' },
                        bento_offers: { ar: 'شبكة عروض ميجا والمكعبات الترويجية (Noon Bento)', en: 'Mega Offers & Bento Grid' },
                        featured_products: { ar: 'شبكة المنتجات المميزة الذكية', en: 'Featured Products Grid' },
                        top_sellers: { ar: 'سلايدر المتاجر الكبرى والتجار الموثقين', en: 'Top Stores & Verified Sellers' },
                        testimonials: { ar: 'آراء وتقييمات العملاء', en: 'Customer Testimonials' },
                        cta: { ar: 'لوحة دعوة التجار للتسجيل (CTA)', en: 'Seller Invitation Panel' }
                      };

                      const displayName = sect.titleAr && isAr 
                        ? sect.titleAr 
                        : sect.titleEn && !isAr 
                          ? sect.titleEn 
                          : sectionNames[sect.id]?.ar || sect.id;

                      const getSectionBadge = (type: string) => {
                        switch (type) {
                          case 'hero': return <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-500/20 text-[10px] font-bold">{t('homepage.heroSlider')}</Badge>;
                          case 'features': return <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 text-[10px] font-bold">{t('homepage.featuresBar')}</Badge>;
                          case 'categories': return <Badge variant="outline" className="bg-purple-500/10 text-purple-500 border-purple-500/20 text-[10px] font-bold">{t('homepage.categoriesCircle')}</Badge>;
                          case 'bento_offers': return <Badge variant="outline" className="bg-amber-500/10 text-amber-500 border-amber-500/20 text-[10px] font-bold">{t('homepage.bentoOffers')}</Badge>;
                          case 'featured_products': return <Badge variant="outline" className="bg-indigo-500/10 text-indigo-500 border-indigo-500/20 text-[10px] font-bold">{t('homepage.featuredProducts')}</Badge>;
                          case 'top_sellers': return <Badge variant="outline" className="bg-cyan-500/10 text-cyan-500 border-cyan-500/20 text-[10px] font-bold">{t('homepage.sellersSlider')}</Badge>;
                          case 'testimonials': return <Badge variant="outline" className="bg-teal-500/10 text-teal-500 border-teal-500/20 text-[10px] font-bold">{t('homepage.testimonials')}</Badge>;
                          case 'cta': return <Badge variant="outline" className="bg-rose-500/10 text-rose-500 border-rose-500/20 text-[10px] font-bold">{t('homepage.ctaPanel')}</Badge>;
                          case 'category_products': return <Badge variant="outline" className="bg-pink-500/10 text-pink-500 border-pink-500/20 text-[10px] font-bold">{t('homepage.categoryShowcase')}</Badge>;
                          case 'category_circles': return <Badge variant="outline" className="bg-violet-500/10 text-violet-500 border-violet-500/20 text-[10px] font-bold">{t('homepage.subcategoryCircles')}</Badge>;
                          case 'banner': return <Badge variant="outline" className="bg-orange-500/10 text-orange-500 border-orange-500/20 text-[10px] font-bold">{t('homepage.customBanner')}</Badge>;
                          default: return <Badge variant="outline" className="text-[10px] font-bold">{type}</Badge>;
                        }
                      };

                      return (
                        <SortableSectionItem key={sect.id} id={sect.id}>
                          <div className={`flex items-center justify-between p-3.5 transition-colors ${sect.visible ? 'bg-background hover:bg-slate-50/50 dark:hover:bg-slate-800/10' : 'bg-muted/40 opacity-70'} ${editingSectId === sect.id ? 'border-l-4 border-l-brand bg-slate-50 dark:bg-slate-900/40' : ''}`}>
                          <div className="min-w-0 flex items-center gap-3">
                            <span className="font-mono text-xs text-muted-foreground w-6 shrink-0">#{idx + 1}</span>
                            <div className="min-w-0">
                              <p className="font-bold text-sm truncate text-slate-800 dark:text-slate-100">{displayName}</p>
                              <div className="mt-1 flex items-center gap-1.5 flex-wrap">
                                {getSectionBadge(sect.type)}
                                {['featured_products', 'bento_offers', 'top_sellers', 'category_products'].includes(sect.type) && (
                                  <div className="flex items-center gap-1 ms-1 bg-slate-100 dark:bg-slate-800 rounded px-1.5 py-0.5 border border-border/50">
                                    <span className="text-[10px] text-muted-foreground font-bold">{isAr ? 'العدد' : 'Limit'}:</span>
                                    <input 
                                      type="number" 
                                      min={1} 
                                      max={100}
                                      value={sect.limit || 10} 
                                      onChange={(e) => {
                                        const val = parseInt(e.target.value) || 10;
                                        setLayout(prev => prev.map((s, i) => i === idx ? { ...s, limit: val } : s));
                                        if (editingSectId === sect.id) {
                                          setEditSectData(prev => ({ ...prev, limit: val }));
                                        }
                                      }}
                                      onPointerDown={(e) => e.stopPropagation()}
                                      onKeyDown={(e) => e.stopPropagation()}
                                      className="w-10 h-5 text-[10px] text-center bg-white dark:bg-slate-900 border border-border rounded outline-none font-bold text-foreground"
                                    />
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                            <Button variant="ghost" size="icon" disabled={idx === 0} onClick={() => moveSection(idx, 'up')} className="rounded-full h-8 w-8">
                              <ChevronUp className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="icon" disabled={idx === layout.length - 1} onClick={() => moveSection(idx, 'down')} className="rounded-full h-8 w-8">
                              <ChevronDown className="w-4 h-4" />
                            </Button>
                            <Button variant="outline" size="icon" onClick={() => startEditSection(idx)} className={`rounded-full h-8 w-8 ${editingSectId === sect.id ? 'bg-brand/10 border-brand' : ''}`}>
                              <Settings className="w-4 h-4 text-slate-650 dark:text-slate-400" />
                            </Button>
                            <Button variant="outline" size="icon" onClick={() => toggleSectionVisibility(idx)} className="rounded-full h-8 w-8">
                              {sect.visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4 text-destructive" />}
                            </Button>
                            {CORE_SECTION_TYPES.has(sect.type) ? (
                              <Button variant="ghost" size="icon" disabled className="rounded-full h-8 w-8 opacity-30 cursor-not-allowed" title={t('homepage.coreSectionCannotDelete')}>
                                <Trash className="w-4 h-4" />
                              </Button>
                            ) : (
                              <Button variant="ghost" size="icon" onClick={() => deleteSection(idx)} className="rounded-full h-8 w-8 text-destructive hover:bg-destructive/10">
                                <Trash className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                        </SortableSectionItem>
                      );
                    })}
                      </SortableContext>
                    </DndContext>
                  </div>

                  {/* Add New Section Block */}
                  <div className="p-4 border border-dashed border-slate-300 dark:border-slate-700 rounded-[20px] bg-slate-50/50 dark:bg-slate-900/10 space-y-3">
                    <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t('homepage.addCustomSection')}</Label>
                    <div className="flex gap-2">
                      <select
                        value={newSectType}
                        onChange={(e) => setNewSectType(e.target.value)}
                        className="bg-background border border-border text-foreground px-3.5 py-2.5 rounded-xl text-sm font-bold grow"
                      >
                        <option value="category_products">📦 {t('homepage.categoryShowcaseProducts')}</option>
                        <option value="category_circles">⭕ {t('homepage.subcategoryCirclesRow')}</option>
                        <option value="banner">🖼️ {t('homepage.inlineAdBanner')}</option>
                        <option value="ad_zone">📢 {t('homepage.generalAdZoneBanner')}</option>
                        <option value="hero">🔥 {t('homepage.heroSlides')}</option>
                        <option value="features">🛡️ {t('homepage.guaranteeBadges')}</option>
                        <option value="categories">🏷️ {t('homepage.mainCategoriesCircles')}</option>
                        <option value="bento_offers">⚡ {t('homepage.megaCountdownBento')}</option>
                        <option value="featured_products">⭐ {t('homepage.featuredProductsGrid')}</option>
                        <option value="top_sellers">🏪 {t('homepage.sellersCarousel')}</option>
                        <option value="testimonials">💬 {t('homepage.customerTestimonials')}</option>
                        <option value="cta">💼 {t('homepage.sellerCtaPanel')}</option>
                      </select>
                      <Button onClick={addSection} className="rounded-xl font-bold gap-1 px-5">
                        <Plus className="w-4 h-4" />
                        {t('homepage.add')}
                      </Button>
                    </div>
                  </div>

                  <div className="flex justify-end pt-2 border-t">
                    <Button onClick={handleSave} disabled={isSaving} className="font-bold gap-2 rounded-xl px-5">
                      {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                      {t('homepage.saveLayoutChanges')}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Right Column: Edit Section Parameters */}
              <Card className="lg:col-span-6 card-surface rounded-[24px] shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg font-bold flex items-center gap-1.5">
                    <Edit className="w-5 h-5 text-brand" />
                    {editingSectId 
                      ? `${t('homepage.configureSectionSettings')}`
                      : t('homepage.selectASectionToConfigure')}
                  </CardTitle>
                  <CardDescription>
                    {editingSectId 
                      ? t('homepage.provideParametersForTheSelectedHomepageB')
                      : t('homepage.clickTheSettingsGearIconNextToAnySection')}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {editingSectId === null ? (
                    <div className="flex flex-col items-center justify-center py-28 text-muted-foreground border border-dashed rounded-[20px] bg-background">
                      <Settings className="w-12 h-12 text-slate-300 dark:text-slate-700 mb-3" />
                      <p className="text-sm font-medium">{t('homepage.noSectionSelectedForConfiguration')}</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {/* Dynamic Title Fields based on active languages */}
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {languages.map((lang: any) => {
                          const codeSuffix = lang.code.charAt(0).toUpperCase() + lang.code.slice(1);
                          const keyName = `title${codeSuffix}`;
                          const inputLabel = `${t('homepage.titleIn')} ${lang.name}`;
                          return (
                            <div key={lang.code} className="space-y-2 text-start">
                              <Label className="text-xs font-bold">{inputLabel}</Label>
                              <Input
                                value={editSectData[keyName] || ''}
                                onChange={e => setEditSectData(prev => ({ ...prev, [keyName]: e.target.value }))}
                                className="rounded-xl text-sm"
                                placeholder={lang.code === 'ar' ? 'أجهزة إلكترونية مميزة' : lang.code === 'en' ? 'Featured Electronics' : `Featured (${lang.name})`}
                              />
                            </div>
                          );
                        })}
                      </div>

                      {/* Layout style for category products */}
                      {layout.find(s => s.id === editingSectId)?.type === 'category_products' && (
                        <div className="space-y-4 pt-2 border-t text-start">
                          <Label className="text-xs font-bold">{t('homepage.layoutStyle')}</Label>
                          <select
                            value={editSectData.layoutStyle}
                            onChange={(e) => setEditSectData(prev => ({ ...prev, layoutStyle: e.target.value }))}
                            className="bg-background border border-border text-foreground px-3.5 py-2.5 rounded-xl text-sm font-bold w-full"
                          >
                            <option value="carousel">🎠 {t('homepage.horizontalSlidingCarousel')}</option>
                            <option value="grid">🔲 {t('homepage.responsiveProductsGrid')}</option>
                          </select>
                        </div>
                      )}

                      {/* Custom Banner Showcase Settings - Direct Image Upload */}
                      {layout.find(s => s.id === editingSectId)?.type === 'banner' && (
                        <div className="space-y-4 pt-2 border-t">
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {languages.map((lang: any) => {
                              const codeSuffix = lang.code.charAt(0).toUpperCase() + lang.code.slice(1);
                              const keyName = `image${codeSuffix}Url`;
                              const inputLabel = `${t('homepage.bannerImageIn')} ${lang.name}`;
                              const hintText = `${t('homepage.uploadedBannerDisplayedIn')} ${lang.name}.`;
                              return (
                                <div key={lang.code} className="space-y-2 text-start">
                                  <Label className="text-xs font-bold">{inputLabel}</Label>
                                  <ImageUploader
                                    value={editSectData[keyName] || ''}
                                    onChange={url => setEditSectData(prev => ({ ...prev, [keyName]: url }))}
                                    hint={hintText}
                                  />
                                </div>
                              );
                            })}
                          </div>

                          <div className="space-y-2 text-start">
                            <Label className="text-xs font-bold">{t('homepage.redirectUrlLink')}</Label>
                            <Input
                              value={editSectData.linkUrl}
                              onChange={e => setEditSectData(prev => ({ ...prev, linkUrl: e.target.value }))}
                              className="rounded-xl text-sm font-mono text-start"
                              placeholder="/search?q=sunscreen"
                            />
                          </div>
                        </div>
                      )}

                      {/* General Ad Zone Banner Settings */}
                      {layout.find(s => s.id === editingSectId)?.type === 'ad_zone' && (
                        <div className="space-y-4 pt-2 border-t text-start">
                          <Label className="text-sm font-bold">{t('homepage.targetAdvertisementZone')}</Label>
                          <select
                            value={editSectData.metadata?.adZone || 'banner_mid'}
                            onChange={(e) => setEditSectData(prev => ({
                              ...prev,
                              metadata: { ...prev.metadata, adZone: e.target.value }
                            }))}
                            className="bg-background border border-border text-foreground px-3.5 py-2.5 rounded-xl text-sm font-bold w-full"
                          >
                            <option value="banner_mid">🖼️ {t('homepage.middleBanner')}</option>
                            <option value="inline_products">📦 {t('homepage.inlineProducts')}</option>
                            <option value="category_header">🏷️ {t('homepage.categoryHeader')}</option>
                            <option value="sidebar">🔲 {t('homepage.sidebarAd')}</option>
                            <option value="banner_top">🔝 {t('homepage.topHeaderBanner')}</option>
                            <option value="banner_bottom">🔙 {t('homepage.bottomBanner')}</option>
                          </select>
                        </div>
                      )}

                      {/* Filtering and Limits for Products/Sellers sections */}
                      {(layout.find(s => s.id === editingSectId)?.type === 'featured_products' || 
                        layout.find(s => s.id === editingSectId)?.type === 'bento_offers' || 
                        layout.find(s => s.id === editingSectId)?.type === 'top_sellers' ||
                        layout.find(s => s.id === editingSectId)?.type === 'category_products') && (
                        <div className="space-y-4 pt-4 border-t">
                          <h4 className="text-xs font-bold text-amber-500 uppercase flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5" />
                            {t('homepage.smartSortingCriteria')}
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2 text-start">
                              <Label className="text-xs font-bold">{t('homepage.contentSortBy')}</Label>
                              <select
                                value={editSectData.filterType || 'smart'}
                                onChange={(e) => setEditSectData(prev => ({ ...prev, filterType: e.target.value }))}
                                className="bg-background border border-border text-foreground px-3.5 py-2.5 rounded-xl text-sm font-bold w-full"
                              >
                                {layout.find(s => s.id === editingSectId)?.type === 'top_sellers' ? (
                                  <>
                                    <option value="smart">🤖 {t('homepage.smartAlgorithmAuto')}</option>
                                    <option value="most_sales">📈 {t('homepage.mostSalesOrders')}</option>
                                    <option value="highest_rated">⭐ {t('homepage.highestRated')}</option>
                                    <option value="most_products">📦 {t('homepage.mostProducts')}</option>
                                  </>
                                ) : (
                                  <>
                                    <option value="smart">🤖 {t('homepage.smartAlgorithmAuto')}</option>
                                    <option value="most_sold">🔥 {t('homepage.mostSoldSales')}</option>
                                    <option value="most_viewed">👁️ {t('homepage.mostViewedRequested')}</option>
                                    <option value="highest_rated">⭐ {t('homepage.highestRated')}</option>
                                    <option value="newest">🆕 {t('homepage.newestAdded')}</option>
                                  </>
                                )}
                              </select>
                            </div>
                            <div className="space-y-2 text-start">
                              <Label className="text-xs font-bold">{t('homepage.maximumItemsToShow')}</Label>
                              <Input
                                type="number"
                                min={1}
                                max={100}
                                value={editSectData.limit || 10}
                                onChange={e => setEditSectData(prev => ({ ...prev, limit: parseInt(e.target.value) || 10 }))}
                                className="rounded-xl text-sm"
                              />
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Advanced Customization (Metadata) */}
                      <div className="space-y-4 pt-4 border-t">
                        <h4 className="text-xs font-bold text-indigo-500 uppercase flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5" />
                          {t('homepage.advancedCustomizationTextsBadgesTimers')}
                        </h4>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* Dynamic Universal Badge based on active languages */}
                          {languages.map((lang: any) => {
                            const codeSuffix = lang.code.charAt(0).toUpperCase() + lang.code.slice(1);
                            const keyName = `badge${codeSuffix}`;
                            const inputLabel = `${t('homepage.badgeHashtagIn')} ${lang.name}`;
                            return (
                              <div key={lang.code} className="space-y-2 text-start">
                                <Label className="text-xs font-bold">{inputLabel}</Label>
                                <Input
                                  value={editSectData.metadata?.[keyName] || ''}
                                  onChange={e => setEditSectData((prev: any) => ({
                                    ...prev,
                                    metadata: { ...prev.metadata, [keyName]: e.target.value }
                                  }))}
                                  className="rounded-xl text-sm"
                                  placeholder={lang.code === 'ar' ? 'مثال: عروض حصرية' : `e.g. Exclusive Deals (${lang.nameEn})`}
                                />
                              </div>
                            );
                          })}

                          {/* Universal Timer */}
                          <div className="space-y-2 text-start">
                            <Label className="text-xs font-bold">{t('homepage.enableCountdownTimer')}</Label>
                            <select
                              value={editSectData.metadata?.enableTimer ? 'true' : 'false'}
                              onChange={(e) => setEditSectData((prev: any) => ({ ...prev, metadata: { ...prev.metadata, enableTimer: e.target.value === 'true' } }))}
                              className="bg-background border border-border text-foreground px-3.5 py-2.5 rounded-xl text-sm font-bold w-full"
                            >
                              <option value="false">{t('homepage.noDisabled')}</option>
                              <option value="true">{t('homepage.yesEnabled')}</option>
                            </select>
                          </div>
                          {editSectData.metadata?.enableTimer && (
                            <div className="space-y-2 text-start">
                              <Label className="text-xs font-bold">{t('homepage.timerEndDateTime')}</Label>
                              <Input
                                type="datetime-local"
                                value={editSectData.metadata?.timerEndDate || ''}
                                onChange={e => setEditSectData((prev: any) => ({ ...prev, metadata: { ...prev.metadata, timerEndDate: e.target.value } }))}
                                className="rounded-xl text-sm"
                              />
                            </div>
                          )}
                        </div>

                      {/* Data Source Selection for ALL product-showcasing sections (except slides, features, testimonials, cta, banner, ad_zone) */}
                      {editingSectId && !['hero', 'features', 'testimonials', 'cta', 'banner', 'ad_zone'].includes(layout.find(s => s.id === editingSectId)?.type || '') && (
                        <div className="space-y-4 pt-4 border-t border-border/60">
                          <h4 className="text-xs font-bold text-amber-500 uppercase flex items-center gap-1.5">
                            <Sparkle className="w-3.5 h-3.5" />
                            {t('homepage.dataSourceFiltering')}
                          </h4>
                          
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {/* Source Type Selector */}
                            <div className="space-y-1.5 text-start">
                              <Label className="text-xs font-bold text-slate-500">{t('homepage.primaryProductSource')}</Label>
                              <select
                                value={sourceSelectType}
                                onChange={(e) => {
                                  const val = e.target.value as 'all' | 'store' | 'seller';
                                  setSourceSelectType(val);
                                  if (val === 'all') {
                                    setEditSectData(prev => ({ ...prev, storeId: '', sellerId: '' }));
                                  } else if (val === 'store') {
                                    setEditSectData(prev => ({ ...prev, sellerId: '' }));
                                  } else if (val === 'seller') {
                                    setEditSectData(prev => ({ ...prev, storeId: '' }));
                                  }
                                }}
                                className="bg-background border border-border text-foreground px-3.5 py-2.5 rounded-xl text-sm font-bold w-full"
                              >
                                <option value="all">🌐 {t('homepage.allPlatform')}</option>
                                <option value="store">🏪 {t('homepage.specificStore')}</option>
                                <option value="seller">👤 {t('homepage.specificSeller')}</option>
                              </select>
                            </div>

                            {/* Store Selector */}
                            {sourceSelectType === 'store' && (
                              <div className="space-y-1.5 text-start">
                                <Label className="text-xs font-bold text-slate-500">{t('homepage.selectStore')}</Label>
                                <SearchableSelector
                                  items={storeOptions}
                                  selectedValue={editSectData.storeId || ''}
                                  onSelect={val => setEditSectData(prev => ({ ...prev, storeId: val }))}
                                  placeholder={t('homepage.selectStoreToLink')}
                                  emptyText={t('homepage.noMatchingStores')}
                                  isAr={isAr}
                                />
                              </div>
                            )}

                            {/* Seller Selector */}
                            {sourceSelectType === 'seller' && (
                              <div className="space-y-1.5 text-start">
                                <Label className="text-xs font-bold text-slate-500">{t('homepage.selectSeller')}</Label>
                                <SearchableSelector
                                  items={sellerOptions}
                                  selectedValue={editSectData.sellerId || ''}
                                  onSelect={val => setEditSectData(prev => ({ ...prev, sellerId: val }))}
                                  placeholder={t('homepage.selectSellerToLink')}
                                  emptyText={t('homepage.noMatchingSellers')}
                                  isAr={isAr}
                                />
                              </div>
                            )}

                            {/* Category Filter */}
                            <div className="space-y-1.5 text-start">
                              <Label className="text-xs font-bold text-slate-500">{t('homepage.additionalCategoryFilterOptional')}</Label>
                              <SearchableSelector
                                items={categoryOptions}
                                selectedValue={editSectData.categoryId || ''}
                                onSelect={val => setEditSectData(prev => ({ ...prev, categoryId: val }))}
                                placeholder={t('homepage.selectCategoryToLink')}
                                emptyText={t('homepage.noMatchingCategories')}
                                isAr={isAr}
                              />
                            </div>
                          </div>

                                                    {/* Live Validation Alert */}
                          {(() => {
                            const showWarning = (sourceSelectType === 'store' && editSectData.storeId) || 
                                                 (sourceSelectType === 'seller' && editSectData.sellerId) || 
                                                 editSectData.categoryId;
                            
                            if (!showWarning) return null;

                            return (
                              <div className="flex flex-col gap-2">
                                <p className="text-[10px] text-muted-foreground font-bold flex items-center gap-1.5">
                                  <span>{t('homepage.currentlyMatchingAvailableProducts')}</span>
                                  {isValidatingCount ? (
                                    <span className="text-[10px] text-slate-400 animate-pulse">...</span>
                                  ) : (
                                    <span className={`font-mono text-xs font-black ${(liveMatchingCount || 0) > 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                                      {liveMatchingCount ?? 0}
                                    </span>
                                  )}
                                </p>
                                {!isValidatingCount && liveMatchingCount === 0 && (
                                  <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-500 text-xs font-bold flex items-center gap-2">
                                    <span>⚠️</span>
                                    <span>{t('homepage.warningNoActiveProductsCurrentlyMatchThi')}</span>
                                  </div>
                                )}
                              </div>
                            );
                          })()}
                        </div>
                      )}

                        {/* Hero Specific Metadata */}
                        {layout.find(s => s.id === editingSectId)?.type === 'hero' && (
                          <div className="mt-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-border space-y-6">
                            <h5 className="text-xs font-bold text-indigo-500 border-b pb-2 flex items-center gap-1.5">
                              <span>⚡</span>
                              {t('homepage.sidePromoCardsSettings')}
                            </h5>
                            
                            {/* Side Card 1 */}
                            <div className="space-y-3 p-3 bg-white dark:bg-slate-950 rounded-xl border border-border/80 text-start">
                              <Label className="text-xs font-black text-amber-600 block mb-1">
                                {t('homepage.firstSideCardSettings')}
                              </Label>
                              
                              <div className="space-y-2">
                                <Label className="text-[10px] font-bold text-slate-400">{t('homepage.sideCardType')}</Label>
                                <select
                                  value={editSectData.metadata?.card1Type || 'text'}
                                  onChange={(e) => setEditSectData((prev: any) => ({ ...prev, metadata: { ...prev.metadata, card1Type: e.target.value } }))}
                                  className="bg-background border border-border text-foreground px-3 py-2 rounded-xl text-xs font-bold w-full"
                                >
                                  <option value="text">✍️ {t('homepage.textGradient')}</option>
                                  <option value="ad">🖼️ {t('homepage.fullPromotionImage')}</option>
                                </select>
                              </div>

                              {editSectData.metadata?.card1Type === 'ad' ? (
                                <div className="space-y-3">
                                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                    {languages.map((lang: any) => {
                                      const codeSuffix = lang.code.charAt(0).toUpperCase() + lang.code.slice(1);
                                      const keyName = `card1AdImage${codeSuffix}`;
                                      const inputLabel = `${t('homepage.bannerImageIn')} ${lang.name}`;
                                      return (
                                        <div key={lang.code} className="space-y-1">
                                          <Label className="text-[10px] font-bold text-slate-400">{inputLabel}</Label>
                                          <ImageUploader
                                            value={editSectData.metadata?.[keyName] || ''}
                                            onChange={url => setEditSectData((prev: any) => ({ ...prev, metadata: { ...prev.metadata, [keyName]: url } }))}
                                          />
                                        </div>
                                      );
                                    })}
                                  </div>
                                  <div className="space-y-1">
                                    <Label className="text-[10px] font-bold text-slate-400">{t('homepage.linkUrl')}</Label>
                                    <Input
                                      value={editSectData.metadata?.card1AdLink || ''}
                                      onChange={e => setEditSectData((prev: any) => ({ ...prev, metadata: { ...prev.metadata, card1AdLink: e.target.value } }))}
                                      className="rounded-xl text-xs"
                                      placeholder="/search?q=electronics"
                                    />
                                  </div>
                                </div>
                              ) : (
                                <>
                                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                    {languages.map((lang: any) => {
                                      const codeSuffix = lang.code.charAt(0).toUpperCase() + lang.code.slice(1);
                                      const keyName = `card1Badge${codeSuffix}`;
                                      const inputLabel = `${t('homepage.badgeIn')} ${lang.name}`;
                                      return (
                                        <div key={lang.code} className="space-y-1">
                                          <Label className="text-[10px] font-bold text-slate-400">{inputLabel}</Label>
                                          <Input
                                            value={editSectData.metadata?.[keyName] || ''}
                                            onChange={e => setEditSectData((prev: any) => ({ ...prev, metadata: { ...prev.metadata, [keyName]: e.target.value } }))}
                                            className="rounded-xl text-xs"
                                            placeholder={lang.code === 'ar' ? 'أحدث الهواتف' : 'Latest Mobiles'}
                                          />
                                        </div>
                                      );
                                    })}
                                  </div>
                                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                    {languages.map((lang: any) => {
                                      const codeSuffix = lang.code.charAt(0).toUpperCase() + lang.code.slice(1);
                                      const keyName = `card1Title${codeSuffix}`;
                                      const inputLabel = `${t('homepage.titleIn1')} ${lang.name}`;
                                      return (
                                        <div key={lang.code} className="space-y-1">
                                          <Label className="text-[10px] font-bold text-slate-400">{inputLabel}</Label>
                                          <Input
                                            value={editSectData.metadata?.[keyName] || ''}
                                            onChange={e => setEditSectData((prev: any) => ({ ...prev, metadata: { ...prev.metadata, [keyName]: e.target.value } }))}
                                            className="rounded-xl text-xs"
                                            placeholder={lang.code === 'ar' ? 'وفر حتى 50% على أجهزة شاومي وآيفون' : 'Save up to 50% on iPhone & Xiaomi'}
                                          />
                                        </div>
                                      );
                                    })}
                                  </div>
                                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                    {languages.map((lang: any) => {
                                      const codeSuffix = lang.code.charAt(0).toUpperCase() + lang.code.slice(1);
                                      const keyName = `card1Cta${codeSuffix}`;
                                      const inputLabel = `${t('homepage.ctaTextIn')} ${lang.name}`;
                                      return (
                                        <div key={lang.code} className="space-y-1 col-span-1">
                                          <Label className="text-[10px] font-bold text-slate-400">{inputLabel}</Label>
                                          <Input
                                            value={editSectData.metadata?.[keyName] || ''}
                                            onChange={e => setEditSectData((prev: any) => ({ ...prev, metadata: { ...prev.metadata, [keyName]: e.target.value } }))}
                                            className="rounded-xl text-xs"
                                            placeholder={lang.code === 'ar' ? 'تسوق الأجهزة' : 'Shop Devices'}
                                          />
                                        </div>
                                      );
                                    })}
                                    <div className="space-y-1 col-span-1">
                                      <Label className="text-[10px] font-bold text-slate-400">{t('homepage.linkUrl')}</Label>
                                      <Input
                                        value={editSectData.metadata?.card1Link || ''}
                                        onChange={e => setEditSectData((prev: any) => ({ ...prev, metadata: { ...prev.metadata, card1Link: e.target.value } }))}
                                        className="rounded-xl text-xs"
                                        placeholder="/search?q=electronics"
                                      />
                                    </div>
                                  </div>
                                </>
                              )}
                            </div>
                            
                            {/* Side Card 2 */}
                            <div className="space-y-3 p-3 bg-white dark:bg-slate-950 rounded-xl border border-border/80 text-start">
                              <Label className="text-xs font-black text-rose-600 block mb-1">
                                {t('homepage.secondSideCardSettings')}
                              </Label>
                              
                              <div className="space-y-2">
                                <Label className="text-[10px] font-bold text-slate-400">{t('homepage.sideCardType')}</Label>
                                <select
                                  value={editSectData.metadata?.card2Type || 'text'}
                                  onChange={(e) => setEditSectData((prev: any) => ({ ...prev, metadata: { ...prev.metadata, card2Type: e.target.value } }))}
                                  className="bg-background border border-border text-foreground px-3 py-2 rounded-xl text-xs font-bold w-full"
                                >
                                  <option value="text">✍️ {t('homepage.textGradient')}</option>
                                  <option value="ad">🖼️ {t('homepage.fullPromotionImage')}</option>
                                </select>
                              </div>

                              {editSectData.metadata?.card2Type === 'ad' ? (
                                <div className="space-y-3">
                                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                    {languages.map((lang: any) => {
                                      const codeSuffix = lang.code.charAt(0).toUpperCase() + lang.code.slice(1);
                                      const keyName = `card2AdImage${codeSuffix}`;
                                      const inputLabel = `${t('homepage.bannerImageIn')} ${lang.name}`;
                                      return (
                                        <div key={lang.code} className="space-y-1">
                                          <Label className="text-[10px] font-bold text-slate-400">{inputLabel}</Label>
                                          <ImageUploader
                                            value={editSectData.metadata?.[keyName] || ''}
                                            onChange={url => setEditSectData((prev: any) => ({ ...prev, metadata: { ...prev.metadata, [keyName]: url } }))}
                                          />
                                        </div>
                                      );
                                    })}
                                  </div>
                                  <div className="space-y-1">
                                    <Label className="text-[10px] font-bold text-slate-400">{t('homepage.linkUrl')}</Label>
                                    <Input
                                      value={editSectData.metadata?.card2AdLink || ''}
                                      onChange={e => setEditSectData((prev: any) => ({ ...prev, metadata: { ...prev.metadata, card2AdLink: e.target.value } }))}
                                      className="rounded-xl text-xs"
                                      placeholder="/search?q=perfumes"
                                    />
                                  </div>
                                </div>
                              ) : (
                                <>
                                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                    {languages.map((lang: any) => {
                                      const codeSuffix = lang.code.charAt(0).toUpperCase() + lang.code.slice(1);
                                      const keyName = `card2Badge${codeSuffix}`;
                                      const inputLabel = `${t('homepage.badgeIn')} ${lang.name}`;
                                      return (
                                        <div key={lang.code} className="space-y-1">
                                          <Label className="text-[10px] font-bold text-slate-400">{inputLabel}</Label>
                                          <Input
                                            value={editSectData.metadata?.[keyName] || ''}
                                            onChange={e => setEditSectData((prev: any) => ({ ...prev, metadata: { ...prev.metadata, [keyName]: e.target.value } }))}
                                            className="rounded-xl text-xs"
                                            placeholder={lang.code === 'ar' ? 'الجمال والعطور' : 'Beauty Deals'}
                                          />
                                        </div>
                                      );
                                    })}
                                  </div>
                                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                    {languages.map((lang: any) => {
                                      const codeSuffix = lang.code.charAt(0).toUpperCase() + lang.code.slice(1);
                                      const keyName = `card2Title${codeSuffix}`;
                                      const inputLabel = `${t('homepage.titleIn1')} ${lang.name}`;
                                      return (
                                        <div key={lang.code} className="space-y-1">
                                          <Label className="text-[10px] font-bold text-slate-400">{inputLabel}</Label>
                                          <Input
                                            value={editSectData.metadata?.[keyName] || ''}
                                            onChange={e => setEditSectData((prev: any) => ({ ...prev, metadata: { ...prev.metadata, [keyName]: e.target.value } }))}
                                            className="rounded-xl text-xs"
                                            placeholder={lang.code === 'ar' ? 'روائح تسحر الجميع بأسعار لا تقاوم' : 'Fragrances that captivate at unbeatable prices'}
                                          />
                                        </div>
                                      );
                                    })}
                                  </div>
                                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                    {languages.map((lang: any) => {
                                      const codeSuffix = lang.code.charAt(0).toUpperCase() + lang.code.slice(1);
                                      const keyName = `card2Cta${codeSuffix}`;
                                      const inputLabel = `${t('homepage.ctaTextIn')} ${lang.name}`;
                                      return (
                                        <div key={lang.code} className="space-y-1 col-span-1">
                                          <Label className="text-[10px] font-bold text-slate-400">{inputLabel}</Label>
                                          <Input
                                            value={editSectData.metadata?.[keyName] || ''}
                                            onChange={e => setEditSectData((prev: any) => ({ ...prev, metadata: { ...prev.metadata, [keyName]: e.target.value } }))}
                                            className="rounded-xl text-xs"
                                            placeholder={lang.code === 'ar' ? 'اكتشف العطور' : 'Explore Now'}
                                          />
                                        </div>
                                      );
                                    })}
                                    <div className="space-y-1 col-span-1">
                                      <Label className="text-[10px] font-bold text-slate-400">{t('homepage.linkUrl')}</Label>
                                      <Input
                                        value={editSectData.metadata?.card2Link || ''}
                                        onChange={e => setEditSectData((prev: any) => ({ ...prev, metadata: { ...prev.metadata, card2Link: e.target.value } }))}
                                        className="rounded-xl text-xs"
                                        placeholder="/search?q=perfumes"
                                      />
                                    </div>
                                  </div>
                                </>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Bento Specific Metadata */}
                        {layout.find(s => s.id === editingSectId)?.type === 'bento_offers' && (
                          <div className="mt-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-border space-y-6">
                            <h5 className="text-xs font-bold text-indigo-500 border-b pb-2 flex items-center gap-1.5">
                              <span>⚡</span>
                              {t('homepage.bentoCardsTextsSources')}
                            </h5>
                            
                            {/* Right Card */}
                            <div className="space-y-3 p-3 bg-white dark:bg-slate-950 rounded-xl border border-border/80 text-start">
                              <Label className="text-xs font-black text-amber-600 block mb-1">
                                {t('homepage.rightCardSettings')}
                              </Label>
                              
                              <div className="space-y-2">
                                <Label className="text-[10px] font-bold text-slate-400">{t('homepage.rightCardType')}</Label>
                                <select
                                  value={editSectData.metadata?.rightCardType || 'products'}
                                  onChange={(e) => setEditSectData((prev: any) => ({ ...prev, metadata: { ...prev.metadata, rightCardType: e.target.value } }))}
                                  className="bg-background border border-border text-foreground px-3 py-2 rounded-xl text-xs font-bold w-full"
                                >
                                  <option value="products">🛍️ {t('homepage.dynamicProductsShowcase')}</option>
                                  <option value="ad">🖼️ {t('homepage.fullPromotionImage1')}</option>
                                </select>
                              </div>

                              {editSectData.metadata?.rightCardType === 'ad' ? (
                                <div className="space-y-3">
                                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                    {languages.map((lang: any) => {
                                      const codeSuffix = lang.code.charAt(0).toUpperCase() + lang.code.slice(1);
                                      const keyName = `rightCardAdImage${codeSuffix}`;
                                      const inputLabel = `${t('homepage.bannerImageIn')} ${lang.name}`;
                                      return (
                                        <div key={lang.code} className="space-y-1">
                                          <Label className="text-[10px] font-bold text-slate-400">{inputLabel}</Label>
                                          <ImageUploader
                                            value={editSectData.metadata?.[keyName] || ''}
                                            onChange={url => setEditSectData((prev: any) => ({ ...prev, metadata: { ...prev.metadata, [keyName]: url } }))}
                                          />
                                        </div>
                                      );
                                    })}
                                  </div>
                                  <div className="space-y-1">
                                    <Label className="text-[10px] font-bold text-slate-400">{t('homepage.linkUrl')}</Label>
                                    <Input
                                      value={editSectData.metadata?.rightCardAdLink || ''}
                                      onChange={e => setEditSectData((prev: any) => ({ ...prev, metadata: { ...prev.metadata, rightCardAdLink: e.target.value } }))}
                                      className="rounded-xl text-xs"
                                      placeholder="/search?q=deals"
                                    />
                                  </div>
                                </div>
                              ) : (
                                <>
                                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                    {languages.map((lang: any) => {
                                      const codeSuffix = lang.code.charAt(0).toUpperCase() + lang.code.slice(1);
                                      const keyName = `customText1${codeSuffix}`;
                                      const inputLabel = `${t('homepage.promoTitleIn')} ${lang.name}`;
                                      return (
                                        <div key={lang.code} className="space-y-1">
                                          <Label className="text-[10px] font-bold text-slate-400">{inputLabel}</Label>
                                          <Input
                                            value={editSectData.metadata?.[keyName] || ''}
                                            onChange={e => setEditSectData((prev: any) => ({ ...prev, metadata: { ...prev.metadata, [keyName]: e.target.value } }))}
                                            className="rounded-xl text-sm"
                                            placeholder={lang.code === 'ar' ? 'نوّنها أكثر ووفّر أكثر على كل اللي تحبّه' : 'Shop more & save on what you love'}
                                          />
                                        </div>
                                      );
                                    })}
                                  </div>
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <div className="space-y-1">
                                      <Label className="text-[10px] font-bold text-slate-400">{t('homepage.sortFilter')}</Label>
                                      <select
                                        value={editSectData.metadata?.subFilter1 || 'smart'}
                                        onChange={(e) => setEditSectData((prev: any) => ({ ...prev, metadata: { ...prev.metadata, subFilter1: e.target.value } }))}
                                        className="bg-background border border-border text-foreground px-3 py-2 rounded-xl text-xs font-bold w-full"
                                      >
                                        <option value="smart">🤖 {t('homepage.auto')}</option>
                                        <option value="most_sold">🔥 {t('homepage.mostSold')}</option>
                                        <option value="newest">🆕 {t('homepage.newest')}</option>
                                        <option value="has_coupons">🎟️ {t('homepage.couponOffers')}</option>
                                        <option value="lowest_price">💰 {t('homepage.lowestPrice')}</option>
                                      </select>
                                    </div>
                                    <div className="space-y-1">
                                      <Label className="text-[10px] font-bold text-slate-400">{t('homepage.targetCategory')}</Label>
                                      <select
                                        value={editSectData.metadata?.rightCategory || ''}
                                        onChange={(e) => setEditSectData((prev: any) => ({ ...prev, metadata: { ...prev.metadata, rightCategory: e.target.value } }))}
                                        className="bg-background border border-border text-foreground px-3 py-2 rounded-xl text-xs font-bold w-full"
                                      >
                                        <option value="">-- {t('homepage.all')} --</option>
                                        {categoriesList.map(c => (
                                          <option key={c.id} value={c.id}>{isAr ? c.name : (c.nameEn || c.name)}</option>
                                        ))}
                                      </select>
                                    </div>
                                  </div>
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <div className="space-y-1">
                                      <Label className="text-[10px] font-bold text-slate-400">{t('homepage.targetStore')}</Label>
                                      <select
                                        value={editSectData.metadata?.rightStore || ''}
                                        onChange={(e) => setEditSectData((prev: any) => ({ ...prev, metadata: { ...prev.metadata, rightStore: e.target.value } }))}
                                        className="bg-background border border-border text-foreground px-3 py-2 rounded-xl text-xs font-bold w-full"
                                      >
                                        <option value="">-- {t('homepage.all')} --</option>
                                        {allStores.map(s => (
                                          <option key={s.id} value={s.id}>{isAr ? s.name : (s.nameEn || s.name)}</option>
                                        ))}
                                      </select>
                                    </div>
                                    <div className="space-y-1">
                                      <Label className="text-[10px] font-bold text-slate-400">{t('homepage.targetSeller')}</Label>
                                      <select
                                        value={editSectData.metadata?.rightSeller || ''}
                                        onChange={(e) => setEditSectData((prev: any) => ({ ...prev, metadata: { ...prev.metadata, rightSeller: e.target.value } }))}
                                        className="bg-background border border-border text-foreground px-3 py-2 rounded-xl text-xs font-bold w-full"
                                      >
                                        <option value="">-- {t('homepage.all')} --</option>
                                        {allSellers.map(s => (
                                          <option key={s.id} value={s.id}>{s.storeName || s.user?.name || s.id}</option>
                                        ))}
                                      </select>
                                    </div>
                                  </div>
                                </>
                              )}
                            </div>

                            {/* Center Card */}
                            <div className="space-y-3 p-3 bg-white dark:bg-slate-950 rounded-xl border border-border/80 text-start">
                              <Label className="text-xs font-black text-rose-600 block mb-1">
                                {t('homepage.centerCardSettingsCountdownDeals')}
                              </Label>

                              <div className="space-y-2">
                                <Label className="text-[10px] font-bold text-slate-400">{t('homepage.centerCardType')}</Label>
                                <select
                                  value={editSectData.metadata?.centerCardType || 'products'}
                                  onChange={(e) => setEditSectData((prev: any) => ({ ...prev, metadata: { ...prev.metadata, centerCardType: e.target.value } }))}
                                  className="bg-background border border-border text-foreground px-3 py-2 rounded-xl text-xs font-bold w-full"
                                >
                                  <option value="products">🛍️ {t('homepage.countdownProducts')}</option>
                                  <option value="ad">🖼️ {t('homepage.fullPromotionImage1')}</option>
                                </select>
                              </div>

                              {editSectData.metadata?.centerCardType === 'ad' ? (
                                <div className="space-y-3">
                                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                    {languages.map((lang: any) => {
                                      const codeSuffix = lang.code.charAt(0).toUpperCase() + lang.code.slice(1);
                                      const keyName = `centerCardAdImage${codeSuffix}`;
                                      const inputLabel = `${t('homepage.bannerImageIn')} ${lang.name}`;
                                      return (
                                        <div key={lang.code} className="space-y-1">
                                          <Label className="text-[10px] font-bold text-slate-400">{inputLabel}</Label>
                                          <ImageUploader
                                            value={editSectData.metadata?.[keyName] || ''}
                                            onChange={url => setEditSectData((prev: any) => ({ ...prev, metadata: { ...prev.metadata, [keyName]: url } }))}
                                          />
                                        </div>
                                      );
                                    })}
                                  </div>
                                  <div className="space-y-1">
                                    <Label className="text-[10px] font-bold text-slate-400">{t('homepage.linkUrl')}</Label>
                                    <Input
                                      value={editSectData.metadata?.centerCardAdLink || ''}
                                      onChange={e => setEditSectData((prev: any) => ({ ...prev, metadata: { ...prev.metadata, centerCardAdLink: e.target.value } }))}
                                      className="rounded-xl text-xs"
                                      placeholder="/search?q=megadeals"
                                    />
                                  </div>
                                </div>
                              ) : (
                                <>
                                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                    {languages.map((lang: any) => {
                                      const codeSuffix = lang.code.charAt(0).toUpperCase() + lang.code.slice(1);
                                      const keyName = `customTextCenter${codeSuffix}`;
                                      const inputLabel = `${t('homepage.centerCardTitleIn')} ${lang.name}`;
                                      return (
                                        <div key={lang.code} className="space-y-1">
                                          <Label className="text-[10px] font-bold text-slate-400">{inputLabel}</Label>
                                          <Input
                                            value={editSectData.metadata?.[keyName] || ''}
                                            onChange={e => setEditSectData((prev: any) => ({ ...prev, metadata: { ...prev.metadata, [keyName]: e.target.value } }))}
                                            className="rounded-xl text-sm"
                                            placeholder={lang.code === 'ar' ? 'عروض ميجا' : 'Mega Offers'}
                                          />
                                        </div>
                                      );
                                    })}
                                  </div>
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <div className="space-y-1">
                                      <Label className="text-[10px] font-bold text-slate-400">{t('homepage.centerSortFilter')}</Label>
                                      <select
                                        value={editSectData.metadata?.subFilterCenter || 'smart'}
                                        onChange={(e) => setEditSectData((prev: any) => ({ ...prev, metadata: { ...prev.metadata, subFilterCenter: e.target.value } }))}
                                        className="bg-background border border-border text-foreground px-3 py-2 rounded-xl text-xs font-bold w-full"
                                      >
                                        <option value="smart">🤖 {t('homepage.auto')}</option>
                                        <option value="most_sold">🔥 {t('homepage.mostSold')}</option>
                                        <option value="newest">🆕 {t('homepage.newest')}</option>
                                        <option value="has_coupons">🎟️ {t('homepage.couponOffers')}</option>
                                        <option value="lowest_price">💰 {t('homepage.lowestPrice')}</option>
                                      </select>
                                    </div>
                                    <div className="space-y-1">
                                      <Label className="text-[10px] font-bold text-slate-400">{t('homepage.targetCategory')}</Label>
                                      <select
                                        value={editSectData.metadata?.centerCategory || ''}
                                        onChange={(e) => setEditSectData((prev: any) => ({ ...prev, metadata: { ...prev.metadata, centerCategory: e.target.value } }))}
                                        className="bg-background border border-border text-foreground px-3 py-2 rounded-xl text-xs font-bold w-full"
                                      >
                                        <option value="">-- {t('homepage.all')} --</option>
                                        {categoriesList.map(c => (
                                          <option key={c.id} value={c.id}>{isAr ? c.name : (c.nameEn || c.name)}</option>
                                        ))}
                                      </select>
                                    </div>
                                  </div>
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <div className="space-y-1">
                                      <Label className="text-[10px] font-bold text-slate-400">{t('homepage.targetStore')}</Label>
                                      <select
                                        value={editSectData.metadata?.centerStore || ''}
                                        onChange={(e) => setEditSectData((prev: any) => ({ ...prev, metadata: { ...prev.metadata, centerStore: e.target.value } }))}
                                        className="bg-background border border-border text-foreground px-3 py-2 rounded-xl text-xs font-bold w-full"
                                      >
                                        <option value="">-- {t('homepage.all')} --</option>
                                        {allStores.map(s => (
                                          <option key={s.id} value={s.id}>{isAr ? s.name : (s.nameEn || s.name)}</option>
                                        ))}
                                      </select>
                                    </div>
                                    <div className="space-y-1">
                                      <Label className="text-[10px] font-bold text-slate-400">{t('homepage.targetSeller')}</Label>
                                      <select
                                        value={editSectData.metadata?.centerSeller || ''}
                                        onChange={(e) => setEditSectData((prev: any) => ({ ...prev, metadata: { ...prev.metadata, centerSeller: e.target.value } }))}
                                        className="bg-background border border-border text-foreground px-3 py-2 rounded-xl text-xs font-bold w-full"
                                      >
                                        <option value="">-- {t('homepage.all')} --</option>
                                        {allSellers.map(s => (
                                          <option key={s.id} value={s.id}>{s.storeName || s.user?.name || s.id}</option>
                                        ))}
                                      </select>
                                    </div>
                                  </div>
                                </>
                              )}
                            </div>

                            {/* Left Card */}
                            <div className="space-y-3 p-3 bg-white dark:bg-slate-950 rounded-xl border border-border/80 text-start">
                              <Label className="text-xs font-black text-indigo-600 block mb-1">
                                {t('homepage.leftCardSettings')}
                              </Label>
                              
                              <div className="space-y-2">
                                <Label className="text-[10px] font-bold text-slate-400">{t('homepage.leftCardType')}</Label>
                                <select
                                  value={editSectData.metadata?.leftCardType || 'products'}
                                  onChange={(e) => setEditSectData((prev: any) => ({ ...prev, metadata: { ...prev.metadata, leftCardType: e.target.value } }))}
                                  className="bg-background border border-border text-foreground px-3 py-2 rounded-xl text-xs font-bold w-full"
                                >
                                  <option value="products">🛍️ {t('homepage.dynamicProductsShowcase')}</option>
                                  <option value="ad">🖼️ {t('homepage.fullPromotionImage1')}</option>
                                </select>
                              </div>

                              {editSectData.metadata?.leftCardType === 'ad' ? (
                                <div className="space-y-3">
                                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                    {languages.map((lang: any) => {
                                      const codeSuffix = lang.code.charAt(0).toUpperCase() + lang.code.slice(1);
                                      const keyName = `leftCardAdImage${codeSuffix}`;
                                      const inputLabel = `${t('homepage.bannerImageIn')} ${lang.name}`;
                                      return (
                                        <div key={lang.code} className="space-y-1">
                                          <Label className="text-[10px] font-bold text-slate-400">{inputLabel}</Label>
                                          <ImageUploader
                                            value={editSectData.metadata?.[keyName] || ''}
                                            onChange={url => setEditSectData((prev: any) => ({ ...prev, metadata: { ...prev.metadata, [keyName]: url } }))}
                                          />
                                        </div>
                                      );
                                    })}
                                  </div>
                                  <div className="space-y-1">
                                    <Label className="text-[10px] font-bold text-slate-400">{t('homepage.linkUrl')}</Label>
                                    <Input
                                      value={editSectData.metadata?.leftCardAdLink || ''}
                                      onChange={e => setEditSectData((prev: any) => ({ ...prev, metadata: { ...prev.metadata, leftCardAdLink: e.target.value } }))}
                                      className="rounded-xl text-xs"
                                      placeholder="/search?q=hotdeals"
                                    />
                                  </div>
                                </div>
                              ) : (
                                <>
                                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                    {languages.map((lang: any) => {
                                      const codeSuffix = lang.code.charAt(0).toUpperCase() + lang.code.slice(1);
                                      const keyName = `customText2${codeSuffix}`;
                                      const inputLabel = `${t('homepage.promoTitleIn1')} ${lang.name}`;
                                      return (
                                        <div key={lang.code} className="space-y-1">
                                          <Label className="text-[10px] font-bold text-slate-400">{inputLabel}</Label>
                                          <Input
                                            value={editSectData.metadata?.[keyName] || ''}
                                            onChange={e => setEditSectData((prev: any) => ({ ...prev, metadata: { ...prev.metadata, [keyName]: e.target.value } }))}
                                            className="rounded-xl text-sm"
                                            placeholder={lang.code === 'ar' ? 'عليها العين' : 'Hot Deals'}
                                          />
                                        </div>
                                      );
                                    })}
                                  </div>
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <div className="space-y-1">
                                      <Label className="text-[10px] font-bold text-slate-400">{t('homepage.sortFilter')}</Label>
                                      <select
                                        value={editSectData.metadata?.subFilter2 || 'smart'}
                                        onChange={(e) => setEditSectData((prev: any) => ({ ...prev, metadata: { ...prev.metadata, subFilter2: e.target.value } }))}
                                        className="bg-background border border-border text-foreground px-3 py-2 rounded-xl text-xs font-bold w-full"
                                      >
                                        <option value="smart">🤖 {t('homepage.auto')}</option>
                                        <option value="most_sold">🔥 {t('homepage.mostSold')}</option>
                                        <option value="most_viewed">👁️ {t('homepage.mostViewed')}</option>
                                        <option value="has_coupons">🎟️ {t('homepage.couponOffers')}</option>
                                        <option value="lowest_price">💰 {t('homepage.lowestPrice')}</option>
                                      </select>
                                    </div>
                                    <div className="space-y-1">
                                      <Label className="text-[10px] font-bold text-slate-400">{t('homepage.targetCategory')}</Label>
                                      <select
                                        value={editSectData.metadata?.leftCategory || ''}
                                        onChange={(e) => setEditSectData((prev: any) => ({ ...prev, metadata: { ...prev.metadata, leftCategory: e.target.value } }))}
                                        className="bg-background border border-border text-foreground px-3 py-2 rounded-xl text-xs font-bold w-full"
                                      >
                                        <option value="">-- {t('homepage.all')} --</option>
                                        {categoriesList.map(c => (
                                          <option key={c.id} value={c.id}>{isAr ? c.name : (c.nameEn || c.name)}</option>
                                        ))}
                                      </select>
                                    </div>
                                  </div>
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <div className="space-y-1">
                                      <Label className="text-[10px] font-bold text-slate-400">{t('homepage.targetStore')}</Label>
                                      <select
                                        value={editSectData.metadata?.leftStore || ''}
                                        onChange={(e) => setEditSectData((prev: any) => ({ ...prev, metadata: { ...prev.metadata, leftStore: e.target.value } }))}
                                        className="bg-background border border-border text-foreground px-3 py-2 rounded-xl text-xs font-bold w-full"
                                      >
                                        <option value="">-- {t('homepage.all')} --</option>
                                        {allStores.map(s => (
                                          <option key={s.id} value={s.id}>{isAr ? s.name : (s.nameEn || s.name)}</option>
                                        ))}
                                      </select>
                                    </div>
                                    <div className="space-y-1">
                                      <Label className="text-[10px] font-bold text-slate-400">{t('homepage.targetSeller')}</Label>
                                      <select
                                        value={editSectData.metadata?.leftSeller || ''}
                                        onChange={(e) => setEditSectData((prev: any) => ({ ...prev, metadata: { ...prev.metadata, leftSeller: e.target.value } }))}
                                        className="bg-background border border-border text-foreground px-3 py-2 rounded-xl text-xs font-bold w-full"
                                      >
                                        <option value="">-- {t('homepage.all')} --</option>
                                        {allSellers.map(s => (
                                          <option key={s.id} value={s.id}>{s.storeName || s.user?.name || s.id}</option>
                                        ))}
                                      </select>
                                    </div>
                                  </div>
                                </>
                              )}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Advanced Styling & Visibility Control */}
                      <div className="space-y-4 pt-4 border-t border-border/60">
                        <h4 className="text-xs font-bold text-teal-500 uppercase flex items-center gap-1.5">
                          {t('homepage.sectionStylingVisibility')}
                        </h4>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2 text-start">
                            <Label className="text-[10px] font-bold text-slate-400">{t('homepage.paddingTop')}</Label>
                            <select
                              value={editSectData.metadata?.paddingTop || 'pt-8'}
                              onChange={(e) => setEditSectData((prev: any) => ({ ...prev, metadata: { ...prev.metadata, paddingTop: e.target.value } }))}
                              className="bg-background border border-border text-foreground px-3 py-2 rounded-xl text-xs font-bold w-full"
                            >
                              <option value="pt-0">بدون مسافة (0px)</option>
                              <option value="pt-4">صغيرة (16px)</option>
                              <option value="pt-8">متوسطة (32px)</option>
                              <option value="pt-12">كبيرة (48px)</option>
                              <option value="pt-16">كبيرة جداً (64px)</option>
                            </select>
                          </div>
                          <div className="space-y-2 text-start">
                            <Label className="text-[10px] font-bold text-slate-400">{t('homepage.paddingBottom')}</Label>
                            <select
                              value={editSectData.metadata?.paddingBottom || 'pb-8'}
                              onChange={(e) => setEditSectData((prev: any) => ({ ...prev, metadata: { ...prev.metadata, paddingBottom: e.target.value } }))}
                              className="bg-background border border-border text-foreground px-3 py-2 rounded-xl text-xs font-bold w-full"
                            >
                              <option value="pb-0">بدون مسافة (0px)</option>
                              <option value="pb-4">صغيرة (16px)</option>
                              <option value="pb-8">متوسطة (32px)</option>
                              <option value="pb-12">كبيرة (48px)</option>
                              <option value="pb-16">كبيرة جداً (64px)</option>
                            </select>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="space-y-2 text-start">
                            <Label className="text-[10px] font-bold text-slate-400">{t('homepage.backgroundColor')}</Label>
                            <select
                              value={editSectData.metadata?.backgroundColor || 'transparent'}
                              onChange={(e) => setEditSectData((prev: any) => ({ ...prev, metadata: { ...prev.metadata, backgroundColor: e.target.value } }))}
                              className="bg-background border border-border text-foreground px-3 py-2 rounded-xl text-xs font-bold w-full"
                            >
                              <option value="transparent">شفاف (الافتراضي)</option>
                              <option value="bg-slate-50 dark:bg-slate-900/50">رمادي فاتح (Section BG)</option>
                              <option value="bg-brand/5">لون الهوية (خفيف)</option>
                            </select>
                          </div>
                          
                          <div className="space-y-2 text-start">
                            <Label className="text-[10px] font-bold text-slate-400">{t('homepage.mobileVisibility')}</Label>
                            <select
                              value={editSectData.metadata?.isMobileHidden ? 'hidden' : 'visible'}
                              onChange={(e) => setEditSectData((prev: any) => ({ ...prev, metadata: { ...prev.metadata, isMobileHidden: e.target.value === 'hidden' } }))}
                              className="bg-background border border-border text-foreground px-3 py-2 rounded-xl text-xs font-bold w-full"
                            >
                              <option value="visible">ظاهر (مرئي)</option>
                              <option value="hidden">مخفي في الجوال</option>
                            </select>
                          </div>

                          <div className="space-y-2 text-start">
                            <Label className="text-[10px] font-bold text-slate-400">{t('homepage.desktopVisibility')}</Label>
                            <select
                              value={editSectData.metadata?.isDesktopHidden ? 'hidden' : 'visible'}
                              onChange={(e) => setEditSectData((prev: any) => ({ ...prev, metadata: { ...prev.metadata, isDesktopHidden: e.target.value === 'hidden' } }))}
                              className="bg-background border border-border text-foreground px-3 py-2 rounded-xl text-xs font-bold w-full"
                            >
                              <option value="visible">ظاهر (مرئي)</option>
                              <option value="hidden">مخفي في الكمبيوتر</option>
                            </select>
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-end gap-2 pt-4 border-t border-border/60">
                        <Button variant="ghost" onClick={() => setEditingSectId(null)} className="rounded-xl text-xs font-bold">
                          {t('homepage.cancel')}
                        </Button>
                        <Button onClick={saveSectionSettings} className="rounded-xl text-xs font-bold gap-1 px-4">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          {t('homepage.confirmSectionSettings')}
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {/* Pinning Tab - Completely rebuilt with Autocomplete Comboboxes */}
          {activeTab === 'pinning' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column: Preloaded Select selectors */}
              <Card className="lg:col-span-5 card-surface rounded-[24px] shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg font-bold">{t('homepage.selectPinItems')}</CardTitle>
                  <CardDescription>
                    {t('homepage.pinItemsDirectlyUsingDropdownSelectors')}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Pin Products Section */}
                  <div className="space-y-2 text-start border-b pb-4 border-border/40">
                    <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5 mb-2">
                      <span>🛒</span> {t('homepage.pinProducts')}
                    </Label>
                    <div className="flex gap-2 items-center">
                      <div className="grow">
                        <SearchableSelector
                          items={productOptions}
                          selectedValue={selectedProdId}
                          onSelect={setSelectedProdId}
                          placeholder={t('homepage.chooseAProductToPin')}
                          emptyText={t('homepage.noMatchingProducts')}
                          isAr={isAr}
                        />
                      </div>
                      <Button
                        onClick={() => handlePinPreloadedItem('product')}
                        disabled={!selectedProdId}
                        className="rounded-xl font-bold px-4 shrink-0"
                      >
                        <Plus className="w-4 h-4 me-1" />
                        {t('homepage.pin')}
                      </Button>
                    </div>
                  </div>

                  {/* Pin Premium Stores Section */}
                  <div className="space-y-2 text-start border-b pb-4 border-border/40">
                    <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5 mb-2">
                      <span>🏪</span> {t('homepage.pinPremiumStores')}
                    </Label>
                    <div className="flex gap-2 items-center">
                      <div className="grow">
                        <SearchableSelector
                          items={storeOptions}
                          selectedValue={selectedStoreId}
                          onSelect={setSelectedStoreId}
                          placeholder={t('homepage.chooseAStoreToPin')}
                          emptyText={t('homepage.noMatchingStores')}
                          isAr={isAr}
                        />
                      </div>
                      <Button
                        onClick={() => handlePinPreloadedItem('store')}
                        disabled={!selectedStoreId}
                        className="rounded-xl font-bold px-4 shrink-0"
                      >
                        <Plus className="w-4 h-4 me-1" />
                        {t('homepage.pin')}
                      </Button>
                    </div>
                  </div>

                  {/* Pin Freelance Sellers Section */}
                  <div className="space-y-2 text-start">
                    <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5 mb-2">
                      <span>👤</span> {t('homepage.pinFreelanceSellers')}
                    </Label>
                    <div className="flex gap-2 items-center">
                      <div className="grow">
                        <SearchableSelector
                          items={sellerOptions}
                          selectedValue={selectedSellerId}
                          onSelect={setSelectedSellerId}
                          placeholder={t('homepage.chooseASellerToPin')}
                          emptyText={t('homepage.noMatchingSellers')}
                          isAr={isAr}
                        />
                      </div>
                      <Button
                        onClick={() => handlePinPreloadedItem('seller')}
                        disabled={!selectedSellerId}
                        className="rounded-xl font-bold px-4 shrink-0"
                      >
                        <Plus className="w-4 h-4 me-1" />
                        {t('homepage.pin')}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Right Column: Manage Pinned lists */}
              <Card className="lg:col-span-7 card-surface rounded-[24px] shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg font-bold flex items-center gap-1.5">
                    <Pin className="w-5 h-5 text-brand" />
                    {t('homepage.pinnedItems')}
                  </CardTitle>
                  <CardDescription>
                    {t('homepage.manageThePinnedDisplaysPriority')}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-4">
                    {['products', 'stores', 'sellers'].map((type) => {
                      const list = pinned[type as 'products' | 'stores' | 'sellers'] || [];
                      const typeLabel = type === 'products' ? t('homepage.pinnedProducts') : type === 'stores' ? t('homepage.pinnedStores') : t('homepage.pinnedSellers');
                      return (
                        <div key={type} className="space-y-2">
                          <Label className="text-xs font-black text-slate-500 uppercase tracking-wider flex justify-between items-center">
                            <span>{typeLabel}</span>
                            <Badge variant="outline" className="font-mono">{list.length}</Badge>
                          </Label>
                          {list.length === 0 ? (
                            <div className="p-5 border border-dashed rounded-[18px] text-center text-xs text-muted-foreground">{t('homepage.noItemsPinnedYet')}</div>
                          ) : (
                            <div className="border border-border/80 rounded-[18px] divide-y bg-background max-h-[220px] overflow-y-auto shadow-inner">
                              {list.map((item: any, idx: number) => (
                                <div key={item.id} className="flex items-center justify-between p-3 hover:bg-slate-50/50 dark:hover:bg-slate-800/10 transition-colors">
                                  <div className="flex items-center gap-2.5 min-w-0">
                                    <span className="font-mono text-[10px] text-muted-foreground w-6 shrink-0">#{idx + 1}</span>
                                    {item.image ? (
                                      <img src={item.image} alt="" className="w-8 h-8 rounded-lg object-cover bg-slate-50" />
                                    ) : (
                                      <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-xs">📦</div>
                                    )}
                                    <div className="min-w-0">
                                      <p className="text-xs font-bold truncate text-slate-800 dark:text-slate-100">{item.name}</p>
                                      {item.price > 0 && <p className="text-[10px] text-amber-500 font-bold">{item.price.toLocaleString()} د.ج</p>}
                                    </div>
                                  </div>
                                  <Button size="icon" variant="ghost" className="text-destructive rounded-full hover:bg-destructive/10 h-8 w-8" onClick={() => handleUnpinItem(item.id, type as any)}>
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
                    <Button onClick={handleSave} disabled={isSaving} className="font-bold gap-2 rounded-xl px-5">
                      {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                      {t('homepage.savePinnedItems')}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Timer Tab */}
          {activeTab === 'timer' && (
            <Card className="card-surface rounded-[24px] max-w-2xl mx-auto shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                  <Clock className="w-5 h-5 text-brand" />
                  {t('homepage.megaCountdownDealsSettings')}
                </CardTitle>
                <CardDescription>
                  {t('homepage.toggleCountdownDealSettingsShowingTarget')}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-2xl border border-border bg-background mb-4 shadow-sm">
                  <div className="space-y-0.5 text-start">
                    <Label htmlFor="timer_enabled" className="text-sm font-bold">{t('homepage.countdownTimerStatus')}</Label>
                    <p className="text-xs text-muted-foreground">{t('homepage.enableCountdownBannerDetailingHoursminut')}</p>
                  </div>
                  <select
                    id="timer_enabled"
                    value={countdown.enabled ? 'true' : 'false'}
                    onChange={(e) => {
                      const enabled = e.target.value === 'true';
                      const updated = { ...countdown, enabled };
                      setCountdown(updated);
                      persistConfig(layout, pinned, updated, heroSlides);
                    }}
                    className="bg-background border border-border text-foreground px-3.5 py-2 rounded-xl text-xs font-bold outline-none"
                  >
                    <option value="true">{t('homepage.active')}</option>
                    <option value="false">{t('homepage.disabled')}</option>
                  </select>
                </div>

                <div className="space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {languages.map((lang: any) => {
                      const codeSuffix = lang.code.charAt(0).toUpperCase() + lang.code.slice(1);
                      const keyName = `title${codeSuffix}`;
                      const inputLabel = `${t('homepage.campaignTitleIn')} ${lang.name}`;
                      return (
                        <div key={lang.code} className="space-y-2 text-start">
                          <Label htmlFor={`countdown_${lang.code}`} className="text-xs font-bold">{inputLabel}</Label>
                          <Input
                            id={`countdown_${lang.code}`}
                            value={countdown[keyName] || ''}
                            onChange={e => setCountdown(prev => ({ ...prev, [keyName]: e.target.value }))}
                            className="rounded-xl text-sm"
                            placeholder={lang.code === 'ar' ? 'عروض ميجا' : lang.code === 'en' ? 'Mega Offers' : `Mega Offers (${lang.name})`}
                          />
                        </div>
                      );
                    })}
                  </div>

                  <div className="space-y-2 text-start">
                    <Label htmlFor="endDate" className="text-xs font-bold">{t('homepage.campaignEndDateTime')}</Label>
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
                  <Button onClick={handleSave} disabled={isSaving} className="font-bold gap-2 rounded-xl px-5">
                    {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                    {t('homepage.saveTimerSettings')}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Slides Tab */}
          {activeTab === 'slides' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left side: Slides List & Order */}
              <Card className="lg:col-span-5 card-surface rounded-[24px] shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <div>
                    <CardTitle className="text-lg font-bold">{t('homepage.heroSliderManager')}</CardTitle>
                    <CardDescription>
                      {t('homepage.manageAndReorderSlidesOnTheMainHomeBanne')}
                    </CardDescription>
                  </div>
                  <Button size="sm" onClick={handleStartAddSlide} className="rounded-xl font-bold gap-1 px-3">
                    <Plus className="w-4 h-4" />
                    {t('homepage.addSlide')}
                  </Button>
                </CardHeader>
                <CardContent className="space-y-4">
                  {heroSlides.length === 0 ? (
                    <div className="p-8 border border-dashed border-slate-350 rounded-2xl text-center text-sm text-muted-foreground bg-slate-50/20">
                      <Sparkles className="w-8 h-8 mx-auto mb-2 opacity-35 text-amber-500 animate-pulse" />
                      {t('homepage.noSlidesAddedYetStorefrontWillDisplayFal')}
                    </div>
                  ) : (
                    <div className="border border-border/80 rounded-[20px] divide-y overflow-hidden bg-background shadow-inner">
                      {heroSlides.map((s, idx) => (
                        <div key={s.id || idx} className={`flex items-center justify-between p-4 transition-colors ${editingSlideIndex === idx ? 'bg-muted/40 border-l-4 border-l-brand' : 'bg-background'}`}>
                          <div className="min-w-0 flex items-center gap-3">
                            <span className="font-mono text-xs text-muted-foreground w-6 shrink-0">#{idx + 1}</span>
                            <div className="min-w-0">
                              <p className="font-bold text-sm truncate text-slate-800 dark:text-slate-100">{isAr ? s.title : (s.titleEn || s.title || t('homepage.untitled'))}</p>
                              <div className="flex items-center gap-1.5 mt-1">
                                {s.imageUrl ? (
                                  <div className="w-5 h-5 rounded overflow-hidden border border-border">
                                    <img src={s.imageUrl} className="w-full h-full object-cover" alt="" />
                                  </div>
                                ) : (
                                  <div className={`w-3.5 h-3.5 rounded bg-gradient-to-br ${s.bg || s.bgGradient || 'from-blue-950 to-slate-900'} border border-white/10`} />
                                )}
                                <span className="text-[10px] text-muted-foreground font-mono truncate max-w-[120px]">{s.imageUrl ? t('homepage.backgroundImage') : (s.bg || s.bgGradient)}</span>
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
                              {t('homepage.edit')}
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
                    <Button onClick={handleSave} disabled={isSaving} className="font-bold gap-2 rounded-xl px-5">
                      {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                      {t('homepage.saveBannerConfiguration')}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Right side: Add / Edit Form with direct image uploader */}
              <Card className="lg:col-span-7 card-surface rounded-[24px] shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg font-bold flex items-center gap-1.5">
                    <Sparkles className="w-5 h-5 text-brand" />
                    {editingSlideIndex !== null
                      ? editingSlideIndex === heroSlides.length
                        ? t('homepage.addNewPromotionSlide')
                        : `${t('homepage.editSlide')} #${editingSlideIndex + 1}`
                      : t('homepage.selectASlideOrAddOne')}
                  </CardTitle>
                  <CardDescription>
                    {editingSlideIndex !== null
                      ? t('homepage.provideContentParametersForTheSelectedHe')
                      : t('homepage.clickEditOrAddToInitializeFormFields')}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {editingSlideIndex === null ? (
                    <div className="flex flex-col items-center justify-center py-24 text-muted-foreground border border-dashed rounded-[20px] bg-background">
                      <Sparkles className="w-12 h-12 text-slate-300 dark:text-slate-700 mb-3" />
                      <p className="text-sm font-medium">{t('homepage.noSlideSelectedForEditing')}</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {/* Live preview */}
                      {(() => {
                        const codeSuffix = locale.charAt(0).toUpperCase() + locale.slice(1);
                        const previewTitle = editSlideData[`title${codeSuffix}`] || editSlideData.title || t('homepage.slideTitle');
                        const previewSubtitle = editSlideData[`subtitle${codeSuffix}`] || editSlideData.subtitle || t('homepage.slideSubtitleOrPromotionDescription');
                        const previewBadge = editSlideData[`badge${codeSuffix}`] || editSlideData.badge || '';
                        const previewCta = editSlideData[`cta${codeSuffix}`] || editSlideData.cta || t('homepage.shopNow');

                        return (
                          <div className="border border-border/80 rounded-[20px] overflow-hidden p-6 text-white relative h-40 flex items-center bg-slate-950">
                            {editSlideData.imageUrl ? (
                              <>
                                <img src={editSlideData.imageUrl} alt="" className="absolute inset-0 w-full h-full object-cover opacity-80" />
                                <div className="absolute inset-0 bg-slate-950/40 mix-blend-multiply" />
                              </>
                            ) : (
                              <div className={`absolute inset-0 bg-gradient-to-br ${editSlideData.bg || editSlideData.bgGradient || 'from-blue-950 to-slate-900'} opacity-90`} />
                            )}
                            <div className="absolute inset-0 bg-white/5 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent pointer-events-none" />
                            <div className="relative z-10 space-y-2 text-start">
                              {previewBadge && (
                                <Badge className="bg-white/10 text-white border-white/10 text-[9px] px-2 py-0.5 rounded">
                                  {previewBadge}
                                </Badge>
                              )}
                              <h4 className="text-lg font-black">{previewTitle}</h4>
                              <p className="text-[10px] text-white/70 max-w-sm line-clamp-2">{previewSubtitle}</p>
                              <Button size="sm" className="bg-amber-500 text-slate-950 font-black rounded-lg pointer-events-none mt-1 h-7 text-[10px]">
                                {previewCta}
                              </Button>
                            </div>
                            <span className="absolute bottom-2 end-3 text-[9px] font-mono text-white/40 tracking-wider uppercase select-none">{t('homepage.livePreview')}</span>
                          </div>
                        );
                      })()}

                      {/* Title inputs */}
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {languages.map((lang: any) => {
                          const codeSuffix = lang.code.charAt(0).toUpperCase() + lang.code.slice(1);
                          const keyName = `title${codeSuffix}`;
                          const inputLabel = `${t('homepage.mainTitleIn')} ${lang.name}`;
                          return (
                            <div key={lang.code} className="space-y-2 text-start">
                              <Label className="text-xs font-bold">{inputLabel}</Label>
                              <Input
                                value={editSlideData[keyName] || ''}
                                onChange={e => {
                                  const val = e.target.value;
                                  setEditSlideData((prev: any) => {
                                    const updated = { ...prev, [keyName]: val };
                                    if (lang.code === 'ar') {
                                      updated.title = val;
                                    }
                                    return updated;
                                  });
                                }}
                                className="rounded-xl text-sm"
                                placeholder={lang.code === 'ar' ? 'تسوق بثقة' : lang.code === 'en' ? 'Shop with Confidence' : `Title (${lang.name})`}
                              />
                            </div>
                          );
                        })}
                      </div>

                      {/* Subtitle inputs */}
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {languages.map((lang: any) => {
                          const codeSuffix = lang.code.charAt(0).toUpperCase() + lang.code.slice(1);
                          const keyName = `subtitle${codeSuffix}`;
                          const inputLabel = `${t('homepage.descriptionsubtitleIn')} ${lang.name}`;
                          return (
                            <div key={lang.code} className="space-y-2 text-start">
                              <Label className="text-xs font-bold">{inputLabel}</Label>
                              <Input
                                value={editSlideData[keyName] || ''}
                                onChange={e => {
                                  const val = e.target.value;
                                  setEditSlideData((prev: any) => {
                                    const updated = { ...prev, [keyName]: val };
                                    if (lang.code === 'ar') {
                                      updated.subtitle = val;
                                    }
                                    return updated;
                                  });
                                }}
                                className="rounded-xl text-sm"
                                placeholder={lang.code === 'ar' ? 'آلاف المنتجات من تجار موثوقين' : lang.code === 'en' ? 'Thousands of products from verified sellers' : `Subtitle (${lang.name})`}
                              />
                            </div>
                          );
                        })}
                      </div>

                      {/* Badges & Buttons text */}
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {languages.map((lang: any) => {
                          const codeSuffix = lang.code.charAt(0).toUpperCase() + lang.code.slice(1);
                          const keyName = `badge${codeSuffix}`;
                          const inputLabel = `${t('homepage.badgeTextIn')} ${lang.name}`;
                          return (
                            <div key={lang.code} className="space-y-2 text-start">
                              <Label className="text-xs font-bold">{inputLabel}</Label>
                              <Input
                                value={editSlideData[keyName] || ''}
                                onChange={e => {
                                  const val = e.target.value;
                                  setEditSlideData((prev: any) => {
                                    const updated = { ...prev, [keyName]: val };
                                    if (lang.code === 'ar') {
                                      updated.badge = val;
                                    }
                                    return updated;
                                  });
                                }}
                                className="rounded-xl text-sm"
                                placeholder={lang.code === 'ar' ? '🔥 عروض حصرية' : lang.code === 'en' ? '🔥 Exclusive Deals' : `Badge (${lang.name})`}
                              />
                            </div>
                          );
                        })}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {languages.map((lang: any) => {
                          const codeSuffix = lang.code.charAt(0).toUpperCase() + lang.code.slice(1);
                          const keyName = `cta${codeSuffix}`;
                          const inputLabel = `${t('homepage.ctaTextIn1')} ${lang.name}`;
                          return (
                            <div key={lang.code} className="space-y-2 text-start">
                              <Label className="text-xs font-bold">{inputLabel}</Label>
                              <Input
                                value={editSlideData[keyName] || ''}
                                onChange={e => {
                                  const val = e.target.value;
                                  setEditSlideData((prev: any) => {
                                    const updated = { ...prev, [keyName]: val };
                                    if (lang.code === 'ar') {
                                      updated.cta = val;
                                    }
                                    return updated;
                                  });
                                }}
                                className="rounded-xl text-sm"
                                placeholder={lang.code === 'ar' ? 'تسوق الآن' : lang.code === 'en' ? 'Shop Now' : `CTA (${lang.name})`}
                              />
                            </div>
                          );
                        })}
                      </div>

                      {/* Link & background setup */}
                      <div className="space-y-2 text-start">
                        <Label className="text-xs font-bold">{t('homepage.ctaTargetLinkUrl')}</Label>
                        <Input
                          value={editSlideData.linkUrl}
                          onChange={e => setEditSlideData(prev => ({ ...prev, linkUrl: e.target.value }))}
                          className="rounded-xl text-sm font-mono text-start"
                          placeholder="/search?categoryId=optics-id"
                        />
                      </div>

                      {/* Image Upload for Slide Background */}
                      <div className="space-y-2 text-start pt-2 border-t border-border/40">
                        <Label className="text-xs font-bold">{t('homepage.uploadSlideBackgroundImageOptional')}</Label>
                        <ImageUploader
                          value={editSlideData.imageUrl}
                          onChange={url => setEditSlideData(prev => ({ ...prev, imageUrl: url }))}
                          hint={t('homepage.uploadBackgroundImageItTakesPrecedenceOv')}
                        />
                      </div>

                      <div className="space-y-2 text-start pt-2">
                        <Label className="text-xs font-bold">{t('homepage.orChooseCssGradientBackgroundIfNoImageUp')}</Label>
                        <Input
                          value={editSlideData.bg || editSlideData.bgGradient}
                          onChange={e => setEditSlideData(prev => ({ ...prev, bg: e.target.value }))}
                          className="rounded-xl text-sm font-mono mb-2 text-start"
                          placeholder="from-blue-950 via-indigo-900 to-slate-900"
                          disabled={!!editSlideData.imageUrl}
                        />
                        <div className="flex flex-wrap gap-2 select-none">
                          {[
                            { name: t('homepage.navyDark'), val: 'from-blue-950 via-indigo-900 to-slate-900' },
                            { name: t('homepage.emeraldTeal'), val: 'from-emerald-950 via-teal-900 to-slate-900' },
                            { name: t('homepage.royalPurple'), val: 'from-purple-950 via-violet-900 to-slate-900' },
                            { name: t('homepage.sunsetAmber'), val: 'from-orange-950 via-amber-900 to-slate-900' },
                            { name: t('homepage.rubyRose'), val: 'from-rose-950 via-red-900 to-slate-900' },
                            { name: t('homepage.cyberpunkPink'), val: 'from-pink-950 via-purple-900 to-slate-900' }
                          ].map(grad => (
                            <button
                              key={grad.val}
                              type="button"
                              onClick={() => setEditSlideData(prev => ({ ...prev, bg: grad.val }))}
                              disabled={!!editSlideData.imageUrl}
                              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold border ${editSlideData.bg === grad.val ? 'border-brand bg-brand/10 text-slate-900 dark:text-slate-100' : 'border-border bg-background text-muted-foreground hover:text-foreground'} ${editSlideData.imageUrl ? 'opacity-40 cursor-not-allowed' : ''}`}
                            >
                              <div className={`w-3.5 h-3.5 rounded-full bg-gradient-to-br ${grad.val}`} />
                              {grad.name}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="flex justify-end gap-2 pt-4 border-t border-border/60">
                        <Button variant="ghost" onClick={() => setEditingSlideIndex(null)} className="rounded-xl text-xs font-bold">
                          {t('homepage.cancel')}
                        </Button>
                        <Button onClick={handleSaveSlide} className="rounded-xl text-xs font-bold gap-1 px-4">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          {t('homepage.confirmUpdateList')}
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {/* Features Tab */}
          {activeTab === 'features' && (
            <div className="grid grid-cols-1 gap-6">
              <Card className="card-surface rounded-[24px] shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-lg font-bold">شريط الميزات والضمانات</CardTitle>
                    <CardDescription>إدارة الميزات المعروضة أسفل البانر الرئيسي.</CardDescription>
                  </div>
                  <Button onClick={() => persistConfig()} disabled={isSaving} className="font-bold gap-2 rounded-xl px-5">
                    {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                    حفظ التغييرات
                  </Button>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-sm text-muted-foreground bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-100 dark:border-blue-900">
                    ملاحظة: يمكنك إضافة وتعديل الميزات التي تظهر في الصفحة الرئيسية. أدخل النص باللغة العربية والإنجليزية والفرنسية. اختر اسم الأيقونة (مثال: Shield, Truck, Award).
                  </div>
                  <div className="space-y-4">
                    {features.map((feat, idx) => (
                      <div key={idx} className="border border-border/80 rounded-[20px] p-4 bg-slate-50/50 dark:bg-slate-900/10 space-y-4">
                        <div className="flex justify-between items-center">
                          <h4 className="font-bold">ميزة #{idx + 1}</h4>
                          <Button variant="ghost" size="sm" onClick={() => setFeatures(prev => prev.filter((_, i) => i !== idx))} className="text-destructive hover:bg-destructive/10">
                            <Trash className="w-4 h-4" />
                          </Button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label className="text-xs">الأيقونة (Lucide Icon Name)</Label>
                            <Input value={feat.icon || ''} onChange={(e) => setFeatures(prev => { const n = [...prev]; n[idx].icon = e.target.value; return n; })} placeholder="Shield, Truck..." />
                          </div>
                          <div>
                            <Label className="text-xs">العنوان (العربية)</Label>
                            <Input value={feat.titleAr || feat.title || ''} onChange={(e) => setFeatures(prev => { const n = [...prev]; n[idx].title = e.target.value; n[idx].titleAr = e.target.value; return n; })} />
                          </div>
                          <div>
                            <Label className="text-xs">العنوان (الإنجليزية)</Label>
                            <Input value={feat.titleEn || ''} onChange={(e) => setFeatures(prev => { const n = [...prev]; n[idx].titleEn = e.target.value; return n; })} />
                          </div>
                          <div>
                            <Label className="text-xs">العنوان (الفرنسية)</Label>
                            <Input value={feat.titleFr || ''} onChange={(e) => setFeatures(prev => { const n = [...prev]; n[idx].titleFr = e.target.value; return n; })} />
                          </div>
                          <div>
                            <Label className="text-xs">الوصف (العربية)</Label>
                            <Input value={feat.descAr || feat.desc || ''} onChange={(e) => setFeatures(prev => { const n = [...prev]; n[idx].desc = e.target.value; n[idx].descAr = e.target.value; return n; })} />
                          </div>
                          <div>
                            <Label className="text-xs">الوصف (الإنجليزية)</Label>
                            <Input value={feat.descEn || ''} onChange={(e) => setFeatures(prev => { const n = [...prev]; n[idx].descEn = e.target.value; return n; })} />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <Button variant="outline" onClick={() => setFeatures(prev => [...prev, { icon: 'Shield', title: 'ميزة جديدة', desc: 'وصف الميزة الجديدة' }])} className="w-full border-dashed">
                    <Plus className="w-4 h-4 ml-2" />
                    إضافة ميزة
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Trending Searches Tab */}
          {activeTab === 'trending' && (
            <div className="grid grid-cols-1 gap-6">
              <Card className="card-surface rounded-[24px] shadow-sm border-brand/20">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-lg font-bold flex items-center gap-2">
                      <Search className="w-5 h-5 text-brand" />
                      إحصائيات البحث الشائع (مؤتمتة)
                    </CardTitle>
                    <CardDescription>هذه التصنيفات يتم استنتاجها تلقائياً بناءً على ما يبحث عنه زوار المتجر وتحديث نقاط الترند الخاصة بها يومياً.</CardDescription>
                  </div>
                  <Button 
                    variant="destructive" 
                    onClick={async () => {
                      if (!confirm('هل أنت متأكد من تصفير إحصائيات جميع التصنيفات لبدء موسم جديد؟')) return;
                      setIsResettingTrending(true);
                      try {
                        const res = await fetch('/api/admin/trending-searches/reset', { method: 'POST' });
                        if (res.ok) {
                          toast.success('تم تصفير الإحصائيات بنجاح');
                          setRealTrendingCategories([]);
                        }
                      } finally {
                        setIsResettingTrending(false);
                      }
                    }} 
                    disabled={isResettingTrending} 
                    className="font-bold gap-2 rounded-xl px-5"
                  >
                    {isResettingTrending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash className="h-4 w-4" />}
                    تصفير الإحصائيات
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="bg-slate-50 dark:bg-slate-900/50 rounded-2xl p-6 border border-border/50">
                    <h3 className="font-bold mb-4">أعلى 10 تصنيفات ترند حالياً:</h3>
                    {realTrendingCategories.length > 0 ? (
                      <div className="flex flex-wrap gap-3">
                        {realTrendingCategories.map((cat, i) => (
                          <div key={cat.id} className="flex items-center gap-2 bg-white dark:bg-slate-800 border border-border/80 px-4 py-2 rounded-xl shadow-sm">
                            <span className="font-bold text-sm">{cat.name}</span>
                            <span className="text-xs bg-brand/10 text-brand px-2 py-0.5 rounded-full font-bold">
                              {cat.trendingScore} نقطة
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted-foreground text-sm">لا توجد إحصائيات بحث كافية حتى الآن. ستظهر هنا فور بدء الزوار بالبحث عن المنتجات.</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card className="card-surface rounded-[24px] shadow-sm mt-4 opacity-70 hover:opacity-100 transition-opacity">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-md font-bold">كلمات البحث الاحتياطية (Manual Fallback)</CardTitle>
                    <CardDescription>هذه الكلمات ستظهر فقط في حال لم يتوفر تصنيفات شائعة كافية في النظام أعلاه.</CardDescription>
                  </div>
                  <Button onClick={() => persistConfig()} disabled={isSaving} className="font-bold gap-2 rounded-xl px-5">
                    {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                    حفظ الاحتياطي
                  </Button>
                </CardHeader>
                <CardContent className="space-y-6">
                  {['ar', 'en', 'fr'].map((lang) => (
                    <div key={lang} className="space-y-2">
                      <Label className="font-bold text-sm">الكلمات المفتاحية ({lang.toUpperCase()}) - افصل بينها بفاصلة ( , )</Label>
                      <Textarea 
                        rows={2} 
                        value={(trendingSearches[lang] || []).join(', ')}
                        onChange={(e) => {
                          const val = e.target.value;
                          const arr = val.split(',').map(s => s.trim()).filter(Boolean);
                          setTrendingSearches((prev: any) => ({ ...prev, [lang]: arr }));
                        }}
                        placeholder="عطور, آيفون, ملابس..."
                        className="font-mono text-left direction-ltr text-sm"
                      />
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          )}

          {/* Testimonials Tab */}
          {activeTab === 'testimonials' && (
            <div className="grid grid-cols-1 gap-6">
              <Card className="card-surface rounded-[24px] shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-lg font-bold">آراء وتقييمات العملاء</CardTitle>
                    <CardDescription>إدارة التقييمات المعروضة في الصفحة الرئيسية.</CardDescription>
                  </div>
                  <Button onClick={() => persistConfig()} disabled={isSaving} className="font-bold gap-2 rounded-xl px-5">
                    {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                    حفظ التغييرات
                  </Button>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-4">
                    {testimonials.map((testi, idx) => (
                      <div key={idx} className="border border-border/80 rounded-[20px] p-4 bg-slate-50/50 dark:bg-slate-900/10 space-y-4">
                        <div className="flex justify-between items-center">
                          <h4 className="font-bold">تقييم #{idx + 1}</h4>
                          <Button variant="ghost" size="sm" onClick={() => setTestimonials(prev => prev.filter((_, i) => i !== idx))} className="text-destructive hover:bg-destructive/10">
                            <Trash className="w-4 h-4" />
                          </Button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label className="text-xs">اسم العميل</Label>
                            <Input value={testi.name || ''} onChange={(e) => setTestimonials(prev => { const n = [...prev]; n[idx].name = e.target.value; return n; })} />
                          </div>
                          <div>
                            <Label className="text-xs">التقييم (من 5)</Label>
                            <Input type="number" min={1} max={5} value={testi.rating || 5} onChange={(e) => setTestimonials(prev => { const n = [...prev]; n[idx].rating = Number(e.target.value); return n; })} />
                          </div>
                          <div className="md:col-span-2">
                            <Label className="text-xs">نص التقييم</Label>
                            <Textarea value={testi.text || ''} onChange={(e) => setTestimonials(prev => { const n = [...prev]; n[idx].text = e.target.value; return n; })} />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <Button variant="outline" onClick={() => setTestimonials(prev => [...prev, { name: 'عميل جديد', text: 'تجربة رائعة!', rating: 5 }])} className="w-full border-dashed">
                    <Plus className="w-4 h-4 ml-2" />
                    إضافة تقييم
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}

          {/* CTA Tab */}
          {activeTab === 'cta' && (
            <div className="grid grid-cols-1 gap-6">
              <Card className="card-surface rounded-[24px] shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-lg font-bold">لوحة دعوة التجار (CTA)</CardTitle>
                    <CardDescription>إدارة النصوص المعروضة في اللوحة السفلية.</CardDescription>
                  </div>
                  <Button onClick={() => persistConfig()} disabled={isSaving} className="font-bold gap-2 rounded-xl px-5">
                    {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                    حفظ التغييرات
                  </Button>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-xs">العنوان (العربية)</Label>
                      <Input value={ctaSettings.titleAr || ctaSettings.title || ''} onChange={(e) => setCtaSettings((prev: any) => ({ ...prev, title: e.target.value, titleAr: e.target.value }))} />
                    </div>
                    <div>
                      <Label className="text-xs">العنوان (الإنجليزية)</Label>
                      <Input value={ctaSettings.titleEn || ''} onChange={(e) => setCtaSettings((prev: any) => ({ ...prev, titleEn: e.target.value }))} />
                    </div>
                    <div>
                      <Label className="text-xs">الوصف (العربية)</Label>
                      <Textarea value={ctaSettings.descAr || ctaSettings.desc || ''} onChange={(e) => setCtaSettings((prev: any) => ({ ...prev, desc: e.target.value, descAr: e.target.value }))} />
                    </div>
                    <div>
                      <Label className="text-xs">الوصف (الإنجليزية)</Label>
                      <Textarea value={ctaSettings.descEn || ''} onChange={(e) => setCtaSettings((prev: any) => ({ ...prev, descEn: e.target.value }))} />
                    </div>
                    <div>
                      <Label className="text-xs">نص الزر (العربية)</Label>
                      <Input value={ctaSettings.btnAr || ctaSettings.btn || ''} onChange={(e) => setCtaSettings((prev: any) => ({ ...prev, btn: e.target.value, btnAr: e.target.value }))} />
                    </div>
                    <div>
                      <Label className="text-xs">نص الزر (الإنجليزية)</Label>
                      <Input value={ctaSettings.btnEn || ''} onChange={(e) => setCtaSettings((prev: any) => ({ ...prev, btnEn: e.target.value }))} />
                    </div>
                    <div>
                      <Label className="text-xs">نص الزر (الفرنسية)</Label>
                      <Input value={ctaSettings.btnFr || ''} onChange={(e) => setCtaSettings((prev: any) => ({ ...prev, btnFr: e.target.value }))} />
                    </div>
                    <div>
                      <Label className="text-xs">رابط الزر (URL)</Label>
                      <Input value={ctaSettings.url || '/admin/register'} onChange={(e) => setCtaSettings((prev: any) => ({ ...prev, url: e.target.value }))} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

        </div>
      )}
    </div>
  );
}
