'use client';

import React, { useState, useEffect } from 'react';
import { useTranslation } from '@/lib/i18n/useTranslation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { CheckCircle2, Save, ArrowRight, ArrowLeft, Store, FileText, Landmark, UserCheck, ShieldCheck } from 'lucide-react';
import LegalStep from './LegalStep';
import TaxStep from './TaxStep';
import BankStep from './BankStep';
import IdentityStep from './IdentityStep';
import TermsStep from './TermsStep';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';

export default function OnboardingWizard() {
  const { t, locale } = useTranslation();
  const router = useRouter();
  const { user } = useAuthStore();
  
  const [activeTab, setActiveTab] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<any>({});
  
  useEffect(() => {
    toast.info(
      locale === 'ar' ? 'يرجى استكمال جميع الأقسام أدناه لتفعيل حسابك' : 'Please complete all sections below to activate your account',
      { duration: 5000 }
    );
    
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
  }, []);

  const handleUpdateData = (stepData: any) => {
    setFormData((prev: any) => ({ ...prev, ...stepData }));
  };

  const handleSave = async (showToast = true) => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/seller/onboarding?userId=${user?.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user?.id, data: formData })
      });
      if (res.ok && showToast) {
        toast.success('تم حفظ التغييرات بنجاح');
      }
    } catch (e) {
      toast.error('حدث خطأ أثناء الحفظ');
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
        toast.success('تم إرسال الطلب للمراجعة بنجاح!');
        router.push('/seller?submitted=true');
      }
    } catch (e) {
      toast.error('حدث خطأ أثناء التقديم');
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
    { id: 1, title: 'السجل التجاري (تسجيل الأعمال)', icon: <Store className="w-5 h-5" />, done: hasLegal, component: <LegalStep data={formData} updateData={handleUpdateData} /> },
    { id: 2, title: 'التفاصيل الضريبية', icon: <FileText className="w-5 h-5" />, done: hasTax, component: <TaxStep data={formData} updateData={handleUpdateData} /> },
    { id: 3, title: 'طريقة الدفع', icon: <Landmark className="w-5 h-5" />, done: hasBank, component: <BankStep data={formData} updateData={handleUpdateData} /> },
    { id: 4, title: 'المفوض بالتوقيع', icon: <UserCheck className="w-5 h-5" />, done: hasIdentity, component: <IdentityStep data={formData} updateData={handleUpdateData} /> },
    { id: 5, title: 'الشروط والأحكام', icon: <ShieldCheck className="w-5 h-5" />, done: hasTerms, component: <TermsStep data={formData} updateData={handleUpdateData} /> },
  ];

  if (activeTab !== null) {
    const step = stepsList.find(s => s.id === activeTab);
    return (
      <div className={`max-w-4xl mx-auto p-4 md:p-8 ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
        <div className="mb-6 flex items-center justify-between">
          <Button 
            variant="ghost" 
            onClick={() => {
              handleSave(false);
              setActiveTab(null);
            }} 
            className="gap-2 text-gray-600 hover:text-black"
          >
            {isRTL ? <ArrowRight className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />}
            الرجوع للقائمة
          </Button>
          <Button onClick={() => handleSave(true)} disabled={isLoading} className="bg-black hover:bg-gray-800 text-white">
            حفظ التغييرات
          </Button>
        </div>

        <Card className="shadow-sm border-gray-200">
          <CardHeader className="bg-gray-50/50 border-b pb-4">
            <CardTitle className="text-xl flex items-center gap-2">
              {step?.icon}
              {step?.title}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {step?.component}
          </CardContent>
        </Card>
      </div>
    );
  }

  const isAllDone = hasLegal && hasTax && hasBank && hasIdentity && hasTerms;

  return (
    <div className={`max-w-4xl mx-auto p-4 md:p-8 ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">معلومات المتجر وتوثيق الأعمال</h1>
        <p className="text-gray-500">أكمل جميع الأقسام أدناه لتفعيل حسابك على المنصة والبدء بالبيع.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        
        {/* Navigation / Hub Links */}
        <div className="md:col-span-1 space-y-1">
          {stepsList.map(step => (
            <button
              key={step.id}
              onClick={() => setActiveTab(step.id)}
              className="w-full flex items-center justify-between p-3 rounded-lg text-start transition-colors hover:bg-gray-100"
            >
              <div className="flex items-center gap-3">
                <span className={`${step.done ? 'text-green-600' : 'text-gray-400'}`}>
                  {step.icon}
                </span>
                <span className={`font-semibold ${step.done ? 'text-gray-900' : 'text-gray-600'}`}>
                  {step.title}
                </span>
              </div>
              {step.done && <CheckCircle2 className="w-4 h-4 text-green-500" />}
            </button>
          ))}
        </div>

        {/* Status Panel */}
        <div className="md:col-span-3">
          <Card className="bg-gray-50 border-dashed border-2">
            <CardContent className="p-8 text-center flex flex-col items-center justify-center space-y-4 min-h-[300px]">
              <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-sm">
                <Store className="w-10 h-10 text-brand" />
              </div>
              <h2 className="text-2xl font-bold">مرحباً بك في شاري داي</h2>
              <p className="text-gray-500 max-w-md">
                قم بتعبئة الأقسام الجانبية وتوثيق هويتك وسجلك التجاري. بمجرد الانتهاء من جميع المتطلبات، سيظهر زر تقديم الطلب هنا.
              </p>
              
              <Button 
                size="lg"
                onClick={handleSubmit} 
                disabled={isLoading || !isAllDone}
                className={`mt-4 ${isAllDone ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-300 text-gray-500'} text-white font-bold w-full max-w-xs`}
              >
                {isLoading ? 'جاري الإرسال...' : 'تقديم للموافقة'}
              </Button>
              
              {!isAllDone && (
                <p className="text-xs text-red-500 mt-2">يجب استكمال جميع الأقسام الخمسة (✓) لتتمكن من رفع الطلب.</p>
              )}
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
}
