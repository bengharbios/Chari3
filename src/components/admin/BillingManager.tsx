'use client';

import React, { useEffect, useState } from 'react';
import { useAppStore } from '@/lib/store';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Wallet, ShieldCheck, CheckCircle2, AlertCircle, FileText,
  Loader2, Sparkles, Building, User, Clock, Check, X,
  Save, Eye, Ban, Package, ArrowUpRight, DollarSign, Settings
} from 'lucide-react';
import { toast } from 'sonner';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

const t = (locale: string, ar: string, en: string) => (locale === 'ar' ? ar : en);
const fmt = (n: number) => `${n.toLocaleString('ar-DZ')} د.ج`;

export default function BillingManager() {
  const { locale } = useAppStore();
  const dir = locale === 'ar' ? 'rtl' : 'ltr';

  const [isLoading, setIsLoading] = useState(true);
  const [globalDebtLimit, setGlobalDebtLimit] = useState('-5000');
  const [pendingReceipts, setPendingReceipts] = useState<any[]>([]);
  const [packages, setPackages] = useState<any[]>([]);
  const [isSavingLimit, setIsSavingLimit] = useState(false);

  // Review states
  const [reviewReceipt, setReviewReceipt] = useState<any>(null);
  const [adminNote, setAdminNote] = useState('');
  const [isProcessingReceipt, setIsProcessingReceipt] = useState(false);
  const [receiptImageOpen, setReceiptImageOpen] = useState(false);

  // Package editor state
  const [editingPackage, setEditingPackage] = useState<any>(null);
  const [isSavingPackage, setIsSavingPackage] = useState(false);

  const fetchAdminBillingData = async () => {
    setIsLoading(true);
    try {
      // 1. Fetch system settings
      const settingsRes = await fetch('/api/admin/settings');
      const settingsData = await settingsRes.json();
      if (settingsData.success && settingsData.settings?.global_debt_limit) {
        setGlobalDebtLimit(settingsData.settings.global_debt_limit);
      }

      // 2. Fetch pending receipts
      const receiptsRes = await fetch('/api/billing/receipts?status=pending');
      const receiptsData = await receiptsRes.json();
      if (receiptsData.success) {
        setPendingReceipts(receiptsData.receipts || []);
      }

      // 3. Fetch packages
      const packagesRes = await fetch('/api/admin/packages');
      const packagesData = await packagesRes.json();
      if (packagesData.success) {
        setPackages(packagesData.packages || []);
      }
    } catch (err) {
      console.error('Error fetching admin billing data', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminBillingData();
  }, []);

  // Save Debt Limit
  const handleSaveDebtLimit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingLimit(true);
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          settings: {
            global_debt_limit: globalDebtLimit,
          },
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(t(locale, 'تم حفظ حد المديونية الأقصى بنجاح', 'Global debt limit saved successfully'));
        fetchAdminBillingData();
      } else {
        throw new Error(data.error);
      }
    } catch (err: any) {
      toast.error(err.message || t(locale, 'فشل حفظ الإعدادات', 'Failed to save settings'));
    } finally {
      setIsSavingLimit(false);
    }
  };

  // Review (Approve/Reject) Receipt
  const handleReviewReceipt = async (status: 'approved' | 'rejected') => {
    if (!reviewReceipt) return;
    setIsProcessingReceipt(true);
    try {
      const res = await fetch('/api/billing/receipts', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          receiptId: reviewReceipt.id,
          status,
          adminNote,
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(
          status === 'approved'
            ? t(locale, 'تمت الموافقة على الدفع وتحديث محفظة التاجر فوراً! 🎉', 'Payment approved and merchant wallet updated!')
            : t(locale, 'تم رفض وصل الدفع وإشعار التاجر بالسبب.', 'Payment slip rejected and merchant notified.')
        );
        setReviewReceipt(null);
        setAdminNote('');
        fetchAdminBillingData();
      } else {
        throw new Error(data.error);
      }
    } catch (err: any) {
      toast.error(err.message || t(locale, 'فشلت معالجة الطلب', 'Failed to process request'));
    } finally {
      setIsProcessingReceipt(false);
    }
  };

  // Save Package modifications
  const handleSavePackage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPackage) return;
    setIsSavingPackage(true);
    try {
      const res = await fetch('/api/admin/packages', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingPackage),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(t(locale, 'تم حفظ تعديلات الباقة بنجاح 🎉', 'Package modified successfully 🎉'));
        setEditingPackage(null);
        fetchAdminBillingData();
      } else {
        throw new Error(data.error);
      }
    } catch (err: any) {
      toast.error(err.message || t(locale, 'فشل تعديل الباقة', 'Failed to save package'));
    } finally {
      setIsSavingPackage(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12 min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-brand" />
      </div>
    );
  }

  return (
    <div dir={dir} className="space-y-6 text-start p-1 sm:p-2">
      {/* Settings row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-1 border-border bg-card">
          <CardHeader className="pb-4">
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <Settings className="h-5 w-5 text-brand" />
              {t(locale, 'إعدادات المديونية العامة', 'Outstanding Debt Rules')}
            </CardTitle>
            <CardDescription>
              {t(locale, 'تحكم في سقف المديونية السلبي المسموح به للتجار والمتاجر.', 'Configure maximum negative balance tolerance threshold.')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSaveDebtLimit} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="debtLimit" className="text-xs font-semibold">{t(locale, 'حد المديونية الأقصى بالدينار (سالب)', 'Global Debt Limit DZD (Negative value)')}</Label>
                <Input
                  id="debtLimit"
                  placeholder="-5000"
                  value={globalDebtLimit}
                  onChange={(e) => setGlobalDebtLimit(e.target.value)}
                  className="font-mono rounded-xl h-9 font-bold"
                />
                <p className="text-[10px] text-muted-foreground">
                  {t(locale, 'عندما يتجاوز ميزان التاجر هذا المبلغ (مثال: -6000 دج) سيتم وقف حسابه فوراً حتى السداد.', 'Accounts with balances dropping below this threshold will automatically suspend.')}
                </p>
              </div>
              <Button type="submit" size="sm" className="w-full gap-2 rounded-xl" disabled={isSavingLimit}>
                {isSavingLimit ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                {t(locale, 'حفظ التعديلات', 'Save Limits')}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Quick analytics card for debt metrics */}
        <Card className="md:col-span-2 border-border bg-card">
          <CardHeader className="pb-4">
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <Wallet className="h-5 w-5 text-indigo-500" />
              {t(locale, 'حالة التحصيل المالي للمنصة', 'Platform Collections Overview')}
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-1">
            <div className="p-3 border rounded-xl bg-muted/20">
              <p className="text-xs text-muted-foreground">{t(locale, 'إيصالات معلقة', 'Pending Slips')}</p>
              <h3 className="text-xl font-bold font-mono text-amber-500 mt-1">{pendingReceipts.length}</h3>
            </div>
            <div className="p-3 border rounded-xl bg-muted/20">
              <p className="text-xs text-muted-foreground">{t(locale, 'إجمالي الديون القائمة', 'Total Seller Debt')}</p>
              <h3 className="text-xl font-bold font-mono text-red-500 mt-1">{fmt(124000)}</h3>
            </div>
            <div className="p-3 border rounded-xl bg-muted/20">
              <p className="text-xs text-muted-foreground">{t(locale, 'تم تحصيله هذا الشهر', 'Collected This Month')}</p>
              <h3 className="text-xl font-bold font-mono text-green-500 mt-1">{fmt(45000)}</h3>
            </div>
            <div className="p-3 border rounded-xl bg-muted/20">
              <p className="text-xs text-muted-foreground">{t(locale, 'المتاجر النشطة', 'Active Stores')}</p>
              <h3 className="text-xl font-bold font-mono text-brand mt-1">48</h3>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs interface */}
      <Tabs defaultValue="pending-slips" className="space-y-4 pt-2">
        <TabsList>
          <TabsTrigger value="pending-slips" className="gap-1.5 font-bold">
            <Clock className="h-4 w-4 text-amber-500" />
            {t(locale, 'مراجعة طلبات الدفع المعلقة', 'Review Pending Transfers')}
            {pendingReceipts.length > 0 && (
              <Badge variant="destructive" className="h-5 min-w-[20px] rounded-full p-0 flex items-center justify-center text-[10px]">
                {pendingReceipts.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="packages-edit" className="gap-1.5 font-bold">
            <Package className="h-4 w-4 text-indigo-500" />
            {t(locale, 'إعدادات باقات الاشتراك', 'Subscription Plans Settings')}
          </TabsTrigger>
        </TabsList>

        {/* Pending Slips panel */}
        <TabsContent value="pending-slips">
          <Card className="border-border bg-card">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-start ps-4">{t(locale, 'التاجر / المتجر', 'Merchant')}</TableHead>
                      <TableHead className="text-start">{t(locale, 'مبلغ التسديد', 'Amount')}</TableHead>
                      <TableHead className="text-start">{t(locale, 'ملاحظة التاجر', 'Merchant Notes')}</TableHead>
                      <TableHead className="text-start">{t(locale, 'تاريخ التقديم', 'Submitted')}</TableHead>
                      <TableHead className="text-start pe-4">{t(locale, 'إجراءات التحقق', 'Actions')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pendingReceipts.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-12 text-muted-foreground font-bold">
                          {t(locale, 'لا توجد إيصالات دفع معلقة للمراجعة حالياً.', 'No pending payment slips to verify.')}
                        </TableCell>
                      </TableRow>
                    ) : (
                      pendingReceipts.map((rec) => (
                        <TableRow key={rec.id}>
                          <TableCell className="ps-4">
                            <div className="flex items-center gap-2">
                              <Avatar className="h-7 w-7 shrink-0">
                                <AvatarFallback className="text-[10px] bg-brand/10 text-brand font-bold">
                                  {rec.user?.name?.charAt(0) || 'U'}
                                </AvatarFallback>
                              </Avatar>
                              <div className="text-xs text-start">
                                <p className="font-bold text-foreground">{rec.user?.name}</p>
                                <p className="text-[10px] text-muted-foreground font-mono">{rec.user?.email}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="font-bold font-mono text-xs text-brand">
                            {fmt(rec.amount)}
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground max-w-[200px] truncate" title={rec.merchantNote}>
                            {rec.merchantNote || '-'}
                          </TableCell>
                          <TableCell className="text-xs font-mono text-muted-foreground">
                            {new Date(rec.createdAt).toLocaleDateString(locale === 'ar' ? 'ar-SA' : 'en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </TableCell>
                          <TableCell className="pe-4">
                            <div className="flex items-center gap-1.5">
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-7 px-2.5 text-xs font-bold gap-1 rounded-lg border-brand/20 text-brand hover:bg-brand/10"
                                onClick={() => {
                                  setReviewReceipt(rec);
                                  setReceiptImageOpen(true);
                                }}
                              >
                                <Eye className="h-3.5 w-3.5" />
                                {t(locale, 'معاينة الوصل', 'Preview')}
                              </Button>
                              <Button
                                size="sm"
                                className="h-7 px-2.5 text-xs font-bold bg-green-600 hover:bg-green-700 text-white rounded-lg"
                                onClick={() => {
                                  setReviewReceipt(rec);
                                }}
                              >
                                <Check className="h-3.5 w-3.5" />
                                {t(locale, 'تأكيد', 'Approve')}
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Packages Configuration Editor */}
        <TabsContent value="packages-edit">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Packages lists */}
            <Card className="md:col-span-1 border-border bg-card">
              <CardHeader>
                <CardTitle className="text-base font-bold">{t(locale, 'الباقات النشطة', 'Active Plans')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {packages.map((pkg) => (
                  <div
                    key={pkg.id}
                    className={`p-3 rounded-xl border-2 transition-all cursor-pointer ${
                      editingPackage?.id === pkg.id 
                        ? 'border-brand bg-brand/5' 
                        : 'border-border hover:border-brand/40'
                    }`}
                    onClick={() => setEditingPackage({ ...pkg })}
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-sm" style={{ color: pkg.color }}>
                        {locale === 'ar' ? pkg.name : (pkg.nameEn || pkg.name)}
                      </h4>
                      <Badge className="text-[10px] font-bold">{fmt(pkg.price)}</Badge>
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-1 line-clamp-1">
                      {pkg.description || t(locale, 'لا يوجد وصف مضاف', 'No description added')}
                    </p>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Package details form editor */}
            <Card className="md:col-span-2 border-border bg-card">
              <CardHeader>
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <Package className="h-5 w-5 text-indigo-500" />
                  {t(locale, 'تعديل خصائص وحدود الباقة', 'Edit Plan Parameters & Limits')}
                </CardTitle>
                <CardDescription>
                  {t(locale, 'اختر باقة من القائمة لتعديل حدود منتجاتها وعمولاتها وميزاتها المضمنة.', 'Select a plan on the left side to edit its quotas and enabled features.')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {editingPackage ? (
                  <form onSubmit={handleSavePackage} className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      {/* Name */}
                      <div className="space-y-1.5">
                        <Label className="text-xs font-semibold">{t(locale, 'اسم الباقة (عربي)', 'Plan Name (AR)')}</Label>
                        <Input
                          value={editingPackage.name}
                          onChange={(e) => setEditingPackage({ ...editingPackage, name: e.target.value })}
                          className="h-9 rounded-xl font-bold"
                        />
                      </div>
                      {/* Name En */}
                      <div className="space-y-1.5">
                        <Label className="text-xs font-semibold">{t(locale, 'الاسم بالإنجليزية', 'Plan Name (EN)')}</Label>
                        <Input
                          value={editingPackage.nameEn || ''}
                          onChange={(e) => setEditingPackage({ ...editingPackage, nameEn: e.target.value })}
                          className="h-9 rounded-xl font-mono"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      {/* Price */}
                      <div className="space-y-1.5">
                        <Label className="text-xs font-semibold">{t(locale, 'السعر الشهري (دج)', 'Monthly Price (DZD)')}</Label>
                        <Input
                          type="number"
                          value={editingPackage.price}
                          onChange={(e) => setEditingPackage({ ...editingPackage, price: parseFloat(e.target.value) || 0 })}
                          className="h-9 rounded-xl font-bold"
                        />
                      </div>
                      {/* Commission */}
                      <div className="space-y-1.5">
                        <Label className="text-xs font-semibold">{t(locale, 'نسبة العمولة (%)', 'Commission Rate (%)')}</Label>
                        <Input
                          type="number"
                          value={editingPackage.commissionRate}
                          onChange={(e) => setEditingPackage({ ...editingPackage, commissionRate: parseFloat(e.target.value) || 0 })}
                          className="h-9 rounded-xl font-bold"
                        />
                      </div>
                      {/* Team limit */}
                      <div className="space-y-1.5">
                        <Label className="text-xs font-semibold">{t(locale, 'أعضاء الفريق', 'Team Members limit')}</Label>
                        <Input
                          type="number"
                          value={editingPackage.maxTeamMembers}
                          onChange={(e) => setEditingPackage({ ...editingPackage, maxTeamMembers: parseInt(e.target.value) || 1 })}
                          className="h-9 rounded-xl font-bold"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 border-t pt-4">
                      {/* Max Products */}
                      <div className="space-y-1.5">
                        <Label className="text-xs font-semibold">{t(locale, 'الحد الأقصى للمنتجات', 'Max Products Upload')}</Label>
                        <Input
                          type="number"
                          value={editingPackage.maxProducts}
                          onChange={(e) => setEditingPackage({ ...editingPackage, maxProducts: parseInt(e.target.value) || 0 })}
                          className="h-9 rounded-xl font-bold"
                        />
                        <p className="text-[9px] text-muted-foreground">{t(locale, 'أدخل -1 لغير محدود', '-1 for unlimited')}</p>
                      </div>
                      {/* Max Orders */}
                      <div className="space-y-1.5">
                        <Label className="text-xs font-semibold">{t(locale, 'الطلبات الشهرية القصوى', 'Max Monthly Orders')}</Label>
                        <Input
                          type="number"
                          value={editingPackage.maxMonthlyOrders}
                          onChange={(e) => setEditingPackage({ ...editingPackage, maxMonthlyOrders: parseInt(e.target.value) || 0 })}
                          className="h-9 rounded-xl font-bold"
                        />
                        <p className="text-[9px] text-muted-foreground">{t(locale, 'أدخل -1 لغير محدود', '-1 for unlimited')}</p>
                      </div>
                      {/* Max Landing Pages */}
                      <div className="space-y-1.5">
                        <Label className="text-xs font-semibold">{t(locale, 'صفحات الهبوط', 'Max Landing Pages')}</Label>
                        <Input
                          type="number"
                          value={editingPackage.maxLandingPages}
                          onChange={(e) => setEditingPackage({ ...editingPackage, maxLandingPages: parseInt(e.target.value) || 0 })}
                          className="h-9 rounded-xl font-bold"
                        />
                        <p className="text-[9px] text-muted-foreground">{t(locale, 'أدخل -1 لغير محدود', '-1 for unlimited')}</p>
                      </div>
                    </div>

                    {/* Checkboxes / Features Toggles */}
                    <div className="border-t pt-4 space-y-3">
                      <Label className="text-xs font-bold text-indigo-600">🛡️ {t(locale, 'الميزات والأدوات المضمنة في الباقة', 'Included Bundle Features')}</Label>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                        {/* Custom Domain */}
                        <label className="flex items-center gap-2 p-2 border rounded-xl bg-muted/20 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={editingPackage.hasCustomDomain}
                            onChange={(e) => setEditingPackage({ ...editingPackage, hasCustomDomain: e.target.checked })}
                            className="rounded"
                          />
                          <span>اسم نطاق مخصص</span>
                        </label>
                        {/* Pixels */}
                        <label className="flex items-center gap-2 p-2 border rounded-xl bg-muted/20 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={editingPackage.hasPixels}
                            onChange={(e) => setEditingPackage({ ...editingPackage, hasPixels: e.target.checked })}
                            className="rounded"
                          />
                          <span>بيكسل (Meta, Tik, Google)</span>
                        </label>
                        {/* Multi Currency */}
                        <label className="flex items-center gap-2 p-2 border rounded-xl bg-muted/20 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={editingPackage.hasMultiCurrency}
                            onChange={(e) => setEditingPackage({ ...editingPackage, hasMultiCurrency: e.target.checked })}
                            className="rounded"
                          />
                          <span>عملات متعددة</span>
                        </label>
                        {/* Data Export */}
                        <label className="flex items-center gap-2 p-2 border rounded-xl bg-muted/20 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={editingPackage.hasDataExport}
                            onChange={(e) => setEditingPackage({ ...editingPackage, hasDataExport: e.target.checked })}
                            className="rounded"
                          />
                          <span>تصدير البيانات</span>
                        </label>
                        {/* Email Support */}
                        <label className="flex items-center gap-2 p-2 border rounded-xl bg-muted/20 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={editingPackage.hasEmailSupport}
                            onChange={(e) => setEditingPackage({ ...editingPackage, hasEmailSupport: e.target.checked })}
                            className="rounded"
                          />
                          <span>دعم البريد الإلكتروني</span>
                        </label>
                        {/* Business Intelligence */}
                        <label className="flex items-center gap-2 p-2 border rounded-xl bg-muted/20 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={editingPackage.hasBusinessIntelligence}
                            onChange={(e) => setEditingPackage({ ...editingPackage, hasBusinessIntelligence: e.target.checked })}
                            className="rounded"
                          />
                          <span>ذكاء الأعمال (BI)</span>
                        </label>
                        {/* GA4 */}
                        <label className="flex items-center gap-2 p-2 border rounded-xl bg-muted/20 cursor-pointer col-span-1 sm:col-span-3">
                          <input
                            type="checkbox"
                            checked={editingPackage.hasGA4}
                            onChange={(e) => setEditingPackage({ ...editingPackage, hasGA4: e.target.checked })}
                            className="rounded"
                          />
                          <span>Google Analytics (GA4)</span>
                        </label>
                      </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                      <Button type="button" variant="outline" className="rounded-xl" onClick={() => setEditingPackage(null)}>
                        {t(locale, 'إلغاء', 'Cancel')}
                      </Button>
                      <Button type="submit" className="rounded-xl gap-2" disabled={isSavingPackage}>
                        {isSavingPackage ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                        {t(locale, 'حفظ التعديلات الباقة', 'Save Plan Parameters')}
                      </Button>
                    </div>
                  </form>
                ) : (
                  <div className="text-center py-16 text-muted-foreground flex flex-col items-center justify-center">
                    <Package className="h-10 w-10 text-muted-foreground/30 mb-2" />
                    <p className="text-sm font-bold">{t(locale, 'الرجاء اختيار باقة اشتراك من القائمة للبدء في تعديلها.', 'Select a plan on the left side to edit its quotas.')}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Manual receipt review overlay dialog */}
      {reviewReceipt && !receiptImageOpen && (
        <AlertDialog open={true} onOpenChange={() => setReviewReceipt(null)}>
          <AlertDialogContent dir={dir}>
            <AlertDialogHeader>
              <AlertDialogTitle>{t(locale, 'مراجعة وتأكيد إيصال التحويل', 'Review Transfer slip')}</AlertDialogTitle>
              <AlertDialogDescription>
                {t(locale, 'هل قمت بالتحقق يدوياً من تحويل المبلغ المذكور أدناه في حسابك البريدي؟', 'Verify that this transaction has indeed settled in your CCP postal account.')}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="space-y-4 py-2 text-xs">
              <div className="flex items-center justify-between p-3 rounded-xl bg-muted/40 border">
                <span className="text-muted-foreground font-semibold">{t(locale, 'التاجر المقدم للطلب:', 'Merchant Name:')}</span>
                <span className="font-bold text-foreground">{reviewReceipt.user?.name}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-brand/5 border border-brand/20">
                <span className="text-muted-foreground font-semibold">{t(locale, 'المبلغ المراد إيداعه:', 'DZD Amount to Deposit:')}</span>
                <span className="font-black text-brand text-sm">{fmt(reviewReceipt.amount)}</span>
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-semibold">{t(locale, 'ملاحظات الإدارة / سبب الرفض', 'Admin response / Rejection Reason')}</Label>
                <Textarea
                  placeholder={t(locale, 'مثال: تم قبول الإيصال بنجاح / أو يرجى إعادة إرسال صورة الوصل كاملة...', 'e.g. Approved successfully...')}
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                  className="rounded-xl h-20 text-xs"
                />
              </div>
            </div>
            <AlertDialogFooter className="flex gap-2">
              <AlertDialogCancel disabled={isProcessingReceipt} onClick={() => setReviewReceipt(null)}>
                {t(locale, 'تراجع', 'Close')}
              </AlertDialogCancel>
              <Button
                variant="destructive"
                disabled={isProcessingReceipt}
                className="rounded-xl font-bold gap-1"
                onClick={() => handleReviewReceipt('rejected')}
              >
                <X className="h-4 w-4" />
                {t(locale, 'رفض الوصل', 'Reject')}
              </Button>
              <Button
                disabled={isProcessingReceipt}
                className="bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold gap-1"
                onClick={() => handleReviewReceipt('approved')}
              >
                {isProcessingReceipt ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                {t(locale, 'موافقة وتفعيل فوري', 'Approve & Activate')}
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}

      {/* Large receipt slip image modal overlay */}
      {receiptImageOpen && reviewReceipt && (
        <AlertDialog open={true} onOpenChange={setReceiptImageOpen}>
          <AlertDialogContent className="max-w-xl" dir={dir}>
            <AlertDialogHeader>
              <AlertDialogTitle>{t(locale, 'معاينة صورة وصل الدفع (CCP)', 'CCP Bank Slip Preview')}</AlertDialogTitle>
            </AlertDialogHeader>
            <div className="aspect-video w-full rounded-2xl overflow-hidden border bg-slate-900 flex items-center justify-center p-2">
              <img
                src={reviewReceipt.receiptImage}
                alt="Payment Slip CCP"
                className="w-full h-full object-contain"
              />
            </div>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => {
                setReceiptImageOpen(false);
                setReviewReceipt(reviewReceipt); // Return back to decision dialog
              }}>
                {t(locale, 'إغلاق المعاينة', 'Back to review')}
              </AlertDialogCancel>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
}
