"use client";

import { animated, useSpring } from "@react-spring/web";
import { useState, type ReactNode } from "react";

interface IconButtonProps {
  children: ReactNode;
  label?: string;
  onClick?: () => void;
  variant?: "default" | "primary" | "danger" | "ghost";
  size?: "sm" | "md" | "lg";
  className?: string;
  disabled?: boolean;
}

/**
 * IconButton
 * Interactive icon button with scale and glow effects
 */
export function IconButton({
  children,
  label,
  onClick,
  variant = "default",
  size = "md",
  className = "",
  disabled = false,
}: IconButtonProps) {
  const [hovered, setHovered] = useState(false);
  const [pressed, setPressed] = useState(false);

  const spring = useSpring({
    transform: pressed
      ? "scale(0.92)"
      : hovered
      ? "scale(1.08)"
      : "scale(1)",
    config: { tension: 450, friction: 20 },
  });

  const glowSpring = useSpring({
    boxShadow: hovered && variant === "primary"
      ? "0 0 20px rgba(0, 122, 255, 0.4)"
      : hovered && variant === "danger"
      ? "0 0 20px rgba(255, 59, 48, 0.4)"
      : "0 0 0 rgba(0, 0, 0, 0)",
    config: { tension: 300, friction: 20 },
  });

  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-10 h-10",
    lg: "w-12 h-12",
  };

  const variantClasses = {
    default: "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700",
    primary: "bg-primary text-white hover:bg-primary-dark",
    danger: "bg-error text-white hover:bg-error-dark",
    ghost: "bg-transparent text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800",
  };

  return (
    <animated.button
      style={{ ...spring, ...glowSpring }}
      className={`
        ${sizeClasses[size]}
        ${variantClasses[variant]}
        rounded-xl flex items-center justify-center
        transition-colors duration-200
        focus:outline-none focus-visible:ring-2 focus-visible:ring-primary
        disabled:opacity-50 disabled:cursor-not-allowed
        ${className}
      `}
      onClick={onClick}
      onMouseEnter={() => !disabled && setHovered(true)}
      onMouseLeave={() => {
        setHovered(false);
        setPressed(false);
      }}
      onMouseDown={() => !disabled && setPressed(true)}
      onMouseUp={() => setPressed(false)}
      disabled={disabled}
      aria-label={label}
    >
      {children}
    </animated.button>
  );
}
