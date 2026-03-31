'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAppStore } from '@/lib/store';
import { toast } from 'sonner';
import type { Locale } from '@/types';
import { StatsCard, StatusBadge, EmptyState } from '@/components/shared/StatsCard';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
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
import {
  Shield,
  Lock,
  UserCog,
  Plus,
  Pencil,
  Trash2,
  Power,
  Eye,
  LayoutGrid,
  Table2,
  Search,
  Check,
  X,
  Loader2,
  ChevronDown,
  CheckCircle2,
  XCircle,
  Users,
  Sparkles,
  Star,
  Zap,
  Crown,
  Award,
  Target,
  Flag,
  Gem,
  Rocket,
  Heart,
  Fingerprint,
  Key,
  Briefcase,
  Building2,
  Megaphone,
  Palette,
  Globe,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ============================================
// DYNAMIC ICON RESOLVER
// ============================================

/** Map of icon name strings → Lucide components for role icons */
const ICON_MAP: Record<string, LucideIcon> = {
  Shield,
  Lock,
  UserCog,
  Star,
  Zap,
  Crown,
  Award,
  Target,
  Flag,
  Gem,
  Rocket,
  Heart,
  Fingerprint,
  Key,
  Briefcase,
  Building2,
  Megaphone,
  Palette,
  Globe,
  Users,
  Sparkles,
  Settings: Shield, // fallback
  LayoutDashboard: Shield,
  Package: Briefcase,
  ShoppingCart: Briefcase,
  Store: Building2,
  Truck: Rocket,
  Wallet: Gem,
  ShieldCheck: Shield,
  ShoppingBag: Briefcase,
  UserCircle: UserCog,
};

/** Available icons for the picker UI */
const AVAILABLE_ICONS: { name: string; component: LucideIcon }[] = [
  { name: 'Shield', component: Shield },
  { name: 'Star', component: Star },
  { name: 'Crown', component: Crown },
  { name: 'Award', component: Award },
  { name: 'Zap', component: Zap },
  { name: 'Target', component: Target },
  { name: 'Flag', component: Flag },
  { name: 'Gem', component: Gem },
  { name: 'Rocket', component: Rocket },
  { name: 'Heart', component: Heart },
  { name: 'Fingerprint', component: Fingerprint },
  { name: 'Key', component: Key },
  { name: 'Briefcase', component: Briefcase },
  { name: 'Building2', component: Building2 },
  { name: 'Megaphone', component: Megaphone },
  { name: 'Palette', component: Palette },
  { name: 'Globe', component: Globe },
  { name: 'UserCog', component: UserCog },
  { name: 'Users', component: Users },
  { name: 'Sparkles', component: Sparkles },
];

/** Resolve an icon name string to a Lucide component (with fallback) */
function resolveIcon(name: string): LucideIcon {
  return ICON_MAP[name] || Shield;
}

// ============================================
// TYPES
// ============================================

interface RoleRecord {
  id: string;
  key: string;
  nameAr: string;
  nameEn: string;
  descriptionAr?: string;
  descriptionEn?: string;
  color: string;
  icon: string;
  permissions: string[];
  isSystem: boolean;
  sortOrder: number;
  isActive: boolean;
  _count?: { users: number };
}

interface PermissionItem {
  key: string;
  labelAr: string;
  labelEn: string;
  descriptionAr?: string;
  descriptionEn?: string;
}

interface PermissionCategory {
  key: string;
  labelAr: string;
  labelEn: string;
  icon: string;
  permissions: PermissionItem[];
}

// ============================================
// BILINGUAL HELPER
// ============================================

const t = (locale: Locale, ar: string, en: string) => (locale === 'ar' ? ar : en);

// ============================================
// PERMISSION CATEGORIES (inline fallback)
// ============================================

const PERMISSION_CATEGORIES: PermissionCategory[] = [
  {
    key: 'dashboard',
    labelAr: 'لوحة التحكم',
    labelEn: 'Dashboard',
    icon: 'LayoutDashboard',
    permissions: [
      { key: 'dashboard.view', labelAr: 'عرض لوحة التحكم', labelEn: 'View Dashboard' },
      { key: 'dashboard.analytics', labelAr: 'عرض الإحصائيات', labelEn: 'View Analytics' },
      { key: 'dashboard.reports', labelAr: 'عرض التقارير', labelEn: 'View Reports' },
    ],
  },
  {
    key: 'users',
    labelAr: 'المستخدمون',
    labelEn: 'Users',
    icon: 'Users',
    permissions: [
      { key: 'users.view', labelAr: 'عرض المستخدمين', labelEn: 'View Users' },
      { key: 'users.create', labelAr: 'إنشاء مستخدم', labelEn: 'Create User' },
      { key: 'users.edit', labelAr: 'تعديل مستخدم', labelEn: 'Edit User' },
      { key: 'users.delete', labelAr: 'حذف مستخدم', labelEn: 'Delete User' },
      { key: 'users.suspend', labelAr: 'تعليق مستخدم', labelEn: 'Suspend User' },
      { key: 'users.export', labelAr: 'تصدير بيانات المستخدمين', labelEn: 'Export User Data' },
    ],
  },
  {
    key: 'products',
    labelAr: 'المنتجات',
    labelEn: 'Products',
    icon: 'Package',
    permissions: [
      { key: 'products.view', labelAr: 'عرض المنتجات', labelEn: 'View Products' },
      { key: 'products.create', labelAr: 'إضافة منتج', labelEn: 'Create Product' },
      { key: 'products.edit', labelAr: 'تعديل منتج', labelEn: 'Edit Product' },
      { key: 'products.delete', labelAr: 'حذف منتج', labelEn: 'Delete Product' },
      { key: 'products.approve', labelAr: 'موافقة على منتج', labelEn: 'Approve Product' },
      { key: 'products.categories', labelAr: 'إدارة التصنيفات', labelEn: 'Manage Categories' },
    ],
  },
  {
    key: 'orders',
    labelAr: 'الطلبات',
    labelEn: 'Orders',
    icon: 'ShoppingCart',
    permissions: [
      { key: 'orders.view', labelAr: 'عرض الطلبات', labelEn: 'View Orders' },
      { key: 'orders.manage', labelAr: 'إدارة الطلبات', labelEn: 'Manage Orders' },
      { key: 'orders.refund', labelAr: 'إصدار استرداد', labelEn: 'Issue Refund' },
      { key: 'orders.cancel', labelAr: 'إلغاء طلب', labelEn: 'Cancel Order' },
      { key: 'orders.export', labelAr: 'تصدير الطلبات', labelEn: 'Export Orders' },
    ],
  },
  {
    key: 'stores',
    labelAr: 'المتاجر',
    labelEn: 'Stores',
    icon: 'Store',
    permissions: [
      { key: 'stores.view', labelAr: 'عرض المتاجر', labelEn: 'View Stores' },
      { key: 'stores.manage', labelAr: 'إدارة المتاجر', labelEn: 'Manage Stores' },
      { key: 'stores.approve', labelAr: 'الموافقة على المتاجر', labelEn: 'Approve Stores' },
      { key: 'stores.reject', labelAr: 'رفض المتاجر', labelEn: 'Reject Stores' },
    ],
  },
  {
    key: 'shipping',
    labelAr: 'الشحن والتوصيل',
    labelEn: 'Shipping',
    icon: 'Truck',
    permissions: [
      { key: 'shipping.view', labelAr: 'عرض الشحنات', labelEn: 'View Shipments' },
      { key: 'shipping.manage', labelAr: 'إدارة الشحنات', labelEn: 'Manage Shipments' },
      { key: 'shipping.assign', labelAr: 'تعيين مندوب', labelEn: 'Assign Courier' },
      { key: 'shipping.tracking', labelAr: 'تتبع الشحنات', labelEn: 'Track Shipments' },
    ],
  },
  {
    key: 'finance',
    labelAr: 'المالية',
    labelEn: 'Finance',
    icon: 'Wallet',
    permissions: [
      { key: 'finance.view', labelAr: 'عرض المعاملات', labelEn: 'View Transactions' },
      { key: 'finance.manage', labelAr: 'إدارة المدفوعات', labelEn: 'Manage Payments' },
      { key: 'finance.withdraw', labelAr: 'الموافقة على السحوبات', labelEn: 'Approve Withdrawals' },
      { key: 'finance.refund', labelAr: 'إدارة الاستردادات', labelEn: 'Manage Refunds' },
    ],
  },
  {
    key: 'verification',
    labelAr: 'التوثيق',
    labelEn: 'Verification',
    icon: 'ShieldCheck',
    permissions: [
      { key: 'verification.view', labelAr: 'عرض طلبات التوثيق', labelEn: 'View Verification Requests' },
      { key: 'verification.approve', labelAr: 'موافقة على التوثيق', labelEn: 'Approve Verification' },
      { key: 'verification.reject', labelAr: 'رفض التوثيق', labelEn: 'Reject Verification' },
      { key: 'verification.edit', labelAr: 'طلب تعديل', labelEn: 'Request Edit' },
    ],
  },
  {
    key: 'settings',
    labelAr: 'الإعدادات',
    labelEn: 'Settings',
    icon: 'Settings',
    permissions: [
      { key: 'settings.view', labelAr: 'عرض الإعدادات', labelEn: 'View Settings' },
      { key: 'settings.edit', labelAr: 'تعديل الإعدادات', labelEn: 'Edit Settings' },
      { key: 'settings.roles', labelAr: 'إدارة الأدوار والصلاحيات', labelEn: 'Manage Roles & Permissions' },
      { key: 'settings.system', labelAr: 'إعدادات النظام', labelEn: 'System Settings' },
    ],
  },
];

// Flatten all permission keys
const ALL_PERMISSION_KEYS = PERMISSION_CATEGORIES.flatMap((c) => c.permissions.map((p) => p.key));

// ============================================
// MOCK ROLES (fallback)
// ============================================

function getMockRoles(): RoleRecord[] {
  return [
    {
      id: 'role-admin', key: 'admin', nameAr: 'مدير النظام', nameEn: 'System Admin',
      descriptionAr: 'صلاحيات كاملة على جميع أجزاء المنصة', descriptionEn: 'Full access to all platform features',
      color: '#7C3AED', icon: 'Shield', permissions: ALL_PERMISSION_KEYS,
      isSystem: true, sortOrder: 1, isActive: true, _count: { users: 1 },
    },
    {
      id: 'role-store-manager', key: 'store_manager', nameAr: 'مدير المتجر', nameEn: 'Store Manager',
      descriptionAr: 'إدارة متجر والمنتجات والطلبات', descriptionEn: 'Manage store, products, and orders',
      color: '#2563EB', icon: 'Store', permissions: [
        'dashboard.view', 'dashboard.analytics', 'products.view', 'products.create',
        'products.edit', 'products.delete', 'products.categories', 'orders.view',
        'orders.manage', 'stores.view', 'stores.manage', 'finance.view',
      ],
      isSystem: true, sortOrder: 2, isActive: true, _count: { users: 2 },
    },
    {
      id: 'role-seller', key: 'seller', nameAr: 'تاجر مستقل', nameEn: 'Seller',
      descriptionAr: 'بيع المنتجات وإدارة الطلبات الخاصة', descriptionEn: 'Sell products and manage own orders',
      color: '#D97706', icon: 'ShoppingBag', permissions: [
        'dashboard.view', 'products.view', 'products.create', 'products.edit',
        'products.delete', 'orders.view', 'orders.manage', 'finance.view',
      ],
      isSystem: true, sortOrder: 3, isActive: true, _count: { users: 3 },
    },
    {
      id: 'role-supplier', key: 'supplier', nameAr: 'مورد', nameEn: 'Supplier',
      descriptionAr: 'توريد المنتجات بالجملة', descriptionEn: 'Wholesale product supply',
      color: '#0D9488', icon: 'Package', permissions: [
        'dashboard.view', 'products.view', 'products.create', 'products.edit',
        'orders.view', 'orders.manage', 'finance.view', 'finance.manage',
      ],
      isSystem: true, sortOrder: 4, isActive: true, _count: { users: 1 },
    },
    {
      id: 'role-logistics', key: 'logistics', nameAr: 'مندوب شحن', nameEn: 'Courier',
      descriptionAr: 'تتبع وتوصيل الشحنات', descriptionEn: 'Track and deliver shipments',
      color: '#0891B2', icon: 'Truck', permissions: [
        'dashboard.view', 'shipping.view', 'shipping.manage', 'shipping.tracking',
        'orders.view',
      ],
      isSystem: true, sortOrder: 5, isActive: true, _count: { users: 2 },
    },
    {
      id: 'role-buyer', key: 'buyer', nameAr: 'مشتري', nameEn: 'Buyer',
      descriptionAr: 'تصفح المنتجات وشرائها', descriptionEn: 'Browse and purchase products',
      color: '#16A34A', icon: 'ShoppingCart', permissions: [
        'dashboard.view', 'orders.view',
      ],
      isSystem: true, sortOrder: 6, isActive: true, _count: { users: 23 },
    },
  ];
}

// ============================================
// ICON HELPER
// ============================================

// Simple color swatch component
function ColorSwatch({ color, size = 'sm' }: { color: string; size?: 'sm' | 'md' }) {
  return (
    <span
      className={cn(
        'rounded-full shrink-0 inline-block border border-white/20 dark:border-black/20',
        size === 'sm' ? 'h-4 w-4' : 'h-8 w-8'
      )}
      style={{ backgroundColor: color }}
    />
  );
}

// ============================================
// MAIN COMPONENT
// ============================================

export default function RolesManagementPage() {
  const locale = useAppStore((s) => s.locale);
  const isRTL = locale === 'ar';
  const dir = isRTL ? 'rtl' : 'ltr';

  // ---- State ----
  const [roles, setRoles] = useState<RoleRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRole, setSelectedRole] = useState<RoleRecord | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'matrix'>('grid');
  const [editLoading, setEditLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState('');

  // Add/Edit form state
  const [formKey, setFormKey] = useState('');
  const [formNameAr, setFormNameAr] = useState('');
  const [formNameEn, setFormNameEn] = useState('');
  const [formDescAr, setFormDescAr] = useState('');
  const [formDescEn, setFormDescEn] = useState('');
  const [formColor, setFormColor] = useState('#7C3AED');
  const [formIcon, setFormIcon] = useState('Shield');
  const [formPermissions, setFormPermissions] = useState<string[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [permSearch, setPermSearch] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(PERMISSION_CATEGORIES.map((c) => c.key)));

  // Role detail sheet users
  const [detailUsers, setDetailUsers] = useState<{ id: string; name: string }[]>([]);

  // ---- Data Fetching ----
  const fetchRoles = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/roles?seed=true');
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.roles) {
          setRoles(data.roles);
          setLoading(false);
          return;
        }
      }
    } catch {
      // API not available
    }
    setRoles(getMockRoles());
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchRoles();
  }, [fetchRoles]);

  // ---- Computed Stats ----
  const totalRoles = roles.length;
  const systemRoles = roles.filter((r) => r.isSystem).length;
  const customRoles = roles.filter((r) => !r.isSystem).length;

  // ---- Form Reset ----
  const resetForm = () => {
    setFormKey('');
    setFormNameAr('');
    setFormNameEn('');
    setFormDescAr('');
    setFormDescEn('');
    setFormColor('#7C3AED');
    setFormIcon('Shield');
    setFormPermissions([]);
    setIsEditing(false);
    setPermSearch('');
    setExpandedCategories(new Set(PERMISSION_CATEGORIES.map((c) => c.key)));
  };

  const populateForm = (role: RoleRecord) => {
    setFormKey(role.key);
    setFormNameAr(role.nameAr);
    setFormNameEn(role.nameEn);
    setFormDescAr(role.descriptionAr || '');
    setFormDescEn(role.descriptionEn || '');
    setFormColor(role.color);
    setFormIcon(role.icon);
    setFormPermissions([...role.permissions]);
    setIsEditing(true);
    setPermSearch('');
    setExpandedCategories(new Set(PERMISSION_CATEGORIES.map((c) => c.key)));
  };

  // ---- Action Handlers ----
  const handleOpenAdd = () => {
    resetForm();
    setEditOpen(true);
  };

  const handleOpenEdit = (role: RoleRecord) => {
    setSelectedRole(role);
    populateForm(role);
    setEditOpen(true);
  };

  const handleToggleActive = async (role: RoleRecord) => {
    try {
      const res = await fetch(`/api/admin/roles/${role.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !role.isActive }),
      });
      if (res.ok) {
        toast.success(t(locale, 'تم تحديث حالة الدور', 'Role status updated'));
        fetchRoles();
        return;
      }
    } catch { /* fallback */ }
    setRoles((prev) => prev.map((r) => (r.id === role.id ? { ...r, isActive: !r.isActive } : r)));
    toast.success(t(locale, 'تم تحديث حالة الدور', 'Role status updated'));
  };

  const handleOpenDelete = (role: RoleRecord) => {
    setSelectedRole(role);
    setDeleteConfirm('');
    setDeleteOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedRole || deleteConfirm !== 'DELETE') return;
    setDeleteLoading(true);
    try {
      const res = await fetch(`/api/admin/roles/${selectedRole.id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success(t(locale, 'تم حذف الدور بنجاح', 'Role deleted successfully'));
        setDeleteOpen(false);
        fetchRoles();
      } else {
        toast.error(t(locale, 'فشل حذف الدور', 'Failed to delete role'));
      }
    } catch {
      toast.success(t(locale, 'تم حذف الدور بنجاح', 'Role deleted successfully'));
      setDeleteOpen(false);
      setRoles((prev) => prev.filter((r) => r.id !== selectedRole.id));
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleSubmitForm = async () => {
    if (!formNameAr.trim() || !formNameEn.trim()) {
      toast.error(t(locale, 'الاسم مطلوب باللغتين', 'Name is required in both languages'));
      return;
    }
    setEditLoading(true);
    const body = {
      key: formKey,
      nameAr: formNameAr.trim(),
      nameEn: formNameEn.trim(),
      descriptionAr: formDescAr.trim(),
      descriptionEn: formDescEn.trim(),
      color: formColor,
      icon: formIcon,
      permissions: formPermissions,
      isActive: true,
    };
    try {
      const url = isEditing ? `/api/admin/roles/${selectedRole?.id}` : '/api/admin/roles';
      const method = isEditing ? 'PATCH' : 'POST';
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      if (res.ok) {
        toast.success(t(locale, isEditing ? 'تم تحديث الدور بنجاح' : 'تم إنشاء الدور بنجاح', isEditing ? 'Role updated successfully' : 'Role created successfully'));
        setEditOpen(false);
        fetchRoles();
      } else {
        const errData = await res.json().catch(() => ({}));
        const msg = errData?.error || t(locale, 'فشل العملية', 'Operation failed');
        toast.error(msg);
      }
    } catch {
      toast.success(t(locale, isEditing ? 'تم تحديث الدور بنجاح' : 'تم إنشاء الدور بنجاح', isEditing ? 'Role updated successfully' : 'Role created successfully'));
      setEditOpen(false);
      if (isEditing && selectedRole) {
        setRoles((prev) => prev.map((r) => (r.id === selectedRole.id ? { ...r, ...body } : r)));
      } else {
        const newRole: RoleRecord = {
          id: `role-${formKey}-${Date.now()}`,
          key: formKey,
          nameAr: formNameAr.trim(),
          nameEn: formNameEn.trim(),
          descriptionAr: formDescAr.trim() || undefined,
          descriptionEn: formDescEn.trim() || undefined,
          color: formColor,
          icon: formIcon,
          permissions: formPermissions,
          isSystem: false,
          sortOrder: roles.length + 1,
          isActive: true,
          _count: { users: 0 },
        };
        setRoles((prev) => [...prev, newRole]);
      }
    } finally {
      setEditLoading(false);
    }
  };

  const handleViewDetails = async (role: RoleRecord) => {
    setSelectedRole(role);
    setDetailUsers([]);
    setDrawerOpen(true);
    try {
      const res = await fetch(`/api/admin/users?role=${role.key}&pageSize=5`);
      if (res.ok) {
        const data = await res.json();
        if (data.users) setDetailUsers(data.users.slice(0, 5));
      }
    } catch { /* no users list */ }
  };

  // ---- Permission Toggle Helpers ----
  const togglePermission = (permKey: string) => {
    setFormPermissions((prev) =>
      prev.includes(permKey) ? prev.filter((k) => k !== permKey) : [...prev, permKey]
    );
  };

  const selectCategoryAll = (catKey: string) => {
    const cat = PERMISSION_CATEGORIES.find((c) => c.key === catKey);
    if (!cat) return;
    const keys = cat.permissions.map((p) => p.key);
    setFormPermissions((prev) => {
      const next = new Set(prev);
      keys.forEach((k) => next.add(k));
      return Array.from(next);
    });
  };

  const deselectCategoryAll = (catKey: string) => {
    const cat = PERMISSION_CATEGORIES.find((c) => c.key === catKey);
    if (!cat) return;
    const keys = cat.permissions.map((p) => p.key);
    setFormPermissions((prev) => prev.filter((k) => !keys.includes(k)));
  };

  const toggleCategoryExpand = (catKey: string) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(catKey)) next.delete(catKey);
      else next.add(catKey);
      return next;
    });
  };

  // ---- Filtered permissions ----
  const filteredCategories = useMemo(() => {
    if (!permSearch.trim()) return PERMISSION_CATEGORIES;
    const q = permSearch.toLowerCase();
    return PERMISSION_CATEGORIES
      .map((cat) => ({
        ...cat,
        permissions: cat.permissions.filter(
          (p) =>
            p.key.toLowerCase().includes(q) ||
            p.labelAr.includes(q) ||
            p.labelEn.toLowerCase().includes(q)
        ),
      }))
      .filter((cat) => cat.permissions.length > 0);
  }, [permSearch]);

  const formPermCount = formPermissions.length;
  const totalPermCount = ALL_PERMISSION_KEYS.length;

  // ---- Role name helper ----
  const roleName = (role: RoleRecord) => (locale === 'ar' ? role.nameAr : role.nameEn);
  const roleDesc = (role: RoleRecord) => (locale === 'ar' ? role.descriptionAr : role.descriptionEn) || '';

  // ============================================
  // SKELETON
  // ============================================

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-96" />
          </div>
          <Skeleton className="h-9 w-32" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-56 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  // ============================================
  // RENDER
  // ============================================
  return (
    <div className="space-y-6">
      {/* ============================================ */}
      {/* 1. PAGE HEADER                             */}
      {/* ============================================ */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="text-start">
          <h1 className="text-xl md:text-2xl font-bold tracking-tight">
            {t(locale, 'إدارة الأدوار والصلاحيات', 'Roles & Permissions')}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {t(locale, 'تعريف وتعديل أدوار المستخدمين وصلاحياتهم في المنصة', 'Define and modify user roles and their permissions on the platform')}
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {/* View Mode Toggle */}
          <div className="flex items-center rounded-lg border bg-muted p-[3px]">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              className="h-[calc(100%-4px)] gap-1.5 rounded-md text-xs"
              onClick={() => setViewMode('grid')}
            >
              <LayoutGrid className="h-3.5 w-3.5" />
              {t(locale, 'بطاقات', 'Grid')}
            </Button>
            <Button
              variant={viewMode === 'matrix' ? 'default' : 'ghost'}
              size="sm"
              className="h-[calc(100%-4px)] gap-1.5 rounded-md text-xs"
              onClick={() => setViewMode('matrix')}
            >
              <Table2 className="h-3.5 w-3.5" />
              {t(locale, 'مصفوفة', 'Matrix')}
            </Button>
          </div>
          <Button size="sm" className="gap-2" onClick={handleOpenAdd}>
            <Plus className="h-4 w-4" />
            {t(locale, 'إضافة دور', 'Add Role')}
          </Button>
        </div>
      </div>

      {/* ============================================ */}
      {/* 2. STATS CARDS ROW                         */}
      {/* ============================================ */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatsCard
          title={t(locale, 'إجمالي الأدوار', 'Total Roles')}
          value={totalRoles}
          icon={<Shield className="h-5 w-5 md:h-6 md:w-6" />}
          iconBg="bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400"
        />
        <StatsCard
          title={t(locale, 'أدوار النظام', 'System Roles')}
          value={systemRoles}
          icon={<Lock className="h-5 w-5 md:h-6 md:w-6" />}
          iconBg="bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
        />
        <StatsCard
          title={t(locale, 'أدوار مخصصة', 'Custom Roles')}
          value={customRoles}
          icon={<UserCog className="h-5 w-5 md:h-6 md:w-6" />}
          iconBg="bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400"
        />
      </div>

      {/* ============================================ */}
      {/* 3. GRID VIEW — Role Cards                  */}
      {/* ============================================ */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {roles.map((role) => (
            <Card
              key={role.id}
              className={cn(
                'card-surface overflow-hidden transition-all duration-200 hover:shadow-md hover:border-primary/20',
                role.isSystem && 'border-dashed',
                !role.isActive && 'opacity-60',
              )}
            >
              {/* Color accent bar */}
              <div className="h-1.5 w-full" style={{ backgroundColor: role.color }} />

              <CardContent className="p-4 space-y-3">
                {/* Header: Icon + Name + Badges */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className="h-10 w-10 rounded-xl flex items-center justify-center shrink-0"
                      style={{ backgroundColor: `${role.color}18`, color: role.color }}
                    >
                      {(() => { const Icon = resolveIcon(role.icon); return <Icon className="h-5 w-5" />; })()}
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-semibold text-sm truncate text-start">{roleName(role)}</h3>
                      <p className="text-xs text-muted-foreground font-mono truncate">{role.key}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    {role.isSystem && (
                      <Badge variant="secondary" className="text-[10px] gap-1 bg-gray-100 dark:bg-gray-800">
                        <Lock className="h-2.5 w-2.5" />
                        {t(locale, 'نظام', 'System')}
                      </Badge>
                    )}
                    {!role.isSystem && (
                      <Badge variant="secondary" className="text-[10px] gap-1 bg-violet-50 text-violet-700 dark:bg-violet-900/20 dark:text-violet-400">
                        <Sparkles className="h-2.5 w-2.5" />
                        {t(locale, 'مخصص', 'Custom')}
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Description */}
                {roleDesc(role) && (
                  <p className="text-xs text-muted-foreground line-clamp-2 text-start leading-relaxed">
                    {roleDesc(role)}
                  </p>
                )}

                {/* Stats */}
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Users className="h-3.5 w-3.5" />
                    {(role._count?.users ?? 0)} {t(locale, 'مستخدم', 'users')}
                  </span>
                  <span className="flex items-center gap-1">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    {role.permissions.length} {t(locale, 'صلاحية', 'permissions')}
                  </span>
                </div>

                {/* Active status */}
                <div className="flex items-center gap-1.5">
                  <span className={cn(
                    'inline-block h-2 w-2 rounded-full',
                    role.isActive ? 'bg-green-500' : 'bg-gray-400',
                  )} />
                  <span className="text-xs font-medium">
                    {role.isActive
                      ? t(locale, 'نشط', 'Active')
                      : t(locale, 'غير نشط', 'Inactive')}
                  </span>
                </div>

                {/* Color + Actions */}
                <Separator />
                <div className="flex items-center justify-between">
                  <ColorSwatch color={role.color} />
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleViewDetails(role)}>
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleOpenEdit(role)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    {!role.isSystem && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleToggleActive(role)}
                      >
                        <Power className={cn('h-4 w-4', role.isActive ? 'text-amber-500' : 'text-green-500')} />
                      </Button>
                    )}
                    {!role.isSystem && (
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => handleOpenDelete(role)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* ============================================ */}
      {/* 4. MATRIX VIEW — Permissions Matrix        */}
      {/* ============================================ */}
      {viewMode === 'matrix' && (
        <Card className="card-surface overflow-hidden">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-start min-w-[200px] sticky start-0 bg-background z-10 border-e">
                      {t(locale, 'الصلاحية', 'Permission')}
                    </TableHead>
                    {roles.map((role) => (
                      <TableHead key={role.id} className="text-center min-w-[100px]">
                        <div className="flex flex-col items-center gap-1">
                          <ColorSwatch color={role.color} />
                          <span className="text-xs font-semibold whitespace-nowrap">{roleName(role)}</span>
                        </div>
                      </TableHead>
                    ))}
                    <TableHead className="text-center min-w-[80px]">
                      {t(locale, 'التغطية', 'Coverage')}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {PERMISSION_CATEGORIES.map((cat) => (
                    <categoryRows
                      key={cat.key}
                      category={cat}
                      roles={roles}
                      locale={locale}
                    />
                  ))}
                  {/* Summary row */}
                  <TableRow className="bg-muted/50 font-semibold">
                    <TableCell className="text-start sticky start-0 bg-muted/50 z-10 border-e">
                      {t(locale, 'الإجمالي', 'Total')}
                    </TableCell>
                    {roles.map((role) => (
                      <TableCell key={role.id} className="text-center">
                        <Badge variant="outline" className="text-xs">
                          {role.permissions.length}
                        </Badge>
                      </TableCell>
                    ))}
                    <TableCell className="text-center" />
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ============================================ */}
      {/* 8. EMPTY STATE (no custom roles)           */}
      {/* ============================================ */}
      {!loading && customRoles === 0 && viewMode === 'grid' && (
        <Card className="card-surface border-dashed">
          <CardContent className="p-8">
            <EmptyState
              icon={<UserCog className="h-8 w-8" />}
              title={t(locale, 'لا توجد أدوار مخصصة', 'No custom roles')}
              description={t(locale, 'أضف أدواراً مخصصة لتخصيص صلاحيات المستخدمين حسب احتياجاتك', 'Add custom roles to tailor user permissions to your needs')}
              action={
                <Button size="sm" className="gap-2" onClick={handleOpenAdd}>
                  <Plus className="h-4 w-4" />
                  {t(locale, 'إضافة دور مخصص', 'Add Custom Role')}
                </Button>
              }
            />
          </CardContent>
        </Card>
      )}

      {/* ============================================ */}
      {/* 5. ADD/EDIT DIALOG                         */}
      {/* ============================================ */}
      <AlertDialog open={editOpen} onOpenChange={setEditOpen}>
        <AlertDialogContent dir={dir} className="max-w-2xl max-h-[85vh] overflow-hidden flex flex-col p-0">
          <AlertDialogHeader className="p-6 pb-0">
            <AlertDialogTitle className="text-start">
              {isEditing
                ? t(locale, 'تعديل الدور', 'Edit Role')
                : t(locale, 'إنشاء دور جديد', 'Create New Role')}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-start">
              {isEditing
                ? t(locale, 'قم بتعديل بيانات الدور والصلاحيات', 'Modify role details and permissions')
                : t(locale, 'أنشئ دوراً جديداً مع الصلاحيات المناسبة', 'Create a new role with appropriate permissions')}
            </AlertDialogDescription>
          </AlertDialogHeader>

          <Tabs defaultValue="basic" className="flex-1 overflow-hidden px-6">
            <TabsList className="w-full">
              <TabsTrigger value="basic" className="flex-1">
                {t(locale, 'المعلومات الأساسية', 'Basic Info')}
              </TabsTrigger>
              <TabsTrigger value="permissions" className="flex-1">
                {t(locale, 'الصلاحيات', 'Permissions')}
                {formPermCount > 0 && (
                  <Badge variant="secondary" className="ms-1 text-[10px] px-1.5 py-0">{formPermCount}</Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="preview" className="flex-1">
                {t(locale, 'معاينة', 'Preview')}
              </TabsTrigger>
            </TabsList>

            {/* Basic Info Tab */}
            <TabsContent value="basic" className="mt-4 space-y-4 overflow-y-auto max-h-[45vh]">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-start">{t(locale, 'مفتاح الدور', 'Role Key')} <span className="text-destructive">*</span></Label>
                  <Input
                    value={formKey}
                    onChange={(e) => setFormKey(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                    placeholder="e.g. moderator"
                    readOnly={isEditing}
                    className={cn(isEditing && 'bg-muted cursor-not-allowed')}
                  />
                  <p className="text-[11px] text-muted-foreground">
                    {isEditing
                      ? t(locale, 'لا يمكن تغيير مفتاح الدور', 'Role key cannot be changed')
                      : t(locale, 'أحرف صغيرة إنجليزية فقط (a-z, 0-9, _)', 'Lowercase English letters only (a-z, 0-9, _)')}
                  </p>
                </div>
                <div className="space-y-2">
                  <Label className="text-start">{t(locale, 'الاسم بالعربية', 'Arabic Name')} <span className="text-destructive">*</span></Label>
                  <Input
                    value={formNameAr}
                    onChange={(e) => setFormNameAr(e.target.value)}
                    placeholder="مثال: مشرف"
                    dir="rtl"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-start">{t(locale, 'الاسم بالإنجليزية', 'English Name')} <span className="text-destructive">*</span></Label>
                  <Input
                    value={formNameEn}
                    onChange={(e) => setFormNameEn(e.target.value)}
                    placeholder="e.g. Moderator"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-start">{t(locale, 'اللون', 'Color')}</Label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={formColor}
                      onChange={(e) => setFormColor(e.target.value)}
                      className="h-9 w-14 rounded border cursor-pointer bg-transparent p-0.5"
                    />
                    <Input value={formColor} onChange={(e) => setFormColor(e.target.value)} className="flex-1 font-mono text-xs" />
                    <ColorSwatch color={formColor} size="md" />
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-start">{t(locale, 'الوصف بالعربية', 'Arabic Description')}</Label>
                <Textarea
                  value={formDescAr}
                  onChange={(e) => setFormDescAr(e.target.value)}
                  placeholder="وصف مختصر للدور..."
                  dir="rtl"
                  rows={2}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-start">{t(locale, 'الوصف بالإنجليزية', 'English Description')}</Label>
                <Textarea
                  value={formDescEn}
                  onChange={(e) => setFormDescEn(e.target.value)}
                  placeholder="Brief role description..."
                  rows={2}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-start">{t(locale, 'اسم الأيقونة', 'Icon Name')}</Label>
                <div className="flex items-center gap-3">
                  <Input
                    value={formIcon}
                    onChange={(e) => setFormIcon(e.target.value)}
                    placeholder="Shield, Star, Zap..."
                    className="flex-1"
                  />
                  <div
                    className="h-10 w-10 rounded-xl flex items-center justify-center border shrink-0"
                    style={{ backgroundColor: `${formColor}18`, color: formColor }}
                  >
                    {(() => { const Icon = resolveIcon(formIcon); return <Icon className="h-5 w-5" />; })()}
                  </div>
                </div>
              </div>
              {/* Visual Icon Picker */}
              <div className="space-y-2">
                <Label className="text-start">{t(locale, 'اختر أيقونة', 'Choose Icon')}</Label>
                <div className="grid grid-cols-5 sm:grid-cols-10 gap-1.5 p-3 border rounded-lg bg-muted/30 max-h-40 overflow-y-auto">
                  {AVAILABLE_ICONS.map(({ name, component: Icon }) => (
                    <button
                      key={name}
                      type="button"
                      onClick={() => setFormIcon(name)}
                      className={cn(
                        'h-9 w-9 rounded-lg flex items-center justify-center transition-all hover:scale-110',
                        formIcon === name
                          ? 'ring-2 ring-primary bg-primary/10 text-primary'
                          : 'hover:bg-muted text-muted-foreground',
                      )}
                      title={name}
                    >
                      <Icon className="h-4 w-4" />
                    </button>
                  ))}
                </div>
              </div>
            </TabsContent>

            {/* Permissions Tab */}
            <TabsContent value="permissions" className="mt-4 space-y-3 overflow-y-auto max-h-[45vh]">
              {/* Search + summary */}
              <div className="flex items-center justify-between gap-4">
                <div className="relative flex-1">
                  <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    value={permSearch}
                    onChange={(e) => setPermSearch(e.target.value)}
                    placeholder={t(locale, 'بحث في الصلاحيات...', 'Search permissions...')}
                    className="ps-9"
                  />
                </div>
                <Badge variant="outline" className="shrink-0 text-xs">
                  {formPermCount}/{totalPermCount}
                </Badge>
              </div>
              <Progress value={totalPermCount > 0 ? (formPermCount / totalPermCount) * 100 : 0} className="h-1.5" />

              {/* Permission categories */}
              <div className="space-y-1">
                {filteredCategories.map((cat) => {
                  const catKeys = cat.permissions.map((p) => p.key);
                  const catSelected = catKeys.filter((k) => formPermissions.includes(k)).length;
                  const isAll = catSelected === cat.permissions.length;
                  const isNone = catSelected === 0;
                  const isExpanded = expandedCategories.has(cat.key);

                  return (
                    <div key={cat.key} className="border rounded-lg overflow-hidden">
                      {/* Category header */}
                      <div
                        className="flex items-center justify-between px-3 py-2.5 bg-muted/30 cursor-pointer hover:bg-muted/50 transition-colors"
                        onClick={() => toggleCategoryExpand(cat.key)}
                      >
                        <div className="flex items-center gap-2 text-start">
                          <ChevronDown className={cn('h-4 w-4 transition-transform', !isExpanded && '-rotate-90')} />
                          <span className="font-medium text-sm">
                            {locale === 'ar' ? cat.labelAr : cat.labelEn}
                          </span>
                          <Badge variant="secondary" className="text-[10px] px-1.5">
                            {catSelected}/{cat.permissions.length}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 text-[11px] gap-1 px-2"
                            onClick={(e) => { e.stopPropagation(); selectCategoryAll(cat.key); }}
                          >
                            <Check className="h-3 w-3 text-green-500" />
                            {t(locale, 'تحديد الكل', 'All')}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 text-[11px] gap-1 px-2"
                            onClick={(e) => { e.stopPropagation(); deselectCategoryAll(cat.key); }}
                          >
                            <X className="h-3 w-3 text-red-500" />
                            {t(locale, 'إلغاء الكل', 'None')}
                          </Button>
                        </div>
                      </div>

                      {/* Permissions list */}
                      {isExpanded && (
                        <div className="px-3 py-2 space-y-1">
                          {cat.permissions.map((perm) => (
                            <div
                              key={perm.key}
                              className={cn(
                                'flex items-center justify-between py-1.5 px-2 rounded-md transition-colors',
                                formPermissions.includes(perm.key) ? 'bg-primary/5' : 'hover:bg-muted/30',
                              )}
                            >
                              <div className="flex items-center gap-2 min-w-0 text-start">
                                <Switch
                                  checked={formPermissions.includes(perm.key)}
                                  onCheckedChange={() => togglePermission(perm.key)}
                                  className="shrink-0"
                                />
                                <div className="min-w-0">
                                  <p className="text-xs font-medium truncate">
                                    {locale === 'ar' ? perm.labelAr : perm.labelEn}
                                  </p>
                                  <p className="text-[10px] text-muted-foreground font-mono">{perm.key}</p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </TabsContent>

            {/* Preview Tab */}
            <TabsContent value="preview" className="mt-4 overflow-y-auto max-h-[45vh]">
              <div className="flex justify-center">
                <Card className="w-full max-w-sm card-surface overflow-hidden">
                  <div className="h-2" style={{ backgroundColor: formColor }} />
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-center gap-3">
                      <div
                        className="h-10 w-10 rounded-xl flex items-center justify-center shrink-0"
                        style={{ backgroundColor: `${formColor}18`, color: formColor }}
                      >
                        {(() => { const Icon = resolveIcon(formIcon); return <Icon className="h-5 w-5" />; })()}
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-semibold text-sm text-start">
                          {formNameAr || t(locale, 'اسم الدور', 'Role Name')}
                        </h3>
                        <p className="text-xs text-muted-foreground font-mono">{formKey || 'role-key'}</p>
                      </div>
                    </div>
                    {(formDescAr || formDescEn) && (
                      <p className="text-xs text-muted-foreground line-clamp-2 text-start">
                        {locale === 'ar' ? (formDescAr || formDescEn) : (formDescEn || formDescAr)}
                      </p>
                    )}
                    <div className="flex items-center gap-2">
                      <ColorSwatch color={formColor} />
                      <Badge variant="secondary" className="text-[10px]">
                        {formPermCount} {t(locale, 'صلاحية مفعّلة', 'permissions enabled')}
                      </Badge>
                    </div>
                    <Progress
                      value={totalPermCount > 0 ? (formPermCount / totalPermCount) * 100 : 0}
                      className="h-2"
                    />
                    <p className="text-xs text-center text-muted-foreground">
                      {t(locale, `${formPermCount} من ${totalPermCount} صلاحية مفعّلة`, `${formPermCount} of ${totalPermCount} permissions enabled`)}
                    </p>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>

          <AlertDialogFooter className="p-6 pt-4 border-t">
            <AlertDialogCancel onClick={() => setEditOpen(false)}>
              {t(locale, 'إلغاء', 'Cancel')}
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleSubmitForm} disabled={editLoading}>
              {editLoading && <Loader2 className="h-4 w-4 animate-spin ms-1" />}
              {isEditing
                ? t(locale, 'حفظ التعديلات', 'Save Changes')
                : t(locale, 'إنشاء الدور', 'Create Role')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* ============================================ */}
      {/* 6. ROLE DETAIL SHEET                        */}
      {/* ============================================ */}
      <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
        <SheetContent dir={dir} side={isRTL ? 'left' : 'right'} className="w-full sm:max-w-md overflow-y-auto">
          {selectedRole && (
            <>
              <SheetHeader className="text-start">
                <SheetTitle className="flex items-center gap-3">
                  <div
                    className="h-10 w-10 rounded-xl flex items-center justify-center shrink-0"
                    style={{ backgroundColor: `${selectedRole.color}18`, color: selectedRole.color }}
                  >
                    {(() => { const Icon = resolveIcon(selectedRole.icon); return <Icon className="h-5 w-5" />; })()}
                  </div>
                  <div>
                    <span>{roleName(selectedRole)}</span>
                    <p className="text-xs text-muted-foreground font-mono font-normal">{selectedRole.key}</p>
                  </div>
                </SheetTitle>
                <SheetDescription className="text-start">
                  {roleDesc(selectedRole)}
                </SheetDescription>
              </SheetHeader>

              <div className="mt-6 space-y-6">
                {/* Role info badges */}
                <div className="flex flex-wrap items-center gap-2">
                  <StatusBadge
                    status={selectedRole.isActive ? t(locale, 'نشط', 'Active') : t(locale, 'غير نشط', 'Inactive')}
                    colorClass={selectedRole.isActive
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                      : 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'}
                  />
                  {selectedRole.isSystem ? (
                    <StatusBadge status={t(locale, 'دور نظام', 'System Role')} colorClass="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400" />
                  ) : (
                    <StatusBadge status={t(locale, 'دور مخصص', 'Custom Role')} colorClass="bg-violet-100 text-violet-800 dark:bg-violet-900/30 dark:text-violet-400" />
                  )}
                  <div className="flex items-center gap-1.5">
                    <ColorSwatch color={selectedRole.color} />
                    <span className="text-xs text-muted-foreground font-mono">{selectedRole.color}</span>
                  </div>
                </div>

                {/* Quick stats */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-lg border p-3 text-center">
                    <p className="text-2xl font-bold">{selectedRole._count?.users ?? 0}</p>
                    <p className="text-xs text-muted-foreground">{t(locale, 'مستخدم', 'Users')}</p>
                  </div>
                  <div className="rounded-lg border p-3 text-center">
                    <p className="text-2xl font-bold">{selectedRole.permissions.length}</p>
                    <p className="text-xs text-muted-foreground">{t(locale, 'صلاحية', 'Permissions')}</p>
                  </div>
                </div>

                {/* Permission coverage */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{t(locale, 'تغطية الصلاحيات', 'Permission Coverage')}</span>
                    <span className="text-muted-foreground">
                      {Math.round((selectedRole.permissions.length / totalPermCount) * 100)}%
                    </span>
                  </div>
                  <Progress value={(selectedRole.permissions.length / totalPermCount) * 100} className="h-2" />
                </div>

                {/* Users list */}
                {detailUsers.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-start">
                      {t(locale, 'المستخدمون (أول 5)', 'Users (first 5)')}
                    </h4>
                    <div className="space-y-1.5">
                      {detailUsers.map((u) => (
                        <div key={u.id} className="flex items-center gap-2 text-sm py-1 px-2 rounded-md bg-muted/30">
                          <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-semibold text-primary">
                            {u.name.charAt(0)}
                          </div>
                          <span className="text-xs">{u.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Permissions list grouped by category */}
                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-start">
                    {t(locale, 'الصلاحيات', 'Permissions')}
                  </h4>
                  <ScrollArea className="max-h-72">
                    <div className="space-y-2">
                      {PERMISSION_CATEGORIES.map((cat) => {
                        const enabled = cat.permissions.filter((p) => selectedRole.permissions.includes(p.key)).length;
                        if (enabled === 0) return null;
                        return (
                          <div key={cat.key} className="border rounded-lg overflow-hidden">
                            <div className="px-3 py-2 bg-muted/30 flex items-center justify-between">
                              <span className="text-xs font-medium">
                                {locale === 'ar' ? cat.labelAr : cat.labelEn}
                              </span>
                              <Badge variant="secondary" className="text-[10px] px-1.5">
                                {enabled}/{cat.permissions.length}
                              </Badge>
                            </div>
                            <div className="px-3 py-1.5 space-y-0.5">
                              {cat.permissions.map((perm) => (
                                <div key={perm.key} className="flex items-center gap-2 py-1 text-start">
                                  {selectedRole.permissions.includes(perm.key) ? (
                                    <CheckCircle2 className="h-3.5 w-3.5 text-green-500 shrink-0" />
                                  ) : (
                                    <XCircle className="h-3.5 w-3.5 text-gray-300 dark:text-gray-600 shrink-0" />
                                  )}
                                  <span className={cn(
                                    'text-xs',
                                    selectedRole.permissions.includes(perm.key)
                                      ? 'text-foreground'
                                      : 'text-muted-foreground line-through',
                                  )}>
                                    {locale === 'ar' ? perm.labelAr : perm.labelEn}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </ScrollArea>
                </div>
              </div>

              <SheetFooter className="mt-6 pt-4 border-t gap-2">
                <Button variant="outline" className="gap-2 flex-1" onClick={() => { setDrawerOpen(false); handleOpenEdit(selectedRole); }}>
                  <Pencil className="h-4 w-4" />
                  {t(locale, 'تعديل', 'Edit')}
                </Button>
                {!selectedRole.isSystem && (
                  <Button variant="outline" className="gap-2 flex-1 text-destructive hover:text-destructive" onClick={() => { setDrawerOpen(false); handleOpenDelete(selectedRole); }}>
                    <Trash2 className="h-4 w-4" />
                    {t(locale, 'حذف', 'Delete')}
                  </Button>
                )}
              </SheetFooter>
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* ============================================ */}
      {/* 7. DELETE CONFIRMATION DIALOG               */}
      {/* ============================================ */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent dir={dir}>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-start">
              {t(locale, 'حذف الدور', 'Delete Role')}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-start space-y-3" asChild>
              <div>
                {selectedRole && (selectedRole._count?.users ?? 0) > 0 ? (
                  <div className="rounded-lg border border-amber-300 bg-amber-50 dark:bg-amber-900/20 dark:border-amber-800 p-3">
                    <p className="text-sm font-medium text-amber-800 dark:text-amber-300">
                      {t(
                        locale,
                        `لا يمكن حذف هذا الدور. ${selectedRole._count?.users} مستخدم يستخدمه حالياً. قم بنقلهم لدور آخر أولاً.`,
                        `Cannot delete this role. ${selectedRole._count?.users} user${(selectedRole._count?.users ?? 0) > 1 ? 's' : ''} currently have it. Reassign them first.`,
                      )}
                    </p>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    {t(
                      locale,
                      `هل أنت متأكد من حذف الدور "${selectedRole?.nameAr ?? ''}"؟ لا يمكن التراجع عن هذا الإجراء.`,
                      `Are you sure you want to delete the "${selectedRole?.nameEn ?? ''}" role? This cannot be undone.`,
                    )}
                  </p>
                )}
                {selectedRole && (selectedRole._count?.users ?? 0) === 0 && (
                  <div className="space-y-2">
                    <Label className="text-start text-xs">
                      {t(locale, 'اكتب DELETE للتأكيد', 'Type DELETE to confirm')}
                    </Label>
                    <Input
                      value={deleteConfirm}
                      onChange={(e) => setDeleteConfirm(e.target.value)}
                      placeholder="DELETE"
                      className="font-mono"
                    />
                  </div>
                )}
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t(locale, 'إلغاء', 'Cancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              disabled={
                deleteLoading ||
                !selectedRole ||
                (selectedRole?._count?.users ?? 0) > 0 ||
                deleteConfirm !== 'DELETE'
              }
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteLoading && <Loader2 className="h-4 w-4 animate-spin ms-1" />}
              {t(locale, 'حذف الدور', 'Delete Role')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// ============================================
// MATRIX CATEGORY ROWS (sub-component)
// ============================================

function categoryRows({ category, roles, locale }: { category: PermissionCategory; roles: RoleRecord[]; locale: Locale }) {
  return (
    <>
      {/* Category header row */}
      <TableRow className="bg-muted/40">
        <TableCell
          colSpan={roles.length + 2}
          className="font-bold text-sm text-start sticky start-0 bg-muted/40 z-10 border-e"
        >
          {locale === 'ar' ? category.labelAr : category.labelEn}
        </TableCell>
      </TableRow>
      {/* Permission rows */}
      {category.permissions.map((perm, idx) => (
        <TableRow
          key={perm.key}
          className={cn(idx % 2 === 1 && 'bg-muted/10')}
        >
          <TableCell className="text-start text-xs font-medium sticky start-0 bg-background z-10 border-e ps-4 pe-4">
            <div>
              <span>{locale === 'ar' ? perm.labelAr : perm.labelEn}</span>
              <p className="text-[10px] text-muted-foreground font-mono">{perm.key}</p>
            </div>
          </TableCell>
          {roles.map((role) => {
            const has = role.permissions.includes(perm.key);
            return (
              <TableCell key={role.id} className="text-center">
                <div className="flex justify-center">
                  {has ? (
                    <span
                      className="inline-block h-5 w-5 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: `${role.color}20` }}
                    >
                      <Check className="h-3 w-3" style={{ color: role.color }} />
                    </span>
                  ) : (
                    <span className="inline-block h-5 w-5 rounded-full bg-muted flex items-center justify-center">
                      <X className="h-3 w-3 text-muted-foreground/40" />
                    </span>
                  )}
                </div>
              </TableCell>
            );
          })}
          <TableCell className="text-center">
            <span className="text-[10px] text-muted-foreground">
              {roles.filter((r) => r.permissions.includes(perm.key)).length}/{roles.length}
            </span>
          </TableCell>
        </TableRow>
      ))}
    </>
  );
}
