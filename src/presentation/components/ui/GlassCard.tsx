"use client";

import { animated, useSpring } from "@react-spring/web";
import { useState, type ReactNode } from "react";

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  hoverEffect?: boolean;
  clickEffect?: boolean;
}

/**
 * GlassCard
 * Glassmorphism card with react-spring hover and click animations
 */
export function GlassCard({
  children,
  className = "",
  onClick,
  hoverEffect = true,
  clickEffect = true,
}: GlassCardProps) {
  const [hovered, setHovered] = useState(false);
  const [pressed, setPressed] = useState(false);

  const spring = useSpring({
    transform: pressed
      ? "translateY(0px) scale(0.98)"
      : hovered && hoverEffect
      ? "translateY(-4px) scale(1.01)"
      : "translateY(0px) scale(1)",
    boxShadow: hovered
      ? "0 12px 40px rgba(0, 0, 0, 0.12)"
      : "0 4px 20px rgba(0, 0, 0, 0.06)",
    config: { tension: 400, friction: 25 },
  });

  return (
    <animated.div
      style={spring}
      className={`glass-card p-6 ${onClick ? "cursor-pointer" : ""} ${className}`}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => {
        setHovered(false);
        setPressed(false);
      }}
      onMouseDown={() => clickEffect && setPressed(true)}
      onMouseUp={() => setPressed(false)}
    >
      {children}
    </animated.div>
  );
}
