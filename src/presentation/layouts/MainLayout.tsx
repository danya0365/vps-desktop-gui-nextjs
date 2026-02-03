"use client";

import { animated, useSpring } from "@react-spring/web";
import type { ReactNode } from "react";
import { MainFooter } from "./MainFooter";
import { MainHeader } from "./MainHeader";

interface MainLayoutProps {
  children: ReactNode;
  title?: string;
}

/**
 * MainLayout
 * MacOS-style window layout with header, content area, and dock
 * Following Clean Architecture - Presentation layer
 */
export function MainLayout({ children, title }: MainLayoutProps) {
  // Page entrance animation
  const contentSpring = useSpring({
    from: { opacity: 0, transform: "translateY(10px)" },
    to: { opacity: 1, transform: "translateY(0px)" },
    config: { tension: 280, friction: 24 },
    delay: 100,
  });

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">

      {/* Noise texture overlay */}
      <div 
        className="absolute inset-0 opacity-[0.015] dark:opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Main window container */}
      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Header */}
        <MainHeader title={title} />

        {/* Main Content */}
        <animated.main
          style={contentSpring}
          className="flex-1 px-6 py-6 pb-24 overflow-auto scrollbar-thin"
        >
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </animated.main>

        {/* Footer Dock */}
        <MainFooter />
      </div>
    </div>
  );
}
