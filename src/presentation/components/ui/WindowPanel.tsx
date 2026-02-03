"use client";

import { animated, useSpring } from "@react-spring/web";
import { useState, type ReactNode } from "react";

interface WindowPanelProps {
  children: ReactNode;
  title?: string;
  icon?: ReactNode;
  className?: string;
  collapsible?: boolean;
  defaultCollapsed?: boolean;
  actions?: ReactNode;
}

/**
 * WindowPanel
 * Window-like panel with title bar and optional collapse functionality
 */
export function WindowPanel({
  children,
  title,
  icon,
  className = "",
  collapsible = false,
  defaultCollapsed = false,
  actions,
}: WindowPanelProps) {
  const [collapsed, setCollapsed] = useState(defaultCollapsed);
  const [hovered, setHovered] = useState(false);

  const contentSpring = useSpring({
    height: collapsed ? 0 : "auto",
    opacity: collapsed ? 0 : 1,
    config: { tension: 300, friction: 26 },
  });

  const panelSpring = useSpring({
    transform: hovered ? "translateY(-2px)" : "translateY(0px)",
    boxShadow: hovered
      ? "0 16px 48px rgba(0, 0, 0, 0.1)"
      : "0 8px 32px rgba(0, 0, 0, 0.06)",
    config: { tension: 400, friction: 26 },
  });

  const chevronSpring = useSpring({
    transform: collapsed ? "rotate(-90deg)" : "rotate(0deg)",
    config: { tension: 400, friction: 20 },
  });

  return (
    <animated.div
      style={panelSpring}
      className={`macos-window overflow-hidden ${className}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Title Bar */}
      {title && (
        <div className="macos-titlebar justify-between">
          <div className="flex items-center gap-3">
            {icon && (
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                {icon}
              </div>
            )}
            <h3 className="text-sm font-semibold text-foreground">{title}</h3>
          </div>

          <div className="flex items-center gap-2">
            {actions}
            {collapsible && (
              <button
                onClick={() => setCollapsed(!collapsed)}
                className="w-6 h-6 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 flex items-center justify-center transition-colors"
                aria-label={collapsed ? "Expand" : "Collapse"}
              >
                <animated.svg
                  style={chevronSpring}
                  className="w-4 h-4 text-gray-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </animated.svg>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Content */}
      <animated.div
        style={collapsible ? contentSpring : undefined}
        className="bg-surface overflow-hidden"
      >
        <div className="p-6">{children}</div>
      </animated.div>
    </animated.div>
  );
}
