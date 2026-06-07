'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAdminAuthStore } from '@/lib/store/admin-auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from '@/components/ui/dialog';
import {
  Languages, Plus, Trash2, Save, Search, Globe, ChevronDown,
  ChevronRight, Loader2, Check, X, AlignLeft, AlignRight, RefreshCw,
  AlertTriangle, Edit3, ToggleLeft,
} from 'lucide-react';
import { toast } from 'sonner';

// ─── Types ────────────────────────────────────────────────────────────────────
interface Language {
  code: string;
  name: string;
  nameEn: string;
  flag: string;
  direction: 'rtl' | 'ltr';
  isBuiltin?: boolean;
}

type DictTree = Record<string, string | Record<string, string>>;

// ─── Flatten / Unflatten helpers ──────────────────────────────────────────────
function flattenDict(obj: any, prefix = ''): Record<string, string> {
  const result: Record<string, string> = {};
  for (const key of Object.keys(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (typeof obj[key] === 'object' && obj[key] !== null) {
      Object.assign(result, flattenDict(obj[key], fullKey));
    } else {
      result[fullKey] = String(obj[key] ?? '');
    }
  }
  return result;
}

function unflattenDict(flat: Record<string, string>): DictTree {
  const result: any = {};
  for (const [key, value] of Object.entries(flat)) {
    const parts = key.split('.');
    let cursor = result;
    for (let i = 0; i < parts.length - 1; i++) {
      if (!cursor[parts[i]]) cursor[parts[i]] = {};
      cursor = cursor[parts[i]];
    }
    cursor[parts[parts.length - 1]] = value;
  }
  return result;
}

// ─── POPULAR LANGUAGES PRESET ────────────────────────────────────────────────
const POPULAR_LANGS: Language[] = [
  { code: 'es', name: 'Español',    nameEn: 'Spanish',   flag: '🇪🇸', direction: 'ltr' },
  { code: 'tr', name: 'Türkçe',     nameEn: 'Turkish',   flag: '🇹🇷', direction: 'ltr' },
  { code: 'de', name: 'Deutsch',    nameEn: 'German',    flag: '🇩🇪', direction: 'ltr' },
  { code: 'zh', name: '中文',        nameEn: 'Chinese',   flag: '🇨🇳', direction: 'ltr' },
  { code: 'ur', name: 'اردو',        nameEn: 'Urdu',      flag: '🇵🇰', direction: 'rtl' },
  { code: 'fa', name: 'فارسی',       nameEn: 'Persian',   flag: '🇮🇷', direction: 'rtl' },
  { code: 'ru', name: 'Русский',    nameEn: 'Russian',   flag: '🇷🇺', direction: 'ltr' },
  { code: 'pt', name: 'Português',  nameEn: 'Portuguese',flag: '🇧🇷', direction: 'ltr' },
  { code: 'it', name: 'Italiano',   nameEn: 'Italian',   flag: '🇮🇹', direction: 'ltr' },
  { code: 'ko', name: '한국어',       nameEn: 'Korean',    flag: '🇰🇷', direction: 'ltr' },
];

// ─── Section group label mapping ──────────────────────────────────────────────
const SECTION_LABELS: Record<string, string> = {
  common:  'عناصر مشتركة / Common',
  sidebar: 'القائمة الجانبية / Sidebar',
  admin:   'لوحة الأدمن / Admin Panel',
};

// ─── Main Component ───────────────────────────────────────────────────────────
export default function TranslationsManagerPage() {
  const { adminLocale, adminUser } = useAdminAuthStore();
  const isRTL = adminLocale === 'ar';

  // State
  const [languages, setLanguages]         = useState<Language[]>([]);
  const [activeLang, setActiveLang]       = useState<string>('ar');
  const [dicts, setDicts]                 = useState<Record<string, Record<string, string>>>({});
  const [searchQuery, setSearchQuery]     = useState('');
  const [openSections, setOpenSections]   = useState<Record<string, boolean>>({ common: true, sidebar: true, admin: true });
  const [isLoading, setIsLoading]         = useState(true);
  const [isSaving, setIsSaving]           = useState(false);
  const [dirtyLocales, setDirtyLocales]   = useState<Set<string>>(new Set());
  const [showAddLang, setShowAddLang]     = useState(false);
  const [showCustomLang, setShowCustomLang] = useState(false);
  const [customLang, setCustomLang]       = useState<Language>({
    code: '', name: '', nameEn: '', flag: '🌐', direction: 'ltr',
  });

  const adminId = adminUser?.id || 'admin';

  // ─── Load data ───────────────────────────────────────────────────────────────
  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/translations');
      const data = await res.json();
      if (data.success) {
        setLanguages(data.languages);
        // Flatten all dicts
        const flatDicts: Record<string, Record<string, string>> = {};
        for (const [code, dict] of Object.entries(data.dicts || {})) {
          flatDicts[code] = flattenDict(dict as any);
        }
        setDicts(flatDicts);
      }
    } catch (e) {
      toast.error('فشل تحميل الترجمات');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  // ─── Save a specific locale ───────────────────────────────────────────────
  const saveLocale = async (locale: string) => {
    setIsSaving(true);
    try {
      const nested = unflattenDict(dicts[locale] || {});
      const res = await fetch('/api/admin/translations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'save_dict', locale, dict: nested, adminId }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`✅ تم حفظ ترجمات "${locale}" بنجاح`);
        setDirtyLocales(prev => { const s = new Set(prev); s.delete(locale); return s; });
      } else {
        toast.error(data.error || 'فشل الحفظ');
      }
    } catch {
      toast.error('حدث خطأ أثناء الحفظ');
    } finally {
      setIsSaving(false);
    }
  };

  // ─── Update a key value ───────────────────────────────────────────────────
  const updateKey = (locale: string, key: string, value: string) => {
    setDicts(prev => ({
      ...prev,
      [locale]: { ...(prev[locale] || {}), [key]: value },
    }));
    setDirtyLocales(prev => new Set(prev).add(locale));
  };

  // ─── Add language ─────────────────────────────────────────────────────────
  const addLanguage = async (lang: Language) => {
    if (languages.find(l => l.code === lang.code)) {
      toast.error(`اللغة "${lang.code}" موجودة بالفعل`);
      return;
    }

    // Copy keys from 'en' as empty strings for new lang
    const baseFlatDict = dicts['en'] || {};
    const emptyDict: Record<string, string> = {};
    for (const key of Object.keys(baseFlatDict)) {
      emptyDict[key] = '';
    }

    const newLanguages = [...languages, { ...lang, isBuiltin: false }];

    // Save languages list
    const res = await fetch('/api/admin/translations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'save_languages', languages: newLanguages, adminId }),
    });

    if ((await res.json()).success) {
      setLanguages(newLanguages);
      setDicts(prev => ({ ...prev, [lang.code]: emptyDict }));
      setActiveLang(lang.code);
      setShowAddLang(false);
      setShowCustomLang(false);
      toast.success(`✅ تمت إضافة لغة "${lang.nameEn}" — ابدأ بترجمة النصوص`);
    }
  };

  // ─── Delete language ──────────────────────────────────────────────────────
  const deleteLanguage = async (code: string) => {
    if (!confirm(`هل تريد حذف اللغة "${code}"؟ هذا الإجراء لا يمكن التراجع عنه.`)) return;
    const res = await fetch('/api/admin/translations', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ locale: code, adminId }),
    });
    const data = await res.json();
    if (data.success) {
      setLanguages(prev => prev.filter(l => l.code !== code));
      setDicts(prev => { const d = { ...prev }; delete d[code]; return d; });
      if (activeLang === code) setActiveLang('ar');
      toast.success(`تم حذف اللغة "${code}"`);
    } else {
      toast.error(data.error || 'فشل الحذف');
    }
  };

  // ─── Keys & sections ──────────────────────────────────────────────────────
  const arDict = dicts['ar'] || {};
  const currentDict = dicts[activeLang] || {};
  const allKeys = Object.keys(arDict);

  const sections = Array.from(new Set(allKeys.map(k => k.split('.')[0])));

  const filteredKeys = (section: string) =>
    allKeys
      .filter(k => k.startsWith(`${section}.`))
      .filter(k => {
        if (!searchQuery) return true;
        const q = searchQuery.toLowerCase();
        return (
          k.toLowerCase().includes(q) ||
          (arDict[k] || '').toLowerCase().includes(q) ||
          (currentDict[k] || '').toLowerCase().includes(q)
        );
      });

  const completionPct = (locale: string) => {
    const keys = Object.keys(arDict);
    if (!keys.length) return 0;
    const filled = keys.filter(k => (dicts[locale]?.[k] || '').trim() !== '').length;
    return Math.round((filled / keys.length) * 100);
  };

  // ─── UI ───────────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center space-y-3">
          <Loader2 className="h-10 w-10 animate-spin text-[#1ABB9C] mx-auto" />
          <p className="text-slate-500">جاري تحميل نظام الترجمات...</p>
        </div>
      </div>
    );
  }

  const activeLangMeta = languages.find(l => l.code === activeLang);

  return (
    <div className="min-h-screen bg-slate-50" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="bg-white border-b border-slate-200 px-6 py-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#1ABB9C]/10 flex items-center justify-center">
            <Languages className="h-5 w-5 text-[#1ABB9C]" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800">إدارة الترجمات واللغات</h1>
            <p className="text-sm text-slate-500">أضف لغات جديدة وعدّل نصوص الترجمة من هنا</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={loadData}
            className="gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            تحديث
          </Button>
          <Button
            size="sm"
            className="gap-2 bg-[#1ABB9C] hover:bg-[#17a589] text-white"
            onClick={() => setShowAddLang(true)}
          >
            <Plus className="h-4 w-4" />
            إضافة لغة
          </Button>
        </div>
      </div>

      <div className="flex h-[calc(100vh-89px)]">

        {/* ── Left Panel: Language List ───────────────────────────────────── */}
        <div className="w-64 shrink-0 bg-white border-e border-slate-200 flex flex-col">
          <div className="p-4 border-b border-slate-100">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
              اللغات النشطة ({languages.length})
            </p>
          </div>
          <div className="flex-1 overflow-y-auto py-2">
            {languages.map(lang => {
              const pct = completionPct(lang.code);
              const isDirty = dirtyLocales.has(lang.code);
              return (
                <div
                  key={lang.code}
                  onClick={() => setActiveLang(lang.code)}
                  className={`group relative flex items-center gap-3 px-4 py-3 cursor-pointer transition-all ${
                    activeLang === lang.code
                      ? 'bg-[#1ABB9C]/10 border-s-2 border-[#1ABB9C]'
                      : 'hover:bg-slate-50 border-s-2 border-transparent'
                  }`}
                >
                  <span className="text-2xl shrink-0">{lang.flag}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-semibold text-slate-700 truncate">{lang.name}</span>
                      {isDirty && (
                        <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0" title="تغييرات غير محفوظة" />
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <div className="flex-1 h-1 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#1ABB9C] rounded-full transition-all"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="text-[10px] text-slate-400 shrink-0">{pct}%</span>
                    </div>
                    <div className="flex items-center gap-1 mt-0.5">
                      <span className="text-[10px] text-slate-400 font-mono uppercase">{lang.code}</span>
                      <Badge variant="outline" className="text-[9px] px-1 py-0 h-3.5">
                        {lang.direction.toUpperCase()}
                      </Badge>
                      {lang.isBuiltin && (
                        <Badge className="text-[9px] px-1 py-0 h-3.5 bg-blue-50 text-blue-600 border-blue-200">
                          مدمج
                        </Badge>
                      )}
                    </div>
                  </div>
                  {/* Delete button (non-builtin only) */}
                  {!lang.isBuiltin && (
                    <button
                      onClick={e => { e.stopPropagation(); deleteLanguage(lang.code); }}
                      className="opacity-0 group-hover:opacity-100 absolute top-2 end-2 w-5 h-5 flex items-center justify-center rounded-full bg-red-50 text-red-500 hover:bg-red-100 transition-all"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Main Panel: Translation Editor ─────────────────────────────── */}
        <div className="flex-1 flex flex-col overflow-hidden">

          {/* Sub-header */}
          <div className="bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{activeLangMeta?.flag}</span>
              <div>
                <span className="font-bold text-slate-800">{activeLangMeta?.name}</span>
                <span className="text-slate-400 mx-2">·</span>
                <span className="text-sm text-slate-500">{allKeys.length} مفتاح ترجمة</span>
              </div>
              <Badge variant="outline" className="gap-1">
                {activeLangMeta?.direction === 'rtl'
                  ? <><AlignRight className="h-3 w-3" /> RTL</>
                  : <><AlignLeft className="h-3 w-3" /> LTR</>}
              </Badge>
              {dirtyLocales.has(activeLang) && (
                <Badge className="bg-amber-50 text-amber-700 border-amber-200 gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                  تغييرات غير محفوظة
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2">
              {/* Search */}
              <div className="relative">
                <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="ابحث عن مفتاح أو نص..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="ps-9 w-64 h-9 text-sm"
                />
              </div>
              <Button
                size="sm"
                className="gap-2 bg-[#1ABB9C] hover:bg-[#17a589] text-white"
                disabled={isSaving || !dirtyLocales.has(activeLang)}
                onClick={() => saveLocale(activeLang)}
              >
                {isSaving
                  ? <Loader2 className="h-4 w-4 animate-spin" />
                  : <Save className="h-4 w-4" />}
                حفظ التغييرات
              </Button>
            </div>
          </div>

          {/* Translation keys editor */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {/* Reference lang note */}
            {activeLang !== 'ar' && (
              <div className="flex items-start gap-2 bg-blue-50 border border-blue-100 rounded-lg px-4 py-3 text-sm text-blue-700">
                <Globe className="h-4 w-4 mt-0.5 shrink-0" />
                <span>
                  يظهر النص العربي (المرجع) على اليسار، والنص القابل للتعديل على اليمين.
                  يمكنك الاستناد إلى النص الإنجليزي كمرجع إضافي.
                </span>
              </div>
            )}

            {sections.map(section => {
              const keys = filteredKeys(section);
              if (!keys.length) return null;
              const isOpen = openSections[section] !== false;

              return (
                <div key={section} className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                  {/* Section header */}
                  <button
                    className="w-full flex items-center justify-between px-5 py-4 hover:bg-slate-50 transition-colors"
                    onClick={() => setOpenSections(prev => ({ ...prev, [section]: !isOpen }))}
                  >
                    <div className="flex items-center gap-3">
                      {isOpen
                        ? <ChevronDown className="h-4 w-4 text-slate-400" />
                        : <ChevronRight className="h-4 w-4 text-slate-400" />}
                      <span className="font-semibold text-slate-700">
                        {SECTION_LABELS[section] || section}
                      </span>
                      <Badge variant="secondary" className="text-xs">
                        {keys.length} مفتاح
                      </Badge>
                      {/* Missing keys count */}
                      {(() => {
                        const missing = keys.filter(k => !(currentDict[k] || '').trim()).length;
                        return missing > 0 ? (
                          <Badge className="bg-red-50 text-red-600 border-red-200 text-xs gap-1">
                            <AlertTriangle className="h-3 w-3" />
                            {missing} ناقص
                          </Badge>
                        ) : (
                          <Badge className="bg-green-50 text-green-600 border-green-200 text-xs gap-1">
                            <Check className="h-3 w-3" />
                            مكتمل
                          </Badge>
                        );
                      })()}
                    </div>
                  </button>

                  {/* Keys list */}
                  {isOpen && (
                    <div className="divide-y divide-slate-100">
                      {/* Column headers */}
                      <div className="grid grid-cols-[220px_1fr_1fr] gap-0 bg-slate-50 border-t border-slate-100">
                        <div className="px-4 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">مفتاح</div>
                        <div className="px-4 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider border-s border-slate-100">
                          🇩🇿 العربية (مرجع)
                        </div>
                        <div className="px-4 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider border-s border-slate-100">
                          {activeLangMeta?.flag} {activeLangMeta?.name}
                        </div>
                      </div>

                      {keys.map(key => {
                        const shortKey = key.replace(`${section}.`, '');
                        const arVal = arDict[key] || '';
                        const curVal = currentDict[key] || '';
                        const isEmpty = !curVal.trim();

                        return (
                          <div
                            key={key}
                            className={`grid grid-cols-[220px_1fr_1fr] group hover:bg-slate-50 transition-colors ${
                              isEmpty ? 'bg-red-50/40' : ''
                            }`}
                          >
                            {/* Key name */}
                            <div className="px-4 py-3 flex items-center">
                              <span className="text-xs font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                                {shortKey}
                              </span>
                            </div>

                            {/* Arabic reference */}
                            <div className="px-4 py-3 border-s border-slate-100 flex items-center">
                              <span
                                className="text-sm text-slate-600"
                                dir="rtl"
                              >
                                {arVal || <span className="text-slate-300 italic text-xs">فارغ</span>}
                              </span>
                            </div>

                            {/* Editable field */}
                            <div className="px-3 py-2 border-s border-slate-100 flex items-center">
                              {activeLang === 'ar' ? (
                                <input
                                  type="text"
                                  value={curVal}
                                  onChange={e => updateKey(activeLang, key, e.target.value)}
                                  dir="rtl"
                                  className={`w-full text-sm px-2 py-1.5 rounded border outline-none focus:ring-2 focus:ring-[#1ABB9C]/30 focus:border-[#1ABB9C] transition-all ${
                                    isEmpty
                                      ? 'border-red-200 bg-red-50'
                                      : 'border-slate-200 bg-white'
                                  }`}
                                  placeholder="أدخل الترجمة..."
                                />
                              ) : (
                                <input
                                  type="text"
                                  value={curVal}
                                  onChange={e => updateKey(activeLang, key, e.target.value)}
                                  dir={activeLangMeta?.direction || 'ltr'}
                                  className={`w-full text-sm px-2 py-1.5 rounded border outline-none focus:ring-2 focus:ring-[#1ABB9C]/30 focus:border-[#1ABB9C] transition-all ${
                                    isEmpty
                                      ? 'border-red-200 bg-red-50'
                                      : 'border-slate-200 bg-white'
                                  }`}
                                  placeholder="Enter translation..."
                                />
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Add Language Dialog ─────────────────────────────────────────────── */}
      <Dialog open={showAddLang} onOpenChange={setShowAddLang}>
        <DialogContent className="max-w-lg" dir={isRTL ? 'rtl' : 'ltr'}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-[#1ABB9C]" />
              إضافة لغة جديدة
            </DialogTitle>
            <DialogDescription>
              اختر من اللغات الشائعة أو أضف لغة مخصصة
            </DialogDescription>
          </DialogHeader>

          {/* Popular languages grid */}
          <div className="space-y-4">
            <p className="text-sm font-semibold text-slate-600">اللغات الشائعة</p>
            <div className="grid grid-cols-2 gap-2">
              {POPULAR_LANGS.filter(l => !languages.find(x => x.code === l.code)).map(lang => (
                <button
                  key={lang.code}
                  onClick={() => addLanguage(lang)}
                  className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 hover:border-[#1ABB9C] hover:bg-[#1ABB9C]/5 transition-all text-start group"
                >
                  <span className="text-2xl">{lang.flag}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-700 group-hover:text-[#1ABB9C] truncate">{lang.name}</p>
                    <p className="text-xs text-slate-400">{lang.nameEn} · {lang.code.toUpperCase()} · {lang.direction.toUpperCase()}</p>
                  </div>
                  <Plus className="h-4 w-4 text-slate-300 group-hover:text-[#1ABB9C] shrink-0" />
                </button>
              ))}
            </div>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200" />
              </div>
              <div className="relative flex justify-center">
                <span className="bg-white px-3 text-xs text-slate-400">أو أضف لغة مخصصة</span>
              </div>
            </div>

            {!showCustomLang ? (
              <Button
                variant="outline"
                className="w-full gap-2 border-dashed"
                onClick={() => setShowCustomLang(true)}
              >
                <Edit3 className="h-4 w-4" />
                إضافة لغة مخصصة
              </Button>
            ) : (
              <div className="space-y-3 p-4 bg-slate-50 rounded-lg border border-slate-200">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-600">رمز اللغة *</label>
                    <Input
                      placeholder="es, tr, ko..."
                      value={customLang.code}
                      maxLength={5}
                      onChange={e => setCustomLang(prev => ({ ...prev, code: e.target.value.toLowerCase() }))}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-600">علم الإيموجي</label>
                    <Input
                      placeholder="🇪🇸"
                      value={customLang.flag}
                      onChange={e => setCustomLang(prev => ({ ...prev, flag: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-600">الاسم الأصلي *</label>
                    <Input
                      placeholder="Español"
                      value={customLang.name}
                      onChange={e => setCustomLang(prev => ({ ...prev, name: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-600">الاسم بالإنجليزية</label>
                    <Input
                      placeholder="Spanish"
                      value={customLang.nameEn}
                      onChange={e => setCustomLang(prev => ({ ...prev, nameEn: e.target.value }))}
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600">اتجاه الكتابة</label>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setCustomLang(prev => ({ ...prev, direction: 'ltr' }))}
                      className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg border text-sm font-medium transition-all ${
                        customLang.direction === 'ltr'
                          ? 'border-[#1ABB9C] bg-[#1ABB9C]/10 text-[#1ABB9C]'
                          : 'border-slate-200 text-slate-500 hover:border-slate-300'
                      }`}
                    >
                      <AlignLeft className="h-4 w-4" /> LTR (يسار لليمين)
                    </button>
                    <button
                      onClick={() => setCustomLang(prev => ({ ...prev, direction: 'rtl' }))}
                      className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg border text-sm font-medium transition-all ${
                        customLang.direction === 'rtl'
                          ? 'border-[#1ABB9C] bg-[#1ABB9C]/10 text-[#1ABB9C]'
                          : 'border-slate-200 text-slate-500 hover:border-slate-300'
                      }`}
                    >
                      <AlignRight className="h-4 w-4" /> RTL (يمين لليسار)
                    </button>
                  </div>
                </div>
                <div className="flex gap-2 pt-1">
                  <Button
                    className="flex-1 bg-[#1ABB9C] hover:bg-[#17a589] text-white"
                    disabled={!customLang.code || !customLang.name}
                    onClick={() => addLanguage(customLang)}
                  >
                    <Plus className="h-4 w-4 me-2" /> إضافة اللغة
                  </Button>
                  <Button variant="outline" onClick={() => setShowCustomLang(false)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
