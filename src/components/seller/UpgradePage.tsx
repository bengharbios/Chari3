'use client';

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useAuthStore, useAppStore } from '@/lib/store';
import { useTranslation } from '@/lib/i18n/useTranslation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  TrendingUp, 
  Store as StoreIcon, 
  Users, 
  Clock, 
  CheckCircle2, 
  ArrowLeft, 
  Building2, 
  ShieldCheck, 
  FileSpreadsheet, 
  Sparkles,
  ChevronRight,
  CreditCard,
  Upload,
  AlertTriangle,
  FileCheck
} from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

const t = (locale: string, ar: string, en: string) => (locale === 'ar' ? ar : en);

export default function UpgradePage() {
  const { user } = useAuthStore();
  const { locale } = useAppStore();
  const { t: translate } = useTranslation();
  const isAr = locale === 'ar';

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [merchantType, setMerchantType] = useState('individual');
  const [accountStatus, setAccountStatus] = useState('incomplete');
  const [upgradeRequest, setUpgradeRequest] = useState<any>(null);

  const [fee, setFee] = useState(500);
  const [isFreePromo, setIsFreePromo] = useState(true);

  // Form Fields
  const [businessRegisterNumber, setBusinessRegisterNumber] = useState('');
  const [businessRegisterFile, setBusinessRegisterFile] = useState('');
  const [businessNisNumber, setBusinessNisNumber] = useState('');
  const [businessIban, setBusinessIban] = useState('');
  const [businessBankName, setBusinessBankName] = useState('');
  const [businessBankLetterFile, setBusinessBankLetterFile] = useState('');
  const [businessManagerIdFront, setBusinessManagerIdFront] = useState('');
  const [businessManagerIdBack, setBusinessManagerIdBack] = useState('');

  // Payment Fields
  const [paymentReceiptFile, setPaymentReceiptFile] = useState('');
  const [paymentReceiptNote, setPaymentReceiptNote] = useState('');

  // Uploading state tracking
  const [uploadingField, setUploadingField] = useState<string | null>(null);

  const fetchStatus = useCallback(async () => {
    if (!user?.id) return;
    try {
      setIsLoading(true);
      // Fetch user onboarding status to verify they are verified (active)
      const statusRes = await fetch(`/api/onboarding/status?userId=${user.id}`);
      const statusData = await statusRes.json();
      if (statusData.success) {
        setAccountStatus(statusData.accountStatus || 'incomplete');
      }

      // Fetch settings to check current merchant type
      const settingsRes = await fetch(`/api/seller/settings?userId=${user.id}`);
      const settingsData = await settingsRes.json();
      if (settingsData.success && settingsData.settings) {
        setMerchantType(settingsData.settings.merchantType || 'individual');
      }

      // Fetch upgrade request details
      const dashRes = await fetch(`/api/seller/upgrade-request`);
      // Since it might return 404 if no request, handle status carefully
      if (dashRes.ok) {
        const dashData = await dashRes.json();
        if (dashData.success) {
          setUpgradeRequest(dashData.data || null);
        }
      } else {
        // Find if user has requests from dashboard fallback
        const dashboardRes = await fetch(`/api/seller/dashboard?userId=${user.id}`);
        const dashboardData = await dashboardRes.json();
        if (dashboardData.success) {
          setUpgradeRequest(dashboardData.upgradeRequest || null);
        }
      }

      // Fetch global platform settings for pricing
      const platRes = await fetch('/api/platform-settings');
      const platData = await platRes.json();
      if (platData.success && platData.data) {
        setFee(platData.data.price || 500);
        setIsFreePromo(platData.data.isFreePromo);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, fieldName: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error(t(locale, 'حجم الملف كبير جداً. الحد الأقصى 5 ميجابايت.', 'File is too large. Max size is 5MB.'));
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    setUploadingField(fieldName);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        toast.success(t(locale, 'تم رفع المستند بنجاح', 'Document uploaded successfully'));
        if (fieldName === 'businessRegisterFile') setBusinessRegisterFile(data.url);
        if (fieldName === 'businessBankLetterFile') setBusinessBankLetterFile(data.url);
        if (fieldName === 'businessManagerIdFront') setBusinessManagerIdFront(data.url);
        if (fieldName === 'businessManagerIdBack') setBusinessManagerIdBack(data.url);
        if (fieldName === 'paymentReceiptFile') setPaymentReceiptFile(data.url);
      } else {
        toast.error(data.error || t(locale, 'فشل رفع الملف', 'File upload failed'));
      }
    } catch (err) {
      toast.error(t(locale, 'خطأ في الاتصال بالخادم', 'Server connection error'));
    } finally {
      setUploadingField(null);
    }
  };

  const handleSubmitUpgrade = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!businessRegisterNumber || !businessRegisterFile || !businessManagerIdFront || !businessManagerIdBack) {
      toast.error(t(locale, 'يرجى رفع جميع المستندات المطلوبة أولاً.', 'Please upload all required documents first.'));
      return;
    }

    if (businessIban && !/^DZ\d{22}$/.test(businessIban.replace(/\s+/g, ''))) {
      toast.error(t(locale, 'صيغة رقم الـ IBAN غير صحيحة. يجب أن يبدأ بـ DZ ويحتوي على 24 رمزاً.', 'Invalid IBAN format. Must start with DZ and have 24 characters.'));
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/seller/upgrade-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessRegisterNumber,
          businessRegisterFile,
          businessNisNumber,
          businessIban,
          businessBankName,
          businessBankLetterFile,
          businessManagerIdFront,
          businessManagerIdBack
        })
      });
      const data = await res.json();
      if (data.success) {
        toast.success(t(locale, 'تم تقديم طلب الترقية بنجاح!', 'Upgrade request sent successfully!'));
        fetchStatus();
      } else {
        toast.error(data.error || t(locale, 'حدث خطأ أثناء إرسال الطلب', 'Error sending request'));
      }
    } catch (err) {
      toast.error(t(locale, 'خطأ في الاتصال بالخادم', 'Server connection error'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitReceipt = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentReceiptFile) {
      toast.error(t(locale, 'يرجى رفع وصل الدفع أولاً.', 'Please upload the payment receipt first.'));
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/seller/upgrade-request', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentReceiptFile,
          paymentReceiptNote
        })
      });
      const data = await res.json();
      if (data.success) {
        toast.success(t(locale, 'تم رفع وصل الدفع للمراجعة بنجاح!', 'Receipt submitted for verification!'));
        fetchStatus();
      } else {
        toast.error(data.error || t(locale, 'فشل إرسال وصل الدفع', 'Failed to submit receipt'));
      }
    } catch (err) {
      toast.error(t(locale, 'خطأ في الاتصال بالخادم', 'Server connection error'));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
        <Clock className="w-10 h-10 animate-spin text-brand" />
        <p className="text-sm text-muted-foreground">
          {t(locale, 'جاري تحميل تفاصيل الحساب...', 'Loading account details...')}
        </p>
      </div>
    );
  }

  // Guard: User is not active/fully verified yet
  if (accountStatus !== 'active' && merchantType !== 'business') {
    return (
      <div className="max-w-3xl mx-auto p-4 md:p-8">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-amber-500/5 border border-amber-500/20 rounded-2xl p-6 md:p-8 text-center space-y-4"
        >
          <div className="mx-auto w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 dark:bg-amber-950 dark:text-amber-400">
            <AlertTriangle className="w-10 h-10" />
          </div>
          <h1 className="text-2xl font-black text-foreground">
            {t(locale, 'يرجى إكمال توثيق حسابك الشخصي أولاً', 'Freelancer Verification Required First')}
          </h1>
          <p className="text-muted-foreground text-sm max-w-lg mx-auto leading-relaxed">
            {t(
              locale,
              'تتطلب ترقية الحساب إلى متجر أعمال أن يكون حسابك الفردي موثقاً بالكامل ونشطاً أولاً. يرجى التوجه لصفحة التوثيق وإرسال مستندات الهوية وبطاقة المقاول الذاتي للموافقة.',
              'Upgrading to a business store requires your individual seller account to be fully verified and active first. Please complete your identity and activity card verification.'
            )}
          </p>
          <div className="pt-4">
            <Button
              onClick={() => window.location.href = '/seller/verification'}
              className="bg-brand text-navy font-bold rounded-xl shadow-md py-6 hover:shadow-lg transition-all"
            >
              {t(locale, 'الذهاب لصفحة التوثيق الشخصي', 'Go to Identity Verification')}
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  // Already upgraded to Business Account
  if (merchantType === 'business') {
    return (
      <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 rounded-2xl p-6 md:p-8 text-center space-y-4"
        >
          <div className="mx-auto w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <h1 className="text-2xl font-black text-emerald-950 dark:text-emerald-300">
            {translate('upgrade.already_upgraded_title')}
          </h1>
          <p className="text-muted-foreground max-w-xl mx-auto text-sm leading-relaxed">
            {translate('upgrade.already_upgraded_desc')}
          </p>
          <div className="flex flex-wrap justify-center gap-3 pt-4">
            <Button 
              onClick={() => window.location.href = '/seller/branches'} 
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl"
            >
              <Building2 className="w-4 h-4 mr-2 ml-2" />
              {t(locale, 'إدارة الفروع', 'Manage Branches')}
            </Button>
            <Button 
              onClick={() => window.location.href = '/seller/staff'} 
              variant="outline" 
              className="border-emerald-200 hover:bg-emerald-50 dark:border-emerald-800 dark:hover:bg-emerald-950 rounded-xl"
            >
              <Users className="w-4 h-4 mr-2 ml-2" />
              {t(locale, 'طاقم العمل والشركاء', 'Manage Team')}
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  // Active request state views
  if (upgradeRequest) {
    const status = upgradeRequest.status;

    // Case 1: PENDING
    if (status === 'PENDING') {
      return (
        <div className="max-w-3xl mx-auto p-4 md:p-8 text-center space-y-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="border border-amber-500/20 bg-amber-500/5 rounded-2xl p-8 space-y-4"
          >
            <Clock className="w-16 h-16 text-amber-500 mx-auto animate-pulse" />
            <h1 className="text-2xl font-black">{t(locale, 'مستندات الترقية قيد المراجعة', 'Documents Pending Review')}</h1>
            <p className="text-muted-foreground text-sm max-w-lg mx-auto">
              {t(
                locale,
                'لقد استلمنا مستندات شركتك التجارية بنجاح. يقوم فريق الإدارة حالياً بمراجعة البيانات والتحقق من صحتها. سيصلك إشعار بالخطوة التالية فور انتهاء التدقيق.',
                'We have received your business registration documents. Our support team is auditing the details. You will be notified of the next steps shortly.'
              )}
            </p>
            <Button variant="outline" className="rounded-xl" onClick={() => window.location.href = '/seller/dashboard'}>
              {t(locale, 'العودة للوحة التحكم', 'Back to Dashboard')}
            </Button>
          </motion.div>
        </div>
      );
    }

    // Case 2: AWAITING_PAYMENT
    if (status === 'AWAITING_PAYMENT') {
      const isReceiptRejected = !!upgradeRequest.paymentRejectionReason;
      return (
        <div className="max-w-3xl mx-auto p-4 md:p-8 space-y-6">
          <h1 className="text-2xl font-black text-center">{t(locale, 'بانتظار دفع رسوم الترقية', 'Awaiting Upgrade Fee Payment')}</h1>
          
          {isReceiptRejected && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-700 dark:text-red-400 p-4 rounded-xl text-sm">
              <strong>{t(locale, 'تم رفض الوصل المرفوع سابقاً:', 'Previously uploaded receipt was rejected:')}</strong>
              <p className="mt-1">{upgradeRequest.paymentRejectionReason}</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            <Card className="md:col-span-3 rounded-2xl">
              <CardHeader>
                <CardTitle className="text-lg font-bold">{t(locale, 'إرفاق وصل السداد', 'Upload Payment Receipt')}</CardTitle>
                <CardDescription>{t(locale, 'يرجى رفع وصل الدفع الورقي للتحقق يدوياً.', 'Please upload the bank/CCP receipt image for manual check.')}</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmitReceipt} className="space-y-4">
                  <div className="space-y-2">
                    <Label>{t(locale, 'وصل التحويل البنكي أو البريدي (CCP)', 'Bank or CCP Receipt File')}</Label>
                    <div className="border-2 border-dashed border-muted rounded-xl p-6 text-center space-y-3">
                      {paymentReceiptFile ? (
                        <div className="space-y-2">
                          <FileCheck className="w-10 h-10 text-brand mx-auto" />
                          <p className="text-xs text-muted-foreground break-all">{paymentReceiptFile}</p>
                          <Button size="sm" variant="outline" type="button" onClick={() => setPaymentReceiptFile('')}>
                            {t(locale, 'إزالة وتغيير الوصل', 'Remove & change')}
                          </Button>
                        </div>
                      ) : (
                        <div>
                          <Upload className="w-10 h-10 text-muted-foreground mx-auto mb-2" />
                          <label className="cursor-pointer bg-brand/10 hover:bg-brand/20 text-brand text-xs font-bold px-4 py-2 rounded-xl transition-all inline-block">
                            {uploadingField === 'paymentReceiptFile' ? t(locale, 'جاري الرفع...', 'Uploading...') : t(locale, 'اختر ملف الوصل', 'Choose receipt file')}
                            <input
                              type="file"
                              accept="image/*,.pdf"
                              className="hidden"
                              disabled={uploadingField !== null}
                              onChange={(e) => handleFileUpload(e, 'paymentReceiptFile')}
                            />
                          </label>
                          <p className="text-[10px] text-muted-foreground mt-2">JPG, PNG or PDF, max 5MB</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>{t(locale, 'ملاحظة إضافية (اختياري)', 'Additional Note (Optional)')}</Label>
                    <Input
                      placeholder={t(locale, 'رقم المعاملة أو اسم المرسل...', 'Transaction ID or sender name...')}
                      value={paymentReceiptNote}
                      onChange={(e) => setPaymentReceiptNote(e.target.value)}
                    />
                  </div>

                  <Button type="submit" disabled={isSubmitting || !paymentReceiptFile} className="w-full bg-brand text-navy font-bold rounded-xl py-6">
                    {isSubmitting ? t(locale, 'جاري الإرسال...', 'Sending...') : t(locale, 'تقديم إثبات الدفع', 'Submit Proof of Payment')}
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card className="md:col-span-2 bg-brand/[0.02] border-brand/20 rounded-2xl">
              <CardHeader>
                <CardTitle className="text-sm font-bold text-brand">{t(locale, 'معلومات السداد', 'Billing Info')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-xs">
                <div>
                  <span className="text-muted-foreground block">{t(locale, 'القيمة المطلوبة:', 'Required Amount:')}</span>
                  <span className="text-xl font-black text-foreground">{upgradeRequest.feeSnapshot} دج</span>
                </div>
                <div>
                  <span className="text-muted-foreground block">{t(locale, 'رقم الفاتورة المرجعي:', 'Invoice ID Reference:')}</span>
                  <span className="font-mono text-foreground font-bold">{upgradeRequest.invoiceId}</span>
                </div>
                <div className="border-t pt-3 space-y-2">
                  <span className="font-bold text-foreground block">{t(locale, 'معلومات الحساب الجاري (CCP):', 'CCP Account Details:')}</span>
                  <p className="bg-card p-2 rounded border leading-relaxed font-mono">
                    CLE: 45
                    <br />
                    CCP: 0021487563
                    <br />
                    BENEFICIARY: ChariDay DZ
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      );
    }

    // Case 3: PAYMENT_SUBMITTED
    if (status === 'PAYMENT_SUBMITTED') {
      return (
        <div className="max-w-3xl mx-auto p-4 md:p-8 text-center space-y-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="border border-brand/20 bg-brand/[0.01] rounded-2xl p-8 space-y-4"
          >
            <Clock className="w-16 h-16 text-brand mx-auto animate-bounce" />
            <h1 className="text-2xl font-black">{t(locale, 'جاري التحقق من الدفع', 'Receipt Pending Verification')}</h1>
            <p className="text-muted-foreground text-sm max-w-lg mx-auto">
              {t(
                locale,
                'لقد استلمنا وصل سداد رسوم الترقية الخاص بك. يقوم فريق المحاسبة بمطابقة التحويل وتفعيل مميزات المتجر التجاري في أقرب وقت. شكراً لصبرك.',
                'We have received your proof of payment. Our financial team is matching the transaction. Your business store features will be enabled immediately upon confirmation.'
              )}
            </p>
            <Button variant="outline" className="rounded-xl" onClick={() => window.location.href = '/seller/dashboard'}>
              {t(locale, 'العودة للوحة التحكم', 'Back to Dashboard')}
            </Button>
          </motion.div>
        </div>
      );
    }
  }

  // DEFAULT VIEW: Show Document Upload Form (If no active request, or if REJECTED previously)
  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-6" dir={isAr ? 'rtl' : 'ltr'}>
      
      {/* Top Title Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b pb-6">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-foreground flex items-center gap-2">
            <TrendingUp className="text-brand w-7 h-7" />
            {t(locale, 'الترقية إلى متجر أعمال', 'Upgrade to Business Store')}
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            {t(
              locale,
              'انتقل بحسابك التجاري إلى مستوى متقدم وأدر شبكة فروعك وموظفيك من مكان واحد.',
              'Scale your sales operations, manage branch channels and your team from a centralized system.'
            )}
          </p>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => window.location.href = '/seller/dashboard'}
          className="rounded-xl"
        >
          {isAr ? <ChevronRight className="w-4 h-4 mr-1 ml-1" /> : <ArrowLeft className="w-4 h-4 mr-1 ml-1" />}
          {t(locale, 'لوحة التحكم', 'Dashboard')}
        </Button>
      </div>

      {upgradeRequest?.status === 'REJECTED' && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-700 dark:text-red-400 p-4 rounded-xl text-sm">
          <strong>{t(locale, 'تم رفض طلبك السابق للترقية:', 'Your previous upgrade request was rejected:')}</strong>
          <p className="mt-1">{upgradeRequest.rejectionReason}</p>
        </div>
      )}

      {/* Main Promo & Documents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Document Forms Column */}
        <div className="md:col-span-2">
          <Card className="rounded-2xl">
            <CardHeader>
              <CardTitle className="text-lg font-bold">{t(locale, 'المستندات القانونية للمتجر', 'Store Legal Documents')}</CardTitle>
              <CardDescription>{t(locale, 'يرجى تقديم مستندات الشركة القانونية لترقية هويتك.', 'Please provide active corporate files to upgrade your merchant status.')}</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmitUpgrade} className="space-y-6">
                
                {/* 1. Commercial Register */}
                <div className="space-y-4 border-b pb-6">
                  <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-brand/10 text-brand flex items-center justify-center text-xs">1</span>
                    {t(locale, 'السجل التجاري للشركة (RC)', 'Commercial Register (RC)')}
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="rc_num">{t(locale, 'رقم السجل التجاري', 'Register Number')}</Label>
                      <Input
                        id="rc_num"
                        placeholder="e.g. 26/00-104859B16"
                        value={businessRegisterNumber}
                        onChange={(e) => setBusinessRegisterNumber(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>{t(locale, 'تحميل صورة السجل التجاري', 'Upload RC Document')}</Label>
                      <div className="border border-dashed rounded-xl p-3 text-center">
                        {businessRegisterFile ? (
                          <div className="flex items-center justify-between text-xs text-brand">
                            <span className="truncate max-w-[150px]">{businessRegisterFile.split('/').pop()}</span>
                            <Button size="sm" variant="ghost" className="text-red-500" onClick={() => setBusinessRegisterFile('')}>
                              {t(locale, 'إلغاء', 'Cancel')}
                            </Button>
                          </div>
                        ) : (
                          <label className="cursor-pointer text-xs font-bold text-brand hover:underline block py-1">
                            {uploadingField === 'businessRegisterFile' ? t(locale, 'جاري الرفع...', 'Uploading...') : t(locale, 'رفع الملف', 'Upload File')}
                            <input
                              type="file"
                              accept="image/*,.pdf"
                              className="hidden"
                              disabled={uploadingField !== null}
                              onChange={(e) => handleFileUpload(e, 'businessRegisterFile')}
                            />
                          </label>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* 2. Tax Number (NIS) */}
                <div className="space-y-4 border-b pb-6">
                  <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-brand/10 text-brand flex items-center justify-center text-xs">2</span>
                    {t(locale, 'الرقم الإحصائي الضريبي (NIS) (اختياري)', 'Statistical Tax Number (NIS) (Optional)')}
                  </h3>
                  <div className="space-y-2">
                    <Label htmlFor="nis_num">{t(locale, 'رقم NIS للشركة', 'NIS Number')}</Label>
                    <Input
                      id="nis_num"
                      placeholder="e.g. 001916010048572"
                      value={businessNisNumber}
                      onChange={(e) => setBusinessNisNumber(e.target.value)}
                    />
                  </div>
                </div>

                {/* 3. Bank Account */}
                <div className="space-y-4 border-b pb-6">
                  <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-brand/10 text-brand flex items-center justify-center text-xs">3</span>
                    {t(locale, 'الحساب البنكي التجاري للشركة', 'Corporate Bank Details')}
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="bank_name">{t(locale, 'اسم البنك', 'Bank Name')}</Label>
                      <Input
                        id="bank_name"
                        placeholder="e.g. BDL, BADR, BEA..."
                        value={businessBankName}
                        onChange={(e) => setBusinessBankName(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="iban_num">{t(locale, 'رقم الـ IBAN التجاري', 'Corporate IBAN')}</Label>
                      <Input
                        id="iban_num"
                        placeholder="DZ91 0050 0123 4567 8901 2345"
                        value={businessIban}
                        onChange={(e) => setBusinessIban(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>{t(locale, 'كشف الهوية البنكية أو خطاب البنك للشركة (RIB/IBAN)', 'Corporate RIB/IBAN Document')}</Label>
                    <div className="border border-dashed rounded-xl p-3 text-center">
                      {businessBankLetterFile ? (
                        <div className="flex items-center justify-between text-xs text-brand">
                          <span className="truncate max-w-[200px]">{businessBankLetterFile.split('/').pop()}</span>
                          <Button size="sm" variant="ghost" className="text-red-500" onClick={() => setBusinessBankLetterFile('')}>
                            {t(locale, 'إلغاء', 'Cancel')}
                          </Button>
                        </div>
                      ) : (
                        <label className="cursor-pointer text-xs font-bold text-brand hover:underline block py-1">
                          {uploadingField === 'businessBankLetterFile' ? t(locale, 'جاري الرفع...', 'Uploading...') : t(locale, 'رفع الملف', 'Upload File')}
                          <input
                            type="file"
                            accept="image/*,.pdf"
                            className="hidden"
                            disabled={uploadingField !== null}
                            onChange={(e) => handleFileUpload(e, 'businessBankLetterFile')}
                          />
                        </label>
                      )}
                    </div>
                  </div>
                </div>

                {/* 4. Manager Identity */}
                <div className="space-y-4 pb-4">
                  <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-brand/10 text-brand flex items-center justify-center text-xs">4</span>
                    {t(locale, 'إثبات هوية المدير المفوض للشركة', 'Corporate Authorized Signatory Identity')}
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>{t(locale, 'بطاقة الهوية / جواز السفر (الوجه)', 'ID Front Side')}</Label>
                      <div className="border border-dashed rounded-xl p-4 text-center">
                        {businessManagerIdFront ? (
                          <div className="flex items-center justify-between text-xs text-brand">
                            <span className="truncate max-w-[120px]">{businessManagerIdFront.split('/').pop()}</span>
                            <Button size="sm" variant="ghost" className="text-red-500" onClick={() => setBusinessManagerIdFront('')}>
                              {t(locale, 'إلغاء', 'Cancel')}
                            </Button>
                          </div>
                        ) : (
                          <label className="cursor-pointer text-xs font-bold text-brand hover:underline block">
                            {uploadingField === 'businessManagerIdFront' ? t(locale, 'جاري الرفع...', 'Uploading...') : t(locale, 'رفع الوجه الأمامي', 'Upload Front')}
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              disabled={uploadingField !== null}
                              onChange={(e) => handleFileUpload(e, 'businessManagerIdFront')}
                            />
                          </label>
                        )}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>{t(locale, 'بطاقة الهوية / جواز السفر (الظهر)', 'ID Back Side')}</Label>
                      <div className="border border-dashed rounded-xl p-4 text-center">
                        {businessManagerIdBack ? (
                          <div className="flex items-center justify-between text-xs text-brand">
                            <span className="truncate max-w-[120px]">{businessManagerIdBack.split('/').pop()}</span>
                            <Button size="sm" variant="ghost" className="text-red-500" onClick={() => setBusinessManagerIdBack('')}>
                              {t(locale, 'إلغاء', 'Cancel')}
                            </Button>
                          </div>
                        ) : (
                          <label className="cursor-pointer text-xs font-bold text-brand hover:underline block">
                            {uploadingField === 'businessManagerIdBack' ? t(locale, 'جاري الرفع...', 'Uploading...') : t(locale, 'رفع الوجه الخلفي', 'Upload Back')}
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              disabled={uploadingField !== null}
                              onChange={(e) => handleFileUpload(e, 'businessManagerIdBack')}
                            />
                          </label>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <Button 
                  type="submit" 
                  disabled={isSubmitting || !businessRegisterNumber || !businessRegisterFile || !businessManagerIdFront || !businessManagerIdBack}
                  className="w-full bg-gradient-to-r from-brand to-brand/80 text-navy font-bold rounded-xl py-6 shadow-md hover:shadow-lg transition-all"
                >
                  {isSubmitting ? t(locale, 'جاري إرسال البيانات...', 'Submitting details...') : t(locale, 'تقديم طلب ترقية الحساب المكتمل', 'Submit Completed Upgrade Request')}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Info Column */}
        <div className="space-y-4">
          <Card className="border-brand/20 bg-brand/[0.01] rounded-2xl relative overflow-hidden">
            {isFreePromo && (
              <div className="absolute top-0 right-0 p-3 bg-brand/10 text-brand text-xs font-bold rounded-bl-xl">
                {t(locale, 'مجاني مؤقتاً', 'Free promotion')}
              </div>
            )}
            <CardContent className="pt-8 space-y-6">
              <div className="space-y-2">
                <Badge variant="outline" className="bg-brand/10 text-brand border-brand/20">
                  {t(locale, 'باقة الأعمال المتقدمة', 'Advanced Business Package')}
                </Badge>
                <div className="flex items-baseline gap-1 mt-2">
                  {isFreePromo ? (
                    <>
                      <span className="text-3xl font-black text-foreground">DZD 0</span>
                      {fee > 0 && <span className="text-sm line-through text-muted-foreground ml-2">DZD {fee}</span>}
                    </>
                  ) : (
                    <span className="text-3xl font-black text-foreground">DZD {fee}</span>
                  )}
                </div>
              </div>

              <div className="text-xs text-muted-foreground space-y-3">
                <div className="flex items-start gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>{t(locale, 'تفعيل الفروع والصلاحيات والموظفين لمتجرك.', 'Unlock branches, staff, and roles for your store.')}</span>
                </div>
                <div className="flex items-start gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>{t(locale, 'تحويل الحساب لمتجر أعمال رسمي ومعتمد.', 'Convert your freelancer identity to a certified business store.')}</span>
                </div>
                {!isFreePromo && fee > 0 && (
                  <div className="flex items-start gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span>{t(locale, 'يتم دفع رسوم الترقية مرة واحدة فقط عبر التحويل البنكي.', 'One-time upgrade fee payable via bank wire transfer.')}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
