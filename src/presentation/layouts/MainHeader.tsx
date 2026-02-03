"use client";

import { NotificationCenter } from "@/src/presentation/components/ui/NotificationCenter";
import { ThemeToggle } from "@/src/presentation/components/ui/ThemeToggle";
import { animated, useSpring } from "@react-spring/web";
import { useState } from "react";

interface MainHeaderProps {
  title?: string;
}

/**
 * MainHeader
 * MacOS-style window title bar with traffic light buttons
 * Following Clean Architecture - Presentation layer
 */
export function MainHeader({ title = "VPS Desktop" }: MainHeaderProps) {
  const [trafficActive, setTrafficActive] = useState(true);

  // Animated title spring
  const titleSpring = useSpring({
    from: { opacity: 0, y: -10 },
    to: { opacity: 1, y: 0 },
    config: { tension: 280, friction: 24 },
  });

  return (
    <header
      className="macos-titlebar sticky top-0 z-50"
      onMouseEnter={() => setTrafficActive(true)}
      onMouseLeave={() => setTrafficActive(true)}
    >
      {/* Traffic Light Buttons */}
      <div className={`traffic-lights ${!trafficActive ? "traffic-lights-inactive" : ""}`}>
        <TrafficLight type="close" active={trafficActive} />
        <TrafficLight type="minimize" active={trafficActive} />
        <TrafficLight type="maximize" active={trafficActive} />
      </div>

      {/* Title - Centered */}
      <animated.div
        style={titleSpring}
        className="flex-1 text-center"
      >
        <h1 className="text-sm font-medium text-gray-600 dark:text-gray-400">
          {title}
        </h1>
      </animated.div>

      {/* Right Actions */}
      <div className="flex items-center gap-2">
        <NotificationCenter />
        <ThemeToggle />
      </div>
    </header>
  );
}

interface TrafficLightProps {
  type: "close" | "minimize" | "maximize";
  active: boolean;
}

function TrafficLight({ type, active }: TrafficLightProps) {
  const [hovered, setHovered] = useState(false);

  const spring = useSpring({
    transform: hovered ? "scale(1.15)" : "scale(1)",
    config: { tension: 400, friction: 25 },
  });

  const getClassName = () => {
    const baseClass = "traffic-light";
    if (!active) return baseClass;
    switch (type) {
      case "close":
        return `${baseClass} traffic-light-close`;
      case "minimize":
        return `${baseClass} traffic-light-minimize`;
      case "maximize":
        return `${baseClass} traffic-light-maximize`;
    }
  };

  const getIcon = () => {
    if (!hovered || !active) return null;
    switch (type) {
      case "close":
        return (
          <svg className="w-1.5 h-1.5 text-red-900" viewBox="0 0 12 12" fill="currentColor">
            <path d="M2.5 2.5l7 7m0-7l-7 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        );
      case "minimize":
        return (
          <svg className="w-1.5 h-1.5 text-yellow-900" viewBox="0 0 12 12" fill="currentColor">
            <path d="M2 6h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        );
      case "maximize":
        return (
          <svg className="w-1.5 h-1.5 text-green-900" viewBox="0 0 12 12" fill="currentColor">
            <path d="M2 2L10 10M2 10L10 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        );
    }
  };

  return (
    <animated.button
      style={spring}
      className={`${getClassName()} flex items-center justify-center`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      aria-label={type}
    >
      {getIcon()}
    </animated.button>
  );
}
