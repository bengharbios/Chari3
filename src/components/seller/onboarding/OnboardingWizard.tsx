'use client';

import React, { useState, useEffect } from 'react';
import { useTranslation } from '@/lib/i18n/useTranslation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { CheckCircle2, ChevronLeft, ChevronRight, Save } from 'lucide-react';
import LegalStep from './LegalStep';
import TaxStep from './TaxStep';
import BankStep from './BankStep';
import IdentityStep from './IdentityStep';
import TermsStep from './TermsStep';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

export default function OnboardingWizard() {
  const { t, locale } = useTranslation();
  const router = useRouter();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<any>({});
  
  const totalSteps = 5;

  useEffect(() => {
    // Fetch initial data
    const fetchData = async () => {
      try {
        const res = await fetch('/api/seller/onboarding');
        const data = await res.json();
        if (data.success && data.data) {
          setFormData(data.data);
        }
      } catch (e) {
        console.error("Failed to fetch onboarding data", e);
      }
    };
    fetchData();
  }, []);

  const handleUpdateData = (stepData: any) => {
    setFormData((prev: any) => ({ ...prev, ...stepData }));
  };

  const handleSaveDraft = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/seller/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: formData })
      });
      if (res.ok) {
        toast.success(t('onboarding.saveDraft'));
        router.push('/seller');
      }
    } catch (e) {
      toast.error('Failed to save draft');
    } finally {
      setIsLoading(false);
    }
  };

  const handleNext = async () => {
    // Optionally validate step before moving
    setIsLoading(true);
    try {
      const res = await fetch('/api/seller/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: formData })
      });
      if (res.ok) {
        setCurrentStep((prev) => Math.min(prev + 1, totalSteps));
        window.scrollTo(0, 0);
      }
    } catch (e) {
      toast.error('Failed to save progress');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrev = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
    window.scrollTo(0, 0);
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/seller/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: { ...formData, verificationStatus: 'pending', submittedAt: new Date() } })
      });
      if (res.ok) {
        toast.success(t('onboarding.submit'));
        router.push('/seller?submitted=true');
      }
    } catch (e) {
      toast.error('Failed to submit');
    } finally {
      setIsLoading(false);
    }
  };

  const progressPercentage = Math.round(((currentStep - 1) / totalSteps) * 100);

  const stepsList = [
    { id: 1, title: t('onboarding.steps.legal') },
    { id: 2, title: t('onboarding.steps.tax') },
    { id: 3, title: t('onboarding.steps.bank') },
    { id: 4, title: t('onboarding.steps.identity') },
    { id: 5, title: t('onboarding.steps.terms') },
  ];

  const renderStepContent = () => {
    switch (currentStep) {
      case 1: return <LegalStep data={formData} updateData={handleUpdateData} />;
      case 2: return <TaxStep data={formData} updateData={handleUpdateData} />;
      case 3: return <BankStep data={formData} updateData={handleUpdateData} />;
      case 4: return <IdentityStep data={formData} updateData={handleUpdateData} />;
      case 5: return <TermsStep data={formData} updateData={handleUpdateData} />;
      default: return null;
    }
  };

  const isRTL = locale === 'ar';

  return (
    <div className={`max-w-5xl mx-auto p-4 md:p-8 ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{t('onboarding.title')}</h1>
          <p className="text-gray-500 mt-2">{t('onboarding.steps.legal')} - {progressPercentage}%</p>
        </div>
        <Button variant="outline" onClick={handleSaveDraft} disabled={isLoading}>
          <Save className="w-4 h-4 mr-2" />
          {t('onboarding.saveDraft')}
        </Button>
      </div>

      <Progress value={progressPercentage} className="mb-8" />

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar Steps Indicator */}
        <div className="hidden lg:block w-64 shrink-0">
          <ul className="space-y-4">
            {stepsList.map((step) => (
              <li key={step.id} className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${currentStep === step.id ? 'bg-brand/10 text-brand font-bold' : currentStep > step.id ? 'text-green-600' : 'text-gray-400'}`}>
                {currentStep > step.id ? (
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                ) : (
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold border-2 ${currentStep === step.id ? 'border-brand text-brand' : 'border-gray-300'}`}>
                    {step.id}
                  </div>
                )}
                <span>{step.title}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Form Content */}
        <Card className="flex-1 shadow-sm border-0 ring-1 ring-gray-100">
          <CardHeader className="bg-gray-50/50 border-b">
            <CardTitle>{stepsList[currentStep - 1].title}</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {renderStepContent()}

            {/* Footer Navigation */}
            <div className="flex justify-between mt-10 pt-6 border-t border-gray-100">
              <Button
                variant="outline"
                onClick={handlePrev}
                disabled={currentStep === 1 || isLoading}
                className="gap-2"
              >
                {isRTL ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
                {t('onboarding.prev')}
              </Button>

              {currentStep < totalSteps ? (
                <Button 
                  onClick={handleNext} 
                  disabled={isLoading}
                  className="bg-brand hover:bg-brand-dark text-white gap-2"
                >
                  {t('onboarding.next')}
                  {isRTL ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                </Button>
              ) : (
                <Button 
                  onClick={handleSubmit} 
                  disabled={isLoading || !formData.agreedToTerms}
                  className="bg-green-600 hover:bg-green-700 text-white gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  {t('onboarding.submit')}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
