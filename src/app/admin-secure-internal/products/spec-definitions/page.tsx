'use client';
import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from '@/lib/i18n/useTranslation';
import { Plus, Trash2, Edit, Save, X, ChevronDown, GripVertical } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';

interface SpecDef {
  id: string;
  key: string;
  labelAr: string;
  labelEn: string;
  labelFr?: string;
  type: string;
  options?: string | null;
  isRequired: boolean;
  sortOrder: number;
  isActive: boolean;
  categoryId?: string | null;
  category?: { id: string; name: string; nameEn?: string } | null;
}

const TYPE_OPTIONS = [
  { value: 'text', labelKey: 'productForm.specTypeText' },
  { value: 'select', labelKey: 'productForm.specTypeSelect' },
  { value: 'number', labelKey: 'productForm.specTypeNumber' },
  { value: 'boolean', labelKey: 'productForm.specTypeBoolean' },
];

const EMPTY_FORM = {
  key: '', labelAr: '', labelEn: '', labelFr: '',
  type: 'text', options: '', isRequired: false, sortOrder: 0, categoryId: '',
};

export default function SpecDefinitionsPage() {
  const { t } = useTranslation();
  const [specs, setSpecs] = useState<SpecDef[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [filterCat, setFilterCat] = useState('');
  const [maxBullets, setMaxBullets] = useState('10');
  const [savingBullets, setSavingBullets] = useState(false);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [specsRes, catsRes, settingsRes] = await Promise.all([
        fetch('/api/admin/spec-definitions'),
        fetch('/api/admin/categories?type=product'),
        fetch('/api/admin/settings'),
      ]);
      const specsData = await specsRes.json();
      const catsData = await catsRes.json();
      const settingsData = await settingsRes.json();
      if (specsData.success) setSpecs(specsData.specs);
      if (catsData.success) setCategories(catsData.categories || catsData.data || []);
      if (settingsData.success) setMaxBullets(settingsData.settings?.max_bullet_points || '10');
    } catch {}
    setIsLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleSubmit = async () => {
    if (!form.key || !form.labelAr || !form.labelEn) {
      toast.error(t('productForm.specKey') + ' + ' + t('productForm.specLabelAr') + ' + ' + t('productForm.specLabelEn') + ' required');
      return;
    }
    try {
      const method = editingId ? 'PATCH' : 'POST';
      const url = editingId ? `/api/admin/spec-definitions/${editingId}` : '/api/admin/spec-definitions';
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
      const data = await res.json();
      if (data.success) {
        toast.success(editingId ? t('common.edit') : t('common.save'));
        setShowForm(false); setEditingId(null); setForm({ ...EMPTY_FORM });
        fetchData();
      } else { toast.error(data.error); }
    } catch (e) { toast.error(String(e)); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t('common.confirm') + '?')) return;
    try {
      const res = await fetch(`/api/admin/spec-definitions/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) { toast.success(t('common.delete')); fetchData(); }
      else toast.error(data.error);
    } catch (e) { toast.error(String(e)); }
  };

  const handleEdit = (spec: SpecDef) => {
    setForm({
      key: spec.key, labelAr: spec.labelAr, labelEn: spec.labelEn,
      labelFr: spec.labelFr || '', type: spec.type,
      options: spec.options ? JSON.parse(spec.options).join(', ') : '',
      isRequired: spec.isRequired, sortOrder: spec.sortOrder,
      categoryId: spec.categoryId || '',
    });
    setEditingId(spec.id);
    setShowForm(true);
  };

  const handleToggleRequired = async (spec: SpecDef) => {
    try {
      const res = await fetch(`/api/admin/spec-definitions/${spec.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isRequired: !spec.isRequired }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(t('common.save'));
        fetchData();
      } else {
        toast.error(data.error);
      }
    } catch (e) {
      toast.error(String(e));
    }
  };

  const handleSaveBulletLimit = async () => {
    setSavingBullets(true);
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings: { max_bullet_points: maxBullets } }),
      });
      const data = await res.json();
      if (data.success) toast.success(t('common.save'));
      else toast.error(data.error);
    } catch (e) { toast.error(String(e)); }
    setSavingBullets(false);
  };

  const filtered = filterCat
    ? specs.filter(s => !s.categoryId || s.categoryId === filterCat)
    : specs;

  const typeLabel = (type: string) => {
    const opt = TYPE_OPTIONS.find(o => o.value === type);
    return opt ? t(opt.labelKey) : type;
  };

  return (
    <div className="p-6 space-y-8 max-w-5xl mx-auto" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{t('productForm.specDefsPageTitle')}</h1>
          <p className="text-sm text-muted-foreground mt-1">{t('productForm.specDefsSubtitle')}</p>
        </div>
        <button
          onClick={() => { setShowForm(true); setEditingId(null); setForm({ ...EMPTY_FORM }); }}
          className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-xl text-sm font-medium hover:opacity-90 transition"
        >
          <Plus className="size-4" />
          {t('productForm.addSpecDef')}
        </button>
      </div>

      {/* Bullet Limit Setting */}
      <div className="bg-card border border-border rounded-2xl p-5 space-y-3">
        <h2 className="font-bold text-foreground">{t('productForm.adminBulletLimitLabel')}</h2>
        <p className="text-xs text-muted-foreground">{t('productForm.adminBulletLimitDesc')}</p>
        <div className="flex gap-3 items-center">
          <input
            type="number"
            min="1"
            max="50"
            value={maxBullets}
            onChange={e => setMaxBullets(e.target.value)}
            className="w-24 bg-background border border-border text-foreground px-3 py-2 rounded-xl text-sm"
          />
          <button
            onClick={handleSaveBulletLimit}
            disabled={savingBullets}
            className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-xl text-sm font-medium hover:opacity-90 disabled:opacity-50 transition"
          >
            <Save className="size-4" />
            {t('common.save')}
          </button>
        </div>
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <div className="bg-card border border-primary/30 rounded-2xl p-6 space-y-4 shadow-lg">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-foreground">{editingId ? t('common.edit') : t('productForm.addSpecDef')}</h2>
            <button onClick={() => { setShowForm(false); setEditingId(null); }} className="text-muted-foreground hover:text-foreground">
              <X className="size-5" />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Key */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-muted-foreground">{t('productForm.specKey')} *</label>
              <input
                value={form.key} onChange={e => setForm(f => ({ ...f, key: e.target.value }))}
                placeholder="e.g. ram, material, color"
                dir="ltr"
                className="w-full bg-background border border-border text-foreground px-3 py-2 rounded-xl text-sm"
              />
            </div>
            {/* Category */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-muted-foreground">{t('productForm.specCategory')}</label>
              <select
                value={form.categoryId}
                onChange={e => setForm(f => ({ ...f, categoryId: e.target.value }))}
                className="w-full bg-background border border-border text-foreground px-3 py-2 rounded-xl text-sm"
              >
                <option value="">{t('productForm.specCategory')}</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name} {c.nameEn ? `/ ${c.nameEn}` : ''}</option>)}
              </select>
            </div>
            {/* Label Ar */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-muted-foreground">{t('productForm.specLabelAr')} *</label>
              <input
                value={form.labelAr} onChange={e => setForm(f => ({ ...f, labelAr: e.target.value }))}
                placeholder="ذاكرة الوصول العشوائي"
                dir="rtl"
                className="w-full bg-background border border-border text-foreground px-3 py-2 rounded-xl text-sm"
              />
            </div>
            {/* Label En */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-muted-foreground">{t('productForm.specLabelEn')} *</label>
              <input
                value={form.labelEn} onChange={e => setForm(f => ({ ...f, labelEn: e.target.value }))}
                placeholder="RAM"
                dir="ltr"
                className="w-full bg-background border border-border text-foreground px-3 py-2 rounded-xl text-sm"
              />
            </div>
            {/* Label Fr */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-muted-foreground">{t('productForm.specLabelFr')}</label>
              <input
                value={form.labelFr} onChange={e => setForm(f => ({ ...f, labelFr: e.target.value }))}
                placeholder="Mémoire vive"
                dir="ltr"
                className="w-full bg-background border border-border text-foreground px-3 py-2 rounded-xl text-sm"
              />
            </div>
            {/* Type */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-muted-foreground">{t('productForm.specType')}</label>
              <select
                value={form.type}
                onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
                className="w-full bg-background border border-border text-foreground px-3 py-2 rounded-xl text-sm"
              >
                {TYPE_OPTIONS.map(o => <option key={o.value} value={o.value}>{t(o.labelKey)}</option>)}
              </select>
            </div>
            {/* Options (only for select) */}
            {form.type === 'select' && (
              <div className="space-y-1 md:col-span-2">
                <label className="text-xs font-bold text-muted-foreground">{t('productForm.specOptions')}</label>
                <input
                  value={form.options} onChange={e => setForm(f => ({ ...f, options: e.target.value }))}
                  placeholder="64GB, 128GB, 256GB"
                  dir="ltr"
                  className="w-full bg-background border border-border text-foreground px-3 py-2 rounded-xl text-sm"
                />
              </div>
            )}
            {/* Sort Order + Required */}
            <div className="flex gap-4 items-center md:col-span-2">
              <div className="space-y-1">
                <label className="text-xs font-bold text-muted-foreground">ترتيب العرض</label>
                <input
                  type="number" min="0"
                  value={form.sortOrder} onChange={e => setForm(f => ({ ...f, sortOrder: Number(e.target.value) }))}
                  className="w-20 bg-background border border-border text-foreground px-3 py-2 rounded-xl text-sm"
                />
              </div>
              <label className="flex items-center gap-2 text-sm text-foreground cursor-pointer mt-4">
                <input
                  type="checkbox"
                  checked={form.isRequired}
                  onChange={e => setForm(f => ({ ...f, isRequired: e.target.checked }))}
                  className="rounded"
                />
                {t('productForm.specRequired')}
              </label>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button onClick={() => { setShowForm(false); setEditingId(null); }} className="px-4 py-2 rounded-xl border border-border text-sm hover:bg-muted transition">
              {t('common.cancel')}
            </button>
            <button onClick={handleSubmit} className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition">
              {t('common.save')}
            </button>
          </div>
        </div>
      )}

      {/* Filter by Category */}
      <div className="flex items-center gap-3">
        <label className="text-sm text-muted-foreground">{t('productForm.specCategory')}:</label>
        <select
          value={filterCat}
          onChange={e => setFilterCat(e.target.value)}
          className="bg-background border border-border text-foreground px-3 py-1.5 rounded-xl text-sm"
        >
          <option value="">الكل</option>
          {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>

      {/* Specs Table */}
      {isLoading ? (
        <div className="text-center py-12 text-muted-foreground">جار التحميل...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed border-border rounded-2xl">
          <p className="text-muted-foreground">{t('productForm.noSpecsDefined')}</p>
          <button onClick={() => setShowForm(true)} className="mt-3 text-primary text-sm hover:underline">
            {t('productForm.addSpecDef')}
          </button>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-border">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-right px-4 py-3 font-bold text-muted-foreground">{t('productForm.specKey')}</th>
                <th className="text-right px-4 py-3 font-bold text-muted-foreground">{t('productForm.specLabelAr')}</th>
                <th className="text-right px-4 py-3 font-bold text-muted-foreground">{t('productForm.specLabelEn')}</th>
                <th className="text-right px-4 py-3 font-bold text-muted-foreground">{t('productForm.specType')}</th>
                <th className="text-right px-4 py-3 font-bold text-muted-foreground">{t('productForm.specCategory')}</th>
                <th className="text-right px-4 py-3 font-bold text-muted-foreground">{t('productForm.specRequired')}</th>
                <th className="text-right px-4 py-3 font-bold text-muted-foreground"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map(spec => (
                <tr key={spec.id} className="hover:bg-muted/20 transition">
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{spec.key}</td>
                  <td className="px-4 py-3 font-medium text-foreground">{spec.labelAr}</td>
                  <td className="px-4 py-3 text-muted-foreground" dir="ltr">{spec.labelEn}</td>
                  <td className="px-4 py-3">
                    <Badge variant="outline" className="text-xs">{typeLabel(spec.type)}</Badge>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground text-xs">
                    {spec.category ? spec.category.name : <span className="text-amber-500">الكل</span>}
                  </td>
                  <td className="px-4 py-3">
                    <button type="button" onClick={() => handleToggleRequired(spec)} className="cursor-pointer">
                      {spec.isRequired
                        ? <Badge className="bg-red-500/10 text-red-500 hover:bg-red-500/20 border-red-500/20 text-xs">إلزامي (انقر للتغيير)</Badge>
                        : <Badge variant="outline" className="hover:bg-muted text-xs">اختياري (انقر للتغيير)</Badge>
                      }
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2 justify-end">
                      <button onClick={() => handleEdit(spec)} className="text-muted-foreground hover:text-primary transition">
                        <Edit className="size-4" />
                      </button>
                      <button onClick={() => handleDelete(spec.id)} className="text-muted-foreground hover:text-red-500 transition">
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
