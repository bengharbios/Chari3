'use client';

import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShieldCheck, FileCheck, CheckCircle2, Clock, Upload, Building2, UserCheck, AlertCircle } from 'lucide-react';
import { useAppStore, useAuthStore } from '@/lib/store';
import { toast } from 'sonner';

export default function LogisticsDocumentsPage() {
  const { locale } = useAppStore();
  const { user } = useAuthStore();
  const isAr = locale === 'ar';
  const t = (ar: string, en: string) => isAr ? ar : en;

  const isVerified = user?.isVerified ?? true;
  // Distinguish between Carrier Company (KYB) and Individual Driver (KYC)
  const isCompanyAccount = user?.email?.includes('logistics') || user?.name?.includes('شركة') || false;

  const driverKYCDocs = [
    {
      id: 'driver_license',
      titleAr: 'رخصة السياقة البيومترية (Permis de Conduire)',
      titleEn: 'Biometric Driver License',
      descAr: 'رخصة سياقة سارية المفعول مطابقة لصنف المركبة (المادة 180 - المرسوم 04-381).',
      descEn: 'Valid driving license matching vehicle category (Article 180).',
      status: isVerified ? 'verified' : 'pending',
    },
    {
      id: 'carte_grise',
      titleAr: 'البطاقة الرمادية للمركبة/الدراجة (Carte Grise)',
      titleEn: 'Vehicle Registration (Carte Grise)',
      descAr: 'وثيقة الملكية أو عقد استخدام المركبة المسجلة باسم المندوب.',
      descEn: 'Vehicle registration document under driver name.',
      status: isVerified ? 'verified' : 'pending',
    },
    {
      id: 'insurance',
      titleAr: 'تأمين المركبة والمسؤولية المدنية (Assurance)',
      titleEn: 'Vehicle Insurance Certificate',
      descAr: 'عقد التأمين الساري لحماية البضائع والركاب أثناء التوصيل.',
      descEn: 'Active insurance coverage for delivery logistics.',
      status: isVerified ? 'verified' : 'pending',
    },
    {
      id: 'identity_card',
      titleAr: 'بطاقة الهوية الوطنية / جواز السفر البيومتري',
      titleEn: 'National ID / Biometric Passport',
      descAr: 'إثبات الهوية الشخصية للمندوب.',
      descEn: 'Personal identity verification document.',
      status: 'verified',
    },
  ];

  const companyKYBDocs = [
    {
      id: 'registre_commerce',
      titleAr: 'السجل التجاري لشركة الشحن (Registre de Commerce)',
      titleEn: 'Commercial Register (R.C)',
      descAr: 'السجل التجاري الرسمي النافذ لنشاط نقل البضائع والشحن السريع.',
      descEn: 'Official commercial registry for freight & express logistics.',
      status: isVerified ? 'verified' : 'pending',
    },
    {
      id: 'nif_nis',
      titleAr: 'الرقم التعريف الجبائي والإحصائي (NIF / NIS / ART)',
      titleEn: 'Tax Identification Number (NIF/NIS)',
      descAr: 'الوثائق والاعتمادات الجبائية الرسمية للمؤسسة اللوجستية.',
      descEn: 'Official tax identification certificate.',
      status: isVerified ? 'verified' : 'pending',
    },
    {
      id: 'transport_license',
      titleAr: 'اعتماد وزارة النقل لنشاط الشحن والتوصيل',
      titleEn: 'Ministry of Transport Logistics Accreditation',
      descAr: 'ترخيص ممارسة نشاط متعامل البريد السريع أو الشحن اللوجستي.',
      descEn: 'Ministry authorization for express courier & logistics services.',
      status: isVerified ? 'verified' : 'pending',
    },
    {
      id: 'company_bank',
      titleAr: 'كشف الحساب البنكي / البريدي للمؤسسة (RIB / RIP)',
      titleEn: 'Company Bank / RIB Certificate',
      descAr: 'كشف الحساب الرسمي لاستلام مبالغ الـ COD وتصفية الحسابات.',
      descEn: 'Official bank RIB statement for COD payouts.',
      status: 'verified',
    },
  ];

  const activeDocs = isCompanyAccount ? companyKYBDocs : driverKYCDocs;

  return (
    <DashboardLayout>
      <div className="space-y-6 text-start">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black">
                {isCompanyAccount 
                  ? t('مستندات التوثيق التجاري لشركة الشحن (KYB)', 'Carrier Company Business Documents (KYB)')
                  : t('وثائق ورخصة قيادة المندوب (KYC)', 'Driver Documents & Verification (KYC)')
                }
              </h1>
              <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 font-bold">
                {isCompanyAccount ? <Building2 className="h-3.5 w-3.5 me-1" /> : <ShieldCheck className="h-3.5 w-3.5 me-1" />}
                {isCompanyAccount ? t('حساب مؤسسة شحن موثقة', 'Verified Carrier Company') : t('سائق موثق رسمياً', 'Verified Driver')}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {isCompanyAccount
                ? t('إدارة مستندات المؤسسة، السجل التجاري R.C، والاعتماد الرسمي لنشاط نقل البضائع', 'Manage company R.C, NIF, & transport accreditation docs')
                : t('متابعة وثائق الهوية، رخصة السياقة الجزائرية (المادة 180)، وتأمين أسطول التوصيل', 'Manage identity docs, driver license (Decree 04-381), & vehicle insurance')
              }
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {activeDocs.map((doc) => (
            <Card key={doc.id} className="border-white/10 bg-background/60 backdrop-blur-xl shadow-xl rounded-3xl p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between gap-2 border-b border-border/40 pb-3">
                  <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
                    <FileCheck className="h-4 w-4 text-primary shrink-0" />
                    {isAr ? doc.titleAr : doc.titleEn}
                  </h3>
                  {doc.status === 'verified' ? (
                    <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 gap-1 shrink-0">
                      <CheckCircle2 className="h-3 w-3" />
                      {t('مقبول وموثق', 'Verified')}
                    </Badge>
                  ) : (
                    <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/20 gap-1 shrink-0">
                      <Clock className="h-3 w-3" />
                      {t('قيد التدقيق', 'Under Review')}
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-3 leading-relaxed">
                  {isAr ? doc.descAr : doc.descEn}
                </p>
              </div>

              <div className="pt-4 flex items-center justify-between border-t border-border/40 mt-4">
                <span className="text-[11px] font-mono text-muted-foreground">ISO-VERIFIED-2026</span>
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="rounded-xl text-xs font-bold gap-1.5"
                  onClick={() => toast.info(t('تم رفع وتأكيد هذه الوثيقة في النظام', 'Document is verified in system'))}
                >
                  <Upload className="h-3.5 w-3.5 text-primary" />
                  {t('إعادة رفع/تحديث', 'Re-upload')}
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
