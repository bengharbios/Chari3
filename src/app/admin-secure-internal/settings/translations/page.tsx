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
  AlertTriangle, Edit3,
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

// Convert regional indicator emojis to 2-letter country code
function flagEmojiToCode(emoji: string): string {
  if (!emoji) return 'un';
  if (/^[a-zA-Z]{2}$/.test(emoji)) return emoji.toLowerCase();
  
  const codePoints = Array.from(emoji).map(c => c.codePointAt(0));
  const chars = codePoints
    .filter(cp => cp !== undefined && cp >= 127462 && cp <= 127487)
    .map(cp => String.fromCharCode(cp! - 127462 + 97));
  
  if (chars.length === 2) {
    return chars.join('');
  }
  
  const clean = emoji.trim().toLowerCase();
  if (clean === 'ar' || clean === 'العربية' || clean === 'dz') return 'dz';
  if (clean === 'en' || clean === 'english' || clean === 'gb') return 'gb';
  if (clean === 'fr' || clean === 'français' || clean === 'french') return 'fr';
  
  return 'un';
}

function codeToFlagEmoji(code: string): string {
  if (!code || code.length !== 2) return '🌐';
  const char1 = code.toUpperCase().charCodeAt(0);
  const char2 = code.toUpperCase().charCodeAt(1);
  if (char1 < 65 || char1 > 90 || char2 < 65 || char2 > 90) return '🌐';
  return String.fromCodePoint(char1 - 65 + 127462) + String.fromCodePoint(char2 - 65 + 127462);
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

const COMMON_FLAGS = [
  { code: 'dz', nameAr: 'الجزائر', nameEn: 'Algeria', emoji: '🇩🇿' },
  { code: 'sa', nameAr: 'السعودية', nameEn: 'Saudi Arabia', emoji: '🇸🇦' },
  { code: 'ma', nameAr: 'المغرب', nameEn: 'Morocco', emoji: '🇲🇦' },
  { code: 'tn', nameAr: 'تونس', nameEn: 'Tunisia', emoji: '🇹🇳' },
  { code: 'eg', nameAr: 'مصر', nameEn: 'Egypt', emoji: '🇪🇬' },
  { code: 'ae', nameAr: 'الإمارات', nameEn: 'UAE', emoji: '🇦🇪' },
  { code: 'qa', nameAr: 'قطر', nameEn: 'Qatar', emoji: '🇶🇦' },
  { code: 'kw', nameAr: 'الكويت', nameEn: 'Kuwait', emoji: '🇰🇼' },
  { code: 'om', nameAr: 'عمان', nameEn: 'Oman', emoji: '🇴🇲' },
  { code: 'bh', nameAr: 'البحرين', nameEn: 'Bahrain', emoji: '🇧🇭' },
  { code: 'jo', nameAr: 'الأردن', nameEn: 'Jordan', emoji: '🇯🇴' },
  { code: 'lb', nameAr: 'لبنان', nameEn: 'Lebanon', emoji: '🇱🇧' },
  { code: 'sy', nameAr: 'سوريا', nameEn: 'Syria', emoji: '🇸🇾' },
  { code: 'iq', nameAr: 'العراق', nameEn: 'Iraq', emoji: '🇮🇶' },
  { code: 'ps', nameAr: 'فلسطين', nameEn: 'Palestine', emoji: '🇵🇸' },
  { code: 'sd', nameAr: 'السودان', nameEn: 'Sudan', emoji: '🇸🇩' },
  { code: 'ly', nameAr: 'ليبيا', nameEn: 'Libya', emoji: '🇱🇾' },
  { code: 'ye', nameAr: 'اليمن', nameEn: 'Yemen', emoji: '🇾🇪' },
  { code: 'fr', nameAr: 'فرنسا', nameEn: 'France', emoji: '🇫🇷' },
  { code: 'gb', nameAr: 'بريطانيا', nameEn: 'United Kingdom', emoji: '🇬🇧' },
  { code: 'us', nameAr: 'أمريكا', nameEn: 'United States', emoji: '🇺🇸' },
  { code: 'es', nameAr: 'إسبانيا', nameEn: 'Spain', emoji: '🇪🇸' },
  { code: 'de', nameAr: 'ألمانيا', nameEn: 'Germany', emoji: '🇩🇪' },
  { code: 'it', nameAr: 'إيطاليا', nameEn: 'Italy', emoji: '🇮🇹' },
  { code: 'tr', nameAr: 'تركيا', nameEn: 'Turkey', emoji: '🇹🇷' },
  { code: 'cn', nameAr: 'الصين', nameEn: 'China', emoji: '🇨🇳' },
  { code: 'ru', nameAr: 'روسيا', nameEn: 'Russia', emoji: '🇷🇺' },
  { code: 'jp', nameAr: 'اليابان', nameEn: 'Japan', emoji: '🇯🇵' },
  { code: 'kr', nameAr: 'كوريا الجنوبية', nameEn: 'South Korea', emoji: '🇰🇷' },
  { code: 'in', nameAr: 'الهند', nameEn: 'India', emoji: '🇮🇳' },
  { code: 'br', nameAr: 'البرازيل', nameEn: 'Brazil', emoji: '🇧🇷' },
  { code: 'ca', nameAr: 'كندا', nameEn: 'Canada', emoji: '🇨🇦' },
  { code: 'au', nameAr: 'أستراليا', nameEn: 'Australia', emoji: '🇦🇺' },
  { code: 'pk', nameAr: 'باكستان', nameEn: 'Pakistan', emoji: '🇵🇰' },
  { code: 'ir', nameAr: 'إيران', nameEn: 'Iran', emoji: '🇮🇷' },
  { code: 'id', nameAr: 'إندونيسيا', nameEn: 'Indonesia', emoji: '🇮🇩' },
  { code: 'my', nameAr: 'ماليزيا', nameEn: 'Malaysia', emoji: '🇲🇾' },
  { code: 'sn', nameAr: 'السنغال', nameEn: 'Senegal', emoji: '🇸🇳' },
];

const TABS = [
  { id: 'common', labelAr: '⚙️ عام وأزرار', labelEn: '⚙️ Common / General' },
  { id: 'sidebar', labelAr: '📋 القائمة الجانبية', labelEn: '📋 Sidebar' },
  { id: 'admin', labelAr: '🛠️ لوحة الأدمن', labelEn: '🛠️ Admin Panel' },
  { id: 'header_footer', labelAr: '🖥️ الهيدر والفوتر', labelEn: '🖥️ Header & Footer' },
  { id: 'homepage', labelAr: '🏠 الصفحة الرئيسية', labelEn: '🏠 Homepage' },
  { id: 'notifications', labelAr: '🔔 الإشعارات والرسائل', labelEn: '🔔 Notifications' },
  { id: 'security', labelAr: '🛡️ الأمان والدخول', labelEn: '🛡️ Security & Access' },
];

function getTabForKey(key: string): string {
  const prefix = key.split('.')[0];
  if (prefix === 'common') return 'common';
  if (prefix === 'sidebar') return 'sidebar';
  if (prefix === 'admin') return 'admin';
  if (prefix === 'header' || prefix === 'footer') return 'header_footer';
  if (prefix === 'homepage') return 'homepage';
  if (prefix === 'notifications') return 'notifications';
  if (prefix === 'security') return 'security';
  return 'common';
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function TranslationsManagerPage() {
  const { adminLocale, adminUser } = useAdminAuthStore();
  const isRTL = adminLocale === 'ar';

  // State
  const [languages, setLanguages]         = useState<Language[]>([]);
  const [activeLang, setActiveLang]       = useState<string>('ar');
  const [dicts, setDicts]                 = useState<Record<string, Record<string, string>>>({});
  const [searchQuery, setSearchQuery]     = useState('');
  const [activeTab, setActiveTab]         = useState('common');
  const [isLoading, setIsLoading]         = useState(true);
  const [isSaving, setIsSaving]           = useState(false);
  const [dirtyLocales, setDirtyLocales]   = useState<Set<string>>(new Set());
  const [showAddLang, setShowAddLang]     = useState(false);
  const [showCustomLang, setShowCustomLang] = useState(false);
  const [searchFlagQuery, setSearchFlagQuery] = useState('');
  const [customLang, setCustomLang]       = useState<Language>({
    code: '', name: '', nameEn: '', flag: '🇩🇿', direction: 'ltr',
  });
  const [editingLang, setEditingLang]     = useState<Language | null>(null);
  const [showEditLang, setShowEditLang]   = useState(false);
  const [searchEditFlagQuery, setSearchEditFlagQuery] = useState('');

  const adminId = adminUser?.id || 'admin';

  // ─── Load data ───────────────────────────────────────────────────────────────
  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/translations');
      const data = await res.json();
      if (data.success) {
        setLanguages(data.languages);
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

    const baseFlatDict = dicts['en'] || {};
    const emptyDict: Record<string, string> = {};
    for (const key of Object.keys(baseFlatDict)) {
      emptyDict[key] = '';
    }

    const newLanguages = [...languages, { ...lang, isBuiltin: false }];

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

  // ─── Update language ──────────────────────────────────────────────────────
  const updateLanguage = async (updatedLang: Language) => {
    const newLanguages = languages.map(l => l.code === updatedLang.code ? updatedLang : l);

    const res = await fetch('/api/admin/translations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'save_languages', languages: newLanguages, adminId }),
    });

    if ((await res.json()).success) {
      setLanguages(newLanguages);
      setShowEditLang(false);
      setEditingLang(null);
      toast.success(`✅ تم تحديث بيانات لغة "${updatedLang.nameEn}" بنجاح`);
    } else {
      toast.error('فشل تحديث بيانات اللغة');
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

  const filteredKeys = allKeys
    .filter(k => getTabForKey(k) === activeTab)
    .filter(k => {
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      return (
        k.toLowerCase().includes(q) ||
        (arDict[k] || '').toLowerCase().includes(q) ||
        (currentDict[k] || '').toLowerCase().includes(q)
      );
    });

  const getTabKeysCount = (tabId: string) => {
    return allKeys.filter(k => {
      const matchesTab = getTabForKey(k) === tabId;
      if (!matchesTab) return false;
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      return (
        k.toLowerCase().includes(q) ||
        (arDict[k] || '').toLowerCase().includes(q) ||
        (dicts[activeLang]?.[k] || '').toLowerCase().includes(q)
      );
    }).length;
  };

  const completionPct = (locale: string) => {
    const keys = Object.keys(arDict);
    if (!keys.length) return 0;
    const filled = keys.filter(k => (dicts[locale]?.[k] || '').trim() !== '').length;
    return Math.round((filled / keys.length) * 100);
  };

  // ─── Flag selection filters ────────────────────────────────────────────────
  const filteredFlags = COMMON_FLAGS.filter(f =>
    f.nameAr.includes(searchFlagQuery) ||
    f.nameEn.toLowerCase().includes(searchFlagQuery.toLowerCase()) ||
    f.code.includes(searchFlagQuery.toLowerCase())
  );

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
    <div className="w-full flex flex-col min-h-screen bg-slate-50" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="bg-white border-b border-slate-200 px-4 py-4 md:px-6 md:py-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#1ABB9C]/10 flex items-center justify-center">
            <Languages className="h-5 w-5 text-[#1ABB9C]" />
          </div>
          <div>
            <h1 className="text-lg md:text-xl font-bold text-slate-800">إدارة الترجمات واللغات</h1>
            <p className="text-xs md:text-sm text-slate-500">أضف لغات جديدة وعدّل نصوص الترجمة من هنا</p>
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

      <div className="flex flex-col lg:flex-row flex-1 overflow-hidden min-h-[calc(100vh-170px)]">
        {/* ── Mobile Language Picker (Visible only on mobile/tablet) ───────── */}
        <div className="lg:hidden p-4 bg-white border-b border-slate-200 flex flex-col gap-2">
          <label className="block text-xs font-bold text-slate-500">اختر لغة التعديل:</label>
          <div className="flex gap-2">
            <select
              value={activeLang}
              onChange={(e) => setActiveLang(e.target.value)}
              className="flex-1 h-10 px-3 rounded-lg border border-slate-200 bg-white text-sm"
            >
              {languages.map(lang => (
                <option key={lang.code} value={lang.code}>
                  {lang.flag} {lang.name} ({completionPct(lang.code)}%)
                </option>
              ))}
            </select>
            <Button
              variant="outline"
              size="icon"
              className="h-10 w-10 shrink-0"
              onClick={() => {
                const lang = languages.find(l => l.code === activeLang);
                if (lang) {
                  setEditingLang(lang);
                  setShowEditLang(true);
                }
              }}
              title="تعديل اللغة الحالية"
            >
              <Edit3 className="h-4 w-4" />
            </Button>
            {activeLangMeta && !activeLangMeta.isBuiltin && (
              <Button
                variant="destructive"
                size="icon"
                className="h-10 w-10 shrink-0 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200"
                onClick={() => deleteLanguage(activeLang)}
                title="حذف اللغة الحالية"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        {/* ── Left Panel: Language List (Desktop Only) ────────────────────── */}
        <div className="hidden lg:flex w-64 shrink-0 bg-white border-e border-slate-200 flex-col">
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
                  <img
                    src={`https://hatscripts.github.io/circle-flags/flags/${flagEmojiToCode(lang.flag)}.svg`}
                    className="w-6 h-6 rounded-full object-cover shrink-0"
                    alt={lang.name}
                  />
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
                    <div className="flex items-center gap-1 mt-0.5 flex-wrap">
                      <span className="text-[10px] text-slate-400 font-mono uppercase">{lang.code}</span>
                      <Badge variant="outline" className="text-[9px] px-1 py-0 h-3.5">
                        {lang.direction.toUpperCase()}
                      </Badge>
                      {lang.isBuiltin && (
                        <Badge className="text-[9px] px-1 py-0 h-3.5 bg-blue-50 text-blue-600 border-blue-200">
                          مدمج
                        </Badge>
                      )}
                      {lang.isActive === false ? (
                        <Badge className="text-[9px] px-1.5 py-0 h-3.5 bg-red-50 text-red-650 border-red-200 font-bold">
                          معطلة
                        </Badge>
                      ) : (
                        <Badge className="text-[9px] px-1.5 py-0 h-3.5 bg-emerald-50 text-emerald-650 border-emerald-200 font-bold">
                          نشطة
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="absolute top-2 end-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        setEditingLang(lang);
                        setShowEditLang(true);
                      }}
                      className="w-5 h-5 flex items-center justify-center rounded-full bg-slate-50 text-slate-500 hover:bg-slate-100 transition-all"
                      title="تعديل اللغة"
                    >
                      <Edit3 className="h-3 w-3" />
                    </button>
                    {!lang.isBuiltin && (
                      <button
                        onClick={e => { e.stopPropagation(); deleteLanguage(lang.code); }}
                        className="w-5 h-5 flex items-center justify-center rounded-full bg-red-50 text-red-500 hover:bg-red-100 transition-all"
                        title="حذف اللغة"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Right Panel: Translation Editor ─────────────────────────────── */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Sub-header */}
          <div className="bg-white border-b border-slate-200 px-4 py-3 md:px-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-2 md:gap-3">
              <img
                src={`https://hatscripts.github.io/circle-flags/flags/${flagEmojiToCode(activeLangMeta?.flag || 'ar')}.svg`}
                className="w-6 h-6 rounded-full object-cover shrink-0"
                alt={activeLangMeta?.name}
              />
              <div>
                <span className="font-bold text-slate-800">{activeLangMeta?.name}</span>
                <span className="text-slate-400 mx-2">·</span>
                <span className="text-xs md:text-sm text-slate-500">{allKeys.length} مفتاح ترجمة</span>
              </div>
              <Badge variant="outline" className="gap-1 text-[10px] md:text-xs">
                {activeLangMeta?.direction === 'rtl'
                  ? <><AlignRight className="h-3 w-3" /> RTL</>
                  : <><AlignLeft className="h-3 w-3" /> LTR</>}
              </Badge>
              {dirtyLocales.has(activeLang) && (
                <Badge className="bg-amber-50 text-amber-700 border-amber-200 gap-1 text-[10px] md:text-xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                  تغييرات غير محفوظة
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2 w-full md:w-auto">
              <div className="relative flex-1 md:flex-initial">
                <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="ابحث عن مفتاح أو نص..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="ps-9 w-full md:w-64 h-9 text-sm"
                />
              </div>
              <Button
                size="sm"
                className="gap-2 bg-[#1ABB9C] hover:bg-[#17a589] text-white whitespace-nowrap"
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

          {/* Dynamic Tabs Bar */}
          <div className="bg-white border-b border-slate-200 px-4 py-2 md:px-6 overflow-x-auto flex gap-1 scrollbar-none shrink-0">
            {TABS.map(tab => {
              const isActive = activeTab === tab.id;
              const count = getTabKeysCount(tab.id);
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-2 rounded-lg text-xs md:text-sm font-bold transition-all whitespace-nowrap flex items-center gap-2 ${
                    isActive
                      ? 'bg-[#1ABB9C] text-white shadow-md'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-800'
                  }`}
                >
                  <span>{isRTL ? tab.labelAr : tab.labelEn}</span>
                  <Badge className={`text-[9px] px-1.5 py-0.5 rounded-full ${
                    isActive ? 'bg-white/25 text-white' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {count}
                  </Badge>
                </button>
              );
            })}
          </div>

          {/* Translation keys editor */}
          <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
            {activeLang !== 'ar' && (
              <div className="flex items-start gap-2 bg-blue-50 border border-blue-100 rounded-lg px-4 py-3 text-xs md:text-sm text-blue-700">
                <Globe className="h-4 w-4 mt-0.5 shrink-0" />
                <span>
                  يظهر النص العربي (المرجع) على اليسار، والنص القابل للتعديل على اليمين.
                  يمكنك الاستناد إلى النص كمرجع إضافي.
                </span>
              </div>
            )}

            {filteredKeys.length === 0 ? (
              <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-slate-400">
                <AlertTriangle className="h-10 w-10 mx-auto mb-2 opacity-50" />
                <p>لا توجد نصوص تطابق البحث في هذا التبويب</p>
              </div>
            ) : (
              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                {/* Column headers (Desktop Only) */}
                <div className="hidden lg:grid grid-cols-[220px_1fr_1fr] gap-0 bg-slate-50 border-b border-slate-100">
                  <div className="px-4 py-3.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">المفتاح Key</div>
                  <div className="px-4 py-3.5 text-xs font-semibold text-slate-400 uppercase tracking-wider border-s border-slate-100">
                    🇩🇿 العربية (مرجع)
                  </div>
                  <div className="px-4 py-3.5 text-xs font-semibold text-slate-400 uppercase tracking-wider border-s border-slate-100">
                    <span className="flex items-center gap-1.5">
                      <img
                        src={`https://hatscripts.github.io/circle-flags/flags/${flagEmojiToCode(activeLangMeta?.flag || 'ar')}.svg`}
                        className="w-4 h-4 rounded-full object-cover"
                        alt={activeLangMeta?.name}
                      />
                      {activeLangMeta?.name}
                    </span>
                  </div>
                </div>

                {/* Keys list */}
                <div className="divide-y divide-slate-100">
                  {filteredKeys.map(key => {
                    const shortKey = key.replace(`${activeTab}.`, '');
                    const arVal = arDict[key] || '';
                    const curVal = currentDict[key] || '';
                    const isEmpty = !curVal.trim();

                    return (
                      <div
                        key={key}
                        className={`flex flex-col lg:grid lg:grid-cols-[220px_1fr_1fr] gap-2 lg:gap-0 p-4 lg:p-0 hover:bg-slate-50 transition-colors ${
                          isEmpty ? 'bg-red-50/20' : ''
                        }`}
                      >
                        {/* Key name */}
                        <div className="lg:px-4 lg:py-3.5 flex items-center">
                          <span className="text-xs font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded break-all">
                            {shortKey}
                          </span>
                        </div>

                        {/* Arabic reference */}
                        <div className="lg:px-4 lg:py-3.5 lg:border-s lg:border-slate-100 flex items-center">
                          <div className="flex flex-col lg:block w-full">
                            <span className="lg:hidden text-[10px] font-semibold text-slate-400 mb-0.5 block">العربية (مرجع):</span>
                            <span className="text-sm text-slate-600 leading-relaxed" dir="rtl">
                              {arVal || <span className="text-slate-300 italic text-xs">فارغ</span>}
                            </span>
                          </div>
                        </div>

                        {/* Editable field */}
                        <div className="lg:px-3 lg:py-2 lg:border-s lg:border-slate-100 flex items-center">
                          <div className="flex flex-col lg:block w-full">
                            <span className="lg:hidden text-[10px] font-semibold text-slate-400 mb-1 block">
                              {activeLangMeta?.name}:
                            </span>
                            <input
                              type="text"
                              value={curVal}
                              onChange={e => updateKey(activeLang, key, e.target.value)}
                              dir={activeLang === 'ar' ? 'rtl' : (activeLangMeta?.direction || 'ltr')}
                              className={`w-full text-sm px-2.5 py-1.5 rounded-lg border outline-none focus:ring-2 focus:ring-[#1ABB9C]/30 focus:border-[#1ABB9C] transition-all ${
                                isEmpty
                                  ? 'border-red-200 bg-red-50/50'
                                  : 'border-slate-200 bg-white'
                              }`}
                              placeholder={activeLang === 'ar' ? "أدخل الترجمة..." : "Enter translation..."}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Add Language Dialog ─────────────────────────────────────────────── */}
      <Dialog open={showAddLang} onOpenChange={setShowAddLang}>
        <DialogContent className="max-w-lg overflow-y-auto max-h-[90vh]" dir={isRTL ? 'rtl' : 'ltr'}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 font-bold text-lg text-slate-800">
              <Globe className="h-5 w-5 text-[#1ABB9C]" />
              إضافة لغة جديدة
            </DialogTitle>
            <DialogDescription className="text-xs md:text-sm">
              اختر من اللغات الشائعة أو أضف لغة مخصصة
            </DialogDescription>
          </DialogHeader>

          {/* Popular languages grid */}
          <div className="space-y-4">
            <p className="text-sm font-semibold text-slate-600">اللغات الشائعة</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {POPULAR_LANGS.filter(l => !languages.find(x => x.code === l.code)).map(lang => (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => addLanguage(lang)}
                  className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 hover:border-[#1ABB9C] hover:bg-[#1ABB9C]/5 transition-all text-start group"
                >
                  <img
                    src={`https://hatscripts.github.io/circle-flags/flags/${flagEmojiToCode(lang.flag)}.svg`}
                    className="w-8 h-8 rounded-full object-cover shrink-0"
                    alt={lang.nameEn}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-700 group-hover:text-[#1ABB9C] truncate">{lang.name}</p>
                    <p className="text-xs text-slate-400">{lang.nameEn} · {lang.code.toUpperCase()} · {lang.direction.toUpperCase()}</p>
                  </div>
                  <Plus className="h-4 w-4 text-slate-300 group-hover:text-[#1ABB9C] shrink-0" />
                </button>
              ))}
            </div>

            {/* Divider */}
            <div className="relative py-2">
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
                type="button"
                className="w-full gap-2 border-dashed"
                onClick={() => setShowCustomLang(true)}
              >
                <Edit3 className="h-4 w-4" />
                إضافة لغة مخصصة
              </Button>
            ) : (
              <div className="space-y-4 p-4 bg-slate-50 rounded-lg border border-slate-200">
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
                    <label className="text-xs font-semibold text-slate-600">الاسم الأصلي *</label>
                    <Input
                      placeholder="Español"
                      value={customLang.name}
                      onChange={e => setCustomLang(prev => ({ ...prev, name: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-1 col-span-2">
                    <label className="text-xs font-semibold text-slate-600">الاسم بالإنجليزية</label>
                    <Input
                      placeholder="Spanish"
                      value={customLang.nameEn}
                      onChange={e => setCustomLang(prev => ({ ...prev, nameEn: e.target.value }))}
                    />
                  </div>
                </div>

                {/* Comprehensive Flag Grid Search/Picker */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-600 block">اختر علم الدولة *</label>
                  <div className="relative mb-2">
                    <Search className="absolute start-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                    <Input
                      placeholder="ابحث عن علم (مثال: الجزائر، مصر، fr...)"
                      value={searchFlagQuery}
                      onChange={e => setSearchFlagQuery(e.target.value)}
                      className="ps-8 h-8 text-xs rounded-lg bg-white"
                    />
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 max-h-36 overflow-y-auto p-1.5 border border-slate-200 rounded-lg bg-white">
                    {filteredFlags.map(f => {
                      const isSelected = customLang.flag === f.emoji;
                      return (
                        <button
                          key={f.code}
                          type="button"
                          onClick={() => setCustomLang(prev => ({ ...prev, flag: f.emoji }))}
                          className={`flex items-center gap-1.5 p-1 rounded-md border text-start transition-all hover:bg-slate-50 ${
                            isSelected
                              ? 'border-[#1ABB9C] bg-[#1ABB9C]/5 ring-1 ring-[#1ABB9C]'
                              : 'border-slate-100'
                          }`}
                        >
                          <img
                            src={`https://hatscripts.github.io/circle-flags/flags/${f.code}.svg`}
                            className="w-4 h-4 rounded-full object-cover shrink-0"
                            alt={f.nameEn}
                          />
                          <span className="text-[10px] font-medium truncate flex-1">{isRTL ? f.nameAr : f.nameEn}</span>
                        </button>
                      );
                    })}
                  </div>
                  {customLang.flag && (
                    <div className="flex items-center gap-2 mt-2 p-2 bg-white rounded-lg border border-slate-200 text-xs">
                      <span className="text-slate-500">العلم المختار:</span>
                      <img
                        src={`https://hatscripts.github.io/circle-flags/flags/${flagEmojiToCode(customLang.flag)}.svg`}
                        className="w-5 h-5 rounded-full object-cover"
                        alt="Selected Flag"
                      />
                      <span className="font-semibold">{customLang.flag}</span>
                    </div>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600">اتجاه الكتابة</label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setCustomLang(prev => ({ ...prev, direction: 'ltr' }))}
                      className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg border text-sm font-medium transition-all ${
                        customLang.direction === 'ltr'
                          ? 'border-[#1ABB9C] bg-[#1ABB9C]/10 text-[#1ABB9C]'
                          : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300'
                      }`}
                    >
                      <AlignLeft className="h-4 w-4" /> LTR (يسار لليمين)
                    </button>
                    <button
                      type="button"
                      onClick={() => setCustomLang(prev => ({ ...prev, direction: 'rtl' }))}
                      className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg border text-sm font-medium transition-all ${
                        customLang.direction === 'rtl'
                          ? 'border-[#1ABB9C] bg-[#1ABB9C]/10 text-[#1ABB9C]'
                          : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300'
                      }`}
                    >
                      <AlignRight className="h-4 w-4" /> RTL (يمين لليسار)
                    </button>
                  </div>
                </div>
                <div className="flex gap-2 pt-1">
                  <Button
                    type="button"
                    className="flex-1 bg-[#1ABB9C] hover:bg-[#17a589] text-white"
                    disabled={!customLang.code || !customLang.name || !customLang.flag}
                    onClick={() => addLanguage(customLang)}
                  >
                    <Plus className="h-4 w-4 me-2" /> إضافة اللغة
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setShowCustomLang(false)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Edit Language Dialog ─────────────────────────────────────────── */}
      <Dialog open={showEditLang} onOpenChange={setShowEditLang}>
        <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto z-[var(--z-modal)] font-sans" dir={isRTL ? 'rtl' : 'ltr'}>
          <DialogHeader className="text-start">
            <DialogTitle>تعديل بيانات اللغة</DialogTitle>
            <DialogDescription>
              تعديل الاسم أو العلم أو اتجاه الكتابة لهذه اللغة.
            </DialogDescription>
          </DialogHeader>

          {editingLang && (
            <div className="space-y-4 pt-2">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600">رمز اللغة (غير قابل للتعديل)</label>
                  <Input
                    value={editingLang.code}
                    disabled
                    className="bg-slate-50 text-slate-400"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600">الاسم الأصلي *</label>
                  <Input
                    placeholder="Español"
                    value={editingLang.name}
                    onChange={e => setEditingLang(prev => prev ? ({ ...prev, name: e.target.value }) : null)}
                  />
                </div>
                <div className="space-y-1 col-span-2">
                  <label className="text-xs font-semibold text-slate-600">الاسم بالإنجليزية</label>
                  <Input
                    placeholder="Spanish"
                    value={editingLang.nameEn}
                    onChange={e => setEditingLang(prev => prev ? ({ ...prev, nameEn: e.target.value }) : null)}
                  />
                </div>
              </div>

              {/* Flag Grid Search/Picker */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-600 block">اختر علم الدولة *</label>
                <div className="relative mb-2">
                  <Search className="absolute start-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                  <Input
                    placeholder="ابحث عن علم..."
                    value={searchEditFlagQuery}
                    onChange={e => setSearchEditFlagQuery(e.target.value)}
                    className="ps-8 h-8 text-xs rounded-lg bg-white"
                  />
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 max-h-36 overflow-y-auto p-1.5 border border-slate-200 rounded-lg bg-white">
                  {COMMON_FLAGS.filter(f => {
                    if (!searchEditFlagQuery) return true;
                    const q = searchEditFlagQuery.toLowerCase();
                    return f.nameAr.includes(q) || f.nameEn.toLowerCase().includes(q) || f.code.includes(q);
                  }).map(f => {
                    const isSelected = editingLang.flag === f.emoji;
                    return (
                      <button
                        key={f.code}
                        type="button"
                        onClick={() => setEditingLang(prev => prev ? ({ ...prev, flag: f.emoji }) : null)}
                        className={`flex items-center gap-1.5 p-1 rounded-md border text-start transition-all hover:bg-slate-50 ${
                          isSelected
                            ? 'border-[#1ABB9C] bg-[#1ABB9C]/5 ring-1 ring-[#1ABB9C]'
                            : 'border-slate-100'
                        }`}
                      >
                        <img
                          src={`https://hatscripts.github.io/circle-flags/flags/${f.code}.svg`}
                          className="w-4 h-4 rounded-full object-cover shrink-0"
                          alt={f.nameEn}
                        />
                        <span className="text-[10px] font-medium truncate flex-1">{isRTL ? f.nameAr : f.nameEn}</span>
                      </button>
                    );
                  })}
                </div>
                {editingLang.flag && (
                  <div className="flex items-center gap-2 mt-2 p-2 bg-white rounded-lg border border-slate-200 text-xs">
                    <span className="text-slate-500">العلم المختار:</span>
                    <img
                      src={`https://hatscripts.github.io/circle-flags/flags/${flagEmojiToCode(editingLang.flag)}.svg`}
                      className="w-5 h-5 rounded-full object-cover"
                      alt="Selected Flag"
                    />
                    <span className="font-semibold">{editingLang.flag}</span>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1 col-span-2 sm:col-span-1">
                  <label className="text-xs font-semibold text-slate-600">اتجاه الكتابة</label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setEditingLang(prev => prev ? ({ ...prev, direction: 'ltr' }) : null)}
                      className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg border text-xs font-medium transition-all ${
                        editingLang.direction === 'ltr'
                          ? 'border-[#1ABB9C] bg-[#1ABB9C]/10 text-[#1ABB9C]'
                          : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300'
                      }`}
                    >
                      <AlignLeft className="h-4 w-4" /> LTR
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingLang(prev => prev ? ({ ...prev, direction: 'rtl' }) : null)}
                      className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg border text-xs font-medium transition-all ${
                        editingLang.direction === 'rtl'
                          ? 'border-[#1ABB9C] bg-[#1ABB9C]/10 text-[#1ABB9C]'
                          : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300'
                      }`}
                    >
                      <AlignRight className="h-4 w-4" /> RTL
                    </button>
                  </div>
                </div>

                <div className="space-y-1 col-span-2 sm:col-span-1">
                  <label className="text-xs font-semibold text-slate-600">حالة اللغة</label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      disabled={editingLang.code === 'ar'}
                      onClick={() => setEditingLang(prev => prev ? ({ ...prev, isActive: true }) : null)}
                      className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg border text-xs font-medium transition-all ${
                        editingLang.isActive !== false
                          ? 'border-emerald-500 bg-emerald-50 text-emerald-600'
                          : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300'
                      } ${editingLang.code === 'ar' ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <Check className="h-3.5 w-3.5" /> نشطة
                    </button>
                    <button
                      type="button"
                      disabled={editingLang.code === 'ar'}
                      onClick={() => setEditingLang(prev => prev ? ({ ...prev, isActive: false }) : null)}
                      className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg border text-xs font-medium transition-all ${
                        editingLang.isActive === false
                          ? 'border-red-500 bg-red-50 text-red-600'
                          : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300'
                      } ${editingLang.code === 'ar' ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <X className="h-3.5 w-3.5" /> معطلة
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <Button
                  type="button"
                  className="flex-1 bg-[#1ABB9C] hover:bg-[#17a589] text-white font-bold"
                  disabled={!editingLang.name || !editingLang.flag}
                  onClick={() => updateLanguage(editingLang)}
                >
                  <Save className="h-4 w-4 me-2" /> حفظ التغييرات
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowEditLang(false)}>
                  إلغاء
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
