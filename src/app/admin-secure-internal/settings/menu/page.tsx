'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Loader2, Plus, Trash2, GripVertical, Check, ChevronDown, ChevronUp } from 'lucide-react';
import { useTranslation } from '@/lib/i18n/useTranslation';
import { ImageUploader } from '@/components/ui/ImageUploader';
import { useTranslationStore } from '@/lib/store/translation-store';

// Dnd Kit Imports
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface MenuItem {
  id: string;
  type: 'standard' | 'categories-grid' | 'mega-custom' | 'direct-category';
  labels: Record<string, string>;
  url: string;
  iconUrl?: string;
  imageUrls?: string[];
  categoryId?: string;
  children: MenuItem[];
  label?: string; 
}

interface MenuWrapper {
  alignment: 'start' | 'center' | 'end';
  fontFamily: string;
  items: MenuItem[];
}

interface FlatMenuItem extends Omit<MenuItem, 'children'> {
  parentId: string | null;
}

export function flattenTree(items: MenuItem[], parentId: string | null = null): FlatMenuItem[] {
  let result: FlatMenuItem[] = [];
  for (const item of items) {
    const { children, ...rest } = item;
    result.push({ ...rest, parentId });
    if (children && children.length > 0) {
      result = result.concat(flattenTree(children, item.id));
    }
  }
  return result;
}

export function buildTree(flatItems: FlatMenuItem[]): MenuItem[] {
  const itemMap = new Map<string, MenuItem>();
  const rootItems: MenuItem[] = [];

  for (const flat of flatItems) {
    const { parentId, ...rest } = flat;
    itemMap.set(flat.id, { ...rest, children: [] });
  }

  for (const flat of flatItems) {
    const item = itemMap.get(flat.id)!;
    if (flat.parentId && itemMap.has(flat.parentId)) {
      itemMap.get(flat.parentId)!.children.push(item);
    } else {
      rootItems.push(item);
    }
  }

  return rootItems;
}

function SortableParentItem({ item, depth, allItems, updateItem, removeItem, categories, languages }: any) {
  const { t } = useTranslation();
  const [isExpanded, setIsExpanded] = useState(false);
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 10 : 1,
    position: 'relative' as any,
    marginInlineStart: `${depth * 2}rem`,
  };

  const getLabel = (lang: string) => (item.labels && item.labels[lang]) || '';
  const currentPrimaryLabel = getLabel('ar') || getLabel('en') || t('عنصر جديد', 'New Item');
  
  useEffect(() => {
    if (item.label && (!item.labels || !item.labels.ar)) {
      updateItem(item.id, 'labels', { ...item.labels, ar: item.label, en: '' });
    }
  }, [item]);

  const getDescendants = (parentId: string): string[] => {
    const children = allItems.filter((i: any) => i.parentId === parentId).map((i: any) => i.id);
    let desc = [...children];
    for (const childId of children) desc = desc.concat(getDescendants(childId));
    return desc;
  };
  const invalidParents = [item.id, ...getDescendants(item.id)];
  const possibleParents = allItems.filter((i: any) => !invalidParents.includes(i.id));

  return (
    <div ref={setNodeRef} style={style} className={`border border-border rounded-lg p-4 shadow-sm relative transition-all duration-300 ${depth > 0 ? 'bg-background' : 'bg-muted/20'}`}>
      <div className="flex items-center gap-4">
        <div {...attributes} {...listeners} className="text-muted-foreground cursor-grab active:cursor-grabbing hover:text-primary transition-colors p-2 -ms-2">
           <GripVertical className="w-5 h-5" />
        </div>
        <div className="flex-1 font-semibold text-lg flex items-center gap-3">
          <span>{depth > 0 ? `↳ ${currentPrimaryLabel}` : currentPrimaryLabel}</span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
            {item.type}
          </span>
        </div>
        <Button variant="ghost" size="icon" onClick={() => setIsExpanded(!isExpanded)}>
          {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </Button>
        <Button variant="destructive" size="icon" onClick={() => removeItem(item.id)}>
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>

      {isExpanded && (
        <div className="mt-4 pt-4 border-t border-border/50 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-1">
              <Label className="text-primary font-semibold">{t('نوع العنصر', 'Item Type')}</Label>
              <Select value={item.type || 'standard'} onValueChange={(v) => updateItem(item.id, 'type', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="standard">{t('رابط عادي / قائمة بسيطة', 'Standard Link / Dropdown')}</SelectItem>
                  <SelectItem value="categories-grid">{t('شبكة التصنيفات التلقائية', 'Auto Categories Grid')}</SelectItem>
                  <SelectItem value="mega-custom">{t('قائمة ضخمة مخصصة', 'Custom Mega Menu')}</SelectItem>
                  <SelectItem value="direct-category">{t('ربط بتصنيف مباشر', 'Direct Category Link')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-1">
              <Label className="text-primary font-semibold">{t('تضمين تحت (الرابط الأب)', 'Parent Menu')}</Label>
              <Select value={item.parentId || 'none'} onValueChange={(v) => updateItem(item.id, 'parentId', v === 'none' ? null : v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none" className="font-bold text-primary">{t('-- بدون أب (عنوان رئيسي) --', '-- No Parent (Top Level) --')}</SelectItem>
                  {possibleParents.map((pItem: any) => (
                    <SelectItem key={pItem.id} value={pItem.id}>
                      {(pItem.labels && pItem.labels.ar) || pItem.label || 'Item'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {languages.map((lang: any) => (
              <div className="space-y-1" key={lang.code}>
                <Label>{t(`الاسم (${lang.name})`, `Label (${lang.nameEn})`)}</Label>
                <Input 
                  value={getLabel(lang.code)} 
                  onChange={(e) => updateItem(item.id, 'labels', { ...item.labels, [lang.code]: e.target.value })} 
                  dir={lang.direction}
                />
              </div>
            ))}

            {item.type !== 'categories-grid' && item.type !== 'direct-category' && (
              <div className="space-y-1">
                <Label>{t('الرابط الموجه إليه', 'Destination URL')}</Label>
                <Input 
                  value={item.url} 
                  onChange={(e) => updateItem(item.id, 'url', e.target.value)} 
                  placeholder="/category/electronics" 
                  dir="ltr" 
                />
              </div>
            )}

            {item.type === 'direct-category' && (
               <div className="space-y-1">
                 <Label>{t('اختر التصنيف', 'Select Category')}</Label>
                 <Select value={item.categoryId || ''} onValueChange={(v) => updateItem(item.id, 'categoryId', v)}>
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

          <div className="bg-background border border-border/50 rounded-xl p-4 shadow-sm">
             <ImageUploader 
               label={t('أيقونة الرابط (اختياري)', 'Menu Icon (Optional)')}
               value={item.iconUrl || ''}
               onChange={(val) => updateItem(item.id, 'iconUrl', val)}
             />
          </div>

          {(item.type === 'mega-custom' || item.type === 'direct-category') && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-primary/5 rounded-md border border-primary/10">
               <div>
                 <ImageUploader 
                   label={t("اللافتة الأولى (Banner 1)", "Banner 1")}
                   value={item.imageUrls?.[0] || ''}
                   onChange={(val) => {
                     const newArr = [...(item.imageUrls || ['', ''])];
                     newArr[0] = val;
                     updateItem(item.id, 'imageUrls', newArr);
                   }}
                 />
               </div>
               <div>
                 <ImageUploader 
                   label={t("اللافتة الثانية (Banner 2 - اختياري)", "Banner 2 (Optional)")}
                   value={item.imageUrls?.[1] || ''}
                   onChange={(val) => {
                     const newArr = [...(item.imageUrls || ['', ''])];
                     newArr[1] = val;
                     updateItem(item.id, 'imageUrls', newArr);
                   }}
                 />
               </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function MenuSettingsPage() {
  const { t } = useTranslation();
  const { languages, loadTranslations } = useTranslationStore();
  
  const [fontFamily, setFontFamily] = useState('var(--font-inter)');
  const [flatItems, setFlatItems] = useState<FlatMenuItem[]>([]);
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [categories, setCategories] = useState([]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  useEffect(() => {
    fetchMenu();
    fetchCategories();
    loadTranslations('ar');
  }, []);

  const fetchMenu = async () => {
    try {
      const res = await fetch('/api/admin/menu');
      const data = await res.json();
      if (data.success && data.menuConfig) {
        setFontFamily(data.menuConfig.fontFamily || 'var(--font-inter)');
        setFlatItems(flattenTree(data.menuConfig.items || []));
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
      const nestedItems = buildTree(flatItems);
      const wrapper: MenuWrapper = { alignment: 'start', fontFamily, items: nestedItems };
      
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

  const addItem = () => {
    setFlatItems(prev => [...prev, { id: generateId(), type: 'standard', labels: {ar: '', en: ''}, url: '', parentId: null }]);
  };

  const updateItem = (id: string, field: keyof FlatMenuItem, value: any) => {
    setFlatItems(prev => prev.map(item => {
      if (item.id === id) {
        const newItem = { ...item, [field]: value } as FlatMenuItem;
        if (field === 'type' && value === 'categories-grid') {
          newItem.url = '/categories';
        }
        return newItem;
      }
      return item;
    }));
  };

  const removeItem = (id: string) => {
    setFlatItems(prev => {
      const toRemove = new Set([id]);
      let changed = true;
      while(changed) {
        changed = false;
        for (const item of prev) {
          if (item.parentId && toRemove.has(item.parentId) && !toRemove.has(item.id)) {
            toRemove.add(item.id);
            changed = true;
          }
        }
      }
      return prev.filter(item => !toRemove.has(item.id));
    });
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setFlatItems((prev) => {
        const oldIndex = prev.findIndex(item => item.id === active.id);
        const newIndex = prev.findIndex(item => item.id === over.id);
        return arrayMove(prev, oldIndex, newIndex);
      });
    }
  };

  const getDepth = (parentId: string | null): number => {
    if (!parentId) return 0;
    const parent = flatItems.find(i => i.id === parentId);
    if (!parent) return 0;
    return 1 + getDepth(parent.parentId);
  };

  if (isLoading) {
    return <div className="flex justify-center py-20"><Loader2 className="animate-spin w-8 h-8 text-primary" /></div>;
  }

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-primary">{t('إدارة القائمة الرئيسية', 'Main Menu')}</h1>
          <p className="text-muted-foreground">{t('قم بسحب وإفلات العناصر لترتيبها، أو عين الأب لكل عنصر لبناء قائمة متداخلة.', 'Drag and drop items to reorder, or set the parent for each item to build a nested menu.')}</p>
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
        <CardContent className="grid grid-cols-1 gap-6">
          <div className="space-y-2 max-w-sm">
            <Label>{t('نوع الخط للقائمة', 'Menu Font Family')}</Label>
            <Select value={fontFamily} onValueChange={setFontFamily}>
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
            {t('عناصر القائمة', 'Menu Items')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={flatItems.map(i => i.id)} strategy={verticalListSortingStrategy}>
              <div className="space-y-4">
                {flatItems.map((item) => (
                  <SortableParentItem 
                    key={item.id} 
                    item={item} 
                    depth={getDepth(item.parentId)}
                    allItems={flatItems}
                    updateItem={updateItem} 
                    removeItem={removeItem} 
                    categories={categories}
                    languages={languages}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>

          <Button variant="outline" className="w-full border-dashed gap-2 h-14 mt-4" onClick={addItem}>
            <Plus className="w-5 h-5" />
            <span className="font-semibold text-base">{t('إضافة عنصر جديد', 'Add New Item')}</span>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
