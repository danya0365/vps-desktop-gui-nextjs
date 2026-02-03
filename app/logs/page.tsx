"use client";

import type { VpsServer } from "@/src/domain/entities/VpsServer";
import { vpsServerRepository } from "@/src/infrastructure/repositories/VpsRepositoryFactory";
import { GlassCard } from "@/src/presentation/components/ui/GlassCard";
import { WindowPanel } from "@/src/presentation/components/ui/WindowPanel";
import { animated, useSpring } from "@react-spring/web";
import { useEffect, useRef, useState } from "react";

type LogLevel = "info" | "warn" | "error" | "debug";

interface LogEntry {
  id: string;
  timestamp: string;
  level: LogLevel;
  service: string;
  message: string;
}

// Mock log data generator
function generateMockLogs(count: number): LogEntry[] {
  const services = ["nginx", "mysql", "php-fpm", "systemd", "sshd", "docker", "cron"];
  const levels: LogLevel[] = ["info", "warn", "error", "debug"];
  const messages = {
    info: [
      "Request completed successfully",
      "Connection established from 192.168.1.100",
      "Service started",
      "Configuration reloaded",
      "Backup completed",
      "User login successful",
      "Cache cleared",
    ],
    warn: [
      "High memory usage detected",
      "Slow query detected (5.2s)",
      "Connection pool near capacity",
      "Certificate expires in 30 days",
      "Rate limit approaching",
    ],
    error: [
      "Connection refused to database",
      "Permission denied for /var/log/app.log",
      "Out of memory error",
      "SSL handshake failed",
      "Process terminated unexpectedly",
    ],
    debug: [
      "Processing request ID 12345",
      "Query execution time: 0.023s",
      "Memory allocated: 128MB",
      "Socket opened on port 8080",
    ],
  };

  const logs: LogEntry[] = [];
  const now = new Date();

  for (let i = 0; i < count; i++) {
    const level = levels[Math.floor(Math.random() * levels.length)];
    const service = services[Math.floor(Math.random() * services.length)];
    const messageList = messages[level];
    const message = messageList[Math.floor(Math.random() * messageList.length)];
    
    const timestamp = new Date(now.getTime() - i * 60000 - Math.random() * 30000);
    
    logs.push({
      id: `log-${i}`,
      timestamp: timestamp.toISOString(),
      level,
      service,
      message,
    });
  }

  return logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

export default function LogsPage() {
  const [servers, setServers] = useState<VpsServer[]>([]);
  const [selectedServer, setSelectedServer] = useState<VpsServer | null>(null);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<LogEntry[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [levelFilter, setLevelFilter] = useState<LogLevel | "all">("all");
  const [serviceFilter, setServiceFilter] = useState<string>("all");
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [isLive, setIsLive] = useState(true);
  const logsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadServers = async () => {
      const data = await vpsServerRepository.getAll();
      setServers(data);
      const online = data.find((s) => s.status === "online");
      if (online) setSelectedServer(online);
    };
    loadServers();
  }, []);

  useEffect(() => {
    if (selectedServer) {
      setLogs(generateMockLogs(100));
    }
  }, [selectedServer]);

  // Auto-refresh logs
  useEffect(() => {
    if (!autoRefresh || !selectedServer) return;

    const interval = setInterval(() => {
      const newLog: LogEntry = {
        id: `log-${Date.now()}`,
        timestamp: new Date().toISOString(),
        level: ["info", "warn", "error", "debug"][Math.floor(Math.random() * 4)] as LogLevel,
        service: ["nginx", "mysql", "php-fpm", "systemd", "docker"][Math.floor(Math.random() * 5)],
        message: "New log entry generated",
      };
      setLogs((prev) => [newLog, ...prev.slice(0, 99)]);
    }, 3000);

    return () => clearInterval(interval);
  }, [autoRefresh, selectedServer]);

  // Filter logs
  useEffect(() => {
    let result = logs;

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (log) =>
          log.message.toLowerCase().includes(term) ||
          log.service.toLowerCase().includes(term)
      );
    }

    if (levelFilter !== "all") {
      result = result.filter((log) => log.level === levelFilter);
    }

    if (serviceFilter !== "all") {
      result = result.filter((log) => log.service === serviceFilter);
    }

    setFilteredLogs(result);
  }, [logs, searchTerm, levelFilter, serviceFilter]);

  // Auto-scroll when live
  useEffect(() => {
    if (isLive && logsRef.current) {
      logsRef.current.scrollTop = 0;
    }
  }, [filteredLogs, isLive]);

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });
  };

  const getLevelColor = (level: LogLevel) => {
    switch (level) {
      case "info":
        return "text-blue-500 bg-blue-500/10";
      case "warn":
        return "text-yellow-500 bg-yellow-500/10";
      case "error":
        return "text-red-500 bg-red-500/10";
      case "debug":
        return "text-gray-500 bg-gray-500/10";
    }
  };

  const services = [...new Set(logs.map((log) => log.service))];

  const headerSpring = useSpring({
    from: { opacity: 0, transform: "translateY(-20px)" },
    to: { opacity: 1, transform: "translateY(0px)" },
  });

  const logCounts = {
    info: logs.filter((l) => l.level === "info").length,
    warn: logs.filter((l) => l.level === "warn").length,
    error: logs.filter((l) => l.level === "error").length,
    debug: logs.filter((l) => l.level === "debug").length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <animated.div style={headerSpring} className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Logs</h1>
          <p className="text-muted mt-1">View and analyze server logs</p>
        </div>

        {/* Server Selector */}
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
          <div className="text-6xl mb-4">📜</div>
          <h3 className="text-xl font-semibold text-foreground mb-2">No server selected</h3>
          <p className="text-muted">Select a server to view its logs</p>
        </GlassCard>
      ) : (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <GlassCard className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-500">{logCounts.info}</div>
              <div className="text-sm text-muted">Info</div>
            </GlassCard>
            <GlassCard className="p-4 text-center">
              <div className="text-2xl font-bold text-yellow-500">{logCounts.warn}</div>
              <div className="text-sm text-muted">Warnings</div>
            </GlassCard>
            <GlassCard className="p-4 text-center">
              <div className="text-2xl font-bold text-red-500">{logCounts.error}</div>
              <div className="text-sm text-muted">Errors</div>
            </GlassCard>
            <GlassCard className="p-4 text-center">
              <div className="text-2xl font-bold text-gray-500">{logCounts.debug}</div>
              <div className="text-sm text-muted">Debug</div>
            </GlassCard>
          </div>

          {/* Filters */}
          <GlassCard className="p-4 flex flex-wrap items-center gap-4">
            {/* Search */}
            <div className="relative flex-1 min-w-48">
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search logs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-xl bg-surface border border-border focus:border-primary focus:outline-none"
              />
            </div>

            {/* Level Filter */}
            <select
              value={levelFilter}
              onChange={(e) => setLevelFilter(e.target.value as LogLevel | "all")}
              className="px-4 py-2 rounded-xl bg-surface border border-border focus:border-primary focus:outline-none cursor-pointer"
            >
              <option value="all">All Levels</option>
              <option value="info">Info</option>
              <option value="warn">Warning</option>
              <option value="error">Error</option>
              <option value="debug">Debug</option>
            </select>

            {/* Service Filter */}
            <select
              value={serviceFilter}
              onChange={(e) => setServiceFilter(e.target.value)}
              className="px-4 py-2 rounded-xl bg-surface border border-border focus:border-primary focus:outline-none cursor-pointer"
            >
              <option value="all">All Services</option>
              {services.map((service) => (
                <option key={service} value={service}>
                  {service}
                </option>
              ))}
            </select>

            {/* Auto-refresh toggle */}
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-colors ${
                autoRefresh
                  ? "bg-success/10 border-success text-success"
                  : "bg-surface border-border text-muted"
              }`}
            >
              <div className={`w-2 h-2 rounded-full ${autoRefresh ? "bg-success animate-pulse" : "bg-gray-400"}`} />
              {autoRefresh ? "Live" : "Paused"}
            </button>
          </GlassCard>

          {/* Logs List */}
          <WindowPanel title={`Logs (${filteredLogs.length} entries)`}>
            <div ref={logsRef} className="h-[500px] overflow-y-auto font-mono text-sm">
              {filteredLogs.length === 0 ? (
                <div className="py-12 text-center">
                  <div className="text-4xl mb-2">🔍</div>
                  <p className="text-muted">No logs found matching your filters</p>
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {filteredLogs.map((log) => (
                    <div
                      key={log.id}
                      className="flex items-start gap-3 px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                    >
                      <span className="text-muted whitespace-nowrap">{formatTimestamp(log.timestamp)}</span>
                      <span
                        className={`px-2 py-0.5 rounded text-xs font-medium uppercase ${getLevelColor(log.level)}`}
                      >
                        {log.level}
                      </span>
                      <span className="text-purple-500 dark:text-purple-400 whitespace-nowrap">[{log.service}]</span>
                      <span className="text-foreground flex-1">{log.message}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </WindowPanel>
        </>
      )}
    </div>
  );
}
