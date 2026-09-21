'use client';

import React, { useEffect, useState, useRef, useMemo } from 'react';
import { useTranslation } from '@/lib/i18n/useTranslation';
import { useTranslationStore } from '@/lib/store/translation-store';
import {
  Bell, Plus, Trash2, Edit, Send, CheckCircle2, AlertTriangle,
  Info, Sparkles, Loader2, Megaphone, Target, Link as LinkIcon,
  ToggleLeft, ToggleRight, ShieldAlert, ArrowRight, Eye, Users,
  History, Globe, Copy, Check, Filter, AlertCircle, RefreshCw
} from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

interface Announcement {
  id: string;
  contentAr: string;
  contentEn: string | null;
  targetRole: string;
  isActive: boolean;
  bgColor: string;
  textColor: string;
  linkUrl: string | null;
  createdAt: string;
}

interface BroadcastHistoryItem {
  batchId: string;
  title: string;
  titleEn: string | null;
  body: string;
  bodyEn: string | null;
  type: string;
  createdAt: string;
  recipientCount: number;
  senderAdminName: string;
  targetCriteria: {
    target?: string;
    targetStatus?: string;
    targetLanguage?: string;
    storeId?: string | null;
  };
  parsedData: any;
}

export default function AdminNotificationsPage() {
  const { locale } = useTranslation();
  const isAr = locale === 'ar';
  const { languages: availableLanguages } = useTranslationStore();

  const t = (ar: string, en: string, fr?: string, es?: string) => {
    if (locale === 'ar') return ar;
    if (locale === 'fr') return fr || en;
    if (locale === 'es') return es || en;
    return en;
  };

  // Tabs: 'bell' | 'banners' | 'history'
  const [activeTab, setActiveTab] = useState<'bell' | 'banners' | 'history'>('bell');

  // ============================================
  // TAB 1: BELL DISPATCHER STATE
  // ============================================
  const [targetRole, setTargetRole] = useState('all');
  const [targetStatus, setTargetStatus] = useState('all');
  const [targetLanguage, setTargetLanguage] = useState('all');
  const [targetUserId, setTargetUserId] = useState('');
  const [targetStoreId, setTargetStoreId] = useState('');
  const [notifType, setNotifType] = useState('system');
  const [notifUrgency, setNotifUrgency] = useState('normal');
  const [notifActionPage, setNotifActionPage] = useState('none');
  const [notifActionUrl, setNotifActionUrl] = useState('');

  // Active language in composition tab
  const [activeLangTab, setActiveLangTab] = useState<string>('ar');

  // Unified translations storage: { [langCode]: { title: '', body: '', actionLabel: '' } }
  const [translations, setTranslations] = useState<Record<string, { title: string; body: string; actionLabel: string }>>({
    ar: { title: '', body: '', actionLabel: 'عرض التفاصيل' },
    en: { title: '', body: '', actionLabel: 'View Details' },
    fr: { title: '', body: '', actionLabel: 'Voir les détails' },
    es: { title: '', body: '', actionLabel: 'Ver detalles' },
  });

  // Audience Estimation with 500ms Debounce
  const [estimatedAudience, setEstimatedAudience] = useState<number | null>(null);
  const [isEstimating, setIsEstimating] = useState(false);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Sending state & Confirmation Dialog
  const [isSendingNotif, setIsSendingNotif] = useState(false);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);

  // Estimate audience count
  const estimateAudienceCount = async (role: string, status: string, lang: string, uid: string, sid: string) => {
    setIsEstimating(true);
    try {
      const res = await fetch('/api/admin/notifications/estimate-audience', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetRole: role,
          targetStatus: status,
          targetLanguage: lang,
          targetUserId: uid || undefined,
          targetStoreId: sid || undefined,
        }),
      });
      const data = await res.json();
      if (data.success && typeof data.count === 'number') {
        setEstimatedAudience(data.count);
      }
    } catch (err) {
      console.error('Failed to estimate audience:', err);
    } finally {
      setIsEstimating(false);
    }
  };

  useEffect(() => {
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    debounceTimerRef.current = setTimeout(() => {
      estimateAudienceCount(targetRole, targetStatus, targetLanguage, targetUserId, targetStoreId);
    }, 500);

    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
  }, [targetRole, targetStatus, targetLanguage, targetUserId, targetStoreId]);

  const handleTranslationChange = (lang: string, field: 'title' | 'body' | 'actionLabel', value: string) => {
    setTranslations((prev) => ({
      ...prev,
      [lang]: {
        title: prev[lang]?.title || '',
        body: prev[lang]?.body || '',
        actionLabel: prev[lang]?.actionLabel || '',
        [field]: value,
      },
    }));
  };

  // Check if a language has content
  const hasContent = (lang: string) => {
    return Boolean(translations[lang]?.title?.trim() && translations[lang]?.body?.trim());
  };

  const handleOpenSendConfirmation = (e: React.FormEvent) => {
    e.preventDefault();
    const arTitle = translations.ar?.title?.trim();
    const arBody = translations.ar?.body?.trim();
    const enTitle = translations.en?.title?.trim();
    const enBody = translations.en?.body?.trim();

    if (!arTitle && !enTitle) {
      toast.error(t('يرجى كتابة عنوان للإشعار (بالعربية أو الإنجليزية على الأقل)', 'Please enter at least an Arabic or English title', 'Veuillez saisir un titre'));
      return;
    }
    if (!arBody && !enBody) {
      toast.error(t('يرجى كتابة محتوى للإشعار (بالعربية أو الإنجليزية على الأقل)', 'Please enter at least an Arabic or English body', 'Veuillez saisir un contenu'));
      return;
    }

    if (targetRole === 'user' && !targetUserId.trim()) {
      toast.error(t('يرجى إدخال معرّف أو بريد المستخدم المستهدف', 'Please enter target User ID or Email', 'ID utilisateur requis'));
      return;
    }

    // Always show confirmation before sending broadcast
    setIsConfirmDialogOpen(true);
  };

  const executeSendNotification = async () => {
    setIsConfirmDialogOpen(false);
    setIsSendingNotif(true);
    try {
      const payload = {
        title: translations.ar?.title || translations.en?.title,
        titleEn: translations.en?.title || translations.ar?.title,
        body: translations.ar?.body || translations.en?.body,
        bodyEn: translations.en?.body || translations.ar?.body,
        target: targetRole,
        targetStatus,
        targetLanguage,
        userId: targetRole === 'user' ? targetUserId.trim() : undefined,
        storeId: targetRole === 'specific_store' ? targetStoreId.trim() : undefined,
        type: notifType,
        urgency: notifUrgency,
        actionPage: notifActionPage === 'none' ? null : notifActionPage,
        actionUrl: notifActionUrl || null,
        actionLabelAr: translations.ar?.actionLabel || 'عرض التفاصيل',
        actionLabelEn: translations.en?.actionLabel || 'View Details',
        translations,
      };

      const res = await fetch('/api/admin/notifications/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        toast.success(
          t(
            `تم إرسال الإشعار بنجاح إلى ${data.count} مستخدم`,
            `Notification sent successfully to ${data.count} users`,
            `Notification envoyée avec succès à ${data.count} utilisateurs`,
            `Notificación enviada con éxito a ${data.count} usuarios`
          )
        );
        resetBellForm();
        fetchHistory();
      } else {
        toast.error(data.error || t('فشل إرسال الإشعار', 'Failed to send notification', 'Échec de l\'envoi'));
      }
    } catch (err) {
      console.error(err);
      toast.error(t('حدث خطأ في الاتصال بالخادم', 'Connection error', 'Erreur de connexion'));
    } finally {
      setIsSendingNotif(false);
    }
  };

  const resetBellForm = () => {
    setTranslations({
      ar: { title: '', body: '', actionLabel: 'عرض التفاصيل' },
      en: { title: '', body: '', actionLabel: 'View Details' },
      fr: { title: '', body: '', actionLabel: 'Voir les détails' },
      es: { title: '', body: '', actionLabel: 'Ver detalles' },
    });
    setTargetRole('all');
    setTargetStatus('all');
    setTargetLanguage('all');
    setTargetUserId('');
    setTargetStoreId('');
    setNotifType('system');
    setNotifUrgency('normal');
    setNotifActionPage('none');
    setNotifActionUrl('');
  };

  // Clone from history
  const handleCloneTemplate = (item: BroadcastHistoryItem) => {
    if (item.parsedData?.translations) {
      setTranslations(item.parsedData.translations);
    } else {
      setTranslations({
        ar: { title: item.title || '', body: item.body || '', actionLabel: item.parsedData?.actionLabelAr || 'عرض التفاصيل' },
        en: { title: item.titleEn || item.title || '', body: item.bodyEn || item.body || '', actionLabel: item.parsedData?.actionLabelEn || 'View Details' },
        fr: { title: item.titleEn || item.title || '', body: item.bodyEn || item.body || '', actionLabel: 'Voir les détails' },
        es: { title: item.titleEn || item.title || '', body: item.bodyEn || item.body || '', actionLabel: 'Ver detalles' },
      });
    }

    if (item.targetCriteria?.target) setTargetRole(item.targetCriteria.target);
    if (item.targetCriteria?.targetStatus) setTargetStatus(item.targetCriteria.targetStatus);
    if (item.targetCriteria?.targetLanguage) setTargetLanguage(item.targetCriteria.targetLanguage);
    if (item.targetCriteria?.storeId) setTargetStoreId(item.targetCriteria.storeId);
    if (item.type) setNotifType(item.type);
    if (item.parsedData?.urgency) setNotifUrgency(item.parsedData.urgency);
    if (item.parsedData?.actionPage) setNotifActionPage(item.parsedData.actionPage);
    if (item.parsedData?.actionUrl) setNotifActionUrl(item.parsedData.actionUrl);

    setActiveTab('bell');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    toast.info(t('تم تحميل بيانات الإشعار كقالب بنجاح', 'Template loaded into form', 'Modèle chargé'));
  };

  // ============================================
  // TAB 2: ANNOUNCEMENT BANNERS STATE
  // ============================================
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [isLoadingBanners, setIsLoadingBanners] = useState(true);
  const [isSubmittingBanner, setIsSubmittingBanner] = useState(false);

  const [bannerContentAr, setBannerContentAr] = useState('');
  const [bannerContentEn, setBannerContentEn] = useState('');
  const [bannerTargetRole, setBannerTargetRole] = useState('all');
  const [bannerBgColor, setBannerBgColor] = useState('bg-primary');
  const [bannerTextColor, setBannerTextColor] = useState('text-white');
  const [bannerLinkUrl, setBannerLinkUrl] = useState('');
  const [bannerIsActive, setBannerIsActive] = useState(true);
  const [editingBannerId, setEditingBannerId] = useState<string | null>(null);

  const fetchAnnouncements = async () => {
    setIsLoadingBanners(true);
    try {
      const res = await fetch('/api/admin/announcements?all=true');
      const data = await res.json();
      if (data.success) {
        setAnnouncements(data.data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingBanners(false);
    }
  };

  const handleSaveBanner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bannerContentAr.trim()) {
      toast.error(t('يرجى كتابة نص التنبيه بالعربية', 'Please fill the Arabic announcement content', 'Contenu arabe requis'));
      return;
    }

    setIsSubmittingBanner(true);
    try {
      const payload = {
        id: editingBannerId,
        contentAr: bannerContentAr,
        contentEn: bannerContentEn || null,
        targetRole: bannerTargetRole,
        bgColor: bannerBgColor,
        textColor: bannerTextColor,
        linkUrl: bannerLinkUrl || null,
        isActive: bannerIsActive,
      };

      const method = editingBannerId ? 'PUT' : 'POST';
      const res = await fetch('/api/admin/announcements', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        toast.success(editingBannerId ? t('تم تحديث شريط التنبيه بنجاح', 'Banner updated successfully', 'Bannière mise à jour') : t('تم إنشاء شريط التنبيه بنجاح', 'Banner created successfully', 'Bannière créée'));
        resetBannerForm();
        fetchAnnouncements();
      } else {
        toast.error(data.error || t('فشل حفظ التنبيه', 'Failed to save banner', 'Échec de l\'enregistrement'));
      }
    } catch (err) {
      console.error(err);
      toast.error(t('حدث خطأ في الاتصال بالخادم', 'Connection error', 'Erreur de connexion'));
    } finally {
      setIsSubmittingBanner(false);
    }
  };

  const handleDeleteBanner = async (id: string) => {
    if (!confirm(t('هل أنت متأكد من حذف هذا التنبيه نهائياً؟', 'Are you sure you want to delete this banner?', 'Confirmer la suppression ?'))) return;
    try {
      const res = await fetch(`/api/admin/announcements?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        toast.success(t('تم حذف التنبيه بنجاح', 'Banner deleted successfully', 'Supprimé avec succès'));
        if (editingBannerId === id) resetBannerForm();
        fetchAnnouncements();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleBannerStatus = async (banner: Announcement) => {
    try {
      const res = await fetch('/api/admin/announcements', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: banner.id, isActive: !banner.isActive }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(t('تم تعديل حالة النشاط بنجاح', 'Status updated successfully', 'Statut mis à jour'));
        fetchAnnouncements();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleEditBannerClick = (banner: Announcement) => {
    setEditingBannerId(banner.id);
    setBannerContentAr(banner.contentAr);
    setBannerContentEn(banner.contentEn || '');
    setBannerTargetRole(banner.targetRole);
    setBannerBgColor(banner.bgColor);
    setBannerTextColor(banner.textColor);
    setBannerLinkUrl(banner.linkUrl || '');
    setBannerIsActive(banner.isActive);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetBannerForm = () => {
    setEditingBannerId(null);
    setBannerContentAr('');
    setBannerContentEn('');
    setBannerTargetRole('all');
    setBannerBgColor('bg-primary');
    setBannerTextColor('text-white');
    setBannerLinkUrl('');
    setBannerIsActive(true);
  };

  // ============================================
  // TAB 3: BROADCAST HISTORY STATE
  // ============================================
  const [historyItems, setHistoryItems] = useState<BroadcastHistoryItem[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  const fetchHistory = async () => {
    setIsLoadingHistory(true);
    try {
      const res = await fetch('/api/admin/notifications/history');
      const data = await res.json();
      if (data.success) {
        setHistoryItems(data.history || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
    fetchHistory();
  }, []);

  const bannerBgColors = [
    { key: 'bg-primary', label: t('الأزرق الرئيسي', 'Brand Blue', 'Bleu de marque') },
    { key: 'bg-amber-500', label: t('الأصفر التنبيهي', 'Warning Yellow', 'Jaune avertissement') },
    { key: 'bg-emerald-600', label: t('الأخضر النجاحي', 'Success Green', 'Vert succès') },
    { key: 'bg-rose-600', label: t('الأحمر العاجل', 'Critical Red', 'Rouge critique') },
    { key: 'bg-slate-800 dark:bg-slate-900', label: t('الداكن/الأسود', 'Dark Slate', 'Noir ardoise') },
  ];

  return (
    <div className="space-y-6 pb-16">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b pb-5">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-foreground flex items-center gap-2">
            <span className="p-2 rounded-xl bg-primary/10 text-primary">
              <Megaphone className="size-6" />
            </span>
            {t('مركز الإشعارات والتنبيهات الشامل', 'Comprehensive Notification Hub', 'Centre de notifications global', 'Centro integral de notificaciones')}
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            {t(
              'إدارة وبث الإشعارات الجماعية المستهدفة لكافة الأدوار بالمنصة، وأشرطة التنبيهات العلوية، مع دعم كامل للترجمات الحالية والمستقبلية.',
              'Broadcast targeted notifications across all platform roles, manage announcement banners, with native extensible multilingual support.',
              'Diffusez des notifications ciblées sur tous les rôles, gérez les bannières, avec support multilingue dynamique.'
            )}
          </p>
        </div>

        {/* Global Tabs */}
        <div className="flex items-center gap-1 bg-muted/60 p-1 rounded-xl border">
          <button
            onClick={() => setActiveTab('bell')}
            className={cn(
              'flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all',
              activeTab === 'bell'
                ? 'bg-background text-primary shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <Bell className="size-3.5" />
            <span>{t('إرسال إشعار جرس', 'Targeted Bell', 'Notification cloche')}</span>
          </button>

          <button
            onClick={() => setActiveTab('banners')}
            className={cn(
              'flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all',
              activeTab === 'banners'
                ? 'bg-background text-primary shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <Megaphone className="size-3.5" />
            <span>{t('أشرطة التنبيه', 'Banners', 'Bannières')}</span>
            <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4">
              {announcements.length}
            </Badge>
          </button>

          <button
            onClick={() => {
              setActiveTab('history');
              fetchHistory();
            }}
            className={cn(
              'flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all',
              activeTab === 'history'
                ? 'bg-background text-primary shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <History className="size-3.5" />
            <span>{t('سجل الإرسال والتدقيق', 'Broadcast History', 'Historique des envois')}</span>
          </button>
        </div>
      </div>

      {/* ==================================================== */}
      {/* TAB 1: TARGETED BELL DISPATCHER */}
      {/* ==================================================== */}
      {activeTab === 'bell' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Main Composition Form (Left 2 cols) */}
          <Card className="lg:col-span-2 border shadow-sm">
            <CardHeader className="border-b bg-muted/20 pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base font-bold flex items-center gap-2 text-foreground">
                    <Send className="size-4 text-primary" />
                    {t('إنشاء وبث إشعار جرس موجه', 'Compose & Broadcast Bell Notification', 'Créer et diffuser une notification')}
                  </CardTitle>
                  <CardDescription className="text-xs mt-0.5">
                    {t(
                      'يظهر الإشعار فوراً في جرس الإشعارات لجميع المستخدمين المطابقين للفئات المحددة.',
                      'Appears instantly in the notification bell for users matching the target criteria.',
                      'Apparaît instantanément dans la cloche pour les utilisateurs ciblés.'
                    )}
                  </CardDescription>
                </div>

                {/* Live Audience Badge */}
                <div className="flex items-center gap-1.5 bg-primary/10 text-primary px-3 py-1.5 rounded-xl border border-primary/20">
                  <Users className="size-3.5 shrink-0" />
                  <span className="text-xs font-bold">
                    {isEstimating ? (
                      <span className="inline-flex items-center gap-1">
                        <Loader2 className="size-3 animate-spin" />
                        {t('جاري الحساب...', 'Estimating...', 'Calcul...')}
                      </span>
                    ) : (
                      <span>
                        {t('المستهدفون:', 'Audience:', 'Cible :')}{' '}
                        <strong className="font-black text-sm">{estimatedAudience ?? 0}</strong>{' '}
                        {t('مستخدم', 'users', 'utilisateurs')}
                      </span>
                    )}
                  </span>
                </div>
              </div>
            </CardHeader>

            <CardContent className="pt-6 space-y-6">
              <form onSubmit={handleOpenSendConfirmation} className="space-y-6">
                {/* 1. Targeting Matrix: Role + Status + Language */}
                <div className="p-4 bg-muted/30 rounded-xl border space-y-4">
                  <div className="flex items-center gap-2 pb-2 border-b">
                    <Filter className="size-3.5 text-primary" />
                    <span className="text-xs font-bold text-foreground">
                      {t('1. معايير الجمهور المستهدف (Targeting Matrix)', '1. Target Audience Criteria', '1. Critères de ciblage')}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {/* Role Filter */}
                    <div className="space-y-1.5">
                      <Label className="text-xs font-bold">{t('الدور في المنصة *', 'Platform Role *', 'Rôle *')}</Label>
                      <select
                        value={targetRole}
                        onChange={(e) => setTargetRole(e.target.value)}
                        className="w-full bg-background border border-input rounded-md px-3 h-9 text-xs font-bold outline-none cursor-pointer shadow-sm"
                      >
                        <option value="all">{t('الجميع (كافة المستخدمين)', 'All Users (Everyone)', 'Tous les utilisateurs')}</option>
                        <option value="seller">🏪 {t('التجار (Sellers)', 'Sellers / Merchants', 'Vendeurs')}</option>
                        <option value="store_manager">👔 {t('مدراء الفروع والمتاجر', 'Store Managers', 'Gérants')}</option>
                        <option value="buyer">🛒 {t('المشترين والزبائن', 'Buyers / Customers', 'Acheteurs')}</option>
                        <option value="logistics">🚚 {t('مندوبو الشحن واللوجستيات', 'Logistics & Couriers', 'Livreurs')}</option>
                        <option value="supplier">📦 {t('الموردون وتجار الجملة', 'Suppliers', 'Fournisseurs')}</option>
                        <option value="admin">🛡️ {t('المشرفون والإدارة (Admins)', 'Admins & Staff', 'Administrateurs')}</option>
                        <option value="user">👤 {t('مستخدم محدد (بالـ ID/Email)', 'Specific User', 'Utilisateur spécifique')}</option>
                        <option value="specific_store">🏬 {t('متجر وفروعه بالكامل', 'Entire Store & Staff', 'Boutique spécifique')}</option>
                      </select>
                    </div>

                    {/* Account Status Filter */}
                    <div className="space-y-1.5">
                      <Label className="text-xs font-bold">{t('حالة الحساب *', 'Account Status *', 'Statut du compte *')}</Label>
                      <select
                        value={targetStatus}
                        onChange={(e) => setTargetStatus(e.target.value)}
                        className="w-full bg-background border border-input rounded-md px-3 h-9 text-xs font-bold outline-none cursor-pointer shadow-sm"
                      >
                        <option value="all">{t('كافة الحالات (النشطة وغيرها)', 'All Statuses (Active & Others)', 'Tous les statuts')}</option>
                        <option value="active">✅ {t('الحسابات النشطة فقط (Active)', 'Active Accounts Only', 'Comptes actifs uniquement')}</option>
                        <option value="incomplete">⏳ {t('غير المكتملة (Incomplete)', 'Incomplete Onboarding', 'Incomplets')}</option>
                        <option value="pending">🛡️ {t('بانتظار التوثيق (Pending KYC)', 'Pending Verification', 'En attente')}</option>
                        <option value="suspended">⛔ {t('المعلقة والمحظورة (Suspended)', 'Suspended / Banned', 'Suspendus')}</option>
                      </select>
                    </div>

                    {/* Language Filter */}
                    <div className="space-y-1.5">
                      <Label className="text-xs font-bold">{t('لغة حساب المستلم', 'User Account Language', 'Langue du compte')}</Label>
                      <select
                        value={targetLanguage}
                        onChange={(e) => setTargetLanguage(e.target.value)}
                        className="w-full bg-background border border-input rounded-md px-3 h-9 text-xs font-bold outline-none cursor-pointer shadow-sm"
                      >
                        <option value="all">{t('كافة اللغات (إرسال للجميع)', 'All Languages', 'Toutes les langues')}</option>
                        {availableLanguages.map((lang) => (
                          <option key={lang.code} value={lang.code}>
                            {lang.flag} {lang.name} ({lang.code.toUpperCase()})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Specific User Input */}
                  {targetRole === 'user' && (
                    <div className="space-y-1.5 pt-2 border-t animate-in fade-in">
                      <Label htmlFor="targetUserId" className="text-xs font-bold text-destructive flex items-center gap-1">
                        <AlertCircle className="size-3.5" />
                        {t('معرّف المستخدم أو بريده الإلكتروني (User ID or Email) *', 'Target User ID or Email *', 'ID ou Email de l\'utilisateur *')}
                      </Label>
                      <Input
                        id="targetUserId"
                        type="text"
                        placeholder="clxxxx... or user@example.com"
                        value={targetUserId}
                        onChange={(e) => setTargetUserId(e.target.value)}
                        className="text-xs border-destructive/40 focus-visible:ring-destructive"
                        required
                      />
                    </div>
                  )}

                  {/* Specific Store Input */}
                  {targetRole === 'specific_store' && (
                    <div className="space-y-1.5 pt-2 border-t animate-in fade-in">
                      <Label htmlFor="targetStoreId" className="text-xs font-bold text-primary flex items-center gap-1">
                        <Target className="size-3.5" />
                        {t('معرّف المتجر المستهدف (Store ID) *', 'Target Store ID *', 'ID de la boutique *')}
                      </Label>
                      <Input
                        id="targetStoreId"
                        type="text"
                        placeholder="clstore..."
                        value={targetStoreId}
                        onChange={(e) => setTargetStoreId(e.target.value)}
                        className="text-xs"
                        required
                      />
                    </div>
                  )}
                </div>

                {/* 2. Dynamic Multilingual Composition Tabs */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b pb-2">
                    <div className="flex items-center gap-2">
                      <Globe className="size-3.5 text-primary" />
                      <span className="text-xs font-bold text-foreground">
                        {t('2. صياغة الإشعار باللغات المختلفة (Multilingual Composition)', '2. Multilingual Content', '2. Contenu multilingue')}
                      </span>
                    </div>

                    {/* Language Tabs Selector */}
                    <div className="flex items-center gap-1 bg-muted/60 p-1 rounded-lg">
                      {availableLanguages.map((lang) => {
                        const filled = hasContent(lang.code);
                        return (
                          <button
                            key={lang.code}
                            type="button"
                            onClick={() => setActiveLangTab(lang.code)}
                            className={cn(
                              'flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold transition-all',
                              activeLangTab === lang.code
                                ? 'bg-background text-primary shadow-sm'
                                : 'text-muted-foreground hover:text-foreground'
                            )}
                          >
                            <span>{lang.flag}</span>
                            <span>{lang.name}</span>
                            {filled && (
                              <span className="size-1.5 rounded-full bg-emerald-500" title={t('مكتمل', 'Filled', 'Rempli')} />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Active Language Editor Fields */}
                  <div className="space-y-4 p-4 rounded-xl border bg-card">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span className="font-bold flex items-center gap-1.5 text-foreground">
                        {availableLanguages.find((l) => l.code === activeLangTab)?.flag}{' '}
                        {availableLanguages.find((l) => l.code === activeLangTab)?.name} (
                        {activeLangTab.toUpperCase()})
                      </span>
                      <span className="text-[10px] bg-muted px-2 py-0.5 rounded">
                        {activeLangTab === 'ar' ? 'RTL' : 'LTR'}
                      </span>
                    </div>

                    {/* Title Input */}
                    <div className="space-y-1.5">
                      <Label className="text-xs font-bold flex items-center justify-between">
                        <span>{t('عنوان الإشعار *', 'Notification Title *', 'Titre de la notification *')}</span>
                        {activeLangTab === 'ar' && <span className="text-[10px] text-destructive">{t('أساسي', 'Required', 'Obligatoire')}</span>}
                      </Label>
                      <Input
                        type="text"
                        placeholder={
                          activeLangTab === 'ar'
                            ? 'مثال: تحديث أمني هام على حسابك 🛡️'
                            : activeLangTab === 'fr'
                            ? 'Ex: Mise à jour de sécurité importante 🛡️'
                            : 'Example: Important security update 🛡️'
                        }
                        value={translations[activeLangTab]?.title || ''}
                        onChange={(e) => handleTranslationChange(activeLangTab, 'title', e.target.value)}
                        dir={activeLangTab === 'ar' ? 'rtl' : 'ltr'}
                        className="text-xs font-bold"
                      />
                    </div>

                    {/* Body Input */}
                    <div className="space-y-1.5">
                      <Label className="text-xs font-bold flex items-center justify-between">
                        <span>{t('محتوى وتفاصيل الإشعار *', 'Notification Body *', 'Contenu *')}</span>
                      </Label>
                      <Textarea
                        rows={3}
                        placeholder={
                          activeLangTab === 'ar'
                            ? 'أدخل نص الرسالة بالكامل...'
                            : activeLangTab === 'fr'
                            ? 'Entrez le message complet...'
                            : 'Enter the message content...'
                        }
                        value={translations[activeLangTab]?.body || ''}
                        onChange={(e) => handleTranslationChange(activeLangTab, 'body', e.target.value)}
                        dir={activeLangTab === 'ar' ? 'rtl' : 'ltr'}
                        className="text-xs font-medium resize-none leading-relaxed"
                      />
                    </div>

                    {/* Action Button Label for this language */}
                    <div className="space-y-1.5 pt-2 border-t">
                      <Label className="text-xs font-bold">
                        {t('نص زر الإجراء السريع بهذه اللغة', 'Quick Action Button Label', 'Texte du bouton d\'action')}
                      </Label>
                      <Input
                        type="text"
                        placeholder={
                          activeLangTab === 'ar' ? 'عرض التفاصيل' : activeLangTab === 'fr' ? 'Voir les détails' : 'View Details'
                        }
                        value={translations[activeLangTab]?.actionLabel || ''}
                        onChange={(e) => handleTranslationChange(activeLangTab, 'actionLabel', e.target.value)}
                        dir={activeLangTab === 'ar' ? 'rtl' : 'ltr'}
                        className="text-xs"
                      />
                    </div>
                  </div>
                </div>

                {/* 3. Category, Urgency & Redirection Presets */}
                <div className="p-4 bg-muted/20 rounded-xl border space-y-4">
                  <div className="flex items-center gap-2 pb-2 border-b">
                    <LinkIcon className="size-3.5 text-primary" />
                    <span className="text-xs font-bold text-foreground">
                      {t('3. التصنيف، الاستعجال، وصفحة التوجيه', '3. Category, Urgency & Redirection', '3. Catégorie et redirection')}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {/* Category */}
                    <div className="space-y-1.5">
                      <Label className="text-xs font-bold">{t('نوع التنبيه والأيقونة', 'Category & Icon', 'Catégorie')}</Label>
                      <select
                        value={notifType}
                        onChange={(e) => setNotifType(e.target.value)}
                        className="w-full bg-background border border-input rounded-md px-3 h-9 text-xs font-bold outline-none cursor-pointer shadow-sm"
                      >
                        <option value="system">💡 {t('النظام (عام)', 'System (General)', 'Système')}</option>
                        <option value="wallet">💜 {t('المالية والمحفظة', 'Wallet & Payouts', 'Portefeuille')}</option>
                        <option value="order">📦 {t('الطلبات والمبيعات', 'Orders & Sales', 'Commandes')}</option>
                        <option value="verification">🛡️ {t('التوثيق والأمان', 'Verification & Security', 'Vérification')}</option>
                        <option value="promotion">🏷️ {t('العروض والكوبونات', 'Promotions & Coupons', 'Promotions')}</option>
                        <option value="alert">⚠️ {t('تحذير / تنبيه خطر', 'Warning / Alert', 'Alerte')}</option>
                      </select>
                    </div>

                    {/* Urgency */}
                    <div className="space-y-1.5">
                      <Label className="text-xs font-bold">{t('درجة الاستعجال', 'Urgency Level', 'Niveau d\'urgence')}</Label>
                      <select
                        value={notifUrgency}
                        onChange={(e) => setNotifUrgency(e.target.value)}
                        className="w-full bg-background border border-input rounded-md px-3 h-9 text-xs font-bold outline-none cursor-pointer shadow-sm"
                      >
                        <option value="normal">{t('عادي', 'Normal', 'Normal')}</option>
                        <option value="high">{t('هام', 'High', 'Important')}</option>
                        <option value="urgent">{t('عاجل (برواز ملون)', 'Urgent (Border highlight)', 'Urgent')}</option>
                        <option value="low">{t('منخفض', 'Low', 'Faible')}</option>
                      </select>
                    </div>

                    {/* Redirection Page */}
                    <div className="space-y-1.5">
                      <Label className="text-xs font-bold">{t('صفحة التوجيه الداخلية', 'Internal Redirection', 'Redirection interne')}</Label>
                      <select
                        value={notifActionPage}
                        onChange={(e) => setNotifActionPage(e.target.value)}
                        className="w-full bg-background border border-input rounded-md px-3 h-9 text-xs font-bold outline-none cursor-pointer shadow-sm"
                      >
                        <option value="none">{t('لا يوجد (إغلاق اللوحة فقط)', 'None (Close panel)', 'Aucune')}</option>
                        <option value="seller-orders">{t('طلبات التاجر (/seller/orders)', 'Seller Orders', 'Commandes vendeur')}</option>
                        <option value="buyer-orders">{t('طلبات المشتري (/buyer/orders)', 'Buyer Orders', 'Commandes acheteur')}</option>
                        <option value="verifications">{t('صفحة التوثيق (/seller/verification)', 'Verification Page', 'Vérification')}</option>
                        <option value="wallet">{t('المحفظة والرصيد (/seller/wallet)', 'Wallet', 'Portefeuille')}</option>
                        <option value="billing-plans">{t('باقات الاشتراك (/seller/billing/plans)', 'Billing Plans', 'Abonnements')}</option>
                        <option value="profile">{t('الملف الشخصي والإعدادات', 'Settings', 'Paramètres')}</option>
                      </select>
                    </div>
                  </div>

                  {/* External URL */}
                  <div className="space-y-1.5 pt-2 border-t">
                    <Label htmlFor="notifActionUrl" className="text-xs font-bold text-muted-foreground flex items-center gap-1">
                      <span>{t('أو رابط خارجي مخصص (Optional External URL)', 'Or Custom External URL', 'Ou URL externe')}</span>
                    </Label>
                    <Input
                      id="notifActionUrl"
                      type="url"
                      placeholder="https://..."
                      value={notifActionUrl}
                      onChange={(e) => setNotifActionUrl(e.target.value)}
                      className="text-xs"
                    />
                  </div>
                </div>

                {/* Submit Actions */}
                <div className="flex items-center justify-end gap-3 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={resetBellForm}
                    className="text-xs font-bold"
                    disabled={isSendingNotif}
                  >
                    {t('تفريغ الحقول', 'Clear Form', 'Réinitialiser')}
                  </Button>

                  <Button
                    type="submit"
                    disabled={isSendingNotif}
                    className="text-xs font-bold bg-[#1ABB9C] hover:bg-[#159a80] text-white flex items-center gap-1.5 shadow-sm px-6 h-9"
                  >
                    {isSendingNotif ? (
                      <>
                        <Loader2 className="size-3.5 animate-spin mr-1" />
                        {t('جاري الإرسال...', 'Sending...', 'Envoi...')}
                      </>
                    ) : (
                      <>
                        <Send className="size-3.5" />
                        {t('إرسال الإشعار الآن', 'Send Notification', 'Envoyer la notification')}
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Live Preview & Tips (Right 1 col) */}
          <div className="space-y-6">
            {/* Live Preview Card */}
            <Card className="border shadow-sm bg-gradient-to-b from-card to-muted/20">
              <CardHeader className="border-b pb-3">
                <CardTitle className="text-xs font-black uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                  <Eye className="size-3.5 text-primary" />
                  {t('معاينة حية للإشعار بالجرس', 'Live Bell Notification Preview', 'Aperçu en direct')}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 space-y-3">
                <div className={cn(
                  'p-4 rounded-xl border bg-background shadow-sm transition-all space-y-2 relative',
                  notifUrgency === 'urgent' && 'border-destructive/40 ring-1 ring-destructive/20'
                )}>
                  {/* Unread indicator */}
                  <div className="absolute top-3 start-3 size-2 rounded-full bg-primary" />

                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-full bg-primary/10 text-primary shrink-0">
                      <Bell className="size-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-foreground line-clamp-1">
                        {translations[activeLangTab]?.title?.trim() || t('عنوان الإشعار التجريبي', 'Notification Title Preview', 'Titre aperçu')}
                      </p>
                      <p className="text-[11px] text-muted-foreground mt-1 line-clamp-2 leading-relaxed">
                        {translations[activeLangTab]?.body?.trim() || t('تفاصيل الإشعار تظهر هنا بالشكل الحقيقي للمستخدم...', 'Body text will display here...', 'Le contenu apparaîtra ici...')}
                      </p>

                      <div className="flex items-center justify-between pt-3 border-t mt-3 text-[10px] text-muted-foreground">
                        <span>{t('الآن', 'Just now', 'À l\'instant')}</span>
                        <span className="bg-primary text-white px-2.5 py-0.5 rounded-full font-bold">
                          {translations[activeLangTab]?.actionLabel || t('عرض التفاصيل', 'View Details', 'Voir')}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="text-[11px] text-muted-foreground space-y-1 bg-muted/40 p-3 rounded-lg border">
                  <div className="font-bold text-foreground flex items-center gap-1">
                    <Info className="size-3 text-primary" />
                    {t('ملاحظة الترجمة:', 'Translation Note:', 'Note :')}
                  </div>
                  <p>
                    {t(
                      'المستخدم سيشاهد الإشعار تلقائياً باللغة التي اختارها في حسابه. في حال عدم توفر ترجمة للغته، سيعرض النظام البديل الإنجليزي ثم العربي تلقائياً دون أي خطأ.',
                      'Users automatically see the notification in their chosen language. If not provided, it falls back cleanly to English or Arabic.',
                      'L\'utilisateur verra l\'avis dans sa langue préférée ou en anglais/arabe.'
                    )}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Targeting Summary Card */}
            <Card className="border shadow-sm">
              <CardHeader className="border-b pb-3">
                <CardTitle className="text-xs font-black uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                  <Target className="size-3.5 text-primary" />
                  {t('ملخص الجمهور المستهدف', 'Target Audience Summary', 'Résumé de l\'audience')}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b">
                  <span className="text-muted-foreground">{t('الفئة:', 'Role:', 'Rôle :')}</span>
                  <span className="font-bold">{targetRole.toUpperCase()}</span>
                </div>
                <div className="flex justify-between py-1 border-b">
                  <span className="text-muted-foreground">{t('الحالة:', 'Status:', 'Statut :')}</span>
                  <span className="font-bold">{targetStatus.toUpperCase()}</span>
                </div>
                <div className="flex justify-between py-1 border-b">
                  <span className="text-muted-foreground">{t('اللغة:', 'Language:', 'Langue :')}</span>
                  <span className="font-bold">{targetLanguage.toUpperCase()}</span>
                </div>
                <div className="flex justify-between py-1 pt-2">
                  <span className="text-muted-foreground">{t('العدد المقدر:', 'Estimated Count:', 'Total estimé :')}</span>
                  <span className="font-black text-primary text-sm">{estimatedAudience ?? 0}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* TAB 2: ANNOUNCEMENT BANNERS */}
      {/* ==================================================== */}
      {activeTab === 'banners' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Form */}
          <Card className="border shadow-sm">
            <CardHeader className="border-b bg-muted/20 pb-4">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Megaphone className="size-4 text-primary" />
                {editingBannerId ? t('تعديل شريط التنبيه', 'Edit Banner', 'Modifier la bannière') : t('إنشاء شريط تنبيه علوي جديد', 'Create Announcement Banner', 'Nouvelle bannière')}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <form onSubmit={handleSaveBanner} className="space-y-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold">{t('محتوى التنبيه (بالعربية) *', 'Arabic Content *', 'Contenu arabe *')}</Label>
                  <Textarea
                    rows={2}
                    placeholder="مثال: خصومات كبرى تصل إلى 50% بمناسبة عطلة نهاية الأسبوع!"
                    value={bannerContentAr}
                    onChange={(e) => setBannerContentAr(e.target.value)}
                    dir="rtl"
                    className="text-xs resize-none"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-bold">{t('محتوى التنبيه (بالإنجليزية)', 'English Content', 'Contenu anglais')}</Label>
                  <Textarea
                    rows={2}
                    placeholder="Example: Giant weekend discounts up to 50%!"
                    value={bannerContentEn}
                    onChange={(e) => setBannerContentEn(e.target.value)}
                    dir="ltr"
                    className="text-xs resize-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-bold">{t('الفئة المستهدفة', 'Target Audience', 'Cible')}</Label>
                  <select
                    value={bannerTargetRole}
                    onChange={(e) => setBannerTargetRole(e.target.value)}
                    className="w-full bg-background border border-input rounded-md px-3 h-9 text-xs font-bold outline-none cursor-pointer shadow-sm"
                  >
                    <option value="all">{t('الجميع (عام)', 'Everyone (All)', 'Tous')}</option>
                    <option value="seller">{t('التجار فقط', 'Sellers Only', 'Vendeurs uniquement')}</option>
                    <option value="store_manager">{t('مدراء المتاجر فقط', 'Store Managers Only', 'Gérants uniquement')}</option>
                    <option value="buyer">{t('المشترين فقط', 'Buyers Only', 'Acheteurs uniquement')}</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-bold">{t('رابط التوجيه (اختياري)', 'Redirect Link (Optional)', 'Lien (optionnel)')}</Label>
                  <Input
                    type="url"
                    placeholder="https://..."
                    value={bannerLinkUrl}
                    onChange={(e) => setBannerLinkUrl(e.target.value)}
                    className="text-xs"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold">{t('لون الخلفية', 'Background Color', 'Couleur de fond')}</Label>
                    <select
                      value={bannerBgColor}
                      onChange={(e) => setBannerBgColor(e.target.value)}
                      className="w-full bg-background border border-input rounded-md px-2 h-9 text-xs font-bold outline-none cursor-pointer shadow-sm"
                    >
                      {bannerBgColors.map((color) => (
                        <option key={color.key} value={color.key}>{color.label}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold">{t('لون النص', 'Text Color', 'Couleur du texte')}</Label>
                    <select
                      value={bannerTextColor}
                      onChange={(e) => setBannerTextColor(e.target.value)}
                      className="w-full bg-background border border-input rounded-md px-2 h-9 text-xs font-bold outline-none cursor-pointer shadow-sm"
                    >
                      <option value="text-white">{t('أبيض', 'White', 'Blanc')}</option>
                      <option value="text-yellow-300">{t('أصفر تنبيهي', 'Warning Yellow', 'Jaune')}</option>
                      <option value="text-black">{t('أسود', 'Black', 'Noir')}</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t">
                  <Label className="text-xs font-bold">{t('حالة التفعيل الفوري', 'Instant Activation', 'Activer')}</Label>
                  <button
                    type="button"
                    onClick={() => setBannerIsActive(!bannerIsActive)}
                    className="text-primary hover:opacity-80 transition-opacity"
                  >
                    {bannerIsActive ? (
                      <ToggleRight className="size-7 text-[#1ABB9C]" />
                    ) : (
                      <ToggleLeft className="size-7 text-muted-foreground" />
                    )}
                  </button>
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t">
                  {editingBannerId && (
                    <Button type="button" variant="outline" size="sm" onClick={resetBannerForm} className="text-xs">
                      {t('إلغاء', 'Cancel', 'Annuler')}
                    </Button>
                  )}
                  <Button type="submit" size="sm" disabled={isSubmittingBanner} className="text-xs font-bold bg-[#1ABB9C] hover:bg-[#159a80] text-white">
                    {isSubmittingBanner ? <Loader2 className="size-3.5 animate-spin" /> : editingBannerId ? t('تحديث', 'Update', 'Mettre à jour') : t('إنشاء التنبيه', 'Create Banner', 'Créer')}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* List */}
          <Card className="lg:col-span-2 border shadow-sm">
            <CardHeader className="border-b bg-muted/20 pb-4">
              <CardTitle className="text-sm font-bold flex items-center justify-between">
                <span>{t('أشرطة التنبيه المسجلة', 'Active Announcements', 'Bannières enregistrées')}</span>
                <Button variant="ghost" size="sm" onClick={fetchAnnouncements} className="h-7 text-xs gap-1">
                  <RefreshCw className="size-3" />
                  {t('تحديث', 'Refresh', 'Actualiser')}
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {isLoadingBanners ? (
                <div className="py-20 flex justify-center"><Loader2 className="size-8 animate-spin text-primary" /></div>
              ) : announcements.length === 0 ? (
                <div className="py-16 text-center text-muted-foreground text-xs">{t('لا توجد أشرطة تنبيه حالياً', 'No banners created yet', 'Aucune bannière')}</div>
              ) : (
                <div className="divide-y">
                  {announcements.map((banner) => (
                    <div key={banner.id} className="p-4 space-y-3 hover:bg-muted/5 transition-colors">
                      <div className={cn('px-4 py-2 rounded-md text-xs font-bold text-center flex items-center justify-center gap-2 shadow-sm', banner.bgColor, banner.textColor)}>
                        <span>{isAr ? banner.contentAr : (banner.contentEn || banner.contentAr)}</span>
                        {banner.linkUrl && <span className="text-[10px] underline ml-2">[{t('رابط', 'Link', 'Lien')}]</span>}
                      </div>

                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-[10px]">
                            {banner.targetRole.toUpperCase()}
                          </Badge>
                          <span>{new Date(banner.createdAt).toLocaleDateString()}</span>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleToggleBannerStatus(banner)}
                            className="flex items-center gap-1 text-xs font-bold"
                          >
                            {banner.isActive ? (
                              <span className="text-emerald-600 flex items-center gap-1">
                                <CheckCircle2 className="size-3.5" />
                                {t('نشط', 'Active', 'Actif')}
                              </span>
                            ) : (
                              <span className="text-muted-foreground">{t('معطل', 'Inactive', 'Inactif')}</span>
                            )}
                          </button>

                          <Button variant="ghost" size="icon" onClick={() => handleEditBannerClick(banner)} className="h-7 w-7 text-muted-foreground hover:text-primary">
                            <Edit className="size-3.5" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDeleteBanner(banner.id)} className="h-7 w-7 text-muted-foreground hover:text-destructive">
                            <Trash2 className="size-3.5" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* ==================================================== */}
      {/* TAB 3: BROADCAST HISTORY & AUDIT */}
      {/* ==================================================== */}
      {activeTab === 'history' && (
        <Card className="border shadow-sm">
          <CardHeader className="border-b bg-muted/20 pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold flex items-center gap-2 text-foreground">
                  <History className="size-4 text-primary" />
                  {t('سجل الإشعارات المرسلة من الإدارة (Broadcast History)', 'Admin Broadcast History & Audit', 'Historique des diffusions')}
                </CardTitle>
                <CardDescription className="text-xs mt-0.5">
                  {t(
                    'أرشيف كامل للإشعارات الجماعية المرسلة للمستخدمين مع أعداد المستلمين وخيار استخدام الإشعار كقالب جديد.',
                    'Full archive of broadcast notifications with recipient counts and template cloning.',
                    'Archive complète des notifications diffusées avec clonage de modèles.'
                  )}
                </CardDescription>
              </div>

              <Button variant="outline" size="sm" onClick={fetchHistory} className="h-8 text-xs gap-1.5 font-bold">
                <RefreshCw className={cn('size-3.5', isLoadingHistory && 'animate-spin')} />
                {t('تحديث السجل', 'Refresh History', 'Actualiser')}
              </Button>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            {isLoadingHistory ? (
              <div className="py-20 flex justify-center">
                <Loader2 className="size-8 animate-spin text-primary" />
              </div>
            ) : historyItems.length === 0 ? (
              <div className="py-20 text-center text-muted-foreground space-y-2">
                <div className="p-3 bg-muted rounded-full inline-block">
                  <History className="size-6 text-muted-foreground" />
                </div>
                <p className="text-sm font-semibold">{t('لا يوجد سجل إشعارات مرسلة حالياً', 'No broadcast history found', 'Aucun historique')}</p>
                <p className="text-xs">{t('الإشعارات التي ترسلها مستقبلاً ستظهر هنا مع إحصائيات المستلمين.', 'Broadcasts sent will be audited here.', 'Les notifications apparaîtront ici.')}</p>
              </div>
            ) : (
              <div className="divide-y">
                {historyItems.map((item) => (
                  <div key={item.batchId} className="p-5 hover:bg-muted/5 transition-colors flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="space-y-1.5 max-w-2xl">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant="secondary" className="text-[10px] font-bold">
                          {item.type.toUpperCase()}
                        </Badge>
                        <Badge variant="outline" className="text-[10px]">
                          {t('المستهدف:', 'Target:', 'Cible :')} {item.targetCriteria?.target || 'ALL'}
                        </Badge>
                        {item.targetCriteria?.targetStatus && item.targetCriteria.targetStatus !== 'all' && (
                          <Badge variant="outline" className="text-[10px] text-amber-600 border-amber-300">
                            {item.targetCriteria.targetStatus}
                          </Badge>
                        )}
                        <span className="text-[11px] text-muted-foreground">
                          {new Date(item.createdAt).toLocaleString(isAr ? 'ar-DZ' : 'en-GB')}
                        </span>
                      </div>

                      <h4 className="text-sm font-bold text-foreground">
                        {isAr ? item.title : (item.titleEn || item.title)}
                      </h4>
                      <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                        {isAr ? item.body : (item.bodyEn || item.body)}
                      </p>
                    </div>

                    <div className="flex items-center gap-4 shrink-0 justify-between md:justify-end border-t md:border-t-0 pt-3 md:pt-0">
                      <div className="text-end">
                        <div className="text-xs font-bold text-foreground flex items-center gap-1">
                          <Users className="size-3.5 text-primary" />
                          <span>{item.recipientCount} {t('مستلم', 'recipients', 'destinataires')}</span>
                        </div>
                        <div className="text-[10px] text-muted-foreground mt-0.5">
                          {t('بواسطة:', 'By:', 'Par :')} {item.senderAdminName}
                        </div>
                      </div>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCloneTemplate(item)}
                        className="h-8 text-xs font-bold gap-1.5 hover:border-primary hover:text-primary"
                        title={t('تحميل بيانات هذا الإشعار في نموذج الإرسال', 'Load into compose form', 'Charger dans le formulaire')}
                      >
                        <Copy className="size-3" />
                        <span>{t('استخدام كقالب', 'Clone Template', 'Cloner le modèle')}</span>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Confirmation Dialog for Wide / Large Broadcasts */}
      <Dialog open={isConfirmDialogOpen} onOpenChange={setIsConfirmDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-bold flex items-center gap-2 text-primary">
              <AlertTriangle className="size-5 text-amber-500" />
              {t('تأكيد بث الإشعار الجماعي', 'Confirm Notification Broadcast', 'Confirmer la diffusion')}
            </DialogTitle>
            <DialogDescription className="text-xs pt-2 leading-relaxed">
              {t(
                `أنت على وشك إرسال إشعار فوري إلى ما يقارب ${estimatedAudience ?? 0} مستخدم مطابق للفئة (${targetRole.toUpperCase()}) وحالة الحساب (${targetStatus.toUpperCase()}).`,
                `You are about to broadcast this notification to approximately ${estimatedAudience ?? 0} users with role (${targetRole.toUpperCase()}) and status (${targetStatus.toUpperCase()}).`,
                `Vous êtes sur le point de diffuser cette notification à environ ${estimatedAudience ?? 0} utilisateurs.`
              )}
            </DialogDescription>
          </DialogHeader>

          <div className="bg-muted/40 p-3 rounded-lg border text-xs space-y-1.5 my-2">
            <div className="font-bold text-foreground">{translations.ar?.title || translations.en?.title}</div>
            <div className="text-muted-foreground line-clamp-2">{translations.ar?.body || translations.en?.body}</div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsConfirmDialogOpen(false)}
              className="text-xs"
            >
              {t('إلغاء وتعديل', 'Cancel & Edit', 'Annuler')}
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={executeSendNotification}
              className="text-xs font-bold bg-[#1ABB9C] hover:bg-[#159a80] text-white"
            >
              {t('تأكيد الإرسال الفوري', 'Confirm & Send Now', 'Confirmer et envoyer')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
