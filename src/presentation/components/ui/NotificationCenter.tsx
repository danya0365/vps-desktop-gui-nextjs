"use client";

import { useNotificationStore, type Notification, type NotificationType } from "@/src/presentation/stores/notificationStore";
import { animated, useSpring } from "@react-spring/web";
import { useState } from "react";

export function NotificationCenter() {
  const [isOpen, setIsOpen] = useState(false);
  const { notifications, unreadCount, markAsRead, markAllAsRead, removeNotification, clearAll } = useNotificationStore();

  const panelSpring = useSpring({
    opacity: isOpen ? 1 : 0,
    transform: isOpen ? "translateY(0px) scale(1)" : "translateY(-10px) scale(0.95)",
    config: { tension: 300, friction: 20 },
  });

  const getTypeIcon = (type: NotificationType) => {
    switch (type) {
      case "info":
        return "ℹ️";
      case "success":
        return "✅";
      case "warning":
        return "⚠️";
      case "error":
        return "❌";
    }
  };

  const getTypeColor = (type: NotificationType) => {
    switch (type) {
      case "info":
        return "bg-blue-500/10 border-blue-500/20";
      case "success":
        return "bg-green-500/10 border-green-500/20";
      case "warning":
        return "bg-yellow-500/10 border-yellow-500/20";
      case "error":
        return "bg-red-500/10 border-red-500/20";
    }
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  return (
    <div className="relative">
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        aria-label="Notifications"
      >
        <svg className="w-5 h-5 text-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-error text-white text-xs font-bold rounded-full flex items-center justify-center">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />

          {/* Panel */}
          <animated.div
            style={panelSpring}
            className="absolute right-0 top-full mt-2 w-96 max-h-[480px] overflow-hidden rounded-2xl bg-white dark:bg-gray-900 border border-border shadow-2xl z-50"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h3 className="font-semibold text-foreground">Notifications</h3>
              <div className="flex gap-2">
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-xs text-primary hover:underline"
                  >
                    Mark all read
                  </button>
                )}
                {notifications.length > 0 && (
                  <button
                    onClick={clearAll}
                    className="text-xs text-muted hover:text-foreground"
                  >
                    Clear all
                  </button>
                )}
              </div>
            </div>

            {/* Notifications List */}
            <div className="max-h-[380px] overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="py-12 text-center">
                  <div className="text-4xl mb-2">🔔</div>
                  <p className="text-muted">No notifications</p>
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {notifications.map((notification) => (
                    <NotificationItem
                      key={notification.id}
                      notification={notification}
                      onRead={() => markAsRead(notification.id)}
                      onRemove={() => removeNotification(notification.id)}
                      getTypeIcon={getTypeIcon}
                      getTypeColor={getTypeColor}
                      formatTime={formatTime}
                    />
                  ))}
                </div>
              )}
            </div>
          </animated.div>
        </>
      )}
    </div>
  );
}

function NotificationItem({
  notification,
  onRead,
  onRemove,
  getTypeIcon,
  getTypeColor,
  formatTime,
}: {
  notification: Notification;
  onRead: () => void;
  onRemove: () => void;
  getTypeIcon: (type: NotificationType) => string;
  getTypeColor: (type: NotificationType) => string;
  formatTime: (date: Date) => string;
}) {
  return (
    <div
      className={`flex gap-3 p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer ${
        !notification.read ? "bg-primary/5" : ""
      }`}
      onClick={onRead}
    >
      <div className={`flex-shrink-0 w-10 h-10 rounded-xl ${getTypeColor(notification.type)} flex items-center justify-center border`}>
        <span className="text-lg">{getTypeIcon(notification.type)}</span>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="font-medium text-foreground text-sm">{notification.title}</div>
          <button
            onClick={(e) => { e.stopPropagation(); onRemove(); }}
            className="text-muted hover:text-foreground flex-shrink-0"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <p className="text-sm text-muted mt-0.5 line-clamp-2">{notification.message}</p>
        <div className="flex items-center gap-2 mt-1">
          {notification.serverName && (
            <span className="text-xs text-primary">{notification.serverName}</span>
          )}
          <span className="text-xs text-muted">{formatTime(notification.timestamp)}</span>
        </div>
      </div>
      {!notification.read && (
        <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-2" />
      )}
    </div>
  );
}

// Toast Component for showing temporary notifications
export function Toast({
  notification,
  onClose,
}: {
  notification: Notification;
  onClose: () => void;
}) {
  const spring = useSpring({
    from: { opacity: 0, transform: "translateX(100%)" },
    to: { opacity: 1, transform: "translateX(0%)" },
  });

  const getTypeColor = (type: NotificationType) => {
    switch (type) {
      case "info":
        return "border-l-blue-500";
      case "success":
        return "border-l-green-500";
      case "warning":
        return "border-l-yellow-500";
      case "error":
        return "border-l-red-500";
    }
  };

  return (
    <animated.div
      style={spring}
      className={`bg-white dark:bg-gray-900 rounded-lg shadow-xl border border-border border-l-4 ${getTypeColor(notification.type)} p-4 min-w-80 max-w-md`}
    >
      <div className="flex items-start gap-3">
        <div className="flex-1">
          <div className="font-medium text-foreground text-sm">{notification.title}</div>
          <p className="text-sm text-muted mt-0.5">{notification.message}</p>
        </div>
        <button onClick={onClose} className="text-muted hover:text-foreground">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </animated.div>
  );
}
