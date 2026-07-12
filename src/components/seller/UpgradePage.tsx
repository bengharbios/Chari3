'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useAuthStore, useAppStore } from '@/lib/store';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
  CreditCard
} from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

const t = (locale: string, ar: string, en: string) => (locale === 'ar' ? ar : en);

export default function UpgradePage() {
  const { user } = useAuthStore();
  const { locale } = useAppStore();
  const isAr = locale === 'ar';
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [merchantType, setMerchantType] = useState('individual');
  const [wantsUpgrade, setWantsUpgrade] = useState(false);
  const [upgradeRequest, setUpgradeRequest] = useState<any>(null);

  const [fee, setFee] = useState(0);
  const [isFreePromo, setIsFreePromo] = useState(true);

  const fetchStatus = useCallback(async () => {
    if (!user?.id) return;
    try {
      setIsLoading(true);
      // Fetch settings to check current merchant type
      const settingsRes = await fetch(`/api/seller/settings?userId=${user.id}`);
      const settingsData = await settingsRes.json();
      
      if (settingsData.success && settingsData.settings) {
        setMerchantType(settingsData.settings.merchantType || 'individual');
      }

      // Fetch dashboard to check WantsUpgrade status
      const dashRes = await fetch(`/api/seller/dashboard?userId=${user.id}`);
      const dashData = await dashRes.json();
      
      if (dashData.success) {
        setWantsUpgrade(!!dashData.seller?.wantsUpgrade);
        setUpgradeRequest(dashData.upgradeRequest || null);
      }

      // Fetch global platform settings for pricing
      const platRes = await fetch('/api/platform-settings');
      const platData = await platRes.json();
      
      if (platData.success && platData.data) {
        setFee(platData.data.price || 0);
        setIsFreePromo(platData.data.isFreePromo);
      }
    } catch (err) {
      toast.error(t(locale, 'فشل جلب تفاصيل الحساب', 'Failed to fetch account details'));
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, locale]);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  const handleRequestUpgrade = async () => {
    setIsSubmitting(true);
    try {
      // Create request and optionally an invoice
      const res = await fetch('/api/upgrade-requests', {
        method: 'POST',
      });
      const data = await res.json();
      
      if (data.success) {
        toast.success(t(locale, 'تم إرسال طلب الترقية بنجاح!', 'Upgrade request sent successfully!'));
        // Refresh the page to show the pending state correctly
        window.location.href = '/seller/upgrade';
      } else {
        let errMsg = data.error;
        if (data.error === 'Request already exists') {
          errMsg = t(locale, 'طلب الترقية موجود بالفعل وهو قيد المراجعة أو معلق.', 'An upgrade request already exists and is pending.');
        }
        toast.error(errMsg || t(locale, 'حدث خطأ أثناء إرسال الطلب', 'Error sending request'));
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
            {t(locale, 'تهانينا! حسابك نشط كمتجر أعمال', 'Congratulations! Active Business Store Account')}
          </h1>
          <p className="text-muted-foreground max-w-xl mx-auto text-sm leading-relaxed">
            {t(
              locale,
              'لقد تمت ترقية حسابك إلى فئة الأعمال. يمكنك الآن الوصول إلى جميع الميزات المتقدمة كإضافة فروع جديدة للمتجر، تعيين الموظفين وتوزيع الأدوار، ومراجعة التقارير الضريبية.',
              'Your account has been upgraded to Business status. You now have full access to advanced features such as adding store branches, assigning team staff roles, and generating business tax reports.'
            )}
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

  // Request already submitted and pending approval
  if (upgradeRequest) {
    const isAwaitingPayment = upgradeRequest?.status === 'AWAITING_PAYMENT';
    const reqFee = upgradeRequest?.feeSnapshot ?? fee;
    const reqInvoiceId = upgradeRequest?.invoiceId;

    return (
      <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className={`border rounded-2xl p-6 md:p-8 text-center space-y-4 ${
            isAwaitingPayment 
              ? 'bg-blue-500/5 border-blue-500/20' 
              : 'bg-amber-500/5 border-amber-500/20'
          }`}
        >
          <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center animate-pulse ${
            isAwaitingPayment 
              ? 'bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-400' 
              : 'bg-amber-100 text-amber-600 dark:bg-amber-950 dark:text-amber-400'
          }`}>
            <Clock className="w-10 h-10" />
          </div>
          <h1 className="text-2xl font-black text-foreground">
            {isAwaitingPayment 
              ? t(locale, 'بانتظار دفع رسوم الترقية', 'Awaiting Payment for Upgrade')
              : t(locale, 'طلب الترقية لمتجر قيد المراجعة', 'Store Upgrade Pending Review')
            }
          </h1>
          <p className="text-muted-foreground max-w-xl mx-auto text-sm leading-relaxed">
            {isAwaitingPayment
              ? t(
                  locale,
                  `تمت الموافقة المبدئية على طلب الترقية الخاص بك وبانتظار سداد الفاتورة بقيمة ${reqFee} د.ج. يرجى إتمام الدفع وإرفاق وصل التحويل لتفعيل حسابك فوراً.`,
                  `Your upgrade request has been approved. Please pay the invoice of ${reqFee} DZD and attach the receipt to activate immediately.`
                )
              : t(
                  locale,
                  'لقد تم استلام طلبك للترقية بنجاح وهو قيد المراجعة والتدقيق حالياً من قبل الإدارة. سيتم إخطارك فور تفعيل الميزات الإضافية لحسابك خلال ساعات العمل.',
                  'Your request to upgrade is successfully received and is currently being evaluated by our team. You will be notified once the business store capabilities are activated.'
                )
            }
          </p>
          <div className="flex flex-wrap justify-center gap-3 pt-4">
            {isAwaitingPayment && (
              <Button 
                onClick={() => {
                  window.location.href = `/seller/billing/pay?invoiceId=${reqInvoiceId || ''}&amount=${reqFee}`;
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl"
              >
                <CreditCard className="w-4 h-4 mr-2 ml-2" />
                {t(locale, 'الذهاب لتسديد الفاتورة', 'Go to Invoices & Payment')}
              </Button>
            )}
            <Button 
              variant="outline" 
              onClick={() => window.location.href = '/seller/dashboard'}
              className={`rounded-xl ${
                isAwaitingPayment
                  ? 'border-blue-200 hover:bg-blue-50 dark:border-blue-900 dark:hover:bg-blue-950'
                  : 'border-amber-200 hover:bg-amber-50 dark:border-amber-900 dark:hover:bg-amber-950'
              }`}
            >
              <ArrowLeft className="w-4 h-4 mr-2 ml-2" />
              {t(locale, 'العودة للوحة التحكم', 'Back to Dashboard')}
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-8">
      {/* Header Info */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b pb-6">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-foreground flex items-center gap-2">
            <TrendingUp className="text-brand w-7 h-7" />
            {t(locale, 'ترقية الحساب إلى متجر أعمال', 'Upgrade Account to Business Store')}
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

      {/* Main Promo Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Features Column */}
        <div className="md:col-span-2 space-y-4">
          <h2 className="text-lg font-bold text-foreground mb-4">
            {t(locale, 'ما الذي ستحصل عليه عند الترقية؟', 'What features will you unlock?')}
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Feature 1 */}
            <Card className="group relative border border-border/40 bg-card/30 backdrop-blur-md hover:bg-card/60 hover:shadow-lg hover:shadow-brand/5 hover:-translate-y-1 transition-all duration-300 rounded-2xl overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-brand/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <CardContent className="p-5 space-y-3 relative z-10">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand/10 to-brand/5 text-brand flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-sm border border-brand/10">
                  <Building2 className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-sm text-foreground">{t(locale, 'إدارة الفروع المتعددة', 'Manage Multiple Branches')}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {t(
                    locale,
                    'إمكانية إنشاء متاجر فرعية لنفس التاجر مع عزل تام للمنتجات، المبيعات، والمخزون.',
                    'Create multiple sub-store outlets under your main account with completely isolated orders and stock.'
                  )}
                </p>
              </CardContent>
            </Card>

            {/* Feature 2 */}
            <Card className="group relative border border-border/40 bg-card/30 backdrop-blur-md hover:bg-card/60 hover:shadow-lg hover:shadow-blue-500/5 hover:-translate-y-1 transition-all duration-300 rounded-2xl overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <CardContent className="p-5 space-y-3 relative z-10">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500/10 to-blue-500/5 text-blue-600 dark:text-blue-400 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-sm border border-blue-500/10">
                  <Users className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-sm text-foreground">{t(locale, 'إدارة طاقم العمل والصلاحيات', 'Team & Role Management')}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {t(
                    locale,
                    'دعوة الموظفين وتعيين صلاحياتهم كمدراء فروع، محررين، دعم فني أو محاسبين.',
                    'Invite employees and assign specific roles such as Branch Manager, Editor, or Support Agent.'
                  )}
                </p>
              </CardContent>
            </Card>

            {/* Feature 3 */}
            <Card className="group relative border border-border/40 bg-card/30 backdrop-blur-md hover:bg-card/60 hover:shadow-lg hover:shadow-purple-500/5 hover:-translate-y-1 transition-all duration-300 rounded-2xl overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <CardContent className="p-5 space-y-3 relative z-10">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500/10 to-purple-500/5 text-purple-600 dark:text-purple-400 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-sm border border-purple-500/10">
                  <FileSpreadsheet className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-sm text-foreground">{t(locale, 'تقارير ضريبية وحلول B2B', 'Tax Reports & B2B Solutions')}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {t(
                    locale,
                    'توليد فواتير مطابقة للمعايير الضريبية ودعم متقدم لعمليات البيع للشركات B2B.',
                    'Generate tax-compliant invoices and utilize advanced B2B merchant configurations.'
                  )}
                </p>
              </CardContent>
            </Card>

            {/* Feature 4 */}
            <Card className="group relative border border-border/40 bg-card/30 backdrop-blur-md hover:bg-card/60 hover:shadow-lg hover:shadow-amber-500/5 hover:-translate-y-1 transition-all duration-300 rounded-2xl overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <CardContent className="p-5 space-y-3 relative z-10">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500/10 to-amber-500/5 text-amber-600 dark:text-amber-400 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-sm border border-amber-500/10">
                  <Sparkles className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-sm text-foreground">{t(locale, 'أولوية قصوى في الدعم الفني', 'VIP Priority Support')}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {t(
                    locale,
                    'دعم فني مباشر ومخصص لحل المشكلات وتقديم استشارات تقنية لنمو تجارتك.',
                    'Priority customer care and customized consulting to ensure your multi-store operational success.'
                  )}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* CTA Card */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-foreground mb-4">
            {t(locale, 'طلب التفعيل', 'Request Activation')}
          </h2>

          <Card className="border-brand/30 bg-brand/[0.02] shadow-sm rounded-2xl relative overflow-hidden">
            {isFreePromo && (
              <div className="absolute top-0 right-0 p-3 bg-brand/10 text-brand text-xs font-bold rounded-bl-xl">
                {t(locale, 'مجاني مؤقتاً', 'Free promotion')}
              </div>
            )}

            <CardContent className="pt-8 space-y-6">
              <div className="space-y-2">
                <Badge variant="outline" className="bg-brand/10 text-brand border-brand/20">
                  {t(locale, 'حساب تاجر حالي: فردي', 'Current Type: Individual')}
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
                  <span className="text-xs text-muted-foreground">/ {t(locale, 'طلب الترقية', 'per upgrade request')}</span>
                </div>
              </div>

              <div className="text-xs text-muted-foreground space-y-3">
                <div className="flex items-start gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>{t(locale, 'مراجعة أمنية سريعة لبيانات التاجر', 'Quick security check of seller data')}</span>
                </div>
                <div className="flex items-start gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>{t(locale, 'لا تؤثر على فواتيرك وباقاتك الحالية', 'Does not affect your current invoices or plans')}</span>
                </div>
                {!isFreePromo && fee > 0 && (
                  <div className="flex items-start gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span>
                      {t(
                        locale, 
                        'طريقة الدفع: سيتم إنشاء فاتورة في قسم الفواتير، تقوم بتسديدها بنفس طريقة اشتراكات الباقات (تحويل بنكي وإرفاق الوصل).', 
                        'Payment Method: An invoice will be created in your billing section. Pay it using the same method as subscription plans (bank transfer and receipt upload).'
                      )}
                    </span>
                  </div>
                )}
              </div>

              <Button
                onClick={handleRequestUpgrade}
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-brand to-brand/80 text-navy font-bold rounded-xl shadow-md py-6 hover:shadow-lg transition-all"
              >
                {isSubmitting ? (
                  <>
                    <Clock className="w-4 h-4 mr-2 ml-2 animate-spin" />
                    {t(locale, 'جاري إرسال الطلب...', 'Sending Request...')}
                  </>
                ) : (
                  <>
                    <StoreIcon className="w-5 h-5 mr-2 ml-2" />
                    {t(locale, 'تقديم طلب ترقية الحساب', 'Submit Upgrade Request')}
                  </>
                )}
              </Button>

              <p className="text-[10px] text-center text-muted-foreground">
                {t(
                  locale,
                  'بتقديمك لهذا الطلب، فإنك توافق على مراجعة فريق الإدارة لمعلومات متجرك.',
                  'By submitting this request, you agree to the admin review process of your store profile.'
                )}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
