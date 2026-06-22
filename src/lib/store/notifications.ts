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
  data?: string;
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
  // Mock notifications have been removed to prevent confusion for new stores.
  // All real notifications are fetched from /api/notifications.
  return [];
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
