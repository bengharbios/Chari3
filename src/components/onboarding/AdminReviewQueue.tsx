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
  Download,
  FileText,
  Edit,
  BarChart3,
  TrendingUp,
  TrendingDown,
  Timer,
  Loader2,
  X,
  Search,
  Filter,
  ChevronsLeft,
  ChevronsRight,
  ArrowLeft,
  ArrowRight,
} from 'lucide-react';
import { toast } from 'sonner';
import { useTranslation } from '@/lib/i18n/useTranslation';
import type {
  PendingMerchant,
  PendingMerchantRole,
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
          <TableCell className="ps-6">
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
          <TableCell><Skeleton className="h-8 w-20 rounded" /></TableCell>
        </TableRow>
      ))}
    </>
  );
}

// ============================================
// DETAIL MODAL — FULL ORIGINAL VERSION
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

  React.useEffect(() => {
    if (!open) {
      setActivePreviewDoc(null);
    }
  }, [open]);

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
          <DialogDescription className="sr-only">
            {isAr ? 'تفاصيل طلب التوثيق' : 'Verification request details'}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh] pr-2">
          <div className="space-y-4">
            {/* ── Basic Info ── */}
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

            {/* ── Application Details ── */}
            {merchant.details && (
              <>
                <Separator />
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold">
                    {isAr ? '📝 البيانات المدخلة للتحقق' : '📝 Application Details'}
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs p-4 rounded-xl border bg-muted/20">
                    {merchant.details.companyName && (
                      <div>
                        <span className="text-muted-foreground block mb-0.5">{isAr ? 'اسم الشركة' : 'Company Name'}</span>
                        <p className="font-semibold text-sm text-foreground">{merchant.details.companyName}</p>
                      </div>
                    )}
                    {merchant.details.entityType && (
                      <div>
                        <span className="text-muted-foreground block mb-0.5">{isAr ? 'نوع الكيان' : 'Entity Type'}</span>
                        <p className="font-semibold text-sm text-foreground">
                          {merchant.details.entityType === 'legal'
                            ? (isAr ? 'شركة / شخص معنوي' : 'Legal Entity')
                            : (isAr ? 'شخص طبيعي' : 'Natural Person')}
                        </p>
                      </div>
                    )}
                    {merchant.details.commercialRegisterNumber && (
                      <div>
                        <span className="text-muted-foreground block mb-0.5">{isAr ? 'رقم السجل التجاري' : 'Commercial Register Number'}</span>
                        <p className="font-semibold text-sm text-foreground font-mono">{merchant.details.commercialRegisterNumber}</p>
                      </div>
                    )}
                    {merchant.details.issueAuthority && (
                      <div>
                        <span className="text-muted-foreground block mb-0.5">{isAr ? 'جهة الإصدار' : 'Issue Authority'}</span>
                        <p className="font-semibold text-sm text-foreground">{merchant.details.issueAuthority}</p>
                      </div>
                    )}
                    {merchant.details.issueDate && (
                      <div>
                        <span className="text-muted-foreground block mb-0.5">{isAr ? 'تاريخ الإصدار' : 'Issue Date'}</span>
                        <p className="font-semibold text-sm text-foreground">{new Date(merchant.details.issueDate).toLocaleDateString(isAr ? 'ar-SA' : 'en-US')}</p>
                      </div>
                    )}
                    {/* ── Expiry date with color alerts ── */}
                    {merchant.details.expiryDate && (() => {
                      const expiry = new Date(merchant.details.expiryDate);
                      const now = new Date();
                      now.setHours(0, 0, 0, 0);
                      expiry.setHours(0, 0, 0, 0);
                      const diffTime = expiry.getTime() - now.getTime();
                      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                      let alertColor = 'text-green-600 bg-green-50 dark:bg-green-950/10 border-green-200 dark:border-green-900/20';
                      let label = isAr ? `سارية الصلاحية (متبقي ${Math.round(diffDays / 30)} أشهر)` : `Valid (${Math.round(diffDays / 30)} months left)`;

                      if (diffDays < 0) {
                        alertColor = 'text-red-600 bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900/30 font-bold';
                        label = isAr ? `منتهية الصلاحية (منذ ${Math.abs(diffDays)} يوم)` : `Expired (${Math.abs(diffDays)} days ago)`;
                      } else if (diffDays === 0) {
                        alertColor = 'text-red-600 bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900/30 font-bold animate-pulse';
                        label = isAr ? 'منتهية اليوم!' : 'Expires today!';
                      } else if (diffDays <= 7) {
                        alertColor = 'text-red-600 bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900/30';
                        label = isAr ? `تنتهي خلال ${diffDays} أيام!` : `Expires in ${diffDays} days!`;
                      } else if (diffDays <= 90) {
                        alertColor = 'text-amber-600 bg-amber-50 dark:bg-amber-955/20 border-amber-200 dark:border-amber-900/30 font-semibold';
                        label = isAr ? `صلاحية حرجة (متبقي ${diffDays} يوم ~ ${Math.round(diffDays / 30)} أشهر)` : `Critical validity (${diffDays} days remaining)`;
                      } else if (diffDays <= 180) {
                        alertColor = 'text-amber-500 bg-amber-50/50 dark:bg-amber-955/10 border-amber-100 dark:border-amber-900/20';
                        label = isAr ? `صلاحية قصيرة (متبقي ${Math.round(diffDays / 30)} أشهر)` : `Short validity (${Math.round(diffDays / 30)} months left)`;
                      }

                      return (
                        <div className="col-span-1 sm:col-span-2 p-3 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-muted/30">
                          <div>
                            <span className="text-muted-foreground block mb-0.5">{isAr ? 'تاريخ انتهاء الرخصة / السجل' : 'License Expiry Date'}</span>
                            <p className="font-semibold text-sm text-foreground">{new Date(merchant.details.expiryDate).toLocaleDateString(isAr ? 'ar-SA' : 'en-US')}</p>
                          </div>
                          <Badge variant="outline" className={`px-2.5 py-1 text-xs border ${alertColor}`}>
                            <AlertTriangle className="w-3.5 h-3.5 mr-1 ml-1 shrink-0" />
                            {label}
                          </Badge>
                        </div>
                      );
                    })()}
                    {merchant.details.state && (
                      <div>
                        <span className="text-muted-foreground block mb-0.5">{isAr ? 'الولاية / المقاطعة' : 'State / Region'}</span>
                        <p className="font-semibold text-sm text-foreground">{merchant.details.state}</p>
                      </div>
                    )}
                    {merchant.details.companyAddress && (
                      <div className="col-span-1 sm:col-span-2">
                        <span className="text-muted-foreground block mb-0.5">{isAr ? 'العنوان الكامل' : 'Full Address'}</span>
                        <p className="font-semibold text-sm text-foreground">{merchant.details.companyAddress}</p>
                      </div>
                    )}

                    <div className="col-span-1 sm:col-span-2 my-1 border-t border-dashed" />

                    {/* Bank details */}
                    {merchant.details.beneficiaryName && (
                      <div>
                        <span className="text-muted-foreground block mb-0.5">{isAr ? 'صاحب الحساب (المستفيد)' : 'Beneficiary Name'}</span>
                        <p className="font-semibold text-sm text-foreground">{merchant.details.beneficiaryName}</p>
                      </div>
                    )}
                    {merchant.details.bankName && (
                      <div>
                        <span className="text-muted-foreground block mb-0.5">{isAr ? 'اسم البنك / البريد' : 'Bank Name'}</span>
                        <p className="font-semibold text-sm text-foreground">{merchant.details.bankName}</p>
                      </div>
                    )}
                    {merchant.details.iban && (
                      <div className="col-span-1 sm:col-span-2">
                        <span className="text-muted-foreground block mb-0.5">{isAr ? 'رقم الآيبان (IBAN / RIP)' : 'IBAN / RIP'}</span>
                        <p className="font-semibold text-sm text-foreground font-mono">{merchant.details.iban}</p>
                      </div>
                    )}
                    {merchant.details.ccpNumber && (
                      <div>
                        <span className="text-muted-foreground block mb-0.5">{isAr ? 'رقم الحساب الجاري (CCP)' : 'CCP Number'}</span>
                        <p className="font-semibold text-sm text-foreground font-mono">{merchant.details.ccpNumber}</p>
                      </div>
                    )}
                    {merchant.details.ccpCle && (
                      <div>
                        <span className="text-muted-foreground block mb-0.5">{isAr ? 'مفتاح الحساب الجاري (Key)' : 'CCP Key'}</span>
                        <p className="font-semibold text-sm text-foreground font-mono">{merchant.details.ccpCle}</p>
                      </div>
                    )}

                    <div className="col-span-1 sm:col-span-2 my-1 border-t border-dashed" />

                    {/* Signatory */}
                    {merchant.details.signatoryName && (
                      <div>
                        <span className="text-muted-foreground block mb-0.5">{isAr ? 'اسم المفوض بالتوقيع' : 'Authorized Signatory Name'}</span>
                        <p className="font-semibold text-sm text-foreground">{merchant.details.signatoryName}</p>
                      </div>
                    )}
                    {merchant.details.signatoryEmail && (
                      <div>
                        <span className="text-muted-foreground block mb-0.5">{isAr ? 'بريد المفوض بالتوقيع' : 'Authorized Signatory Email'}</span>
                        <p className="font-semibold text-sm text-foreground">{merchant.details.signatoryEmail}</p>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}

            <Separator />

            {/* ── Documents ── */}
            <div>
              <h4 className="text-sm font-semibold mb-3">
                {isAr ? '📋 المستندات' : '📋 Documents'}
              </h4>
              <div className="space-y-2">
                {merchant.documents.map((doc: any) => (
                  <div
                    key={doc.id}
                    className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${activePreviewDoc?.id === doc.id ? 'border-indigo-500 bg-indigo-50/10' : 'bg-muted/30 border-border'}`}
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
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-8"
                        onClick={() => setActivePreviewDoc(doc)}
                        title={isAr ? 'معاينة المستند' : 'Preview'}
                      >
                        <Eye className="size-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="size-8" asChild title={isAr ? 'تحميل' : 'Download'}>
                        <a href={doc.url} download>
                          <Download className="size-4" />
                        </a>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Document preview panel */}
              {activePreviewDoc ? (
                <div className="mt-4 p-4 rounded-xl border border-indigo-100 dark:border-slate-800 bg-gray-50 dark:bg-slate-950 space-y-3">
                  <div className="flex justify-between items-center pb-2 border-b dark:border-slate-800">
                    <span className="text-xs font-bold text-gray-900 dark:text-slate-100 flex items-center gap-1">
                      <FileText className="size-3.5 text-indigo-500" />
                      {isAr ? activePreviewDoc.name : activePreviewDoc.nameEn}
                    </span>
                    <Button variant="ghost" size="icon" className="size-6 text-muted-foreground hover:bg-muted" onClick={() => setActivePreviewDoc(null)}>
                      <X className="size-3.5" />
                    </Button>
                  </div>
                  <div className="rounded-lg overflow-hidden border bg-white dark:bg-slate-900 aspect-video flex flex-col items-center justify-center relative min-h-[280px]">
                    {activePreviewDoc.url?.toLowerCase().endsWith('.pdf') || activePreviewDoc.url?.includes('.pdf?') ? (
                      <div className="w-full h-full flex flex-col">
                        <p className="text-[10px] text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/20 p-1.5 rounded text-center font-medium border-b border-amber-100 dark:border-amber-900/10">
                          {isAr
                            ? 'تلميح أمان: إذا لم تظهر المعاينة أدناه تلقائياً، فهذا بسبب قيود الأمان (X-Frame-Options) المفروضة من خادم الاستضافة.'
                            : 'Security Tip: If the preview does not load below, it is due to security restrictions (X-Frame-Options) enforced by your hosting provider.'}
                          <a href={activePreviewDoc.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 underline mx-1 font-bold inline-block">
                            {isAr ? 'اضغط هنا لفتح الملف بأمان في نافذة مستقلة ↗' : 'Click here to open the file securely in a new window ↗'}
                          </a>
                        </p>
                        <iframe
                          src={activePreviewDoc.url}
                          className="w-full flex-1 border-0 bg-white"
                          title="Admin Document Preview"
                        />
                      </div>
                    ) : (
                      <img
                        src={activePreviewDoc.url}
                        alt="Document Preview"
                        className="max-h-[350px] max-w-full object-contain p-2"
                      />
                    )}
                  </div>
                </div>
              ) : (
                <div className="mt-3 p-8 rounded-lg border-2 border-dashed bg-muted/20 text-center">
                  <FileText className="size-8 mx-auto text-muted-foreground/50" />
                  <p className="text-xs text-muted-foreground mt-2">
                    {isAr ? 'معاينة المستند ستظهر هنا (اضغط على أيقونة العين 👁️ لمشاهدة المرفق)' : 'Document preview will appear here (Click the Eye icon 👁️ to view attachment)'}
                  </p>
                </div>
              )}
            </div>

            <Separator />

            {/* ── Verification Items ── */}
            <div>
              <h4 className="text-sm font-semibold mb-3">
                {isAr ? '✅ عناصر التوثيق' : '✅ Verification Items'}
              </h4>
              <div className="space-y-2">
                {merchant.verificationItems.map((item: any) => {
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
                      {item.rejectionReason && (
                        <span className="text-xs text-red-500 ms-2">— {item.rejectionReason}</span>
                      )}
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
// REJECTION DIALOG — WITH PREDEFINED REASONS
// ============================================

interface RejectionDialogProps {
  merchant: PendingMerchant | null;
  open: boolean;
  onClose: () => void;
  onSubmit: (merchant: PendingMerchant, reason: string) => void;
  isAr: boolean;
  loading: boolean;
}

function RejectionDialog({ merchant, open, onClose, onSubmit, isAr, loading }: RejectionDialogProps) {
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
          <DialogDescription className="sr-only">
            {isAr ? 'نموذج لتوضيح سبب رفض طلب التفعيل للتاجر' : 'Form to specify the rejection reason for this activation request'}
          </DialogDescription>
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
            placeholder={isAr ? 'اكتب سبب الرفض هنا...' : 'Write rejection reason here...'}
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

function RequestEditDialog({ merchant, open, onClose, onSubmit, isAr, loading }: RequestEditDialogProps) {
  const [checkedItems, setCheckedItems] = useState<string[]>([]);
  const [message, setMessage] = useState('');

  React.useEffect(() => {
    if (merchant && open) {
      setCheckedItems(
        merchant.verificationItems
          .filter((i: any) => i.status === 'rejected')
          .map((i: any) => i.id)
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
            {merchant?.verificationItems.map((item: any) => (
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
            placeholder={isAr ? 'أضف رسالة توضيحية (اختياري)...' : 'Add a note (optional)...'}
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
    { label: isAr ? 'إجمالي المعلقة' : 'Total Pending', value: totalPending, icon: Clock, color: 'text-yellow-600', bg: 'bg-yellow-100 dark:bg-yellow-900/20' },
    { label: isAr ? 'مفعلة اليوم' : 'Approved Today', value: approvedToday, icon: TrendingUp, color: 'text-green-600', bg: 'bg-green-100 dark:bg-green-900/20' },
    { label: isAr ? 'مرفوضة اليوم' : 'Rejected Today', value: rejectedToday, icon: TrendingDown, color: 'text-red-600', bg: 'bg-red-100 dark:bg-red-900/20' },
    { label: isAr ? 'متوسط وقت المراجعة' : 'Avg Review Time', value: avgReviewTime, icon: Timer, color: 'text-blue-600', bg: 'bg-blue-100 dark:bg-blue-900/20' },
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
  const { t, locale } = useTranslation();
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

  // Pagination
  const [pagination, setPagination] = useState<PaginationData>({ page: 1, pageSize: 10, total: 0, totalPages: 0 });

  // ── Fetch ──
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
    } catch {
      setMerchants([]);
      setStats({ totalPending: 0, approvedToday: 0, rejectedToday: 0, avgReviewTime: '—' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchMerchants(); }, [fetchMerchants]);

  // ── Filter & sort ──
  const filteredMerchants = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return merchants
      .filter((m) => {
        if (roleFilter !== 'all' && m.role !== roleFilter) return false;
        if (priorityFilter !== 'all' && m.priority !== priorityFilter) return false;
        if (q) {
          const hit = [m.name, m.nameEn, m.storeName, m.storeNameEn, m.email, m.phone]
            .some((v) => v?.toLowerCase().includes(q));
          if (!hit) return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (a.priority === 'urgent' && b.priority !== 'urgent') return -1;
        if (a.priority !== 'urgent' && b.priority === 'urgent') return 1;
        return new Date(a.registeredAt).getTime() - new Date(b.registeredAt).getTime();
      });
  }, [merchants, searchQuery, roleFilter, priorityFilter]);

  // ── Pagination compute ──
  const paginatedMerchants = useMemo(() => {
    const total = filteredMerchants.length;
    const totalPages = Math.ceil(total / pagination.pageSize) || 1;
    const page = Math.min(pagination.page, totalPages);
    setPagination((prev) => ({ ...prev, total, totalPages, page }));
    const start = (page - 1) * pagination.pageSize;
    return filteredMerchants.slice(start, start + pagination.pageSize);
  }, [filteredMerchants, pagination.page, pagination.pageSize]);

  useEffect(() => {
    setPagination((prev) => ({ ...prev, page: 1 }));
  }, [searchQuery, roleFilter, priorityFilter]);

  const goToPage = useCallback((page: number) => {
    setPagination((prev) => ({ ...prev, page: Math.max(1, Math.min(page, prev.totalPages)) }));
  }, []);

  const handlePageSizeChange = (val: string) => {
    setPagination((prev) => ({ ...prev, pageSize: Number(val), page: 1 }));
  };

  const pageNumbers = useMemo(() => {
    const { page, totalPages } = pagination;
    if (totalPages <= 5) return Array.from({ length: totalPages }, (_, i) => i + 1);
    const pages: number[] = [];
    if (page <= 3) pages.push(1, 2, 3, 4, totalPages);
    else if (page >= totalPages - 2) pages.push(1, totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
    else pages.push(1, page - 1, page, page + 1, totalPages);
    return pages;
  }, [pagination]);

  // ── Action handlers ──
  const handleViewDetails = (m: PendingMerchant) => { setSelectedMerchant(m); setDetailOpen(true); };

  const handleApprove = async (m: PendingMerchant) => {
    try {
      setActionLoading(true);
      const res = await fetch(`/api/admin/review/${m.id}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'approve', adminId: 'admin-001' }) });
      if (!res.ok) throw new Error();
      const data = await res.json();
      if (data.success) {
        setDetailOpen(false); setSelectedMerchant(null);
        toast.success(isAr ? `تم تفعيل حساب "${m.name}"` : `Approved "${m.nameEn}"`);
        fetchMerchants();
      }
    } catch { toast.error(isAr ? 'فشل تفعيل الحساب' : 'Failed to approve account'); }
    finally { setActionLoading(false); }
  };

  const handleRejectClick = (m: PendingMerchant) => { setSelectedMerchant(m); setDetailOpen(false); setRejectOpen(true); };

  const handleRejectSubmit = async (m: PendingMerchant, reason: string) => {
    try {
      setActionLoading(true);
      const res = await fetch(`/api/admin/review/${m.id}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'reject', reason, adminId: 'admin-001' }) });
      if (!res.ok) throw new Error();
      const data = await res.json();
      if (data.success) {
        setRejectOpen(false); setSelectedMerchant(null);
        toast.success(isAr ? `تم رفض طلب "${m.name}"` : `Rejected "${m.nameEn}"`);
        fetchMerchants();
      }
    } catch { toast.error(isAr ? 'فشل رفض الطلب' : 'Failed to reject request'); }
    finally { setActionLoading(false); }
  };

  const handleEditClick = (m: PendingMerchant) => { setSelectedMerchant(m); setDetailOpen(false); setEditOpen(true); };

  const handleEditSubmit = async (m: PendingMerchant, items: string[], message: string) => {
    try {
      setActionLoading(true);
      const res = await fetch(`/api/admin/review/${m.id}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'request_edit', reason: message, editItems: items, adminId: 'admin-001' }) });
      if (!res.ok) throw new Error();
      const data = await res.json();
      if (data.success) {
        setEditOpen(false); setSelectedMerchant(null);
        toast.success(isAr ? `تم إرسال طلب تعديل لـ "${m.name}"` : `Edit request sent to "${m.nameEn}"`);
        fetchMerchants();
      }
    } catch { toast.error(isAr ? 'فشل إرسال طلب التعديل' : 'Failed to send edit request'); }
    finally { setActionLoading(false); }
  };

  // ============================================
  // RENDER
  // ============================================
  return (
    <div className="space-y-6" dir={dir}>
      <StatsRow isAr={isAr} stats={stats} merchantsCount={merchants.length} />

      <Card>
        {/* Header + Filters */}
        <CardHeader className="border-b pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <BarChart3 className="size-5" />
              <span>{t('verifications.pendingRequests')}</span>
              <Badge className="bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400 border-0">
                {filteredMerchants.length}
              </Badge>
            </CardTitle>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 mt-3">
            <div className="relative flex-1">
              <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              <Input
                id="verification-search"
                placeholder={t('verifications.searchPlaceholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="ps-9 h-9"
              />
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-full sm:w-40 h-9" id="role-filter">
                <Filter className="h-3.5 w-3.5 me-1 text-muted-foreground" />
                <SelectValue placeholder={t('verifications.filterRole')} />
              </SelectTrigger>
              <SelectContent dir={dir}>
                <SelectItem value="all">{t('verifications.filterAllRoles')}</SelectItem>
                <SelectItem value="store">{t('متجر', 'Store')}</SelectItem>
                <SelectItem value="freelancer">{t('مستقل', 'Freelancer')}</SelectItem>
                <SelectItem value="supplier">{t('مورد', 'Supplier')}</SelectItem>
                <SelectItem value="logistics">{t('خدمات لوجستية', 'Logistics')}</SelectItem>
              </SelectContent>
            </Select>
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-full sm:w-40 h-9" id="priority-filter">
                <AlertTriangle className="h-3.5 w-3.5 me-1 text-muted-foreground" />
                <SelectValue placeholder={t('verifications.filterPriority')} />
              </SelectTrigger>
              <SelectContent dir={dir}>
                <SelectItem value="all">{t('verifications.filterAllPriorities')}</SelectItem>
                <SelectItem value="urgent">{t('verifications.urgent', 'Urgent')}</SelectItem>
                <SelectItem value="standard">{t('verifications.standard', 'Standard')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>

        {/* Table */}
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="ps-6 min-w-[220px]">{t('verifications.colMerchant')}</TableHead>
                  <TableHead className="text-start">{t('verifications.colRole')}</TableHead>
                  <TableHead className="text-start">{t('verifications.colPriority')}</TableHead>
                  <TableHead className="text-start hidden md:table-cell">{t('verifications.colVerification')}</TableHead>
                  <TableHead className="text-start hidden md:table-cell">{t('verifications.colRegistered')}</TableHead>
                  <TableHead className="text-end pe-6">{t('verifications.colAction')}</TableHead>
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
                            ? t('verifications.noResults')
                            : t('verifications.noPending')}
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
                        <TableCell className="ps-6">
                          <div className="flex items-center gap-3">
                            <Avatar className="size-9">
                              <AvatarFallback className={roleCfg.color}>
                                <RoleIcon className="size-4" />
                              </AvatarFallback>
                            </Avatar>
                            <div className="min-w-0">
                              <p className="text-sm font-medium truncate">{isAr ? m.name : m.nameEn}</p>
                              {m.storeName && <p className="text-xs text-muted-foreground truncate">{isAr ? m.storeName : m.storeNameEn}</p>}
                              {m.email && <p className="text-xs text-muted-foreground truncate">{m.email}</p>}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className={`text-[10px] border-0 ${roleCfg.color}`}>
                            {isAr ? roleCfg.labelAr : roleCfg.labelEn}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {isUrgent ? (
                            <Badge className="bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400 border-0 text-[10px] gap-1">
                              <AlertTriangle className="size-2.5" />
                              {t('verifications.urgent', 'Urgent')}
                            </Badge>
                          ) : (
                            <span className="text-xs text-muted-foreground">{t('verifications.standard', 'Standard')}</span>
                          )}
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <div className="flex items-center gap-2">
                            <span className={`text-xs flex items-center gap-1 ${m.phoneVerified ? 'text-green-600' : 'text-yellow-600'}`}>
                              {m.phoneVerified ? <CheckCircle className="size-3" /> : <Clock className="size-3" />}
                              {t('الهاتف', 'Phone')}
                            </span>
                            <span className={`text-xs flex items-center gap-1 ${m.emailVerified ? 'text-green-600' : 'text-yellow-600'}`}>
                              {m.emailVerified ? <CheckCircle className="size-3" /> : <Clock className="size-3" />}
                              {t('البريد', 'Email')}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <p className="text-xs text-muted-foreground">{getRelativeTime(m.registeredAt, isAr)}</p>
                          <p className="text-[10px] text-muted-foreground/70">{formatTimestamp(m.registeredAt, isAr)}</p>
                        </TableCell>
                        <TableCell className="text-end pe-6">
                          <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5" onClick={() => handleViewDetails(m)}>
                            <Eye className="size-3.5" />
                            {t('verifications.viewBtn')}
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {!loading && merchants.length > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-3 border-t">
              <p className="text-sm text-muted-foreground">
                {t('verifications.showingOf')
                  .replace('%from%', String((pagination.page - 1) * pagination.pageSize + 1))
                  .replace('%to%', String(Math.min(pagination.page * pagination.pageSize, pagination.total)))
                  .replace('%total%', String(pagination.total))}
              </p>
              <div className="flex items-center gap-2">
                <Select value={String(pagination.pageSize)} onValueChange={handlePageSizeChange}>
                  <SelectTrigger className="w-20 h-8 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent dir={dir}>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="25">25</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                  </SelectContent>
                </Select>
                <div className="flex items-center gap-1">
                  <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => goToPage(1)} disabled={pagination.page <= 1}><ChevronsLeft className="h-4 w-4" /></Button>
                  <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => goToPage(pagination.page - 1)} disabled={pagination.page <= 1}>
                    {isRTL ? <ArrowRight className="h-4 w-4" /> : <ArrowLeft className="h-4 w-4" />}
                  </Button>
                  {pageNumbers.map((pageNum, idx) => {
                    const prevNum = pageNumbers[idx - 1];
                    const showEllipsis = prevNum !== undefined && pageNum - prevNum > 1;
                    return (
                      <span key={pageNum} className="flex items-center">
                        {showEllipsis && <span className="px-1 text-xs text-muted-foreground">...</span>}
                        <Button variant={pagination.page === pageNum ? 'default' : 'outline'} size="icon" className="h-8 w-8 text-xs" onClick={() => goToPage(pageNum)}>{pageNum}</Button>
                      </span>
                    );
                  })}
                  <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => goToPage(pagination.page + 1)} disabled={pagination.page >= pagination.totalPages}>
                    {isRTL ? <ArrowLeft className="h-4 w-4" /> : <ArrowRight className="h-4 w-4" />}
                  </Button>
                  <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => goToPage(pagination.totalPages)} disabled={pagination.page >= pagination.totalPages}><ChevronsRight className="h-4 w-4" /></Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modals */}
      <DetailModal merchant={selectedMerchant} open={detailOpen} onClose={() => { setDetailOpen(false); setSelectedMerchant(null); }} onApprove={handleApprove} onReject={handleRejectClick} onRequestEdit={handleEditClick} isAr={isAr} loading={actionLoading} />
      <RejectionDialog merchant={selectedMerchant} open={rejectOpen} onClose={() => { setRejectOpen(false); setSelectedMerchant(null); }} onSubmit={handleRejectSubmit} isAr={isAr} loading={actionLoading} />
      <RequestEditDialog merchant={selectedMerchant} open={editOpen} onClose={() => { setEditOpen(false); setSelectedMerchant(null); }} onSubmit={handleEditSubmit} isAr={isAr} loading={actionLoading} />
    </div>
  );
}
