import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { UserRole, PageType } from '@/types';

// ============================================
// NOTIFICATION TYPES
// ============================================

export type NotificationCategory = 'order' | 'shipment' | 'verification' | 'system' | 'promotion' | 'wallet' | 'alert';

export interface AppNotification {
  id: string;
  category: NotificationCategory;
  titleAr: string;
  titleEn: string;
  bodyAr: string;
  bodyEn: string;
  isRead: boolean;
  createdAt: string;
  // Quick action
  actionLabelAr: string;
  actionLabelEn: string;
  actionPage: PageType | null;
  actionUrl: string | null; // external URL if any
  // Visual
  iconBg: string;
  urgency: 'low' | 'normal' | 'high' | 'urgent';
}

interface NotificationState {
  notifications: AppNotification[];
  unreadCount: number;
  isOpen: boolean;

  // Actions
  setNotifications: (notifications: AppNotification[]) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearNotification: (id: string) => void;
  clearAll: () => void;
  setOpen: (open: boolean) => void;
  toggleOpen: () => void;
  addNotification: (notification: AppNotification) => void;
  refreshForUser: (role: UserRole, accountStatus: string, isVerified: boolean) => void;
}

// ============================================
// ICON COLORS PER CATEGORY
// ============================================

const iconBgByCategory: Record<NotificationCategory, string> = {
  order: 'bg-blue-100 dark:bg-blue-900/30',
  shipment: 'bg-emerald-100 dark:bg-emerald-900/30',
  verification: 'bg-amber-100 dark:bg-amber-900/30',
  system: 'bg-gray-100 dark:bg-gray-800',
  promotion: 'bg-rose-100 dark:bg-rose-900/30',
  wallet: 'bg-violet-100 dark:bg-violet-900/30',
  alert: 'bg-red-100 dark:bg-red-900/30',
};

// ============================================
// DYNAMIC NOTIFICATION GENERATOR
// ============================================

function generateNotifications(
  role: UserRole,
  accountStatus: string,
  isVerified: boolean
): AppNotification[] {
  const notifications: AppNotification[] = [];
  const now = new Date();

  // ── VERIFICATION NOTIFICATIONS (for non-buyer, non-admin roles) ──
  if (role !== 'buyer' && role !== 'admin') {
    if (accountStatus === 'incomplete') {
      notifications.push({
        id: 'notif-incomplete',
        category: 'verification',
        titleAr: 'توثيق حسابك غير مكتمل',
        titleEn: 'Your account verification is incomplete',
        bodyAr: 'أكمل عملية التوثيق لتفعيل حسابك والبدء في البيع على المنصة',
        bodyEn: 'Complete verification to activate your account and start selling',
        isRead: false,
        createdAt: new Date(now.getTime() - 5 * 60000).toISOString(),
        actionLabelAr: 'استكمال التوثيق',
        actionLabelEn: 'Complete Verification',
        actionPage: 'verification',
        actionUrl: null,
        iconBg: iconBgByCategory.verification,
        urgency: 'high',
      });
    }

    if (accountStatus === 'pending') {
      notifications.push({
        id: 'notif-pending',
        category: 'verification',
        titleAr: 'جاري مراجعة حسابك',
        titleEn: 'Your account is under review',
        bodyAr: 'تم استلام طلب التوثيق وسيتم مراجعته خلال 2-24 ساعة عمل',
        bodyEn: 'Your verification request has been received and will be reviewed within 2-24 hours',
        isRead: false,
        createdAt: new Date(now.getTime() - 2 * 3600000).toISOString(),
        actionLabelAr: 'حالة التوثيق',
        actionLabelEn: 'Verification Status',
        actionPage: 'verification',
        actionUrl: null,
        iconBg: iconBgByCategory.verification,
        urgency: 'normal',
      });
    }

    if (accountStatus === 'rejected') {
      notifications.push({
        id: 'notif-rejected',
        category: 'alert',
        titleAr: 'تم رفض طلب التوثيق',
        titleEn: 'Verification request rejected',
        bodyAr: 'يرجى مراجعة الملاحظات وتصحيح المستندات المطلوبة ثم إعادة التقديم',
        bodyEn: 'Please review the notes, correct the required documents, and resubmit',
        isRead: false,
        createdAt: new Date(now.getTime() - 30 * 60000).toISOString(),
        actionLabelAr: 'إعادة التقديم',
        actionLabelEn: 'Resubmit',
        actionPage: 'verification',
        actionUrl: null,
        iconBg: iconBgByCategory.alert,
        urgency: 'urgent',
      });
    }
  }

  // ── ADMIN NOTIFICATIONS ──
  if (role === 'admin') {
    notifications.push({
      id: 'notif-admin-pending',
      category: 'verification',
      titleAr: 'طلبات توثيق جديدة',
      titleEn: 'New verification requests',
      bodyAr: 'يوجد طلبات توثيق تنتظر مراجعتك في لوحة الإدارة',
      bodyEn: 'There are verification requests awaiting your review in the admin panel',
      isRead: false,
      createdAt: new Date(now.getTime() - 15 * 60000).toISOString(),
      actionLabelAr: 'مراجعة الطلبات',
      actionLabelEn: 'Review Requests',
      actionPage: 'admin',
      actionUrl: null,
      iconBg: iconBgByCategory.verification,
      urgency: 'high',
    });

    notifications.push({
      id: 'notif-admin-system',
      category: 'system',
      titleAr: 'تحديث المنصة',
      titleEn: 'Platform Update',
      bodyAr: 'تم تحديث سياسة التوثيق الجديدة. يرجى الاطلاع على التغييرات',
      bodyEn: 'The new verification policy has been updated. Please review the changes',
      isRead: true,
      createdAt: new Date(now.getTime() - 24 * 3600000).toISOString(),
      actionLabelAr: 'الاطلاع',
      actionLabelEn: 'View',
      actionPage: null,
      actionUrl: null,
      iconBg: iconBgByCategory.system,
      urgency: 'low',
    });
  }

  // ── BUYER NOTIFICATIONS ──
  if (role === 'buyer') {
    notifications.push({
      id: 'notif-buyer-promo',
      category: 'promotion',
      titleAr: 'عرض خاص على الإلكترونيات',
      titleEn: 'Special offer on electronics',
      bodyAr: 'خصم حتى 30% على أفضل المنتجات الإلكترونية لفترة محدودة',
      bodyEn: 'Up to 30% off on the best electronics for a limited time',
      isRead: false,
      createdAt: new Date(now.getTime() - 1 * 3600000).toISOString(),
      actionLabelAr: 'تسوق الآن',
      actionLabelEn: 'Shop Now',
      actionPage: 'buyer',
      actionUrl: null,
      iconBg: iconBgByCategory.promotion,
      urgency: 'normal',
    });

    notifications.push({
      id: 'notif-buyer-wallet',
      category: 'wallet',
      titleAr: 'رصيد المحفظة',
      titleEn: 'Wallet Balance',
      bodyAr: 'رصيد محفظتك الحالي متاح. شارك أصدقائك واحصل على مكافآت',
      bodyEn: 'Your wallet balance is available. Share with friends and earn rewards',
      isRead: true,
      createdAt: new Date(now.getTime() - 3 * 3600000).toISOString(),
      actionLabelAr: 'المحفظة',
      actionLabelEn: 'Wallet',
      actionPage: 'buyer-wallet',
      actionUrl: null,
      iconBg: iconBgByCategory.wallet,
      urgency: 'low',
    });
  }

  // ── SELLER / STORE MANAGER / SUPPLIER NOTIFICATIONS ──
  if (['seller', 'store_manager', 'supplier'].includes(role)) {
    notifications.push({
      id: 'notif-seller-order',
      category: 'order',
      titleAr: 'طلب جديد مستلم',
      titleEn: 'New order received',
      bodyAr: 'لقد تلقيت طلباً جديداً من عميل. قم بتأكيده وبدء التحضير',
      bodyEn: 'You received a new order from a customer. Confirm and start preparing',
      isRead: false,
      createdAt: new Date(now.getTime() - 10 * 60000).toISOString(),
      actionLabelAr: 'عرض الطلب',
      actionLabelEn: 'View Order',
      actionPage: role === 'store_manager' ? 'store-orders' : (role === 'supplier' ? 'supplier-orders' : 'seller-orders'),
      actionUrl: null,
      iconBg: iconBgByCategory.order,
      urgency: 'high',
    });

    if (isVerified) {
      notifications.push({
        id: 'notif-seller-stats',
        category: 'system',
        titleAr: 'تقرير المبيعات الأسبوعي',
        titleEn: 'Weekly sales report',
        bodyAr: 'مبيعاتك هذا الأسبوع جيدة. اطلع على التفاصيل والتحليلات',
        bodyEn: 'Your sales this week are looking good. Check the details and analytics',
        isRead: true,
        createdAt: new Date(now.getTime() - 6 * 3600000).toISOString(),
        actionLabelAr: 'عرض التفاصيل',
        actionLabelEn: 'View Details',
        actionPage: role === 'store_manager' ? 'store-analytics' : 'seller-orders',
        actionUrl: null,
        iconBg: iconBgByCategory.system,
        urgency: 'low',
      });
    }
  }

  // ── LOGISTICS NOTIFICATIONS ──
  if (role === 'logistics') {
    notifications.push({
      id: 'notif-logistics-pickup',
      category: 'shipment',
      titleAr: 'طلب استلام جديد',
      titleEn: 'New pickup request',
      bodyAr: 'يوجد طلب شحن جديد جاهز للاستلام من المستودع',
      bodyEn: 'A new shipment is ready for pickup from the warehouse',
      isRead: false,
      createdAt: new Date(now.getTime() - 5 * 60000).toISOString(),
      actionLabelAr: 'عرض التفاصيل',
      actionLabelEn: 'View Details',
      actionPage: 'logistics-active',
      actionUrl: null,
      iconBg: iconBgByCategory.shipment,
      urgency: 'high',
    });

    notifications.push({
      id: 'notif-logistics-earnings',
      category: 'wallet',
      titleAr: 'أرباح اليوم',
      titleEn: "Today's earnings",
      bodyAr: 'أرباحك اليوم متاحة. راجع التفاصيل واسحب رصيدك',
      bodyEn: "Your earnings for today are available. Review details and withdraw",
      isRead: true,
      createdAt: new Date(now.getTime() - 4 * 3600000).toISOString(),
      actionLabelAr: 'الأرباح',
      actionLabelEn: 'Earnings',
      actionPage: 'logistics-earnings',
      actionUrl: null,
      iconBg: iconBgByCategory.wallet,
      urgency: 'low',
    });
  }

  return notifications;
}

// ============================================
// STORE
// ============================================

export const useNotificationStore = create<NotificationState>()(
  persist(
    (set, get) => ({
      notifications: [],
      unreadCount: 0,
      isOpen: false,

      setNotifications: (notifications) =>
        set({
          notifications,
          unreadCount: notifications.filter((n) => !n.isRead).length,
        }),

      markAsRead: (id) =>
        set((state) => {
          const notifications = state.notifications.map((n) =>
            n.id === id ? { ...n, isRead: true } : n
          );
          return { notifications, unreadCount: notifications.filter((n) => !n.isRead).length };
        }),

      markAllAsRead: () =>
        set((state) => ({
          notifications: state.notifications.map((n) => ({ ...n, isRead: true })),
          unreadCount: 0,
        })),

      clearNotification: (id) =>
        set((state) => {
          const notifications = state.notifications.filter((n) => n.id !== id);
          return { notifications, unreadCount: notifications.filter((n) => !n.isRead).length };
        }),

      clearAll: () => set({ notifications: [], unreadCount: 0 }),

      setOpen: (open) => set({ isOpen: open }),
      toggleOpen: () => set((state) => ({ isOpen: !state.isOpen })),

      addNotification: (notification) =>
        set((state) => {
          const exists = state.notifications.find((n) => n.id === notification.id);
          if (exists) return state;
          const notifications = [notification, ...state.notifications];
          return {
            notifications,
            unreadCount: notifications.filter((n) => !n.isRead).length,
          };
        }),

      refreshForUser: (role, accountStatus, isVerified) => {
        const currentIds = get().notifications.map((n) => n.id);
        const fresh = generateNotifications(role, accountStatus, isVerified);

        // Preserve read state for existing notifications
        const merged = fresh.map((notif) => {
          const existing = get().notifications.find((n) => n.id === notif.id);
          return existing ? { ...notif, isRead: existing.isRead } : notif;
        });

        set({
          notifications: merged,
          unreadCount: merged.filter((n) => !n.isRead).length,
        });
      },
    }),
    {
      name: 'platform-notification-store',
      partialize: (state) => ({
        notifications: state.notifications.map((n) => ({
          ...n,
          isRead: true, // Reset read state on reload
        })),
      }),
    }
  )
);
