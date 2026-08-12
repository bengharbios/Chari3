'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Loader2, Plus, Trash2, GripVertical, Check, Image as ImageIcon } from 'lucide-react';
import { useTranslation } from '@/lib/i18n/useTranslation';

interface MenuItem {
  id: string;
  type: 'standard' | 'categories-grid' | 'mega-custom';
  label: string;
  url: string;
  imageUrl?: string;
  children: MenuItem[];
}

interface MenuWrapper {
  alignment: 'start' | 'center' | 'end';
  fontFamily: string;
  items: MenuItem[];
}

export default function MenuSettingsPage() {
  const { t } = useTranslation();
  const [wrapper, setWrapper] = useState<MenuWrapper>({
    alignment: 'center',
    fontFamily: 'var(--font-inter)',
    items: []
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchMenu();
  }, []);

  const fetchMenu = async () => {
    try {
      const res = await fetch('/api/admin/menu');
      const data = await res.json();
      if (data.success && data.menuConfig) {
        setWrapper(data.menuConfig);
      }
    } catch (err) {
      toast.error(t('فشل جلب القائمة', 'Failed to fetch menu'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await fetch('/api/admin/menu', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ menuConfig: wrapper })
      });
      const data = await res.json();
      if (data.success) {
        toast.success(t('تم حفظ القائمة بنجاح', 'Menu saved successfully'));
      } else {
        toast.error(data.error || 'Error saving menu');
      }
    } catch (err) {
      toast.error(t('فشل حفظ القائمة', 'Failed to save menu'));
    } finally {
      setIsSaving(false);
    }
  };

  const generateId = () => Math.random().toString(36).substring(2, 9);

  const addParentItem = () => {
    setWrapper(prev => ({
      ...prev,
      items: [...prev.items, { id: generateId(), type: 'standard', label: '', url: '', children: [] }]
    }));
  };

  const updateItem = (parentId: string, childId: string | null, field: keyof MenuItem, value: any) => {
    setWrapper(prev => {
      const newItems = [...prev.items];
      const parentIndex = newItems.findIndex(i => i.id === parentId);
      if (parentIndex > -1) {
        if (!childId) {
          (newItems[parentIndex] as any)[field] = value;
          // Clean up fields based on type
          if (field === 'type') {
            if (value === 'categories-grid') {
              newItems[parentIndex].url = '/categories';
              newItems[parentIndex].children = [];
            }
          }
        } else {
          const childIndex = newItems[parentIndex].children.findIndex(c => c.id === childId);
          if (childIndex > -1) {
            (newItems[parentIndex].children[childIndex] as any)[field] = value;
          }
        }
      }
      return { ...prev, items: newItems };
    });
  };

  const removeItem = (parentId: string, childId: string | null) => {
    setWrapper(prev => {
      const newItems = [...prev.items];
      const parentIndex = newItems.findIndex(i => i.id === parentId);
      if (parentIndex > -1) {
        if (!childId) {
          newItems.splice(parentIndex, 1);
        } else {
          const childIndex = newItems[parentIndex].children.findIndex(c => c.id === childId);
          if (childIndex > -1) {
            newItems[parentIndex].children.splice(childIndex, 1);
          }
        }
      }
      return { ...prev, items: newItems };
    });
  };

  const addChildItem = (parentId: string) => {
    setWrapper(prev => {
      const newItems = [...prev.items];
      const parentIndex = newItems.findIndex(i => i.id === parentId);
      if (parentIndex > -1) {
        newItems[parentIndex].children.push({ id: generateId(), type: 'standard', label: '', url: '', children: [] });
      }
      return { ...prev, items: newItems };
    });
  };

  const setAlignment = (val: 'start'|'center'|'end') => setWrapper(p => ({ ...p, alignment: val }));
  const setFont = (val: string) => setWrapper(p => ({ ...p, fontFamily: val }));

  if (isLoading) {
    return <div className="flex justify-center py-20"><Loader2 className="animate-spin w-8 h-8 text-primary" /></div>;
  }

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">{t('إدارة القائمة الرئيسية المتقدمة', 'Advanced Mega Menu')}</h1>
          <p className="text-muted-foreground">{t('تحكم في الروابط والتصميم للقائمة العلوية', 'Manage links and design for the top navigation')}</p>
        </div>
        <Button onClick={handleSave} disabled={isSaving} className="gap-2">
          {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
          {t('حفظ التغييرات', 'Save Changes')}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('إعدادات التصميم العامة', 'Global Design Settings')}</CardTitle>
          <CardDescription>
            {t('اختر طريقة محاذاة القائمة ونوع الخط الذي تفضله', 'Choose the menu alignment and your preferred font')}
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label>{t('محاذاة القائمة', 'Menu Alignment')}</Label>
            <Select value={wrapper.alignment} onValueChange={setAlignment as any}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="start">{t('في البداية (Start)', 'Start')}</SelectItem>
                <SelectItem value="center">{t('توسيط (Center)', 'Center')}</SelectItem>
                <SelectItem value="end">{t('في النهاية (End)', 'End')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>{t('نوع الخط للقائمة', 'Menu Font Family')}</Label>
            <Select value={wrapper.fontFamily} onValueChange={setFont}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="var(--font-inter)">Inter (Default)</SelectItem>
                <SelectItem value="var(--font-cairo)">Cairo</SelectItem>
                <SelectItem value="var(--font-tajawal)">Tajawal</SelectItem>
                <SelectItem value="system-ui">System Default</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('عناصر القائمة', 'Menu Items')}</CardTitle>
          <CardDescription>
            {t('أضف الروابط أو استخدم ميزات Mega Menu لعرض شبكة تصنيفات أو إعلانات.', 'Add links or use Mega Menu features to show category grids or banners.')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {wrapper.items.map((item) => (
            <div key={item.id} className="border border-border rounded-lg p-4 bg-muted/20 space-y-4 shadow-sm">
              <div className="flex gap-4 items-start">
                <GripVertical className="mt-2 text-muted-foreground cursor-grab" />
                <div className="flex-1 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <Label className="text-primary font-semibold">{t('نوع العنصر', 'Item Type')}</Label>
                      <Select value={item.type || 'standard'} onValueChange={(v) => updateItem(item.id, null, 'type', v)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="standard">{t('رابط عادي / قائمة بسيطة', 'Standard Link / Dropdown')}</SelectItem>
                          <SelectItem value="categories-grid">{t('شبكة التصنيفات التلقائية', 'Auto Categories Grid')}</SelectItem>
                          <SelectItem value="mega-custom">{t('قائمة ضخمة مخصصة', 'Custom Mega Menu')}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1">
                      <Label>{t('اسم الرابط (المفتاح)', 'Link Name (Translation Key)')}</Label>
                      <Input value={item.label} onChange={(e) => updateItem(item.id, null, 'label', e.target.value)} placeholder="مثال: الإلكترونيات" />
                    </div>
                    <div className="space-y-1">
                      <Label>{t('الرابط الموجه إليه', 'Destination URL')}</Label>
                      <Input 
                        value={item.url} 
                        onChange={(e) => updateItem(item.id, null, 'url', e.target.value)} 
                        disabled={item.type === 'categories-grid'}
                        placeholder="/category/electronics" 
                        dir="ltr" 
                      />
                    </div>
                  </div>

                  {item.type === 'mega-custom' && (
                    <div className="grid grid-cols-1 gap-4 p-4 bg-primary/5 rounded-md border border-primary/10">
                      <div className="space-y-1">
                        <Label className="flex items-center gap-2">
                          <ImageIcon className="w-4 h-4 text-muted-foreground" />
                          {t('رابط صورة اللافتة الإعلانية (اختياري)', 'Promo Banner Image URL (Optional)')}
                        </Label>
                        <Input 
                          value={item.imageUrl || ''} 
                          onChange={(e) => updateItem(item.id, null, 'imageUrl', e.target.value)} 
                          placeholder="https://example.com/banner.jpg" 
                          dir="ltr" 
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          {t('ستظهر الصورة بجانب القوائم الفرعية في الـ Mega Menu', 'Image will appear next to submenus in the Mega Menu')}
                        </p>
                      </div>
                    </div>
                  )}

                  {item.type !== 'categories-grid' && (
                    <div className="pt-2 flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => addChildItem(item.id)} className="gap-1">
                        <Plus className="w-4 h-4" /> {t('إضافة فرع', 'Add Child')}
                      </Button>
                    </div>
                  )}
                </div>
                <div className="mt-2">
                  <Button variant="destructive" size="icon" onClick={() => removeItem(item.id, null)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Children */}
              {item.children && item.children.length > 0 && item.type !== 'categories-grid' && (
                <div className="ms-8 ps-4 border-s-2 border-primary/20 space-y-3">
                  {item.children.map((child) => (
                    <div key={child.id} className="flex gap-4 items-end bg-background p-3 rounded border border-border shadow-sm">
                      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <Label className="text-xs">{t('الاسم الفرعي', 'Sub Name')}</Label>
                          <Input value={child.label} onChange={(e) => updateItem(item.id, child.id, 'label', e.target.value)} />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">{t('الرابط الفرعي', 'Sub URL')}</Label>
                          <Input value={child.url} onChange={(e) => updateItem(item.id, child.id, 'url', e.target.value)} dir="ltr" />
                        </div>
                      </div>
                      <Button variant="ghost" size="icon" onClick={() => removeItem(item.id, child.id)} className="text-destructive">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}

          <Button variant="outline" className="w-full border-dashed gap-2 h-12" onClick={addParentItem}>
            <Plus className="w-5 h-5" />
            <span className="font-semibold">{t('إضافة قائمة رئيسية جديدة', 'Add New Main Menu Item')}</span>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
