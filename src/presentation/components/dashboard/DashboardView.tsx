/**
 * DashboardView
 * The main UI component for the dashboard
 * Following Clean Architecture - Presentation Layer (View)
 */

'use client';

import type { VpsServer } from "@/src/domain/entities/VpsServer";
import { GlassCard } from "@/src/presentation/components/ui/GlassCard";
import { StatusIndicator } from "@/src/presentation/components/ui/StatusIndicator";
import { WindowPanel } from "@/src/presentation/components/ui/WindowPanel";
import { animated, useSpring } from "@react-spring/web";
import Link from "next/link";
import React, { useEffect } from "react";
import { DashboardViewModel } from "../../presenters/dashboard/DashboardPresenter";
import { useDashboardPresenter } from "../../presenters/dashboard/useDashboardPresenter";

interface DashboardViewProps {
  initialViewModel: DashboardViewModel;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ initialViewModel }) => {
  const [state, actions] = useDashboardPresenter(initialViewModel);
  const { viewModel, loading, error } = state;

  useEffect(() => {
    // Optionally auto-refresh on mount if server-side data is potentially stale
    // actions.loadData();
  }, [actions]);

  // Hero section animation
  const heroSpring = useSpring({
    from: { opacity: 0, transform: "translateY(20px)" },
    to: { opacity: 1, transform: "translateY(0px)" },
    config: { tension: 280, friction: 60 },
  });

  if (!viewModel && loading) {
    return <LoadingSkeleton />;
  }

  if (error) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold text-red-500 mb-4">Error</h2>
        <p className="text-muted mb-6">{error}</p>
        <button 
          onClick={() => actions.loadData()}
          className="bg-primary text-white px-6 py-2 rounded-xl hover:bg-primary/90 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  const { servers, stats } = viewModel!;

  const statsCards = [
    {
      label: "Total Servers",
      value: stats?.totalServers || 0,
      icon: "🖥️",
      color: "text-primary",
      delay: 100,
    },
    {
      label: "Online",
      value: stats?.onlineServers || 0,
      icon: "🟢",
      color: "text-success",
      delay: 200,
    },
    {
      label: "Offline",
      value: stats?.offlineServers || 0,
      icon: "⚫",
      color: "text-muted",
      delay: 300,
    },
    {
      label: "Maintenance",
      value: stats?.maintenanceServers || 0,
      icon: "🟡",
      color: "text-warning",
      delay: 400,
    },
  ];

  return (
    <div className="space-y-8 pb-12">
      {/* Hero Section */}
      <animated.section style={heroSpring} className="text-center py-8">
        <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
          Welcome to{" "}
          <span className="text-gradient-primary">VPS Desktop</span>
        </h1>
        <p className="text-lg text-muted max-w-2xl mx-auto">
          Manage your virtual private servers with a beautiful, intuitive interface
          inspired by macOS.
        </p>
      </animated.section>

      {/* Stats Overview */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statsCards.map((stat) => (
          <FadeIn key={stat.label} delay={stat.delay}>
            <GlassCard className="text-center group hover:scale-[1.02] transition-transform duration-300">
              <div className="text-3xl mb-2 group-hover:scale-110 transition-transform duration-300">{stat.icon}</div>
              <div className={`text-3xl font-bold ${stat.color}`}>
                {stat.value}
              </div>
              <div className="text-sm text-muted mt-1 uppercase tracking-wider font-semibold opacity-70">{stat.label}</div>
            </GlassCard>
          </FadeIn>
        ))}
      </section>

      {/* Quick Actions */}
      <section>
        <h2 className="text-xl font-bold text-foreground mb-4">
          Quick Actions
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {quickActions.map((action, index) => (
            <FadeIn key={action.id} delay={200 + index * 50}>
              <Link href={action.href}>
                <GlassCard
                  className="flex flex-col items-center gap-3 py-6 cursor-pointer h-full hover:bg-white/50 dark:hover:bg-gray-800/50 transition-colors"
                >
                  <div
                    className={`w-14 h-14 rounded-2xl ${action.bgColor} flex items-center justify-center text-2xl shadow-lg`}
                  >
                    {action.icon}
                  </div>
                  <span className="text-sm font-semibold text-foreground">
                    {action.label}
                  </span>
                </GlassCard>
              </Link>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* Server List */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-foreground">Your Servers</h2>
          <Link href="/servers" className="text-sm text-primary hover:underline font-semibold">View All</Link>
        </div>
        
        <WindowPanel
          title="Server Management"
          icon={
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 14.25h13.5m-13.5 0a3 3 0 01-3-3m3 3a3 3 0 100 6h13.5a3 3 0 100-6m-16.5-3a3 3 0 013-3h13.5a3 3 0 013 3m-19.5 0a4.5 4.5 0 01.9-2.7L5.737 5.1a3.375 3.375 0 012.7-1.35h7.126c1.062 0 2.062.5 2.7 1.35l2.587 3.45a4.5 4.5 0 01.9 2.7m0 0a3 3 0 01-3 3m0 3h.008v.008h-.008v-.008zm0-6h.008v.008h-.008v-.008zm-3 6h.008v.008h-.008v-.008zm0-6h.008v.008h-.008v-.008z" />
            </svg>
          }
        >
          {servers.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted">No servers found.</p>
              <Link href="/servers" className="text-primary hover:underline font-semibold mt-2 inline-block">Add your first server</Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {servers.map((server, index) => (
                <FadeIn key={server.id} delay={300 + index * 50}>
                  <ServerCard server={server} />
                </FadeIn>
              ))}
            </div>
          )}
        </WindowPanel>
      </section>
    </div>
  );
};

// Helper component for simple fade-in instead of useTrail
function FadeIn({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const spring = useSpring({
    from: { opacity: 0, transform: "translateY(10px)" },
    to: { opacity: 1, transform: "translateY(0px)" },
    delay,
    config: { tension: 300, friction: 30 },
  });

  return <animated.div style={spring}>{children}</animated.div>;
}

// Quick Actions Data
const quickActions = [
  { id: "servers", label: "Servers", icon: "🖥️", bgColor: "bg-primary/10", href: "/servers" },
  { id: "terminal", label: "Terminal", icon: "💻", bgColor: "bg-secondary/10", href: "/terminal" },
  { id: "monitoring", label: "Monitoring", icon: "📊", bgColor: "bg-success/10", href: "/monitoring" },
  { id: "settings", label: "Settings", icon: "⚙️", bgColor: "bg-gray-200 dark:bg-gray-700", href: "/settings" },
];

// Server Card Component
function ServerCard({ server }: { server: VpsServer }) {
  return (
    <GlassCard className="p-4 hover:shadow-xl transition-shadow duration-300">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <ServerIcon os={server.os} />
          </div>
          <div>
            <h4 className="font-bold text-foreground text-sm truncate max-w-[120px]">
              {server.name}
            </h4>
            <p className="text-xs text-muted font-mono">{server.hostname}</p>
          </div>
        </div>
        <StatusIndicator status={server.status} />
      </div>

      {/* Metrics */}
      <div className="space-y-2 mt-4">
        <MetricBar label="CPU" value={server.cpu.usage} color="bg-primary" />
        <MetricBar label="RAM" value={server.memory.usage} color="bg-secondary" />
        <MetricBar label="Disk" value={server.storage.usage} color="bg-emerald-500" />
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between mt-4 pt-3 border-t border-border/50">
        <div className="flex items-center gap-2 text-[10px] text-muted font-semibold uppercase tracking-wider">
          <span>📍 {server.location}</span>
        </div>
        <span className="text-[10px] text-muted font-bold">
          {server.uptime > 0 ? `${Math.floor(server.uptime / 24)}d uptime` : "Offline"}
        </span>
      </div>
    </GlassCard>
  );
}

// Metric Bar Component
function MetricBar({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-[10px] font-bold text-muted w-8 uppercase">{label}</span>
      <div className="flex-1 h-1 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
        <animated.div
          className={`h-full ${color} rounded-full transition-all duration-700`}
          style={{ width: `${Math.min(value, 100)}%` }}
        />
      </div>
      <span className="text-[10px] font-mono text-muted w-8 text-right font-bold">{value}%</span>
    </div>
  );
}

// Server Icon Component
function ServerIcon({ os }: { os: string }) {
  switch (os) {
    case "ubuntu":
      return <span className="text-lg">🐧</span>;
    case "debian":
      return <span className="text-lg">🔴</span>;
    case "centos":
      return <span className="text-lg">🎯</span>;
    case "windows":
      return <span className="text-lg">🪟</span>;
    default:
      return <span className="text-lg">🖥️</span>;
  }
}

// Loading Skeleton
function LoadingSkeleton() {
  return (
    <div className="space-y-8 animate-pulse pb-12">
      <div className="text-center py-8">
        <div className="h-12 w-64 bg-gray-200 dark:bg-gray-800 rounded-2xl mx-auto mb-4" />
        <div className="h-6 w-96 bg-gray-200 dark:bg-gray-800 rounded-xl mx-auto" />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-32 bg-gray-200 dark:bg-gray-800 rounded-3xl" />
        ))}
      </div>
      <div className="h-8 w-40 bg-gray-200 dark:bg-gray-800 rounded-lg mb-4" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-28 bg-gray-200 dark:bg-gray-800 rounded-3xl" />
        ))}
      </div>
    </div>
  );
}
