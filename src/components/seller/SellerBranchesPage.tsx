'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAppStore, useAuthStore } from '@/lib/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import {
  Store,
  Plus,
  Globe,
  Users,
  CheckCircle2,
  XCircle,
  Crown,
  ShieldCheck,
  Loader2,
  RefreshCw,
  ExternalLink,
  Copy,
  Building2,
} from 'lucide-react';
import type { Locale } from '@/types';

function t(locale: Locale, ar: string, en: string) {
  return locale === 'ar' ? ar : en;
}

interface BranchStaff {
  id: string;
  role: string;
  status: string;
  joinedAt: string;
  user: { id: string; name: string; email: string };
}

interface Branch {
  id: string;
  name: string;
  nameEn: string | null;
  slug: string;
  logo: string | null;
  isActive: boolean;
  createdAt: string;
  managerId: string;
  manager: { id: string; name: string; email: string };
  staff: BranchStaff[];
  isPrimary: boolean;
  myRole: string;
}

export default function SellerBranchesPage() {
  const { locale, setActiveStoreId, activeStoreId } = useAppStore();
  const { user } = useAuthStore();
  const isAr = locale === 'ar';

  const [branches, setBranches] = useState<Branch[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUnauthorized, setIsUnauthorized] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newBranchName, setNewBranchName] = useState('');
  const [newBranchNameEn, setNewBranchNameEn] = useState('');
  const [branchLimit, setBranchLimit] = useState<number>(10); // default fallback

  const fetchBranches = useCallback(async () => {
    if (!user?.id) return;
    setIsLoading(true);
    try {
      // Fetch branches
      const res = await fetch(`/api/seller/branches?userId=${user.id}`);
      const data = await res.json();
      if (res.status === 403 || data.error === 'only_business_sellers_allowed') {
        setIsUnauthorized(true);
        return;
      }
      if (data.success) {
        setBranches(data.branches || []);
      } else {
        toast.error(t(locale, 'فشل تحميل الفروع', 'Failed to load branches'));
      }

      // Fetch subscription to know plan branch limit
      if (user?.id) {
        const subRes = await fetch(`/api/billing/subscription?userId=${user.id}`);
        const subData = await subRes.json();
        if (subData.subscription?.package?.maxTeamMembers) {
          // Use maxTeamMembers as a proxy for branch limit, or default to 10
          setBranchLimit(subData.subscription.package.maxTeamMembers || 10);
        }
      }
    } catch {
      toast.error(t(locale, 'خطأ في الاتصال بالخادم', 'Server connection error'));
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, locale]);

  useEffect(() => {
    fetchBranches();
  }, [fetchBranches]);

  const handleCreate = async () => {
    if (!user?.id || !newBranchName.trim()) return;
    setIsCreating(true);
    try {
      const res = await fetch('/api/seller/branches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          name: newBranchName.trim(),
          nameEn: newBranchNameEn.trim() || newBranchName.trim(),
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(t(locale, 'تم إنشاء الفرع بنجاح ✓', 'Branch created successfully ✓'));
        setShowCreateDialog(false);
        setNewBranchName('');
        setNewBranchNameEn('');
        fetchBranches();
      } else {
        const errorMap: Record<string, string> = {
          branch_name_required: t(locale, 'اسم الفرع مطلوب', 'Branch name is required'),
          branch_limit_reached: t(locale, 'وصلت للحد الأقصى من الفروع (10)', 'Branch limit reached (10)'),
        };
        toast.error(errorMap[data.error] || t(locale, 'فشل إنشاء الفرع', 'Failed to create branch'));
      }
    } catch {
      toast.error(t(locale, 'خطأ في الاتصال بالخادم', 'Server connection error'));
    } finally {
      setIsCreating(false);
    }
  };

  const handleCopySlug = (slug: string) => {
    navigator.clipboard.writeText(`${window.location.origin}/store/${slug}`);
    toast.success(t(locale, 'تم نسخ الرابط', 'Link copied'));
  };

  const getRoleBadge = (role: string) => {
    const map: Record<string, { ar: string; en: string; color: string }> = {
      owner: { ar: 'مالك', en: 'Owner', color: 'bg-amber-500/15 text-amber-600 border-amber-500/30' },
      store_manager: { ar: 'مدير فرع', en: 'Branch Manager', color: 'bg-blue-500/15 text-blue-600 border-blue-500/30' },
      admin: { ar: 'مشرف', en: 'Admin', color: 'bg-purple-500/15 text-purple-600 border-purple-500/30' },
      staff: { ar: 'موظف', en: 'Staff', color: 'bg-slate-500/15 text-slate-600 border-slate-500/30' },
      editor: { ar: 'محرر', en: 'Editor', color: 'bg-teal-500/15 text-teal-600 border-teal-500/30' },
    };
    const r = map[role] || { ar: role, en: role, color: 'bg-slate-500/15 text-slate-600' };
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold border ${r.color}`}>
        {isAr ? r.ar : r.en}
      </span>
    );
  };

  if (isLoading) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="h-10 w-10 text-primary animate-spin" />
        <p className="text-sm text-muted-foreground font-medium">
          {t(locale, 'جاري تحميل الفروع...', 'Loading branches...')}
        </p>
      </div>
    );
  }

  if (isUnauthorized) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center">
        <Card className="max-w-md w-full border-red-200 bg-red-50/10 dark:bg-red-950/5">
          <CardContent className="pt-8 pb-8 text-center space-y-4">
            <div className="mx-auto w-12 h-12 rounded-full bg-red-100 flex items-center justify-center text-red-600">
              <XCircle className="w-6 h-6" />
            </div>
            <h2 className="text-lg font-bold text-red-900 dark:text-red-200">
              {t(locale, 'عذرًا، الميزة غير متاحة لنوع حسابك', 'Feature Not Available for Your Account Type')}
            </h2>
            <p className="text-sm text-red-700/80 dark:text-red-300/80 leading-relaxed">
              {t(
                locale,
                'ميزة إدارة الفروع وتعديل صلاحيات الموظفين للمتاجر المتعددة متاحة فقط للحسابات من نوع متجر (أعمال). بصفتك تاجر مستقل، يمكنك إدارة متجرك الفردي فقط.',
                'The branch management and multi-store staff permissions feature is exclusively available for business accounts. As an individual seller, you can manage your single storefront.'
              )}
            </p>
            <div className="pt-2">
              <Button onClick={() => window.location.href = '/seller/dashboard'} variant="outline" className="border-red-200 hover:bg-red-50">
                {t(locale, 'العودة للوحة التحكم', 'Back to Dashboard')}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const limitPercent = Math.min(100, Math.round((branches.length / branchLimit) * 100));
  const atLimit = branches.length >= branchLimit;

  return (
    <div className="space-y-6 pb-12">
      {/* Page Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest mb-0.5">
            {t(locale, 'إدارة الأعمال', 'BUSINESS MANAGEMENT')}
          </p>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Building2 className="h-6 w-6 text-primary" />
            {t(locale, 'إدارة الفروع', 'Branch Management')}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {t(locale,
              `${branches.length} ${branches.length === 1 ? 'فرع' : 'فروع'} من أصل ${branchLimit} مرتبطة بحسابك`,
              `${branches.length} of ${branchLimit} branches linked to your account`
            )}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={fetchBranches} className="gap-2 font-bold">
            <RefreshCw className="h-4 w-4" />
            {t(locale, 'تحديث', 'Refresh')}
          </Button>
          <Button
            size="sm"
            onClick={() => setShowCreateDialog(true)}
            className="gap-2 font-bold"
            disabled={atLimit}
            title={atLimit ? t(locale, 'تم الوصول للحد الأقصى للفروع', 'Branch limit reached') : undefined}
          >
            <Plus className="h-4 w-4" />
            {t(locale, 'فرع جديد', 'New Branch')}
          </Button>
        </div>
      </div>

      {/* Branch Limit Progress Bar */}
      <div className="rounded-xl border bg-muted/30 p-4 flex items-center gap-4">
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-semibold text-muted-foreground">
              {t(locale, 'استهلاك حصة الفروع', 'Branch Quota Usage')}
            </span>
            <span className={`text-xs font-bold ${atLimit ? 'text-red-500' : 'text-primary'}`}>
              {branches.length} / {branchLimit}
            </span>
          </div>
          <div className="h-2 rounded-full bg-muted overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                atLimit ? 'bg-red-500' : limitPercent > 75 ? 'bg-amber-500' : 'bg-primary'
              }`}
              style={{ width: `${limitPercent}%` }}
            />
          </div>
          {atLimit && (
            <p className="text-xs text-red-500 mt-1 font-medium">
              {t(locale, 'تم الوصول للحد الأقصى — قم بترقية باقتك لإضافة المزيد', 'Limit reached — upgrade your plan for more branches')}
            </p>
          )}
        </div>
        {branches.length > 1 && (
          <div className="text-xs text-muted-foreground text-center">
            <span className="block font-bold text-foreground text-lg">{branches.length}</span>
            {t(locale, 'فروع', 'Branches')}
          </div>
        )}
      </div>

      {/* Branch Cards */}
      {branches.length === 0 ? (
        <Card className="border-dashed border-2">
          <CardContent className="py-16 text-center">
            <Building2 className="h-14 w-14 text-muted-foreground/40 mx-auto mb-4" />
            <h3 className="text-lg font-bold mb-2">{t(locale, 'لا توجد فروع بعد', 'No branches yet')}</h3>
            <p className="text-sm text-muted-foreground mb-5 max-w-xs mx-auto">
              {t(locale,
                'أنشئ فرعك الأول لتوسيع نشاطك التجاري وإدارة متاجر متعددة من مكان واحد.',
                'Create your first branch to expand your business and manage multiple stores from one place.'
              )}
            </p>
            <Button onClick={() => setShowCreateDialog(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              {t(locale, 'إنشاء أول فرع', 'Create First Branch')}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {branches.map((branch) => (
            <Card
              key={branch.id}
              className={`relative overflow-hidden transition-all duration-200 hover:shadow-md ${
                activeStoreId === branch.id ? 'ring-2 ring-primary ring-offset-2' : ''
              }`}
            >
              {/* Active indicator */}
              {activeStoreId === branch.id && (
                <div className="absolute top-0 start-0 end-0 h-1 bg-primary rounded-t-lg" />
              )}

              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <Store className="h-5 w-5 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <CardTitle className="text-sm font-bold truncate">
                        {isAr ? branch.name : (branch.nameEn || branch.name)}
                      </CardTitle>
                      <p className="text-[11px] text-muted-foreground truncate">/{branch.slug}</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    {getRoleBadge(branch.myRole)}
                    {branch.isPrimary && (
                      <span className="flex items-center gap-1 text-[10px] font-bold text-amber-600">
                        <Crown className="h-3 w-3" />
                        {t(locale, 'رئيسي', 'Primary')}
                      </span>
                    )}
                  </div>
                </div>
              </CardHeader>

              <CardContent className="pt-0 space-y-3">
                {/* Status */}
                <div className="flex items-center gap-2">
                  {branch.isActive ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-500 shrink-0" />
                  )}
                  <span className={`text-xs font-bold ${branch.isActive ? 'text-emerald-600' : 'text-red-500'}`}>
                    {branch.isActive ? t(locale, 'نشط', 'Active') : t(locale, 'غير نشط', 'Inactive')}
                  </span>
                </div>

                {/* Staff summary */}
                {branch.staff.length > 0 && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Users className="h-3.5 w-3.5 shrink-0" />
                    <span>
                      {branch.staff.length} {t(locale,
                        branch.staff.length === 1 ? 'عضو فريق' : 'أعضاء فريق',
                        branch.staff.length === 1 ? 'team member' : 'team members'
                      )}
                    </span>
                  </div>
                )}

                {/* Store link */}
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Globe className="h-3.5 w-3.5 shrink-0" />
                  <span className="truncate flex-1 font-mono text-[10px]">/store/{branch.slug}</span>
                  <button
                    onClick={() => handleCopySlug(branch.slug)}
                    className="p-0.5 hover:text-primary transition-colors"
                    title={t(locale, 'نسخ الرابط', 'Copy link')}
                  >
                    <Copy className="h-3 w-3" />
                  </button>
                  <a
                    href={`/store/${branch.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-0.5 hover:text-primary transition-colors"
                    title={t(locale, 'زيارة المتجر', 'Visit store')}
                  >
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>

                {/* Staff list (compact) */}
                {branch.staff.length > 0 && (
                  <div className="border-t border-border pt-2 space-y-1.5">
                    {branch.staff.slice(0, 3).map((member) => (
                      <div key={member.id} className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <ShieldCheck className="h-3 w-3 text-muted-foreground shrink-0" />
                          <span className="text-[11px] text-foreground truncate font-medium">{member.user.name}</span>
                        </div>
                        {getRoleBadge(member.role)}
                      </div>
                    ))}
                    {branch.staff.length > 3 && (
                      <p className="text-[10px] text-muted-foreground">
                        +{branch.staff.length - 3} {t(locale, 'آخرون', 'more')}
                      </p>
                    )}
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-2 pt-1">
                  {activeStoreId !== branch.id ? (
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 text-xs h-8 font-bold"
                      onClick={() => {
                        setActiveStoreId(branch.id);
                        toast.success(
                          t(locale,
                            `تم التبديل إلى "${branch.name}"`,
                            `Switched to "${branch.nameEn || branch.name}"`
                          )
                        );
                      }}
                    >
                      {t(locale, 'تبديل إلى هذا الفرع', 'Switch to Branch')}
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      variant="default"
                      className="flex-1 text-xs h-8 font-bold"
                      disabled
                    >
                      ✓ {t(locale, 'الفرع النشط', 'Active Branch')}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* How branches work — info panel */}
      <Card className="bg-muted/40 border-dashed">
        <CardContent className="py-5">
          <h3 className="text-sm font-bold mb-2 flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-primary" />
            {t(locale, 'كيف تعمل الفروع؟', 'How do branches work?')}
          </h3>
          <ul className="text-xs text-muted-foreground space-y-1.5 list-disc list-inside">
            <li>{t(locale, 'كل فرع له رابط متجر مستقل وإعدادات منفصلة.', 'Each branch has its own store URL and independent settings.')}</li>
            <li>{t(locale, 'يمكنك التبديل بين الفروع من هذه الصفحة أو من لوحة التحكم الرئيسية.', 'You can switch between branches from this page or from the main dashboard.')}</li>
            <li>{t(locale, 'أعضاء الفريق يمكن إضافتهم لكل فرع على حدة من صفحة إدارة الفريق.', 'Team members can be added per branch from the Team management page.')}</li>
            <li>{t(locale, 'الحد الأقصى هو 10 فروع لكل حساب.', 'The maximum is 10 branches per account.')}</li>
          </ul>
        </CardContent>
      </Card>

      {/* Create Branch Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="sm:max-w-md" dir={isAr ? 'rtl' : 'ltr'}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-primary" />
              {t(locale, 'إنشاء فرع جديد', 'Create New Branch')}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="branch-name-ar">
                {t(locale, 'اسم الفرع (عربي)', 'Branch Name (Arabic)')}
                <span className="text-destructive ms-1">*</span>
              </Label>
              <Input
                id="branch-name-ar"
                value={newBranchName}
                onChange={(e) => setNewBranchName(e.target.value)}
                placeholder={t(locale, 'مثال: فرع الجزائر العاصمة', 'e.g. Algiers Main Branch')}
                maxLength={60}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="branch-name-en">
                {t(locale, 'اسم الفرع (إنجليزي)', 'Branch Name (English)')}
              </Label>
              <Input
                id="branch-name-en"
                value={newBranchNameEn}
                onChange={(e) => setNewBranchNameEn(e.target.value)}
                placeholder={t(locale, 'اختياري — إذا تركته فارغاً سيُستخدم الاسم العربي', 'Optional — Arabic name used if blank')}
                maxLength={60}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              {t(locale,
                'سيتم إنشاء رابط فريد للفرع تلقائياً. يمكنك تغييره لاحقاً من إعدادات الفرع.',
                'A unique URL slug will be generated automatically. You can change it later from branch settings.'
              )}
            </p>
          </div>

          <DialogFooter className="gap-2">
            <DialogClose asChild>
              <Button variant="outline" disabled={isCreating}>
                {t(locale, 'إلغاء', 'Cancel')}
              </Button>
            </DialogClose>
            <Button
              onClick={handleCreate}
              disabled={isCreating || !newBranchName.trim()}
              className="gap-2"
            >
              {isCreating ? (
                <><Loader2 className="h-4 w-4 animate-spin" />{t(locale, 'جاري الإنشاء...', 'Creating...')}</>
              ) : (
                <><Plus className="h-4 w-4" />{t(locale, 'إنشاء الفرع', 'Create Branch')}</>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
