'use client';

import React, { useState, useEffect } from 'react';
import { useAppStore } from '@/lib/store';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Plus, Trash2, Edit2, CreditCard, Banknote, Landmark, Smartphone, Loader2, Save } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const ICON_MAP: Record<string, React.ReactNode> = {
  CreditCard: <CreditCard className="h-5 w-5" />,
  Banknote: <Banknote className="h-5 w-5" />,
  Landmark: <Landmark className="h-5 w-5" />,
  Smartphone: <Smartphone className="h-5 w-5" />,
};

export default function AdminPaymentMethods() {
  const { locale } = useAppStore();
  const isRTL = locale === 'ar';
  
  const [methods, setMethods] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMethod, setEditingMethod] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    nameEn: '',
    type: 'cod',
    icon: 'CreditCard',
    fee: '0',
    isActive: true,
    configSchema: '',
  });

  const fetchMethods = async () => {
    try {
      const res = await fetch('/api/admin/payment-methods');
      const data = await res.json();
      if (data.success) {
        setMethods(data.methods);
      }
    } catch (error) {
      toast.error('Failed to load payment methods');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMethods();
  }, []);

  const handleOpenModal = (method?: any) => {
    if (method) {
      setEditingMethod(method);
      setFormData({
        name: method.name,
        nameEn: method.nameEn || '',
        type: method.type,
        icon: method.icon,
        fee: String(method.fee),
        isActive: method.isActive,
        configSchema: method.configSchema || '',
      });
    } else {
      setEditingMethod(null);
      setFormData({
        name: '',
        nameEn: '',
        type: 'cod',
        icon: 'CreditCard',
        fee: '0',
        isActive: true,
        configSchema: '',
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const url = '/api/admin/payment-methods';
      const method = editingMethod ? 'PUT' : 'POST';
      const payload = { ...formData, id: editingMethod?.id };

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        toast.success('تم حفظ طريقة الدفع بنجاح');
        fetchMethods();
        setIsModalOpen(false);
      } else {
        toast.error(data.error || 'Failed to save');
      }
    } catch (error) {
      toast.error('حدث خطأ');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف طريقة الدفع هذه؟')) return;
    
    try {
      const res = await fetch(`/api/admin/payment-methods?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        toast.success('تم الحذف بنجاح');
        fetchMethods();
      } else {
        toast.error(data.error);
      }
    } catch (error) {
      toast.error('حدث خطأ');
    }
  };

  return (
    <div className="p-6 space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold font-cairo">طرق الدفع (Payment Methods)</h1>
          <p className="text-muted-foreground">قم بإدارة طرق الدفع المتاحة في المنصة للتجار</p>
        </div>
        <Button onClick={() => handleOpenModal()} className="gap-2">
          <Plus className="h-4 w-4" />
          إضافة طريقة دفع
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center p-12"><Loader2 className="h-8 w-8 animate-spin" /></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {methods.map((method) => (
            <Card key={method.id} className={method.isActive ? 'border-primary/50' : 'opacity-70'}>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div className="p-3 bg-muted rounded-xl">
                    {ICON_MAP[method.icon] || <CreditCard className="h-5 w-5" />}
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="icon" onClick={() => handleOpenModal(method)}>
                      <Edit2 className="h-4 w-4 text-blue-500" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(method.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
                <CardTitle className="mt-4">{isRTL ? method.name : (method.nameEn || method.name)}</CardTitle>
                <CardDescription>النوع: {method.type}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">الرسوم الإضافية:</span>
                  <span className="font-bold text-red-500">{method.fee > 0 ? `+${method.fee} د.إ` : 'مجاناً'}</span>
                </div>
                <div className="flex justify-between items-center text-sm mt-2">
                  <span className="text-muted-foreground">الحالة:</span>
                  <span className={method.isActive ? "text-green-500 font-bold" : "text-gray-500 font-bold"}>
                    {method.isActive ? 'مفعل' : 'معطل'}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
          {methods.length === 0 && (
            <div className="col-span-full text-center p-12 border border-dashed rounded-xl text-muted-foreground">
              لا توجد طرق دفع مضافة. قم بإضافة طريقة دفع لتبدأ.
            </div>
          )}
        </div>
      )}

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent aria-describedby={undefined} className="sm:max-w-[500px]" dir={isRTL ? 'rtl' : 'ltr'}>
          <DialogHeader>
            <DialogTitle>{editingMethod ? 'تعديل طريقة الدفع' : 'إضافة طريقة دفع جديدة'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">الاسم (عربي)</label>
              <Input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="مثال: الدفع عند الاستلام" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">الاسم (انجليزي)</label>
              <Input value={formData.nameEn} onChange={e => setFormData({...formData, nameEn: e.target.value})} placeholder="e.g. Cash on Delivery" />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">نوع الدفع (Type)</label>
                <select 
                  value={formData.type} 
                  onChange={(e) => setFormData({...formData, type: e.target.value})}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <option value="cod">دفع عند الاستلام (COD)</option>
                  <option value="credit_card">بطاقة ائتمانية (Card)</option>
                  <option value="chargily_pay">البطاقة الذهبية / CIB (Chargily)</option>
                  <option value="installments">تقسيط (Tabby/Tamara/etc)</option>
                  <option value="wallet">محفظة إلكترونية</option>
                  <option value="bank_transfer">تحويل بنكي</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">الأيقونة (Icon)</label>
                <select 
                  value={formData.icon} 
                  onChange={(e) => setFormData({...formData, icon: e.target.value})}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <option value="CreditCard">بطاقة بنكية</option>
                  <option value="Banknote">أوراق نقدية (كاش)</option>
                  <option value="Landmark">مبنى بنك</option>
                  <option value="Smartphone">هاتف (أبل باي / الخ)</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">رسوم إضافية للمشتري (اختياري)</label>
              <Input type="number" step="0.01" value={formData.fee} onChange={e => setFormData({...formData, fee: e.target.value})} placeholder="0.00" />
            </div>

            {formData.type === 'chargily_pay' && (
              <div className="space-y-2 border p-3 rounded-lg bg-muted/20">
                <label className="text-sm font-medium">إعدادات Chargily Pay (JSON)</label>
                <textarea 
                  className="w-full text-sm border p-2 rounded-md font-mono bg-background text-foreground"
                  rows={4}
                  value={formData.configSchema}
                  onChange={e => setFormData({...formData, configSchema: e.target.value})}
                  placeholder='{"secretKey": "test_sk_...", "publicKey": "test_pk_..."}'
                  dir="ltr"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  أدخل إعدادات الربط بصيغة JSON. ستحتاج إلى Secret Key لإجراء الدفع.
                </p>
              </div>
            )}

            <div className="flex items-center justify-between border p-3 rounded-lg mt-4">
              <span className="font-medium text-sm">تفعيل الطريقة</span>
              <Switch checked={formData.isActive} onCheckedChange={(c) => setFormData({...formData, isActive: c})} />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>إلغاء</Button>
              <Button type="submit" disabled={isSubmitting} className="gap-2">
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                حفظ التغييرات
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
