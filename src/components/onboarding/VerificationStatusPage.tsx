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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';




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

  // State for fetched document details from API
  const [details, setDetails] = useState<Record<string, unknown> | null>(null);

  // States for sensitive profile update (sequential flow)
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [updateMethod, setUpdateMethod] = useState<'email' | 'phone'>('email');
  const [newValueInput, setNewValueInput] = useState('');
  const [oldOtpInput, setOldOtpInput] = useState('');
  const [newOtpInput, setNewOtpInput] = useState('');
  const [updateStep, setUpdateStep] = useState<1 | 2 | 3 | 4>(1); // 1 = request old, 2 = verify old, 3 = input new, 4 = verify new
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);

  const openUpdateModal = (method: 'email' | 'phone') => {
    setUpdateMethod(method);
    setNewValueInput('');
    setOldOtpInput('');
    setNewOtpInput('');
    
    const hasOld = method === 'email'
      ? (user.email && !user.email.includes('@charyday.local'))
      : !!user.phone;

    if (hasOld) {
      setUpdateStep(1);
    } else {
      setUpdateStep(3); // Start directly by entering the new value
    }
    setIsUpdateModalOpen(true);
  };

  const handleSendOldOtp = async () => {
    setIsSendingOtp(true);
    try {
      const res = await fetch('/api/user/profile/update-sensitive', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'request_old_verify',
          method: updateMethod,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success(t(isAr, 'تم إرسال رمز الأمان للعنوان الحالي.', 'Security code sent to current address.'));
        setUpdateStep(2);
        if (process.env.NODE_ENV === 'development' && data._devCodeOld) {
          toast.info(t(isAr, `[تجريبي] رمز التحقق الحالي: ${data._devCodeOld}`, `[Dev] Current OTP: ${data._devCodeOld}`), { duration: 15000 });
        }
      } else {
        toast.error(data.error || t(isAr, 'فشل إرسال الرمز', 'Failed to send code'));
      }
    } catch {
      toast.error(t(isAr, 'خطأ في الاتصال بالخادم', 'Connection error'));
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleVerifyOldOtp = async () => {
    if (!oldOtpInput || oldOtpInput.length < 6) {
      toast.error(t(isAr, 'يرجى إدخال الرمز كاملاً', 'Please enter full code'));
      return;
    }
    setIsVerifyingOtp(true);
    try {
      const res = await fetch('/api/user/profile/update-sensitive', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'confirm_old_verify',
          method: updateMethod,
          oldOtp: oldOtpInput,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success(t(isAr, 'تم التحقق من هويتك بنجاح.', 'Identity verified successfully.'));
        setUpdateStep(3);
      } else {
        toast.error(data.error || t(isAr, 'الرمز غير صحيح أو منتهي الصلاحية', 'Incorrect or expired code'));
      }
    } catch {
      toast.error(t(isAr, 'خطأ في الاتصال بالخادم', 'Connection error'));
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  const handleSendNewOtp = async () => {
    if (!newValueInput) {
      toast.error(t(isAr, 'يرجى إدخال القيمة الجديدة', 'Please enter new value'));
      return;
    }
    if (updateMethod === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newValueInput)) {
      toast.error(t(isAr, 'صيغة البريد الإلكتروني غير صحيحة', 'Invalid email format'));
      return;
    }
    setIsSendingOtp(true);
    try {
      const res = await fetch('/api/user/profile/update-sensitive', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'request_new_verify',
          method: updateMethod,
          newValue: newValueInput,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success(t(isAr, 'تم إرسال رمز الأمان للعنوان الجديد بنجاح.', 'Security code sent to the new address.'));
        setUpdateStep(4);
        if (process.env.NODE_ENV === 'development' && data._devCodeNew) {
          toast.info(t(isAr, `[تجريبي] الرمز الجديد: ${data._devCodeNew}`, `[Dev] New OTP: ${data._devCodeNew}`), { duration: 15000 });
        }
      } else {
        toast.error(data.error || t(isAr, 'فشل طلب التعديل', 'Failed to request change'));
      }
    } catch {
      toast.error(t(isAr, 'خطأ في الاتصال بالخادم', 'Connection error'));
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleConfirmNewChange = async () => {
    if (!newOtpInput || newOtpInput.length < 6) {
      toast.error(t(isAr, 'يرجى إدخال رمز التحقق الجديد كاملاً', 'Please enter new OTP code'));
      return;
    }
    setIsVerifyingOtp(true);
    try {
      const res = await fetch('/api/user/profile/update-sensitive', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'confirm_new_change',
          method: updateMethod,
          newValue: newValueInput,
          newOtp: newOtpInput,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success(data.message || t(isAr, 'تم تحديث البيانات بنجاح وتفعيل قفل الأمان.', 'Updated successfully and safety lock activated.'));
        if (updateMethod === 'email') {
          updateProfile({ email: newValueInput });
        } else {
          updateProfile({ phone: newValueInput });
        }
        setIsUpdateModalOpen(false);
      } else {
        toast.error(data.error || t(isAr, 'رمز التحقق غير صحيح', 'Incorrect verification code'));
      }
    } catch {
      toast.error(t(isAr, 'خطأ في الاتصال بالخادم', 'Connection error'));
    } finally {
      setIsVerifyingOtp(false);
    }
  };



  // Fetch full verification details
  useEffect(() => {
    if (!user?.id) return;
    fetch(`/api/onboarding/status?userId=${user.id}&t=${Date.now()}`, {
      cache: 'no-store'
    })
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

                        {/* Edit Email/Phone Button */}
                        {isContact && (
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="text-xs h-7 px-2.5 gap-1.5" 
                            onClick={() => openUpdateModal(item.id as 'email' | 'phone')}
                          >
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
        <div className="space-y-4">
          <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-lg border ${
            requiredCount > 0
              ? 'bg-amber-50 dark:bg-amber-900/10 border-amber-200 dark:border-amber-800/30'
              : 'bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-800/30'
          }`}>
            <div className="flex items-center gap-3">
              {requiredCount > 0 ? (
                <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 animate-pulse" />
              ) : (
                <CheckCircle className="h-5 w-5 text-green-600 shrink-0" />
              )}
              <div>
                <p className={`text-sm font-medium ${requiredCount > 0 ? 'text-amber-800 dark:text-amber-200' : 'text-green-800 dark:text-green-200'}`}>
                  {requiredCount > 0 
                    ? t(isAr, '🎉 حسابك نشط، ولكن يرجى إكمال البيانات المطلوبة', '🎉 Account active, but please complete required info')
                    : t(isAr, '🎉 حسابك مفعّل بالكامل كمقر متجر رسمي', 'Your account is fully activated as Verified Store')
                  }
                </p>
                <p className={`text-xs mt-0.5 ${requiredCount > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-green-600 dark:text-green-400'}`}>
                  {requiredCount > 0
                    ? t(isAr, 'حسابك مفعّل، ولكن يرجى استكمال بيانات الهاتف/البريد لتفادي أي قيود على سحب الأرباح.', 'Your account is active, but please complete phone/email to avoid payout holds.')
                    : t(isAr, 'يمكنك الآن إدارة منتجاتك، طلباتك، وموظفيك بحرية مطلقة', 'You now have full access to manage your products, orders, and staff')
                  }
                </p>
              </div>
            </div>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs font-bold border-green-300 dark:border-green-800 hover:bg-green-100 dark:hover:bg-green-900/30 text-green-800 dark:text-green-200"
                >
                  <Edit2 className="size-3 me-1.5" />
                  {t(isAr, 'تحديث أو تعديل المستندات المرفوعة', 'Update or Edit Documents')}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent dir={isAr ? 'rtl' : 'ltr'}>
                <AlertDialogHeader className="text-start rtl:text-right ltr:text-left">
                  <AlertDialogTitle>
                    {t(isAr, 'تحديث وثائق التوثيق', 'Update Verification Documents')}
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    {t(isAr, 'هل تريد تعديل أو تحديث وثائق التوثيق الخاصة بك؟ سيتم إعادة حالة التوثيق إلى غير مكتملة لتتمكن من رفع وتعديل المستندات وإرسالها للمراجعة مرة أخرى.', 'Do you want to edit or update your verification documents? This will reset the status to incomplete so you can upload and edit files to submit again.')}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className="flex-row justify-end gap-2 pt-2">
                  <AlertDialogCancel className="text-xs font-bold rounded-xl">
                    {t(isAr, 'إلغاء', 'Cancel')}
                  </AlertDialogCancel>
                  <AlertDialogAction
                    className="text-xs font-bold rounded-xl bg-green-600 hover:bg-green-700 text-white"
                    onClick={async () => {
                      try {
                        const res = await fetch('/api/onboarding', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ _action: 'request_update', userId: user.id })
                        });
                        if (res.ok) {
                          toast.success(t(isAr, 'تم إعادة تعيين حالة التوثيق بنجاح. يمكنك التعديل الآن.', 'Verification status reset. You can now edit.'));
                          setAccountStatus('incomplete');
                          window.location.href = '/seller/onboarding';
                        } else {
                          toast.error(t(isAr, 'حدث خطأ أثناء طلب التعديل', 'Failed to request edit'));
                        }
                      } catch {
                        toast.error(t(isAr, 'خطأ في الاتصال بالخادم', 'Connection error'));
                      }
                    }}
                  >
                    {t(isAr, 'تعديل', 'Edit')}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
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
      {/* Sensitive Profile Update Dialog (Sequential step-by-step flow) */}
      <Dialog open={isUpdateModalOpen} onOpenChange={setIsUpdateModalOpen}>
        <DialogContent dir={isAr ? 'rtl' : 'ltr'} className="max-w-md" onPointerDownOutside={(e) => e.preventDefault()} onInteractOutside={(e) => e.preventDefault()}>
          <DialogHeader className="text-start rtl:text-right ltr:text-left">
            <DialogTitle>
              {updateMethod === 'email' 
                ? t(isAr, 'تعديل البريد الإلكتروني للحساب', 'Edit Account Email')
                : t(isAr, 'تعديل رقم هاتف الحساب', 'Edit Account Phone Number')
              }
            </DialogTitle>
            <DialogDescription>
              {t(isAr, 
                'لدواعي الأمان ولحماية حسابك، تتطلب هذه العملية التحقق من الهوية خطوة بخطوة عبر رموز أمان مستقلة.',
                'For security and account protection, this operation requires step-by-step identity verification via separate security codes.'
              )}
            </DialogDescription>
          </DialogHeader>

          {/* STEP 1: Request OTP for current old email/phone */}
          {updateStep === 1 && (
            <div className="space-y-4 py-2 text-start rtl:text-right ltr:text-left">
              <p className="text-xs text-muted-foreground">
                {updateMethod === 'email'
                  ? t(isAr, `الخطوة 1: يرجى تأكيد هويتك أولاً عبر إرسال رمز التحقق لبريدك الإلكتروني الحالي: ${user.email}`, `Step 1: Please verify your identity first by sending a code to your current email: ${user.email}`)
                  : t(isAr, `الخطوة 1: يرجى تأكيد هويتك أولاً عبر إرسال رمز التحقق لهاتفك الحالي: ${user.phone}`, `Step 1: Please verify your identity first by sending a code to your current phone: ${user.phone}`)
                }
              </p>
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" size="sm" className="text-xs font-bold rounded-xl" onClick={() => setIsUpdateModalOpen(false)}>
                  {t(isAr, 'إلغاء', 'Cancel')}
                </Button>
                <Button 
                  size="sm" 
                  className="text-xs font-bold rounded-xl bg-primary text-white" 
                  disabled={isSendingOtp}
                  onClick={handleSendOldOtp}
                >
                  {isSendingOtp ? '...' : t(isAr, 'إرسال رمز التحقق الحالي', 'Send Current Verification Code')}
                </Button>
              </div>
            </div>
          )}

          {/* STEP 2: Verify current old OTP */}
          {updateStep === 2 && (
            <div className="space-y-4 py-2 text-start rtl:text-right ltr:text-left">
              <div className="space-y-2">
                <span className="text-sm font-semibold">
                  {updateMethod === 'email'
                    ? t(isAr, 'أدخل الرمز المرسل لبريدك الإلكتروني الحالي', 'Enter code sent to current email')
                    : t(isAr, 'أدخل الرمز المرسل لهاتفك الحالي', 'Enter code sent to current phone')
                  }
                </span>
                <Input
                  dir="ltr"
                  maxLength={6}
                  placeholder="123456"
                  value={oldOtpInput}
                  onChange={(e) => setOldOtpInput(e.target.value.replace(/\D/g, ''))}
                  className="bg-muted/30 border-white/10 rounded-xl text-xs text-center font-mono tracking-widest"
                />
              </div>
              <div className="flex justify-between items-center pt-2">
                <Button variant="ghost" size="sm" className="text-xs text-muted-foreground" onClick={() => setUpdateStep(1)}>
                  {t(isAr, '← رجوع', '← Back')}
                </Button>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="text-xs font-bold rounded-xl" onClick={() => setIsUpdateModalOpen(false)}>
                    {t(isAr, 'إلغاء', 'Cancel')}
                  </Button>
                  <Button 
                    size="sm" 
                    className="text-xs font-bold rounded-xl bg-primary text-white" 
                    disabled={isVerifyingOtp}
                    onClick={handleVerifyOldOtp}
                  >
                    {isVerifyingOtp ? '...' : t(isAr, 'تأكيد الهوية', 'Verify Identity')}
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Input new value */}
          {updateStep === 3 && (
            <div className="space-y-4 py-2 text-start rtl:text-right ltr:text-left">
              {/* Show current value if it exists */}
              {updateMethod === 'email' && user.email && !user.email.includes('@charyday.local') && (
                <div className="text-xs bg-muted/50 p-3 rounded-lg border border-dashed">
                  <span className="text-muted-foreground block mb-1">{t(isAr, 'البريد الإلكتروني الحالي:', 'Current Email:')}</span>
                  <span className="font-semibold font-mono text-sm">{user.email}</span>
                </div>
              )}
              {updateMethod === 'phone' && user.phone && (
                <div className="text-xs bg-muted/50 p-3 rounded-lg border border-dashed">
                  <span className="text-muted-foreground block mb-1">{t(isAr, 'رقم الهاتف الحالي:', 'Current Phone:')}</span>
                  <span className="font-semibold font-mono text-sm">{user.phone}</span>
                </div>
              )}

              <div className="space-y-2">
                <span className="text-sm font-semibold">
                  {updateMethod === 'email'
                    ? t(isAr, 'أدخل البريد الإلكتروني الجديد', 'Enter New Email Address')
                    : t(isAr, 'أدخل رقم الهاتف الجديد', 'Enter New Phone Number')
                  }
                </span>
                <Input
                  dir="ltr"
                  placeholder={updateMethod === 'email' ? 'email@example.com' : '+213XXXXXXXXX'}
                  value={newValueInput}
                  onChange={(e) => setNewValueInput(e.target.value)}
                  className="bg-muted/30 border-white/10 rounded-xl text-xs"
                />
              </div>

              <div className="flex justify-between items-center pt-2">
                {/* Only allow back to verify old if they had one */}
                {(updateMethod === 'email' ? (user.email && !user.email.includes('@charyday.local')) : !!user.phone) ? (
                  <Button variant="ghost" size="sm" className="text-xs text-muted-foreground" onClick={() => setUpdateStep(2)}>
                    {t(isAr, '← رجوع', '← Back')}
                  </Button>
                ) : <div />}
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="text-xs font-bold rounded-xl" onClick={() => setIsUpdateModalOpen(false)}>
                    {t(isAr, 'إلغاء', 'Cancel')}
                  </Button>
                  <Button 
                    size="sm" 
                    className="text-xs font-bold rounded-xl bg-primary text-white" 
                    disabled={isSendingOtp}
                    onClick={handleSendNewOtp}
                  >
                    {isSendingOtp ? '...' : t(isAr, 'إرسال الرمز للعنوان الجديد', 'Send Verification Code')}
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: Verify new OTP and save */}
          {updateStep === 4 && (
            <div className="space-y-4 py-2 text-start rtl:text-right ltr:text-left">
              <p className="text-xs text-muted-foreground">
                {updateMethod === 'email'
                  ? t(isAr, `يرجى إدخال رمز التحقق المكون من 6 أرقام المرسل إلى بريدك الجديد: ${newValueInput}`, `Please enter the 6-digit verification code sent to your new email: ${newValueInput}`)
                  : t(isAr, `يرجى إدخال رمز التحقق المكون من 6 أرقام المرسل إلى هاتفك الجديد: ${newValueInput}`, `Please enter the 6-digit verification code sent to your new phone: ${newValueInput}`)
                }
              </p>

              <div className="space-y-2">
                <span className="text-sm font-semibold">
                  {t(isAr, 'رمز التحقق الجديد', 'New Verification Code')}
                </span>
                <Input
                  dir="ltr"
                  maxLength={6}
                  placeholder="123456"
                  value={newOtpInput}
                  onChange={(e) => setNewOtpInput(e.target.value.replace(/\D/g, ''))}
                  className="bg-muted/30 border-white/10 rounded-xl text-xs text-center font-mono tracking-widest"
                />
              </div>

              <div className="flex justify-between items-center pt-2">
                <Button variant="ghost" size="sm" className="text-xs text-muted-foreground" onClick={() => setUpdateStep(3)}>
                  {t(isAr, '← رجوع', '← Back')}
                </Button>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="text-xs font-bold rounded-xl" onClick={() => setIsUpdateModalOpen(false)}>
                    {t(isAr, 'إلغاء', 'Cancel')}
                  </Button>
                  <Button 
                    size="sm" 
                    className="text-xs font-bold rounded-xl bg-green-600 hover:bg-green-700 text-white" 
                    disabled={isVerifyingOtp}
                    onClick={handleConfirmNewChange}
                  >
                    {isVerifyingOtp ? '...' : t(isAr, 'تأكيد وحفظ', 'Confirm & Save')}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
