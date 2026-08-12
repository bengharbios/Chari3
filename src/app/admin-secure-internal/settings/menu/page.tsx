'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Loader2, Plus, Trash2, GripVertical, Check, Image as ImageIcon, ArrowUp, ArrowDown } from 'lucide-react';
import { useTranslation } from '@/lib/i18n/useTranslation';

// Dnd Kit Imports
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface MenuItem {
  id: string;
  type: 'standard' | 'categories-grid' | 'mega-custom' | 'direct-category';
  labels: Record<string, string>;
  url: string;
  imageUrls?: string[];
  categoryId?: string;
  children: MenuItem[];
  // legacy fallback
  label?: string; 
}

interface MenuWrapper {
  alignment: 'start' | 'center' | 'end';
  fontFamily: string;
  items: MenuItem[];
}

// ----------------------------------------------------
// SORTABLE PARENT COMPONENT
// ----------------------------------------------------
function SortableParentItem({ item, children, wrapper, updateItem, removeItem, addChildItem, moveChildItem, categories }: any) {
  const { t } = useTranslation();
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 10 : 1,
    position: 'relative' as any,
  };

  const getLabel = (lang: string) => (item.labels && item.labels[lang]) || '';
  
  // Legacy migration
  useEffect(() => {
    if (item.label && (!item.labels || !item.labels.ar)) {
      updateItem(item.id, null, 'labels', { ...item.labels, ar: item.label, en: '' });
    }
  }, [item]);

  return (
    <div ref={setNodeRef} style={style} className="border border-border rounded-lg p-4 bg-muted/20 space-y-4 shadow-sm relative">
      <div className="flex gap-4 items-start">
        <div {...attributes} {...listeners} className="mt-2 text-muted-foreground cursor-grab active:cursor-grabbing hover:text-primary transition-colors p-2 -ms-2">
           <GripVertical className="w-5 h-5" />
        </div>
        <div className="flex-1 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
                  <SelectItem value="direct-category">{t('ربط بتصنيف مباشر', 'Direct Category Link')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-1">
              <Label>{t('الاسم (عربي)', 'Label (Arabic)')}</Label>
              <Input value={getLabel('ar')} onChange={(e) => updateItem(item.id, null, 'labels', { ...item.labels, ar: e.target.value })} placeholder="مثال: الإلكترونيات" />
            </div>
            
            <div className="space-y-1">
              <Label>{t('الاسم (إنجليزي)', 'Label (English)')}</Label>
              <Input value={getLabel('en')} onChange={(e) => updateItem(item.id, null, 'labels', { ...item.labels, en: e.target.value })} placeholder="Ex: Electronics" />
            </div>

            {item.type !== 'categories-grid' && item.type !== 'direct-category' && (
              <div className="space-y-1">
                <Label>{t('الرابط الموجه إليه', 'Destination URL')}</Label>
                <Input 
                  value={item.url} 
                  onChange={(e) => updateItem(item.id, null, 'url', e.target.value)} 
                  placeholder="/category/electronics" 
                  dir="ltr" 
                />
              </div>
            )}

            {item.type === 'direct-category' && (
               <div className="space-y-1">
                 <Label>{t('اختر التصنيف', 'Select Category')}</Label>
                 <Select value={item.categoryId || ''} onValueChange={(v) => updateItem(item.id, null, 'categoryId', v)}>
                   <SelectTrigger><SelectValue placeholder={t('اختر...', 'Select...')} /></SelectTrigger>
                   <SelectContent>
                     {categories.map((cat: any) => (
                       <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                     ))}
                   </SelectContent>
                 </Select>
               </div>
            )}
          </div>

          {item.type === 'mega-custom' && (
            <div className="grid grid-cols-1 gap-4 p-4 bg-primary/5 rounded-md border border-primary/10">
              <div className="space-y-1 flex flex-col">
                <Label className="flex items-center gap-2 mb-2">
                  <ImageIcon className="w-4 h-4 text-muted-foreground" />
                  {t('اللافتات الإعلانية (Banners)', 'Promo Banners')}
                </Label>
                <div className="flex gap-2">
                   <Input 
                     value={item.imageUrls?.[0] || ''} 
                     onChange={(e) => {
                       const newArr = [...(item.imageUrls || ['', ''])];
                       newArr[0] = e.target.value;
                       updateItem(item.id, null, 'imageUrls', newArr);
                     }} 
                     placeholder={t("رابط الصورة الأولى", "First image URL")} 
                     dir="ltr" 
                   />
                   <Input 
                     value={item.imageUrls?.[1] || ''} 
                     onChange={(e) => {
                       const newArr = [...(item.imageUrls || ['', ''])];
                       newArr[1] = e.target.value;
                       updateItem(item.id, null, 'imageUrls', newArr);
                     }} 
                     placeholder={t("رابط الصورة الثانية (اختياري)", "Second image URL (Optional)")} 
                     dir="ltr" 
                   />
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {t('يمكنك رفع ما يصل إلى إعلانين يظهران داخل القائمة', 'You can upload up to 2 banners to show inside the menu')}
                </p>
              </div>
            </div>
          )}

          {item.type !== 'categories-grid' && item.type !== 'direct-category' && (
            <div className="pt-2 flex gap-2">
              <Button variant="outline" size="sm" onClick={() => addChildItem(item.id)} className="gap-1">
                <Plus className="w-4 h-4" /> {t('إضافة فرع', 'Add Child')}
              </Button>
            </div>
          )}
        </div>
        <div className="mt-2 flex flex-col gap-2">
          <Button variant="destructive" size="icon" onClick={() => removeItem(item.id, null)}>
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Children List */}
      {item.children && item.children.length > 0 && item.type !== 'categories-grid' && item.type !== 'direct-category' && (
        <div className="ms-8 ps-4 border-s-2 border-primary/20 space-y-3 mt-4">
          {item.children.map((child: any, cIdx: number) => {
             const getChildLabel = (lang: string) => (child.labels && child.labels[lang]) || '';
             
             // Legacy migration
             useEffect(() => {
               if (child.label && (!child.labels || !child.labels.ar)) {
                 updateItem(item.id, child.id, 'labels', { ...child.labels, ar: child.label, en: '' });
               }
             }, [child]);

             return (
               <div key={child.id} className="flex gap-4 items-end bg-background p-3 rounded border border-border shadow-sm">
                 <div className="flex flex-col gap-1">
                   <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-foreground" disabled={cIdx === 0} onClick={() => moveChildItem(item.id, cIdx, -1)}>
                     <ArrowUp className="w-3 h-3" />
                   </Button>
                   <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-foreground" disabled={cIdx === item.children.length - 1} onClick={() => moveChildItem(item.id, cIdx, 1)}>
                     <ArrowDown className="w-3 h-3" />
                   </Button>
                 </div>
                 <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
                   <div className="space-y-1">
                     <Label className="text-xs">{t('الفرع (عربي)', 'Sub (Arabic)')}</Label>
                     <Input value={getChildLabel('ar')} onChange={(e) => updateItem(item.id, child.id, 'labels', { ...child.labels, ar: e.target.value })} />
                   </div>
                   <div className="space-y-1">
                     <Label className="text-xs">{t('الفرع (إنجليزي)', 'Sub (English)')}</Label>
                     <Input value={getChildLabel('en')} onChange={(e) => updateItem(item.id, child.id, 'labels', { ...child.labels, en: e.target.value })} />
                   </div>
                   <div className="space-y-1">
                     <Label className="text-xs">{t('الرابط الفرعي', 'Sub URL')}</Label>
                     <Input value={child.url} onChange={(e) => updateItem(item.id, child.id, 'url', e.target.value)} dir="ltr" />
                   </div>
                 </div>
                 <Button variant="ghost" size="icon" onClick={() => removeItem(item.id, child.id)} className="text-destructive mb-1">
                   <Trash2 className="w-4 h-4" />
                 </Button>
               </div>
             )
          })}
        </div>
      )}
    </div>
  );
}

// ----------------------------------------------------
// MAIN PAGE COMPONENT
// ----------------------------------------------------
export default function MenuSettingsPage() {
  const { t } = useTranslation();
  const [wrapper, setWrapper] = useState<MenuWrapper>({
    alignment: 'center',
    fontFamily: 'var(--font-inter)',
    items: []
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [categories, setCategories] = useState([]);

  // Dnd-kit sensors
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  useEffect(() => {
    fetchMenu();
    fetchCategories();
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

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/categories');
      const data = await res.json();
      setCategories(data);
    } catch (err) {}
  }

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
      items: [...prev.items, { id: generateId(), type: 'standard', labels: {ar: '', en: ''}, label: '', url: '', children: [] }]
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
        newItems[parentIndex].children.push({ id: generateId(), type: 'standard', labels: {ar:'', en:''}, label: '', url: '', children: [] });
      }
      return { ...prev, items: newItems };
    });
  };

  const moveChildItem = (parentId: string, childIndex: number, direction: number) => {
     setWrapper(prev => {
        const newItems = [...prev.items];
        const pIndex = newItems.findIndex(i => i.id === parentId);
        if (pIndex > -1) {
           const targetIndex = childIndex + direction;
           const children = [...newItems[pIndex].children];
           const temp = children[childIndex];
           children[childIndex] = children[targetIndex];
           children[targetIndex] = temp;
           newItems[pIndex].children = children;
        }
        return { ...prev, items: newItems };
     });
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setWrapper((prev) => {
        const oldIndex = prev.items.findIndex(item => item.id === active.id);
        const newIndex = prev.items.findIndex(item => item.id === over.id);
        return { ...prev, items: arrayMove(prev.items, oldIndex, newIndex) };
      });
    }
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
          <h1 className="text-2xl font-bold text-primary">{t('إدارة القائمة الرئيسية (V3)', 'Advanced Mega Menu (V3)')}</h1>
          <p className="text-muted-foreground">{t('تحكم شامل في اللغات، الروابط، الإعلانات، والتصنيفات', 'Full control over languages, links, banners, and categories')}</p>
        </div>
        <Button onClick={handleSave} disabled={isSaving} className="gap-2 px-8">
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
          <CardTitle className="flex items-center gap-2">
            <GripVertical className="w-5 h-5 text-muted-foreground" />
            {t('عناصر القائمة (السحب والإفلات)', 'Menu Items (Drag & Drop)')}
          </CardTitle>
          <CardDescription>
            {t('قم بسحب العناصر لإعادة ترتيبها. يمكنك إدخال الأسماء بلغات متعددة مباشرة.', 'Drag items to reorder them. You can enter names in multiple languages directly.')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={wrapper.items.map(i => i.id)} strategy={verticalListSortingStrategy}>
              <div className="space-y-4">
                {wrapper.items.map((item) => (
                  <SortableParentItem 
                    key={item.id} 
                    item={item} 
                    wrapper={wrapper} 
                    updateItem={updateItem} 
                    removeItem={removeItem} 
                    addChildItem={addChildItem}
                    moveChildItem={moveChildItem}
                    categories={categories}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>

          <Button variant="outline" className="w-full border-dashed gap-2 h-14 mt-4" onClick={addParentItem}>
            <Plus className="w-5 h-5" />
            <span className="font-semibold text-base">{t('إضافة قائمة رئيسية جديدة', 'Add New Main Menu Item')}</span>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
