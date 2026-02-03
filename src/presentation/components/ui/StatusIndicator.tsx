"use client";

import { animated, useSpring } from "@react-spring/web";

type StatusType = "online" | "offline" | "maintenance" | "error";

interface StatusIndicatorProps {
  status: StatusType;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  pulse?: boolean;
  className?: string;
}

const statusConfig = {
  online: {
    label: "Online",
    className: "status-online",
    color: "var(--color-online)",
  },
  offline: {
    label: "Offline",
    className: "status-offline",
    color: "var(--color-offline)",
  },
  maintenance: {
    label: "Maintenance",
    className: "status-maintenance",
    color: "var(--color-maintenance)",
  },
  error: {
    label: "Error",
    className: "status-error",
    color: "var(--color-server-error)",
  },
};

/**
 * StatusIndicator
 * Status dot with pulse animation for server status
 */
export function StatusIndicator({
  status,
  size = "md",
  showLabel = false,
  pulse = true,
  className = "",
}: StatusIndicatorProps) {
  const config = statusConfig[status];

  // Pulse animation for active statuses
  const pulseSpring = useSpring({
    from: { transform: "scale(1)", opacity: 1 },
    to: async (next) => {
      if (pulse && (status === "online" || status === "error")) {
        while (true) {
          await next({ transform: "scale(1.2)", opacity: 0.7 });
          await next({ transform: "scale(1)", opacity: 1 });
        }
      }
    },
    config: { duration: 1500 },
  });

  const sizeClasses = {
    sm: "w-2 h-2",
    md: "w-2.5 h-2.5",
    lg: "w-3 h-3",
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="relative">
        {/* Pulse ring */}
        {pulse && (status === "online" || status === "error") && (
          <animated.div
            style={pulseSpring}
            className={`absolute inset-0 rounded-full ${sizeClasses[size]}`}
            aria-hidden="true"
          >
            <div
              className={`w-full h-full rounded-full`}
              style={{ background: config.color, opacity: 0.4 }}
            />
          </animated.div>
        )}
        {/* Actual indicator */}
        <div
          className={`status-indicator ${sizeClasses[size]} ${config.className}`}
          role="status"
          aria-label={config.label}
        />
      </div>
      {showLabel && (
        <span className="text-sm text-gray-600 dark:text-gray-400 capitalize">
          {config.label}
        </span>
      )}
    </div>
  );
}
