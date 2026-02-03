"use client";

import type { ServerStats, VpsServer } from "@/src/domain/entities/VpsServer";
import { mockVpsServerRepository } from "@/src/infrastructure/repositories/mock/MockVpsServerRepository";
import { GlassCard } from "@/src/presentation/components/ui/GlassCard";
import { StatusIndicator } from "@/src/presentation/components/ui/StatusIndicator";
import { WindowPanel } from "@/src/presentation/components/ui/WindowPanel";
import { animated, useSpring, useTrail } from "@react-spring/web";
import { useEffect, useState } from "react";

export default function HomePage() {
  const [servers, setServers] = useState<VpsServer[]>([]);
  const [stats, setStats] = useState<ServerStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      const [serversData, statsData] = await Promise.all([
        mockVpsServerRepository.getAll(),
        mockVpsServerRepository.getStats(),
      ]);
      setServers(serversData);
      setStats(statsData);
      setLoading(false);
    };
    loadData();
  }, []);

  // Hero section animation
  const heroSpring = useSpring({
    from: { opacity: 0, transform: "translateY(20px)" },
    to: { opacity: 1, transform: "translateY(0px)" },
    delay: 200,
  });

  // Stats cards trail animation
  const statsTrail = useTrail(4, {
    from: { opacity: 0, transform: "translateY(20px)" },
    to: { opacity: 1, transform: "translateY(0px)" },
    delay: 400,
  });

  // Server cards trail animation
  const serverTrail = useTrail(servers.length, {
    from: { opacity: 0, transform: "scale(0.95)" },
    to: { opacity: 1, transform: "scale(1)" },
    delay: 600,
  });

  if (loading) {
    return <LoadingSkeleton />;
  }

  const statsCards = [
    {
      label: "Total Servers",
      value: stats?.totalServers || 0,
      icon: "🖥️",
      color: "text-primary",
    },
    {
      label: "Online",
      value: stats?.onlineServers || 0,
      icon: "🟢",
      color: "text-success",
    },
    {
      label: "Offline",
      value: stats?.offlineServers || 0,
      icon: "⚫",
      color: "text-muted",
    },
    {
      label: "Maintenance",
      value: stats?.maintenanceServers || 0,
      icon: "🟡",
      color: "text-warning",
    },
  ];

  return (
    <div className="space-y-8">
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
        {statsCards.map((stat, index) => (
          <animated.div key={stat.label} style={statsTrail[index]}>
            <GlassCard className="text-center">
              <div className="text-3xl mb-2">{stat.icon}</div>
              <div className={`text-3xl font-bold ${stat.color}`}>
                {stat.value}
              </div>
              <div className="text-sm text-muted mt-1">{stat.label}</div>
            </GlassCard>
          </animated.div>
        ))}
      </section>

      {/* Quick Actions */}
      <section>
        <h2 className="text-xl font-semibold text-foreground mb-4">
          Quick Actions
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {quickActions.map((action) => (
            <GlassCard
              key={action.id}
              onClick={() => console.log(`Clicked ${action.label}`)}
              className="flex flex-col items-center gap-3 py-6 cursor-pointer"
            >
              <div
                className={`w-14 h-14 rounded-2xl ${action.bgColor} flex items-center justify-center text-2xl`}
              >
                {action.icon}
              </div>
              <span className="text-sm font-medium text-foreground">
                {action.label}
              </span>
            </GlassCard>
          ))}
        </div>
      </section>

      {/* Server List */}
      <section>
        <WindowPanel
          title="Your Servers"
          icon={
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 14.25h13.5m-13.5 0a3 3 0 01-3-3m3 3a3 3 0 100 6h13.5a3 3 0 100-6m-16.5-3a3 3 0 013-3h13.5a3 3 0 013 3m-19.5 0a4.5 4.5 0 01.9-2.7L5.737 5.1a3.375 3.375 0 012.7-1.35h7.126c1.062 0 2.062.5 2.7 1.35l2.587 3.45a4.5 4.5 0 01.9 2.7m0 0a3 3 0 01-3 3m0 3h.008v.008h-.008v-.008zm0-6h.008v.008h-.008v-.008zm-3 6h.008v.008h-.008v-.008zm0-6h.008v.008h-.008v-.008z" />
            </svg>
          }
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {servers.map((server, index) => (
              <animated.div key={server.id} style={serverTrail[index]}>
                <ServerCard server={server} />
              </animated.div>
            ))}
          </div>
        </WindowPanel>
      </section>
    </div>
  );
}

// Quick Actions Data
const quickActions = [
  { id: "new-server", label: "New Server", icon: "➕", bgColor: "bg-primary/10" },
  { id: "terminal", label: "Terminal", icon: "💻", bgColor: "bg-secondary/10" },
  { id: "monitoring", label: "Monitoring", icon: "📊", bgColor: "bg-success/10" },
  { id: "settings", label: "Settings", icon: "⚙️", bgColor: "bg-gray-200 dark:bg-gray-700" },
];

// Server Card Component
function ServerCard({ server }: { server: VpsServer }) {
  return (
    <GlassCard className="p-4">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <ServerIcon os={server.os} />
          </div>
          <div>
            <h4 className="font-semibold text-foreground text-sm">
              {server.name}
            </h4>
            <p className="text-xs text-muted">{server.hostname}</p>
          </div>
        </div>
        <StatusIndicator status={server.status} />
      </div>

      {/* Metrics */}
      <div className="space-y-2">
        <MetricBar label="CPU" value={server.cpu.usage} color="bg-primary" />
        <MetricBar label="RAM" value={server.memory.usage} color="bg-secondary" />
        <MetricBar label="Disk" value={server.storage.usage} color="bg-accent" />
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between mt-4 pt-3 border-t border-border">
        <div className="flex items-center gap-2 text-xs text-muted">
          <span>📍 {server.location}</span>
        </div>
        <span className="text-xs text-muted">
          {server.uptime > 0 ? `${Math.floor(server.uptime / 24)}d uptime` : "Down"}
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
      <span className="text-xs text-muted w-10">{label}</span>
      <div className="flex-1 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <div
          className={`h-full ${color} rounded-full transition-all duration-500`}
          style={{ width: `${Math.min(value, 100)}%` }}
        />
      </div>
      <span className="text-xs text-muted w-8 text-right">{value}%</span>
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
    <div className="space-y-8 animate-pulse">
      <div className="text-center py-8">
        <div className="h-12 w-64 bg-gray-200 dark:bg-gray-700 rounded-lg mx-auto mb-4" />
        <div className="h-6 w-96 bg-gray-200 dark:bg-gray-700 rounded-lg mx-auto" />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-32 bg-gray-200 dark:bg-gray-700 rounded-2xl" />
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-48 bg-gray-200 dark:bg-gray-700 rounded-2xl" />
        ))}
      </div>
    </div>
  );
}
