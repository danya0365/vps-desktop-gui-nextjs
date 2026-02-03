"use client";

import type { VpsServer } from "@/src/domain/entities/VpsServer";
import { vpsServerRepository } from "@/src/infrastructure/repositories/VpsRepositoryFactory";
import { GlassCard } from "@/src/presentation/components/ui/GlassCard";
import { IconButton } from "@/src/presentation/components/ui/IconButton";
import { StatusIndicator } from "@/src/presentation/components/ui/StatusIndicator";
import { WindowPanel } from "@/src/presentation/components/ui/WindowPanel";
import { animated, useSpring } from "@react-spring/web";
import { useEffect, useState } from "react";

interface DockerContainer {
  id: string;
  name: string;
  image: string;
  status: "running" | "stopped" | "paused" | "restarting";
  ports: string[];
  cpu: number;
  memory: { used: number; limit: number };
  created: string;
  uptime?: string;
}

const mockContainers: DockerContainer[] = [
  { id: "abc123", name: "web-nginx", image: "nginx:latest", status: "running", ports: ["80:80", "443:443"], cpu: 2.3, memory: { used: 128, limit: 512 }, created: "2025-01-15", uptime: "18 days" },
  { id: "def456", name: "app-mysql", image: "mysql:8.0", status: "running", ports: ["3306:3306"], cpu: 8.5, memory: { used: 512, limit: 2048 }, created: "2025-01-15", uptime: "18 days" },
  { id: "ghi789", name: "cache-redis", image: "redis:alpine", status: "running", ports: ["6379:6379"], cpu: 0.5, memory: { used: 32, limit: 128 }, created: "2025-01-20", uptime: "13 days" },
  { id: "jkl012", name: "api-node", image: "node:18-alpine", status: "running", ports: ["3000:3000"], cpu: 12.1, memory: { used: 256, limit: 1024 }, created: "2025-02-01", uptime: "2 days" },
  { id: "mno345", name: "worker-python", image: "python:3.11-slim", status: "stopped", ports: [], cpu: 0, memory: { used: 0, limit: 512 }, created: "2025-01-28" },
  { id: "pqr678", name: "monitoring-grafana", image: "grafana/grafana:latest", status: "running", ports: ["3001:3000"], cpu: 3.2, memory: { used: 128, limit: 256 }, created: "2025-01-25", uptime: "8 days" },
];

export default function DockerPage() {
  const [servers, setServers] = useState<VpsServer[]>([]);
  const [selectedServer, setSelectedServer] = useState<VpsServer | null>(null);
  const [containers, setContainers] = useState<DockerContainer[]>(mockContainers);
  const [selectedContainer, setSelectedContainer] = useState<DockerContainer | null>(null);
  const [showLogs, setShowLogs] = useState(false);
  const [filter, setFilter] = useState<"all" | "running" | "stopped">("all");

  useEffect(() => {
    const loadServers = async () => {
      const data = await vpsServerRepository.getAll();
      setServers(data);
      const online = data.find((s) => s.status === "online");
      if (online) setSelectedServer(online);
    };
    loadServers();
  }, []);

  // Simulate resource updates
  useEffect(() => {
    const interval = setInterval(() => {
      setContainers((prev) =>
        prev.map((c) => {
          if (c.status !== "running") return c;
          return {
            ...c,
            cpu: Math.max(0, Math.min(100, c.cpu + (Math.random() * 4 - 2))),
            memory: {
              ...c.memory,
              used: Math.max(16, Math.min(c.memory.limit, c.memory.used + (Math.random() * 20 - 10))),
            },
          };
        })
      );
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const toggleContainer = (id: string, action: "start" | "stop" | "restart") => {
    setContainers((prev) =>
      prev.map((c) => {
        if (c.id !== id) return c;
        if (action === "start") return { ...c, status: "running", uptime: "0 seconds" };
        if (action === "stop") return { ...c, status: "stopped", cpu: 0, memory: { ...c.memory, used: 0 }, uptime: undefined };
        if (action === "restart") return { ...c, status: "restarting" };
        return c;
      })
    );

    // Simulate restart delay
    if (action === "restart") {
      setTimeout(() => {
        setContainers((prev) =>
          prev.map((c) => (c.id === id ? { ...c, status: "running", uptime: "0 seconds" } : c))
        );
      }, 2000);
    }
  };

  const filteredContainers = containers.filter((c) => {
    if (filter === "all") return true;
    if (filter === "running") return c.status === "running";
    return c.status === "stopped";
  });

  const stats = {
    total: containers.length,
    running: containers.filter((c) => c.status === "running").length,
    stopped: containers.filter((c) => c.status === "stopped").length,
    totalCpu: containers.filter((c) => c.status === "running").reduce((acc, c) => acc + c.cpu, 0),
    totalMemory: containers.filter((c) => c.status === "running").reduce((acc, c) => acc + c.memory.used, 0),
  };

  const headerSpring = useSpring({
    from: { opacity: 0, transform: "translateY(-20px)" },
    to: { opacity: 1, transform: "translateY(0px)" },
  });

  const getStatusText = (status: DockerContainer["status"]) => {
    switch (status) {
      case "running":
        return "online";
      case "stopped":
        return "offline";
      case "paused":
        return "maintenance";
      case "restarting":
        return "maintenance";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <animated.div style={headerSpring} className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Docker</h1>
          <p className="text-muted mt-1">Manage Docker containers</p>
        </div>

        <div className="flex items-center gap-4">
          <span className="text-sm text-muted">Server:</span>
          <select
            value={selectedServer?.id || ""}
            onChange={(e) => {
              const server = servers.find((s) => s.id === e.target.value);
              setSelectedServer(server || null);
            }}
            className="px-4 py-2 rounded-xl bg-surface border border-border focus:border-primary focus:outline-none cursor-pointer min-w-48"
          >
            <option value="">Select server...</option>
            {servers
              .filter((s) => s.status === "online")
              .map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
          </select>
        </div>
      </animated.div>

      {!selectedServer ? (
        <GlassCard className="p-12 text-center">
          <div className="text-6xl mb-4">🐳</div>
          <h3 className="text-xl font-semibold text-foreground mb-2">No server selected</h3>
          <p className="text-muted">Select a server to manage Docker containers</p>
        </GlassCard>
      ) : (
        <>
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <GlassCard className="p-4 text-center">
              <div className="text-2xl font-bold text-primary">{stats.total}</div>
              <div className="text-sm text-muted">Containers</div>
            </GlassCard>
            <GlassCard className="p-4 text-center">
              <div className="text-2xl font-bold text-success">{stats.running}</div>
              <div className="text-sm text-muted">Running</div>
            </GlassCard>
            <GlassCard className="p-4 text-center">
              <div className="text-2xl font-bold text-error">{stats.stopped}</div>
              <div className="text-sm text-muted">Stopped</div>
            </GlassCard>
            <GlassCard className="p-4 text-center">
              <div className="text-2xl font-bold text-secondary">{stats.totalCpu.toFixed(1)}%</div>
              <div className="text-sm text-muted">Total CPU</div>
            </GlassCard>
            <GlassCard className="p-4 text-center">
              <div className="text-2xl font-bold text-accent">{(stats.totalMemory / 1024).toFixed(1)} GB</div>
              <div className="text-sm text-muted">Memory Used</div>
            </GlassCard>
          </div>

          {/* Toolbar */}
          <GlassCard className="p-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              {(["all", "running", "stopped"] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium capitalize transition-colors ${
                    filter === f ? "bg-primary text-white" : "text-muted hover:bg-gray-100 dark:hover:bg-gray-800"
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>

            <button className="btn-primary flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              Run Container
            </button>
          </GlassCard>

          {/* Containers Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredContainers.map((container) => (
              <GlassCard key={container.id} className="p-4">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">🐳</span>
                    <div>
                      <h4 className="font-semibold text-foreground">{container.name}</h4>
                      <p className="text-sm text-muted">{container.image}</p>
                    </div>
                  </div>
                  <StatusIndicator status={getStatusText(container.status)} showLabel />
                </div>

                {container.status === "running" && (
                  <div className="space-y-3 mb-4">
                    {/* CPU */}
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-muted">CPU</span>
                        <span className="font-mono">{container.cpu.toFixed(1)}%</span>
                      </div>
                      <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full transition-all duration-500"
                          style={{ width: `${Math.min(container.cpu, 100)}%` }}
                        />
                      </div>
                    </div>
                    {/* Memory */}
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-muted">Memory</span>
                        <span className="font-mono">{container.memory.used.toFixed(0)} / {container.memory.limit} MB</span>
                      </div>
                      <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-secondary rounded-full transition-all duration-500"
                          style={{ width: `${(container.memory.used / container.memory.limit) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Ports */}
                {container.ports.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-4">
                    {container.ports.map((port) => (
                      <span key={port} className="px-2 py-0.5 text-xs rounded bg-gray-100 dark:bg-gray-800 font-mono text-muted">
                        {port}
                      </span>
                    ))}
                  </div>
                )}

                {/* Footer */}
                <div className="flex items-center justify-between pt-3 border-t border-border">
                  <div className="text-xs text-muted">
                    {container.uptime ? `Up ${container.uptime}` : `Created ${container.created}`}
                  </div>
                  <div className="flex gap-1">
                    {container.status === "running" ? (
                      <>
                        <IconButton label="Logs" onClick={() => { setSelectedContainer(container); setShowLogs(true); }}>
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </IconButton>
                        <IconButton label="Restart" onClick={() => toggleContainer(container.id, "restart")}>
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                          </svg>
                        </IconButton>
                        <IconButton label="Stop" variant="danger" onClick={() => toggleContainer(container.id, "stop")}>
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
                          </svg>
                        </IconButton>
                      </>
                    ) : (
                      <IconButton label="Start" onClick={() => toggleContainer(container.id, "start")}>
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </IconButton>
                    )}
                  </div>
                </div>
              </GlassCard>
            ))}
          </div>

          {/* Logs Modal */}
          {showLogs && selectedContainer && (
            <LogsModal container={selectedContainer} onClose={() => { setShowLogs(false); setSelectedContainer(null); }} />
          )}
        </>
      )}
    </div>
  );
}

function LogsModal({ container, onClose }: { container: DockerContainer; onClose: () => void }) {
  const mockLogs = `[2025-02-03 14:00:01] Starting ${container.name}...
[2025-02-03 14:00:02] Loading configuration...
[2025-02-03 14:00:02] Configuration loaded successfully
[2025-02-03 14:00:03] Initializing services...
[2025-02-03 14:00:04] Service started on port ${container.ports[0]?.split(":")[0] || "8080"}
[2025-02-03 14:00:05] Ready to accept connections
[2025-02-03 14:05:12] Incoming request from 192.168.1.100
[2025-02-03 14:05:12] Request processed in 23ms
[2025-02-03 14:10:45] Health check: OK
[2025-02-03 14:15:45] Health check: OK
[2025-02-03 14:20:45] Health check: OK`;

  const modalSpring = useSpring({
    from: { opacity: 0, transform: "scale(0.95)" },
    to: { opacity: 1, transform: "scale(1)" },
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <animated.div style={modalSpring} className="relative w-full max-w-3xl">
        <WindowPanel
          title={`Logs: ${container.name}`}
          icon={<span className="text-lg">📜</span>}
          actions={
            <IconButton onClick={onClose} label="Close">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </IconButton>
          }
        >
          <pre className="bg-gray-900 text-green-400 font-mono text-sm p-4 rounded-lg h-80 overflow-auto">
            {mockLogs}
          </pre>
        </WindowPanel>
      </animated.div>
    </div>
  );
}
