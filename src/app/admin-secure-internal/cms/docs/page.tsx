'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Loader2, Plus, Edit, Trash, Eye, Globe } from 'lucide-react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useTranslationStore } from '@/lib/store/translation-store';

// Dynamically import MDXEditor to prevent SSR issues
const MDXEditor = dynamic(
  () => import('@mdxeditor/editor').then((mod) => mod.MDXEditor),
  { ssr: false }
);

export default function AdminDocsPage() {
  const [docs, setDocs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingDoc, setEditingDoc] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    titleEn: '',
    slug: '',
    category: 'general',
    sortOrder: '0',
    isPublished: true,
    content: '',
    contentEn: '',
    translations: {} as Record<string, { title: string, content: string }>
  });

  const { languages } = useTranslationStore();
  const activeLanguages = languages.filter((l: any) => l.isActive !== false);

  useEffect(() => {
    fetchDocs();
  }, []);

  const fetchDocs = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/docs');
      const json = await res.json();
      if (json.success) setDocs(json.data);
    } catch (err) {
      toast.error('Failed to load docs');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!formData.title || !formData.slug || !formData.content) {
      toast.error('يرجى تعبئة الحقول الأساسية: العنوان، الرابط، والمحتوى');
      return;
    }
    
    setIsSaving(true);
    try {
      const url = editingDoc ? `/api/admin/docs/${editingDoc.id}` : '/api/admin/docs';
      const method = editingDoc ? 'PATCH' : 'POST';
      
      const payload = {
        ...formData,
        sortOrder: parseInt(formData.sortOrder) || 0
      };

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const json = await res.json();
      
      if (json.success) {
        toast.success('تم الحفظ بنجاح');
        setEditingDoc(null);
        setFormData({ title: '', titleEn: '', slug: '', category: 'general', sortOrder: '0', isPublished: true, content: '', contentEn: '', translations: {} });
        fetchDocs();
      } else {
        toast.error(json.error || 'Failed to save');
      }
    } catch (err) {
      toast.error('Error saving');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا المقال؟')) return;
    try {
      const res = await fetch(`/api/admin/docs/${id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('تم الحذف');
        fetchDocs();
      }
    } catch (err) {
      toast.error('Failed to delete');
    }
  };

  const startEdit = (doc: any) => {
    setEditingDoc(doc);
    setFormData({
      title: doc.title,
      titleEn: doc.titleEn || '',
      slug: doc.slug,
      category: doc.category || 'general',
      sortOrder: String(doc.sortOrder || 0),
      isPublished: doc.isPublished,
      content: doc.content,
      contentEn: doc.contentEn || '',
      translations: doc.translations || {}
    });
  };

  const updateTranslation = (code: string, field: 'title' | 'content', value: string) => {
    if (code === 'ar') {
      setFormData(prev => ({ ...prev, [field === 'title' ? 'title' : 'content']: value }));
    } else if (code === 'en') {
      setFormData(prev => ({ ...prev, [field === 'title' ? 'titleEn' : 'contentEn']: value }));
    } else {
      setFormData(prev => ({
        ...prev,
        translations: {
          ...prev.translations,
          [code]: {
            ...(prev.translations[code] || { title: '', content: '' }),
            [field]: value
          }
        }
      }));
    }
  };

  const getTranslation = (code: string, field: 'title' | 'content') => {
    if (code === 'ar') return field === 'title' ? formData.title : formData.content;
    if (code === 'en') return field === 'title' ? formData.titleEn : formData.contentEn;
    return formData.translations?.[code]?.[field] || '';
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6" dir="rtl">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">إدارة التوثيق (Documentation)</h1>
          <p className="text-muted-foreground text-sm">أضف شروحات ومقالات لمساعدة التجار والمشترين والمطورين</p>
        </div>
        <div className="flex gap-3">
          <Link href="/docs" target="_blank">
            <Button variant="outline"><Globe className="w-4 h-4 ml-2" /> معاينة الموقع العام</Button>
          </Link>
          <Button onClick={() => { setEditingDoc(null); setFormData({ title: '', titleEn: '', slug: '', category: 'general', sortOrder: '0', isPublished: true, content: '', contentEn: '', translations: {} }); }}>
            <Plus className="w-4 h-4 ml-2" /> مقال جديد
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Editor Form */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>{editingDoc ? 'تعديل المقال' : 'إضافة مقال جديد'}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {activeLanguages.map((lang: any) => (
                <div className="space-y-2" key={`title-${lang.code}`}>
                  <Label>العنوان ({lang.name})</Label>
                  <Input 
                    value={getTranslation(lang.code, 'title')} 
                    onChange={e => updateTranslation(lang.code, 'title', e.target.value)} 
                    dir={lang.direction === 'rtl' ? 'rtl' : 'ltr'} 
                  />
                </div>
              ))}
              <div className="space-y-2 col-span-2">
                <Label>الرابط (Slug)</Label>
                <Input value={formData.slug} onChange={e => setFormData({ ...formData, slug: e.target.value })} dir="ltr" placeholder="example-article" />
              </div>
              <div className="space-y-2">
                <Label>الترتيب</Label>
                <Input type="number" value={formData.sortOrder} onChange={e => setFormData({ ...formData, sortOrder: e.target.value })} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>القسم (Category)</Label>
                <Select value={formData.category} onValueChange={(val) => setFormData({ ...formData, category: val })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">عام</SelectItem>
                    <SelectItem value="developers">للمطورين</SelectItem>
                    <SelectItem value="sellers">للتجار</SelectItem>
                    <SelectItem value="buyers">للمشترين</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2 flex items-center justify-between pt-6">
                <Label>حالة النشر</Label>
                <Button variant={formData.isPublished ? 'default' : 'secondary'} onClick={() => setFormData({ ...formData, isPublished: !formData.isPublished })}>
                  {formData.isPublished ? 'منشور (عام)' : 'مسودة (مخفي)'}
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {activeLanguages.map((lang: any) => (
                <div className="space-y-2" key={`content-${lang.code}`}>
                  <Label>المحتوى ({lang.name}) - Markdown مدعوم</Label>
                  <div className="border rounded-md min-h-[300px] overflow-hidden bg-white" dir={lang.direction === 'rtl' ? 'rtl' : 'ltr'}>
                    <textarea 
                      className="w-full h-[300px] p-4 outline-none resize-y text-sm font-mono"
                      value={getTranslation(lang.code, 'content')}
                      onChange={e => updateTranslation(lang.code, 'content', e.target.value)}
                      placeholder={`# Write documentation here... (${lang.name})`}
                      dir={lang.direction === 'rtl' ? 'rtl' : 'ltr'}
                    />
                  </div>
                </div>
              ))}
            </div>

            <Button onClick={handleSave} disabled={isSaving} className="w-full mt-4">
              {isSaving && <Loader2 className="w-4 h-4 animate-spin ml-2" />}
              حفظ المقال
            </Button>
          </CardContent>
        </Card>

        {/* Articles List */}
        <Card>
          <CardHeader>
            <CardTitle>قائمة المقالات</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center p-8"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>
            ) : docs.length === 0 ? (
              <div className="text-center p-8 text-muted-foreground">لا توجد مقالات مضافة.</div>
            ) : (
              <div className="space-y-3">
                {docs.map(doc => (
                  <div key={doc.id} className={`p-3 rounded-lg border flex flex-col gap-2 ${editingDoc?.id === doc.id ? 'border-brand bg-brand/5' : ''}`}>
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-bold text-sm">{doc.title}</h4>
                        <p className="text-xs text-muted-foreground" dir="ltr">/{doc.slug}</p>
                      </div>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full ${doc.isPublished ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-800'}`}>
                        {doc.isPublished ? 'منشور' : 'مسودة'}
                      </span>
                    </div>
                    <div className="flex gap-2 justify-end mt-2">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-500" onClick={() => startEdit(doc)}><Edit className="w-4 h-4" /></Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500" onClick={() => handleDelete(doc.id)}><Trash className="w-4 h-4" /></Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
