'use client';

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Store,
  User,
  Truck,
  Package,
  Eye,
  Download,
  FileText,
  Edit,
  BarChart3,
  TrendingUp,
  TrendingDown,
  Timer,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';
import { useAppStore } from '@/lib/store';
import type {
  PendingMerchant,
  PendingMerchantRole,
  VerificationItem as MockVerificationItem,
} from '@/lib/mock-data';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';

// ============================================
// TYPES
// ============================================

interface AuditLogEntry {
  id: string;
  merchantId: string;
  merchantName: string;
  merchantNameEn: string;
  adminName: string;
  action: string;
  actionLabelAr: string;
  actionLabelEn: string;
  details: string;
  detailsEn: string;
  timestamp: string;
}

interface ReviewStats {
  totalPending: number;
  approvedToday: number;
  rejectedToday: number;
  avgReviewTime: string;
}

// ============================================
// HELPERS
// ============================================

const ROLE_CONFIG: Record<
  PendingMerchantRole,
  { icon: React.ElementType; labelAr: string; labelEn: string; color: string }
> = {
  store: {
    icon: Store,
    labelAr: 'متجر',
    labelEn: 'Store',
    color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400',
  },
  freelancer: {
    icon: User,
    labelAr: 'مستقل',
    labelEn: 'Freelancer',
    color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400',
  },
  supplier: {
    icon: Package,
    labelAr: 'مورد',
    labelEn: 'Supplier',
    color: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/20 dark:text-cyan-400',
  },
  logistics: {
    icon: Truck,
    labelAr: 'خدمات لوجستية',
    labelEn: 'Logistics',
    color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400',
  },
};

const AUDIT_ACTION_CONFIG: Record<
  string,
  { labelAr: string; labelEn: string; color: string; icon: React.ElementType }
> = {
  approve: {
    labelAr: 'تفعيل',
    labelEn: 'Approve',
    color: 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400',
    icon: CheckCircle,
  },
  approved: {
    labelAr: 'تفعيل',
    labelEn: 'Approved',
    color: 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400',
    icon: CheckCircle,
  },
  reject: {
    labelAr: 'رفض',
    labelEn: 'Reject',
    color: 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400',
    icon: XCircle,
  },
  rejected: {
    labelAr: 'رفض',
    labelEn: 'Rejected',
    color: 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400',
    icon: XCircle,
  },
  request_edit: {
    labelAr: 'طلب تعديل',
    labelEn: 'Request Edit',
    color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400',
    icon: Edit,
  },
  note: {
    labelAr: 'ملاحظة',
    labelEn: 'Note',
    color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400',
    icon: FileText,
  },
  auto_assign: {
    labelAr: 'توزيع تلقائي',
    labelEn: 'Auto-assign',
    color: 'bg-gray-100 text-gray-700 dark:bg-gray-900/20 dark:text-gray-400',
    icon: Timer,
  },
  submitted: {
    labelAr: 'تقديم',
    labelEn: 'Submitted',
    color: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-400',
    icon: FileText,
  },
};

function getActionConfig(action: string) {
  return AUDIT_ACTION_CONFIG[action] || {
    labelAr: action,
    labelEn: action,
    color: 'bg-gray-100 text-gray-700 dark:bg-gray-900/20 dark:text-gray-400',
    icon: FileText,
  };
}

function getRelativeTime(dateStr: string, isAr: boolean): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(hours / 24);
  if (days > 0) return isAr ? `منذ ${days} ${days === 1 ? 'يوم' : 'أيام'}` : `${days} day${days > 1 ? 's' : ''} ago`;
  if (hours > 0) return isAr ? `منذ ${hours} ساعة` : `${hours} hour${hours > 1 ? 's' : ''} ago`;
  return isAr ? 'منذ قليل' : 'just now';
}

function formatTimestamp(ts: string, isAr: boolean): string {
  const d = new Date(ts);
  return d.toLocaleDateString(isAr ? 'ar-SA' : 'en-US', {
    hour: '2-digit',
    minute: '2-digit',
    day: 'numeric',
    month: 'short',
  });
}

// ============================================
// REQUEST CARD
// ============================================

interface RequestCardProps {
  merchant: PendingMerchant;
  isAr: boolean;
  onViewDetails: (m: PendingMerchant) => void;
}

function RequestCard({ merchant, isAr, onViewDetails }: RequestCardProps) {
  const roleCfg = ROLE_CONFIG[merchant.role];
  const RoleIcon = roleCfg.icon;
  const isUrgent = merchant.priority === 'urgent';

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <Avatar className="size-10">
            <AvatarFallback className={roleCfg.color}>
              <RoleIcon className="size-5" />
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-medium text-sm truncate">
                {isAr ? merchant.name : merchant.nameEn}
              </span>
              {isUrgent && (
                <Badge className="bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400 border-0 text-[10px] px-1.5">
                  {isAr ? 'عاجل' : 'Urgent'}
                </Badge>
              )}
              <Badge variant="secondary" className={`text-[10px] px-1.5 border-0 ${roleCfg.color}`}>
                {isAr ? roleCfg.labelAr : roleCfg.labelEn}
              </Badge>
            </div>
            {merchant.storeName && (
              <p className="text-xs text-muted-foreground truncate">
                {isAr ? merchant.storeName : merchant.storeNameEn}
              </p>
            )}
            <p className="text-xs text-muted-foreground mt-1">
              {getRelativeTime(merchant.registeredAt, isAr)}
            </p>
            <div className="flex items-center gap-3 mt-2">
              <span className="text-xs text-green-600 flex items-center gap-1">
                <CheckCircle className="size-3" />
                {isAr ? 'هاتف' : 'Phone'}
              </span>
              {merchant.emailVerified ? (
                <span className="text-xs text-green-600 flex items-center gap-1">
                  <CheckCircle className="size-3" />
                  {isAr ? 'بريد' : 'Email'}
                </span>
              ) : (
                <span className="text-xs text-yellow-600 flex items-center gap-1">
                  <Clock className="size-3" />
                  {isAr ? 'بريد' : 'Email'}
                </span>
              )}
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="shrink-0 text-xs"
            onClick={() => onViewDetails(merchant)}
          >
            {isAr ? 'عرض التفاصيل' : 'View Details'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================
// DETAIL MODAL
// ============================================

interface DetailModalProps {
  merchant: PendingMerchant | null;
  open: boolean;
  onClose: () => void;
  onApprove: (m: PendingMerchant) => void;
  onReject: (m: PendingMerchant) => void;
  onRequestEdit: (m: PendingMerchant) => void;
  isAr: boolean;
  loading: boolean;
}

function DetailModal({
  merchant,
  open,
  onClose,
  onApprove,
  onReject,
  onRequestEdit,
  isAr,
  loading,
}: DetailModalProps) {
  if (!merchant) return null;
  const roleCfg = ROLE_CONFIG[merchant.role];

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isAr ? merchant.name : merchant.nameEn}
            <Badge variant="secondary" className={`text-xs border-0 ${roleCfg.color}`}>
              {isAr ? roleCfg.labelAr : roleCfg.labelEn}
            </Badge>
          </DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-[60vh] pr-2">
          <div className="space-y-4">
            {/* Merchant Info */}
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-muted-foreground">{isAr ? 'البريد' : 'Email'}</span>
                <p className="font-medium">{merchant.email}</p>
              </div>
              <div>
                <span className="text-muted-foreground">{isAr ? 'الهاتف' : 'Phone'}</span>
                <p className="font-medium">{merchant.phone}</p>
              </div>
              {merchant.storeName && (
                <div className="col-span-2">
                  <span className="text-muted-foreground">{isAr ? 'اسم المتجر' : 'Store Name'}</span>
                  <p className="font-medium">{isAr ? merchant.storeName : merchant.storeNameEn}</p>
                </div>
              )}
              <div>
                <span className="text-muted-foreground">{isAr ? 'تاريخ التسجيل' : 'Registered'}</span>
                <p className="font-medium">{getRelativeTime(merchant.registeredAt, isAr)}</p>
              </div>
              <div>
                <span className="text-muted-foreground">{isAr ? 'الأولوية' : 'Priority'}</span>
                <Badge
                  className={
                    merchant.priority === 'urgent'
                      ? 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400 border-0'
                      : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400 border-0'
                  }
                >
                  {merchant.priority === 'urgent'
                    ? isAr ? 'عاجل' : 'Urgent'
                    : isAr ? 'عادي' : 'Standard'}
                </Badge>
              </div>
            </div>

            <Separator />

            {/* Documents */}
            <div>
              <h4 className="text-sm font-semibold mb-3">
                {isAr ? '📋 المستندات' : '📋 Documents'}
              </h4>
              <div className="space-y-2">
                {merchant.documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-center justify-between p-3 rounded-lg border bg-muted/30"
                  >
                    <div className="flex items-center gap-2">
                      <FileText className="size-4 text-muted-foreground" />
                      <span className="text-sm">{isAr ? doc.name : doc.nameEn}</span>
                      {doc.status === 'pending' && (
                        <Badge variant="secondary" className="bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400 border-0 text-[10px]">
                          {isAr ? 'قيد المراجعة' : 'Pending'}
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon" className="size-8">
                        <Eye className="size-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="size-8">
                        <Download className="size-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
              {/* Document preview placeholder */}
              <div className="mt-3 p-8 rounded-lg border-2 border-dashed bg-muted/20 text-center">
                <FileText className="size-8 mx-auto text-muted-foreground/50" />
                <p className="text-xs text-muted-foreground mt-2">
                  {isAr ? 'معاينة المستند ستظهر هنا' : 'Document preview will appear here'}
                </p>
              </div>
            </div>

            <Separator />

            {/* Verification Items */}
            <div>
              <h4 className="text-sm font-semibold mb-3">
                {isAr ? '✅ عناصر التوثيق' : '✅ Verification Items'}
              </h4>
              <div className="space-y-2">
                {merchant.verificationItems.map((item) => {
                  const statusIcon =
                    item.status === 'verified' ? (
                      <CheckCircle className="size-4 text-green-600" />
                    ) : item.status === 'pending' ? (
                      <Clock className="size-4 text-yellow-600" />
                    ) : item.status === 'rejected' ? (
                      <XCircle className="size-4 text-red-600" />
                    ) : (
                      <AlertTriangle className="size-4 text-orange-600" />
                    );
                  return (
                    <div key={item.id} className="flex items-center gap-2 text-sm">
                      {statusIcon}
                      <span>{isAr ? item.labelAr : item.labelEn}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </ScrollArea>
        <DialogFooter className="flex-row gap-2 sm:justify-start">
          <Button
            className="bg-green-600 hover:bg-green-700 text-white"
            onClick={() => onApprove(merchant)}
            disabled={loading}
          >
            {loading ? <Loader2 className="size-4 animate-spin" /> : <CheckCircle className="size-4" />}
            {isAr ? 'تفعيل الحساب' : 'Approve'}
          </Button>
          <Button
            variant="destructive"
            onClick={() => onReject(merchant)}
            disabled={loading}
          >
            <XCircle className="size-4" />
            {isAr ? 'رفض الطلب' : 'Reject'}
          </Button>
          <Button
            variant="outline"
            className="border-yellow-300 text-yellow-700 hover:bg-yellow-50 dark:border-yellow-700 dark:text-yellow-400 dark:hover:bg-yellow-900/20"
            onClick={() => onRequestEdit(merchant)}
            disabled={loading}
          >
            <Edit className="size-4" />
            {isAr ? 'طلب تعديل' : 'Request Edit'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ============================================
// REJECTION DIALOG
// ============================================

interface RejectionDialogProps {
  merchant: PendingMerchant | null;
  open: boolean;
  onClose: () => void;
  onSubmit: (merchant: PendingMerchant, reason: string) => void;
  isAr: boolean;
  loading: boolean;
}

function RejectionDialog({
  merchant,
  open,
  onClose,
  onSubmit,
  isAr,
  loading,
}: RejectionDialogProps) {
  const [reason, setReason] = useState('');

  const predefinedReasons = isAr
    ? ['مستندات غير واضحة', 'بيانات غير مطابقة', 'مستند منتهي الصلاحية']
    : ['Unclear documents', 'Data mismatch', 'Expired document'];

  const handlePredefinedClick = (r: string) => {
    setReason((prev) => (prev ? `${prev}، ${r}` : r));
  };

  const handleSubmit = () => {
    if (!reason.trim() || !merchant) return;
    onSubmit(merchant, reason.trim());
    setReason('');
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-red-600 flex items-center gap-2">
            <XCircle className="size-5" />
            {isAr ? 'رفض طلب التفعيل' : 'Reject Activation Request'}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            {isAr
              ? `يرجى إدخال سبب الرفض لطلب "${merchant ? (isAr ? merchant.name : merchant.nameEn) : ''}"`
              : `Please enter rejection reason for "${merchant ? (isAr ? merchant.name : merchant.nameEn) : ''}"`}
          </p>
          <Textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder={
              isAr
                ? 'اكتب سبب الرفض هنا...'
                : 'Write rejection reason here...'
            }
            rows={3}
          />
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">
              {isAr ? 'أسباب شائعة:' : 'Common reasons:'}
            </p>
            <div className="flex flex-wrap gap-2">
              {predefinedReasons.map((r) => (
                <button
                  key={r}
                  onClick={() => handlePredefinedClick(r)}
                  className="text-xs px-2 py-1 rounded border hover:bg-muted transition-colors"
                >
                  {r}
                </button>
              ))}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            {isAr ? 'إلغاء' : 'Cancel'}
          </Button>
          <Button
            variant="destructive"
            onClick={handleSubmit}
            disabled={!reason.trim() || loading}
          >
            {loading ? <Loader2 className="size-4 animate-spin" /> : null}
            {isAr ? 'تأكيد الرفض' : 'Confirm Rejection'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ============================================
// REQUEST EDIT DIALOG
// ============================================

interface RequestEditDialogProps {
  merchant: PendingMerchant | null;
  open: boolean;
  onClose: () => void;
  onSubmit: (merchant: PendingMerchant, items: string[], message: string) => void;
  isAr: boolean;
  loading: boolean;
}

function RequestEditDialog({
  merchant,
  open,
  onClose,
  onSubmit,
  isAr,
  loading,
}: RequestEditDialogProps) {
  const [checkedItems, setCheckedItems] = useState<string[]>([]);
  const [message, setMessage] = useState('');

  React.useEffect(() => {
    if (merchant && open) {
      setCheckedItems(
        merchant.verificationItems
          .filter((i) => i.status === 'rejected')
          .map((i) => i.id)
      );
      setMessage('');
    }
  }, [merchant, open]);

  const toggleItem = (id: string) => {
    setCheckedItems((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleSubmit = () => {
    if (!merchant || checkedItems.length === 0) return;
    onSubmit(merchant, checkedItems, message.trim());
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-yellow-700 dark:text-yellow-400">
            <Edit className="size-5" />
            {isAr ? 'طلب تعديل المستندات' : 'Request Document Edit'}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            {isAr
              ? `اختر العناصر التي تحتاج تعديل من طلب "${merchant ? (isAr ? merchant.name : merchant.nameEn) : ''}"`
              : `Select items that need editing for "${merchant ? (isAr ? merchant.name : merchant.nameEn) : ''}"`}
          </p>
          <div className="space-y-2">
            {merchant?.verificationItems.map((item) => (
              <label
                key={item.id}
                className="flex items-center gap-3 p-2 rounded hover:bg-muted transition-colors cursor-pointer"
              >
                <Checkbox
                  checked={checkedItems.includes(item.id)}
                  onCheckedChange={() => toggleItem(item.id)}
                />
                <span className="text-sm">{isAr ? item.labelAr : item.labelEn}</span>
                {item.status === 'rejected' && (
                  <Badge className="bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400 border-0 text-[10px]">
                    {isAr ? 'مرفوض' : 'Rejected'}
                  </Badge>
                )}
              </label>
            ))}
          </div>
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={
              isAr ? 'أضف رسالة توضيحية (اختياري)...' : 'Add a note (optional)...'
            }
            rows={2}
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            {isAr ? 'إلغاء' : 'Cancel'}
          </Button>
          <Button
            className="bg-yellow-600 hover:bg-yellow-700 text-white"
            onClick={handleSubmit}
            disabled={checkedItems.length === 0 || loading}
          >
            {loading ? <Loader2 className="size-4 animate-spin" /> : <Edit className="size-4" />}
            {isAr ? 'إرسال طلب التعديل' : 'Send Edit Request'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ============================================
// AUDIT TRAIL
// ============================================

interface AuditTrailProps {
  isAr: boolean;
  auditLogs: AuditLogEntry[];
  loading: boolean;
}

function AuditTrail({ isAr, auditLogs, loading }: AuditTrailProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">
          {isAr ? '📝 سجل التدقيق' : '📝 Audit Trail'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="size-6 animate-spin text-muted-foreground" />
          </div>
        ) : auditLogs.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            {isAr ? 'لا توجد سجلات' : 'No audit logs'}
          </p>
        ) : (
          <div className="relative space-y-0">
            {auditLogs.map((log, i) => {
              const actionCfg = getActionConfig(log.action);
              const ActionIcon = actionCfg.icon;
              return (
                <div key={log.id} className="flex gap-3 pb-4 last:pb-0">
                  {/* Timeline dot & line */}
                  <div className="flex flex-col items-center">
                    <div className={`p-1.5 rounded-full ${actionCfg.color} shrink-0`}>
                      <ActionIcon className="size-3" />
                    </div>
                    {i < auditLogs.length - 1 && (
                      <div className="w-px flex-1 bg-border mt-1" />
                    )}
                  </div>
                  {/* Content */}
                  <div className="flex-1 min-w-0 pb-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant="secondary" className={`text-[10px] border-0 ${actionCfg.color}`}>
                        {isAr ? actionCfg.labelAr : actionCfg.labelEn}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {formatTimestamp(log.timestamp, isAr)}
                      </span>
                    </div>
                    <p className="text-sm font-medium mt-0.5">
                      {isAr ? log.merchantName : log.merchantNameEn}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {isAr ? log.details : log.detailsEn}
                    </p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      {isAr ? 'بواسطة' : 'by'} {log.adminName}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ============================================
// STATS ROW
// ============================================

interface StatsRowProps {
  isAr: boolean;
  stats: ReviewStats | null;
  merchantsCount: number;
}

function StatsRow({ isAr, stats, merchantsCount }: StatsRowProps) {
  const totalPending = stats?.totalPending ?? merchantsCount;
  const approvedToday = stats?.approvedToday ?? 0;
  const rejectedToday = stats?.rejectedToday ?? 0;
  const avgReviewTime = stats?.avgReviewTime ?? (isAr ? '4.2 ساعة' : '4.2 hrs');

  const statsData = [
    {
      label: isAr ? 'إجمالي المعلقة' : 'Total Pending',
      value: totalPending,
      icon: Clock,
      color: 'text-yellow-600',
      bg: 'bg-yellow-100 dark:bg-yellow-900/20',
    },
    {
      label: isAr ? 'مفعلة اليوم' : 'Approved Today',
      value: approvedToday,
      icon: TrendingUp,
      color: 'text-green-600',
      bg: 'bg-green-100 dark:bg-green-900/20',
    },
    {
      label: isAr ? 'مرفوضة اليوم' : 'Rejected Today',
      value: rejectedToday,
      icon: TrendingDown,
      color: 'text-red-600',
      bg: 'bg-red-100 dark:bg-red-900/20',
    },
    {
      label: isAr ? 'متوسط وقت المراجعة' : 'Avg Review Time',
      value: avgReviewTime,
      icon: Timer,
      color: 'text-blue-600',
      bg: 'bg-blue-100 dark:bg-blue-900/20',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {statsData.map((s) => {
        const Icon = s.icon;
        return (
          <Card key={s.label} className="py-4">
            <CardContent className="p-4 flex items-center gap-3">
              <div className={`p-2 rounded-lg ${s.bg}`}>
                <Icon className={`size-4 ${s.color}`} />
              </div>
              <div>
                <p className="text-lg font-bold">{s.value}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

// ============================================
// MAIN COMPONENT
// ============================================

export default function AdminReviewQueue() {
  const { locale } = useAppStore();
  const isAr = locale === 'ar';

  const [activeTab, setActiveTab] = useState<string>('all');
  const [selectedMerchant, setSelectedMerchant] = useState<PendingMerchant | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [merchants, setMerchants] = useState<PendingMerchant[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [stats, setStats] = useState<ReviewStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Fetch pending merchants on mount
  const fetchMerchants = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/review');
      if (!res.ok) {
        // Server error - set empty data silently instead of showing error toast
        setMerchants([]);
        setStats({ totalPending: 0, approvedToday: 0, rejectedToday: 0, avgReviewTime: '—' });
        return;
      }
      const data = await res.json();
      if (data.success) {
        setMerchants(data.merchants || []);
        setStats(data.stats || null);
      } else {
        // API returned success: false - set empty data silently
        setMerchants([]);
        setStats({ totalPending: 0, approvedToday: 0, rejectedToday: 0, avgReviewTime: '—' });
      }
    } catch (error) {
      console.error('Failed to fetch merchants:', error);
      // Network error - set empty data silently, don't show error toast
      setMerchants([]);
      setStats({ totalPending: 0, approvedToday: 0, rejectedToday: 0, avgReviewTime: '—' });
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch audit logs
  const fetchAuditLogs = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/review?action=audit');
      if (!res.ok) return; // Silently ignore audit log errors
      const data = await res.json();
      if (data.success) {
        setAuditLogs(data.auditLogs || []);
      }
    } catch (error) {
      console.error('Failed to fetch audit logs:', error);
      // Audit logs don't block the main view
    }
  }, []);

  useEffect(() => {
    fetchMerchants();
    fetchAuditLogs();
  }, [fetchMerchants, fetchAuditLogs]);

  // Filter merchants
  const filteredMerchants = useMemo(() => {
    if (activeTab === 'all') return merchants;
    return merchants.filter((m) => m.role === activeTab);
  }, [merchants, activeTab]);

  // Sort: urgent first
  const sortedMerchants = useMemo(() => {
    return [...filteredMerchants].sort((a, b) => {
      if (a.priority === 'urgent' && b.priority !== 'urgent') return -1;
      if (a.priority !== 'urgent' && b.priority === 'urgent') return 1;
      return new Date(a.registeredAt).getTime() - new Date(b.registeredAt).getTime();
    });
  }, [filteredMerchants]);

  const handleViewDetails = (m: PendingMerchant) => {
    setSelectedMerchant(m);
    setDetailOpen(true);
  };

  const handleApprove = async (m: PendingMerchant) => {
    try {
      setActionLoading(true);
      const res = await fetch(`/api/admin/review/${m.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'approve', adminId: 'admin-001' }),
      });
      if (!res.ok) throw new Error('Failed to approve');
      const data = await res.json();
      if (data.success) {
        setMerchants((prev) => prev.filter((item) => item.id !== m.id));
        setDetailOpen(false);
        setSelectedMerchant(null);
        toast.success(isAr ? `تم تفعيل حساب "${isAr ? m.name : m.nameEn}"` : `Approved "${isAr ? m.name : m.nameEn}"`);
        // Refresh audit logs and stats
        fetchAuditLogs();
        fetchMerchants();
      }
    } catch (error) {
      console.error('Approve failed:', error);
      toast.error(isAr ? 'فشل تفعيل الحساب' : 'Failed to approve account');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectClick = (m: PendingMerchant) => {
    setSelectedMerchant(m);
    setDetailOpen(false);
    setRejectOpen(true);
  };

  const handleRejectSubmit = async (m: PendingMerchant, reason: string) => {
    try {
      setActionLoading(true);
      const res = await fetch(`/api/admin/review/${m.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reject', reason, adminId: 'admin-001' }),
      });
      if (!res.ok) throw new Error('Failed to reject');
      const data = await res.json();
      if (data.success) {
        setRejectOpen(false);
        setSelectedMerchant(null);
        toast.success(isAr ? `تم رفض طلب "${isAr ? m.name : m.nameEn}"` : `Rejected "${isAr ? m.name : m.nameEn}"`);
        fetchAuditLogs();
        fetchMerchants();
      }
    } catch (error) {
      console.error('Reject failed:', error);
      toast.error(isAr ? 'فشل رفض الطلب' : 'Failed to reject request');
    } finally {
      setActionLoading(false);
    }
  };

  const handleEditClick = (m: PendingMerchant) => {
    setSelectedMerchant(m);
    setDetailOpen(false);
    setEditOpen(true);
  };

  const handleEditSubmit = async (m: PendingMerchant, items: string[], message: string) => {
    try {
      setActionLoading(true);
      const res = await fetch(`/api/admin/review/${m.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'request_edit', reason: message, editItems: items, adminId: 'admin-001' }),
      });
      if (!res.ok) throw new Error('Failed to request edit');
      const data = await res.json();
      if (data.success) {
        setEditOpen(false);
        setSelectedMerchant(null);
        toast.success(isAr ? `تم إرسال طلب تعديل لـ "${isAr ? m.name : m.nameEn}"` : `Edit request sent to "${isAr ? m.name : m.nameEn}"`);
        fetchAuditLogs();
        fetchMerchants();
      }
    } catch (error) {
      console.error('Request edit failed:', error);
      toast.error(isAr ? 'فشل إرسال طلب التعديل' : 'Failed to send edit request');
    } finally {
      setActionLoading(false);
    }
  };

  const tabFilters = [
    { value: 'all', labelAr: 'الكل', labelEn: 'All' },
    { value: 'store', labelAr: 'متجر', labelEn: 'Store' },
    { value: 'freelancer', labelAr: 'مستقل', labelEn: 'Freelancer' },
    { value: 'supplier', labelAr: 'مورد', labelEn: 'Supplier' },
    { value: 'logistics', labelAr: 'لوجستيات', labelEn: 'Logistics' },
  ];

  return (
    <div className="space-y-6">
      {/* Stats Row */}
      <StatsRow isAr={isAr} stats={stats} merchantsCount={merchants.length} />

      {/* Review Queue */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <BarChart3 className="size-5" />
            <span>{isAr ? 'طلبات التفعيل المعلقة' : 'Pending Activation Requests'}</span>
            <Badge className="bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400 border-0">
              {merchants.length}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filter Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              {tabFilters.map((t) => (
                <TabsTrigger key={t.value} value={t.value}>
                  {isAr ? t.labelAr : t.labelEn}
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value={activeTab} className="mt-4">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="size-8 animate-spin text-muted-foreground" />
                </div>
              ) : sortedMerchants.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <CheckCircle className="size-12 mx-auto mb-3 text-green-400" />
                  <p className="text-sm">
                    {isAr ? 'لا توجد طلبات معلقة' : 'No pending requests'}
                  </p>
                </div>
              ) : (
                <div className="grid gap-3 md:grid-cols-2">
                  {sortedMerchants.map((m) => (
                    <RequestCard
                      key={m.id}
                      merchant={m}
                      isAr={isAr}
                      onViewDetails={handleViewDetails}
                    />
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Audit Trail */}
      <AuditTrail isAr={isAr} auditLogs={auditLogs} loading={false} />

      {/* Detail Modal */}
      <DetailModal
        merchant={selectedMerchant}
        open={detailOpen}
        onClose={() => {
          setDetailOpen(false);
          setSelectedMerchant(null);
        }}
        onApprove={handleApprove}
        onReject={handleRejectClick}
        onRequestEdit={handleEditClick}
        isAr={isAr}
        loading={actionLoading}
      />

      {/* Rejection Dialog */}
      <RejectionDialog
        merchant={selectedMerchant}
        open={rejectOpen}
        onClose={() => {
          setRejectOpen(false);
          setSelectedMerchant(null);
        }}
        onSubmit={handleRejectSubmit}
        isAr={isAr}
        loading={actionLoading}
      />

      {/* Request Edit Dialog */}
      <RequestEditDialog
        merchant={selectedMerchant}
        open={editOpen}
        onClose={() => {
          setEditOpen(false);
          setSelectedMerchant(null);
        }}
        onSubmit={handleEditSubmit}
        isAr={isAr}
        loading={actionLoading}
      />
    </div>
  );
}
