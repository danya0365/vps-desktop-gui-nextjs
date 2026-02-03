import { create } from "zustand";

export type NotificationType = "info" | "success" | "warning" | "error";

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  serverId?: string;
  serverName?: string;
}

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (notification: Omit<Notification, "id" | "timestamp" | "read">) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  removeNotification: (id: string) => void;
  clearAll: () => void;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [
    {
      id: "1",
      type: "warning",
      title: "High CPU Usage",
      message: "Production Web Server CPU is at 92%",
      timestamp: new Date(Date.now() - 5 * 60 * 1000),
      read: false,
      serverName: "Production Web Server",
    },
    {
      id: "2",
      type: "success",
      title: "Backup Completed",
      message: "Daily backup completed successfully",
      timestamp: new Date(Date.now() - 30 * 60 * 1000),
      read: false,
      serverName: "Database Server",
    },
    {
      id: "3",
      type: "info",
      title: "System Update Available",
      message: "Ubuntu 22.04.4 LTS is available for update",
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      read: true,
      serverName: "Dev Server",
    },
    {
      id: "4",
      type: "error",
      title: "Connection Failed",
      message: "Failed to connect to backup storage",
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
      read: true,
      serverName: "Backup Server",
    },
  ],
  unreadCount: 2,

  addNotification: (notification) => {
    const newNotification: Notification = {
      ...notification,
      id: `notif-${Date.now()}`,
      timestamp: new Date(),
      read: false,
    };
    set((state) => ({
      notifications: [newNotification, ...state.notifications],
      unreadCount: state.unreadCount + 1,
    }));
  },

  markAsRead: (id) => {
    set((state) => {
      const notification = state.notifications.find((n) => n.id === id);
      if (notification && !notification.read) {
        return {
          notifications: state.notifications.map((n) =>
            n.id === id ? { ...n, read: true } : n
          ),
          unreadCount: Math.max(0, state.unreadCount - 1),
        };
      }
      return state;
    });
  },

  markAllAsRead: () => {
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, read: true })),
      unreadCount: 0,
    }));
  },

  removeNotification: (id) => {
    set((state) => {
      const notification = state.notifications.find((n) => n.id === id);
      return {
        notifications: state.notifications.filter((n) => n.id !== id),
        unreadCount: notification && !notification.read
          ? Math.max(0, state.unreadCount - 1)
          : state.unreadCount,
      };
    });
  },

  clearAll: () => {
    set({ notifications: [], unreadCount: 0 });
  },
}));
