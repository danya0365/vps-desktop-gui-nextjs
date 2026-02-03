"use client";

import type { VpsServer } from "@/src/domain/entities/VpsServer";
import { mockVpsServerRepository } from "@/src/infrastructure/repositories/mock/MockVpsServerRepository";
import { GlassCard } from "@/src/presentation/components/ui/GlassCard";
import { IconButton } from "@/src/presentation/components/ui/IconButton";
import { WindowPanel } from "@/src/presentation/components/ui/WindowPanel";
import { animated, useSpring } from "@react-spring/web";
import { useEffect, useState } from "react";

interface Backup {
  id: string;
  name: string;
  type: "full" | "incremental" | "snapshot";
  size: number;
  createdAt: string;
  status: "completed" | "in_progress" | "failed";
  progress?: number;
  retention: string;
}

const mockBackups: Backup[] = [
  { id: "1", name: "Daily Backup - Feb 3", type: "full", size: 4.2 * 1024 * 1024 * 1024, createdAt: "2025-02-03T02:00:00Z", status: "completed", retention: "7 days" },
  { id: "2", name: "Daily Backup - Feb 2", type: "full", size: 4.1 * 1024 * 1024 * 1024, createdAt: "2025-02-02T02:00:00Z", status: "completed", retention: "7 days" },
  { id: "3", name: "Weekly Backup - Week 5", type: "full", size: 4.3 * 1024 * 1024 * 1024, createdAt: "2025-02-01T03:00:00Z", status: "completed", retention: "30 days" },
  { id: "4", name: "Incremental - Feb 3 12:00", type: "incremental", size: 256 * 1024 * 1024, createdAt: "2025-02-03T12:00:00Z", status: "completed", retention: "3 days" },
  { id: "5", name: "Pre-Deploy Snapshot", type: "snapshot", size: 8.5 * 1024 * 1024 * 1024, createdAt: "2025-02-02T15:30:00Z", status: "completed", retention: "until deleted" },
  { id: "6", name: "Running Backup", type: "full", size: 0, createdAt: "2025-02-03T14:00:00Z", status: "in_progress", progress: 67, retention: "7 days" },
];

export default function BackupsPage() {
  const [servers, setServers] = useState<VpsServer[]>([]);
  const [selectedServer, setSelectedServer] = useState<VpsServer | null>(null);
  const [backups, setBackups] = useState<Backup[]>(mockBackups);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [filter, setFilter] = useState<"all" | "full" | "incremental" | "snapshot">("all");

  useEffect(() => {
    const loadServers = async () => {
      const data = await mockVpsServerRepository.getAll();
      setServers(data);
      const online = data.find((s) => s.status === "online");
      if (online) setSelectedServer(online);
    };
    loadServers();
  }, []);

  // Simulate backup progress
  useEffect(() => {
    const interval = setInterval(() => {
      setBackups((prev) =>
        prev.map((b) => {
          if (b.status === "in_progress" && b.progress !== undefined) {
            if (b.progress >= 100) {
              return { ...b, status: "completed", progress: undefined, size: 4.2 * 1024 * 1024 * 1024 };
            }
            return { ...b, progress: Math.min(100, b.progress + 5) };
          }
          return b;
        })
      );
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const formatSize = (bytes: number) => {
    if (bytes === 0) return "-";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
    return `${(bytes / 1024 / 1024 / 1024).toFixed(2)} GB`;
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getTypeIcon = (type: Backup["type"]) => {
    switch (type) {
      case "full":
        return "💾";
      case "incremental":
        return "📦";
      case "snapshot":
        return "📸";
    }
  };

  const getStatusBadge = (backup: Backup) => {
    switch (backup.status) {
      case "completed":
        return <span className="px-2 py-0.5 rounded text-xs font-medium bg-success/10 text-success">Completed</span>;
      case "in_progress":
        return (
          <div className="flex items-center gap-2">
            <div className="w-20 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all duration-300"
                style={{ width: `${backup.progress}%` }}
              />
            </div>
            <span className="text-xs text-primary font-medium">{backup.progress}%</span>
          </div>
        );
      case "failed":
        return <span className="px-2 py-0.5 rounded text-xs font-medium bg-error/10 text-error">Failed</span>;
    }
  };

  const deleteBackup = (id: string) => {
    setBackups((prev) => prev.filter((b) => b.id !== id));
  };

  const createBackup = (type: Backup["type"]) => {
    const newBackup: Backup = {
      id: `backup-${Date.now()}`,
      name: `${type === "snapshot" ? "Manual Snapshot" : type === "full" ? "Manual Full Backup" : "Manual Incremental"}`,
      type,
      size: 0,
      createdAt: new Date().toISOString(),
      status: "in_progress",
      progress: 0,
      retention: type === "snapshot" ? "until deleted" : "7 days",
    };
    setBackups((prev) => [newBackup, ...prev]);
    setShowCreateModal(false);
  };

  const filteredBackups = backups.filter((b) => filter === "all" || b.type === filter);

  const totalSize = backups
    .filter((b) => b.status === "completed")
    .reduce((acc, b) => acc + b.size, 0);

  const headerSpring = useSpring({
    from: { opacity: 0, transform: "translateY(-20px)" },
    to: { opacity: 1, transform: "translateY(0px)" },
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <animated.div style={headerSpring} className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Backups</h1>
          <p className="text-muted mt-1">Manage server backups and snapshots</p>
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
          <div className="text-6xl mb-4">💾</div>
          <h3 className="text-xl font-semibold text-foreground mb-2">No server selected</h3>
          <p className="text-muted">Select a server to manage backups</p>
        </GlassCard>
      ) : (
        <>
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <GlassCard className="p-4 text-center">
              <div className="text-2xl font-bold text-primary">{backups.length}</div>
              <div className="text-sm text-muted">Total Backups</div>
            </GlassCard>
            <GlassCard className="p-4 text-center">
              <div className="text-2xl font-bold text-success">{formatSize(totalSize)}</div>
              <div className="text-sm text-muted">Storage Used</div>
            </GlassCard>
            <GlassCard className="p-4 text-center">
              <div className="text-2xl font-bold text-secondary">{backups.filter((b) => b.type === "snapshot").length}</div>
              <div className="text-sm text-muted">Snapshots</div>
            </GlassCard>
            <GlassCard className="p-4 text-center">
              <div className="text-2xl font-bold text-warning">{backups.filter((b) => b.status === "in_progress").length}</div>
              <div className="text-sm text-muted">In Progress</div>
            </GlassCard>
          </div>

          {/* Toolbar */}
          <GlassCard className="p-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              {(["all", "full", "incremental", "snapshot"] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => setFilter(type)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium capitalize transition-colors ${
                    filter === type ? "bg-primary text-white" : "text-muted hover:bg-gray-100 dark:hover:bg-gray-800"
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>

            <button onClick={() => setShowCreateModal(true)} className="btn-primary flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              Create Backup
            </button>
          </GlassCard>

          {/* Backups List */}
          <WindowPanel title={`Backups (${filteredBackups.length})`}>
            <div className="divide-y divide-border">
              {filteredBackups.map((backup) => (
                <div key={backup.id} className="flex items-center gap-4 px-4 py-4 hover:bg-gray-50 dark:hover:bg-gray-800/30">
                  <span className="text-2xl">{getTypeIcon(backup.type)}</span>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-foreground">{backup.name}</div>
                    <div className="flex items-center gap-4 mt-1 text-sm text-muted">
                      <span className="capitalize">{backup.type}</span>
                      <span>•</span>
                      <span>{formatDate(backup.createdAt)}</span>
                      <span>•</span>
                      <span>{backup.retention}</span>
                    </div>
                  </div>
                  <div className="text-right mr-4">
                    <div className="font-mono text-foreground">{formatSize(backup.size)}</div>
                    <div className="mt-1">{getStatusBadge(backup)}</div>
                  </div>
                  <div className="flex gap-1">
                    {backup.status === "completed" && (
                      <>
                        <IconButton label="Restore">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                          </svg>
                        </IconButton>
                        <IconButton label="Download">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                          </svg>
                        </IconButton>
                      </>
                    )}
                    <IconButton label="Delete" variant="danger" onClick={() => deleteBackup(backup.id)}>
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </IconButton>
                  </div>
                </div>
              ))}
            </div>
          </WindowPanel>

          {/* Create Backup Modal */}
          {showCreateModal && (
            <CreateBackupModal onClose={() => setShowCreateModal(false)} onCreate={createBackup} />
          )}
        </>
      )}
    </div>
  );
}

function CreateBackupModal({
  onClose,
  onCreate,
}: {
  onClose: () => void;
  onCreate: (type: Backup["type"]) => void;
}) {
  const modalSpring = useSpring({
    from: { opacity: 0, transform: "scale(0.95)" },
    to: { opacity: 1, transform: "scale(1)" },
  });

  const options = [
    { type: "snapshot" as const, icon: "📸", title: "Snapshot", desc: "Quick point-in-time capture of the server state" },
    { type: "full" as const, icon: "💾", title: "Full Backup", desc: "Complete backup of all data and configurations" },
    { type: "incremental" as const, icon: "📦", title: "Incremental", desc: "Backup only changes since last backup" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <animated.div style={modalSpring} className="relative w-full max-w-md">
        <GlassCard className="p-6">
          <h3 className="text-xl font-bold text-foreground mb-6">Create Backup</h3>
          <div className="space-y-3">
            {options.map((opt) => (
              <button
                key={opt.type}
                onClick={() => onCreate(opt.type)}
                className="w-full p-4 rounded-xl border border-border hover:border-primary hover:bg-primary/5 transition-all flex items-center gap-4 text-left"
              >
                <span className="text-3xl">{opt.icon}</span>
                <div>
                  <div className="font-medium text-foreground">{opt.title}</div>
                  <div className="text-sm text-muted">{opt.desc}</div>
                </div>
              </button>
            ))}
          </div>
          <button onClick={onClose} className="btn-secondary w-full mt-4">
            Cancel
          </button>
        </GlassCard>
      </animated.div>
    </div>
  );
}
