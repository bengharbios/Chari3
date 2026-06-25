'use client';

import React, { useState, useEffect } from 'react';
import { useTranslation } from '@/lib/i18n/useTranslation';
import { Button } from '@/components/ui/button';
import { DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Store, FileText, Landmark, UserCheck, ShieldCheck, ArrowRight, ArrowLeft, Save } from 'lucide-react';
import LegalStep from './LegalStep';
import TaxStep from './TaxStep';
import BankStep from './BankStep';
import IdentityStep from './IdentityStep';
import TermsStep from './TermsStep';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import { useOnboardingStore } from '@/lib/store/onboarding';
import { Progress } from '@/components/ui/progress';

export default function OnboardingWizard() {
  const { t, locale } = useTranslation();
  const router = useRouter();
  const { user } = useAuthStore();
  const { isWizardOpen, setWizardOpen, setAccountStatus } = useOnboardingStore();
  
  const [activeStep, setActiveStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<any>({});
  
  useEffect(() => {
    const fetchData = async () => {
      if (!user?.id) return;
      try {
        const res = await fetch(`/api/seller/onboarding?userId=${user.id}`);
        const data = await res.json();
        if (data.success && data.data) {
          setFormData(data.data);
        }
      } catch (e) {
        console.error("Failed to fetch onboarding data", e);
      }
    };
    fetchData();
  }, [user?.id]);

  const handleUpdateData = (stepData: any) => {
    setFormData((prev: any) => ({ ...prev, ...stepData }));
  };

  const handleSaveDraft = async (showToast = true) => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/seller/onboarding?userId=${user?.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user?.id, data: formData })
      });
      if (res.ok && showToast) {
        toast.success(locale === 'ar' ? 'تم حفظ المسودة بنجاح' : 'Draft saved successfully');
      }
    } catch (e) {
      if (showToast) toast.error(locale === 'ar' ? 'حدث خطأ أثناء الحفظ' : 'Error saving draft');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/seller/onboarding?userId=${user?.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user?.id, data: { ...formData, verificationStatus: 'pending', submittedAt: new Date() } })
      });
      if (res.ok) {
        toast.success(locale === 'ar' ? 'تم إرسال الطلب للمراجعة بنجاح!' : 'Application submitted successfully!');
        setAccountStatus('pending');
        setWizardOpen(false);
        router.push('/verification');
      } else {
        toast.error(locale === 'ar' ? 'حدث خطأ أثناء الإرسال' : 'Error submitting');
      }
    } catch (e) {
      toast.error(locale === 'ar' ? 'حدث خطأ غير متوقع' : 'Unexpected error');
    } finally {
      setIsLoading(false);
    }
  };

  const isRTL = locale === 'ar';
  
  // Status Logic
  const hasLegal = !!formData.commercialRegisterNumber && !!formData.commercialRegisterFile;
  const hasTax = formData.hasVat === false || (formData.hasVat && !!formData.vatNumber);
  const hasBank = !!formData.iban && !!formData.bankLetterFile;
  const hasIdentity = !!formData.signatoryName && !!formData.managerIdFront;
  const hasTerms = !!formData.agreedToTerms;

  const stepsList = [
    { id: 0, title: locale === 'ar' ? 'السجل التجاري' : 'Commercial Register', tabTitle: locale === 'ar' ? 'السجل التجاري' : 'Register', icon: <Store className="w-5 h-5" />, done: hasLegal, component: <LegalStep data={formData} updateData={handleUpdateData} /> },
    { id: 1, title: locale === 'ar' ? 'الضريبة' : 'Tax Details', tabTitle: locale === 'ar' ? 'الضريبة' : 'Tax', icon: <FileText className="w-5 h-5" />, done: hasTax, component: <TaxStep data={formData} updateData={handleUpdateData} /> },
    { id: 2, title: locale === 'ar' ? 'البنك' : 'Financials', tabTitle: locale === 'ar' ? 'البنك' : 'Bank', icon: <Landmark className="w-5 h-5" />, done: hasBank, component: <BankStep data={formData} updateData={handleUpdateData} /> },
    { id: 3, title: locale === 'ar' ? 'هوية المدير أو المالك أو الممثل القانوني للشركة' : 'Identity (Manager/Owner/Representative)', tabTitle: locale === 'ar' ? 'الهوية' : 'Identity', icon: <UserCheck className="w-5 h-5" />, done: hasIdentity, component: <IdentityStep data={formData} updateData={handleUpdateData} /> },
    { id: 4, title: locale === 'ar' ? 'الشروط' : 'Terms', tabTitle: locale === 'ar' ? 'الشروط' : 'Terms', icon: <ShieldCheck className="w-5 h-5" />, done: hasTerms, component: <TermsStep data={formData} updateData={handleUpdateData} /> },
  ];

  const totalSteps = stepsList.length;
  const step = stepsList[activeStep];
  const progress = Math.round(((activeStep + 1) / totalSteps) * 100);

  const canProceed = () => {
    return step.done;
  };

  const handleNext = () => {
    if (!canProceed()) {
      toast.error(locale === 'ar' ? 'يرجى إكمال الحقول المطلوبة للانتقال' : 'Please complete required fields to proceed');
      return;
    }
    handleSaveDraft(false); // Silent save
    if (activeStep < totalSteps - 1) {
      setActiveStep(prev => prev + 1);
    } else {
      handleSubmit();
    }
  };

  return (
    <div className="max-w-4xl w-full mx-auto p-0 flex flex-col bg-white dark:bg-slate-900 shadow-lg rounded-2xl border border-gray-200 dark:border-slate-800 overflow-hidden animate-in fade-in zoom-in-95 duration-200" dir={isRTL ? 'rtl' : 'ltr'}>
        <h2 className="sr-only">Store Verification Wizard</h2>
        <p className="sr-only">Complete your store verification steps.</p>
        
        {/* Header section */}
        <div className="bg-gray-50 dark:bg-slate-900/50 border-b dark:border-slate-800 px-6 py-4 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold flex items-center gap-2 text-gray-900 dark:text-slate-100">
              <Store className="text-brand" />
              {locale === 'ar' ? 'توثيق بيانات المتجر' : 'Store Verification'}
            </h2>
            <Button variant="outline" size="sm" onClick={() => { handleSaveDraft(true); setWizardOpen(false); }} className="gap-2 text-gray-700 dark:text-slate-300 bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700">
              <Save className="w-4 h-4" />
              <span className="hidden sm:inline">{locale === 'ar' ? 'حفظ مسودة' : 'Save Draft'}</span>
            </Button>
          </div>
          
          {/* Progress */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-gray-500 dark:text-slate-400 font-medium">
              <span>{locale === 'ar' ? 'التقدم' : 'Progress'}</span>
              <span>{activeStep + 1} / {totalSteps}</span>
            </div>
            <Progress value={progress} className="h-2 bg-gray-200 dark:bg-slate-800" />
          </div>

          {/* Steps Indicator */}
          <div className="hidden md:flex items-center justify-between pt-2">
            {stepsList.map((s, i) => (
              <div key={s.id} className={`flex items-center gap-2 text-sm ${i === activeStep ? 'text-black dark:text-white font-bold' : s.done ? 'text-green-600 dark:text-green-500' : 'text-gray-400 dark:text-slate-500'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${i === activeStep ? 'bg-black dark:bg-slate-100 text-white dark:text-slate-900 shadow-md' : s.done ? 'bg-green-100 dark:bg-green-950/30 text-green-600 dark:text-green-400' : 'bg-gray-100 dark:bg-slate-800 text-gray-400 dark:text-slate-500'}`}>
                  {s.icon}
                </div>
                <span className="hidden lg:inline">{s.tabTitle || s.title}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-white dark:bg-slate-900" dir={isRTL ? 'rtl' : 'ltr'}>
          <div className="mb-8 flex items-center gap-3 border-b dark:border-slate-800 pb-4">
            <div className="w-12 h-12 rounded-xl bg-gray-50 dark:bg-slate-800 flex items-center justify-center text-gray-700 dark:text-slate-300 border dark:border-slate-700">
              {step.icon}
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-slate-100">{step.title}</h3>
              <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
                {locale === 'ar' ? 'الرجاء إدخال البيانات والتأكد من صحتها' : 'Please provide accurate details below'}
              </p>
            </div>
          </div>
          
          <div className="max-w-3xl mx-auto">
            {step.component}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="border-t dark:border-slate-800 bg-white dark:bg-slate-900 p-4 md:px-8 flex items-center justify-between shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] dark:shadow-none" dir={isRTL ? 'rtl' : 'ltr'}>
          <Button 
            variant="outline" 
            onClick={() => setActiveStep(prev => prev - 1)} 
            disabled={activeStep === 0}
            className="gap-2 bg-gray-50 dark:bg-slate-800 hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-700 dark:text-slate-300 border-gray-200 dark:border-slate-700"
          >
            {isRTL ? <ArrowRight className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />}
            <span className="hidden sm:inline">{locale === 'ar' ? 'السابق' : 'Previous'}</span>
          </Button>

          <Button 
            onClick={handleNext} 
            disabled={isLoading}
            className={`gap-2 px-8 font-bold transition-all hover:scale-105 ${activeStep === totalSteps - 1 ? 'bg-brand hover:bg-brand/90 text-white' : 'bg-black dark:bg-slate-100 hover:bg-gray-800 dark:hover:bg-slate-200 text-white dark:text-slate-900'}`}
          >
            {isLoading ? '...' : activeStep === totalSteps - 1 ? (locale === 'ar' ? 'تقديم للموافقة' : 'Submit for Review') : (locale === 'ar' ? 'التالي' : 'Next')}
            {activeStep !== totalSteps - 1 && (isRTL ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />)}
          </Button>
        </div>
      </div>
  );
}
