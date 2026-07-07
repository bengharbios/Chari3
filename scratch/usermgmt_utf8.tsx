'use client';
import { useTranslation } from '@/lib/i18n/useTranslation';
import { useState, useEffect, useCallback, useMemo } from 'react';

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
  Store as StoreIcon,
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
                              ? t(locale, '┘à┘ê╪½┘æ┘é', 'Verified')
                              : t(locale, '╪║┘è╪▒ ┘à┘ê╪½┘æ┘é', 'Unverified')}
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
                                {t(locale, '╪º┘ä╪Ñ╪¼╪▒╪º╪í╪º╪¬', 'Actions')}
                              </span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align={isRTL ? 'start' : 'end'} className="w-48">
                            <DropdownMenuLabel>
                              {t(locale, '╪Ñ╪¼╪▒╪º╪í╪º╪¬', 'Actions')}
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleViewDetails(user)} className="gap-2 cursor-pointer">
                              <Eye className="h-4 w-4" />
import { useTranslation } from '@/lib/i18n/useTranslation';
import { useState, useEffect, useCallback, useMemo } from 'react';

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
  Store as StoreIcon,
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
  // ... rest of implementation (omitted for brevity)
}

// ============================================
// COMPONENT
// ============================================

export default function UsersTable({ locale = 'ar' }: { locale?: Locale }) {
  const { t } = useTranslation();
  const dir = locale === 'ar' ? 'rtl' : 'ltr';
  const isRTL = dir === 'rtl';

  // State
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<UserRecord | null>(null);
  
  // Dialogs
  const [editRoleOpen, setEditRoleOpen] = useState(false);
  const [suspendOpen, setSuspendOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [overrideOpen, setOverrideOpen] = useState(false);
  
  // Form states
  const [editRoleNew, setEditRoleNew] = useState<UserRole>('user');
  const [suspendReason, setSuspendReason] = useState('');
  const [suspendDuration, setSuspendDuration] = useState<'temporary' | 'permanent'>('temporary');
  const [deleteConfirm, setDeleteConfirm] = useState('');
  
  // Overrides states
  const [packages, setPackages] = useState<any[]>([]);
  const [isSavingOverride, setIsSavingOverride] = useState(false);
  const [overrideLevel, setOverrideLevel] = useState(1);
  const [overrideRating, setOverrideRating] = useState('5.0');
  const [overridePackageId, setOverridePackageId] = useState('none');
  const [addonMobileApp, setAddonMobileApp] = useState(false);
  const [addonWhatsAppSupport, setAddonWhatsAppSupport] = useState(false);
  const [addonAdvancedCRM, setAddonAdvancedCRM] = useState(false);
  const [addonEchangoPOS, setAddonEchangoPOS] = useState(false);
  const [addonExtraPOSDevices, setAddonExtraPOSDevices] = useState(0);

  // Upgrade requests state
  const [approveUpgradeOpen, setApproveUpgradeOpen] = useState(false);
  const [rejectUpgradeOpen, setRejectUpgradeOpen] = useState(false);
  const [upgradePackageId, setUpgradePackageId] = useState<string>('');
  const [isProcessingUpgrade, setIsProcessingUpgrade] = useState(false);

  const handleOpenDelete = (user: UserRecord) => {
    setSelectedUser(user);
    setDeleteConfirm('');
    setDeleteOpen(true);
  };

  const handleApproveUpgrade = async () => {
    if (!selectedUser) return;
    setIsProcessingUpgrade(true);
    try {
      const res = await fetch('/api/admin/upgrade-requests/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: selectedUser.id, packageId: upgradePackageId || null }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(t(locale, '╪¬┘à╪¬ ╪º┘ä┘à┘ê╪º┘ü┘é╪⌐ ╪╣┘ä┘ë ╪º┘ä╪¬╪▒┘é┘è╪⌐ ┘ê╪¬┘à ╪Ñ┘å╪┤╪º╪í ╪º┘ä┘à╪¬╪¼╪▒!', 'Upgrade approved and store created!'));
        setApproveUpgradeOpen(false);
        fetchUsers();
      } else {
        toast.error(data.error || t(locale, '┘ü╪┤┘ä ┘ü┘è ╪º┘ä┘à┘ê╪º┘ü┘é╪⌐ ╪╣┘ä┘ë ╪º┘ä╪¬╪▒┘é┘è╪⌐', 'Failed to approve upgrade'));
      }
    } catch {
      toast.error(t(locale, '╪¡╪»╪½ ╪«╪╖╪ú ┘ü┘è ╪º┘ä╪º╪¬╪╡╪º┘ä', 'Connection error occurred'));
    } finally {
      setIsProcessingUpgrade(false);
    }
  };

  const handleRejectUpgrade = async () => {
    if (!selectedUser) return;
    setIsProcessingUpgrade(true);
    try {
      const res = await fetch('/api/admin/upgrade-requests/reject', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: selectedUser.id }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(t(locale, '╪¬┘à ╪▒┘ü╪╢ ╪╖┘ä╪¿ ╪º┘ä╪¬╪▒┘é┘è╪⌐', 'Upgrade request rejected'));
        setRejectUpgradeOpen(false);
        fetchUsers();
      } else {
        toast.error(data.error || t(locale, '┘ü╪┤┘ä ┘ü┘è ╪▒┘ü╪╢ ╪º┘ä╪╖┘ä╪¿', 'Failed to reject request'));
      }
    } catch {
      toast.error(t(locale, '╪¡╪»╪½ ╪«╪╖╪ú ┘ü┘è ╪º┘ä╪º╪¬╪╡╪º┘ä', 'Connection error occurred'));
    } finally {
      setIsProcessingUpgrade(false);
    }
  };

  // ... (Table rendering code continues)

  /* Inside TableRow mapping for users: */
  /*
    <DropdownMenuItem onClick={() => handleViewDetails(user)} ... />
    <DropdownMenuItem onClick={() => handleOpenEditRole(user)} ... />
    <DropdownMenuSeparator />
    {user.sellerProfile?.wantsUpgrade && (
      <>
        <DropdownMenuItem onClick={() => { setSelectedUser(user); setUpgradePackageId(''); setApproveUpgradeOpen(true); }} className="gap-2 cursor-pointer text-brand font-bold bg-brand/5">
          <StoreIcon className="h-4 w-4" />
          {t(locale, '╪º┘ä┘à┘ê╪º┘ü┘é╪⌐ ╪╣┘ä┘ë ╪¬╪▒┘é┘è╪⌐ ╪º┘ä┘à╪¬╪¼╪▒', 'Approve Store Upgrade')}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => { setSelectedUser(user); setRejectUpgradeOpen(true); }} className="gap-2 cursor-pointer text-destructive bg-destructive/5 mb-2">
          <XCircle className="h-4 w-4" />
          {t(locale, '╪▒┘ü╪╢ ╪º┘ä╪¬╪▒┘é┘è╪⌐', 'Reject Upgrade')}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
      </>
    )}
  */

  // ... (Remainder of the component with all Dialogs)

  return (
    <div className="w-full">
      {/* Existing content... */}

      {/* ============================================ */}
      {/* 12. UPGRADE APPROVE / REJECT DIALOGS       */}
      {/* ============================================ */}
      <AlertDialog open={approveUpgradeOpen} onOpenChange={setApproveUpgradeOpen}>
        <AlertDialogContent dir={dir}>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-brand font-bold">
              <StoreIcon className="h-5 w-5" />
              {t(locale, '╪º┘ä┘à┘ê╪º┘ü┘é╪⌐ ╪╣┘ä┘ë ╪¬╪▒┘é┘è╪⌐ ╪º┘ä╪¬╪º╪¼╪▒ ┘ä┘à╪»┘è╪▒ ┘à╪¬╪¼╪▒', 'Approve Upgrade to Store Manager')}
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-4 text-start mt-4">
                <p>
                  {t(
                    locale,
                    `╪ú┘å╪¬ ╪╣┘ä┘ë ┘ê╪┤┘â ╪º┘ä┘à┘ê╪º┘ü┘é╪⌐ ╪╣┘ä┘ë ╪╖┘ä╪¿ ╪¬╪▒┘é┘è╪⌐ ╪º┘ä╪¬╪º╪¼╪▒ (${selectedUser ? getDisplayName(selectedUser) : ''}). ╪│┘è╪¬┘à ╪Ñ┘å╪┤╪º╪í ┘à╪¬╪¼╪▒ ╪¼╪»┘è╪» ╪¿╪º╪│┘à┘ç ┘ê╪¬╪¡┘ê┘è┘ä ╪¡╪│╪º╪¿┘ç ┘ä┘à╪»┘è╪▒ ┘à╪¬╪¼╪▒.`,
                    `You are about to approve the upgrade request for (${selectedUser ? getDisplayName(selectedUser) : ''}). A new store will be created and their role changed to Store Manager.`
                  )}
                </p>
                
                <div className="space-y-2 mt-4 p-4 border rounded-xl bg-muted/20">
                  <Label className="font-bold text-foreground">
                    {t(locale, '╪º╪«╪¬╪▒ ╪¿╪º┘é╪⌐ ╪º┘ä╪º╪┤╪¬╪▒╪º┘â ┘ä┘ä┘à╪¬╪¼╪▒ ╪º┘ä╪¼╪»┘è╪»:', 'Select Subscription Package for the new store:')}
                  </Label>
                  <Select
                    value={upgradePackageId}
                    onValueChange={(val) => setUpgradePackageId(val)}
                  >
                    <SelectTrigger className="w-full bg-background">
                      <SelectValue placeholder={t(locale, '╪¿╪º┘é╪⌐ ┘à╪¼╪º┘å┘è╪⌐ ╪º┘ü╪¬╪▒╪º╪╢┘è╪⌐ (╪¿╪»┘ê┘å ╪¿╪º┘é╪⌐)', 'Default Free Package (No Package)')} />
                    </SelectTrigger>
                    <SelectContent dir={dir}>
                      <SelectItem value="none" className="font-bold">
                        {t(locale, '╪¿╪º┘é╪⌐ ┘à╪¼╪º┘å┘è╪⌐ (┘è╪«╪¬╪º╪▒ ╪º┘ä╪¬╪º╪¼╪▒ ┘ä╪º╪¡┘é╪º┘ï)', 'Free Package (User chooses later)')}
                      </SelectItem>
                      {packages.map((pkg) => (
                        <SelectItem key={pkg.id} value={pkg.id}>
                          {locale === 'ar' ? pkg.name : (pkg.nameEn || pkg.name)} ({pkg.price} DZD)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground mt-1">
                    {t(
                      locale,
                      '╪Ñ╪░╪º ╪º╪«╪¬╪▒╪¬ "╪¿╪º┘é╪⌐ ┘à╪¼╪º┘å┘è╪⌐"╪î ╪│┘è╪¬┘à┘â┘å ╪º┘ä╪¬╪º╪¼╪▒ ┘à┘å ╪¬╪▒┘é┘è╪⌐ ╪º┘ä╪¿╪º┘é╪⌐ ╪¿┘å┘ü╪│┘ç ┘ê╪º┘ä╪»┘ü╪╣ ┘ä╪º╪¡┘é╪º┘ï ┘à┘å ┘ä┘ê╪¡╪⌐ ╪¬╪¡┘â┘à┘ç.',
                      'If you select "Free Package", the user can upgrade and pay later from their dashboard.'
                    )}
                  </p>
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-6 flex gap-2">
            <AlertDialogCancel disabled={isProcessingUpgrade}>
              {t(locale, '╪Ñ┘ä╪║╪º╪í', 'Cancel')}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => { e.preventDefault(); handleApproveUpgrade(); }}
              disabled={isProcessingUpgrade}
              className="bg-brand text-brand-foreground hover:bg-brand/90"
            >
              {isProcessingUpgrade && <Loader2 className="h-4 w-4 animate-spin me-2" />}
              {t(locale, '╪¬╪ú┘â┘è╪» ╪º┘ä┘à┘ê╪º┘ü┘é╪⌐ ┘ê╪Ñ┘å╪┤╪º╪í ╪º┘ä┘à╪¬╪¼╪▒', 'Confirm & Create Store')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={rejectUpgradeOpen} onOpenChange={setRejectUpgradeOpen}>
        <AlertDialogContent dir={dir}>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-destructive">
              {t(locale, '╪▒┘ü╪╢ ╪╖┘ä╪¿ ╪º┘ä╪¬╪▒┘é┘è╪⌐', 'Reject Upgrade Request')}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t(
                locale,
                `┘ç┘ä ╪ú┘å╪¬ ┘à╪¬╪ú┘â╪» ┘à┘å ╪▒┘ü╪╢ ╪╖┘ä╪¿ ╪º┘ä╪¬╪▒┘é┘è╪⌐ ┘ä┘ä┘à╪│╪¬╪«╪»┘à (${selectedUser ? getDisplayName(selectedUser) : ''})╪ƒ ╪│┘è╪╕┘ä ╪¡╪│╪º╪¿┘ç ┘â╪¬╪º╪¼╪▒ ┘à╪│╪¬┘é┘ä.`,
                `Are you sure you want to reject the upgrade request for (${selectedUser ? getDisplayName(selectedUser) : ''})? Their account will remain as a regular Seller.`
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isProcessingUpgrade}>
              {t(locale, '╪Ñ┘ä╪║╪º╪í', 'Cancel')}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => { e.preventDefault(); handleRejectUpgrade(); }}
              disabled={isProcessingUpgrade}
              className="bg-destructive hover:bg-destructive/90"
            >
              {isProcessingUpgrade && <Loader2 className="h-4 w-4 animate-spin me-2" />}
              {t(locale, '╪¬╪ú┘â┘è╪» ╪º┘ä╪▒┘ü╪╢', 'Confirm Rejection')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
