'use client';

import { useState } from 'react';
import { useAppStore } from '@/lib/store';
import { PageHeader } from '@/components/shared/StatsCard';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  Shield, UserPlus, Users, Key, Lock, Mail, Phone, Calendar, MoreHorizontal, Circle, Activity
} from 'lucide-react';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';

const STAGGER_CONTAINER = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const FADE_UP = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
};

const MOCK_STAFF = [
  { id: '1', name: 'محمد الصالح', email: 'mohammed@store.com', phone: '+213 555 1234', role: 'admin', roleAr: 'مدير المتجر', isOnline: true, joined: '2025-01-15', avatar: 'https://i.pravatar.cc/150?u=1' },
  { id: '2', name: 'فاطمة الزهراء', email: 'fatima@store.com', phone: '+213 666 5678', role: 'editor', roleAr: 'إدارة المحتوى', isOnline: true, joined: '2025-03-22', avatar: 'https://i.pravatar.cc/150?u=2' },
  { id: '3', name: 'ياسين بوعلام', email: 'yassine@store.com', phone: '+213 777 9012', role: 'support', roleAr: 'دعم العملاء', isOnline: false, joined: '2025-05-10', avatar: 'https://i.pravatar.cc/150?u=3' },
  { id: '4', name: 'خديجة نور', email: 'khadija@store.com', phone: '+213 555 3456', role: 'viewer', roleAr: 'متابعة أداء', isOnline: false, joined: '2026-01-05', avatar: 'https://i.pravatar.cc/150?u=4' },
];

export default function StoreStaffPage() {
  const { locale } = useAppStore();
  const t = (ar: string, en: string) => locale === 'ar' ? ar : en;
  const isAr = locale === 'ar';

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
      <motion.div variants={FADE_UP} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <PageHeader
          title={t('فريق العمل والصلاحيات', 'Staff & Permissions')}
          description={t('إدارة حسابات موظفي المتجر، التحكم بمستويات الوصول، وسجل النشاط.', 'Manage store staff accounts, access levels, and activity logs.')}
        />
        <Button className="rounded-xl font-bold bg-gradient-to-r from-primary to-primary/80 shadow-lg shadow-primary/20 hover:scale-105 transition-all">
          <UserPlus className="h-4 w-4 me-2" />
          {t('دعوة موظف جديد', 'Invite Staff Member')}
        </Button>
      </motion.div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Main Staff List */}
        <motion.div variants={FADE_UP} className="xl:col-span-2 space-y-4">
          <Card className="border-white/10 bg-background/60 backdrop-blur-xl shadow-xl rounded-3xl overflow-hidden">
            <CardHeader className="border-b border-white/5 pb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                {t('أعضاء الفريق', 'Team Members')}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {MOCK_STAFF.map((staff, idx) => (
                <div key={staff.id} className={`p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-muted/30 transition-colors ${idx !== MOCK_STAFF.length - 1 ? 'border-b border-border/50' : ''}`}>
                  
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <Avatar className="h-12 w-12 border-2 border-background shadow-sm">
                        <AvatarImage src={staff.avatar} />
                        <AvatarFallback className="font-black bg-primary/10 text-primary">{staff.name[0]}</AvatarFallback>
                      </Avatar>
                      <span className={`absolute bottom-0 end-0 h-3 w-3 rounded-full border-2 border-background ${staff.isOnline ? 'bg-green-500' : 'bg-gray-400'}`} />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm">{staff.name}</h4>
                      <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground mt-1">
                        <span className="flex items-center gap-1"><Mail className="h-3 w-3" /> {staff.email}</span>
                        <span className="flex items-center gap-1"><Phone className="h-3 w-3" /> {staff.phone}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 sm:justify-end w-full sm:w-auto">
                    <Badge variant="outline" className={`border font-bold ${getRoleStyle(staff.role)}`}>
                      {isAr ? staff.roleAr : staff.role.charAt(0).toUpperCase() + staff.role.slice(1)}
                    </Badge>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg shrink-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align={isAr ? "start" : "end"} className="w-48 rounded-xl border-white/10 bg-background/95 backdrop-blur-xl">
                        <DropdownMenuItem className="cursor-pointer"><Shield className="h-4 w-4 me-2" /> {t('تعديل الصلاحيات', 'Edit Roles')}</DropdownMenuItem>
                        <DropdownMenuItem className="cursor-pointer"><Key className="h-4 w-4 me-2" /> {t('إعادة تعيين كلمة المرور', 'Reset Password')}</DropdownMenuItem>
                        <DropdownMenuItem className="cursor-pointer text-red-500"><Lock className="h-4 w-4 me-2" /> {t('حظر الحساب', 'Suspend Account')}</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
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
                { title: t('مدير المتجر', 'Store Manager'), desc: t('تحكم كامل بجميع خصائص المتجر.', 'Full control over all store features.'), color: 'text-purple-500' },
                { title: t('إدارة المحتوى', 'Content Editor'), desc: t('إضافة وتعديل المنتجات والعروض.', 'Add and edit products and offers.'), color: 'text-blue-500' },
                { title: t('دعم العملاء', 'Customer Support'), desc: t('إدارة الطلبات والرد على الرسائل.', 'Manage orders and reply to messages.'), color: 'text-emerald-500' },
                { title: t('متابعة الأداء', 'Viewer'), desc: t('قراءة الإحصائيات والتقارير فقط.', 'Read-only access to stats and reports.'), color: 'text-amber-500' },
              ].map((role, idx) => (
                <div key={idx} className="flex gap-3 bg-background/50 p-3 rounded-xl border border-white/5">
                  <Circle className={`h-4 w-4 mt-0.5 shrink-0 fill-current ${role.color}`} />
                  <div>
                    <h5 className="font-bold text-sm mb-0.5">{role.title}</h5>
                    <p className="text-xs text-muted-foreground">{role.desc}</p>
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
                {[
                  { user: 'فاطمة الزهراء', action: t('قامت بتعديل سعر', 'Updated price of'), item: 'سماعات برو', time: 'منذ 10 دقائق' },
                  { user: 'ياسين بوعلام', action: t('قام بشحن طلب', 'Shipped order'), item: '#ORD-5840', time: 'منذ ساعة' },
                  { user: 'محمد الصالح', action: t('قام بتسجيل الدخول', 'Logged in'), item: '', time: 'منذ 3 ساعات' },
                ].map((act, idx) => (
                  <div key={idx} className="text-sm">
                    <span className="font-bold text-foreground">{act.user}</span>{' '}
                    <span className="text-muted-foreground">{act.action}</span>{' '}
                    <span className="font-semibold text-primary">{act.item}</span>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{act.time}</p>
                  </div>
                ))}
              </div>
              <Button variant="link" className="w-full mt-2 text-xs font-bold text-primary">
                {t('عرض السجل الكامل', 'View Full Log')}
              </Button>
            </CardContent>
          </Card>
        </motion.div>

      </div>
    </motion.div>
  );
}
