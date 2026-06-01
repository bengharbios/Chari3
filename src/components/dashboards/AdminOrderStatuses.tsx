'use client';

import { useState, useEffect } from 'react';
import { useAppStore } from '@/lib/store';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Trash2, Edit2, Plus, Save, X, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminOrderStatuses() {
  const { locale } = useAppStore();
  const t = (ar: string, en: string) => locale === 'ar' ? ar : en;
  
  const [statuses, setStatuses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  
  const [formData, setFormData] = useState({
    key: '',
    nameAr: '',
    nameEn: '',
    color: '#6B7280',
    sortOrder: 0
  });

  const fetchStatuses = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/order-statuses');
      const data = await res.json();
      if (data.success) {
        setStatuses(data.statuses);
      }
    } catch (e) {
      toast.error(t('فشل جلب الحالات', 'Failed to fetch statuses'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchStatuses(); }, []);

  const handleEdit = (status: any) => {
    setEditingId(status.id);
    setFormData({
      key: status.key,
      nameAr: status.nameAr,
      nameEn: status.nameEn || '',
      color: status.color,
      sortOrder: status.sortOrder
    });
    setIsAdding(false);
  };

  const handleAddNew = () => {
    setEditingId(null);
    setIsAdding(true);
    setFormData({
      key: '',
      nameAr: '',
      nameEn: '',
      color: '#6B7280',
      sortOrder: statuses.length + 1
    });
  };

  const handleCancel = () => {
    setEditingId(null);
    setIsAdding(false);
  };

  const handleSave = async () => {
    if (!formData.key || !formData.nameAr) {
      return toast.error(t('يرجى تعبئة الحقول المطلوبة (المفتاح، والاسم بالعربية)', 'Please fill required fields (key, nameAr)'));
    }

    try {
      const method = isAdding ? 'POST' : 'PATCH';
      const body = isAdding ? formData : { ...formData, id: editingId };
      const res = await fetch('/api/order-statuses', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      const data = await res.json();
      
      if (data.success) {
        toast.success(t('تم الحفظ بنجاح', 'Saved successfully'));
        fetchStatuses();
        handleCancel();
      } else {
        toast.error(data.error || 'Failed to save');
      }
    } catch (e) {
      toast.error('Error saving');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t('هل أنت متأكد من حذف هذه الحالة؟', 'Are you sure you want to delete this status?'))) return;
    try {
      const res = await fetch(`/api/order-statuses?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        toast.success(t('تم الحذف بنجاح', 'Deleted successfully'));
        fetchStatuses();
      } else {
        toast.error(data.error || 'Failed to delete');
      }
    } catch (e) {
      toast.error('Error deleting');
    }
  };

  return (
    <Card className="card-surface mt-4">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-xl font-bold">{t('حالات الطلبات (ديناميكية)', 'Order Statuses (Dynamic)')}</CardTitle>
          <CardDescription>{t('إدارة الأنواع المختلفة لحالات الطلب وألوان عرضها في النظام.', 'Manage different order status types and their colors in the system.')}</CardDescription>
        </div>
        <Button onClick={handleAddNew} className="gap-2 rounded-xl">
          <Plus className="h-4 w-4" />
          {t('إضافة حالة', 'Add Status')}
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
        ) : (
          <div className="space-y-4">
            {(isAdding || editingId) && (
              <div className="p-4 bg-muted/30 rounded-xl border border-border mb-6">
                <h3 className="font-bold mb-4">{isAdding ? t('إضافة حالة جديدة', 'Add New Status') : t('تعديل حالة', 'Edit Status')}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold mb-1 block">{t('المفتاح (باللغة الإنجليزية، بدون مسافات)', 'Key (English, no spaces)')}</label>
                    <Input disabled={!!editingId} value={formData.key} onChange={e => setFormData({ ...formData, key: e.target.value })} placeholder="e.g. returned" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold mb-1 block">{t('الترتيب (الأولوية في القائمة)', 'Sort Order')}</label>
                    <Input type="number" value={formData.sortOrder} onChange={e => setFormData({ ...formData, sortOrder: parseInt(e.target.value) })} />
                  </div>
                  <div>
                    <label className="text-xs font-semibold mb-1 block">{t('الاسم (بالعربية)', 'Name (Arabic)')}</label>
                    <Input value={formData.nameAr} onChange={e => setFormData({ ...formData, nameAr: e.target.value })} placeholder="مرتجع" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold mb-1 block">{t('الاسم (بالإنجليزية)', 'Name (English)')}</label>
                    <Input value={formData.nameEn} onChange={e => setFormData({ ...formData, nameEn: e.target.value })} placeholder="Returned" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold mb-1 block">{t('لون الحالة', 'Status Color')}</label>
                    <div className="flex gap-2">
                      <Input type="color" className="w-16 h-10 p-1" value={formData.color} onChange={e => setFormData({ ...formData, color: e.target.value })} />
                      <Input value={formData.color} onChange={e => setFormData({ ...formData, color: e.target.value })} />
                    </div>
                  </div>
                </div>
                <div className="mt-4 flex gap-2">
                  <Button onClick={handleSave} className="gap-2"><Save className="h-4 w-4" /> {t('حفظ', 'Save')}</Button>
                  <Button variant="outline" onClick={handleCancel} className="gap-2"><X className="h-4 w-4" /> {t('إلغاء', 'Cancel')}</Button>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {statuses.map(s => (
                <div key={s.id} className="p-4 rounded-xl border bg-background flex items-center justify-between hover:border-primary transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-12 rounded-md" style={{ backgroundColor: s.color }}></div>
                    <div>
                      <p className="font-bold">{s.nameAr} <span className="text-xs text-muted-foreground font-normal">({s.nameEn})</span></p>
                      <p className="text-xs text-muted-foreground font-mono mt-0.5">key: {s.key}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(s)}>
                      <Edit2 className="h-4 w-4 text-primary" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(s.id)}>
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
