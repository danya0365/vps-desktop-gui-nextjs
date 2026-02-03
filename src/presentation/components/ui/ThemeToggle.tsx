"use client";

import { animated, useSpring } from "@react-spring/web";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

interface ThemeToggleProps {
  className?: string;
}

/**
 * ThemeToggle
 * Animated toggle button for switching between dark and light modes
 * Uses react-spring for smooth animations
 */
export function ThemeToggle({ className = "" }: ThemeToggleProps) {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = resolvedTheme === "dark";

  // Sun/Moon rotation animation
  const iconSpring = useSpring({
    transform: isDark ? "rotate(180deg)" : "rotate(0deg)",
    opacity: mounted ? 1 : 0,
    config: { tension: 300, friction: 20 },
  });

  // Scale animation on hover
  const [hovered, setHovered] = useState(false);
  const scaleSpring = useSpring({
    transform: hovered ? "scale(1.1)" : "scale(1)",
    config: { tension: 400, friction: 25 },
  });

  const toggleTheme = () => {
    setTheme(isDark ? "light" : "dark");
  };

  if (!mounted) {
    return (
      <div className={`w-10 h-10 rounded-xl bg-gray-200 dark:bg-gray-700 animate-pulse ${className}`} />
    );
  }

  return (
    <animated.button
      style={scaleSpring}
      onClick={toggleTheme}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={`
        relative w-10 h-10 rounded-xl
        bg-gray-100 dark:bg-gray-800
        hover:bg-gray-200 dark:hover:bg-gray-700
        border border-gray-200 dark:border-gray-700
        flex items-center justify-center
        transition-colors duration-200
        focus:outline-none focus-visible:ring-2 focus-visible:ring-primary
        ${className}
      `}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
    >
      <animated.div style={iconSpring} className="relative w-5 h-5">
        {/* Sun Icon */}
        <svg
          className={`absolute inset-0 w-5 h-5 text-amber-500 transition-opacity duration-300 ${
            isDark ? "opacity-0" : "opacity-100"
          }`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
          />
        </svg>
        {/* Moon Icon */}
        <svg
          className={`absolute inset-0 w-5 h-5 text-indigo-400 transition-opacity duration-300 ${
            isDark ? "opacity-100" : "opacity-0"
          }`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
          />
        </svg>
      </animated.div>
    </animated.button>
  );
}
