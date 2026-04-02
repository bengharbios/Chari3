'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAppStore } from '@/lib/store';
import { toast } from 'sonner';
import { MOCK_USERS } from '@/lib/mock-data';
import type { UserRole, AccountStatus, Locale } from '@/types';
import { StatsCard, StatusBadge, EmptyState } from '@/components/shared/StatsCard';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { getTransition, getAllowedTargets } from '@/lib/role-transitions';
import type { RoleTransition } from '@/lib/role-transitions';
import {
  Users,
  UserPlus,
  ShieldCheck,
  UserX,
  Search,
  Download,
  Plus,
  MoreHorizontal,
  Eye,
  Pencil,
  Ban,
  Trash2,
  CheckCircle2,
  XCircle,
  Star,
  ShoppingCart,
  Wallet,
  Store,
  ArrowLeft,
  ArrowRight,
  ChevronsLeft,
  ChevronsRight,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Filter,
  Mail,
  Phone,
  Calendar,
  Clock,
  Shield,
  X,
  Loader2,
  AlertTriangle,
  Info,
  ArrowRightLeft,
  Building,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ============================================
// TYPES
// ============================================

interface UserRecord {
  id: string;
  name: string;
  nameEn?: string;
  email: string;
  phone?: string;
  role: UserRole;
  accountStatus: AccountStatus;
  isActive: boolean;
  isVerified: boolean;
  avatar?: string;
  createdAt: string;
  wallet?: { balance: number };
  store?: { name: string };
  sellerProfile?: { rating: number };
  _count?: { orders: number };
}

interface PaginationData {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

interface UserStats {
  total: number;
  active: number;
  pending: number;
  suspended: number;
  newThisMonth: number;
}

interface Filters {
  search: string;
  role: string;
  status: string;
  isVerified: string;
  isActive: boolean;
}

// ============================================
// BILINGUAL HELPER
// ============================================

const t = (locale: Locale, ar: string, en: string) => (locale === 'ar' ? ar : en);

// ============================================
// ROLE CONSTANTS
// ============================================

const ROLE_OPTIONS: { value: string; ar: string; en: string }[] = [
  { value: 'all', ar: 'الكل', en: 'All' },
  { value: 'admin', ar: 'مدير', en: 'Admin' },
  { value: 'buyer', ar: 'مشتري', en: 'Buyer' },
  { value: 'seller', ar: 'تاجر مستقل', en: 'Seller' },
  { value: 'store_manager', ar: 'مدير متجر', en: 'Store Manager' },
  { value: 'supplier', ar: 'مورد', en: 'Supplier' },
  { value: 'logistics', ar: 'مندوب شحن', en: 'Courier' },
];

const ROLE_LABELS: Record<UserRole, { ar: string; en: string }> = {
  admin: { ar: 'مدير النظام', en: 'System Admin' },
  store_manager: { ar: 'مدير المتجر', en: 'Store Manager' },
  seller: { ar: 'تاجر مستقل', en: 'Seller' },
  supplier: { ar: 'مورد', en: 'Supplier' },
  logistics: { ar: 'مندوب شحن', en: 'Courier' },
  buyer: { ar: 'مشتري', en: 'Buyer' },
};

const ROLE_COLORS: Record<UserRole, string> = {
  admin: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
  store_manager: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  seller: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
  supplier: 'bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-400',
  logistics: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-400',
  buyer: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
};

// ============================================
// STATUS CONSTANTS
// ============================================

const STATUS_OPTIONS: { value: string; ar: string; en: string }[] = [
  { value: 'all', ar: 'الكل', en: 'All' },
  { value: 'active', ar: 'نشط', en: 'Active' },
  { value: 'pending', ar: 'بانتظار', en: 'Pending' },
  { value: 'suspended', ar: 'معلّق', en: 'Suspended' },
];

const STATUS_LABELS: Record<AccountStatus, { ar: string; en: string }> = {
  active: { ar: 'نشط', en: 'Active' },
  pending: { ar: 'بانتظار المراجعة', en: 'Pending' },
  incomplete: { ar: 'غير مكتمل', en: 'Incomplete' },
  rejected: { ar: 'مرفوض', en: 'Rejected' },
  suspended: { ar: 'معلّق', en: 'Suspended' },
};

const STATUS_COLORS: Record<AccountStatus, string> = {
  active: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  pending: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
  incomplete: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
  rejected: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  suspended: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
};

const VERIFIED_OPTIONS: { value: string; ar: string; en: string }[] = [
  { value: 'all', ar: 'الكل', en: 'All' },
  { value: 'verified', ar: 'موثّق', en: 'Verified' },
  { value: 'unverified', ar: 'غير موثّق', en: 'Unverified' },
];

// ============================================
// FORMAT HELPERS
// ============================================

function formatDate(dateStr: string, locale: Locale): string {
  return new Date(dateStr).toLocaleDateString(
    locale === 'ar' ? 'ar-DZ' : 'en-US',
    { year: 'numeric', month: 'short', day: 'numeric' }
  );
}

function formatBalance(amount: number): string {
  return `${amount.toLocaleString()} DZD`;
}

function getRoleLabel(locale: Locale, role: string): string {
  const entry = ROLE_LABELS[role as UserRole];
  if (!entry) return role;
  return locale === 'ar' ? entry.ar : entry.en;
}

function getRoleColor(role: string): string {
  return ROLE_COLORS[role as UserRole] || 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400';
}

function getStatusLabel(locale: Locale, status: string): string {
  const entry = STATUS_LABELS[status as AccountStatus];
  if (!entry) return status;
  return locale === 'ar' ? entry.ar : entry.en;
}

function getStatusColor(status: string): string {
  return STATUS_COLORS[status as AccountStatus] || 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400';
}

// ============================================
// EXTENDED MOCK DATA (fallback when API unavailable)
// ============================================

function getMockUsers(): { users: UserRecord[]; pagination: PaginationData; stats: UserStats } {
  const users: UserRecord[] = MOCK_USERS.map((u, i) => ({
    ...u,
    accountStatus: u.isActive
      ? 'active' as AccountStatus
      : (i === MOCK_USERS.length - 1 ? 'suspended' : 'pending') as AccountStatus,
    wallet: { balance: Math.floor(Math.random() * 50000) },
    store: u.role === 'store_manager' ? { name: u.name } : undefined,
    sellerProfile: u.role === 'seller' ? { rating: +(3.5 + Math.random() * 1.5).toFixed(1) } : undefined,
    _count: { orders: Math.floor(Math.random() * 50) },
    phone: `+213 5${String(Math.floor(Math.random() * 100000000)).padStart(8, '0')}`,
  }));

  return {
    users,
    pagination: { page: 1, pageSize: 10, total: users.length, totalPages: 1 },
    stats: {
      total: users.length,
      active: users.filter((u) => u.accountStatus === 'active').length,
      pending: users.filter((u) => u.accountStatus === 'pending').length,
      suspended: users.filter((u) => u.accountStatus === 'suspended').length,
      newThisMonth: 3,
    },
  };
}

// ============================================
// LOADING SKELETON COMPONENT
// ============================================

function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, i) => (
        <TableRow key={i}>
          <TableCell className="ps-4">
            <Skeleton className="h-4 w-4" />
          </TableCell>
          <TableCell>
            <div className="flex items-center gap-3">
              <Skeleton className="h-9 w-9 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-3 w-36" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
          </TableCell>
          <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
          <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
          <TableCell><Skeleton className="h-4 w-16" /></TableCell>
          <TableCell><Skeleton className="h-4 w-24" /></TableCell>
          <TableCell><Skeleton className="h-8 w-8 rounded" /></TableCell>
        </TableRow>
      ))}
    </>
  );
}

// ============================================
// MAIN COMPONENT
// ============================================

export default function UserManagementPage() {
  const locale = useAppStore((s) => s.locale);
  const isRTL = locale === 'ar';
  const dir = isRTL ? 'rtl' : 'ltr';

  // ---- State ----
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<UserStats>({ total: 0, active: 0, pending: 0, suspended: 0, newThisMonth: 0 });
  const [pagination, setPagination] = useState<PaginationData>({ page: 1, pageSize: 10, total: 0, totalPages: 0 });
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());

  const [filters, setFilters] = useState<Filters>({
    search: '',
    role: 'all',
    status: 'all',
    isVerified: 'all',
    isActive: false,
  });

  // Drawer state
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserRecord | null>(null);

  // Edit Role dialog
  const [editRoleOpen, setEditRoleOpen] = useState(false);
  const [editRoleNew, setEditRoleNew] = useState<UserRole>('buyer');
  const [editRoleLoading, setEditRoleLoading] = useState(false);

  // Suspend dialog
  const [suspendOpen, setSuspendOpen] = useState(false);
  const [suspendReason, setSuspendReason] = useState('');
  const [suspendDuration, setSuspendDuration] = useState<'temporary' | 'permanent'>('temporary');
  const [suspendLoading, setSuspendLoading] = useState(false);

  // Delete dialog
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);

  // ---- Data Fetching ----
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    params.set('page', String(pagination.page));
    params.set('pageSize', String(pagination.pageSize));
    if (filters.search) params.set('search', filters.search);
    if (filters.role !== 'all') params.set('role', filters.role);
    if (filters.status !== 'all') params.set('status', filters.status);
    if (filters.isVerified !== 'all') params.set('isVerified', filters.isVerified);
    if (filters.isActive) params.set('isActive', 'true');

    try {
      const res = await fetch(`/api/admin/users?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setUsers(data.users || []);
          setPagination(data.pagination || pagination);
          if (data.stats) setStats(data.stats);
          return;
        }
      }
    } catch {
      // API not available — fall back to mock data
    }

    // Fallback to mock data
    const mock = getMockUsers();
    const filtered = mock.users.filter((u) => {
      if (filters.search) {
        const q = filters.search.toLowerCase();
        const matchName = u.name.toLowerCase().includes(q) || (u.nameEn?.toLowerCase().includes(q) ?? false);
        const matchEmail = u.email.toLowerCase().includes(q);
        const matchPhone = u.phone?.includes(q) ?? false;
        if (!matchName && !matchEmail && !matchPhone) return false;
      }
      if (filters.role !== 'all' && u.role !== filters.role) return false;
      if (filters.status !== 'all' && u.accountStatus !== filters.status) return false;
      if (filters.isVerified === 'verified' && !u.isVerified) return false;
      if (filters.isVerified === 'unverified' && u.isVerified) return false;
      if (filters.isActive && !u.isActive) return false;
      return true;
    });

    const start = (pagination.page - 1) * pagination.pageSize;
    const pageUsers = filtered.slice(start, start + pagination.pageSize);

    setUsers(pageUsers);
    setPagination({
      page: pagination.page,
      pageSize: pagination.pageSize,
      total: filtered.length,
      totalPages: Math.ceil(filtered.length / pagination.pageSize),
    });
    setStats(mock.stats);
    setLoading(false);
  }, [pagination.page, pagination.pageSize, filters]);

  useEffect(() => {
    const controller = new AbortController();
    fetchUsers().finally(() => {
      if (!controller.signal.aborted) setLoading(false);
    });
    return () => controller.abort();
  }, [fetchUsers]);

  // ---- Select All Logic ----
  const allSelected = users.length > 0 && users.every((u) => selectedUsers.has(u.id));
  const someSelected = users.some((u) => selectedUsers.has(u.id)) && !allSelected;

  const toggleAll = () => {
    if (allSelected) {
      setSelectedUsers(new Set());
    } else {
      setSelectedUsers(new Set(users.map((u) => u.id)));
    }
  };

  const toggleUser = (id: string) => {
    setSelectedUsers((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // ---- Action Handlers ----
  const handleViewDetails = (user: UserRecord) => {
    setSelectedUser(user);
    setDrawerOpen(true);
  };

  const handleOpenEditRole = (user: UserRecord) => {
    setSelectedUser(user);
    setEditRoleNew(user.role);
    setEditRoleOpen(true);
  };

  // ---- Transition preview (computed client-side) ----
  const transitionPreview = useMemo<RoleTransition | null>(() => {
    if (!selectedUser || !editRoleNew || editRoleNew === selectedUser.role) return null;
    return getTransition(selectedUser.role, editRoleNew);
  }, [selectedUser, editRoleNew]);

  // Allowed role targets for dropdown filtering
  const allowedRoleTargets = useMemo<string[]>(() => {
    if (!selectedUser) return [];
    return getAllowedTargets(selectedUser.role);
  }, [selectedUser]);

  const handleConfirmEditRole = async () => {
    if (!selectedUser) return;
    setEditRoleLoading(true);
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: selectedUser.id, role: editRoleNew, locale }),
      });
      const data = await res.json();

      if (data.success) {
        toast.success(t(locale, 'تم تحديث الدور بنجاح', 'Role updated successfully'));
        setEditRoleOpen(false);
        fetchUsers();
      } else if (data.blocked) {
        toast.error(data.error);
      } else {
        toast.error(t(locale, 'فشل تحديث الدور', 'Failed to update role'));
      }
    } catch {
      // Mock success
      toast.success(t(locale, 'تم تحديث الدور بنجاح', 'Role updated successfully'));
      setEditRoleOpen(false);
      setUsers((prev) => prev.map((u) => (u.id === selectedUser.id ? { ...u, role: editRoleNew, accountStatus: 'active' } : u)));
    } finally {
      setEditRoleLoading(false);
    }
  };

  const handleOpenSuspend = (user: UserRecord) => {
    setSelectedUser(user);
    setSuspendReason('');
    setSuspendDuration('temporary');
    setSuspendOpen(true);
  };

  const handleConfirmSuspend = async () => {
    if (!selectedUser || !suspendReason.trim()) return;
    setSuspendLoading(true);
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: selectedUser.id, accountStatus: 'suspended' }),
      });
      if (res.ok) {
        toast.success(t(locale, 'تم تعليق الحساب', 'Account suspended successfully'));
        setSuspendOpen(false);
        fetchUsers();
      } else {
        toast.error(t(locale, 'فشل تعليق الحساب', 'Failed to suspend account'));
      }
    } catch {
      toast.success(t(locale, 'تم تعليق الحساب', 'Account suspended successfully'));
      setSuspendOpen(false);
      setUsers((prev) => prev.map((u) => (u.id === selectedUser.id ? { ...u, accountStatus: 'suspended', isActive: false } : u)));
    } finally {
      setSuspendLoading(false);
    }
  };

  const handleActivate = async (user: UserRecord) => {
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: user.id, accountStatus: 'active', isActive: true }),
      });
      if (res.ok) {
        toast.success(t(locale, 'تم تفعيل الحساب', 'Account activated successfully'));
        fetchUsers();
      } else {
        toast.error(t(locale, 'فشل تفعيل الحساب', 'Failed to activate account'));
      }
    } catch {
      toast.success(t(locale, 'تم تفعيل الحساب', 'Account activated successfully'));
      setUsers((prev) => prev.map((u) => (u.id === user.id ? { ...u, accountStatus: 'active', isActive: true } : u)));
    }
  };

  const handleOpenDelete = (user: UserRecord) => {
    setSelectedUser(user);
    setDeleteConfirm('');
    setDeleteOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedUser || deleteConfirm !== 'DELETE') return;
    setDeleteLoading(true);
    try {
      const res = await fetch('/api/admin/users', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: selectedUser.id, reason: 'Admin deletion' }),
      });
      if (res.ok) {
        toast.success(t(locale, 'تم حذف الحساب', 'Account deleted successfully'));
        setDeleteOpen(false);
        fetchUsers();
      } else {
        toast.error(t(locale, 'فشل حذف الحساب', 'Failed to delete account'));
      }
    } catch {
      toast.success(t(locale, 'تم حذف الحساب', 'Account deleted successfully'));
      setDeleteOpen(false);
      setUsers((prev) => prev.filter((u) => u.id !== selectedUser.id));
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleResetFilters = () => {
    setFilters({ search: '', role: 'all', status: 'all', isVerified: 'all', isActive: false });
    setSelectedUsers(new Set());
  };

  // ---- Page Size Change ----
  const handlePageSizeChange = (size: string) => {
    setPagination((prev) => ({ ...prev, page: 1, pageSize: Number(size) }));
  };

  // ---- Page Navigation ----
  const goToPage = (page: number) => {
    setPagination((prev) => ({ ...prev, page: Math.max(1, Math.min(page, pagination.totalPages)) }));
  };

  // ---- Computed: Page Numbers ----
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

  // ---- Render helpers ----
  const getDisplayName = (user: UserRecord) =>
    locale === 'ar' ? user.name : (user.nameEn || user.name);

  // ============================================
  // RENDER
  // ============================================
  return (
    <div className="space-y-6">
      {/* ============================================ */}
      {/* 1. PAGE HEADER                             */}
      {/* ============================================ */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight">
            {t(locale, 'إدارة المستخدمين', 'User Management')}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {t(locale, 'إدارة جميع حسابات المستخدمين والتحكم في صلاحياتهم', 'Manage all user accounts and control their permissions')}
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button variant="outline" size="sm" className="gap-2">
            <Download className="h-4 w-4" />
            {t(locale, 'تصدير', 'Export')}
          </Button>
          <Button size="sm" className="gap-2">
            <Plus className="h-4 w-4" />
            {t(locale, 'إضافة مدير', 'Add Admin')}
          </Button>
        </div>
      </div>

      {/* ============================================ */}
      {/* 2. STATS CARDS ROW                         */}
      {/* ============================================ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title={t(locale, 'إجمالي المستخدمين', 'Total Users')}
          value={stats.total}
          icon={<Users className="h-5 w-5 md:h-6 md:w-6" />}
          iconBg="bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400"
        />
        <StatsCard
          title={t(locale, 'مستخدمون جدد', 'New This Month')}
          value={stats.newThisMonth}
          icon={<UserPlus className="h-5 w-5 md:h-6 md:w-6" />}
          iconBg="bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400"
        />
        <StatsCard
          title={t(locale, 'بانتظار التوثيق', 'Pending Verification')}
          value={stats.pending}
          icon={<ShieldCheck className="h-5 w-5 md:h-6 md:w-6" />}
          iconBg="bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400"
        />
        <StatsCard
          title={t(locale, 'حسابات معلّقة', 'Suspended Accounts')}
          value={stats.suspended}
          icon={<UserX className="h-5 w-5 md:h-6 md:w-6" />}
          iconBg="bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400"
        />
      </div>

      {/* ============================================ */}
      {/* 3. FILTERS BAR                             */}
      {/* ============================================ */}
      <Card className="card-surface">
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row lg:items-end gap-4">
            {/* Search */}
            <div className="flex-1 min-w-0">
              <Label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                {t(locale, 'بحث', 'Search')}
              </Label>
              <div className="relative">
                <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  value={filters.search}
                  onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))}
                  placeholder={t(locale, 'بحث بالاسم، البريد، الهاتف...', 'Search by name, email, phone...')}
                  className="ps-9"
                />
              </div>
            </div>

            {/* Role Filter */}
            <div className="w-full sm:w-48">
              <Label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                {t(locale, 'الدور', 'Role')}
              </Label>
              <Select
                value={filters.role}
                onValueChange={(val) => setFilters((f) => ({ ...f, role: val }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent dir={dir}>
                  {ROLE_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {locale === 'ar' ? opt.ar : opt.en}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Status Filter */}
            <div className="w-full sm:w-48">
              <Label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                {t(locale, 'الحالة', 'Status')}
              </Label>
              <Select
                value={filters.status}
                onValueChange={(val) => setFilters((f) => ({ ...f, status: val }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent dir={dir}>
                  {STATUS_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {locale === 'ar' ? opt.ar : opt.en}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Verified Filter */}
            <div className="w-full sm:w-48">
              <Label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                {t(locale, 'التوثيق', 'Verification')}
              </Label>
              <Select
                value={filters.isVerified}
                onValueChange={(val) => setFilters((f) => ({ ...f, isVerified: val }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent dir={dir}>
                  {VERIFIED_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {locale === 'ar' ? opt.ar : opt.en}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Active Only Toggle */}
            <div className="flex items-center gap-3 lg:pt-5">
              <Switch
                checked={filters.isActive}
                onCheckedChange={(checked) => setFilters((f) => ({ ...f, isActive: checked }))}
                id="active-toggle"
              />
              <Label htmlFor="active-toggle" className="text-sm font-medium cursor-pointer">
                {t(locale, 'النشطون فقط', 'Active only')}
              </Label>
            </div>

            {/* Reset Filters */}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleResetFilters}
              className="gap-2 lg:pt-5 shrink-0"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              {t(locale, 'إعادة تعيين', 'Reset')}
            </Button>
          </div>

          {/* Active filter chips */}
          {(filters.search || filters.role !== 'all' || filters.status !== 'all' || filters.isVerified !== 'all' || filters.isActive) && (
            <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t">
              <Filter className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">
                {t(locale, 'فلاتر نشطة:', 'Active filters:')}
              </span>
              {filters.search && (
                <Badge variant="secondary" className="text-xs gap-1">
                  {t(locale, 'بحث', 'Search')}: &ldquo;{filters.search}&rdquo;
                  <button onClick={() => setFilters((f) => ({ ...f, search: '' }))} className="hover:text-destructive">
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {filters.role !== 'all' && (
                <Badge variant="secondary" className="text-xs gap-1">
                  {t(locale, 'الدور', 'Role')}: {locale === 'ar' ? ROLE_OPTIONS.find((o) => o.value === filters.role)?.ar : ROLE_OPTIONS.find((o) => o.value === filters.role)?.en}
                  <button onClick={() => setFilters((f) => ({ ...f, role: 'all' }))} className="hover:text-destructive">
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {filters.status !== 'all' && (
                <Badge variant="secondary" className="text-xs gap-1">
                  {t(locale, 'الحالة', 'Status')}: {locale === 'ar' ? STATUS_OPTIONS.find((o) => o.value === filters.status)?.ar : STATUS_OPTIONS.find((o) => o.value === filters.status)?.en}
                  <button onClick={() => setFilters((f) => ({ ...f, status: 'all' }))} className="hover:text-destructive">
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {filters.isVerified !== 'all' && (
                <Badge variant="secondary" className="text-xs gap-1">
                  {t(locale, 'التوثيق', 'Verified')}: {locale === 'ar' ? VERIFIED_OPTIONS.find((o) => o.value === filters.isVerified)?.ar : VERIFIED_OPTIONS.find((o) => o.value === filters.isVerified)?.en}
                  <button onClick={() => setFilters((f) => ({ ...f, isVerified: 'all' }))} className="hover:text-destructive">
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {filters.isActive && (
                <Badge variant="secondary" className="text-xs gap-1">
                  {t(locale, 'النشطون فقط', 'Active only')}
                  <button onClick={() => setFilters((f) => ({ ...f, isActive: false }))} className="hover:text-destructive">
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* ============================================ */}
      {/* 4. DATA TABLE                              */}
      {/* ============================================ */}
      <Card className="card-surface">
        <CardContent className="p-0">
          {/* Bulk actions bar */}
          {selectedUsers.size > 0 && (
            <div className="flex items-center justify-between px-4 py-3 border-b bg-surface/50">
              <span className="text-sm font-medium">
                {t(locale, `تم اختيار ${selectedUsers.size} مستخدم`, `${selectedUsers.size} user${selectedUsers.size > 1 ? 's' : ''} selected`)}
              </span>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" className="gap-1.5 text-xs">
                  <Mail className="h-3.5 w-3.5" />
                  {t(locale, 'إرسال إشعار', 'Send Notification')}
                </Button>
                <Button variant="outline" size="sm" className="gap-1.5 text-xs text-destructive hover:text-destructive">
                  <Ban className="h-3.5 w-3.5" />
                  {t(locale, 'تعليق', 'Suspend')}
                </Button>
              </div>
            </div>
          )}

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12 ps-4">
                    <Checkbox
                      checked={allSelected}
                      {...(someSelected ? { 'data-state': 'indeterminate' } : {})}
                      onCheckedChange={toggleAll}
                    />
                  </TableHead>
                  <TableHead className="text-start min-w-[240px]">
                    {t(locale, 'المستخدم', 'User')}
                  </TableHead>
                  <TableHead className="text-start">
                    {t(locale, 'الدور', 'Role')}
                  </TableHead>
                  <TableHead className="text-start">
                    {t(locale, 'الحالة', 'Status')}
                  </TableHead>
                  <TableHead className="text-start">
                    {t(locale, 'التوثيق', 'Verified')}
                  </TableHead>
                  <TableHead className="text-start hidden md:table-cell">
                    {t(locale, 'تاريخ التسجيل', 'Joined')}
                  </TableHead>
                  <TableHead className="text-end pe-4">
                    {t(locale, 'الإجراءات', 'Actions')}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableSkeleton rows={5} />
                ) : users.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7}>
                      <EmptyState
                        icon={<Users className="h-8 w-8" />}
                        title={t(locale, 'لا توجد نتائج', 'No results found')}
                        description={t(locale, 'حاول تعديل معايير البحث أو الفلترة', 'Try adjusting your search or filter criteria')}
                        action={
                          <Button variant="outline" size="sm" onClick={handleResetFilters} className="gap-2">
                            <RotateCcw className="h-3.5 w-3.5" />
                            {t(locale, 'إعادة تعيين الفلاتر', 'Reset Filters')}
                          </Button>
                        }
                      />
                    </TableCell>
                  </TableRow>
                ) : (
                  users.map((user) => (
                    <TableRow
                      key={user.id}
                      className={cn(
                        'transition-colors hover:bg-surface/50 cursor-pointer',
                        selectedUsers.has(user.id) && 'bg-brand/5'
                      )}
                    >
                      {/* Checkbox */}
                      <TableCell className="ps-4">
                        <Checkbox
                          checked={selectedUsers.has(user.id)}
                          onCheckedChange={() => toggleUser(user.id)}
                        />
                      </TableCell>

                      {/* User Info */}
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9 shrink-0">
                            {user.avatar && <AvatarImage src={user.avatar} alt={getDisplayName(user)} />}
                            <AvatarFallback className="text-xs font-medium bg-surface">
                              {getDisplayName(user).charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <p className="text-sm font-medium truncate text-start">
                              {getDisplayName(user)}
                            </p>
                            <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                            {user.phone && (
                              <p className="text-xs text-muted-foreground truncate flex items-center gap-1">
                                <Phone className="h-3 w-3" />
                                {user.phone}
                              </p>
                            )}
                          </div>
                        </div>
                      </TableCell>

                      {/* Role */}
                      <TableCell>
                        <StatusBadge
                          status={getRoleLabel(locale, user.role)}
                          colorClass={getRoleColor(user.role)}
                        />
                      </TableCell>

                      {/* Status */}
                      <TableCell>
                        <StatusBadge
                          status={getStatusLabel(locale, user.accountStatus)}
                          colorClass={getStatusColor(user.accountStatus)}
                        />
                      </TableCell>

                      {/* Verified */}
                      <TableCell>
                        <div className="flex items-center gap-1.5">
                          <ShieldCheck
                            className={cn(
                              'h-4 w-4',
                              user.isVerified
                                ? 'text-green-500'
                                : 'text-gray-400'
                            )}
                          />
                          <span className={cn(
                            'text-xs font-medium',
                            user.isVerified
                              ? 'text-green-600 dark:text-green-400'
                              : 'text-muted-foreground'
                          )}>
                            {user.isVerified
                              ? t(locale, 'موثّق', 'Verified')
                              : t(locale, 'غير موثّق', 'Unverified')}
                          </span>
                        </div>
                      </TableCell>

                      {/* Joined Date */}
                      <TableCell className="hidden md:table-cell">
                        <span className="text-xs text-muted-foreground">
                          {formatDate(user.createdAt, locale)}
                        </span>
                      </TableCell>

                      {/* Actions */}
                      <TableCell className="text-end pe-4">
                        <DropdownMenu dir={dir}>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">
                                {t(locale, 'الإجراءات', 'Actions')}
                              </span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align={isRTL ? 'start' : 'end'} className="w-48">
                            <DropdownMenuLabel>
                              {t(locale, 'إجراءات', 'Actions')}
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleViewDetails(user)} className="gap-2 cursor-pointer">
                              <Eye className="h-4 w-4" />
                              {t(locale, 'عرض التفاصيل', 'View Details')}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleOpenEditRole(user)} className="gap-2 cursor-pointer">
                              <Pencil className="h-4 w-4" />
                              {t(locale, 'تعديل الدور', 'Edit Role')}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            {user.accountStatus === 'suspended' ? (
                              <DropdownMenuItem onClick={() => handleActivate(user)} className="gap-2 cursor-pointer text-green-600 dark:text-green-400">
                                <CheckCircle2 className="h-4 w-4" />
                                {t(locale, 'تفعيل الحساب', 'Activate Account')}
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem onClick={() => handleOpenSuspend(user)} className="gap-2 cursor-pointer text-amber-600 dark:text-amber-400">
                                <Ban className="h-4 w-4" />
                                {t(locale, 'تعليق الحساب', 'Suspend Account')}
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleOpenDelete(user)}
                              variant="destructive"
                              className="gap-2 cursor-pointer"
                            >
                              <Trash2 className="h-4 w-4" />
                              {t(locale, 'حذف الحساب', 'Delete Account')}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* ============================================ */}
          {/* 5. PAGINATION                             */}
          {/* ============================================ */}
          {!loading && users.length > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-4 py-3 border-t">
              {/* Showing info */}
              <p className="text-sm text-muted-foreground">
                {t(locale,
                  `عرض ${(pagination.page - 1) * pagination.pageSize + 1}–${Math.min(pagination.page * pagination.pageSize, pagination.total)} من ${pagination.total} مستخدم`,
                  `Showing ${(pagination.page - 1) * pagination.pageSize + 1}–${Math.min(pagination.page * pagination.pageSize, pagination.total)} of ${pagination.total} users`
                )}
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
                  {/* First page */}
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => goToPage(1)}
                    disabled={pagination.page <= 1}
                  >
                    <ChevronsLeft className="h-4 w-4" />
                  </Button>
                  {/* Previous */}
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => goToPage(pagination.page - 1)}
                    disabled={pagination.page <= 1}
                  >
                    {isRTL ? <ArrowRight className="h-4 w-4" /> : <ArrowLeft className="h-4 w-4" />}
                  </Button>

                  {/* Page numbers */}
                  {pageNumbers.map((pageNum, idx) => {
                    // Detect gaps for ellipsis
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

                  {/* Next */}
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => goToPage(pagination.page + 1)}
                    disabled={pagination.page >= pagination.totalPages}
                  >
                    {isRTL ? <ArrowLeft className="h-4 w-4" /> : <ArrowRight className="h-4 w-4" />}
                  </Button>
                  {/* Last page */}
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

      {/* ============================================ */}
      {/* 7. USER DETAIL SHEET                       */}
      {/* ============================================ */}
      <Sheet open={drawerOpen} onOpenChange={(open) => { setDrawerOpen(open); if (!open) setSelectedUser(null); }}>
        <SheetContent
          side={isRTL ? 'right' : 'left'}
          className="w-full sm:max-w-md p-0 overflow-y-auto"
        >
          {selectedUser && (
            <div dir={dir} className="flex flex-col h-full">
              {/* Header */}
              <SheetHeader className="p-4 pb-0 shrink-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 min-w-0">
                    <Avatar className="h-10 w-10 shrink-0">
                      {selectedUser.avatar && <AvatarImage src={selectedUser.avatar} alt={getDisplayName(selectedUser)} />}
                      <AvatarFallback className="text-sm font-medium bg-surface">
                        {getDisplayName(selectedUser).charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <SheetTitle className="text-base truncate">
                        {getDisplayName(selectedUser)}
                      </SheetTitle>
                      <div className="flex items-center gap-2 mt-0.5">
                        <StatusBadge
                          status={getRoleLabel(locale, selectedUser.role)}
                          colorClass={getRoleColor(selectedUser.role)}
                        />
                      </div>
                    </div>
                  </div>
                </div>
                <SheetDescription className="sr-only">
                  {t(locale, 'تفاصيل المستخدم', 'User details')}
                </SheetDescription>
              </SheetHeader>

              <div className="flex-1 overflow-y-auto p-4 space-y-6">
                {/* Profile Section */}
                <div className="flex flex-col items-center text-center gap-3 py-4">
                  <Avatar className="h-20 w-20">
                    {selectedUser.avatar && <AvatarImage src={selectedUser.avatar} alt={getDisplayName(selectedUser)} />}
                    <AvatarFallback className="text-2xl font-bold bg-surface">
                      {getDisplayName(selectedUser).charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold text-lg">{getDisplayName(selectedUser)}</h3>
                    <p className="text-sm text-muted-foreground mt-0.5">{selectedUser.email}</p>
                    {selectedUser.phone && (
                      <p className="text-sm text-muted-foreground flex items-center justify-center gap-1 mt-0.5">
                        <Phone className="h-3.5 w-3.5" />
                        {selectedUser.phone}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Calendar className="h-3.5 w-3.5" />
                    {t(locale, 'انضم في', 'Joined')} {formatDate(selectedUser.createdAt, locale)}
                  </div>
                </div>

                <Separator />

                {/* Account Info */}
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                    {t(locale, 'معلومات الحساب', 'Account Info')}
                  </h4>
                  <div className="space-y-3">
                    {/* Status */}
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        {t(locale, 'حالة الحساب', 'Account Status')}
                      </span>
                      <StatusBadge
                        status={getStatusLabel(locale, selectedUser.accountStatus)}
                        colorClass={getStatusColor(selectedUser.accountStatus)}
                      />
                    </div>
                    {/* Verified */}
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        {t(locale, 'التوثيق', 'Verification')}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <ShieldCheck className={cn('h-4 w-4', selectedUser.isVerified ? 'text-green-500' : 'text-gray-400')} />
                        <span className={cn('text-xs font-medium', selectedUser.isVerified ? 'text-green-600 dark:text-green-400' : 'text-muted-foreground')}>
                          {selectedUser.isVerified
                            ? t(locale, 'موثّق', 'Verified')
                            : t(locale, 'غير موثّق', 'Unverified')}
                        </span>
                      </div>
                    </div>
                    {/* Active */}
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        {t(locale, 'نشط', 'Active')}
                      </span>
                      <div className={cn(
                        'inline-flex items-center gap-1 text-xs font-medium',
                        selectedUser.isActive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                      )}>
                        <span className={cn('h-2 w-2 rounded-full', selectedUser.isActive ? 'bg-green-500' : 'bg-red-500')} />
                        {selectedUser.isActive ? t(locale, 'نعم', 'Yes') : t(locale, 'لا', 'No')}
                      </div>
                    </div>
                    {/* Last Activity */}
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        {t(locale, 'آخر نشاط', 'Last Activity')}
                      </span>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        {t(locale, 'منذ ساعة', '1 hour ago')}
                      </span>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Quick Stats */}
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                    {t(locale, 'إحصائيات سريعة', 'Quick Stats')}
                  </h4>
                  <div className="grid grid-cols-2 gap-3">
                    {/* Orders */}
                    <div className="p-3 rounded-xl border bg-surface/50">
                      <div className="flex items-center gap-2 mb-1">
                        <ShoppingCart className="h-4 w-4 text-blue-500" />
                        <span className="text-xs text-muted-foreground">{t(locale, 'الطلبات', 'Orders')}</span>
                      </div>
                      <p className="text-lg font-bold">{selectedUser._count?.orders ?? 0}</p>
                    </div>
                    {/* Wallet */}
                    <div className="p-3 rounded-xl border bg-surface/50">
                      <div className="flex items-center gap-2 mb-1">
                        <Wallet className="h-4 w-4 text-green-500" />
                        <span className="text-xs text-muted-foreground">{t(locale, 'المحفظة', 'Wallet')}</span>
                      </div>
                      <p className="text-lg font-bold">{formatBalance(selectedUser.wallet?.balance ?? 0)}</p>
                    </div>
                    {/* Rating (sellers/suppliers only) */}
                    {(selectedUser.role === 'seller' || selectedUser.role === 'supplier') && selectedUser.sellerProfile && (
                      <div className="p-3 rounded-xl border bg-surface/50 col-span-2">
                        <div className="flex items-center gap-2 mb-1">
                          <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                          <span className="text-xs text-muted-foreground">{t(locale, 'التقييم', 'Rating')}</span>
                        </div>
                        <p className="text-lg font-bold">{selectedUser.sellerProfile.rating.toFixed(1)}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Store Info (store_manager only) */}
                {selectedUser.role === 'store_manager' && selectedUser.store && (
                  <>
                    <Separator />
                    <div className="space-y-3">
                      <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                        {t(locale, 'معلومات المتجر', 'Store Info')}
                      </h4>
                      <div className="flex items-center gap-3 p-3 rounded-xl border bg-surface/50">
                        <div className="h-10 w-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                          <Store className="h-5 w-5" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate">{selectedUser.store.name}</p>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="h-2 w-2 rounded-full bg-green-500" />
                            <span className="text-xs text-green-600 dark:text-green-400">
                              {t(locale, 'نشط', 'Active')}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Footer Actions */}
              <SheetFooter className="p-4 border-t shrink-0 flex-col gap-2 sm:flex-col">
                <Button
                  variant="outline"
                  className="w-full gap-2"
                  onClick={() => { setDrawerOpen(false); handleOpenEditRole(selectedUser); }}
                >
                  <Pencil className="h-4 w-4" />
                  {t(locale, 'تعديل الدور', 'Edit Role')}
                </Button>
                {selectedUser.accountStatus === 'suspended' ? (
                  <Button
                    variant="outline"
                    className="w-full gap-2 text-green-600 dark:text-green-400 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20"
                    onClick={() => { setDrawerOpen(false); handleActivate(selectedUser); }}
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    {t(locale, 'تفعيل الحساب', 'Activate Account')}
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    className="w-full gap-2 text-amber-600 dark:text-amber-400 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20"
                    onClick={() => { setDrawerOpen(false); handleOpenSuspend(selectedUser); }}
                  >
                    <Ban className="h-4 w-4" />
                    {t(locale, 'تعليق الحساب', 'Suspend Account')}
                  </Button>
                )}
                <Button
                  variant="outline"
                  className="w-full gap-2 text-destructive hover:text-destructive hover:bg-destructive/10"
                  onClick={() => { setDrawerOpen(false); handleOpenDelete(selectedUser); }}
                >
                  <Trash2 className="h-4 w-4" />
                  {t(locale, 'حذف الحساب', 'Delete Account')}
                </Button>
              </SheetFooter>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* ============================================ */}
      {/* 8. EDIT ROLE DIALOG                        */}
      {/* ============================================ */}
      <AlertDialog open={editRoleOpen} onOpenChange={setEditRoleOpen}>
        <AlertDialogContent dir={dir}>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <ArrowRightLeft className="h-5 w-5 text-brand" />
              {t(locale, 'تعديل دور المستخدم', 'Edit User Role')}
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-4 text-start">
                {/* User info */}
                <div>
                  <p className="text-sm text-muted-foreground">
                    {t(locale, 'المستخدم', 'User')}
                  </p>
                  <p className="text-sm font-medium mt-0.5">
                    {selectedUser ? getDisplayName(selectedUser) : ''}
                  </p>
                </div>

                {/* Current role */}
                <div>
                  <p className="text-sm text-muted-foreground">
                    {t(locale, 'الدور الحالي', 'Current Role')}
                  </p>
                  <StatusBadge
                    status={selectedUser ? getRoleLabel(locale, selectedUser.role) : ''}
                    colorClass={selectedUser ? getRoleColor(selectedUser.role) : ''}
                    className="mt-1"
                  />
                </div>

                {/* New role select — filtered to allowed targets only */}
                <div>
                  <Label className="text-sm text-muted-foreground">
                    {t(locale, 'الدور الجديد', 'New Role')}
                  </Label>
                  <Select value={editRoleNew} onValueChange={(val) => setEditRoleNew(val as UserRole)}>
                    <SelectTrigger className="mt-1.5">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent dir={dir}>
                      {ROLE_OPTIONS
                        .filter((r) => r.value !== 'all' && allowedRoleTargets.includes(r.value))
                        .map((opt) => {
                          const isCurrent = opt.value === selectedUser?.role;
                          return (
                            <SelectItem
                              key={opt.value}
                              value={opt.value}
                              disabled={isCurrent}
                            >
                              <span className={cn(isCurrent && 'text-muted-foreground')}>
                                {locale === 'ar' ? opt.ar : opt.en}
                                {isCurrent && (
                                  <span className="text-xs text-muted-foreground ms-2">
                                    ({t(locale, 'الحالي', 'Current')})
                                  </span>
                                )}
                              </span>
                            </SelectItem>
                          );
                        })}
                    </SelectContent>
                  </Select>
                </div>

                {/* Warning banner (always visible) */}
                <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
                  <p className="text-xs text-amber-800 dark:text-amber-300 flex items-start gap-2">
                    <Shield className="h-4 w-4 shrink-0 mt-0.5" />
                    {t(locale, 'تغيير الدور قد يؤثر على صلاحيات المستخدم ووصوله إلى ميزات المنصة.', 'Changing the role may affect the user\'s permissions and access to platform features.')}
                  </p>
                </div>

                {/* Transition Preview — computed client-side from shared config */}
                {transitionPreview && (
                  <div className={cn(
                    'p-4 rounded-lg border space-y-3',
                    transitionPreview.warningLevel === 'danger'
                      ? 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800'
                      : transitionPreview.warningLevel === 'warning'
                        ? 'bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-800'
                        : 'bg-surface border-border'
                  )}>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-1.5">
                      <ArrowRightLeft className="h-3.5 w-3.5" />
                      {t(locale, 'ملخص التحويل', 'Transition Summary')}
                    </p>

                    {/* Visual flow: FROM → TO */}
                    <div className="flex items-center gap-3">
                      {/* From badge */}
                      <div className="flex-1 text-center p-2 rounded-lg border">
                        <p className="text-xs text-muted-foreground">{t(locale, 'من', 'From')}</p>
                        <StatusBadge
                          status={getRoleLabel(locale, selectedUser!.role)}
                          colorClass={getRoleColor(selectedUser!.role)}
                          className="mt-1"
                        />
                      </div>

                      {/* Arrow + status indicator */}
                      <div className="flex flex-col items-center gap-1 shrink-0">
                        <ArrowLeft className={cn('h-5 w-5 text-brand', isRTL && 'rotate-180')} />
                        {transitionPreview.allowed ? (
                          <span className={cn(
                            'text-[10px] font-medium px-1.5 py-0.5 rounded-full',
                            transitionPreview.requiresVerification
                              ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300'
                              : 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300'
                          )}>
                            {transitionPreview.requiresVerification
                              ? t(locale, 'تحتاج توثيق', 'Needs verification')
                              : t(locale, 'مباشر', 'Immediate')}
                          </span>
                        ) : (
                          <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300">
                            {t(locale, 'محظور', 'Blocked')}
                          </span>
                        )}
                      </div>

                      {/* To badge */}
                      <div className="flex-1 text-center p-2 rounded-lg border">
                        <p className="text-xs text-muted-foreground">{t(locale, 'إلى', 'To')}</p>
                        <StatusBadge
                          status={getRoleLabel(locale, editRoleNew)}
                          colorClass={getRoleColor(editRoleNew)}
                          className="mt-1"
                        />
                      </div>
                    </div>

                    {/* Status change indicator */}
                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-muted-foreground">
                        {t(locale, 'حالة الحساب', 'Account Status')}:
                      </span>
                      <Badge variant="outline" className={cn(
                        'text-[10px]',
                        transitionPreview.newStatus === 'pending'
                          ? 'border-amber-300 text-amber-700 bg-amber-50 dark:border-amber-700 dark:text-amber-300 dark:bg-amber-900/30'
                          : 'border-green-300 text-green-700 bg-green-50 dark:border-green-700 dark:text-green-300 dark:bg-green-900/30'
                      )}>
                        {transitionPreview.newStatus === 'pending'
                          ? t(locale, 'سيصبح: بانتظار المراجعة', 'Will become: Pending')
                          : t(locale, 'سيصبح: نشط', 'Will become: Active')}
                      </Badge>
                      {transitionPreview.requiresVerification && (
                        <Badge variant="outline" className="text-[10px] border-amber-300 text-amber-700 bg-amber-50 dark:border-amber-700 dark:text-amber-300 dark:bg-amber-900/30">
                          {t(locale, 'يتطلب توثيق', 'Requires Verification')}
                        </Badge>
                      )}
                    </div>

                    {/* Blocked state — red danger box */}
                    {!transitionPreview.allowed && (
                      <div className="p-3 rounded-lg bg-red-100 border border-red-300 dark:bg-red-900/30 dark:border-red-700">
                        <p className="text-sm text-red-800 dark:text-red-300 flex items-start gap-2 font-medium">
                          <XCircle className="h-4 w-4 shrink-0 mt-0.5" />
                          {locale === 'ar' ? transitionPreview.messageAr : transitionPreview.messageEn}
                        </p>
                      </div>
                    )}

                    {/* Impact list — bullet points with icons */}
                    {transitionPreview.allowed && (
                      <ul className="space-y-2 pt-2 border-t">
                        {transitionPreview.impactsAr.map((impactAr, i) => {
                          const impactEn = transitionPreview.impactsEn[i] || impactAr;
                          const isDeactivation = impactAr.includes('تعطيل') || impactEn.toLowerCase().includes('deactivat');
                          const isVerification = impactAr.includes('توثيق') || impactEn.toLowerCase().includes('verif');
                          const isLoss = impactAr.includes('ستفقد') || impactEn.toLowerCase().includes('will be lost');

                          return (
                            <li key={i} className="flex items-start gap-2 text-xs">
                              {isDeactivation || isLoss ? (
                                <AlertTriangle className="h-3.5 w-3.5 shrink-0 mt-0.5 text-amber-500" />
                              ) : isVerification ? (
                                <Info className="h-3.5 w-3.5 shrink-0 mt-0.5 text-blue-500" />
                              ) : (
                                <CheckCircle2 className="h-3.5 w-3.5 shrink-0 mt-0.5 text-green-500" />
                              )}
                              <span className={cn(
                                isDeactivation || isLoss
                                  ? 'text-amber-700 dark:text-amber-300'
                                  : isVerification
                                    ? 'text-blue-700 dark:text-blue-300'
                                    : 'text-muted-foreground'
                              )}>
                                {locale === 'ar' ? impactAr : impactEn}
                              </span>
                            </li>
                          );
                        })}
                      </ul>
                    )}

                    {/* Deactivation notice */}
                    {transitionPreview.allowed && transitionPreview.deactivates && transitionPreview.deactivates.includes('Store') && (
                      <div className="flex items-start gap-2 text-xs text-amber-700 dark:text-amber-300 pt-2 border-t">
                        <Building className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                        <span>
                          {t(locale, 'المتجر المرتبط بالحساب سيتم تعطيله', 'The store linked to this account will be deactivated')}
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t(locale, 'إلغاء', 'Cancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmEditRole}
              disabled={
                editRoleLoading
                || editRoleNew === selectedUser?.role
                || !transitionPreview?.allowed
              }
              className={cn(
                !transitionPreview?.allowed && editRoleNew !== selectedUser?.role
                  ? 'bg-destructive hover:bg-destructive/90 text-destructive-foreground'
                  : ''
              )}
            >
              {editRoleLoading && <Loader2 className="h-4 w-4 animate-spin" />}
              {editRoleNew === selectedUser?.role
                ? t(locale, 'اختر دوراً مختلفاً', 'Choose a different role')
                : !transitionPreview?.allowed
                  ? t(locale, 'غير مسموح', 'Not Allowed')
                  : transitionPreview?.requiresVerification
                    ? t(locale, 'تأكيد التحويل', 'Confirm Transition')
                    : t(locale, 'تأكيد التحويل', 'Confirm Transition')
              }
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* ============================================ */}
      {/* 9. SUSPEND USER DIALOG                     */}
      {/* ============================================ */}
      <AlertDialog open={suspendOpen} onOpenChange={setSuspendOpen}>
        <AlertDialogContent dir={dir}>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t(locale, 'تعليق حساب المستخدم', 'Suspend User Account')}
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-4 text-start">
                <div>
                  <p className="text-sm text-muted-foreground">
                    {t(locale, 'المستخدم', 'User')}
                  </p>
                  <p className="text-sm font-medium mt-0.5">
                    {selectedUser ? getDisplayName(selectedUser) : ''}
                  </p>
                </div>
                <div>
                  <Label className="text-sm">
                    {t(locale, 'سبب التعليق', 'Suspension Reason')} <span className="text-destructive">*</span>
                  </Label>
                  <Textarea
                    value={suspendReason}
                    onChange={(e) => setSuspendReason(e.target.value)}
                    placeholder={t(locale, 'أدخل سبب تعليق الحساب...', 'Enter the reason for suspending the account...')}
                    className="mt-1.5 min-h-[80px]"
                  />
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">
                    {t(locale, 'مدة التعليق', 'Suspension Duration')}
                  </Label>
                  <Select value={suspendDuration} onValueChange={(val) => setSuspendDuration(val as 'temporary' | 'permanent')}>
                    <SelectTrigger className="mt-1.5">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent dir={dir}>
                      <SelectItem value="temporary">
                        {t(locale, 'مؤقت', 'Temporary')}
                      </SelectItem>
                      <SelectItem value="permanent">
                        {t(locale, 'دائم', 'Permanent')}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                  <p className="text-xs text-red-800 dark:text-red-300 flex items-start gap-2">
                    <XCircle className="h-4 w-4 shrink-0 mt-0.5" />
                    {t(locale, 'سيتم تعطيل الحساب وفقدان الوصول لجميع ميزات المنصة.', 'The account will be deactivated and lose access to all platform features.')}
                  </p>
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t(locale, 'إلغاء', 'Cancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmSuspend}
              disabled={suspendLoading || !suspendReason.trim()}
              className="bg-amber-600 hover:bg-amber-700 text-white"
            >
              {suspendLoading && <Loader2 className="h-4 w-4 animate-spin" />}
              {t(locale, 'تعليق الحساب', 'Suspend Account')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* ============================================ */}
      {/* 10. DELETE USER DIALOG                     */}
      {/* ============================================ */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent dir={dir} className="border-destructive/50">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-destructive">
              {t(locale, 'حذف حساب المستخدم', 'Delete User Account')}
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-4 text-start">
                <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                  <p className="text-sm text-red-800 dark:text-red-300">
                    {t(locale,
                      'تحذير: هذا الإجراء لا يمكن التراجع عنه. سيتم حذف جميع بيانات المستخدم بشكل نهائي.',
                      'Warning: This action cannot be undone. All user data will be permanently deleted.'
                    )}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    {t(locale, 'المستخدم', 'User')}
                  </p>
                  <p className="text-sm font-medium mt-0.5">
                    {selectedUser ? getDisplayName(selectedUser) : ''}
                  </p>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">
                    {t(locale, 'اكتب DELETE للتأكيد', 'Type DELETE to confirm')}
                  </Label>
                  <Input
                    value={deleteConfirm}
                    onChange={(e) => setDeleteConfirm(e.target.value)}
                    placeholder="DELETE"
                    className="mt-1.5 font-mono"
                  />
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t(locale, 'إلغاء', 'Cancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              disabled={deleteLoading || deleteConfirm !== 'DELETE'}
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
            >
              {deleteLoading && <Loader2 className="h-4 w-4 animate-spin" />}
              {t(locale, 'حذف الحساب نهائياً', 'Delete Permanently')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
