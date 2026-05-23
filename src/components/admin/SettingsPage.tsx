'use client';

import { useState, useEffect } from 'react';
import { useAppStore } from '@/lib/store';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { Settings, Save, Loader2 } from 'lucide-react';

export default function SettingsPage() {
  const { locale, setAllowGuestCheckout, allowGuestCheckout } = useAppStore();
  const dir = locale === 'ar' ? 'rtl' : 'ltr';

  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [localGuestCheckout, setLocalGuestCheckout] = useState(allowGuestCheckout);

  useEffect(() => {
    setLocalGuestCheckout(allowGuestCheckout);
  }, [allowGuestCheckout]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          settings: {
            allow_guest_checkout: localGuestCheckout.toString(),
          },
        }),
      });
      
      const data = await res.json();
      if (data.success) {
        toast.success(
          locale === 'ar' 
            ? 'تم حفظ الإعدادات بنجاح' 
            : 'Settings saved successfully'
        );
        setAllowGuestCheckout(localGuestCheckout);
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      toast.error(
        locale === 'ar' 
          ? 'فشل حفظ الإعدادات' 
          : 'Failed to save settings'
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div dir={dir} className="space-y-6 text-start">
      <div className="flex items-center gap-2 mb-6">
        <Settings className="h-6 w-6 text-brand" />
        <div>
          <h1 className="text-2xl font-black">
            {locale === 'ar' ? 'إعدادات النظام' : 'System Settings'}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {locale === 'ar' 
              ? 'التحكم في الإعدادات العامة للمنصة' 
              : 'Manage platform global settings'}
          </p>
        </div>
      </div>

      <div className="grid gap-6">
        {/* Checkout Settings */}
        <Card className="card-surface">
          <CardHeader>
            <CardTitle className="text-lg font-bold">
              {locale === 'ar' ? 'إعدادات الدفع والشراء' : 'Checkout Settings'}
            </CardTitle>
            <CardDescription>
              {locale === 'ar' 
                ? 'تكوين خيارات الشراء للزوار والأعضاء' 
                : 'Configure purchase options for guests and members'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-muted/30 rounded-xl border">
              <div>
                <p className="font-bold text-foreground">
                  {locale === 'ar' ? 'السماح بالشراء للزوار (Guest Checkout)' : 'Allow Guest Checkout'}
                </p>
                <p className="text-xs text-muted-foreground mt-1 max-w-[80%]">
                  {locale === 'ar' 
                    ? 'عند التفعيل، يمكن للمستخدمين غير المسجلين إتمام الطلبات وتتبعها.' 
                    : 'When enabled, unregistered users can complete orders.'}
                </p>
              </div>
              <Switch 
                checked={localGuestCheckout} 
                onCheckedChange={setLocalGuestCheckout} 
                className="data-[state=checked]:bg-brand"
              />
            </div>

            <div className="flex justify-end pt-4">
              <Button 
                onClick={handleSave} 
                disabled={isSaving}
                className="gradient-brand text-navy font-bold gap-2"
              >
                {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                {locale === 'ar' ? 'حفظ التغييرات' : 'Save Changes'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
