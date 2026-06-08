'use client';

import React, { useEffect, useState } from 'react';
import { useAdminAuthStore } from '@/lib/store/admin-auth';
import { useTranslation } from '@/lib/i18n/useTranslation';
import { Loader2, Plus, Edit2, Check, X, ArrowRight, MapPin, ToggleLeft, ToggleRight, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Link from 'next/link';

export default function AdminShippingPage() {
  const { isAdminAuthenticated } = useAdminAuthStore();
  const { locale } = useTranslation();
  const dir = locale === 'ar' ? 'rtl' : 'ltr';
  const isAr = locale === 'ar';

  const getAdminPath = (subPath: string = '') => {
    if (typeof window === 'undefined') return '/super-admin';
    const segments = window.location.pathname.split('/');
    const baseSlug = segments[1] || 'super-admin';
    return subPath === '' ? `/${baseSlug}` : `/${baseSlug}/${subPath}`;
  };

  const [isMounted, setIsMounted] = useState(false);
  const [states, setStates] = useState<any[]>([]);
  const [selectedStateCode, setSelectedStateCode] = useState('16'); // Default Algiers
  const [selectedState, setSelectedState] = useState<any>(null);
  const [cities, setCities] = useState<any[]>([]);
  
  const [isLoadingStates, setIsLoadingStates] = useState(true);
  const [isLoadingCities, setIsLoadingCities] = useState(false);

  // Dialog / Edit states
  const [isAdding, setIsAdding] = useState(false);
  const [newCity, setNewCity] = useState({ nameAr: '', nameEn: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [editingCityId, setEditingCityId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ nameAr: '', nameEn: '' });

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMounted && !isAdminAuthenticated) {
      const currentPath = window.location.pathname.replace('/shipping', '');
      window.location.href = `${currentPath}/login`;
    }
  }, [isMounted, isAdminAuthenticated]);

  // 1. Fetch States List
  const fetchStates = async () => {
    setIsLoadingStates(true);
    try {
      const res = await fetch('/api/regions/states?countryCode=DZ');
      const data = await res.json();
      if (data.success && Array.isArray(data.states)) {
        setStates(data.states);
        // Default to Algiers '16' or first state code
        const defaultState = data.states.find((s: any) => s.code === '16') || data.states[0];
        if (defaultState) {
          setSelectedStateCode(defaultState.code);
        }
      }
    } catch (err) {
      console.error('Failed to load states', err);
      toast.error(locale === 'ar' ? 'فشل تحميل الولايات' : 'Failed to load states');
    } finally {
      setIsLoadingStates(false);
    }
  };

  // 2. Fetch Cities for selected State
  const fetchCities = async (code: string) => {
    setIsLoadingCities(true);
    try {
      const res = await fetch(`/api/regions/cities?stateCode=${code}&includeInactive=true`);
      const data = await res.json();
      if (data.success) {
        setCities(data.cities || []);
        setSelectedState(data.state);
      }
    } catch (err) {
      console.error('Failed to load cities', err);
      toast.error(locale === 'ar' ? 'فشل تحميل البلديات' : 'Failed to load municipalities');
    } finally {
      setIsLoadingCities(false);
    }
  };

  useEffect(() => {
    if (isMounted && isAdminAuthenticated) {
      fetchStates();
    }
  }, [isMounted, isAdminAuthenticated]);

  useEffect(() => {
    if (isMounted && isAdminAuthenticated && selectedStateCode) {
      fetchCities(selectedStateCode);
    }
  }, [isMounted, isAdminAuthenticated, selectedStateCode]);

  if (!isMounted || !isAdminAuthenticated) return null;

  // Add City Handler
  const handleAddCity = async () => {
    if (!newCity.nameAr.trim() || !newCity.nameEn.trim()) {
      toast.error(locale === 'ar' ? 'يرجى ملء جميع الحقول!' : 'Please fill all fields!');
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/regions/cities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nameAr: newCity.nameAr,
          nameEn: newCity.nameEn,
          stateId: selectedState?.id,
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(locale === 'ar' ? 'تم إضافة البلدية بنجاح!' : 'Municipality added successfully!');
        setNewCity({ nameAr: '', nameEn: '' });
        setIsAdding(false);
        fetchCities(selectedStateCode);
      } else {
        throw new Error(data.error);
      }
    } catch (err: any) {
      toast.error(err.message || (locale === 'ar' ? 'فشل إضافة البلدية' : 'Failed to add municipality'));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Toggle City Active State Handler
  const handleToggleCityActive = async (cityId: string, currentActive: boolean) => {
    try {
      const res = await fetch('/api/regions/cities', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: cityId,
          isActive: !currentActive,
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(locale === 'ar' ? 'تم تحديث حالة الظهور بنجاح!' : 'Visibility status updated successfully!');
        fetchCities(selectedStateCode);
      }
    } catch {
      toast.error(locale === 'ar' ? 'فشل تحديث حالة الظهور' : 'Failed to toggle visibility');
    }
  };

  // Inline Edit Save Handler
  const handleSaveEdit = async (cityId: string) => {
    if (!editForm.nameAr.trim() || !editForm.nameEn.trim()) {
      toast.error(locale === 'ar' ? 'يرجى ملء جميع الحقول!' : 'Please fill all fields!');
      return;
    }
    try {
      const res = await fetch('/api/regions/cities', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: cityId,
          nameAr: editForm.nameAr,
          nameEn: editForm.nameEn,
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(locale === 'ar' ? 'تم تعديل البلدية بنجاح!' : 'Municipality edited successfully!');
        setEditingCityId(null);
        fetchCities(selectedStateCode);
      }
    } catch {
      toast.error(locale === 'ar' ? 'فشل حفظ التعديلات' : 'Failed to save changes');
    }
  };

  const t = (ar: string, en: string) => (locale === 'ar' ? ar : en);

  return (
    <div dir={dir} className="max-w-[1750px] mx-auto p-4 sm:p-6 lg:p-8 space-y-6 text-start">
      <div className="flex items-center gap-4 mb-6">
        <Link href={getAdminPath('')}>
          <Button variant="outline" size="icon" className="rounded-full">
            <ArrowRight className={`h-5 w-5 ${locale === 'ar' ? '' : 'rotate-180'}`} />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-black text-foreground flex items-center gap-2">
            <MapPin className="h-6 w-6 text-brand" />
            {t('إدارة الولايات والبلديات (المناطق الجغرافية)', 'Geographical Regions & Municipalities')}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {t('تحكم بالولايات والبلديات الفعالة بالجزائر وتكاليف الشحن الافتراضية للبلاتفورم.', 'Manage Algerian states, municipalities, and global default shipping fees.')}
          </p>
        </div>
      </div>

      {isLoadingStates ? (
        <div className="flex justify-center p-12">
          <Loader2 className="h-8 w-8 animate-spin text-brand" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: States List */}
          <Card className="card-surface lg:col-span-1">
            <CardHeader>
              <CardTitle className="text-lg font-bold">{t('الولايات (58 ولاية)', 'Algerian States (Wilayas)')}</CardTitle>
              <CardDescription>
                {t('اختر الولاية لإدارة بلدياتها الفرعية وتكاليف توصيلها.', 'Select a state to manage its municipalities.')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-y-auto max-h-[500px] border border-white/5 rounded-2xl p-2 space-y-1 bg-slate-950/20">
                {states.map((st) => {
                  const isSelected = selectedStateCode === st.code;
                  return (
                    <button
                      key={st.code}
                      onClick={() => setSelectedStateCode(st.code)}
                      className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all text-start ${
                        isSelected 
                          ? 'bg-brand/10 border-brand text-brand font-black' 
                          : 'bg-background/40 border-white/5 hover:border-white/10 text-foreground'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs bg-white/5 px-2 py-0.5 rounded-md text-muted-foreground">{st.code}</span>
                        <span className="text-sm">{isAr ? st.nameAr : st.nameEn}</span>
                      </div>
                      <span className="text-xs bg-muted/60 px-2.5 py-1 rounded-full text-foreground/80 font-bold font-mono">
                        {st.price || st.defaultPrice} {t('د.ج', 'DZD')}
                      </span>
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Right Column: Cities / Municipalities Grid */}
          <Card className="card-surface lg:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between gap-4 flex-wrap pb-4">
              <div>
                <CardTitle className="text-lg font-bold">
                  {selectedState ? t(`بلديات ولاية ${isAr ? selectedState.nameAr : selectedState.nameEn}`, `Municipalities of ${isAr ? selectedState.nameAr : selectedState.nameEn}`) : t('البلديات والدوائر', 'Municipalities')}
                </CardTitle>
                <CardDescription>
                  {t('أضف، عدل، أو احظر البلديات التي لا تتوفر بها خدمات التوصيل.', 'Add, edit, or hide specific municipalities for courier delivery.')}
                </CardDescription>
              </div>
              <Button onClick={() => setIsAdding(true)} className="font-bold gap-2 text-xs rounded-xl shadow-lg">
                <Plus className="h-4 w-4" />
                {t('إضافة بلدية جديدة', 'Add Municipality')}
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Add Municipality inline block */}
              {isAdding && (
                <div className="p-4 bg-muted/30 border border-border rounded-2xl space-y-3">
                  <h4 className="text-sm font-bold text-foreground">{t('إضافة بلدية جديدة في الولاية الحالية', 'Add New Municipality')}</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <Label className="text-xs">{t('الاسم بالعربية', 'Name in Arabic')}</Label>
                      <Input 
                        value={newCity.nameAr}
                        onChange={(e) => setNewCity({ ...newCity, nameAr: e.target.value })}
                        placeholder="مثال: بلدية سيدي بلعباس"
                        className="bg-background rounded-lg h-9 text-sm"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">{t('الاسم بالإنجليزية', 'Name in English')}</Label>
                      <Input 
                        value={newCity.nameEn}
                        onChange={(e) => setNewCity({ ...newCity, nameEn: e.target.value })}
                        placeholder="e.g. Sidi Bel Abbes"
                        className="bg-background rounded-lg h-9 text-sm"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 pt-2">
                    <Button variant="ghost" size="sm" onClick={() => setIsAdding(false)} disabled={isSubmitting}>
                      {t('إلغاء', 'Cancel')}
                    </Button>
                    <Button size="sm" onClick={handleAddCity} disabled={isSubmitting} className="font-bold gap-1">
                      {isSubmitting && <Loader2 className="h-3 w-3 animate-spin" />}
                      {t('حفظ الآن', 'Save Now')}
                    </Button>
                  </div>
                </div>
              )}

              {/* Loader */}
              {isLoadingCities ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-brand" />
                </div>
              ) : cities.length === 0 ? (
                <div className="text-center py-12 bg-muted/10 border border-dashed border-border rounded-2xl">
                  <p className="text-muted-foreground text-sm">{t('لا توجد بلديات معرفة لهذه الولاية بعد. أضف بلديات للبدء!', 'No municipalities defined yet. Add some to get started!')}</p>
                </div>
              ) : (
                <div className="overflow-y-auto max-h-[450px] border border-white/5 rounded-2xl p-2 space-y-2 bg-slate-950/20">
                  {cities.map((city) => {
                    const isEditing = editingCityId === city.id;
                    return (
                      <div
                        key={city.id}
                        className={`flex items-center justify-between p-3 rounded-xl border transition-all text-start ${
                          city.isActive 
                            ? 'bg-background/40 border-white/5' 
                            : 'bg-muted/10 border-white/5 opacity-65'
                        }`}
                      >
                        {isEditing ? (
                          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3 me-4">
                            <Input 
                              value={editForm.nameAr}
                              onChange={(e) => setEditForm({ ...editForm, nameAr: e.target.value })}
                              className="bg-background rounded-lg h-8 text-xs font-bold"
                            />
                            <Input 
                              value={editForm.nameEn}
                              onChange={(e) => setEditForm({ ...editForm, nameEn: e.target.value })}
                              className="bg-background rounded-lg h-8 text-xs font-bold"
                            />
                          </div>
                        ) : (
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-sm text-foreground">{city.nameAr}</span>
                              <span className="text-xs text-muted-foreground font-mono">/</span>
                              <span className="text-xs text-muted-foreground">{city.nameEn}</span>
                            </div>
                            <p className="text-[10px] text-muted-foreground font-mono bg-white/5 px-2 py-0.5 rounded w-fit">
                              {t('شحن افتراضي للولاية:', 'Default rate:')} {selectedState?.defaultPrice} {t('د.ج', 'DZD')}
                            </p>
                          </div>
                        )}

                        <div className="flex items-center gap-2">
                          {isEditing ? (
                            <>
                              <Button size="icon" variant="ghost" onClick={() => handleSaveEdit(city.id)} className="h-8 w-8 text-emerald-500 hover:bg-emerald-500/10 rounded-lg">
                                <Check className="h-4 w-4" />
                              </Button>
                              <Button size="icon" variant="ghost" onClick={() => setEditingCityId(null)} className="h-8 w-8 text-red-500 hover:bg-red-500/10 rounded-lg">
                                <X className="h-4 w-4" />
                              </Button>
                            </>
                          ) : (
                            <>
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={() => {
                                  setEditingCityId(city.id);
                                  setEditForm({ nameAr: city.nameAr, nameEn: city.nameEn });
                                }}
                                className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-white/5 rounded-lg"
                                title={t('تعديل', 'Edit')}
                              >
                                <Edit2 className="h-3.5 w-3.5" />
                              </Button>

                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={() => handleToggleCityActive(city.id, city.isActive)}
                                className={`h-8 w-8 rounded-lg ${city.isActive ? 'text-emerald-500 hover:bg-emerald-500/10' : 'text-amber-500 hover:bg-amber-500/10'}`}
                                title={city.isActive ? t('إخفاء من المنصة', 'Hide Globally') : t('إظهار وتفعيل', 'Activate')}
                              >
                                {city.isActive ? <ToggleRight className="h-4 w-4" /> : <ToggleLeft className="h-4 w-4" />}
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
