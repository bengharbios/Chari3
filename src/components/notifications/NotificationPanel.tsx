'use client';
import React from 'react';

import { useEffect, useMemo } from 'react';
import { useAppStore, useAuthStore } from '@/lib/store';
import { useNotificationStore, type AppNotification } from '@/lib/store/notifications';
import { useTranslation } from '@/lib/i18n/useTranslation';
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
  translationKey: string;
  badgeClass: string;
  actionVariant: QuickActionVariant;
}> = {
  urgent: {
    translationKey: 'notifications.urgency.urgent',
    badgeClass: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    actionVariant: 'danger',
  },
  high: {
    translationKey: 'notifications.urgency.high',
    badgeClass: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
    actionVariant: 'primary',
  },
  normal: {
    translationKey: 'notifications.urgency.normal',
    badgeClass: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
    actionVariant: 'subtle',
  },
  low: {
    translationKey: 'notifications.urgency.low',
    badgeClass: 'bg-gray-50 text-gray-500 dark:bg-gray-800/50 dark:text-gray-500',
    actionVariant: 'subtle',
  },
};

// ============================================
// URGENCY BADGE
// ============================================

function UrgencyBadge({ urgency }: { urgency: string }) {
  const { t } = useTranslation();
  const c = urgencyConfig[urgency] || urgencyConfig.normal;
  return (
    <Badge variant="secondary" className={cn('text-[10px] px-1.5 py-0 border-0', c.badgeClass)}>
      {t(c.translationKey)}
    </Badge>
  );
}

// ============================================
// TIME AGO
// ============================================

function TimeAgo({ dateStr }: { dateStr: string }) {
  const { t } = useTranslation();
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diffMs = now - then;
  const diffMin = Math.floor(diffMs / 60000);
  const diffHr = Math.floor(diffMs / 3600000);
  const diffDay = Math.floor(diffMs / 86400000);

  let text: string;
  if (diffMin < 1) text = t('notifications.timeAgo.now');
  else if (diffMin < 60) text = t('notifications.timeAgo.minutes', { minutes: diffMin });
  else if (diffHr < 24) text = t('notifications.timeAgo.hours', { hours: diffHr });
  else text = t('notifications.timeAgo.days', { days: diffDay });

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

import { useRouter, usePathname } from 'next/navigation';

function NotificationItem({ notification }: { notification: AppNotification }) {
  const { t, locale } = useTranslation();
  const isAr = locale === 'ar';
  const { markAsRead, clearNotification, setOpen } = useNotificationStore();
  const { setCurrentPage } = useAppStore();
  const { user } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();

  const Icon = categoryIcons[notification.category] || Bell;
  const iconColor = categoryIconColors[notification.category] || 'text-gray-600';
  const urgency = urgencyConfig[notification.urgency] || urgencyConfig.normal;

  const handleMarkAsRead = async () => {
    if (notification.isRead) return;
    markAsRead(notification.id);
    if (user?.id && notification.id.startsWith('db-')) {
      const dbId = notification.id.replace('db-', '');
      try {
        await fetch('/api/notifications', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: user.id, notificationId: dbId })
        });
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleAction = async (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    await handleMarkAsRead();
    setOpen(false);
    
    let targetOrderId = '';
    if (notification.data) {
      try {
        const parsed = JSON.parse(notification.data);
        if (parsed.orderId) targetOrderId = parsed.orderId;
      } catch (err) {}
    }

    if (notification.actionPage) {
      const url = `/?view=${notification.actionPage}${targetOrderId ? '&orderId=' + targetOrderId : ''}`;
      if (pathname !== '/') {
        router.push(url);
      } else {
        router.push(url);
        setCurrentPage(notification.actionPage);
      }
    } else if (notification.actionUrl) {
      window.open(notification.actionUrl, '_blank');
    }
  };

  const handleClick = () => {
    handleAction();
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
              clearNotification(notification.id, user?.id);
            }}
            className="opacity-60 md:opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-muted transition-all shrink-0"
            aria-label={t('notifications.delete')}
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
            <span onClick={(e) => e.stopPropagation()}>
              <QuickActionButton
                labelAr={notification.actionLabelAr}
                labelEn={notification.actionLabelEn}
                variant={urgency.actionVariant}
                onClick={() => handleAction()}
              />
            </span>
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
  const { t, locale } = useTranslation();
  const isAr = locale === 'ar';
  const { user, isAuthenticated } = useAuthStore();
  const {
    notifications,
    unreadCount,
    isOpen,
    setOpen,
    markAllAsRead,
    clearAll,
    refreshForUser,
    addNotification,
  } = useNotificationStore();

  // Refresh role-based notifications when user changes
  useEffect(() => {
    if (!isAuthenticated || !user) return;
    refreshForUser(
      user.role,
      user.accountStatus || 'incomplete',
      user.isVerified
    );
  }, [isAuthenticated, user?.id, user?.accountStatus, user?.isVerified, refreshForUser]);

  // Poll DB notifications every 30 seconds and merge with local
  useEffect(() => {
    if (!isAuthenticated || !user?.id) return;

    const fetchDbNotifications = async () => {
      try {
        const res = await fetch(`/api/notifications?userId=${user.id}&limit=20`);
        if (!res.ok) return;
        const data = await res.json();
        if (!data.success || !data.notifications) return;

        data.notifications.forEach((dbNotif: {
          id: string; title: string; titleEn?: string;
          body: string; bodyEn?: string; type: string;
          isRead: boolean; createdAt: string; data?: string;
        }) => {
          const typeToCategory: Record<string, string> = {
            new_order: 'order', shipment: 'shipment',
            verification: 'verification', wallet: 'wallet',
            promotion: 'promotion', alert: 'alert',
          };
          const cat = typeToCategory[dbNotif.type] || 'system';
          const iconBgMap: Record<string, string> = {
            order: 'bg-blue-100 dark:bg-blue-900/30',
            shipment: 'bg-emerald-100 dark:bg-emerald-900/30',
            verification: 'bg-amber-100 dark:bg-amber-900/30',
            system: 'bg-gray-100 dark:bg-gray-800',
            promotion: 'bg-rose-100 dark:bg-rose-900/30',
            wallet: 'bg-violet-100 dark:bg-violet-900/30',
            alert: 'bg-red-100 dark:bg-red-900/30',
          };

          addNotification({
            id: `db-${dbNotif.id}`,
            category: cat as any,
            titleAr: dbNotif.title,
            titleEn: dbNotif.titleEn || dbNotif.title,
            bodyAr: dbNotif.body,
            bodyEn: dbNotif.bodyEn || dbNotif.body,
            isRead: dbNotif.isRead,
            createdAt: dbNotif.createdAt,
            actionLabelAr: 'عرض الطلبات',
            actionLabelEn: 'View Orders',
            actionPage: user.role === 'store_manager' ? 'store-orders' : 'seller-orders',
            actionUrl: null,
            iconBg: iconBgMap[cat] || iconBgMap.system,
            urgency: dbNotif.type === 'new_order' ? 'high' : 'normal',
            data: dbNotif.data,
          });
        });
      } catch {
        // Silent fail — notifications are not critical
      }
    };

    fetchDbNotifications(); // fetch immediately
    const interval = setInterval(fetchDbNotifications, 30000); // every 30s
    return () => clearInterval(interval);
  }, [isAuthenticated, user?.id, addNotification]);

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

          <div
            dir={isAr ? 'rtl' : 'ltr'}
            className={cn(
              'fixed sm:absolute top-16 sm:top-full mt-0 sm:mt-2 z-[100] w-[calc(100vw-2rem)] sm:w-[380px]',
              'left-1/2 -translate-x-1/2 sm:translate-x-0',
              'sm:end-0 sm:start-auto', // Use logical properties for better RTL handling
              'bg-background border border-border rounded-xl shadow-xl',
              'animate-in fade-in-0 zoom-in-95 slide-in-from-top-2'
            )}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold">
                  {t('notifications.title')}
                </h3>
                {unreadCount > 0 && (
                  <Badge variant="secondary" className="text-[10px] px-1.5 py-0 bg-primary/10 text-primary border-0">
                    {unreadCount} {t('notifications.new')}
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-1">
                {unreadCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs text-primary hover:text-primary hover:bg-primary/10 gap-1"
                    onClick={() => {
                      markAllAsRead();
                      if (user?.id) {
                        fetch('/api/notifications', {
                          method: 'PATCH',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ userId: user.id, markAllRead: true })
                        }).catch(console.error);
                      }
                    }}
                  >
                    <CheckCheck className="size-3.5" />
                    <span>{t('notifications.readAll')}</span>
                  </Button>
                )}
                {notifications.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs text-muted-foreground hover:text-destructive hover:bg-destructive/10 gap-1"
                    onClick={() => clearAll(user?.id)}
                  >
                    <Trash2 className="size-3.5" />
                    <span>{t('notifications.clearAll')}</span>
                  </Button>
                )}
              </div>
            </div>

            {/* Notifications List */}
            {sortedNotifications.length > 0 ? (
              <div className="max-h-[400px] overflow-y-auto overflow-x-hidden" dir={isAr ? 'rtl' : 'ltr'}>
                <div className="divide-y divide-border/50 p-2">
                  {sortedNotifications.map((notification) => (
                    <NotificationItem key={notification.id} notification={notification} />
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                <div className="p-3 rounded-full bg-muted mb-3">
                  <Bell className="size-6 text-muted-foreground" />
                </div>
                <p className="text-sm font-medium text-muted-foreground">
                  {t('notifications.noNotifications')}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {t('notifications.newNotificationsWillAppear')}
                </p>
              </div>
            )}

            {/* Footer */}
            {notifications.length > 0 && (
              <>
                <Separator />
                <div className="px-4 py-2">
                  <p className="text-[11px] text-muted-foreground text-center">
                    {t('notifications.countTemplate', { count: notifications.length, unread: unreadCount })}
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
