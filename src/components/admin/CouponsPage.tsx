'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Trash2, Tag, Percent, ArrowLeftRight, Clock, Globe } from 'lucide-react';
import { toast } from 'sonner';

export default function CouponsPage() {
  const [coupons, setCoupons] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    code: '',
    type: 'percentage',
    value: '',
    minOrder: '',
    usageLimit: '',
    expiresAt: '',
    maxStoresLimit: '',
  });

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/admin/coupons`);
      const data = await res.json();
      if (data.success) {
        setCoupons(data.coupons);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/coupons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.success) {
        toast.success('تم إنشاء الكوبون العام بنجاح');
        setShowAddForm(false);
        setFormData({ code: '', type: 'percentage', value: '', minOrder: '', usageLimit: '', expiresAt: '', maxStoresLimit: '' });
        fetchCoupons();
      } else {
        toast.error(data.error);
      }
    } catch (error) {
      toast.error('حدث خطأ');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا الكوبون؟')) return;
    try {
      const res = await fetch(`/api/admin/coupons?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        toast.success('تم الحذف بنجاح');
        fetchCoupons();
      } else {
        toast.error(data.error);
      }
    } catch (error) {
      toast.error('حدث خطأ أثناء الحذف');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">إدارة الكوبونات العامة</h1>
        <Button onClick={() => setShowAddForm(!showAddForm)}>
          <Plus className="w-4 h-4 ml-2" />
          إضافة كوبون جديد
        </Button>
      </div>

      {showAddForm && (
        <Card>
          <CardHeader>
            <CardTitle>إنشاء كوبون عام جديد (مثل البلاك فرايداي)</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateCoupon} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label>كود الكوبون</label>
                  <Input 
                    required 
                    placeholder="مثال: BLACKFRIDAY" 
                    value={formData.code}
                    onChange={(e) => setFormData({...formData, code: e.target.value.toUpperCase()})}
                  />
                </div>
                <div className="space-y-2">
                  <label>نوع الخصم</label>
                  <select 
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={formData.type}
                    onChange={(e) => setFormData({...formData, type: e.target.value})}
                  >
                    <option value="percentage">نسبة مئوية (%)</option>
                    <option value="fixed">مبلغ ثابت</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label>قيمة الخصم</label>
                  <Input 
                    type="number" 
                    required 
                    min="1"
                    placeholder={formData.type === 'percentage' ? "مثال: 20" : "مثال: 500"} 
                    value={formData.value}
                    onChange={(e) => setFormData({...formData, value: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label>الحد الأقصى للمتاجر المشاركة (اختياري)</label>
                  <Input 
                    type="number" 
                    min="1"
                    placeholder="مثال: 100" 
                    value={formData.maxStoresLimit}
                    onChange={(e) => setFormData({...formData, maxStoresLimit: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label>تاريخ الانتهاء (اختياري)</label>
                  <Input 
                    type="date" 
                    value={formData.expiresAt}
                    onChange={(e) => setFormData({...formData, expiresAt: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label>الحد الأدنى للطلب (اختياري)</label>
                  <Input 
                    type="number" 
                    placeholder="مثال: 5000" 
                    value={formData.minOrder}
                    onChange={(e) => setFormData({...formData, minOrder: e.target.value})}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <Button type="button" variant="outline" onClick={() => setShowAddForm(false)}>
                  إلغاء
                </Button>
                <Button type="submit">حفظ الكوبون</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>الكود</TableHead>
                <TableHead>النوع/القيمة</TableHead>
                <TableHead>الاستخدام</TableHead>
                <TableHead>الحد الأقصى للمتاجر</TableHead>
                <TableHead>المتاجر المنضمة</TableHead>
                <TableHead>الانتهاء</TableHead>
                <TableHead>إجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {coupons.map((coupon) => (
                <TableRow key={coupon.id}>
                  <TableCell className="font-bold">{coupon.code}</TableCell>
                  <TableCell>
                    {coupon.type === 'percentage' ? `${coupon.value}%` : `${coupon.value} د.ج`}
                  </TableCell>
                  <TableCell>{coupon.usedCount} {coupon.usageLimit ? `/ ${coupon.usageLimit}` : ''}</TableCell>
                  <TableCell>{coupon.maxStoresLimit || 'بدون حد'}</TableCell>
                  <TableCell className="font-bold text-primary">
                    {(coupon._count?.optInStores || 0) + (coupon._count?.optInSellers || 0)}
                  </TableCell>
                  <TableCell>
                    {coupon.expiresAt ? new Date(coupon.expiresAt).toLocaleDateString('ar-DZ') : 'لا يوجد'}
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(coupon.id)}>
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {coupons.length === 0 && !isLoading && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    لا توجد كوبونات عامة حالياً
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
