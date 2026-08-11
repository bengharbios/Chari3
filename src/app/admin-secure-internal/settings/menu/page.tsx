'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { Loader2, Plus, Trash2, GripVertical, ChevronDown, ChevronRight, Check } from 'lucide-react';
import { useTranslation } from '@/lib/i18n/useTranslation';

interface MenuItem {
  id: string;
  label: string;
  url: string;
  isMega: boolean;
  children: MenuItem[];
}

export default function MenuSettingsPage() {
  const { t, isAr } = useTranslation();
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchMenu();
  }, []);

  const fetchMenu = async () => {
    try {
      const res = await fetch('/api/admin/menu');
      const data = await res.json();
      if (data.success) {
        setMenu(data.menuConfig || []);
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
        body: JSON.stringify({ menuConfig: menu })
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
    setMenu([...menu, { id: generateId(), label: '', url: '', isMega: false, children: [] }]);
  };

  const updateItem = (parentId: string, childId: string | null, field: keyof MenuItem, value: any) => {
    const newMenu = [...menu];
    const parentIndex = newMenu.findIndex(i => i.id === parentId);
    if (parentIndex > -1) {
      if (!childId) {
        (newMenu[parentIndex] as any)[field] = value;
      } else {
        const childIndex = newMenu[parentIndex].children.findIndex(c => c.id === childId);
        if (childIndex > -1) {
          (newMenu[parentIndex].children[childIndex] as any)[field] = value;
        }
      }
      setMenu(newMenu);
    }
  };

  const removeItem = (parentId: string, childId: string | null) => {
    const newMenu = [...menu];
    const parentIndex = newMenu.findIndex(i => i.id === parentId);
    if (parentIndex > -1) {
      if (!childId) {
        newMenu.splice(parentIndex, 1);
      } else {
        const childIndex = newMenu[parentIndex].children.findIndex(c => c.id === childId);
        if (childIndex > -1) {
          newMenu[parentIndex].children.splice(childIndex, 1);
        }
      }
      setMenu(newMenu);
    }
  };

  const addChildItem = (parentId: string) => {
    const newMenu = [...menu];
    const parentIndex = newMenu.findIndex(i => i.id === parentId);
    if (parentIndex > -1) {
      newMenu[parentIndex].children.push({ id: generateId(), label: '', url: '', isMega: false, children: [] });
      setMenu(newMenu);
    }
  };

  if (isLoading) {
    return <div className="flex justify-center py-20"><Loader2 className="animate-spin w-8 h-8 text-primary" /></div>;
  }

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">{t('إدارة القائمة الرئيسية', 'Main Menu Management')}</h1>
          <p className="text-muted-foreground">{t('تحكم في الروابط التي تظهر في الواجهة للمستخدمين', 'Manage links appearing in the storefront')}</p>
        </div>
        <Button onClick={handleSave} disabled={isSaving} className="gap-2">
          {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
          {t('حفظ التغييرات', 'Save Changes')}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('عناصر القائمة', 'Menu Items')}</CardTitle>
          <CardDescription>
            {t('أدخل النصوص باللغة العربية، وسيتم ترجمتها تلقائياً حسب القواميس المضافة في قسم اللغات.', 'Enter texts in Arabic, they will be translated automatically based on dictionaries.')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {menu.map((item) => (
            <div key={item.id} className="border border-border rounded-lg p-4 bg-muted/20 space-y-4">
              <div className="flex gap-4 items-start">
                <GripVertical className="mt-2 text-muted-foreground cursor-grab" />
                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label>{t('اسم الرابط (بالعربية)', 'Link Name (Arabic)')}</Label>
                    <Input value={item.label} onChange={(e) => updateItem(item.id, null, 'label', e.target.value)} placeholder="مثال: الإلكترونيات" />
                  </div>
                  <div className="space-y-1">
                    <Label>{t('الرابط الموجه إليه', 'Destination URL')}</Label>
                    <Input value={item.url} onChange={(e) => updateItem(item.id, null, 'url', e.target.value)} placeholder="/category/electronics" dir="ltr" />
                  </div>
                </div>
                <div className="mt-8 flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => addChildItem(item.id)} className="gap-1">
                    <Plus className="w-4 h-4" /> {t('إضافة فرع', 'Add Child')}
                  </Button>
                  <Button variant="destructive" size="icon" onClick={() => removeItem(item.id, null)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Children */}
              {item.children.length > 0 && (
                <div className={`ms-8 ps-4 border-s-2 border-primary/20 space-y-3`}>
                  {item.children.map((child) => (
                    <div key={child.id} className="flex gap-4 items-end bg-background p-3 rounded border border-border">
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

          <Button variant="outline" className="w-full border-dashed gap-2" onClick={addParentItem}>
            <Plus className="w-4 h-4" />
            {t('إضافة قائمة رئيسية جديدة', 'Add New Main Menu')}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
