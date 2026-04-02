'use client';

import { useEffect, useMemo } from 'react';
import { useAppStore, useAuthStore } from '@/lib/store';
import { useNotificationStore, type AppNotification } from '@/lib/store/notifications';
import {
  Bell, Package, Truck, ShieldCheck, Info, Tag, Wallet, AlertTriangle,
  CheckCheck, Trash2, Clock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import QuickActionButton, { type QuickActionVariant } from '@/components/shared/QuickActionButton';

// ============================================
// CATEGORY ICON MAP
// ============================================

const categoryIcons: Record<string, React.ElementType> = {
  order: Package,
  shipment: Truck,
  verification: ShieldCheck,
  system: Info,
  promotion: Tag,
  wallet: Wallet,
  alert: AlertTriangle,
};

const categoryIconColors: Record<string, string> = {
  order: 'text-blue-600 dark:text-blue-400',
  shipment: 'text-emerald-600 dark:text-emerald-400',
  verification: 'text-amber-600 dark:text-amber-400',
  system: 'text-gray-600 dark:text-gray-400',
  promotion: 'text-rose-600 dark:text-rose-400',
  wallet: 'text-violet-600 dark:text-violet-400',
  alert: 'text-red-600 dark:text-red-400',
};

// ============================================
// URGENCY CONFIG
// ============================================

const urgencyConfig: Record<string, {
  labelAr: string;
  labelEn: string;
  badgeClass: string;
  actionVariant: QuickActionVariant;
}> = {
  urgent: {
    labelAr: 'عاجل',
    labelEn: 'Urgent',
    badgeClass: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    actionVariant: 'danger',
  },
  high: {
    labelAr: 'مهم',
    labelEn: 'Important',
    badgeClass: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
    actionVariant: 'primary',
  },
  normal: {
    labelAr: 'عادي',
    labelEn: 'Normal',
    badgeClass: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
    actionVariant: 'subtle',
  },
  low: {
    labelAr: 'معلومات',
    labelEn: 'Info',
    badgeClass: 'bg-gray-50 text-gray-500 dark:bg-gray-800/50 dark:text-gray-500',
    actionVariant: 'subtle',
  },
};

// ============================================
// URGENCY BADGE
// ============================================

function UrgencyBadge({ urgency }: { urgency: string }) {
  const isAr = useAppStore((s) => s.locale === 'ar');
  const c = urgencyConfig[urgency] || urgencyConfig.normal;
  return (
    <Badge variant="secondary" className={cn('text-[10px] px-1.5 py-0 border-0', c.badgeClass)}>
      {isAr ? c.labelAr : c.labelEn}
    </Badge>
  );
}

// ============================================
// TIME AGO
// ============================================

function TimeAgo({ dateStr }: { dateStr: string }) {
  const isAr = useAppStore((s) => s.locale === 'ar');
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diffMs = now - then;
  const diffMin = Math.floor(diffMs / 60000);
  const diffHr = Math.floor(diffMs / 3600000);
  const diffDay = Math.floor(diffMs / 86400000);

  let text: string;
  if (diffMin < 1) text = isAr ? 'الآن' : 'Now';
  else if (diffMin < 60) text = isAr ? `منذ ${diffMin} دقيقة` : `${diffMin}m ago`;
  else if (diffHr < 24) text = isAr ? `منذ ${diffHr} ساعة` : `${diffHr}h ago`;
  else text = isAr ? `منذ ${diffDay} يوم` : `${diffDay}d ago`;

  return (
    <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
      <Clock className="size-3 shrink-0" />
      {text}
    </span>
  );
}

// ============================================
// NOTIFICATION ITEM
// ============================================

function NotificationItem({ notification }: { notification: AppNotification }) {
  const isAr = useAppStore((s) => s.locale === 'ar');
  const { markAsRead, clearNotification } = useNotificationStore();
  const { setCurrentPage } = useAppStore();

  const Icon = categoryIcons[notification.category] || Bell;
  const iconColor = categoryIconColors[notification.category] || 'text-gray-600';
  const urgency = urgencyConfig[notification.urgency] || urgencyConfig.normal;

  const handleAction = () => {
    markAsRead(notification.id);
    if (notification.actionPage) {
      setCurrentPage(notification.actionPage);
    }
  };

  const handleClick = () => {
    if (!notification.isRead) {
      markAsRead(notification.id);
    }
  };

  return (
    <div
      className={cn(
        'group relative flex gap-3 p-3 rounded-lg transition-all duration-200 cursor-pointer',
        'hover:bg-muted/50',
        !notification.isRead && 'bg-primary/[0.03] hover:bg-primary/[0.06]',
        notification.urgency === 'urgent' && !notification.isRead && 'border border-destructive/20'
      )}
      onClick={handleClick}
    >
      {/* Unread dot — logical start (right in RTL, left in LTR) */}
      {!notification.isRead && (
        <div className="absolute top-3 start-3 size-2 rounded-full bg-primary" />
      )}

      {/* Category Icon */}
      <div className={cn('p-2 rounded-full shrink-0 self-start', notification.iconBg)}>
        <Icon className={cn('size-4', iconColor)} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 text-start">
        {/* Title row */}
        <div className="flex items-start justify-between gap-2">
          <p className={cn(
            'text-sm font-medium line-clamp-1',
            !notification.isRead ? 'text-foreground' : 'text-foreground/80'
          )}>
            {isAr ? notification.titleAr : notification.titleEn}
          </p>
          {/* Delete button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              clearNotification(notification.id);
            }}
            className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-muted transition-all shrink-0"
            aria-label={isAr ? 'حذف' : 'Delete'}
          >
            <Trash2 className="size-3 text-muted-foreground hover:text-destructive" />
          </button>
        </div>

        {/* Body */}
        <p className={cn(
          'text-xs text-muted-foreground line-clamp-2 mt-0.5',
          !notification.isRead && 'text-foreground/60'
        )}>
          {isAr ? notification.bodyAr : notification.bodyEn}
        </p>

        {/* Bottom row: Time + Urgency + Action */}
        <div className="flex items-center justify-between gap-2 mt-2">
          <div className="flex items-center gap-2">
            <TimeAgo dateStr={notification.createdAt} />
            {notification.urgency !== 'normal' && <UrgencyBadge urgency={notification.urgency} />}
          </div>

          {/* QUICK ACTION — Unified */}
          {(notification.actionPage || notification.actionUrl) && (
            <QuickActionButton
              labelAr={notification.actionLabelAr}
              labelEn={notification.actionLabelEn}
              variant={urgency.actionVariant}
              onClick={(e) => {
                e.stopPropagation();
                handleAction();
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================
// NOTIFICATION PANEL
// ============================================

export default function NotificationPanel() {
  const isAr = useAppStore((s) => s.locale === 'ar');
  const { user, isAuthenticated } = useAuthStore();
  const {
    notifications,
    unreadCount,
    isOpen,
    setOpen,
    markAllAsRead,
    clearAll,
    refreshForUser,
  } = useNotificationStore();

  // Refresh notifications when user changes
  useEffect(() => {
    if (!isAuthenticated || !user) return;
    refreshForUser(
      user.role,
      user.accountStatus || 'incomplete',
      user.isVerified
    );
  }, [isAuthenticated, user?.id, user?.accountStatus, user?.isVerified, refreshForUser]);

  // Sort: unread first → by urgency → newest first
  const sortedNotifications = useMemo(() => {
    return [...notifications].sort((a, b) => {
      if (a.isRead !== b.isRead) return a.isRead ? 1 : -1;
      const urgencyOrder = { urgent: 0, high: 1, normal: 2, low: 3 };
      const uA = urgencyOrder[a.urgency] ?? 2;
      const uB = urgencyOrder[b.urgency] ?? 2;
      if (uA !== uB) return uA - uB;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [notifications]);

  if (!isAuthenticated) return null;

  return (
    <div className="relative">
      {/* Bell Trigger */}
      <Button
        variant="ghost"
        size="icon"
        className="relative"
        onClick={() => setOpen(!isOpen)}
      >
        <Bell className="size-5" />
        {unreadCount > 0 && (
          <Badge className="absolute -top-1 -end-1 h-5 min-w-5 rounded-full p-0 flex items-center justify-center text-[10px] bg-destructive text-white border-2 border-background animate-pulse">
            {unreadCount > 99 ? '99+' : unreadCount}
          </Badge>
        )}
      </Button>

      {/* Panel Dropdown */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />

          {/* Panel */}
          <div
            dir={isAr ? 'rtl' : 'ltr'}
            className={cn(
              'absolute top-full mt-2 end-0 z-50 w-[380px] max-w-[calc(100vw-2rem)]',
              'bg-background border border-border rounded-xl shadow-xl',
              'animate-in fade-in-0 zoom-in-95 slide-in-from-top-2'
            )}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold">
                  {isAr ? 'الإشعارات' : 'Notifications'}
                </h3>
                {unreadCount > 0 && (
                  <Badge variant="secondary" className="text-[10px] px-1.5 py-0 bg-primary/10 text-primary border-0">
                    {unreadCount} {isAr ? 'جديد' : 'new'}
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-1">
                {unreadCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs text-primary hover:text-primary hover:bg-primary/10 gap-1"
                    onClick={markAllAsRead}
                  >
                    <CheckCheck className="size-3.5" />
                    <span>{isAr ? 'قراءة الكل' : 'Read all'}</span>
                  </Button>
                )}
                {notifications.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs text-muted-foreground hover:text-destructive hover:bg-destructive/10 gap-1"
                    onClick={clearAll}
                  >
                    <Trash2 className="size-3.5" />
                    <span>{isAr ? 'مسح الكل' : 'Clear all'}</span>
                  </Button>
                )}
              </div>
            </div>

            {/* Notifications List */}
            {sortedNotifications.length > 0 ? (
              <ScrollArea className="max-h-[400px]" dir={isAr ? 'rtl' : 'ltr'}>
                <div className="divide-y divide-border/50 p-2" dir={isAr ? 'rtl' : 'ltr'}>
                  {sortedNotifications.map((notification) => (
                    <NotificationItem key={notification.id} notification={notification} />
                  ))}
                </div>
              </ScrollArea>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                <div className="p-3 rounded-full bg-muted mb-3">
                  <Bell className="size-6 text-muted-foreground" />
                </div>
                <p className="text-sm font-medium text-muted-foreground">
                  {isAr ? 'لا توجد إشعارات' : 'No notifications'}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {isAr ? 'ستظهر الإشعارات الجديدة هنا' : 'New notifications will appear here'}
                </p>
              </div>
            )}

            {/* Footer */}
            {notifications.length > 0 && (
              <>
                <Separator />
                <div className="px-4 py-2">
                  <p className="text-[11px] text-muted-foreground text-center">
                    {isAr
                      ? `${notifications.length} إشعار • ${unreadCount} غير مقروء`
                      : `${notifications.length} notifications • ${unreadCount} unread`}
                  </p>
                </div>
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
}
