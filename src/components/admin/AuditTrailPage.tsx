'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  CheckCircle,
  XCircle,
  Edit,
  FileText,
  Timer,
  Loader2,
  Search,
  Filter,
  ClipboardList,
  ChevronsLeft,
  ChevronsRight,
  ArrowLeft,
  ArrowRight,
} from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
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

interface PaginationData {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

// ============================================
// ACTION CONFIG
// ============================================

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
  return (
    AUDIT_ACTION_CONFIG[action] || {
      labelAr: action,
      labelEn: action,
      color: 'bg-gray-100 text-gray-700 dark:bg-gray-900/20 dark:text-gray-400',
      icon: FileText,
    }
  );
}

function formatTimestamp(ts: string, isAr: boolean): string {
  const d = new Date(ts);
  return d.toLocaleDateString(isAr ? 'ar-SA' : 'en-US', {
    hour: '2-digit',
    minute: '2-digit',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

// ============================================
// LOG SKELETON
// ============================================

function LogSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-0 divide-y">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex gap-4 px-6 py-4">
          <Skeleton className="h-8 w-8 rounded-full shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2">
              <Skeleton className="h-5 w-20 rounded-full" />
              <Skeleton className="h-4 w-32" />
            </div>
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-3 w-24" />
          </div>
        </div>
      ))}
    </div>
  );
}

// ============================================
// MAIN COMPONENT
// ============================================

export default function AuditTrailPage() {
  const { locale } = useAppStore();
  const isAr = locale === 'ar';
  const dir = isAr ? 'rtl' : 'ltr';
  const isRTL = isAr;

  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [actionFilter, setActionFilter] = useState('all');

  // Pagination state
  const [pagination, setPagination] = useState<PaginationData>({
    page: 1,
    pageSize: 20,
    total: 0,
    totalPages: 0,
  });

  // ---- Fetch ----
  const fetchAuditLogs = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/review?action=audit');
      if (!res.ok) {
        setAuditLogs([]);
        return;
      }
      const data = await res.json();
      if (data.success) {
        setAuditLogs(data.auditLogs || []);
      } else {
        setAuditLogs([]);
      }
    } catch (error) {
      console.error('Failed to fetch audit logs:', error);
      setAuditLogs([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAuditLogs();
  }, [fetchAuditLogs]);

  // ---- Filter ----
  const filteredLogs = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return auditLogs.filter((log) => {
      if (actionFilter !== 'all' && log.action !== actionFilter) return false;
      if (q) {
        const matchMerchant =
          log.merchantName?.toLowerCase().includes(q) ||
          log.merchantNameEn?.toLowerCase().includes(q);
        const matchAdmin = log.adminName?.toLowerCase().includes(q);
        const matchDetails =
          log.details?.toLowerCase().includes(q) ||
          log.detailsEn?.toLowerCase().includes(q);
        if (!matchMerchant && !matchAdmin && !matchDetails) return false;
      }
      return true;
    });
  }, [auditLogs, searchQuery, actionFilter]);

  // ---- Pagination compute ----
  const paginatedLogs = useMemo(() => {
    const total = filteredLogs.length;
    const totalPages = Math.ceil(total / pagination.pageSize) || 1;
    const page = Math.min(pagination.page, totalPages);
    setPagination((prev) => ({ ...prev, total, totalPages, page }));
    const start = (page - 1) * pagination.pageSize;
    return filteredLogs.slice(start, start + pagination.pageSize);
  }, [filteredLogs, pagination.page, pagination.pageSize]);

  // Reset page on filter change
  useEffect(() => {
    setPagination((prev) => ({ ...prev, page: 1 }));
  }, [searchQuery, actionFilter]);

  const goToPage = useCallback((page: number) => {
    setPagination((prev) => ({
      ...prev,
      page: Math.max(1, Math.min(page, prev.totalPages)),
    }));
  }, []);

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

  // ============================================
  // RENDER
  // ============================================

  return (
    <div className="space-y-6" dir={dir}>
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <ClipboardList className="size-6" />
          {isAr ? 'سجل التدقيق' : 'Audit Trail'}
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          {isAr
            ? 'سجل شامل لجميع إجراءات مراجعة التحقق والتوثيق'
            : 'Complete log of all verification review actions'}
        </p>
      </div>

      {/* Main Card */}
      <Card>
        {/* Filters */}
        <CardHeader className="border-b pb-4">
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              <Input
                id="audit-search"
                placeholder={isAr ? 'بحث بالاسم، الإجراء، التفاصيل...' : 'Search by name, action, details...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="ps-9 h-9"
              />
            </div>

            {/* Action filter */}
            <Select value={actionFilter} onValueChange={setActionFilter}>
              <SelectTrigger className="w-full sm:w-44 h-9" id="action-filter">
                <Filter className="h-3.5 w-3.5 me-1 text-muted-foreground" />
                <SelectValue placeholder={isAr ? 'الإجراء' : 'Action'} />
              </SelectTrigger>
              <SelectContent dir={dir}>
                <SelectItem value="all">{isAr ? 'كل الإجراءات' : 'All Actions'}</SelectItem>
                <SelectItem value="approved">{isAr ? 'تفعيل' : 'Approved'}</SelectItem>
                <SelectItem value="rejected">{isAr ? 'رفض' : 'Rejected'}</SelectItem>
                <SelectItem value="request_edit">{isAr ? 'طلب تعديل' : 'Request Edit'}</SelectItem>
                <SelectItem value="submitted">{isAr ? 'تقديم' : 'Submitted'}</SelectItem>
                <SelectItem value="note">{isAr ? 'ملاحظة' : 'Note'}</SelectItem>
              </SelectContent>
            </Select>

            {/* Refresh */}
            <Button
              variant="outline"
              size="sm"
              className="h-9 shrink-0"
              onClick={fetchAuditLogs}
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                isAr ? 'تحديث' : 'Refresh'
              )}
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {/* Log List */}
          {loading ? (
            <LogSkeleton count={8} />
          ) : paginatedLogs.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <ClipboardList className="size-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm">
                {searchQuery || actionFilter !== 'all'
                  ? (isAr ? 'لا توجد نتائج تطابق بحثك' : 'No results match your search')
                  : (isAr ? 'لا توجد سجلات تدقيق' : 'No audit logs yet')}
              </p>
            </div>
          ) : (
            <div className="divide-y">
              {paginatedLogs.map((log) => {
                const actionCfg = getActionConfig(log.action);
                const ActionIcon = actionCfg.icon;

                return (
                  <div
                    key={log.id}
                    className="flex gap-4 px-6 py-4 hover:bg-muted/30 transition-colors"
                  >
                    {/* Icon */}
                    <div
                      className={`flex-shrink-0 flex items-center justify-center w-9 h-9 rounded-full ${actionCfg.color}`}
                    >
                      <ActionIcon className="size-4" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <Badge
                          variant="secondary"
                          className={`text-[10px] border-0 ${actionCfg.color}`}
                        >
                          {isAr ? actionCfg.labelAr : actionCfg.labelEn}
                        </Badge>
                        <span className="text-sm font-medium">
                          {isAr ? log.merchantName : log.merchantNameEn}
                        </span>
                      </div>
                      {(log.details || log.detailsEn) && (
                        <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                          {isAr ? log.details : (log.detailsEn || log.details)}
                        </p>
                      )}
                      <div className="flex flex-wrap items-center gap-3 mt-1.5 text-[10px] text-muted-foreground/70">
                        <span>{formatTimestamp(log.timestamp, isAr)}</span>
                        {log.adminName && (
                          <span>
                            {isAr ? `بواسطة ${log.adminName}` : `by ${log.adminName}`}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* ---- Pagination ---- */}
          {!loading && auditLogs.length > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-3 border-t">
              <p className="text-sm text-muted-foreground">
                {isAr
                  ? `عرض ${(pagination.page - 1) * pagination.pageSize + 1}–${Math.min(pagination.page * pagination.pageSize, pagination.total)} من ${pagination.total} سجل`
                  : `Showing ${(pagination.page - 1) * pagination.pageSize + 1}–${Math.min(pagination.page * pagination.pageSize, pagination.total)} of ${pagination.total} entries`}
              </p>

              <div className="flex items-center gap-2">
                <Select value={String(pagination.pageSize)} onValueChange={handlePageSizeChange}>
                  <SelectTrigger className="w-20 h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent dir={dir}>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="20">20</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                  </SelectContent>
                </Select>

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
    </div>
  );
}
