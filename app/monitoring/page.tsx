"use client";

import type { ServerStats, VpsServer } from "@/src/domain/entities/VpsServer";
import { vpsServerRepository } from "@/src/infrastructure/repositories/VpsRepositoryFactory";
import { GlassCard } from "@/src/presentation/components/ui/GlassCard";
import { WindowPanel } from "@/src/presentation/components/ui/WindowPanel";
import { animated, useSpring } from "@react-spring/web";
import { useEffect, useState } from "react";

export default function MonitoringPage() {
  const [servers, setServers] = useState<VpsServer[]>([]);
  const [stats, setStats] = useState<ServerStats | null>(null);
  const [selectedMetric, setSelectedMetric] = useState<"cpu" | "memory" | "storage">("cpu");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      const [serversData, statsData] = await Promise.all([
        vpsServerRepository.getAll(),
        vpsServerRepository.getStats(),
      ]);
      setServers(serversData);
      setStats(statsData);
      setLoading(false);
    };
    loadData();
  }, []);

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(async () => {
      const serversData = await vpsServerRepository.getAll();
      // Simulate slight variations in metrics
      const updated = serversData.map((s) => ({
        ...s,
        cpu: { ...s.cpu, usage: Math.max(0, Math.min(100, s.cpu.usage + (Math.random() * 10 - 5))) },
        memory: { ...s.memory, usage: Math.max(0, Math.min(100, s.memory.usage + (Math.random() * 6 - 3))) },
      }));
      setServers(updated);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const headerSpring = useSpring({
    from: { opacity: 0, transform: "translateY(-20px)" },
    to: { opacity: 1, transform: "translateY(0px)" },
  });

  if (loading) {
    return <LoadingSkeleton />;
  }

  const getMetricValue = (server: VpsServer) => {
    switch (selectedMetric) {
      case "cpu":
        return server.cpu.usage;
      case "memory":
        return server.memory.usage;
      case "storage":
        return server.storage.usage;
    }
  };

  const getMetricColor = (value: number) => {
    if (value >= 90) return "bg-error";
    if (value >= 70) return "bg-warning";
    return "bg-success";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <animated.div style={headerSpring} className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Monitoring</h1>
          <p className="text-muted mt-1">Real-time resource usage overview</p>
        </div>

        {/* Metric Selector */}
        <div className="flex rounded-xl overflow-hidden border border-border">
          {(["cpu", "memory", "storage"] as const).map((metric) => (
            <button
              key={metric}
              onClick={() => setSelectedMetric(metric)}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                selectedMetric === metric
                  ? "bg-primary text-white"
                  : "bg-surface text-muted hover:bg-gray-100 dark:hover:bg-gray-800"
              }`}
            >
              {metric.charAt(0).toUpperCase() + metric.slice(1)}
            </button>
          ))}
        </div>
      </animated.div>

      {/* Overview Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <GlassCard className="p-4 text-center">
          <div className="text-3xl font-bold text-primary">{stats?.totalCpuCores}</div>
          <div className="text-sm text-muted mt-1">Total CPU Cores</div>
        </GlassCard>
        <GlassCard className="p-4 text-center">
          <div className="text-3xl font-bold text-secondary">{stats?.totalMemoryGB} GB</div>
          <div className="text-sm text-muted mt-1">Total Memory</div>
        </GlassCard>
        <GlassCard className="p-4 text-center">
          <div className="text-3xl font-bold text-accent">{((stats?.totalStorageGB || 0) / 1000).toFixed(1)} TB</div>
          <div className="text-sm text-muted mt-1">Total Storage</div>
        </GlassCard>
        <GlassCard className="p-4 text-center">
          <div className="text-3xl font-bold text-success">{stats?.onlineServers}</div>
          <div className="text-sm text-muted mt-1">Servers Online</div>
        </GlassCard>
      </div>

      {/* Resource Usage Chart */}
      <WindowPanel
        title={`${selectedMetric.charAt(0).toUpperCase() + selectedMetric.slice(1)} Usage by Server`}
        icon={
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
          </svg>
        }
      >
        <div className="space-y-4">
          {servers
            .filter((s) => s.status === "online")
            .sort((a, b) => getMetricValue(b) - getMetricValue(a))
            .map((server) => {
              const value = Math.round(getMetricValue(server));
              return (
                <div key={server.id} className="flex items-center gap-4">
                  <div className="w-40 truncate font-medium text-foreground">{server.name}</div>
                  <div className="flex-1 h-4 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${getMetricColor(value)} rounded-full transition-all duration-500`}
                      style={{ width: `${value}%` }}
                    />
                  </div>
                  <div className={`w-12 text-right font-mono text-sm ${
                    value >= 90 ? "text-error" : value >= 70 ? "text-warning" : "text-success"
                  }`}>
                    {value}%
                  </div>
                </div>
              );
            })}
        </div>
      </WindowPanel>

      {/* Server Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {servers
          .filter((s) => s.status === "online")
          .map((server) => (
            <GlassCard key={server.id} className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-semibold text-foreground">{server.name}</h4>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
                  <span className="text-xs text-muted">Live</span>
                </div>
              </div>

              {/* CPU Gauge */}
              <div className="mb-3">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-muted">CPU</span>
                  <span className="font-mono">{Math.round(server.cpu.usage)}%</span>
                </div>
                <MiniGauge value={server.cpu.usage} color="primary" />
              </div>

              {/* Memory Gauge */}
              <div className="mb-3">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-muted">Memory</span>
                  <span className="font-mono">{Math.round(server.memory.usage)}%</span>
                </div>
                <MiniGauge value={server.memory.usage} color="secondary" />
              </div>

              {/* Storage Gauge */}
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-muted">Storage</span>
                  <span className="font-mono">{Math.round(server.storage.usage)}%</span>
                </div>
                <MiniGauge value={server.storage.usage} color="accent" />
              </div>

              {/* Network Stats */}
              <div className="mt-4 pt-3 border-t border-border flex justify-between text-xs text-muted">
                <span>↓ {server.network.inbound} Mbps</span>
                <span>↑ {server.network.outbound} Mbps</span>
              </div>
            </GlassCard>
          ))}
      </div>
    </div>
  );
}

function MiniGauge({ value, color }: { value: number; color: "primary" | "secondary" | "accent" }) {
  const colorClasses = {
    primary: "bg-primary",
    secondary: "bg-secondary",
    accent: "bg-accent",
  };

  return (
    <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
      <div
        className={`h-full ${colorClasses[color]} rounded-full transition-all duration-500`}
        style={{ width: `${Math.min(value, 100)}%` }}
      />
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="flex justify-between">
        <div className="h-10 w-48 bg-gray-200 dark:bg-gray-700 rounded-lg" />
        <div className="h-10 w-48 bg-gray-200 dark:bg-gray-700 rounded-xl" />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-24 bg-gray-200 dark:bg-gray-700 rounded-2xl" />
        ))}
      </div>
      <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded-2xl" />
    </div>
  );
}
