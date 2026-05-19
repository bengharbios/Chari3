'use client';

import React, { useState, useEffect } from 'react';
import { useAdminAuthStore } from '@/lib/store/admin-auth';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Loader2, 
  Save, 
  ArrowUp, 
  ArrowDown, 
  Plus, 
  Trash2, 
  Sliders, 
  Image as ImageIcon, 
  MessageSquare,
  Star
} from 'lucide-react';

interface HeroSlide {
  id: string;
  title: string;
  titleEn: string;
  subtitle: string;
  subtitleEn: string;
  bg: string;
  badge: string;
  cta: string;
}

interface Testimonial {
  name: string;
  text: string;
  rating: number;
  city: string;
}

export default function AdminCMSPage() {
  const { adminLocale } = useAdminAuthStore();
  const [isMounted, setIsMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // States
  const [layout, setLayout] = useState<string[]>([]);
  const [heroSlides, setHeroSlides] = useState<HeroSlide[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);

  const isRTL = adminLocale === 'ar';

  const dict = {
    ar: {
      title: "إدارة واجهة الموقع (CMS)",
      description: "تحكم بمرونة مطلقة في الأقسام والبنرات والآراء المعروضة بالصفحة الرئيسية.",
      save: "حفظ كل التغييرات",
      success: "تم حفظ إعدادات الواجهة بنجاح!",
      error: "فشل حفظ التغييرات",
      sectionsTitle: "ترتيب أقسام الصفحة الرئيسية",
      sectionsDesc: "رتب ظهور الأقسام باستخدام السهام لأعلى ولأسفل.",
      heroTitle: "شرائح البنر الرئيسي (Hero Slider)",
      heroDesc: "أضف وعدل العروض المتحركة الكبرى في الصفحة الرئيسية.",
      testimonialTitle: "آراء عملائنا (Testimonials)",
      testimonialDesc: "قم بإدارة التقييمات المعروضة في أسفل الموقع.",
      addSlide: "إضافة شريحة جديدة",
      addTestimonial: "إضافة رأي جديد",
      slideBg: "تدرج الخلفية (CSS class or gradient)",
      badgeText: "نص الشارة",
      ctaText: "نص زر التفاعل (CTA)",
      titleAr: "العنوان (بالعربية)",
      titleEn: "العنوان (بالفرنسية/الإنجليزية)",
      subAr: "العنوان الفرعي (بالعربية)",
      subEn: "العنوان الفرعي (بالفرنسية/الإنجليزية)",
      name: "اسم العميل",
      city: "المدينة/الولاية",
      reviewText: "نص الرأي",
      rating: "التقييم (النجوم)",
    },
    en: {
      title: "Storefront CMS Engine",
      description: "Take total control of homepage section orders, dynamic sliders, and client reviews.",
      save: "Save CMS Changes",
      success: "CMS configuration saved successfully!",
      error: "Failed to save CMS configuration",
      sectionsTitle: "Homepage Section Layout",
      sectionsDesc: "Reorder homepage sections dynamically using up and down arrows.",
      heroTitle: "Hero Slider Banners",
      heroDesc: "Add, modify, and optimize major sliding ads shown on homepage.",
      testimonialTitle: "Customer Testimonials",
      testimonialDesc: "Manage and verify client reviews rendered in the bottom strip.",
      addSlide: "Add Slide",
      addTestimonial: "Add Review",
      slideBg: "Background Style/Gradient",
      badgeText: "Badge Label",
      ctaText: "CTA Action Button Text",
      titleAr: "Title (Arabic)",
      titleEn: "Title (English/French)",
      subAr: "Subtitle (Arabic)",
      subEn: "Subtitle (English/French)",
      name: "Customer Name",
      city: "City / State",
      reviewText: "Testimonial Content",
      rating: "Rating Stars",
    }
  };

  const t = dict[adminLocale] || dict.ar;

  const sectionNames: Record<string, { ar: string; en: string }> = {
    hero: { ar: 'البنر الرئيسي المتحرك (Hero)', en: 'Hero Banner Slider' },
    features: { ar: 'شريط المميزات التنافسية', en: 'Competitive Features Strip' },
    categories: { ar: 'تصفح حسب الفئة', en: 'Browse Categories' },
    featured_products: { ar: 'المنتجات المميزة', en: 'Featured Products Grid' },
    top_sellers: { ar: 'التجار الأفضل', en: 'Top Sellers Carousel' },
    testimonials: { ar: 'آراء عملائنا', en: 'Customer Testimonials' },
    cta: { ar: 'شريط دعوة البيع (CTA)', en: 'CTA Registration Strip' },
  };

  useEffect(() => {
    setIsMounted(true);
    fetchCMS();
  }, []);

  const fetchCMS = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/cms');
      const data = await res.json();
      if (data.success) {
        setLayout(data.layout || []);
        setHeroSlides(data.heroSlides || []);
        setTestimonials(data.testimonials || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await fetch('/api/admin/cms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          layout,
          heroSlides,
          testimonials,
        }),
      });
      const data = await res.json();
      if (data.success) {
        alert(t.success);
      } else {
        alert(t.error);
      }
    } catch (e) {
      console.error(e);
      alert(t.error);
    } finally {
      setIsSaving(false);
    }
  };

  const moveSection = (index: number, direction: 'up' | 'down') => {
    const newLayout = [...layout];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= layout.length) return;
    
    // Swap
    const temp = newLayout[index];
    newLayout[index] = newLayout[targetIndex];
    newLayout[targetIndex] = temp;
    setLayout(newLayout);
  };

  const addSlide = () => {
    const newSlide: HeroSlide = {
      id: Date.now().toString(),
      title: 'عرض جديد مميز',
      titleEn: 'New Featured Promo',
      subtitle: 'تفاصيل مشوقة عن هذا العرض والخصومات الكبرى المتاحة الآن',
      subtitleEn: 'Exciting description details regarding massive savings',
      bg: 'from-slate-900 via-slate-800 to-slate-900',
      badge: '✨ جديد وحصري',
      cta: 'تسوق الآن',
    };
    setHeroSlides([...heroSlides, newSlide]);
  };

  const updateSlide = (id: string, fields: Partial<HeroSlide>) => {
    setHeroSlides(heroSlides.map(s => s.id === id ? { ...s, ...fields } : s));
  };

  const removeSlide = (id: string) => {
    setHeroSlides(heroSlides.filter(s => s.id !== id));
  };

  const addTestimonial = () => {
    const newTestimonial: Testimonial = {
      name: 'اسم جديد',
      text: 'منصة تسوق رائعة جداً، شاري داي يقدم أفضل تجربة بيع وشراء!',
      rating: 5,
      city: 'الجزائر',
    };
    setTestimonials([...testimonials, newTestimonial]);
  };

  const updateTestimonial = (index: number, fields: Partial<Testimonial>) => {
    const newT = [...testimonials];
    newT[index] = { ...newT[index], ...fields };
    setTestimonials(newT);
  };

  const removeTestimonial = (index: number) => {
    setTestimonials(testimonials.filter((_, i) => i !== index));
  };

  if (!isMounted) return null;

  return (
    <div className="space-y-8">
      {/* Page Title & Save Button */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black">{t.title}</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{t.description}</p>
        </div>

        <Button onClick={handleSave} className="bg-brand text-navy hover:bg-brand/90 font-bold gap-2 px-6" disabled={isSaving}>
          {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {t.save}
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-10 w-10 animate-spin text-brand" />
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          
          {/* 1. Dynamic Layout Reordering (Col 1) */}
          <div className="xl:col-span-1 space-y-6">
            <Card className="border-border">
              <CardHeader className="bg-slate-50 dark:bg-slate-800/50">
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                  <Sliders className="h-5 w-5 text-brand" />
                  {t.sectionsTitle}
                </CardTitle>
                <CardDescription>{t.sectionsDesc}</CardDescription>
              </CardHeader>
              <CardContent className="p-4 space-y-3">
                {layout.map((sec, idx) => {
                  const info = sectionNames[sec] || { ar: sec, en: sec };
                  const displayName = isRTL ? info.ar : info.en;
                  return (
                    <div 
                      key={sec} 
                      className="flex items-center justify-between p-3.5 bg-white dark:bg-slate-800 border rounded-xl shadow-sm hover:border-brand/40 transition-colors"
                    >
                      <span className="font-semibold text-sm">{displayName}</span>
                      <div className="flex gap-1">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-slate-500 hover:text-brand"
                          disabled={idx === 0}
                          onClick={() => moveSection(idx, 'up')}
                        >
                          <ArrowUp className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-slate-500 hover:text-brand"
                          disabled={idx === layout.length - 1}
                          onClick={() => moveSection(idx, 'down')}
                        >
                          <ArrowDown className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </div>

          {/* 2. Hero Slides & Testimonials (Col 2 & 3) */}
          <div className="xl:col-span-2 space-y-8">
            
            {/* Hero Slider CMS */}
            <Card className="border-border">
              <CardHeader className="bg-slate-50 dark:bg-slate-800/50 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-lg font-bold flex items-center gap-2">
                    <ImageIcon className="h-5 w-5 text-brand" />
                    {t.heroTitle}
                  </CardTitle>
                  <CardDescription>{t.heroDesc}</CardDescription>
                </div>
                <Button onClick={addSlide} size="sm" className="bg-slate-800 text-white hover:bg-slate-700 dark:bg-slate-700 dark:hover:bg-slate-600 gap-1.5">
                  <Plus className="h-4 w-4" />
                  {t.addSlide}
                </Button>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                {heroSlides.length === 0 ? (
                  <div className="text-center py-8 text-slate-400 text-sm">لا توجد شرائح حالياً. اضغط "إضافة شريحة" للمباشرة.</div>
                ) : (
                  heroSlides.map((slide, idx) => (
                    <div key={slide.id} className="p-4 border rounded-xl bg-slate-50/50 dark:bg-slate-800/30 space-y-4 relative">
                      <div className="absolute top-4 end-4">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:bg-red-50" onClick={() => removeSlide(slide.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>

                      <span className="text-xs font-bold text-slate-400">الشريحة #{idx + 1}</span>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <Label className="text-xs">{t.titleAr}</Label>
                          <Input value={slide.title} onChange={e => updateSlide(slide.id, { title: e.target.value })} />
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-xs">{t.titleEn}</Label>
                          <Input value={slide.titleEn} onChange={e => updateSlide(slide.id, { titleEn: e.target.value })} />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <Label className="text-xs">{t.subAr}</Label>
                          <Textarea rows={2} value={slide.subtitle} onChange={e => updateSlide(slide.id, { subtitle: e.target.value })} />
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-xs">{t.subEn}</Label>
                          <Textarea rows={2} value={slide.subtitleEn} onChange={e => updateSlide(slide.id, { subtitleEn: e.target.value })} />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-1.5">
                          <Label className="text-xs">{t.slideBg}</Label>
                          <Input value={slide.bg} onChange={e => updateSlide(slide.id, { bg: e.target.value })} placeholder="from-blue-900 via-blue-800 to-indigo-900" />
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-xs">{t.badgeText}</Label>
                          <Input value={slide.badge} onChange={e => updateSlide(slide.id, { badge: e.target.value })} />
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-xs">{t.ctaText}</Label>
                          <Input value={slide.cta} onChange={e => updateSlide(slide.id, { cta: e.target.value })} />
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            {/* Testimonials CMS */}
            <Card className="border-border">
              <CardHeader className="bg-slate-50 dark:bg-slate-800/50 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-lg font-bold flex items-center gap-2">
                    <MessageSquare className="h-5 w-5 text-brand" />
                    {t.testimonialTitle}
                  </CardTitle>
                  <CardDescription>{t.testimonialDesc}</CardDescription>
                </div>
                <Button onClick={addTestimonial} size="sm" className="bg-slate-800 text-white hover:bg-slate-700 dark:bg-slate-700 dark:hover:bg-slate-600 gap-1.5">
                  <Plus className="h-4 w-4" />
                  {t.addTestimonial}
                </Button>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                {testimonials.length === 0 ? (
                  <div className="text-center py-8 text-slate-400 text-sm">لا توجد آراء حالياً. اضغط "إضافة رأي" للمباشرة.</div>
                ) : (
                  testimonials.map((testi, idx) => (
                    <div key={idx} className="p-4 border rounded-xl bg-slate-50/50 dark:bg-slate-800/30 space-y-4 relative">
                      <div className="absolute top-4 end-4">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:bg-red-50" onClick={() => removeTestimonial(idx)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>

                      <span className="text-xs font-bold text-slate-400">التقييم #{idx + 1}</span>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-1.5">
                          <Label className="text-xs">{t.name}</Label>
                          <Input value={testi.name} onChange={e => updateTestimonial(idx, { name: e.target.value })} />
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-xs">{t.city}</Label>
                          <Input value={testi.city} onChange={e => updateTestimonial(idx, { city: e.target.value })} />
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-xs">{t.rating}</Label>
                          <Select 
                            value={String(testi.rating)} 
                            onValueChange={val => updateTestimonial(idx, { rating: parseInt(val) })}
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="اختر التقييم" />
                            </SelectTrigger>
                            <SelectContent>
                              {[1, 2, 3, 4, 5].map((stars) => (
                                <SelectItem key={stars} value={String(stars)}>
                                  <span className="flex items-center gap-1.5">
                                    {stars} <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400 inline" />
                                  </span>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <Label className="text-xs">{t.reviewText}</Label>
                        <Textarea rows={2} value={testi.text} onChange={e => updateTestimonial(idx, { text: e.target.value })} />
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

          </div>
        </div>
      )}
    </div>
  );
}
