'use client';

import React, { useState, useEffect } from 'react';
import { useAdminAuthStore } from '@/lib/store/admin-auth';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { 
  Loader2, 
  Save, 
  ToggleRight, 
  AlertTriangle, 
  ShieldAlert, 
  UserX, 
  CreditCard, 
  Hammer 
} from 'lucide-react';

export default function AdminFlagsPage() {
  const { adminLocale } = useAdminAuthStore();
  const [isMounted, setIsMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // States for flags
  const [flags, setFlags] = useState({
    flag_maintenance_mode: false,
    flag_disable_registration: false,
    flag_disable_cod: false,
    flag_disable_auctions: false,
  });

  const isRTL = adminLocale === 'ar';

  const dict = {
    ar: {
      title: "مفاتيح ميزات المنصة (Kill Switches)",
      description: "تحكم فوري وقوي بميزات المنصة الحيوية وعطلها مؤقتاً في حالات الطوارئ والأمان.",
      save: "حفظ المفاتيح",
      success: "تم تحديث مفاتيح الميزات بنجاح!",
      error: "فشل تحديث المفاتيح",
      maintenanceTitle: "وضع الصيانة العام (Maintenance Mode)",
      maintenanceDesc: "عند تفعيله، سيتم إغلاق المنصة بالكامل أمام المتصفحين وعرض صفحة 'تحت الصيانة' باستثناء الإدارة.",
      registrationTitle: "تعطيل تسجيل التجار الجدد",
      registrationDesc: "أوقف عمليات التسجيل للتاجر أو المورد فوراً لتنظيم عمليات التدقيق.",
      codTitle: "تعطيل الدفع عند الاستلام (COD)",
      codDesc: "أوقف خيار الدفع عند الاستلام لإجبار المستخدمين على الدفع الإلكتروني المؤكد.",
      auctionsTitle: "تعطيل نظام المزادات",
      auctionsDesc: "قم بإيقاف المزايدات على المنتجات مؤقتاً لأسباب أمنية أو تنظيمية.",
      warningHeader: "تنبيه أمني هام",
      warningBody: "تعديل هذه المفاتيح يؤثر بشكل فوري ومباشر على جميع زوار المنصة والعمليات الجارية. يرجى التوخي الدقيق للوعي الأمني قبل التفعيل.",
    },
    en: {
      title: "Platform Feature Flags (Kill Switches)",
      description: "Instantaneous, secure switches to toggle core platform subsystems on or off.",
      save: "Save Switches",
      success: "Feature flags updated successfully!",
      error: "Failed to update feature flags",
      maintenanceTitle: "Global Maintenance Mode",
      maintenanceDesc: "When enabled, locks down standard user access with a temporary 'under maintenance' screen.",
      registrationTitle: "Disable New Seller Registration",
      registrationDesc: "Instantly halt onboardings for buyers requesting merchant status upgradations.",
      codTitle: "Disable Cash on Delivery (COD)",
      codDesc: "Prevent buyers from checking out using COD, forcing digital payment validations.",
      auctionsTitle: "Disable Bidding & Auctions",
      auctionsDesc: "Temporarily pause the auction engine and freeze current placing offers.",
      warningHeader: "Critical Admin Warning",
      warningBody: "Mutating these switches will immediately affect thousands of concurrent storefront transactions. Exercise professional caution.",
    }
  };

  const t = dict[adminLocale] || dict.ar;

  useEffect(() => {
    setIsMounted(true);
    fetchFlags();
  }, []);

  const fetchFlags = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/flags');
      const data = await res.json();
      if (data.success && data.flags) {
        setFlags(data.flags);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await fetch('/api/admin/flags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ flags }),
      });
      const data = await res.json();
      if (data.success) {
        alert(t.success);
      } else {
        alert(t.error);
      }
    } catch (e) {
      console.error(e);
      alert(t.error);
    } finally {
      setIsSaving(false);
    }
  };

  if (!isMounted) return null;

  return (
    <div className="space-y-8">
      {/* Title & Save */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black">{t.title}</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{t.description}</p>
        </div>

        <Button onClick={handleSave} className="bg-brand text-navy hover:bg-brand/90 font-bold gap-2 px-6" disabled={isSaving}>
          {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {t.save}
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-10 w-10 animate-spin text-brand" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Flags Column */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Flag 1: Maintenance Mode */}
            <Card className={`border-l-4 ${flags.flag_maintenance_mode ? 'border-l-red-500' : 'border-l-slate-200'} transition-all`}>
              <CardContent className="p-6 flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className={`p-2.5 rounded-xl ${flags.flag_maintenance_mode ? 'bg-red-50 text-red-500' : 'bg-slate-100 text-slate-500'} shrink-0`}>
                    <ShieldAlert className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base">{t.maintenanceTitle}</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">{t.maintenanceDesc}</p>
                  </div>
                </div>
                <Switch 
                  checked={flags.flag_maintenance_mode}
                  onCheckedChange={val => setFlags({ ...flags, flag_maintenance_mode: val })}
                />
              </CardContent>
            </Card>

            {/* Flag 2: Disable Registration */}
            <Card className={`border-l-4 ${flags.flag_disable_registration ? 'border-l-amber-500' : 'border-l-slate-200'} transition-all`}>
              <CardContent className="p-6 flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className={`p-2.5 rounded-xl ${flags.flag_disable_registration ? 'bg-amber-50 text-amber-500' : 'bg-slate-100 text-slate-500'} shrink-0`}>
                    <UserX className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base">{t.registrationTitle}</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">{t.registrationDesc}</p>
                  </div>
                </div>
                <Switch 
                  checked={flags.flag_disable_registration}
                  onCheckedChange={val => setFlags({ ...flags, flag_disable_registration: val })}
                />
              </CardContent>
            </Card>

            {/* Flag 3: Disable COD */}
            <Card className={`border-l-4 ${flags.flag_disable_cod ? 'border-l-amber-500' : 'border-l-slate-200'} transition-all`}>
              <CardContent className="p-6 flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className={`p-2.5 rounded-xl ${flags.flag_disable_cod ? 'bg-amber-50 text-amber-500' : 'bg-slate-100 text-slate-500'} shrink-0`}>
                    <CreditCard className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base">{t.codTitle}</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">{t.codDesc}</p>
                  </div>
                </div>
                <Switch 
                  checked={flags.flag_disable_cod}
                  onCheckedChange={val => setFlags({ ...flags, flag_disable_cod: val })}
                />
              </CardContent>
            </Card>

            {/* Flag 4: Disable Auctions */}
            <Card className={`border-l-4 ${flags.flag_disable_auctions ? 'border-l-amber-500' : 'border-l-slate-200'} transition-all`}>
              <CardContent className="p-6 flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className={`p-2.5 rounded-xl ${flags.flag_disable_auctions ? 'bg-amber-50 text-amber-500' : 'bg-slate-100 text-slate-500'} shrink-0`}>
                    <Hammer className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base">{t.auctionsTitle}</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">{t.auctionsDesc}</p>
                  </div>
                </div>
                <Switch 
                  checked={flags.flag_disable_auctions}
                  onCheckedChange={val => setFlags({ ...flags, flag_disable_auctions: val })}
                />
              </CardContent>
            </Card>

          </div>

          {/* Warning / Sidebar Column */}
          <div className="lg:col-span-1">
            <Card className="bg-red-50/50 dark:bg-red-950/20 border-red-200">
              <CardHeader>
                <CardTitle className="text-red-600 flex items-center gap-2 text-base">
                  <AlertTriangle className="h-5 w-5 animate-pulse" />
                  {t.warningHeader}
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-red-700/80 dark:text-red-400 leading-relaxed">
                {t.warningBody}
              </CardContent>
            </Card>
          </div>

        </div>
      )}
    </div>
  );
}
