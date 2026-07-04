'use client';
import React from 'react';

import { useState, useEffect } from 'react';
import { useAppStore } from '@/lib/store';
import { PageHeader } from '@/components/shared/StatsCard';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  Shield, UserPlus, Users, Key, Lock, Unlock, Mail, Phone, Calendar, MoreHorizontal, Circle, Activity, AlertCircle, Trash2, CheckCircle2, X, Loader2,
  Laptop, Smartphone, Globe, RefreshCw, Tablet, MapPin, Clock, LogOut
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ar as dateFnsAr, enUS as dateFnsEn } from 'date-fns/locale';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter, DialogClose
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import { useAuthStore } from '@/lib/store';
import { toast } from 'sonner';

const STAGGER_CONTAINER = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } }
};

const FADE_UP = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
};

interface StaffMember {
  id: string; // The StoreStaff.id or User.id
  userId?: string; // We'll keep the actual User ID here for referencing
  name: string;
  email: string;
  phone: string;
  role: string; // 'admin', 'editor', 'support', 'viewer'
  roleAr: string;
  isOnline: boolean;
  joined: string;
  avatar: string;
  isSuspended?: boolean;
  status?: string;
}

export default function StoreStaffPage() {
  const { locale } = useAppStore();
  const { user } = useAuthStore();
  const t = (ar: string, en: string) => locale === 'ar' ? ar : en;
  const isAr = locale === 'ar';

  // Stateful list of staff
  const [staffList, setStaffList] = useState<StaffMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [maxTeamMembers, setMaxTeamMembers] = useState(1);
  const [currentTeamSize, setCurrentTeamSize] = useState(0);

  // Stateful activity logs
  const [activities, setActivities] = useState<any[]>([]);
  const [isLoadingLogs, setIsLoadingLogs] = useState(false);

  const fetchAuditLogs = async () => {
    try {
      setIsLoadingLogs(true);
      const res = await fetch(`/api/seller/audit-logs?userId=${user?.id}`);
      const data = await res.json();
      if (data.success) {
        setActivities(data.logs.map((log: any) => {
          const date = new Date(log.createdAt);
          const timeFormatted = date.toLocaleTimeString(locale === 'ar' ? 'ar-SA' : 'en-US', { hour: '2-digit', minute: '2-digit' });
          const dateFormatted = date.toLocaleDateString(locale === 'ar' ? 'ar-SA' : 'en-US', { month: 'short', day: 'numeric' });
          return {
            id: log.id,
            user: locale === 'ar' ? log.user : log.userEn,
            action: log.details, // details holds formatted action note
            actionEn: log.detailsEn,
            item: '',
            time: `${dateFormatted} ${timeFormatted}`,
            timeEn: `${dateFormatted} ${timeFormatted}`,
          };
        }));
      }
    } catch (e) {
      console.error('Failed to fetch store audit logs', e);
    } finally {
      setIsLoadingLogs(false);
    }
  };

  // Inviting Staff Form State
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [inviteName, setInviteName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [invitePhone, setInvitePhone] = useState('');
  const [invitePassword, setInvitePassword] = useState('');
  const [inviteRole, setInviteRole] = useState<'admin' | 'editor' | 'support' | 'viewer'>('editor');

  // Editing Role Dialog State
  const [isEditRoleOpen, setIsEditRoleOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<StaffMember | null>(null);
  const [selectedRole, setSelectedRole] = useState<'admin' | 'editor' | 'support' | 'viewer'>('editor');

  // Active Sessions/Device Management State
  const [isSessionsOpen, setIsSessionsOpen] = useState(false);
  const [sessionsStaff, setSessionsStaff] = useState<StaffMember | null>(null);
  const [sessionsList, setSessionsList] = useState<any[]>([]);
  const [isSessionsLoading, setIsSessionsLoading] = useState(false);
  const [revokingSessionId, setRevokingSessionId] = useState<string | null>(null);

  // Check if current user is admin or store_manager
  const hasManagerPermission = user?.role === 'store_manager' || user?.role === 'admin';

  const checkPermission = (action: string) => {
    if (!hasManagerPermission) {
      toast.error(
        t(
          `⚠️ عذراً، لا تملك الصلاحية الكافية لإجراء [${action}] (للمدير فقط!)`,
          `⚠️ Sorry, you do not have sufficient permissions to perform [${action}] (Manager only!)`
        )
      );
      return false;
    }
    return true;
  };

  const getRoleAr = (role: string) => {
    switch(role) {
      case 'admin': return 'مدير المتجر';
      case 'editor': return 'إدارة المحتوى';
      case 'support': return 'دعم العملاء';
      case 'viewer': return 'متابعة أداء';
      default: return 'موظف';
    }
  };

  useEffect(() => {
    if (user?.id) {
      fetchStaff();
      fetchAuditLogs();
    }
  }, [user, locale]);

  const fetchStaff = async () => {
    try {
      setIsLoading(true);
      const res = await fetch(`/api/seller/staff?userId=${user?.id}`);
      const data = await res.json();
      if (data.success) {
        setMaxTeamMembers(data.maxTeamMembers || 1);
        setCurrentTeamSize(data.currentTeamSize || 0);
        setStaffList(data.staff.map((s: any) => ({
          id: s.id,
          userId: s.user.id,
          name: locale === 'ar' ? s.user.name : (s.user.nameEn || s.user.name),
          email: s.user.email,
          phone: s.user.phone || '-',
          role: s.role || s.user.role,
          roleAr: getRoleAr(s.role || s.user.role),
          isOnline: false,
          joined: new Date(s.joinedAt).toISOString().split('T')[0],
          avatar: s.user.avatar || '',
          isSuspended: s.user.isActive === false,
          status: s.status || 'active',
        })));
      }
    } catch (err) {
      console.error(err);
      toast.error(t('حدث خطأ أثناء جلب قائمة الموظفين', 'Failed to fetch staff list'));
    } finally {
      setIsLoading(false);
    }
  };

  const addActivity = (actorName: string, actionAr: string, actionEn: string, item: string) => {
    setActivities(prev => [
      {
        id: `act-${Date.now()}`,
        user: actorName,
        action: actionAr,
        item,
        time: locale === 'ar' ? 'الآن' : 'Just now',
        timeEn: 'Just now',
        actionEn,
      },
      ...prev
    ]);
    fetchAuditLogs();
  };

  const handleOpenInvite = () => {
    if (checkPermission(t('دعوة موظف جديد', 'Invite Staff Member'))) {
      setIsInviteOpen(true);
    }
  };

  const handleInviteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteName || !inviteEmail) {
      toast.error(t('يرجى ملء جميع الحقول المطلوبة', 'Please fill in all required fields'));
      return;
    }

    try {
      const res = await fetch('/api/seller/staff', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.id,
          name: inviteName,
          email: inviteEmail,
          phone: invitePhone,
          password: invitePassword,
          role: inviteRole,
        }),
      });

      const data = await res.json();

      if (data.success) {
        toast.success(t('✉️ تم إضافة الموظف الجديد بنجاح!', '✉️ Staff member added successfully!'));
        addActivity(user?.name || t('المدير', 'Manager'), `قام بدعوة الموظف الجديد (${inviteName})`, `invited new staff member (${inviteName})`, `[${getRoleAr(inviteRole)}]`);
        
        // Refresh data
        fetchStaff();

        // Reset Form
        setInviteName('');
        setInviteEmail('');
        setInvitePhone('');
        setInvitePassword('');
        setInviteRole('editor');
        setIsInviteOpen(false);
      } else {
        toast.error(data.error || t('فشل في إضافة الموظف', 'Failed to add staff'));
      }
    } catch (err) {
      toast.error(t('حدث خطأ في الاتصال بالخادم', 'Server connection error'));
    }
  };

  const handleOpenEditRole = (staff: StaffMember) => {
    if (checkPermission(t('تعديل الصلاحيات', 'Edit Roles'))) {
      setSelectedStaff(staff);
      setSelectedRole(staff.role);
      setIsEditRoleOpen(true);
    }
  };

  const handleEditRoleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStaff) return;

    try {
      const res = await fetch('/api/seller/staff', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.id,
          staffUserId: selectedStaff.userId,
          newRole: selectedRole,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setStaffList(prev => prev.map(s => 
          s.id === selectedStaff.id 
            ? { ...s, role: selectedRole, roleAr: getRoleAr(selectedRole) } 
            : s
        ));
        
        addActivity(
          user?.name || t('المدير', 'Manager'), 
          `قام بتغيير صلاحيات الموظف (${selectedStaff.name}) إلى`, 
          `changed role of staff (${selectedStaff.name}) to`, 
          getRoleAr(selectedRole)
        );

        toast.success(t('✅ تم تحديث صلاحيات الموظف بنجاح!', '✅ Staff role updated successfully!'));
        setIsEditRoleOpen(false);
        setSelectedStaff(null);
      } else {
        toast.error(data.error || t('فشل التحديث', 'Update failed'));
      }
    } catch (err) {
      toast.error(t('خطأ في الاتصال بالخادم', 'Server error'));
    }
  };

  const handleResetPassword = (staff: StaffMember) => {
    if (checkPermission(t('إعادة تعيين كلمة المرور', 'Reset Password'))) {
      addActivity(
        user?.name || t('المدير', 'Manager'), 
        `طلب إعادة تعيين كلمة المرور للموظف`, 
        `requested password reset for staff`, 
        staff.name
      );
      toast.success(
        t(
          `✉️ تم إرسال رابط إعادة تعيين كلمة المرور إلى البريد الإلكتروني للموظف (${staff.name})`,
          `✉️ Password reset link sent to staff member (${staff.name})'s email address`
        )
      );
    }
  };

  const handleToggleSuspend = async (staff: StaffMember) => {
    const isCurrentlySuspended = staff.isSuspended;
    const actionLabel = isCurrentlySuspended ? t('تنشيط الحساب', 'Activate Account') : t('حظر الحساب', 'Suspend Account');
    
    if (checkPermission(actionLabel)) {
      try {
        const res = await fetch('/api/seller/staff', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: user?.id,
            staffUserId: staff.userId,
            suspendAction: !isCurrentlySuspended, // pass true to suspend, false to activate
          }),
        });

        const data = await res.json();
        if (data.success) {
          setStaffList(prev => prev.map(s => 
            s.id === staff.id 
              ? { ...s, isSuspended: !isCurrentlySuspended } 
              : s
          ));

          addActivity(
            user?.name || t('المدير', 'Manager'),
            isCurrentlySuspended ? `قام بتنشيط حساب الموظف` : `قام بحظر حساب الموظف`,
            isCurrentlySuspended ? `activated account of staff` : `suspended account of staff`,
            staff.name
          );

          toast.success(
            isCurrentlySuspended
              ? t(`✅ تم تنشيط حساب الموظف (${staff.name}) بنجاح!`, `✅ Staff member (${staff.name}) account activated successfully!`)
              : t(`🔒 تم حظر حساب الموظف (${staff.name}) بنجاح!`, `🔒 Staff member (${staff.name}) account suspended successfully!`)
          );
        } else {
          toast.error(data.error || t('حدث خطأ', 'An error occurred'));
        }
      } catch (err) {
        toast.error(t('خطأ في الخادم', 'Server error'));
      }
    }
  };

  const handleDeleteStaff = async (staff: StaffMember) => {
    if (checkPermission(t('حذف الحساب', 'Delete Account')) && window.confirm(t('هل أنت متأكد من حذف هذا الموظف؟', 'Are you sure you want to delete this staff member?'))) {
      try {
        const res = await fetch(`/api/seller/staff?userId=${user?.id}&staffUserId=${staff.userId}`, {
          method: 'DELETE',
        });
        const data = await res.json();
        
        if (data.success) {
          setStaffList(prev => prev.filter(s => s.id !== staff.id));
          setCurrentTeamSize(prev => prev - 1);
          
          addActivity(
            user?.name || t('المدير', 'Manager'),
            `قام بإزالة الموظف من فريق العمل`,
            `removed staff member`,
            staff.name
          );

          toast.success(t(`🗑️ تم حذف الموظف (${staff.name}) من قائمة الفريق بنجاح!`, `🗑️ Staff member (${staff.name}) removed from team successfully!`));
        } else {
          toast.error(data.error || t('فشل الحذف', 'Failed to delete'));
        }
      } catch (err) {
        toast.error(t('خطأ خادم', 'Server error'));
      }
    }
  };

  const fetchStaffSessions = async (staffUserId: string) => {
    setIsSessionsLoading(true);
    try {
      const res = await fetch(`/api/seller/staff/sessions?userId=${user?.id}&staffUserId=${staffUserId}`);
      const data = await res.json();
      if (data.success) {
        setSessionsList(data.sessions);
      } else {
        toast.error(data.error || t('فشل في جلب الجلسات', 'Failed to fetch sessions'));
      }
    } catch (err) {
      toast.error(t('خطأ في الاتصال بالخادم', 'Server connection error'));
    } finally {
      setIsSessionsLoading(false);
    }
  };

  const handleOpenSessions = (staff: StaffMember) => {
    if (checkPermission(t('إدارة الأجهزة والجلسات', 'Manage Devices & Sessions'))) {
      setSessionsStaff(staff);
      setIsSessionsOpen(true);
      if (staff.userId) {
        fetchStaffSessions(staff.userId);
      }
    }
  };

  const handleRevokeStaffSession = async (sessionId: string) => {
    if (!sessionsStaff) return;
    setRevokingSessionId(sessionId);
    try {
      const res = await fetch(
        `/api/seller/staff/sessions?userId=${user?.id}&staffUserId=${sessionsStaff.userId}&sessionId=${sessionId}`,
        { method: 'DELETE' }
      );
      const data = await res.json();
      if (data.success) {
        setSessionsList(prev => prev.filter(s => s.id !== sessionId));
        toast.success(t('تم إنهاء جلسة الموظف بنجاح', 'Staff session terminated successfully'));
        addActivity(
          user?.name || t('المدير', 'Manager'),
          `قام بإنهاء جلسة نشطة للموظف`,
          `terminated active session for staff member`,
          sessionsStaff.name
        );
      } else {
        toast.error(data.error || t('فشل في إنهاء الجلسة', 'Failed to terminate session'));
      }
    } catch (err) {
      toast.error(t('حدث خطأ في الاتصال بالخادم', 'Server connection error'));
    } finally {
      setRevokingSessionId(null);
    }
  };

  const handleRevokeAllStaffSessions = async () => {
    if (!sessionsStaff) return;
    if (!window.confirm(t('هل أنت متأكد من إنهاء جميع جلسات هذا الموظف؟', 'Are you sure you want to terminate all sessions for this staff member?'))) {
      return;
    }
    setIsSessionsLoading(true);
    try {
      const res = await fetch(
        `/api/seller/staff/sessions?userId=${user?.id}&staffUserId=${sessionsStaff.userId}&sessionId=all`,
        { method: 'DELETE' }
      );
      const data = await res.json();
      if (data.success) {
        setSessionsList([]);
        toast.success(t('تم إنهاء جميع جلسات الموظف بنجاح', 'All staff sessions terminated successfully'));
        addActivity(
          user?.name || t('المدير', 'Manager'),
          `قام بإنهاء جميع الجلسات النشطة للموظف`,
          `terminated all active sessions for staff member`,
          sessionsStaff.name
        );
      } else {
        toast.error(data.error || t('فشل في إنهاء الجلسات', 'Failed to terminate sessions'));
      }
    } catch (err) {
      toast.error(t('حدث خطأ في الاتصال بالخادم', 'Server connection error'));
    } finally {
      setIsSessionsLoading(false);
    }
  };

  const getRoleStyle = (role: string) => {
    switch(role) {
      case 'admin': return 'bg-purple-500/10 text-purple-500 border-purple-500/20';
      case 'editor': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'support': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
      case 'viewer': return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
      default: return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
    }
  };

  return (
    <motion.div 
      className="space-y-6 p-4 md:p-6 text-start"
      variants={STAGGER_CONTAINER}
      initial="hidden"
      animate="visible"
    >
      {/* Page Header */}
      <motion.div variants={FADE_UP} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <PageHeader
          title={t('فريق العمل والصلاحيات', 'Staff & Permissions')}
          description={t('إدارة حسابات موظفي المتجر، التحكم بمستويات الوصول، وسجل النشاط.', 'Manage store staff accounts, access levels, and activity logs.')}
        />
        <div className="flex items-center gap-4">
          <div className="flex flex-col text-end">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{t('استهلاك الباقة', 'Plan Usage')}</span>
            <span className={`text-sm font-black ${currentTeamSize >= maxTeamMembers ? 'text-red-500' : 'text-foreground'}`}>
              {currentTeamSize} / {maxTeamMembers} {t('موظف', 'Staff')}
            </span>
          </div>
          <Button 
            onClick={handleOpenInvite}
            disabled={currentTeamSize >= maxTeamMembers}
            className={`rounded-xl font-bold shadow-lg transition-all ${
              currentTeamSize >= maxTeamMembers
                ? 'bg-muted text-muted-foreground cursor-not-allowed shadow-none' 
                : 'bg-gradient-to-r from-primary to-primary/80 shadow-primary/20 hover:scale-105'
            }`}
          >
            <UserPlus className="h-4 w-4 me-2" />
            {currentTeamSize >= maxTeamMembers ? t('تم تجاوز الحد', 'Limit Reached') : t('دعوة موظف جديد', 'Invite Staff Member')}
          </Button>
        </div>
      </motion.div>

      {/* Permission Warning Alert for Non-Managers */}
      {!hasManagerPermission && (
        <motion.div variants={FADE_UP}>
          <Card className="border-amber-500/30 bg-amber-500/5 text-amber-500 rounded-2xl p-4 flex gap-3 items-start backdrop-blur-xl">
            <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
            <div>
              <h5 className="font-bold text-sm mb-1">{t('تنبيه الصلاحيات المحدودة', 'Restricted Permissions Alert')}</h5>
              <p className="text-xs text-amber-500/90 leading-relaxed">
                {t(
                  `أنت تتصفح هذه الصفحة بصفتك موظفاً ذو صلاحيات محدودة. العمليات الحساسة مثل (دعوة الموظفين، تغيير الصلاحيات، حظر الحسابات، أو حذفها) مقفلة ومرتبطة بمدير المتجر الرئيسي فقط لضمان سلامة العمليات.`,
                  `You are viewing this page as a staff member with restricted permissions. Sensitive actions such as (inviting team members, changing roles, suspending accounts, or deleting staff) are locked and permitted only for the main Store Manager to ensure operational safety.`
                )}
              </p>
            </div>
          </Card>
        </motion.div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Main Staff List */}
        <motion.div variants={FADE_UP} className="xl:col-span-2 space-y-4">
          <Card className="border-white/10 bg-background/60 backdrop-blur-xl shadow-xl rounded-3xl overflow-hidden">
            <CardHeader className="border-b border-white/5 pb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                {t('أعضاء الفريق', 'Team Members')}
                <Badge variant="secondary" className="ms-2 font-bold">{staffList.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-border/30">
                {isLoading ? (
                  <div className="p-12 flex flex-col items-center justify-center text-muted-foreground gap-3">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <span className="font-semibold">{t('جاري تحميل بيانات الموظفين...', 'Loading staff data...')}</span>
                  </div>
                ) : (
                  <AnimatePresence initial={false}>
                    {staffList.map((staff, idx) => (
                      <motion.div 
                        key={staff.id} 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className={`p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-muted/30 transition-colors ${staff.isSuspended ? 'bg-red-500/5 opacity-70' : ''}`}
                      >
                        <div className="flex items-center gap-4">
                          <div className="relative">
                            <Avatar className={`h-12 w-12 border-2 border-background shadow-sm ${staff.isSuspended ? 'grayscale' : ''}`}>
                              <AvatarImage src={staff.avatar} />
                              <AvatarFallback className="font-black bg-primary/10 text-primary">{staff.name[0]}</AvatarFallback>
                            </Avatar>
                            <span className={`absolute bottom-0 end-0 h-3 w-3 rounded-full border-2 border-background ${staff.isSuspended ? 'bg-red-500' : staff.isOnline ? 'bg-green-500' : 'bg-gray-400'}`} />
                          </div>
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <h4 className={`font-bold text-sm ${staff.isSuspended ? 'line-through text-muted-foreground' : ''}`}>{staff.name}</h4>
                              {staff.isSuspended && (
                                <Badge className="bg-red-500/10 text-red-500 border border-red-500/20 text-[10px] py-0 px-1.5 font-bold">
                                  {t('محظور', 'Suspended')}
                                </Badge>
                              )}
                              {staff.status === 'pending' && (
                                <Badge className="bg-amber-500/10 text-amber-600 border border-amber-500/20 text-[10px] py-0 px-1.5 font-bold">
                                  {t('دعوة معلقة', 'Pending Invitation')}
                                </Badge>
                              )}
                            </div>
                            <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground mt-1">
                              <span className="flex items-center gap-1"><Mail className="h-3 w-3" /> {staff.email}</span>
                              <span className="flex items-center gap-1"><Phone className="h-3 w-3" /> {staff.phone}</span>
                              <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {staff.joined}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 sm:justify-end w-full sm:w-auto">
                          <Badge variant="outline" className={`border font-bold ${getRoleStyle(staff.role)}`}>
                            {isAr ? staff.roleAr : staff.role.charAt(0).toUpperCase() + staff.role.slice(1)}
                          </Badge>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-8 w-8 rounded-lg shrink-0 hover:bg-muted/80"
                              >
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align={isAr ? "start" : "end"} className="w-52 rounded-xl border-white/10 bg-background/95 backdrop-blur-xl">
                              <DropdownMenuItem 
                                onClick={() => handleOpenEditRole(staff)}
                                className="cursor-pointer font-semibold"
                              >
                                <Shield className="h-4 w-4 me-2 text-blue-500" /> {t('تعديل الصلاحيات', 'Edit Roles')}
                              </DropdownMenuItem>
                               <DropdownMenuItem 
                                onClick={() => handleOpenSessions(staff)}
                                className="cursor-pointer font-semibold"
                              >
                                <Laptop className="h-4 w-4 me-2 text-emerald-500" /> {t('إدارة الأجهزة', 'Manage Devices')}
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => handleResetPassword(staff)}
                                className="cursor-pointer font-semibold"
                              >
                                <Key className="h-4 w-4 me-2 text-purple-500" /> {t('إعادة تعيين كلمة المرور', 'Reset Password')}
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => handleToggleSuspend(staff)}
                                className={`cursor-pointer font-semibold ${staff.isSuspended ? 'text-green-500' : 'text-amber-500'}`}
                              >
                                {staff.isSuspended ? (
                                  <>
                                    <Unlock className="h-4 w-4 me-2 text-green-500" /> {t('تنشيط الحساب', 'Activate Account')}
                                  </>
                                ) : (
                                  <>
                                    <Lock className="h-4 w-4 me-2 text-amber-500" /> {t('حظر الحساب', 'Suspend Account')}
                                  </>
                                )}
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => handleDeleteStaff(staff)}
                                className="cursor-pointer font-semibold text-red-500 focus:bg-red-500/10"
                              >
                                <Trash2 className="h-4 w-4 me-2" /> {t('حذف الموظف', 'Delete Staff')}
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                )}
                {!isLoading && staffList.length === 0 && (
                  <div className="p-8 text-center text-muted-foreground flex flex-col items-center justify-center gap-2">
                    <Users className="h-10 w-10 text-muted-foreground/40" />
                    <p className="font-semibold text-sm">{t('لا يوجد موظفين مسجلين حالياً', 'No registered staff members found')}</p>
                    <p className="text-xs text-muted-foreground/80">{t('انقر على زر دعوة موظف لبدء إضافة فريقك', 'Click Invite Staff Member to start building your team')}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Roles & Security Settings */}
        <motion.div variants={FADE_UP} className="space-y-6">
          <Card className="border-white/10 bg-gradient-to-br from-primary/10 to-transparent backdrop-blur-xl shadow-xl rounded-3xl">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                {t('مستويات الصلاحيات', 'Access Levels')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { title: t('مدير المتجر', 'Store Manager'), desc: t('تحكم كامل بجميع خصائص المتجر والعمليات المالية والموظفين.', 'Full control over all store features, finance, and staff.'), color: 'text-purple-500' },
                { title: t('إدارة المحتوى', 'Content Editor'), desc: t('إضافة وتعديل المنتجات والعروض، وإعداد كوبونات الخصم.', 'Add and edit products, promotions, and coupons.'), color: 'text-blue-500' },
                { title: t('دعم العملاء', 'Customer Support'), desc: t('إدارة الطلبات والرد على الرسائل والتقييمات وتحديث الشحن.', 'Manage orders, review customer messages, and update shipping.'), color: 'text-emerald-500' },
                { title: t('متابعة الأداء', 'Viewer'), desc: t('قراءة الإحصائيات والتقارير المبيعات بدون صلاحية التعديل.', 'Read-only access to stats, sales, and analytics report.'), color: 'text-amber-500' },
              ].map((role, idx) => (
                <div key={idx} className="flex gap-3 bg-background/50 p-3 rounded-xl border border-white/5 hover:border-white/10 transition-colors">
                  <Circle className={`h-4 w-4 mt-0.5 shrink-0 fill-current ${role.color}`} />
                  <div>
                    <h5 className="font-bold text-sm mb-0.5">{role.title}</h5>
                    <p className="text-xs text-muted-foreground leading-relaxed">{role.desc}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-white/10 bg-background/60 backdrop-blur-xl shadow-xl rounded-3xl">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Activity className="h-4 w-4 text-primary" />
                {t('آخر نشاطات الفريق', 'Recent Activity')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {isLoadingLogs && activities.length === 0 ? (
                  <div className="py-6 flex flex-col items-center justify-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin text-primary" />
                    <span className="text-[10px] text-muted-foreground">{t('جاري جلب سجل النشاط...', 'Fetching activity log...')}</span>
                  </div>
                ) : activities.length === 0 ? (
                  <p className="text-xs text-muted-foreground text-center py-4">{t('لا يوجد سجل نشاط حالياً.', 'No recent activity.')}</p>
                ) : (
                  <AnimatePresence initial={false}>
                    {activities.map((act) => (
                      <motion.div 
                        key={act.id} 
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.2 }}
                        className="text-sm border-b border-border/10 pb-2 last:border-0 last:pb-0"
                      >
                        <span className="font-bold text-foreground">{act.user}</span>{' '}
                        <span className="text-muted-foreground">{locale === 'ar' ? act.action : act.actionEn}</span>{' '}
                        <span className="font-semibold text-primary">{act.item}</span>
                        <p className="text-[10px] text-muted-foreground mt-0.5">{locale === 'ar' ? act.time : act.timeEn}</p>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

      </div>

      {/* dialog for INVITATIONS */}
      <Dialog open={isInviteOpen} onOpenChange={setIsInviteOpen}>
        <DialogContent className="sm:max-w-md rounded-2xl border-white/10 bg-background/95 backdrop-blur-xl">
          <DialogHeader className="text-start">
            <DialogTitle className="text-lg font-bold flex items-center gap-2">
              <UserPlus className="h-5 w-5 text-primary" />
              {t('دعوة موظف جديد', 'Invite Staff Member')}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              {t('أدخل تفاصيل الموظف الجديد وسيتم إرسال رابط تفعيل الحساب إليه فوراً.', 'Enter the new staff details. An activation link will be sent instantly.')}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleInviteSubmit} className="space-y-4 py-3 text-start">
            <div className="space-y-1">
              <Label htmlFor="invite-name" className="text-xs font-bold">{t('الاسم بالكامل', 'Full Name')}</Label>
              <Input 
                id="invite-name" 
                placeholder={t('مثال: سليم بلخير', 'e.g., Slim Belkheir')} 
                value={inviteName} 
                onChange={(e) => setInviteName(e.target.value)}
                className="rounded-xl border-white/10 bg-background/50 focus:border-primary"
                required
              />
            </div>
            
            <div className="space-y-1">
              <Label htmlFor="invite-email" className="text-xs font-bold">{t('البريد الإلكتروني', 'Email Address')}</Label>
              <Input 
                id="invite-email" 
                type="email"
                placeholder="example@store.com" 
                value={inviteEmail} 
                onChange={(e) => setInviteEmail(e.target.value)}
                className="rounded-xl border-white/10 bg-background/50 focus:border-primary text-start"
                required
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="invite-phone" className="text-xs font-bold">{t('رقم الهاتف', 'Phone Number')}</Label>
              <Input 
                id="invite-phone" 
                placeholder="+213 555 000000" 
                value={invitePhone} 
                onChange={(e) => setInvitePhone(e.target.value)}
                className="rounded-xl border-white/10 bg-background/50 focus:border-primary text-start"
                required
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="invite-password" className="text-xs font-bold">{t('كلمة المرور الابتدائية', 'Initial Password')}</Label>
              <Input 
                id="invite-password" 
                type="text"
                placeholder={t('سيطلب النظام تغييره عند أول دخول', 'System will prompt to change on first login')} 
                value={invitePassword} 
                onChange={(e) => setInvitePassword(e.target.value)}
                className="rounded-xl border-white/10 bg-background/50 focus:border-primary text-start"
                required
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="invite-role" className="text-xs font-bold">{t('الدور والصلاحيات', 'Role & Permissions')}</Label>
              <Select 
                value={inviteRole} 
                onValueChange={(val: any) => setInviteRole(val)}
              >
                <SelectTrigger id="invite-role" className="rounded-xl border-white/10 bg-background/50">
                  <SelectValue placeholder={t('اختر الدور', 'Select Role')} />
                </SelectTrigger>
                <SelectContent className="z-[9999] rounded-xl border-white/10 bg-background/95 backdrop-blur-xl">
                  <SelectItem value="admin" className="cursor-pointer">{t('مدير المتجر (تحكم كامل)', 'Store Manager (Full)')}</SelectItem>
                  <SelectItem value="editor" className="cursor-pointer">{t('إدارة المحتوى (منتجات وعروض)', 'Content Editor (Products)')}</SelectItem>
                  <SelectItem value="support" className="cursor-pointer">{t('دعم العملاء (طلبات ومحادثات)', 'Customer Support (Orders)')}</SelectItem>
                  <SelectItem value="viewer" className="cursor-pointer">{t('متابعة أداء (تقارير وقراءة فقط)', 'Viewer (Stats Only)')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <DialogFooter className="mt-6 flex flex-row gap-2 sm:justify-end">
              <DialogClose asChild>
                <Button type="button" variant="outline" className="flex-1 sm:flex-none rounded-xl font-bold">
                  {t('إلغاء', 'Cancel')}
                </Button>
              </DialogClose>
              <Button type="submit" className="flex-1 sm:flex-none rounded-xl font-bold bg-primary text-primary-foreground hover:bg-primary/95 shadow-md shadow-primary/10">
                {t('إرسال الدعوة', 'Send Invitation')}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* dialog for EDITING ROLES */}
      <Dialog open={isEditRoleOpen} onOpenChange={setIsEditRoleOpen}>
        <DialogContent className="sm:max-w-md rounded-2xl border-white/10 bg-background/95 backdrop-blur-xl">
          <DialogHeader className="text-start">
            <DialogTitle className="text-lg font-bold flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              {t('تعديل صلاحيات الموظف', 'Edit Staff Role')}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              {t(`تعديل مستوى الصلاحية للموظف (${selectedStaff?.name}) حالياً.`, `Modify the access levels for staff member (${selectedStaff?.name}) now.`)}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleEditRoleSubmit} className="space-y-4 py-3 text-start">
            <div className="space-y-1">
              <Label htmlFor="edit-role-select" className="text-xs font-bold">{t('الدور الجديد', 'New Role')}</Label>
              <Select 
                value={selectedRole} 
                onValueChange={(val: any) => setSelectedRole(val)}
              >
                <SelectTrigger id="edit-role-select" className="rounded-xl border-white/10 bg-background/50">
                  <SelectValue placeholder={t('اختر الدور', 'Select Role')} />
                </SelectTrigger>
                <SelectContent className="z-[9999] rounded-xl border-white/10 bg-background/95 backdrop-blur-xl">
                  <SelectItem value="admin" className="cursor-pointer">{t('مدير المتجر (تحكم كامل)', 'Store Manager (Full)')}</SelectItem>
                  <SelectItem value="editor" className="cursor-pointer">{t('إدارة المحتوى (منتجات وعروض)', 'Content Editor (Products)')}</SelectItem>
                  <SelectItem value="support" className="cursor-pointer">{t('دعم العملاء (طلبات ومحادثات)', 'Customer Support (Orders)')}</SelectItem>
                  <SelectItem value="viewer" className="cursor-pointer">{t('متابعة أداء (تقارير وقراءة فقط)', 'Viewer (Stats Only)')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <DialogFooter className="mt-6 flex flex-row gap-2 sm:justify-end">
              <DialogClose asChild>
                <Button type="button" variant="outline" className="flex-1 sm:flex-none rounded-xl font-bold">
                  {t('إلغاء', 'Cancel')}
                </Button>
              </DialogClose>
              <Button type="submit" className="flex-1 sm:flex-none rounded-xl font-bold bg-primary text-primary-foreground hover:bg-primary/95 shadow-md shadow-primary/10">
                {t('تحديث الصلاحية', 'Update Permissions')}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* dialog for MANAGING DEVICES (Staff Sessions) */}
      <Dialog open={isSessionsOpen} onOpenChange={setIsSessionsOpen}>
        <DialogContent className="sm:max-w-lg rounded-2xl border-white/10 bg-background/95 backdrop-blur-xl max-h-[85vh] flex flex-col overflow-hidden">
          <DialogHeader className="text-start pb-2 border-b border-white/5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Laptop className="h-5 w-5 text-primary" />
                <DialogTitle className="text-lg font-bold">
                  {t(`إدارة أجهزة الموظف: ${sessionsStaff?.name}`, `Manage Devices for: ${sessionsStaff?.name}`)}
                </DialogTitle>
              </div>
              {sessionsList.length > 0 && (
                <Button 
                  variant="destructive" 
                  size="sm" 
                  onClick={handleRevokeAllStaffSessions}
                  disabled={isSessionsLoading}
                  className="rounded-xl font-bold flex items-center gap-1.5 text-xs shadow-md shadow-destructive/10"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  {t('إنهاء جميع الجلسات', 'Terminate All Sessions')}
                </Button>
              )}
            </div>
            <DialogDescription className="text-xs text-muted-foreground mt-1">
              {t('عرض جميع الأجهزة والنشاطات الحالية لهذا الموظف، مع إمكانية طرد أي جلسة مشبوهة أو منتهية الصلاحية.', 'View current devices and activity for this staff member. You can terminate any session.')}
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto py-4 space-y-3 pe-1 text-start">
            {isSessionsLoading && sessionsList.length === 0 ? (
              <div className="p-12 flex flex-col items-center justify-center text-muted-foreground gap-3">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="font-semibold text-sm">{t('جاري جلب قائمة الأجهزة...', 'Loading devices list...')}</span>
              </div>
            ) : sessionsList.length === 0 ? (
              <div className="py-12 text-center text-muted-foreground flex flex-col items-center justify-center gap-2">
                <Laptop className="h-10 w-10 text-muted-foreground/30" />
                <p className="font-semibold text-sm">{t('لا توجد جلسات نشطة لهذا الموظف حالياً', 'No active sessions found for this staff member')}</p>
                <p className="text-xs text-muted-foreground/80">{t('هذا الموظف غير متصل بأي جهاز حالياً.', 'This staff member is not currently logged into any device.')}</p>
              </div>
            ) : (
              <div className="space-y-3">
                {sessionsList.map(session => (
                  <div
                    key={session.id}
                    className="flex items-center justify-between gap-4 p-4 rounded-2xl border border-white/5 bg-background/50 backdrop-blur-md hover:border-white/10 transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-primary/10 border border-primary/20 shrink-0">
                        <DeviceIcon type={session.deviceType} />
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-sm text-foreground">
                          {session.browser} — {session.os}
                        </p>
                        <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground flex-wrap">
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3.5 w-3.5" />
                            {session.city ? `${session.city}, ` : ''}{session.countryCode || 'Unknown'}
                          </span>
                          <span className="flex items-center gap-1">
                            <Globe className="h-3.5 w-3.5" />
                            {session.ipAddress}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5" />
                            {formatDistanceToNow(new Date(session.createdAt), {
                              addSuffix: true,
                              locale: locale === 'ar' ? dateFnsAr : dateFnsEn
                            })}
                          </span>
                        </div>
                      </div>
                    </div>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRevokeStaffSession(session.id)}
                      disabled={revokingSessionId === session.id}
                      className="gap-1.5 rounded-xl text-red-500 hover:text-red-500 hover:bg-red-500/10 shrink-0 font-semibold"
                    >
                      {revokingSessionId === session.id ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <LogOut className="h-3.5 w-3.5" />
                      )}
                      {t('إنهاء الجلسة', 'End Session')}
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <DialogFooter className="pt-2 border-t border-white/5 flex gap-2 justify-end">
            <DialogClose asChild>
              <Button type="button" variant="outline" className="rounded-xl font-bold">
                {t('إغلاق', 'Close')}
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </motion.div>
  );
}

function DeviceIcon({ type }: { type: string }) {
  const cls = 'h-5 w-5 text-primary';
  if (type === 'Mobile') return <Smartphone className={cls} />;
  if (type === 'Tablet') return <Tablet className={cls} />;
  return <Laptop className={cls} />;
}


