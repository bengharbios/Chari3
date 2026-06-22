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
    if (isWizardOpen) {
      fetchData();
    }
  }, [user?.id, isWizardOpen]);

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
    { id: 0, title: 'السجل التجاري', icon: <Store className="w-5 h-5" />, done: hasLegal, component: <LegalStep data={formData} updateData={handleUpdateData} /> },
    { id: 1, title: 'الضريبة', icon: <FileText className="w-5 h-5" />, done: hasTax, component: <TaxStep data={formData} updateData={handleUpdateData} /> },
    { id: 2, title: 'البنك', icon: <Landmark className="w-5 h-5" />, done: hasBank, component: <BankStep data={formData} updateData={handleUpdateData} /> },
    { id: 3, title: 'الهوية', icon: <UserCheck className="w-5 h-5" />, done: hasIdentity, component: <IdentityStep data={formData} updateData={handleUpdateData} /> },
    { id: 4, title: 'الشروط', icon: <ShieldCheck className="w-5 h-5" />, done: hasTerms, component: <TermsStep data={formData} updateData={handleUpdateData} /> },
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
    <div className="max-w-4xl w-full mx-auto p-0 flex flex-col bg-white shadow-lg rounded-2xl border overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <h2 className="sr-only">Store Verification Wizard</h2>
        <p className="sr-only">Complete your store verification steps.</p>
        
        {/* Header section */}
        <div className="bg-gray-50 border-b px-6 py-4 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold flex items-center gap-2 text-gray-900">
              <Store className="text-brand" />
              {locale === 'ar' ? 'توثيق بيانات المتجر' : 'Store Verification'}
            </h2>
            <Button variant="outline" size="sm" onClick={() => { handleSaveDraft(true); setWizardOpen(false); }} className="gap-2 text-gray-700 bg-white">
              <Save className="w-4 h-4" />
              <span className="hidden sm:inline">{locale === 'ar' ? 'حفظ مسودة' : 'Save Draft'}</span>
            </Button>
          </div>
          
          {/* Progress */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-gray-500 font-medium">
              <span>{locale === 'ar' ? 'التقدم' : 'Progress'}</span>
              <span>{activeStep + 1} / {totalSteps}</span>
            </div>
            <Progress value={progress} className="h-2 bg-gray-200" />
          </div>

          {/* Steps Indicator */}
          <div className="hidden md:flex items-center justify-between pt-2">
            {stepsList.map((s, i) => (
              <div key={s.id} className={`flex items-center gap-2 text-sm ${i === activeStep ? 'text-black font-bold' : s.done ? 'text-green-600' : 'text-gray-400'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${i === activeStep ? 'bg-black text-white shadow-md' : s.done ? 'bg-green-100 text-green-600' : 'bg-gray-100'}`}>
                  {s.icon}
                </div>
                <span className="hidden lg:inline">{s.title}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-white" dir={isRTL ? 'rtl' : 'ltr'}>
          <div className="mb-8 flex items-center gap-3 border-b pb-4">
            <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center text-gray-700 border">
              {step.icon}
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900">{step.title}</h3>
              <p className="text-sm text-gray-500 mt-1">
                {locale === 'ar' ? 'الرجاء إدخال البيانات والتأكد من صحتها' : 'Please provide accurate details below'}
              </p>
            </div>
          </div>
          
          <div className="max-w-3xl mx-auto">
            {step.component}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="border-t bg-white p-4 md:px-8 flex items-center justify-between shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]" dir={isRTL ? 'rtl' : 'ltr'}>
          <Button 
            variant="outline" 
            onClick={() => setActiveStep(prev => prev - 1)} 
            disabled={activeStep === 0}
            className="gap-2 bg-gray-50 hover:bg-gray-100 text-gray-700"
          >
            {isRTL ? <ArrowRight className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />}
            <span className="hidden sm:inline">{locale === 'ar' ? 'السابق' : 'Previous'}</span>
          </Button>

          <Button 
            onClick={handleNext} 
            disabled={isLoading}
            className={`gap-2 text-white px-8 font-bold transition-all hover:scale-105 ${activeStep === totalSteps - 1 ? 'bg-brand hover:bg-brand/90' : 'bg-black hover:bg-gray-800'}`}
          >
            {isLoading ? '...' : activeStep === totalSteps - 1 ? (locale === 'ar' ? 'تقديم للموافقة' : 'Submit for Review') : (locale === 'ar' ? 'التالي' : 'Next')}
            {activeStep !== totalSteps - 1 && (isRTL ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />)}
          </Button>
        </div>
      </div>
  );
}
