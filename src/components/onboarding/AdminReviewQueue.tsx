'use client';

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Store as StoreIcon,
  User,
  Truck,
  Package,
  Eye,
  FileText,
  Edit,
  BarChart3,
  TrendingUp,
  TrendingDown,
  Timer,
  Loader2,
  Search,
  ChevronsLeft,
  ChevronsRight,
  ArrowLeft,
  ArrowRight,
  Filter,
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
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

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

interface PaginationData {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

// ============================================
// HELPERS
// ============================================

const ROLE_CONFIG: Record<
  PendingMerchantRole,
  { icon: React.ElementType; labelAr: string; labelEn: string; color: string }
> = {
  store: {
    icon: StoreIcon,
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
// TABLE SKELETON
// ============================================

function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, i) => (
        <TableRow key={i}>
          <TableCell className="ps-4">
            <div className="flex items-center gap-3">
              <Skeleton className="h-9 w-9 rounded-full" />
              <div className="space-y-1.5">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-3 w-20" />
              </div>
            </div>
          </TableCell>
          <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
          <TableCell><Skeleton className="h-6 w-16 rounded-full" /></TableCell>
          <TableCell><Skeleton className="h-4 w-24" /></TableCell>
          <TableCell><Skeleton className="h-4 w-20" /></TableCell>
          <TableCell><Skeleton className="h-8 w-24 rounded" /></TableCell>
        </TableRow>
      ))}
    </>
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
  const [activePreviewDoc, setActivePreviewDoc] = useState<any>(null);

  if (!merchant) return null;

  const roleCfg = ROLE_CONFIG[merchant.role];
  const RoleIcon = roleCfg.icon;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Avatar className="size-8">
              <AvatarFallback className={roleCfg.color}>
                <RoleIcon className="size-4" />
              </AvatarFallback>
            </Avatar>
            <span>{isAr ? merchant.name : merchant.nameEn}</span>
            {merchant.priority === 'urgent' && (
              <Badge className="bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400 border-0 text-[10px]">
                {isAr ? 'عاجل' : 'Urgent'}
              </Badge>
            )}
          </DialogTitle>
          <DialogDescription className="sr-only">
            {isAr ? 'تفاصيل طلب التوثيق' : 'Verification request details'}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 overflow-auto">
          <div className="space-y-4 px-1">
            {/* Basic Info */}
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-muted-foreground text-xs">{isAr ? 'النوع' : 'Role'}</p>
                <Badge variant="secondary" className={`text-[10px] border-0 ${roleCfg.color}`}>
                  {isAr ? roleCfg.labelAr : roleCfg.labelEn}
                </Badge>
              </div>
              {merchant.storeName && (
                <div>
                  <p className="text-muted-foreground text-xs">{isAr ? 'اسم المتجر' : 'Store Name'}</p>
                  <p className="font-medium">{isAr ? merchant.storeName : merchant.storeNameEn}</p>
                </div>
              )}
              <div>
                <p className="text-muted-foreground text-xs">{isAr ? 'البريد الإلكتروني' : 'Email'}</p>
                <p className="font-medium">{merchant.email || '—'}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs">{isAr ? 'الهاتف' : 'Phone'}</p>
                <p className="font-medium">{merchant.phone || '—'}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs">{isAr ? 'تاريخ التسجيل' : 'Registered'}</p>
                <p className="font-medium">{formatTimestamp(merchant.registeredAt, isAr)}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs">{isAr ? 'التحقق' : 'Verification'}</p>
                <div className="flex items-center gap-2">
                  <span className={`text-xs flex items-center gap-1 ${merchant.phoneVerified ? 'text-green-600' : 'text-yellow-600'}`}>
                    {merchant.phoneVerified ? <CheckCircle className="size-3" /> : <Clock className="size-3" />}
                    {isAr ? 'هاتف' : 'Phone'}
                  </span>
                  <span className={`text-xs flex items-center gap-1 ${merchant.emailVerified ? 'text-green-600' : 'text-yellow-600'}`}>
                    {merchant.emailVerified ? <CheckCircle className="size-3" /> : <Clock className="size-3" />}
                    {isAr ? 'بريد' : 'Email'}
                  </span>
                </div>
              </div>
            </div>

            <Separator />

            {/* Verification Items */}
            <div>
              <p className="text-sm font-semibold mb-3">
                {isAr ? 'مستندات التوثيق' : 'Verification Documents'}
              </p>
              <div className="space-y-2">
                {merchant.verificationItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-3 rounded-lg border bg-muted/30"
                  >
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <FileText className="size-4 text-muted-foreground shrink-0" />
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">
                          {isAr ? item.labelAr : item.labelEn}
                        </p>
                        {item.rejectionReason && (
                          <p className="text-xs text-red-600 mt-0.5">{item.rejectionReason}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {item.status === 'pending' && (
                        <Badge className="bg-yellow-100 text-yellow-700 border-0 text-[10px]">
                          {isAr ? 'معلق' : 'Pending'}
                        </Badge>
                      )}
                      {item.status === 'approved' && (
                        <Badge className="bg-green-100 text-green-700 border-0 text-[10px]">
                          {isAr ? 'مفعّل' : 'Approved'}
                        </Badge>
                      )}
                      {item.status === 'rejected' && (
                        <Badge className="bg-red-100 text-red-700 border-0 text-[10px]">
                          {isAr ? 'مرفوض' : 'Rejected'}
                        </Badge>
                      )}
                      {item.fileUrl && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-6 text-xs px-2"
                          onClick={() => setActivePreviewDoc(item)}
                        >
                          <Eye className="size-3 me-1" />
                          {isAr ? 'عرض' : 'View'}
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Document Preview */}
            {activePreviewDoc && (
              <div className="rounded-lg border overflow-hidden">
                <div className="flex items-center justify-between px-3 py-2 bg-muted">
                  <p className="text-xs font-medium">
                    {isAr ? activePreviewDoc.labelAr : activePreviewDoc.labelEn}
                  </p>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-6 text-xs"
                    onClick={() => setActivePreviewDoc(null)}
                  >
                    {isAr ? 'إغلاق' : 'Close'}
                  </Button>
                </div>
                <div className="p-4 flex items-center justify-center bg-muted/20 min-h-32">
                  {activePreviewDoc.fileUrl?.match(/\.(jpg|jpeg|png|webp|gif)$/i) ? (
                    <img
                      src={activePreviewDoc.fileUrl}
                      alt={activePreviewDoc.labelEn}
                      className="max-h-64 max-w-full object-contain rounded"
                    />
                  ) : (
                    <div className="text-center">
                      <FileText className="size-8 text-muted-foreground mx-auto mb-2" />
                      <a
                        href={activePreviewDoc.fileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-primary underline"
                      >
                        {isAr ? 'فتح الملف' : 'Open File'}
                      </a>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={onClose} disabled={loading} className="sm:me-auto">
            {isAr ? 'إغلاق' : 'Close'}
          </Button>
          <Button
            variant="outline"
            className="border-yellow-400 text-yellow-700 hover:bg-yellow-50 gap-2"
            onClick={() => onRequestEdit(merchant)}
            disabled={loading}
          >
            <Edit className="size-4" />
            {isAr ? 'طلب تعديل' : 'Request Edit'}
          </Button>
          <Button
            variant="outline"
            className="border-red-400 text-red-700 hover:bg-red-50 gap-2"
            onClick={() => onReject(merchant)}
            disabled={loading}
          >
            <XCircle className="size-4" />
            {isAr ? 'رفض' : 'Reject'}
          </Button>
          <Button
            className="bg-green-600 hover:bg-green-700 text-white gap-2"
            onClick={() => onApprove(merchant)}
            disabled={loading}
          >
            {loading ? <Loader2 className="size-4 animate-spin" /> : <CheckCircle className="size-4" />}
            {isAr ? 'تفعيل' : 'Approve'}
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
  onSubmit: (m: PendingMerchant, reason: string) => void;
  isAr: boolean;
  loading: boolean;
}

function RejectionDialog({ merchant, open, onClose, onSubmit, isAr, loading }: RejectionDialogProps) {
  const [reason, setReason] = useState('');

  React.useEffect(() => {
    if (!open) setReason('');
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-700 dark:text-red-400">
            <XCircle className="size-5" />
            {isAr ? 'رفض الطلب' : 'Reject Request'}
          </DialogTitle>
          <DialogDescription className="sr-only">
            {isAr ? 'أدخل سبب الرفض' : 'Enter rejection reason'}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            {isAr
              ? `سيتم إشعار "${merchant?.name}" بسبب الرفض.`
              : `"${merchant?.nameEn}" will be notified with this rejection reason.`}
          </p>
          <Textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder={isAr ? 'أدخل سبب الرفض...' : 'Enter rejection reason...'}
            rows={3}
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            {isAr ? 'إلغاء' : 'Cancel'}
          </Button>
          <Button
            variant="destructive"
            onClick={() => merchant && onSubmit(merchant, reason)}
            disabled={!reason.trim() || loading}
          >
            {loading ? <Loader2 className="size-4 animate-spin" /> : <XCircle className="size-4" />}
            {isAr ? 'تأكيد الرفض' : 'Confirm Reject'}
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
  onSubmit: (m: PendingMerchant, items: string[], message: string) => void;
  isAr: boolean;
  loading: boolean;
}

function RequestEditDialog({ merchant, open, onClose, onSubmit, isAr, loading }: RequestEditDialogProps) {
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
          <DialogDescription className="sr-only">
            {isAr ? 'نموذج لاختيار الحقول التي تحتاج لتعديل من قبل التاجر' : 'Form to select the fields that need correction by the merchant'}
          </DialogDescription>
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
  const isRTL = isAr;
  const dir = isAr ? 'rtl' : 'ltr';

  // Modals state
  const [selectedMerchant, setSelectedMerchant] = useState<PendingMerchant | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);

  // Data state
  const [merchants, setMerchants] = useState<PendingMerchant[]>([]);
  const [stats, setStats] = useState<ReviewStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');

  // Pagination state
  const [pagination, setPagination] = useState<PaginationData>({
    page: 1,
    pageSize: 10,
    total: 0,
    totalPages: 0,
  });

  // ---- Fetch data ----
  const fetchMerchants = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/review');
      if (!res.ok) {
        setMerchants([]);
        setStats({ totalPending: 0, approvedToday: 0, rejectedToday: 0, avgReviewTime: '—' });
        return;
      }
      const data = await res.json();
      if (data.success) {
        setMerchants(data.merchants || []);
        setStats(data.stats || null);
      } else {
        setMerchants([]);
        setStats({ totalPending: 0, approvedToday: 0, rejectedToday: 0, avgReviewTime: '—' });
      }
    } catch (error) {
      console.error('Failed to fetch merchants:', error);
      setMerchants([]);
      setStats({ totalPending: 0, approvedToday: 0, rejectedToday: 0, avgReviewTime: '—' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMerchants();
  }, [fetchMerchants]);

  // ---- Filter & sort ----
  const filteredMerchants = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return merchants
      .filter((m) => {
        if (roleFilter !== 'all' && m.role !== roleFilter) return false;
        if (priorityFilter !== 'all' && m.priority !== priorityFilter) return false;
        if (q) {
          const matchName = m.name?.toLowerCase().includes(q) || m.nameEn?.toLowerCase().includes(q);
          const matchStore = m.storeName?.toLowerCase().includes(q) || m.storeNameEn?.toLowerCase().includes(q);
          const matchEmail = m.email?.toLowerCase().includes(q);
          const matchPhone = m.phone?.toLowerCase().includes(q);
          if (!matchName && !matchStore && !matchEmail && !matchPhone) return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (a.priority === 'urgent' && b.priority !== 'urgent') return -1;
        if (a.priority !== 'urgent' && b.priority === 'urgent') return 1;
        return new Date(a.registeredAt).getTime() - new Date(b.registeredAt).getTime();
      });
  }, [merchants, searchQuery, roleFilter, priorityFilter]);

  // Compute pagination
  const paginatedMerchants = useMemo(() => {
    const total = filteredMerchants.length;
    const totalPages = Math.ceil(total / pagination.pageSize) || 1;
    const page = Math.min(pagination.page, totalPages);
    const start = (page - 1) * pagination.pageSize;
    const end = start + pagination.pageSize;
    setPagination((prev) => ({ ...prev, total, totalPages, page }));
    return filteredMerchants.slice(start, end);
  }, [filteredMerchants, pagination.page, pagination.pageSize]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setPagination((prev) => ({ ...prev, page: 1 }));
  }, [searchQuery, roleFilter, priorityFilter]);

  const goToPage = useCallback(
    (page: number) => {
      setPagination((prev) => ({
        ...prev,
        page: Math.max(1, Math.min(page, prev.totalPages)),
      }));
    },
    []
  );

  const handlePageSizeChange = (val: string) => {
    setPagination((prev) => ({ ...prev, pageSize: Number(val), page: 1 }));
  };

  const pageNumbers = useMemo(() => {
    const { page, totalPages } = pagination;
    if (totalPages <= 5) return Array.from({ length: totalPages }, (_, i) => i + 1);
    const pages: number[] = [];
    if (page <= 3) {
      pages.push(1, 2, 3, 4, totalPages);
    } else if (page >= totalPages - 2) {
      pages.push(1, totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
    } else {
      pages.push(1, page - 1, page, page + 1, totalPages);
    }
    return pages;
  }, [pagination]);

  // ---- Handlers ----
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
        toast.success(isAr ? `تم تفعيل حساب "${m.name}"` : `Approved "${m.nameEn}"`);
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
        toast.success(isAr ? `تم رفض طلب "${m.name}"` : `Rejected "${m.nameEn}"`);
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
        toast.success(isAr ? `تم إرسال طلب تعديل لـ "${m.name}"` : `Edit request sent to "${m.nameEn}"`);
        fetchMerchants();
      }
    } catch (error) {
      console.error('Request edit failed:', error);
      toast.error(isAr ? 'فشل إرسال طلب التعديل' : 'Failed to send edit request');
    } finally {
      setActionLoading(false);
    }
  };

  // ============================================
  // RENDER
  // ============================================

  return (
    <div className="space-y-6" dir={dir}>
      {/* Stats Row */}
      <StatsRow isAr={isAr} stats={stats} merchantsCount={merchants.length} />

      {/* Main Table Card */}
      <Card>
        {/* ---- Header ---- */}
        <CardHeader className="border-b pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <CardTitle className="flex items-center gap-2 text-base">
              <BarChart3 className="size-5" />
              <span>{isAr ? 'طلبات التفعيل المعلقة' : 'Pending Activation Requests'}</span>
              <Badge className="bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400 border-0">
                {filteredMerchants.length}
              </Badge>
            </CardTitle>
          </div>

          {/* ---- Filters ---- */}
          <div className="flex flex-col sm:flex-row gap-3 mt-3">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              <Input
                id="verification-search"
                placeholder={isAr ? 'بحث بالاسم، المتجر، البريد، الهاتف...' : 'Search by name, store, email, phone...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="ps-9 h-9"
              />
            </div>

            {/* Role filter */}
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-full sm:w-40 h-9" id="role-filter">
                <Filter className="h-3.5 w-3.5 me-1 text-muted-foreground" />
                <SelectValue placeholder={isAr ? 'النوع' : 'Role'} />
              </SelectTrigger>
              <SelectContent dir={dir}>
                <SelectItem value="all">{isAr ? 'كل الأنواع' : 'All Roles'}</SelectItem>
                <SelectItem value="store">{isAr ? 'متجر' : 'Store'}</SelectItem>
                <SelectItem value="freelancer">{isAr ? 'مستقل' : 'Freelancer'}</SelectItem>
                <SelectItem value="supplier">{isAr ? 'مورد' : 'Supplier'}</SelectItem>
                <SelectItem value="logistics">{isAr ? 'لوجستيات' : 'Logistics'}</SelectItem>
              </SelectContent>
            </Select>

            {/* Priority filter */}
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-full sm:w-40 h-9" id="priority-filter">
                <AlertTriangle className="h-3.5 w-3.5 me-1 text-muted-foreground" />
                <SelectValue placeholder={isAr ? 'الأولوية' : 'Priority'} />
              </SelectTrigger>
              <SelectContent dir={dir}>
                <SelectItem value="all">{isAr ? 'كل الأولويات' : 'All Priorities'}</SelectItem>
                <SelectItem value="urgent">{isAr ? 'عاجل' : 'Urgent'}</SelectItem>
                <SelectItem value="standard">{isAr ? 'عادي' : 'Standard'}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>

        {/* ---- Table ---- */}
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="ps-6 min-w-[220px]">
                    {isAr ? 'التاجر' : 'Merchant'}
                  </TableHead>
                  <TableHead className="text-start">
                    {isAr ? 'النوع' : 'Role'}
                  </TableHead>
                  <TableHead className="text-start">
                    {isAr ? 'الأولوية' : 'Priority'}
                  </TableHead>
                  <TableHead className="text-start hidden md:table-cell">
                    {isAr ? 'التحقق' : 'Verification'}
                  </TableHead>
                  <TableHead className="text-start hidden md:table-cell">
                    {isAr ? 'تاريخ التسجيل' : 'Registered'}
                  </TableHead>
                  <TableHead className="text-end pe-6">
                    {isAr ? 'الإجراء' : 'Action'}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableSkeleton rows={5} />
                ) : paginatedMerchants.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-16">
                      <div className="flex flex-col items-center gap-2 text-muted-foreground">
                        <CheckCircle className="size-10 text-green-400" />
                        <p className="text-sm font-medium">
                          {searchQuery || roleFilter !== 'all' || priorityFilter !== 'all'
                            ? (isAr ? 'لا توجد نتائج تطابق بحثك' : 'No results match your filters')
                            : (isAr ? 'لا توجد طلبات معلقة' : 'No pending requests')}
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedMerchants.map((m) => {
                    const roleCfg = ROLE_CONFIG[m.role];
                    const RoleIcon = roleCfg.icon;
                    const isUrgent = m.priority === 'urgent';

                    return (
                      <TableRow key={m.id} className="hover:bg-muted/40 transition-colors">
                        {/* Merchant */}
                        <TableCell className="ps-6">
                          <div className="flex items-center gap-3">
                            <Avatar className="size-9">
                              <AvatarFallback className={roleCfg.color}>
                                <RoleIcon className="size-4" />
                              </AvatarFallback>
                            </Avatar>
                            <div className="min-w-0">
                              <p className="text-sm font-medium truncate">
                                {isAr ? m.name : m.nameEn}
                              </p>
                              {m.storeName && (
                                <p className="text-xs text-muted-foreground truncate">
                                  {isAr ? m.storeName : m.storeNameEn}
                                </p>
                              )}
                              {m.email && (
                                <p className="text-xs text-muted-foreground truncate">{m.email}</p>
                              )}
                            </div>
                          </div>
                        </TableCell>

                        {/* Role */}
                        <TableCell>
                          <Badge variant="secondary" className={`text-[10px] border-0 ${roleCfg.color}`}>
                            {isAr ? roleCfg.labelAr : roleCfg.labelEn}
                          </Badge>
                        </TableCell>

                        {/* Priority */}
                        <TableCell>
                          {isUrgent ? (
                            <Badge className="bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400 border-0 text-[10px] gap-1">
                              <AlertTriangle className="size-2.5" />
                              {isAr ? 'عاجل' : 'Urgent'}
                            </Badge>
                          ) : (
                            <span className="text-xs text-muted-foreground">
                              {isAr ? 'عادي' : 'Standard'}
                            </span>
                          )}
                        </TableCell>

                        {/* Verification badges */}
                        <TableCell className="hidden md:table-cell">
                          <div className="flex items-center gap-2">
                            <span className={`text-xs flex items-center gap-1 ${m.phoneVerified ? 'text-green-600' : 'text-yellow-600'}`}>
                              {m.phoneVerified ? <CheckCircle className="size-3" /> : <Clock className="size-3" />}
                              {isAr ? 'هاتف' : 'Phone'}
                            </span>
                            <span className={`text-xs flex items-center gap-1 ${m.emailVerified ? 'text-green-600' : 'text-yellow-600'}`}>
                              {m.emailVerified ? <CheckCircle className="size-3" /> : <Clock className="size-3" />}
                              {isAr ? 'بريد' : 'Email'}
                            </span>
                          </div>
                        </TableCell>

                        {/* Registered */}
                        <TableCell className="hidden md:table-cell">
                          <p className="text-xs text-muted-foreground">
                            {getRelativeTime(m.registeredAt, isAr)}
                          </p>
                          <p className="text-[10px] text-muted-foreground/70">
                            {formatTimestamp(m.registeredAt, isAr)}
                          </p>
                        </TableCell>

                        {/* Action */}
                        <TableCell className="text-end pe-6">
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 text-xs gap-1.5"
                            onClick={() => handleViewDetails(m)}
                          >
                            <Eye className="size-3.5" />
                            {isAr ? 'عرض' : 'View'}
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>

          {/* ---- Pagination ---- */}
          {!loading && merchants.length > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-3 border-t">
              {/* Showing info */}
              <p className="text-sm text-muted-foreground">
                {isAr
                  ? `عرض ${(pagination.page - 1) * pagination.pageSize + 1}–${Math.min(pagination.page * pagination.pageSize, pagination.total)} من ${pagination.total} طلب`
                  : `Showing ${(pagination.page - 1) * pagination.pageSize + 1}–${Math.min(pagination.page * pagination.pageSize, pagination.total)} of ${pagination.total} requests`}
              </p>

              <div className="flex items-center gap-2">
                {/* Page size selector */}
                <Select value={String(pagination.pageSize)} onValueChange={handlePageSizeChange}>
                  <SelectTrigger className="w-20 h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent dir={dir}>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="25">25</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                  </SelectContent>
                </Select>

                {/* Pagination buttons */}
                <div className="flex items-center gap-1">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => goToPage(1)}
                    disabled={pagination.page <= 1}
                  >
                    <ChevronsLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => goToPage(pagination.page - 1)}
                    disabled={pagination.page <= 1}
                  >
                    {isRTL ? <ArrowRight className="h-4 w-4" /> : <ArrowLeft className="h-4 w-4" />}
                  </Button>

                  {pageNumbers.map((pageNum, idx) => {
                    const prevNum = pageNumbers[idx - 1];
                    const showEllipsisBefore = prevNum !== undefined && pageNum - prevNum > 1;
                    return (
                      <span key={pageNum} className="flex items-center">
                        {showEllipsisBefore && (
                          <span className="px-1 text-xs text-muted-foreground">...</span>
                        )}
                        <Button
                          variant={pagination.page === pageNum ? 'default' : 'outline'}
                          size="icon"
                          className="h-8 w-8 text-xs"
                          onClick={() => goToPage(pageNum)}
                        >
                          {pageNum}
                        </Button>
                      </span>
                    );
                  })}

                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => goToPage(pagination.page + 1)}
                    disabled={pagination.page >= pagination.totalPages}
                  >
                    {isRTL ? <ArrowLeft className="h-4 w-4" /> : <ArrowRight className="h-4 w-4" />}
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => goToPage(pagination.totalPages)}
                    disabled={pagination.page >= pagination.totalPages}
                  >
                    <ChevronsRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

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
