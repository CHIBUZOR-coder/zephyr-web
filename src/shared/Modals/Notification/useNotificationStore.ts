// src/store/useNotificationStore.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";

export type NotifyType = "success" | "error" | "info";
export type NotifyCategory =
  | "deposit"
  | "withdrawal"
  | "risk"
  | "vault"
  | "general";

export interface NotificationItem {
  id: number;
  title: string;
  message: string;
  type: NotifyType;
  category: NotifyCategory; // 👈 tells the icon which kind it is
  timestamp: number;
  read: boolean;
}

interface NotificationStore {
  notifications: NotificationItem[];
  addNotification: (
    title: string,
    message: string,
    type?: NotifyType,
    category?: NotifyCategory, // 👈 optional, defaults to 'general'
  ) => void;
  markAsRead: (id: number) => void;
  markAllAsRead: () => void;
  clearRead: () => void;
  unreadCount: () => number;
}

export const useNotificationStore = create<NotificationStore>()(
  persist(
    (set, get) => ({
      notifications: [],

      addNotification: (title, message, type = "info", category = "general") =>
        set((state) => ({
          notifications: [
            {
              id: Date.now(),
              title,
              message,
              type,
              category,
              timestamp: Date.now(),
              read: false,
            },
            ...state.notifications,
          ],
        })),

      markAsRead: (id) =>
        set((state) => ({
          notifications: state.notifications.map((n) =>
            n.id === id ? { ...n, read: true } : n,
          ),
        })),

      markAllAsRead: () =>
        set((state) => ({
          notifications: state.notifications.map((n) => ({ ...n, read: true })),
        })),

      clearRead: () =>
        set((state) => ({
          notifications: state.notifications.filter((n) => !n.read),
        })),

      unreadCount: () => get().notifications.filter((n) => !n.read).length,
    }),
    {
      name: "notifications",
      partialize: (state) => ({ notifications: state.notifications }),
    },
  ),
);
