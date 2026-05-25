'use client';

import { useAppStore } from '@/lib/store';
import { PageHeader } from '@/components/shared/StatsCard';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  Settings, Store, Image as ImageIcon, MapPin, Truck, CreditCard, Bell, Save, Globe, Smartphone
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const STAGGER_CONTAINER = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const FADE_UP = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
};

export default function StoreSettingsPage() {
  const { locale } = useAppStore();
  const t = (ar: string, en: string) => locale === 'ar' ? ar : en;
  const isAr = locale === 'ar';

  return (
    <motion.div 
      className="space-y-6 p-4 md:p-6 text-start"
      variants={STAGGER_CONTAINER}
      initial="hidden"
      animate="visible"
    >
      <motion.div variants={FADE_UP} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <PageHeader
          title={t('إعدادات المتجر (Store Settings)', 'Store Settings')}
          description={t('إدارة الهوية البصرية، خيارات الشحن، الدفع، وإعدادات الإشعارات.', 'Manage brand identity, shipping options, payments, and notifications.')}
        />
        <Button className="rounded-xl font-bold bg-gradient-to-r from-primary to-primary/80 shadow-lg shadow-primary/20 hover:scale-105 transition-all">
          <Save className="h-4 w-4 me-2" />
          {t('حفظ التغييرات', 'Save Changes')}
        </Button>
      </motion.div>

      <motion.div variants={FADE_UP}>
        <Tabs defaultValue="general" className="w-full">
          <div className="overflow-x-auto hide-scrollbar mb-6">
            <TabsList className="bg-background/60 backdrop-blur-md border border-white/10 rounded-xl p-1 h-auto flex w-max min-w-full">
              <TabsTrigger value="general" className="rounded-lg py-2.5 px-4 font-bold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground flex gap-2">
                <Store className="h-4 w-4" /> {t('عام', 'General')}
              </TabsTrigger>
              <TabsTrigger value="shipping" className="rounded-lg py-2.5 px-4 font-bold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground flex gap-2">
                <Truck className="h-4 w-4" /> {t('الشحن والتوصيل', 'Shipping')}
              </TabsTrigger>
              <TabsTrigger value="payment" className="rounded-lg py-2.5 px-4 font-bold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground flex gap-2">
                <CreditCard className="h-4 w-4" /> {t('المدفوعات', 'Payments')}
              </TabsTrigger>
              <TabsTrigger value="notifications" className="rounded-lg py-2.5 px-4 font-bold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground flex gap-2">
                <Bell className="h-4 w-4" /> {t('الإشعارات', 'Notifications')}
              </TabsTrigger>
            </TabsList>
          </div>

          {/* General Tab */}
          <TabsContent value="general" className="mt-0 outline-none">
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              
              {/* Basic Info */}
              <div className="xl:col-span-2 space-y-6">
                <Card className="border-white/10 bg-background/60 backdrop-blur-xl shadow-xl rounded-3xl">
                  <CardHeader>
                    <CardTitle className="text-lg">{t('المعلومات الأساسية', 'Basic Information')}</CardTitle>
                    <CardDescription>{t('ستظهر هذه المعلومات لعملائك في صفحة المتجر.', 'This will be displayed to customers on your storefront.')}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>{t('اسم المتجر (بالعربية)', 'Store Name (Arabic)')}</Label>
                        <Input defaultValue="متجر إلكترونيات تيك" className="bg-muted/30 border-white/10 rounded-xl" />
                      </div>
                      <div className="space-y-2">
                        <Label>{t('اسم المتجر (بالإنجليزية)', 'Store Name (English)')}</Label>
                        <Input defaultValue="Tech Electronics Store" className="bg-muted/30 border-white/10 rounded-xl" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>{t('وصف المتجر', 'Store Description')}</Label>
                      <Textarea 
                        rows={4} 
                        defaultValue={isAr ? "أفضل متجر لبيع الإلكترونيات والأجهزة الذكية بضمان سنتين وتوصيل سريع." : "The best store for electronics and smart devices with 2 years warranty and fast delivery."}
                        className="bg-muted/30 border-white/10 rounded-xl resize-none"
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-white/10 bg-background/60 backdrop-blur-xl shadow-xl rounded-3xl">
                  <CardHeader>
                    <CardTitle className="text-lg">{t('بيانات التواصل', 'Contact Info')}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>{t('البريد الإلكتروني للعملاء', 'Customer Support Email')}</Label>
                        <Input defaultValue="support@techstore.com" className="bg-muted/30 border-white/10 rounded-xl" />
                      </div>
                      <div className="space-y-2">
                        <Label>{t('رقم الهاتف', 'Phone Number')}</Label>
                        <Input defaultValue="+213 555 1234" className="bg-muted/30 border-white/10 rounded-xl text-start" dir="ltr" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>{t('العنوان الفعلي', 'Physical Address')}</Label>
                      <div className="relative">
                        <MapPin className={`absolute ${isAr ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground`} />
                        <Input defaultValue="شارع ديدوش مراد، الجزائر العاصمة" className={`bg-muted/30 border-white/10 rounded-xl ${isAr ? 'pr-9' : 'pl-9'}`} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Branding */}
              <div className="space-y-6">
                <Card className="border-white/10 bg-background/60 backdrop-blur-xl shadow-xl rounded-3xl">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <ImageIcon className="h-5 w-5 text-primary" />
                      {t('الهوية البصرية', 'Brand Identity')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-3">
                      <Label>{t('شعار المتجر (Logo)', 'Store Logo')}</Label>
                      <div className="flex items-center gap-4">
                        <div className="h-20 w-20 rounded-2xl bg-muted/50 border-2 border-dashed border-border/50 flex items-center justify-center">
                          <Store className="h-8 w-8 text-muted-foreground/50" />
                        </div>
                        <Button variant="outline" className="rounded-xl border-white/10 bg-background/50">{t('تغيير الشعار', 'Change Logo')}</Button>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <Label>{t('صورة الغلاف (Banner)', 'Cover Banner')}</Label>
                      <div className="h-28 w-full rounded-2xl bg-gradient-to-r from-blue-500/20 to-purple-500/20 border-2 border-dashed border-border/50 flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-muted/20 transition-colors">
                        <ImageIcon className="h-6 w-6 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground font-medium">{t('اضغط لرفع صورة جديدة', 'Click to upload')} (1200x400)</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-white/10 bg-gradient-to-br from-primary/10 to-transparent backdrop-blur-xl shadow-xl rounded-3xl">
                  <CardContent className="p-6">
                    <h3 className="font-black mb-2 flex items-center gap-2">
                      <Globe className="h-4 w-4 text-primary" />
                      {t('حالة المتجر', 'Store Status')}
                    </h3>
                    <div className="flex items-center justify-between p-3 bg-background/50 rounded-xl border border-white/5">
                      <div>
                        <p className="font-bold text-sm">{t('نشر المتجر', 'Publish Store')}</p>
                        <p className="text-xs text-muted-foreground">{t('متاح للزوار', 'Visible to visitors')}</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Placeholder for other tabs */}
          <TabsContent value="shipping" className="mt-0">
             <Card className="border-white/10 bg-background/60 backdrop-blur-xl shadow-xl rounded-3xl h-[400px] flex items-center justify-center">
               <p className="font-bold text-muted-foreground flex items-center gap-2">
                 <Truck className="h-5 w-5" /> {t('إعدادات الشحن قيد التطوير...', 'Shipping settings under development...')}
               </p>
             </Card>
          </TabsContent>
          <TabsContent value="payment" className="mt-0">
             <Card className="border-white/10 bg-background/60 backdrop-blur-xl shadow-xl rounded-3xl h-[400px] flex items-center justify-center">
               <p className="font-bold text-muted-foreground flex items-center gap-2">
                 <CreditCard className="h-5 w-5" /> {t('بوابات الدفع قيد التطوير...', 'Payment gateways under development...')}
               </p>
             </Card>
          </TabsContent>
          <TabsContent value="notifications" className="mt-0">
             <Card className="border-white/10 bg-background/60 backdrop-blur-xl shadow-xl rounded-3xl h-[400px] flex items-center justify-center">
               <p className="font-bold text-muted-foreground flex items-center gap-2">
                 <Bell className="h-5 w-5" /> {t('إعدادات التنبيهات قيد التطوير...', 'Notification settings under development...')}
               </p>
             </Card>
          </TabsContent>

        </Tabs>
      </motion.div>
    </motion.div>
  );
}
