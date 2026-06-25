'use client';

import React, { useEffect, useState } from 'react';
import { useTranslation } from '@/lib/i18n/useTranslation';
import {
  Bell, Plus, Trash2, Edit, Send, CheckCircle2, AlertTriangle,
  Info, Sparkles, Loader2, Megaphone, Target, Link as LinkIcon,
  ToggleLeft, ToggleRight, ShieldAlert, ArrowRight, Eye
} from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import Link from 'next/link';
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

export default function AdminNotificationsPage() {
  const { locale } = useTranslation();
  const isAr = locale === 'ar';
  const t = (ar: string, en: string) => isAr ? ar : en;

  // Tabs: 'banners' | 'bell'
  const [activeSubTab, setActiveSubTab] = useState<'banners' | 'bell'>('banners');

  // Banners state
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [isLoadingBanners, setIsLoadingBanners] = useState(true);
  const [isSubmittingBanner, setIsSubmittingBanner] = useState(false);

  // Banner form state
  const [bannerContentAr, setBannerContentAr] = useState('');
  const [bannerContentEn, setBannerContentEn] = useState('');
  const [bannerTargetRole, setBannerTargetRole] = useState('all');
  const [bannerBgColor, setBannerBgColor] = useState('bg-primary');
  const [bannerTextColor, setBannerTextColor] = useState('text-white');
  const [bannerLinkUrl, setBannerLinkUrl] = useState('');
  const [bannerIsActive, setBannerIsActive] = useState(true);
  const [editingBannerId, setEditingBannerId] = useState<string | null>(null);

  // Notification form state
  const [notifTitleAr, setNotifTitleAr] = useState('');
  const [notifTitleEn, setNotifTitleEn] = useState('');
  const [notifBodyAr, setNotifBodyAr] = useState('');
  const [notifBodyEn, setNotifBodyEn] = useState('');
  const [notifTarget, setNotifTarget] = useState('all');
  const [notifUserId, setNotifUserId] = useState('');
  const [notifType, setNotifType] = useState('system');
  const [notifActionPage, setNotifActionPage] = useState('seller-orders');
  const [notifActionUrl, setNotifActionUrl] = useState('');
  const [notifActionLabelAr, setNotifActionLabelAr] = useState('عرض التفاصيل');
  const [notifActionLabelEn, setNotifActionLabelEn] = useState('View Details');
  const [notifUrgency, setNotifUrgency] = useState('normal');
  const [isSendingNotif, setIsSendingNotif] = useState(false);

  // Fetch announcements on mount
  const fetchAnnouncements = async () => {
    setIsLoadingBanners(true);
    try {
      const res = await fetch('/api/admin/announcements?all=true');
      const data = await res.json();
      if (data.success) {
        setAnnouncements(data.data || []);
      } else {
        toast.error(t('فشل جلب أشرطة الإعلانات', 'Failed to fetch announcement banners'));
      }
    } catch (err) {
      console.error(err);
      toast.error(t('حدث خطأ في الاتصال بالخادم', 'Connection error'));
    } finally {
      setIsLoadingBanners(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  // Save Banner (Create/Edit)
  const handleSaveBanner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bannerContentAr.trim()) {
      toast.error(t('يرجى كتابة نص التنبيه بالعربية', 'Please fill the Arabic announcement content'));
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
        toast.success(editingBannerId ? t('تم تحديث شريط التنبيه بنجاح', 'Banner updated successfully') : t('تم إنشاء شريط التنبيه بنجاح', 'Banner created successfully'));
        resetBannerForm();
        fetchAnnouncements();
      } else {
        toast.error(data.error || t('فشل حفظ التنبيه', 'Failed to save banner'));
      }
    } catch (err) {
      console.error(err);
      toast.error(t('حدث خطأ في الاتصال بالخادم', 'Connection error'));
    } finally {
      setIsSubmittingBanner(false);
    }
  };

  // Delete Banner
  const handleDeleteBanner = async (id: string) => {
    if (!confirm(t('هل أنت متأكد من حذف هذا التنبيه نهائياً؟', 'Are you sure you want to delete this banner?'))) return;

    try {
      const res = await fetch(`/api/admin/announcements?id=${id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        toast.success(t('تم حذف التنبيه بنجاح', 'Banner deleted successfully'));
        if (editingBannerId === id) resetBannerForm();
        fetchAnnouncements();
      } else {
        toast.error(t('فشل حذف التنبيه', 'Failed to delete banner'));
      }
    } catch (err) {
      console.error(err);
      toast.error(t('حدث خطأ في الاتصال بالخادم', 'Connection error'));
    }
  };

  // Toggle Banner Status quickly
  const handleToggleBannerStatus = async (banner: Announcement) => {
    try {
      const res = await fetch('/api/admin/announcements', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: banner.id,
          isActive: !banner.isActive,
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(t('تم تعديل حالة النشاط بنجاح', 'Status updated successfully'));
        fetchAnnouncements();
      } else {
        toast.error(t('فشل تحديث الحالة', 'Failed to update status'));
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Edit Banner Trigger
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

  // Reset Banner Form
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

  // Send Custom Bell Notification
  const handleSendNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!notifTitleAr.trim() || !notifBodyAr.trim()) {
      toast.error(t('يرجى ملء الحقول الإجبارية للإشعار (العنوان والمحتوى بالعربية)', 'Please fill the required Arabic notification fields (Title & Body)'));
      return;
    }

    if (notifTarget === 'user' && !notifUserId.trim()) {
      toast.error(t('يرجى إدخال معرّف المستخدم المستهدف', 'Please enter the target User ID'));
      return;
    }

    setIsSendingNotif(true);
    try {
      const payload = {
        title: notifTitleAr,
        titleEn: notifTitleEn || notifTitleAr,
        body: notifBodyAr,
        bodyEn: notifBodyEn || notifBodyAr,
        target: notifTarget,
        userId: notifTarget === 'user' ? notifUserId.trim() : undefined,
        type: notifType,
        actionPage: notifActionPage === 'none' ? null : notifActionPage,
        actionUrl: notifActionUrl || null,
        actionLabelAr: notifActionLabelAr,
        actionLabelEn: notifActionLabelEn,
        urgency: notifUrgency,
      };

      const res = await fetch('/api/admin/notifications/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        toast.success(t(`تم إرسال الإشعارات بنجاح لـ ${data.count} مستخدم`, `Notification sent successfully to ${data.count} users`));
        resetNotifForm();
      } else {
        toast.error(data.error || t('فشل إرسال الإشعار', 'Failed to send notification'));
      }
    } catch (err) {
      console.error(err);
      toast.error(t('حدث خطأ في الاتصال بالخادم', 'Connection error'));
    } finally {
      setIsSendingNotif(false);
    }
  };

  // Reset Notification Form
  const resetNotifForm = () => {
    setNotifTitleAr('');
    setNotifTitleEn('');
    setNotifBodyAr('');
    setNotifBodyEn('');
    setNotifTarget('all');
    setNotifUserId('');
    setNotifType('system');
    setNotifActionPage('seller-orders');
    setNotifActionUrl('');
    setNotifActionLabelAr('عرض التفاصيل');
    setNotifActionLabelEn('View Details');
    setNotifUrgency('normal');
  };

  const bannerBgColors = [
    { key: 'bg-primary', label: t('الأزرق الرئيسي', 'Brand Blue') },
    { key: 'bg-amber-500', label: t('الأصفر التنبيهي', 'Warning Yellow') },
    { key: 'bg-emerald-600', label: t('الأخضر النجاحي', 'Success Green') },
    { key: 'bg-rose-600', label: t('الأحمر العاجل', 'Critical Red') },
    { key: 'bg-slate-800 dark:bg-slate-900', label: t('الداكن/الأسود', 'Dark Slate') },
  ];

  return (
    <div className="space-y-8 p-6 text-start max-w-7xl mx-auto" dir={isAr ? 'rtl' : 'ltr'}>
      {/* Top Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">
            <span>{t('لوحة الإدارة', 'SUPER ADMIN')}</span>
            <span>&bull;</span>
            <span>{t('الإشعارات والتنبيهات', 'NOTIFICATIONS')}</span>
          </div>
          <h1 className="text-3xl font-black tracking-tight">{t('مركز تنبيهات المنصة', 'Platform Notification Center')}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {t('أدوات الإدارة لإرسال إشعارات الجرس الموجهة، والتحكم في شريط الإعلانات العلوي للمنصة بأكملها.', 'Admin tools to dispatch targeted bell notifications and manage the global top announcement banners.')}
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Link href="/admin-secure-internal">
            <Button variant="outline" className="font-bold text-xs">
              <ArrowRight className="size-4 rotate-180 rtl:rotate-0 mr-1.5 rtl:ml-1.5" />
              {t('العودة للرئيسية', 'Back to Dashboard')}
            </Button>
          </Link>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border bg-muted/20 p-1 rounded-lg max-w-md">
        <button
          onClick={() => setActiveSubTab('banners')}
          className={cn(
            "flex-1 py-2 text-xs font-bold rounded-md transition-all text-center flex items-center justify-center gap-1.5",
            activeSubTab === 'banners'
              ? "bg-background text-foreground shadow-sm font-black"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <Megaphone className="size-4" />
          <span>{t('أشرطة التنبيه العلوية', 'Top Announcement Banners')}</span>
        </button>
        <button
          onClick={() => setActiveSubTab('bell')}
          className={cn(
            "flex-1 py-2 text-xs font-bold rounded-md transition-all text-center flex items-center justify-center gap-1.5",
            activeSubTab === 'bell'
              ? "bg-background text-foreground shadow-sm font-black"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <Bell className="size-4" />
          <span>{t('إرسال إشعار جرس', 'Send Bell Notification')}</span>
        </button>
      </div>

      {/* SUBTAB 1: Banners Management */}
      {activeSubTab === 'banners' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Creator Form */}
          <Card className="lg:col-span-1 border border-border/60 shadow-md">
            <CardHeader className="border-b bg-muted/20 pb-4">
              <CardTitle className="text-md font-black flex items-center gap-2 text-primary">
                <Sparkles className="size-4 text-primary" />
                {editingBannerId ? t('تعديل شريط التنبيه', 'Edit Announcement Banner') : t('إنشاء شريط تنبيه جديد', 'Create Announcement Banner')}
              </CardTitle>
              <CardDescription className="text-xs">
                {t('سيظهر هذا التنبيه في شريط علوي ضيق بمجرد تفعيله للفئات المحددة.', 'This alert will appear in a narrow top banner once activated for the selected roles.')}
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <form onSubmit={handleSaveBanner} className="space-y-5">
                {/* Content Arabic */}
                <div className="space-y-2">
                  <Label htmlFor="bannerContentAr" className="text-xs font-bold flex items-center justify-between">
                    <span>{t('محتوى التنبيه (بالعربية) *', 'Arabic Content *')}</span>
                    <span className="text-[10px] text-primary bg-primary/5 px-1.5 py-0.5 rounded">RTL</span>
                  </Label>
                  <Textarea
                    id="bannerContentAr"
                    rows={3}
                    placeholder={t('مثال: تخفيضات هائلة لعملاء عطلة نهاية الأسبوع تصل إلى 50%!', 'Example: Super weekend sale starting tonight up to 50% off!')}
                    value={bannerContentAr}
                    onChange={(e) => setBannerContentAr(e.target.value)}
                    dir="rtl"
                    className="text-xs font-semibold leading-relaxed border shadow-sm resize-none"
                    required
                  />
                </div>

                {/* Content English */}
                <div className="space-y-2">
                  <Label htmlFor="bannerContentEn" className="text-xs font-bold flex items-center justify-between">
                    <span>{t('محتوى التنبيه (بالإنجليزية)', 'English Content')}</span>
                    <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded">LTR</span>
                  </Label>
                  <Textarea
                    id="bannerContentEn"
                    rows={3}
                    placeholder={t('Example: Giant weekend discounts up to 50%!', 'Example: Giant weekend discounts up to 50%!')}
                    value={bannerContentEn}
                    onChange={(e) => setBannerContentEn(e.target.value)}
                    dir="ltr"
                    className="text-xs font-semibold leading-relaxed border shadow-sm resize-none"
                  />
                </div>

                {/* Target Role & Link Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs font-bold">{t('الفئة المستهدفة', 'Target Audience')}</Label>
                    <select
                      value={bannerTargetRole}
                      onChange={(e) => setBannerTargetRole(e.target.value)}
                      className="w-full bg-background border border-input rounded-md px-3 h-9 text-xs font-bold outline-none cursor-pointer shadow-sm"
                    >
                      <option value="all">{t('الجميع (عام)', 'Everyone (All)')}</option>
                      <option value="seller">{t('التجار النشطين فقط', 'Sellers Only')}</option>
                      <option value="store_manager">{t('مدراء المتاجر فقط', 'Store Managers Only')}</option>
                      <option value="buyer">{t('المشترين فقط', 'Buyers Only')}</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bannerLinkUrl" className="text-xs font-bold">{t('رابط التوجيه (اختياري)', 'Redirect Link (Optional)')}</Label>
                    <Input
                      id="bannerLinkUrl"
                      type="url"
                      placeholder="https://..."
                      value={bannerLinkUrl}
                      onChange={(e) => setBannerLinkUrl(e.target.value)}
                      className="text-xs border shadow-sm"
                    />
                  </div>
                </div>

                {/* Colors Select */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs font-bold">{t('لون شريط الخلفية', 'Background Color')}</Label>
                    <select
                      value={bannerBgColor}
                      onChange={(e) => setBannerBgColor(e.target.value)}
                      className="w-full bg-background border border-input rounded-md px-3 h-9 text-xs font-bold outline-none cursor-pointer shadow-sm"
                    >
                      {bannerBgColors.map((color) => (
                        <option key={color.key} value={color.key}>{color.label}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-bold">{t('لون النص', 'Text Color')}</Label>
                    <select
                      value={bannerTextColor}
                      onChange={(e) => setBannerTextColor(e.target.value)}
                      className="w-full bg-background border border-input rounded-md px-3 h-9 text-xs font-bold outline-none cursor-pointer shadow-sm"
                    >
                      <option value="text-white">{t('أبيض', 'White')}</option>
                      <option value="text-yellow-300">{t('أصفر تنبيهي', 'Warning Yellow')}</option>
                      <option value="text-black">{t('أسود داكن', 'Dark Black')}</option>
                    </select>
                  </div>
                </div>

                {/* Is Active Toggle */}
                <div className="flex items-center justify-between border-t pt-4">
                  <div className="space-y-0.5">
                    <Label className="text-xs font-bold">{t('حالة التفعيل الفوري', 'Instant Activation')}</Label>
                    <p className="text-[10px] text-muted-foreground">{t('تفعيل شريط التنبيه مباشرة للمستخدمين.', 'Activate this banner immediately for users.')}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setBannerIsActive(!bannerIsActive)}
                    className="text-primary hover:text-primary/80 transition-colors focus:outline-none"
                  >
                    {bannerIsActive ? <ToggleRight className="size-9 text-primary" /> : <ToggleLeft className="size-9 text-muted-foreground" />}
                  </button>
                </div>

                {/* Form Actions */}
                <div className="flex gap-2 border-t pt-4">
                  {editingBannerId && (
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={resetBannerForm}
                      className="text-xs font-bold flex-1"
                    >
                      {t('إلغاء', 'Cancel')}
                    </Button>
                  )}
                  <Button
                    type="submit"
                    disabled={isSubmittingBanner}
                    className="text-xs font-bold flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
                  >
                    {isSubmittingBanner ? (
                      <>
                        <Loader2 className="size-3.5 mr-1.5 animate-spin" />
                        {t('جاري الحفظ...', 'Saving...')}
                      </>
                    ) : (
                      editingBannerId ? t('تحديث التنبيه', 'Update Banner') : t('إنشاء وتفعيل التنبيه', 'Create Banner')
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Banner List */}
          <Card className="lg:col-span-2 border border-border/60 shadow-md">
            <CardHeader className="border-b bg-muted/20 pb-4">
              <CardTitle className="text-md font-black flex items-center gap-2 text-foreground">
                <Megaphone className="size-4 text-muted-foreground" />
                {t('أشرطة الإعلانات والتنبيهات المجدولة', 'Scheduled Announcement Banners')}
              </CardTitle>
              <CardDescription className="text-xs">
                {t('قائمة بجميع التنبيهات التي تم إنشاؤها للتحكم بها أو تفعيلها/تجميدها أو حذفها.', 'A list of all announcements created to manage, activate, freeze, or delete.')}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {isLoadingBanners ? (
                <div className="py-20 flex items-center justify-center">
                  <Loader2 className="size-8 animate-spin text-primary" />
                </div>
              ) : announcements.length === 0 ? (
                <div className="py-20 flex flex-col items-center justify-center text-muted-foreground">
                  <div className="p-3 bg-muted rounded-full mb-3">
                    <Megaphone className="size-6" />
                  </div>
                  <p className="text-sm font-semibold">{t('لا توجد أشرطة تنبيه حالياً', 'No announcement banners yet')}</p>
                  <p className="text-xs text-muted-foreground mt-1">{t('أنشئ أول شريط تنبيه عبر النموذج الجانبي.', 'Create your first banner using the side form.')}</p>
                </div>
              ) : (
                <div className="divide-y divide-border/60">
                  {announcements.map((banner) => (
                    <div key={banner.id} className="p-5 space-y-4 hover:bg-muted/5 transition-colors">
                      {/* Banner Preview Row */}
                      <div className="space-y-1.5">
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{t('معاينة الشريط المباشر:', 'Live Banner Preview:')}</span>
                        <div className={cn('px-4 py-2 rounded-md text-xs font-bold text-center flex items-center justify-center gap-2 shadow-sm border border-black/5', banner.bgColor, banner.textColor)}>
                          <span className="size-2 rounded-full bg-white animate-pulse" />
                          <span className="leading-normal">{isAr ? banner.contentAr : (banner.contentEn || banner.contentAr)}</span>
                          {banner.linkUrl && (
                            <span className="text-[10px] opacity-75 underline flex items-center gap-0.5 ml-1 rtl:mr-1">
                              <LinkIcon className="size-3" />
                              {t('زيارة الرابط', 'Visit Link')}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Metadata Row */}
                      <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground border-t pt-3">
                        <div className="flex items-center gap-4 flex-wrap">
                          <span className="flex items-center gap-1">
                            <Target className="size-3.5 text-muted-foreground" />
                            <strong>{t('المستهدف:', 'Target:')}</strong>
                            <Badge variant="secondary" className="text-[10px] font-semibold">
                              {banner.targetRole === 'all' && t('الجميع', 'Everyone')}
                              {banner.targetRole === 'seller' && t('التجار النشطين', 'Sellers Only')}
                              {banner.targetRole === 'store_manager' && t('مدراء المتاجر', 'Store Managers Only')}
                              {banner.targetRole === 'buyer' && t('المشترين', 'Buyers Only')}
                            </Badge>
                          </span>
                          <span>
                            <strong>{t('تاريخ الإنشاء:', 'Created:')}</strong> {new Date(banner.createdAt).toLocaleDateString(isAr ? 'ar-DZ' : 'en-GB')}
                          </span>
                        </div>

                        {/* Controls */}
                        <div className="flex items-center gap-2">
                          {/* Toggle Switch */}
                          <button
                            onClick={() => handleToggleBannerStatus(banner)}
                            className="flex items-center gap-1 text-xs font-bold hover:text-foreground transition-colors"
                            title={banner.isActive ? t('تعطيل التنبيه', 'Deactivate Alert') : t('تفعيل التنبيه', 'Activate Alert')}
                          >
                            {banner.isActive ? (
                              <>
                                <CheckCircle2 className="size-4 text-emerald-500" />
                                <span className="text-emerald-600 dark:text-emerald-500">{t('نشط', 'Active')}</span>
                              </>
                            ) : (
                              <>
                                <EyeOff className="size-4 text-muted-foreground" />
                                <span>{t('معطل', 'Inactive')}</span>
                              </>
                            )}
                          </button>

                          <div className="h-4 w-[1px] bg-border/80 mx-1" />

                          {/* Edit Button */}
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEditBannerClick(banner)}
                            className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10"
                            title={t('تعديل', 'Edit')}
                          >
                            <Edit className="size-4" />
                          </Button>

                          {/* Delete Button */}
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteBanner(banner.id)}
                            className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                            title={t('حذف', 'Delete')}
                          >
                            <Trash2 className="size-4" />
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

      {/* SUBTAB 2: Bell Notification Dispatcher */}
      {activeSubTab === 'bell' && (
        <Card className="border border-border/60 shadow-md max-w-3xl mx-auto">
          <CardHeader className="border-b bg-muted/20 pb-4">
            <CardTitle className="text-md font-black flex items-center gap-2 text-primary">
              <Send className="size-4 text-primary" />
              {t('إرسال إشعار جرس مخصص لمستخدمي المنصة', 'Send Custom Targeted Bell Notification')}
            </CardTitle>
            <CardDescription className="text-xs">
              {t('يمكنك إرسال إشعار يظهر فوراً في لوحة الجرس لجميع المشترين، أو التجار النشطين، أو تاجر محدد، مع إمكانية توجيههم لصفحة مخصصة عند النقر.', 'You can send a notification that appears instantly in the bell panel of all buyers, active sellers, or a specific user, with custom redirect controls on click.')}
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handleSendNotification} className="space-y-6">
              {/* Target Selector */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-b pb-4">
                <div className="space-y-2">
                  <Label className="text-xs font-bold flex items-center gap-1">
                    <Target className="size-3.5 text-primary" />
                    {t('المستهدفون بالإشعار *', 'Target Audience *')}
                  </Label>
                  <select
                    value={notifTarget}
                    onChange={(e) => setNotifTarget(e.target.value)}
                    className="w-full bg-background border border-input rounded-md px-3 h-9 text-xs font-bold outline-none cursor-pointer shadow-sm"
                  >
                    <option value="all">{t('جميع مستخدمي المنصة (الكل)', 'All Platform Users (Everyone)')}</option>
                    <option value="sellers">{t('التجار النشطين فقط', 'Sellers Only')}</option>
                    <option value="store_managers">{t('مدراء المتاجر فقط', 'Store Managers Only')}</option>
                    <option value="buyers">{t('المشترين فقط', 'Buyers Only')}</option>
                    <option value="user">{t('مستخدم محدد (عبر معرّف ID)', 'Specific User (via User ID)')}</option>
                  </select>
                </div>

                {notifTarget === 'user' && (
                  <div className="space-y-2 animate-fade-in">
                    <Label htmlFor="notifUserId" className="text-xs font-bold text-destructive">
                      {t('معرّف المستخدم (User ID) *', 'Target User ID *')}
                    </Label>
                    <Input
                      id="notifUserId"
                      type="text"
                      placeholder={t('أدخل معرّف المستخدم، مثلاً: cl7x1...', 'Enter User ID, e.g. cl7x1...')}
                      value={notifUserId}
                      onChange={(e) => setNotifUserId(e.target.value)}
                      className="text-xs border shadow-sm border-destructive/40 focus-visible:ring-destructive"
                      required
                    />
                  </div>
                )}
              </div>

              {/* Title Fields Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="notifTitleAr" className="text-xs font-bold flex items-center justify-between">
                    <span>{t('عنوان الإشعار (بالعربية) *', 'Notification Title (Arabic) *')}</span>
                    <span className="text-[10px] text-primary bg-primary/5 px-1.5 py-0.5 rounded">RTL</span>
                  </Label>
                  <Input
                    id="notifTitleAr"
                    type="text"
                    placeholder={t('مثال: تمت إضافة رصيد إضافي لمحفظتك! 💰', 'Example: Extra funds added to your wallet! 💰')}
                    value={notifTitleAr}
                    onChange={(e) => setNotifTitleAr(e.target.value)}
                    dir="rtl"
                    className="text-xs font-bold border shadow-sm"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notifTitleEn" className="text-xs font-bold flex items-center justify-between">
                    <span>{t('عنوان الإشعار (بالإنجليزية)', 'Notification Title (English)')}</span>
                    <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded">LTR</span>
                  </Label>
                  <Input
                    id="notifTitleEn"
                    type="text"
                    placeholder={t('Example: Bonus added to your wallet! 💰', 'Example: Bonus added to your wallet! 💰')}
                    value={notifTitleEn}
                    onChange={(e) => setNotifTitleEn(e.target.value)}
                    dir="ltr"
                    className="text-xs font-bold border shadow-sm"
                  />
                </div>
              </div>

              {/* Body Fields Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="notifBodyAr" className="text-xs font-bold flex items-center justify-between">
                    <span>{t('محتوى الإشعار (بالعربية) *', 'Notification Body (Arabic) *')}</span>
                    <span className="text-[10px] text-primary bg-primary/5 px-1.5 py-0.5 rounded">RTL</span>
                  </Label>
                  <Textarea
                    id="notifBodyAr"
                    rows={4}
                    placeholder={t('أدخل تفاصيل التنبيه التي تظهر عند فتح الإشعار بالكامل...', 'Enter the notification details that appear when opened...')}
                    value={notifBodyAr}
                    onChange={(e) => setNotifBodyAr(e.target.value)}
                    dir="rtl"
                    className="text-xs font-semibold leading-relaxed border shadow-sm resize-none"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notifBodyEn" className="text-xs font-bold flex items-center justify-between">
                    <span>{t('محتوى الإشعار (بالإنجليزية)', 'Notification Body (English)')}</span>
                    <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded">LTR</span>
                  </Label>
                  <Textarea
                    id="notifBodyEn"
                    rows={4}
                    placeholder={t('Enter details in English...', 'Enter details in English...')}
                    value={notifBodyEn}
                    onChange={(e) => setNotifBodyEn(e.target.value)}
                    dir="ltr"
                    className="text-xs font-semibold leading-relaxed border shadow-sm resize-none"
                  />
                </div>
              </div>

              {/* Notification Configuration Category & Urgency */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-t pt-4">
                <div className="space-y-2">
                  <Label className="text-xs font-bold">{t('نوع التنبيه (الأيقونة)', 'Category (Icon)')}</Label>
                  <select
                    value={notifType}
                    onChange={(e) => setNotifType(e.target.value)}
                    className="w-full bg-background border border-input rounded-md px-3 h-9 text-xs font-bold outline-none cursor-pointer shadow-sm"
                  >
                    <option value="system">💡 {t('النظام (إشعار عام)', 'System (General Info)')}</option>
                    <option value="wallet">💜 {t('المحفظة والمالية', 'Wallet & Payouts')}</option>
                    <option value="order">📦 {t('المبيعات والطلبات', 'Orders & Sales')}</option>
                    <option value="verification">🛡️ {t('التوثيق والأمن', 'Verification & Security')}</option>
                    <option value="promotion">🏷️ {t('الخصومات والعروض', 'Promotions & Coupons')}</option>
                    <option value="alert">⚠️ {t('تحذير أو تنبيه خطر', 'Urgent Alert/Warning')}</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-bold">{t('درجة الاستعجال', 'Urgency Level')}</Label>
                  <select
                    value={notifUrgency}
                    onChange={(e) => setNotifUrgency(e.target.value)}
                    className="w-full bg-background border border-input rounded-md px-3 h-9 text-xs font-bold outline-none cursor-pointer shadow-sm"
                  >
                    <option value="normal">{t('عادي', 'Normal')}</option>
                    <option value="high">{t('هام', 'High')}</option>
                    <option value="urgent">{t('عاجل (برواز ملون)', 'Urgent (Border Highlight)')}</option>
                    <option value="low">{t('منخفض', 'Low')}</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-bold flex items-center gap-1">
                    <LinkIcon className="size-3.5 text-primary" />
                    {t('صفحة التوجيه بالمنصة', 'Redirection Page')}
                  </Label>
                  <select
                    value={notifActionPage}
                    onChange={(e) => setNotifActionPage(e.target.value)}
                    className="w-full bg-background border border-input rounded-md px-3 h-9 text-xs font-bold outline-none cursor-pointer shadow-sm"
                  >
                    <option value="none">{t('لا يوجد توجيه (للإغلاق فقط)', 'No Redirect (Close panel only)')}</option>
                    <option value="seller-orders">{t('طلبات التاجر', 'Seller Orders')}</option>
                    <option value="store-orders">{t('طلبات المتجر (مدير)', 'Store Orders (Manager)')}</option>
                    <option value="wallet">{t('المحفظة والرصيد', 'Wallet & Payouts')}</option>
                    <option value="profile">{t('الملف الشخصي للتاجر', 'Store Settings')}</option>
                    <option value="settings">{t('إعدادات المنصة العامة', 'System Settings')}</option>
                  </select>
                </div>
              </div>

              {/* Action Buttons Custom Labels */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pb-4">
                <div className="space-y-2 sm:col-span-1">
                  <Label htmlFor="notifActionUrl" className="text-xs font-bold flex items-center gap-1 text-muted-foreground">
                    <span>{t('أو توجيه لرابط خارجي', 'Or redirect to External URL')}</span>
                  </Label>
                  <Input
                    id="notifActionUrl"
                    type="url"
                    placeholder="https://..."
                    value={notifActionUrl}
                    onChange={(e) => setNotifActionUrl(e.target.value)}
                    className="text-xs border shadow-sm"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notifActionLabelAr" className="text-xs font-bold">{t('نص الزر (بالعربية)', 'Button Text (Arabic)')}</Label>
                  <Input
                    id="notifActionLabelAr"
                    type="text"
                    placeholder={t('عرض التفاصيل', 'View Details')}
                    value={notifActionLabelAr}
                    onChange={(e) => setNotifActionLabelAr(e.target.value)}
                    className="text-xs border shadow-sm"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notifActionLabelEn" className="text-xs font-bold">{t('نص الزر (بالإنجليزية)', 'Button Text (English)')}</Label>
                  <Input
                    id="notifActionLabelEn"
                    type="text"
                    placeholder="View Details"
                    value={notifActionLabelEn}
                    onChange={(e) => setNotifActionLabelEn(e.target.value)}
                    className="text-xs border shadow-sm"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <div className="border-t pt-5 flex justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={resetNotifForm}
                  className="text-xs font-bold"
                  disabled={isSendingNotif}
                >
                  {t('تفريغ الحقول', 'Clear Form')}
                </Button>
                <Button
                  type="submit"
                  disabled={isSendingNotif}
                  className="text-xs font-bold bg-[#1ABB9C] hover:bg-[#159a80] text-white flex items-center gap-1.5 shadow-sm"
                >
                  {isSendingNotif ? (
                    <>
                      <Loader2 className="size-3.5 animate-spin mr-1" />
                      {t('جاري الإرسال...', 'Sending...')}
                    </>
                  ) : (
                    <>
                      <Send className="size-3.5" />
                      {t('إرسال الإشعار الآن', 'Send Notification Now')}
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
