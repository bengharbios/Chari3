'use client';
import React from 'react';

import { useState } from 'react';
import { useAppStore } from '@/lib/store';
import { PageHeader } from '@/components/shared/StatsCard';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  Shield, UserPlus, Users, Key, Lock, Unlock, Mail, Phone, Calendar, MoreHorizontal, Circle, Activity, AlertCircle, Trash2, CheckCircle2, X
} from 'lucide-react';
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
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'admin' | 'editor' | 'support' | 'viewer';
  roleAr: string;
  isOnline: boolean;
  joined: string;
  avatar: string;
  isSuspended?: boolean;
}

const INITIAL_STAFF: StaffMember[] = [
  { id: '1', name: 'محمد الصالح', email: 'mohammed@store.com', phone: '+213 555 1234', role: 'admin', roleAr: 'مدير المتجر', isOnline: true, joined: '2025-01-15', avatar: 'https://i.pravatar.cc/150?u=1', isSuspended: false },
  { id: '2', name: 'فاطمة الزهراء', email: 'fatima@store.com', phone: '+213 666 5678', role: 'editor', roleAr: 'إدارة المحتوى', isOnline: true, joined: '2025-03-22', avatar: 'https://i.pravatar.cc/150?u=2', isSuspended: false },
  { id: '3', name: 'ياسين بوعلام', email: 'yassine@store.com', phone: '+213 777 9012', role: 'support', roleAr: 'دعم العملاء', isOnline: false, joined: '2025-05-10', avatar: 'https://i.pravatar.cc/150?u=3', isSuspended: false },
  { id: '4', name: 'خديجة نور', email: 'khadija@store.com', phone: '+213 555 3456', role: 'viewer', roleAr: 'متابعة أداء', isOnline: false, joined: '2026-01-05', avatar: 'https://i.pravatar.cc/150?u=4', isSuspended: false },
];

export default function StoreStaffPage() {
  const { locale } = useAppStore();
  const { user } = useAuthStore();
  const t = (ar: string, en: string) => locale === 'ar' ? ar : en;
  const isAr = locale === 'ar';

  // Stateful list of staff
  const [staffList, setStaffList] = useState<StaffMember[]>(INITIAL_STAFF);

  // Stateful activity logs
  const [activities, setActivities] = useState([
    { id: 'act-1', user: 'فاطمة الزهراء', action: 'قامت بتعديل سعر', item: 'سماعات برو', time: 'منذ 10 دقائق', timeEn: '10m ago', actionEn: 'updated price of' },
    { id: 'act-2', user: 'ياسين بوعلام', action: 'قام بشحن طلب', item: '#ORD-5840', time: 'منذ ساعة', timeEn: '1h ago', actionEn: 'shipped order' },
    { id: 'act-3', user: 'محمد الصالح', action: 'قام بتسجيل الدخول', item: '', time: 'منذ 3 ساعات', timeEn: '3h ago', actionEn: 'logged in' },
  ]);

  // Inviting Staff Form State
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [inviteName, setInviteName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [invitePhone, setInvitePhone] = useState('');
  const [inviteRole, setInviteRole] = useState<'admin' | 'editor' | 'support' | 'viewer'>('editor');

  // Editing Role Dialog State
  const [isEditRoleOpen, setIsEditRoleOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<StaffMember | null>(null);
  const [selectedRole, setSelectedRole] = useState<'admin' | 'editor' | 'support' | 'viewer'>('editor');

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

  const addActivity = (actorName: string, actionAr: string, actionEn: string, item: string) => {
    setActivities(prev => [
      {
        id: `act-${Date.now()}`,
        user: actorName,
        action: actionAr,
        item,
        time: 'الآن',
        timeEn: 'Just now',
        actionEn,
      },
      ...prev
    ]);
  };

  const handleOpenInvite = () => {
    if (checkPermission(t('دعوة موظف جديد', 'Invite Staff Member'))) {
      setIsInviteOpen(true);
    }
  };

  const handleInviteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteName || !inviteEmail || !invitePhone) {
      toast.error(t('يرجى ملء جميع الحقول المطلوبة', 'Please fill in all required fields'));
      return;
    }

    const newStaff: StaffMember = {
      id: String(Date.now()),
      name: inviteName,
      email: inviteEmail,
      phone: invitePhone,
      role: inviteRole,
      roleAr: getRoleAr(inviteRole),
      isOnline: false,
      joined: new Date().toISOString().split('T')[0],
      avatar: `https://i.pravatar.cc/150?u=${Date.now()}`,
      isSuspended: false,
    };

    setStaffList(prev => [...prev, newStaff]);
    addActivity(user?.name || t('المدير', 'Manager'), `قام بدعوة الموظف الجديد (${inviteName})`, `invited new staff member (${inviteName})`, `[${getRoleAr(inviteRole)}]`);
    
    toast.success(t('✉️ تم إرسال رابط دعوة الموظف الجديد وإضافته بنجاح!', '✉️ Staff invitation link sent and member added successfully!'));
    
    // Reset Form
    setInviteName('');
    setInviteEmail('');
    setInvitePhone('');
    setInviteRole('editor');
    setIsInviteOpen(false);
  };

  const handleOpenEditRole = (staff: StaffMember) => {
    if (checkPermission(t('تعديل الصلاحيات', 'Edit Roles'))) {
      setSelectedStaff(staff);
      setSelectedRole(staff.role);
      setIsEditRoleOpen(true);
    }
  };

  const handleEditRoleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStaff) return;

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

  const handleToggleSuspend = (staff: StaffMember) => {
    const isCurrentlySuspended = staff.isSuspended;
    const actionLabel = isCurrentlySuspended ? t('تنشيط الحساب', 'Activate Account') : t('حظر الحساب', 'Suspend Account');
    
    if (checkPermission(actionLabel)) {
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
    }
  };

  const handleDeleteStaff = (staff: StaffMember) => {
    if (checkPermission(t('حذف الحساب', 'Delete Account'))) {
      setStaffList(prev => prev.filter(s => s.id !== staff.id));
      
      addActivity(
        user?.name || t('المدير', 'Manager'),
        `قام بإزالة الموظف من فريق العمل`,
        `removed staff member`,
        staff.name
      );

      toast.success(t(`🗑️ تم حذف الموظف (${staff.name}) من قائمة الفريق بنجاح!`, `🗑️ Staff member (${staff.name}) removed from team successfully!`));
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
        <Button 
          onClick={handleOpenInvite}
          className="rounded-xl font-bold bg-gradient-to-r from-primary to-primary/80 shadow-lg shadow-primary/20 hover:scale-105 transition-all"
        >
          <UserPlus className="h-4 w-4 me-2" />
          {t('دعوة موظف جديد', 'Invite Staff Member')}
        </Button>
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
                {staffList.length === 0 && (
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
              <Label htmlFor="invite-role" className="text-xs font-bold">{t('الدور والصلاحيات', 'Role & Permissions')}</Label>
              <Select 
                value={inviteRole} 
                onValueChange={(val: any) => setInviteRole(val)}
              >
                <SelectTrigger id="invite-role" className="rounded-xl border-white/10 bg-background/50">
                  <SelectValue placeholder={t('اختر الدور', 'Select Role')} />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-white/10 bg-background/95 backdrop-blur-xl">
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
                <SelectContent className="rounded-xl border-white/10 bg-background/95 backdrop-blur-xl">
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

    </motion.div>
  );
}

