'use client';
import React, { useMemo, useState, useEffect } from 'react';
import { Clock, CheckCircle, XCircle, AlertTriangle, ShieldCheck, Lock, FileText, Phone, Mail, ArrowLeft, ArrowRight, Edit2, ExternalLink, Building2, UserCircle } from 'lucide-react';
import { useAppStore, useAuthStore } from '@/lib/store';
import { useOnboardingStore, getVerificationItemsForRole, restoreDraftFields, calcResumeStep } from '@/lib/store/onboarding';
import type { VerificationStatus } from '@/lib/store/onboarding';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';


function t(isAr: boolean, ar: string, en: string) {
  return isAr ? ar : en;
}

const statusConfig: Record<
  VerificationStatus,
  { icon: React.ElementType; color: string; bg: string; labelAr: string; labelEn: string }
> = {
  verified: { icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-100 dark:bg-green-900/20', labelAr: 'موثق', labelEn: 'Verified' },
  pending: { icon: Clock, color: 'text-yellow-600', bg: 'bg-yellow-100 dark:bg-yellow-900/20', labelAr: 'قيد المراجعة', labelEn: 'Pending Review' },
  rejected: { icon: XCircle, color: 'text-red-600', bg: 'bg-red-100 dark:bg-red-900/20', labelAr: 'مرفوض', labelEn: 'Rejected' },
  required: { icon: AlertTriangle, color: 'text-orange-600', bg: 'bg-orange-100 dark:bg-orange-900/20', labelAr: 'مطلوب', labelEn: 'Required' },
};

export default function VerificationStatusPage() {
  const { locale } = useAppStore();
  const { user, updateProfile } = useAuthStore();
  const { accountStatus, verificationItems, rejectionReason, rejectedItems, setAccountStatus, isWizardOpen } = useOnboardingStore();
  const isAr = locale === 'ar';

  // State for email editing
  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [emailInput, setEmailInput] = useState('');
  const [isSubmittingEmail, setIsSubmittingEmail] = useState(false);

  // State for fetched document details from API
  const [details, setDetails] = useState<Record<string, unknown> | null>(null);

  // Fetch full verification details
  useEffect(() => {
    if (!user?.id) return;
    fetch(`/api/onboarding/status?userId=${user.id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          if (data.details) setDetails(data.details);
          
          // Synchronize Zustand store status with actual database status
          const store = useOnboardingStore.getState();
          if (data.accountStatus) {
            store.setAccountStatus(data.accountStatus as any);
          }
          store.setRejectionReason(data.adminNotes || null);
          store.setRejectedItems(data.rejectionReasons || []);

          if (data.items && data.items.length > 0) {
            store.setVerificationItems(data.items.map((i: any) => ({
              id: i.key,
              labelAr: i.labelAr,
              labelEn: i.labelEn,
              status: i.status,
              rejectionReason: i.rejectionReason,
              uploaded: i.uploaded
            })));
          }
        }
      })
      .catch(() => {});
  }, [user?.id]);

  // Handle email update
  const handleUpdateEmail = async () => {
    if (!emailInput || !user?.id) return;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailInput)) {
      toast.error(t(isAr, 'صيغة البريد الإلكتروني غير صحيحة', 'Invalid email format'));
      return;
    }

    setIsSubmittingEmail(true);
    try {
      const res = await fetch('/api/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: user.id, email: emailInput }),
      });
      const data = await res.json();
      if (res.ok) {
        updateProfile({ email: emailInput });
        setIsEditingEmail(false);
        toast.success(t(isAr, 'تم تحديث البريد الإلكتروني بنجاح', 'Email updated successfully'));
      } else {
        toast.error(data.error || t(isAr, 'فشل تحديث البريد', 'Failed to update email'));
      }
    } catch {
      toast.error(t(isAr, 'حدث خطأ في الاتصال', 'Connection error occurred'));
    } finally {
      setIsSubmittingEmail(false);
    }
  };

  // Build items
  const items = useMemo(() => {
    const contactItems: {
      id: string;
      labelAr: string;
      labelEn: string;
      status: 'verified' | 'pending' | 'rejected' | 'required';
    }[] = [];

    if (user?.phone !== undefined) {
      contactItems.push({
        id: 'phone',
        labelAr: user.phone ? `رقم الهاتف (${user.phone})` : 'رقم الهاتف (غير متوفر)',
        labelEn: user.phone ? `Phone (${user.phone})` : 'Phone (Not provided)',
        status: user.phone ? 'verified' : 'required',
      });
    }

    if (user?.email) {
      const isPlaceholder = user.email.includes('@charyday.local');
      contactItems.push({
        id: 'email',
        labelAr: isPlaceholder ? `البريد الإلكتروني (لم يُدخل بعد)` : `البريد الإلكتروني (${user.email})`,
        labelEn: isPlaceholder ? `Email (not provided yet)` : `Email (${user.email})`,
        status: isPlaceholder ? 'required' : 'verified',
      });
    }

    let roleItems: typeof contactItems = [];
    if (verificationItems.length > 0) {
      roleItems = verificationItems.map((item) => ({
        id: item.id,
        labelAr: item.labelAr,
        labelEn: item.labelEn,
        status: item.status,
        rejectionReason: item.rejectionReason,
      }));
    } else if (user) {
      roleItems = getVerificationItemsForRole(user.role).map((item) => ({
        id: item.id,
        labelAr: item.labelAr,
        labelEn: item.labelEn,
        status: item.status,
      }));
    }

    // Filter out email and phone from roleItems to prevent duplicates, since we added them manually above
    roleItems = roleItems.filter(item => item.id !== 'email' && item.id !== 'phone');

    return [...contactItems, ...roleItems];
  }, [verificationItems, user]);

  const progress = useMemo(() => {
    if (items.length === 0) return 0;
    const verified = items.filter((i) => i.status === 'verified').length;
    return Math.round((verified / items.length) * 100);
  }, [items]);

  const requiredCount = items.filter((i) => i.status === 'required').length;
  const rejectedCount = items.filter((i) => i.status === 'rejected').length;

  if (!user) return null;

  const statusColors: Record<string, { bg: string; text: string; icon: React.ElementType }> = {
    incomplete: { bg: 'bg-orange-50 dark:bg-orange-900/10', text: 'text-orange-700 dark:text-orange-300', icon: FileText },
    pending: { bg: 'bg-yellow-50 dark:bg-yellow-900/10', text: 'text-yellow-700 dark:text-yellow-300', icon: Clock },
    rejected: { bg: 'bg-red-50 dark:bg-red-900/10', text: 'text-red-700 dark:text-red-300', icon: XCircle },
    active: { bg: 'bg-green-50 dark:bg-green-900/10', text: 'text-green-700 dark:text-green-300', icon: CheckCircle },
  };

  const currentStatus = statusColors[accountStatus] || statusColors.incomplete;
  const StatusIcon = currentStatus.icon;

  const statusLabels: Record<string, { ar: string; en: string }> = {
    incomplete: { ar: 'لم يكتمل', en: 'Incomplete' },
    pending: { ar: 'قيد المراجعة', en: 'Under Review' },
    rejected: { ar: 'مرفوض', en: 'Rejected' },
    active: { ar: 'مفعّل', en: 'Active' },
  };

  const statusDescriptions: Record<string, { ar: string; en: string }> = {
    incomplete: { ar: 'لم تقم بإرسال طلب التوثيق بعد. يرجى إكمال الخطوات المطلوبة.', en: "You haven't submitted your verification request yet. Please complete the required steps." },
    pending: { ar: 'طلبك قيد المراجعة من قبل فريق المنصة. سيتم إعلامك بالنتيجة.', en: 'Your request is under review by our team. You will be notified of the result.' },
    rejected: { ar: 'تم رفض طلبك. يرجى مراجعة الأسباب أدناه وإعادة التقديم.', en: 'Your request was rejected. Please review the reasons below and resubmit.' },
    active: { ar: 'تم تفعيل حسابك بنجاح! يمكنك الآن استخدام جميع ميزات المنصة.', en: 'Your account is activated! You now have full access to all platform features.' },
  };

  const handleGoComplete = async () => {
    const store = useOnboardingStore.getState();
    store.setAccountStatus('incomplete');
    store.clearDraftFlag();

    try {
      const res = await fetch(`/api/onboarding?userId=${user.id}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.verificationData) {
          const vData = data.verificationData as Record<string, unknown>;
          const hasData = Object.values(vData).some(
            (v) => v !== null && v !== undefined && v !== '' && v !== '[]' && v !== 0
          );
          if (hasData) {
            restoreDraftFields(user.role, vData);
            const resumeStep = calcResumeStep(user.role, vData);
            store.setStep(resumeStep);
          }
        }
      }
    } catch {}

    window.location.href = '/seller/onboarding';
  };

  const handleRetry = () => {
    rejectedItems.forEach((id) => {
      const store = useOnboardingStore.getState();
      store.updateVerificationItem(id, 'required');
    });
    handleGoComplete();
  };

  // The wizard is now rendered on a separate page (/seller/onboarding)

  return (
    <div className="space-y-6 max-w-3xl mx-auto animate-fade-in pb-12">
      {/* Page Title */}
      <div className="flex items-center gap-3">
        <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
          <ShieldCheck className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">
            {t(isAr, 'حالة التوثيق والمستندات', 'Verification Status & Documents')}
          </h1>
          <p className="text-sm text-muted-foreground">
            {t(isAr, 'إدارة تفاصيل ومستندات توثيق متجرك وحسابك الشخصي', 'Manage your store and personal verification details')}
          </p>
        </div>
      </div>

      {/* Role Breakdown Header Banner */}
      <Card className="bg-gradient-to-r from-blue-50/50 to-indigo-50/50 dark:from-blue-950/20 dark:to-indigo-950/20 border-blue-100 dark:border-blue-900/30">
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
              {user.role === 'store_manager' ? <Building2 className="size-6" /> : <UserCircle className="size-6" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                  {t(isAr, 'نوع التوثيق الحالي', 'Current Verification Type')}
                </span>
                <Badge variant="outline" className="border-blue-200 text-blue-700 dark:border-blue-800 dark:text-blue-300">
                  {user.role === 'store_manager' ? t(isAr, 'متجر رسمي معتمد', 'Verified Store Manager') : t(isAr, 'تاجر مستقل', 'Independent Seller')}
                </Badge>
              </div>
              <p className="text-sm font-medium mt-1">
                {user.role === 'store_manager'
                  ? t(isAr, 'توثيق متكامل يشمل السجل التجاري، الحساب البنكي للشركة، وهوية المدير المفوض.', 'Comprehensive verification including Commercial Register, Corporate Bank Account, and Authorized Manager ID.')
                  : t(isAr, 'توثيق شخصي يشمل الهوية الوطنية، وثيقة العمل الحر، والحساب البنكي.', 'Personal verification including National ID, Freelance Certificate, and Bank Account.')
                }
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Overall Status Card */}
      <Card className={currentStatus.bg}>
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <div className={`h-12 w-12 rounded-xl ${currentStatus.bg} flex items-center justify-center shrink-0`}>
              <StatusIcon className={`h-6 w-6 ${currentStatus.text}`} />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold">
                  {statusLabels[accountStatus]?.[isAr ? 'ar' : 'en'] || accountStatus}
                </h2>
                <Badge variant="secondary" className={`${currentStatus.bg} ${currentStatus.text} border-0`}>
                  {progress}%
                </Badge>
              </div>
              <p className="text-sm mt-1 opacity-80">
                {statusDescriptions[accountStatus]?.[isAr ? 'ar' : 'en'] || ''}
              </p>
              <Progress value={progress} className="h-2 mt-3 max-w-xs" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Rejected Banner with Retry */}
      {accountStatus === 'rejected' && rejectionReason && (
        <Card className="border-red-200 bg-red-50 dark:bg-red-900/10 dark:border-red-800/30">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <XCircle className="h-5 w-5 text-red-600 mt-0.5 shrink-0" />
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-red-800 dark:text-red-200">
                  {t(isAr, 'سبب الرفض', 'Rejection Reason')}
                </h3>
                <p className="text-sm text-red-600 dark:text-red-400 mt-1">{rejectionReason}</p>
                <Button size="sm" className="mt-3" onClick={handleRetry}>
                  {t(isAr, 'إعادة التقديم وتصحيح الأخطاء', 'Resubmit & Correct Errors')}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Verification Items with Previews */}
      {items.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center justify-between">
              <span>{t(isAr, '📋 تفاصيل التوثيق والمستندات', '📋 Verification Details & Documents')}</span>
              <span className="text-xs font-normal text-muted-foreground">{t(isAr, 'يمكنك معاينة المستندات المرفوعة أدناه', 'You can preview uploaded documents below')}</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="divide-y divide-border">
              {items.map((item) => {
                const config = statusConfig[item.status];
                const Icon = config.icon;
                const isContact = item.id === 'phone' || item.id === 'email';
                const isEmail = item.id === 'email';
                const itemRejectionReason = 'rejectionReason' in item ? (item as { rejectionReason?: string }).rejectionReason : undefined;
                const isUploaded = 'uploaded' in item ? (item as { uploaded?: boolean }).uploaded : false;

                const getFileUrl = () => {
                  if (!details) return '#';
                  if (item.id === 'commercial_register') return details.commercialRegisterFile;
                  if (item.id === 'bank_account') return details.bankLetterFile || details.bankDocument;
                  if (item.id === 'manager_id') return details.managerIdFront;
                  if (item.id === 'national_id') return details.idFrontFile || details.nationalIdFront;
                  if (item.id === 'selfie') return details.livenessSelfie || details.selfieUrl;
                  if (item.id === 'freelance_document') return details.freelanceDocumentFile || details.freelanceDocument;
                  return '#';
                };
                const fileUrl = getFileUrl();

                return (
                  <div key={item.id} className="py-4 first:pt-0 last:pb-0">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-xl ${config.bg}`}>
                          <Icon className={`size-4 ${config.color}`} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            {isContact && (
                              <span className="text-muted-foreground shrink-0">
                                {item.id === 'phone' ? <Phone className="size-3.5" /> : <Mail className="size-3.5" />}
                              </span>
                            )}
                            <span className="text-sm font-semibold text-foreground">
                              {isAr ? item.labelAr : item.labelEn}
                            </span>
                          </div>
                          {item.status === 'verified' && !isContact && details && (
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {item.id === 'vi-commercial_register' && typeof details.commercialRegisterNumber === 'string' && `${t(isAr, 'رقم السجل:', 'CR No:')} ${details.commercialRegisterNumber}`}
                              {item.id === 'vi-bank_account' && typeof details.iban === 'string' && `${t(isAr, 'الآيبان:', 'IBAN:')} ${details.iban}`}
                              {item.id === 'vi-manager_id' && `${t(isAr, 'الهوية مفحوصة ومعتمدة', 'ID verified and approved')}`}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-auto">
                        <Badge variant="secondary" className={`text-xs ${config.color} ${config.bg} border-0`}>
                          {isAr ? config.labelAr : config.labelEn}
                        </Badge>

                        {/* Edit Email Button */}
                        {isEmail && !isEditingEmail && (
                          <Button size="sm" variant="outline" className="text-xs h-7 px-2.5 gap-1.5" onClick={() => { setEmailInput(user.email.includes('@charyday.local') ? '' : user.email); setIsEditingEmail(true); }}>
                            <Edit2 className="size-3" />
                            {t(isAr, 'تعديل', 'Edit')}
                          </Button>
                        )}

                        {/* Document Preview Link */}
                        {!isContact && isUploaded && fileUrl && fileUrl !== '#' && (
                          <Button size="sm" variant="ghost" className="text-xs h-7 px-2.5 text-primary gap-1" asChild>
                            <a href={fileUrl as string} target="_blank" rel="noreferrer">
                              <ExternalLink className="size-3" />
                              {t(isAr, 'معاينة', 'Preview')}
                            </a>
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* Inline Email Edit Form */}
                    {isEmail && isEditingEmail && (
                      <div className="mt-3 p-3 rounded-lg bg-muted/50 border flex items-center gap-2">
                        <Input size={1} className="text-xs h-8 bg-background" placeholder={t(isAr, 'أدخل بريدك الإلكتروني الحقيقي...', 'Enter real email address...')} value={emailInput} onChange={(e) => setEmailInput(e.target.value)} />
                        <Button size="sm" className="h-8 text-xs shrink-0" disabled={isSubmittingEmail} onClick={handleUpdateEmail}>
                          {t(isAr, 'حفظ', 'Save')}
                        </Button>
                        <Button size="sm" variant="ghost" className="h-8 text-xs shrink-0" onClick={() => setIsEditingEmail(false)}>
                          {t(isAr, 'إلغاء', 'Cancel')}
                        </Button>
                      </div>
                    )}

                    {item.status === 'rejected' && itemRejectionReason && (
                      <p className="text-xs text-red-500 mt-1.5 sm:ps-11">{itemRejectionReason}</p>
                    )}
                  </div>
                );
              })}
            </div>

            <Separator className="my-4" />
            <div className="flex flex-wrap gap-2">
              {items.filter((i) => i.status === 'verified').length > 0 && (
                <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400 border-0">
                  ✓ {items.filter((i) => i.status === 'verified').length} {t(isAr, 'موثق', 'Verified')}
                </Badge>
              )}
              {items.filter((i) => i.status === 'pending').length > 0 && (
                <Badge variant="secondary" className="bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400 border-0">
                  ⏳ {items.filter((i) => i.status === 'pending').length} {t(isAr, 'قيد المراجعة', 'Pending')}
                </Badge>
              )}
              {rejectedCount > 0 && (
                <Badge variant="secondary" className="bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400 border-0">
                  ✗ {rejectedCount} {t(isAr, 'مرفوض', 'Rejected')}
                </Badge>
              )}
              {requiredCount > 0 && (
                <Badge variant="secondary" className="bg-orange-100 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400 border-0">
                  ⚠ {requiredCount} {t(isAr, 'مطلوب', 'Required')}
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Active Account Notice */}
      {accountStatus === 'active' && (
        <div className="flex items-center gap-3 p-4 rounded-lg bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800/30">
          <CheckCircle className="h-5 w-5 text-green-600 shrink-0" />
          <div>
            <p className="text-sm font-medium text-green-800 dark:text-green-200">
              {t(isAr, '🎉 حسابك مفعّل بالكامل كمقر متجر رسمي', 'Your account is fully activated as Verified Store')}
            </p>
            <p className="text-xs text-green-600 dark:text-green-400 mt-0.5">
              {t(isAr, 'يمكنك الآن إدارة منتجاتك، طلباتك، وموظفيك بحرية مطلقة', 'You now have full access to manage your products, orders, and staff')}
            </p>
          </div>
        </div>
      )}

      {/* CTA */}
      {(accountStatus === 'incomplete' || accountStatus === 'rejected') && (
        <Card className="border-dashed border-2 border-primary/30 bg-primary/5">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                  <ShieldCheck className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="text-sm font-bold">
                    {accountStatus === 'rejected'
                      ? t(isAr, 'أكمل البيانات المطلوبة وأعد التقديم', 'Complete required info and resubmit')
                      : t(isAr, 'أكمل خطوات التوثيق لتفعيل حسابك', 'Complete verification to activate your account')
                    }
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    {accountStatus === 'rejected'
                      ? t(isAr, `${rejectedCount} عنصر مرفوض يحتاج لتصحيح`, `${rejectedCount} rejected items need correction`)
                      : t(isAr, `${requiredCount} عنصر مطلوب لإكمال التحقق`, `${requiredCount} items required to complete verification`)
                    }
                  </p>
                </div>
              </div>
              <Button onClick={handleGoComplete} className="gradient-navy text-white shrink-0">
                {isAr ? (
                  <>
                    استكمال التوثيق ومراجعة المستندات
                    <ArrowLeft className="h-4 w-4 ms-2" />
                  </>
                ) : (
                  <>
                    Complete Verification & Review Docs
                    <ArrowRight className="h-4 w-4 me-2" />
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
