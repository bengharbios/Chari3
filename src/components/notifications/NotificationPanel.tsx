'use client';
import React from 'react';

import { useEffect, useMemo, useState } from 'react';
import { useAppStore, useAuthStore } from '@/lib/store';
import { useAdminAuthStore } from '@/lib/store/admin-auth';
import { useSession } from '@/lib/auth-client';
import { useOnboardingStore } from '@/lib/store/onboarding';
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

function NotificationItem({
  notification,
  currentUser,
}: {
  notification: AppNotification;
  currentUser?: { id: string; role?: string } | null;
}) {
  const { t, locale } = useTranslation();
  const isAr = locale === 'ar';
  const { markAsRead, clearNotification, setOpen } = useNotificationStore();
  const { setCurrentPage } = useAppStore();
  const { user: authUser } = useAuthStore();
  const effectiveUserId = currentUser?.id || authUser?.id;
  const router = useRouter();
  const pathname = usePathname();

  const Icon = categoryIcons[notification.category] || Bell;
  const iconColor = categoryIconColors[notification.category] || 'text-gray-600';
  const urgency = urgencyConfig[notification.urgency] || urgencyConfig.normal;

  const handleMarkAsRead = async () => {
    if (notification.isRead) return;
    markAsRead(notification.id);
    if (effectiveUserId && notification.id.startsWith('db-')) {
      const dbId = notification.id.replace('db-', '');
      try {
        await fetch('/api/notifications', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: effectiveUserId, notificationId: dbId })
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

    if (notification.actionUrl) {
      if (notification.actionUrl.startsWith('/')) {
        router.push(notification.actionUrl);
      } else {
        window.open(notification.actionUrl, '_blank');
      }
    } else if (notification.actionPage) {
      const url = `/?view=${notification.actionPage}${targetOrderId ? '&orderId=' + targetOrderId : ''}`;
      if (pathname !== '/') {
        router.push(url);
      } else {
        router.push(url);
        setCurrentPage(notification.actionPage);
      }
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
            {(() => {
              let parsedData: any = {};
              if (notification.data) {
                try {
                  parsedData = JSON.parse(notification.data);
                } catch (e) {}
              }

              // Extract product name if missing from parsedData
              if (!parsedData.productName) {
                const match = notification.bodyAr?.match(/"([^"]+)"/) || notification.bodyEn?.match(/"([^"]+)"/);
                if (match && match[1].trim()) {
                  parsedData.productName = match[1].trim();
                } else if (notification.type === 'new_qa' || notification.type === 'QA_NEW') {
                  parsedData.productName = isAr ? 'المنتج' : (locale === 'fr' ? 'votre produit' : 'your product');
                }
              }

              if (!parsedData.orderNumber) {
                const match = notification.bodyAr?.match(/#(CHARI-[0-9]+)/) || notification.bodyEn?.match(/#(CHARI-[0-9]+)/);
                if (match) parsedData.orderNumber = match[1];
              }

              let normType = notification.type === 'new_qa' ? 'QA_NEW' : (notification.type === 'new_order' ? 'ORDER_NEW' : notification.type);

              // Detect specific shipment types from title/content
              if (notification.type === 'shipment') {
                const tAr = notification.titleAr || '';
                const tEn = (notification.titleEn || '').toLowerCase();
                if (tAr.includes('تأكيد') || tEn.includes('confirmed')) normType = 'SHIPMENT_CONFIRMED';
                else if (tAr.includes('شحن') || tEn.includes('shipped')) normType = 'SHIPMENT_SHIPPED';
                else if (tAr.includes('تسليم') || tEn.includes('delivered')) normType = 'SHIPMENT_DELIVERED';
                else if (tAr.includes('إلغاء') || tEn.includes('cancelled')) normType = 'SHIPMENT_CANCELLED';
              }

              if (normType) {
                const titleKey = `notifications.${normType}.title`;
                const translated = t(titleKey, parsedData);
                if (translated !== titleKey) return translated;
              }
              return isAr ? notification.titleAr : notification.titleEn;
            })()}
          </p>
          {/* Delete button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              clearNotification(notification.id, effectiveUserId);
            }}
            className="opacity-60 md:opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-muted transition-all shrink-0"
            aria-label={t('مسح', 'Delete', 'Supprimer')}
          >
            <Trash2 className="size-3 text-muted-foreground hover:text-destructive" />
          </button>
        </div>

        {/* Body */}
        <p className={cn(
          'text-xs text-muted-foreground line-clamp-2 mt-0.5',
          !notification.isRead && 'text-foreground/60'
        )}>
          {(() => {
            let parsedData: any = {};
            if (notification.data) {
              try {
                parsedData = JSON.parse(notification.data);
              } catch (e) {}
            }

            if (!parsedData.productName) {
              const match = notification.bodyAr?.match(/"([^"]+)"/) || notification.bodyEn?.match(/"([^"]+)"/);
              if (match && match[1].trim()) {
                parsedData.productName = match[1].trim();
              } else if (notification.type === 'new_qa' || notification.type === 'QA_NEW') {
                parsedData.productName = isAr ? 'المنتج' : (locale === 'fr' ? 'votre produit' : 'your product');
              }
            }

            if (!parsedData.orderNumber) {
              const match = notification.bodyAr?.match(/#(CHARI-[0-9]+)/) || notification.bodyEn?.match(/#(CHARI-[0-9]+)/);
              if (match) parsedData.orderNumber = match[1];
            }

            let normType = notification.type === 'new_qa' ? 'QA_NEW' : (notification.type === 'new_order' ? 'ORDER_NEW' : notification.type);

            if (notification.type === 'shipment') {
              const tAr = notification.titleAr || '';
              const tEn = (notification.titleEn || '').toLowerCase();
              if (tAr.includes('تأكيد') || tEn.includes('confirmed')) normType = 'SHIPMENT_CONFIRMED';
              else if (tAr.includes('شحن') || tEn.includes('shipped')) normType = 'SHIPMENT_SHIPPED';
              else if (tAr.includes('تسليم') || tEn.includes('delivered')) normType = 'SHIPMENT_DELIVERED';
              else if (tAr.includes('إلغاء') || tEn.includes('cancelled')) normType = 'SHIPMENT_CANCELLED';
            }

            if (normType) {
              const bodyKey = `notifications.${normType}.body`;
              const translated = t(bodyKey, parsedData);
              if (translated !== bodyKey) return translated;
            }
            return isAr ? notification.bodyAr : notification.bodyEn;
          })()}
        </p>

        {/* Bottom row: Time + Urgency + Action */}
        <div className="flex items-center justify-between gap-2 mt-2">
          <div className="flex items-center gap-2 min-w-0">
            <TimeAgo dateStr={notification.createdAt} />
            {notification.urgency !== 'normal' && <UrgencyBadge urgency={notification.urgency} />}
          </div>

          {/* QUICK ACTION — Unified with 4-language support */}
          {(notification.actionPage || notification.actionUrl) && (
            <span onClick={(e) => e.stopPropagation()} className="shrink-0">
              <QuickActionButton
                labelAr={notification.actionLabelAr}
                labelEn={notification.actionLabelEn}
                labelFr={notification.actionLabelFr}
                labelEs={notification.actionLabelEs}
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
  
  // Resolve user and authentication from both client auth and admin session
  const { user: authUser, isAuthenticated: isAuthAuthenticated } = useAuthStore();
  const { adminUser, isAdminAuthenticated } = useAdminAuthStore();
  const { data: clientSession } = useSession();

  const user = authUser || 
    adminUser || 
    (clientSession?.user ? { id: clientSession.user.id, role: (clientSession.user as any).role, name: clientSession.user.name, email: clientSession.user.email } : null);

  const isAuthenticated = Boolean(isAuthAuthenticated || isAdminAuthenticated || clientSession?.user?.id);
  const isAdmin = user?.role === 'admin' || user?.role === 'SUPER_ADMIN' || user?.role === 'super_admin';

  const { accountStatus } = useOnboardingStore();
  const {
    notifications,
    unreadCount,
    isOpen,
    setOpen,
    markAllAsRead,
    clearAll,
    setNotifications,
  } = useNotificationStore();

  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'unread'>('all');

  // Sync mounted state
  useEffect(() => {
    setMounted(true);
  }, []);

  const fetchDbNotifications = React.useCallback(async () => {
    if (!isAuthenticated || !user?.id) return;

    try {
      const res = await fetch(`/api/notifications?userId=${user.id}&limit=30`);
      if (!res.ok) return;
      const data = await res.json();
      if (!data.success || !data.notifications) return;

      const dbNotifications = data.notifications.map((dbNotif: {
        id: string; title: string; titleEn?: string;
        body: string; bodyEn?: string; type: string;
        isRead: boolean; createdAt: string; data?: string;
      }) => {
        const getCategory = (type: string) => {
          const lowerType = type.toLowerCase();
          if (lowerType.includes('order')) return 'order';
          if (lowerType.includes('shipment')) return 'shipment';
          if (lowerType.includes('verification')) return 'verification';
          if (lowerType.includes('wallet')) return 'wallet';
          if (lowerType.includes('promotion')) return 'promotion';
          if (lowerType.includes('alert')) return 'alert';
          return 'system';
        };

        const cat = getCategory(dbNotif.type);
        const iconBgMap: Record<string, string> = {
          order: 'bg-blue-100 dark:bg-blue-900/30',
          shipment: 'bg-emerald-100 dark:bg-emerald-900/30',
          verification: 'bg-amber-100 dark:bg-amber-900/30',
          system: 'bg-gray-100 dark:bg-gray-800',
          promotion: 'bg-rose-100 dark:bg-rose-900/30',
          wallet: 'bg-violet-100 dark:bg-violet-900/30',
          alert: 'bg-red-100 dark:bg-red-900/30',
        };

        // Determine action label & target dynamically based on role and notification type
        let actionLabelAr = 'عرض التفاصيل';
        let actionLabelEn = 'View Details';
        let actionLabelFr = 'Voir les détails';
        let actionLabelEs = 'Ver detalles';
        let actionPage: string | null = null;
        let actionUrl: string | null = null;
        let urgency = dbNotif.type === 'new_order' ? 'high' : 'normal';

        const isQA = dbNotif.type === 'new_qa' || dbNotif.type === 'QA_NEW';
        const isProductApproval = dbNotif.title.includes('مراجعة والموافقة') || dbNotif.title.includes('pending approval') || dbNotif.title.includes('منتج');

        if (isQA) {
          actionLabelAr = 'الإجابة على السؤال';
          actionLabelEn = 'Answer Question';
          actionLabelFr = 'Répondre à la question';
          actionLabelEs = 'Responder pregunta';
          let prodId = '';
          if (dbNotif.data) {
            try {
              const p = JSON.parse(dbNotif.data);
              if (p.productId) prodId = p.productId;
            } catch (e) {}
          }
          actionUrl = prodId ? `/seller/products?previewId=${prodId}` : '/seller/products';
          actionPage = null;
        } else if (isProductApproval && isAdmin) {
          actionLabelAr = 'مراجعة وقبول المنتجات';
          actionLabelEn = 'Review & Approve Products';
          actionLabelFr = 'Examiner les produits';
          actionLabelEs = 'Revisar productos';
          actionUrl = '/admin-secure-internal/products/approvals';
          actionPage = null;
        } else if (cat === 'verification') {
          if (isAdmin) {
            actionLabelAr = 'عرض طلبات التوثيق';
            actionLabelEn = 'View Verification Requests';
            actionLabelFr = 'Voir les vérifications';
            actionLabelEs = 'Ver solicitudes de verificación';
            actionUrl = '/admin-secure-internal/verifications';
            actionPage = null;
          } else {
            const isEditReq = dbNotif.type === 'VERIFICATION_EDIT_REQUIRED';
            actionLabelAr = isEditReq ? 'تعديل طلب التوثيق' : 'عرض حالة التوثيق';
            actionLabelEn = isEditReq ? 'Edit Verification' : 'View Verification Status';
            actionLabelFr = isEditReq ? 'Modifier la vérification' : 'Voir la vérification';
            actionLabelEs = isEditReq ? 'Editar verificación' : 'Ver verificación';
            actionUrl = '/seller/verification';
            actionPage = null;
          }
        } else if (cat === 'order') {
          actionLabelAr = 'عرض الطلبات';
          actionLabelEn = 'View Orders';
          actionLabelFr = 'Voir les commandes';
          actionLabelEs = 'Ver pedidos';
          actionUrl = '/seller/orders';
          actionPage = null;
        } else if (cat === 'wallet') {
          actionLabelAr = 'عرض المحفظة';
          actionLabelEn = 'View Wallet';
          actionLabelFr = 'Voir le portefeuille';
          actionLabelEs = 'Ver billetera';
          actionUrl = '/seller/wallet';
          actionPage = null;
        } else if (isAdmin) {
          actionLabelAr = 'عرض التنبيه الإداري';
          actionLabelEn = 'View Admin Alert';
          actionLabelFr = 'Voir l\'alerte';
          actionLabelEs = 'Ver alerta';
          actionUrl = '/admin-secure-internal';
          actionPage = null;
        } else {
          actionLabelAr = 'عرض التفاصيل';
          actionLabelEn = 'View Details';
          actionLabelFr = 'Voir les détails';
          actionLabelEs = 'Ver detalles';
          actionUrl = '/seller/dashboard';
          actionPage = null;
        }

        if (dbNotif.data) {
          try {
            const parsed = JSON.parse(dbNotif.data);
            if ('actionPage' in parsed && parsed.actionPage) actionPage = parsed.actionPage;
            if ('actionUrl' in parsed && parsed.actionUrl) actionUrl = parsed.actionUrl;
            if ('link' in parsed && parsed.link) actionUrl = parsed.link;
            if ('actionLabelAr' in parsed) actionLabelAr = parsed.actionLabelAr;
            if ('actionLabelEn' in parsed) actionLabelEn = parsed.actionLabelEn;
            if ('actionLabelFr' in parsed) actionLabelFr = parsed.actionLabelFr;
            if ('actionLabelEs' in parsed) actionLabelEs = parsed.actionLabelEs;
            if ('urgency' in parsed) urgency = parsed.urgency;
          } catch (e) {}
        }

        return {
          id: `db-${dbNotif.id}`,
          category: cat as any,
          titleAr: dbNotif.title,
          titleEn: dbNotif.titleEn || dbNotif.title,
          bodyAr: dbNotif.body,
          bodyEn: dbNotif.bodyEn || dbNotif.body,
          isRead: dbNotif.isRead,
          createdAt: dbNotif.createdAt,
          actionLabelAr,
          actionLabelEn,
          actionLabelFr,
          actionLabelEs,
          actionPage: actionPage as any,
          actionUrl,
          iconBg: iconBgMap[cat] || iconBgMap.system,
          urgency: urgency as any,
          data: dbNotif.data,
          type: dbNotif.type,
        };
      });

      // Inject mock verification notification if needed (for seller/store accounts)
      if (!isAdmin && (accountStatus === 'incomplete' || accountStatus === 'rejected')) {
        const isRejected = accountStatus === 'rejected';
        dbNotifications.unshift({
          id: 'mock-verification-required',
          category: 'verification',
          titleAr: isRejected ? 'الرجاء تصحيح طلب التوثيق' : 'يجب إكمال التوثيق',
          titleEn: isRejected ? 'Please Correct Verification' : 'Verification Required',
          bodyAr: isRejected 
            ? 'تم رفض طلبك السابق. يرجى مراجعة الملاحظات وتحديث المستندات.'
            : 'لن يظهر متجرك للعملاء حتى تقوم بإكمال متطلبات التوثيق',
          bodyEn: isRejected
            ? 'Your previous request was rejected. Please review feedback and update documents.'
            : 'Your store will not be visible to customers until verification is complete',
          isRead: false,
          createdAt: new Date().toISOString(),
          actionLabelAr: isRejected ? 'تحديث المستندات' : 'استكمال التوثيق',
          actionLabelEn: isRejected ? 'Update Documents' : 'Complete Verification',
          actionUrl: '/seller/verification',
          actionPage: null as any,
          iconBg: 'bg-red-100 dark:bg-red-900/30',
          urgency: 'high',
          type: 'VERIFICATION_REQUIRED'
        });
      }

      setNotifications(dbNotifications);
    } catch {
      // Silent fail — notifications are non-blocking
    }
  }, [isAuthenticated, user?.id, user?.role, isAdmin, accountStatus, setNotifications]);

  // Fetch immediately on mount or user change, and poll every 25s when tab is active
  useEffect(() => {
    if (!isAuthenticated || !user?.id) return;

    fetchDbNotifications();

    const interval = setInterval(() => {
      if (typeof document !== 'undefined' && document.visibilityState === 'visible') {
        fetchDbNotifications();
      }
    }, 25000);

    return () => clearInterval(interval);
  }, [isAuthenticated, user?.id, fetchDbNotifications]);

  // Also refetch when dropdown opens to guarantee freshest view
  useEffect(() => {
    if (isOpen && isAuthenticated && user?.id) {
      fetchDbNotifications();
    }
  }, [isOpen, isAuthenticated, user?.id, fetchDbNotifications]);

  // Filter and Sort: filter by active tab, then sort: unread first → by urgency → newest first
  const filteredAndSortedNotifications = useMemo(() => {
    const filtered = activeTab === 'unread' 
      ? notifications.filter(n => !n.isRead) 
      : notifications;

    return [...filtered].sort((a, b) => {
      if (a.isRead !== b.isRead) return a.isRead ? 1 : -1;
      const urgencyOrder = { urgent: 0, high: 1, normal: 2, low: 3 };
      const uA = urgencyOrder[a.urgency] ?? 2;
      const uB = urgencyOrder[b.urgency] ?? 2;
      if (uA !== uB) return uA - uB;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [notifications, activeTab]);

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
                  {t('الإشعارات', 'Notifications', 'Notifications')}
                </h3>
                {unreadCount > 0 && (
                  <Badge variant="secondary" className="text-[10px] px-1.5 py-0 bg-primary/10 text-primary border-0">
                    {unreadCount} {t('جديد', 'New', 'Nouveau')}
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
                    <span>{t('تحديد الكل كمقروء', 'Mark all as read', 'Tout marquer comme lu')}</span>
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
                    <span>{t('مسح الكل', 'Clear all', 'Tout effacer')}</span>
                  </Button>
                )}
              </div>
            </div>

            {/* Tabs Segment Control */}
            <div className="px-4 py-2 border-b border-border bg-muted/10">
              <div className="flex p-0.5 bg-muted/50 rounded-lg gap-0.5">
                <button
                  onClick={() => setActiveTab('all')}
                  className={cn(
                    "flex-1 py-1.5 text-xs font-medium rounded-md transition-all text-center flex items-center justify-center gap-1.5",
                    activeTab === 'all'
                      ? "bg-background text-foreground shadow-sm font-bold"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <span>{t('الكل', 'All', 'Toutes')}</span>
                  <Badge variant="secondary" className={cn(
                    "text-[10px] px-1.5 py-0 border-0 pointer-events-none h-4 min-w-4 flex items-center justify-center p-0",
                    activeTab === 'all' ? "bg-muted text-foreground" : "bg-muted/50 text-muted-foreground"
                  )}>
                    {notifications.length}
                  </Badge>
                </button>
                <button
                  onClick={() => setActiveTab('unread')}
                  className={cn(
                    "flex-1 py-1.5 text-xs font-medium rounded-md transition-all text-center flex items-center justify-center gap-1.5",
                    activeTab === 'unread'
                      ? "bg-background text-foreground shadow-sm font-bold"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <span>{t('غير مقروء', 'Unread', 'Non lues')}</span>
                  {unreadCount > 0 ? (
                    <Badge className="text-[10px] px-1.5 py-0 border-0 bg-primary text-primary-foreground font-bold animate-pulse h-4 min-w-4 flex items-center justify-center p-0">
                      {unreadCount}
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="text-[10px] px-1.5 py-0 border-0 bg-muted/50 text-muted-foreground pointer-events-none h-4 min-w-4 flex items-center justify-center p-0">
                      0
                    </Badge>
                  )}
                </button>
              </div>
            </div>

            {/* Notifications List */}
            {filteredAndSortedNotifications.length > 0 ? (
              <div className="max-h-[400px] overflow-y-auto overflow-x-hidden" dir={isAr ? 'rtl' : 'ltr'}>
                <div className="divide-y divide-border/50 p-2">
                  {filteredAndSortedNotifications.map((notification) => (
                    <NotificationItem key={notification.id} notification={notification} currentUser={user} />
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                <div className="p-3 rounded-full bg-muted mb-3">
                  <Bell className="size-6 text-muted-foreground" />
                </div>
                <p className="text-sm font-medium text-muted-foreground">
                  {activeTab === 'unread' ? t('لا توجد إشعارات غير مقروءة', 'No unread notifications', 'Aucune notification non lue') : t('لا توجد إشعارات', 'No notifications', 'Aucune notification')}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {activeTab === 'unread' 
                    ? t('لقد قرأت كل شيء!', 'You are all caught up!', 'Vous êtes à jour !') 
                    : t('الإشعارات الجديدة ستظهر هنا', 'New notifications will appear here', 'Les nouvelles notifications apparaîtront ici')}
                </p>
              </div>
            )}

            {/* Footer */}
            {notifications.length > 0 && (
              <>
                <Separator />
                <div className="px-4 py-2">
                  <p className="text-[11px] text-muted-foreground text-center">
                    {t('لديك %count% إشعارات إجمالاً، منها %unread% غير مقروءة', { count: notifications.length, unread: unreadCount }, 'You have %count% total notifications, %unread% unread')}
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
