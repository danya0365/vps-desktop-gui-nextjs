"use client";

import type { ServerOS, VpsServer } from "@/src/domain/entities/VpsServer";
import { vpsServerRepository } from "@/src/infrastructure/repositories/VpsRepositoryFactory";
import { GlassCard } from "@/src/presentation/components/ui/GlassCard";
import { IconButton } from "@/src/presentation/components/ui/IconButton";
import { StatusIndicator } from "@/src/presentation/components/ui/StatusIndicator";
import { WindowPanel } from "@/src/presentation/components/ui/WindowPanel";
import { animated, useSpring, useTrail } from "@react-spring/web";
import { useEffect, useState } from "react";

export default function ServersPage() {
  const [servers, setServers] = useState<VpsServer[]>([]);
  const [filteredServers, setFilteredServers] = useState<VpsServer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedServer, setSelectedServer] = useState<VpsServer | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingServer, setEditingServer] = useState<VpsServer | null>(null);
  const [deletingServer, setDeletingServer] = useState<VpsServer | null>(null);

  useEffect(() => {
    const loadData = async () => {
      const serversData = await vpsServerRepository.getAll();
      setServers(serversData);
      setFilteredServers(serversData);
      setLoading(false);
    };
    loadData();
  }, []);

  // Filter servers based on search and status
  useEffect(() => {
    let result = servers;

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (s) =>
          s.name.toLowerCase().includes(term) ||
          s.hostname.toLowerCase().includes(term) ||
          s.ipAddress.includes(term) ||
          s.tags.some((t) => t.toLowerCase().includes(term))
      );
    }

    if (statusFilter !== "all") {
      result = result.filter((s) => s.status === statusFilter);
    }

    setFilteredServers(result);
  }, [searchTerm, statusFilter, servers]);

  // Animation
  const headerSpring = useSpring({
    from: { opacity: 0, transform: "translateY(-20px)" },
    to: { opacity: 1, transform: "translateY(0px)" },
    delay: 100,
  });

  const serverTrail = useTrail(filteredServers.length, {
    from: { opacity: 0, transform: "scale(0.95)" },
    to: { opacity: 1, transform: "scale(1)" },
    delay: 200,
  });

  if (loading) {
    return <LoadingSkeleton />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <animated.div style={headerSpring} className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Servers</h1>
          <p className="text-muted mt-1">Manage your VPS instances</p>
        </div>

        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="relative">
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
              placeholder="Search servers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-64 rounded-xl bg-surface border border-border focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 rounded-xl bg-surface border border-border focus:border-primary focus:outline-none cursor-pointer"
          >
            <option value="all">All Status</option>
            <option value="online">Online</option>
            <option value="offline">Offline</option>
            <option value="maintenance">Maintenance</option>
            <option value="error">Error</option>
          </select>

          {/* Add Server Button */}
          <button onClick={() => setShowAddModal(true)} className="btn-primary flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Add Server
          </button>
        </div>
      </animated.div>

      {/* Server Grid */}
      {filteredServers.length === 0 ? (
        <EmptyState searchTerm={searchTerm} statusFilter={statusFilter} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredServers.map((server, index) => (
            <animated.div key={server.id} style={serverTrail[index]}>
              <ServerCard
                server={server}
                onSelect={() => setSelectedServer(server)}
              />
            </animated.div>
          ))}
        </div>
      )}

      {/* Server Detail Modal */}
      {selectedServer && (
        <ServerDetailModal
          server={selectedServer}
          onClose={() => setSelectedServer(null)}
          onEdit={() => {
            setEditingServer(selectedServer);
            setSelectedServer(null);
          }}
          onDelete={() => {
            setDeletingServer(selectedServer);
            setSelectedServer(null);
          }}
        />
      )}

      {/* Add Server Modal */}
      {showAddModal && (
        <AddEditServerModal
          onClose={() => setShowAddModal(false)}
          onSave={(serverData) => {
            const now = new Date().toISOString();
            const newServer: VpsServer = {
              id: `server-${Date.now()}`,
              name: serverData.name || "New Server",
              hostname: serverData.hostname || "new-server",
              ipAddress: serverData.ipAddress || "0.0.0.0",
              port: 22,
              os: serverData.os || "ubuntu",
              osVersion: serverData.osVersion || "22.04 LTS",
              location: serverData.location || "Unknown",
              provider: serverData.provider || "Unknown",
              tags: serverData.tags || [],
              status: "online",
              cpu: { usage: 0, cores: 4 },
              memory: { usage: 0, total: 16, used: 0 },
              storage: { usage: 0, total: 100, used: 0 },
              network: { inbound: 0, outbound: 0 },
              uptime: 0,
              lastUpdated: now,
              createdAt: now,
            };
            setServers((prev) => [newServer, ...prev]);
            setShowAddModal(false);
          }}
        />
      )}

      {/* Edit Server Modal */}
      {editingServer && (
        <AddEditServerModal
          server={editingServer}
          onClose={() => setEditingServer(null)}
          onSave={(serverData) => {
            setServers((prev) =>
              prev.map((s) => (s.id === editingServer.id ? { ...s, ...serverData } : s))
            );
            setEditingServer(null);
          }}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deletingServer && (
        <DeleteConfirmModal
          server={deletingServer}
          onClose={() => setDeletingServer(null)}
          onConfirm={() => {
            setServers((prev) => prev.filter((s) => s.id !== deletingServer.id));
            setDeletingServer(null);
          }}
        />
      )}
    </div>
  );
}

// Server Card Component
function ServerCard({
  server,
  onSelect,
}: {
  server: VpsServer;
  onSelect: () => void;
}) {
  return (
    <GlassCard onClick={onSelect} className="p-5 cursor-pointer">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
            <ServerIcon os={server.os} />
          </div>
          <div>
            <h4 className="font-semibold text-foreground">{server.name}</h4>
            <p className="text-xs text-muted">{server.ipAddress}</p>
          </div>
        </div>
        <StatusIndicator status={server.status} showLabel />
      </div>

      {/* Metrics */}
      <div className="space-y-3">
        <MetricBar label="CPU" value={server.cpu.usage} color="bg-primary" />
        <MetricBar label="RAM" value={server.memory.usage} color="bg-secondary" />
        <MetricBar label="Disk" value={server.storage.usage} color="bg-accent" />
      </div>

      {/* Tags */}
      <div className="flex flex-wrap gap-1.5 mt-4">
        {server.tags.map((tag) => (
          <span
            key={tag}
            className="px-2 py-0.5 text-xs rounded-full bg-gray-100 dark:bg-gray-800 text-muted"
          >
            {tag}
          </span>
        ))}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between mt-4 pt-3 border-t border-border">
        <span className="text-xs text-muted">📍 {server.location}</span>
        <span className="text-xs text-muted">{server.provider}</span>
      </div>
    </GlassCard>
  );
}

// Server Detail Modal
function ServerDetailModal({
  server,
  onClose,
  onEdit,
  onDelete,
}: {
  server: VpsServer;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const modalSpring = useSpring({
    from: { opacity: 0, transform: "scale(0.95)" },
    to: { opacity: 1, transform: "scale(1)" },
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <animated.div style={modalSpring} className="relative w-full max-w-2xl">
        <WindowPanel
          title={server.name}
          icon={<ServerIcon os={server.os} />}
          actions={
            <IconButton onClick={onClose} label="Close">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </IconButton>
          }
        >
          <div className="space-y-6">
            {/* Status & Quick Actions */}
            <div className="flex items-center justify-between">
              <StatusIndicator status={server.status} showLabel size="lg" />
              <div className="flex gap-2">
                <button onClick={onEdit} className="btn-secondary text-sm">Edit</button>
                <button onClick={onDelete} className="btn-secondary text-sm text-error">Delete</button>
                <button className="btn-primary text-sm">Connect SSH</button>
              </div>
            </div>

            {/* Server Info Grid */}
            <div className="grid grid-cols-2 gap-4">
              <InfoItem label="Hostname" value={server.hostname} />
              <InfoItem label="IP Address" value={server.ipAddress} />
              <InfoItem label="Operating System" value={`${server.os} ${server.osVersion}`} />
              <InfoItem label="Location" value={server.location} />
              <InfoItem label="Provider" value={server.provider} />
              <InfoItem
                label="Uptime"
                value={server.uptime > 0 ? `${Math.floor(server.uptime / 24)} days` : "Down"}
              />
            </div>

            {/* Resource Usage */}
            <div className="space-y-4">
              <h4 className="font-semibold text-foreground">Resource Usage</h4>
              <div className="grid grid-cols-3 gap-4">
                <ResourceCard
                  label="CPU"
                  value={server.cpu.usage}
                  detail={`${server.cpu.cores} cores`}
                  color="text-primary"
                />
                <ResourceCard
                  label="Memory"
                  value={server.memory.usage}
                  detail={`${server.memory.used}/${server.memory.total} GB`}
                  color="text-secondary"
                />
                <ResourceCard
                  label="Storage"
                  value={server.storage.usage}
                  detail={`${server.storage.used}/${server.storage.total} GB`}
                  color="text-accent"
                />
              </div>
            </div>

            {/* Network */}
            <div className="flex gap-4">
              <div className="flex-1 p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50">
                <div className="text-sm text-muted mb-1">↓ Inbound</div>
                <div className="text-xl font-bold text-success">{server.network.inbound} Mbps</div>
              </div>
              <div className="flex-1 p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50">
                <div className="text-sm text-muted mb-1">↑ Outbound</div>
                <div className="text-xl font-bold text-primary">{server.network.outbound} Mbps</div>
              </div>
            </div>
          </div>
        </WindowPanel>
      </animated.div>
    </div>
  );
}

// Helper Components
function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50">
      <div className="text-xs text-muted mb-1">{label}</div>
      <div className="font-medium text-foreground truncate">{value}</div>
    </div>
  );
}

function ResourceCard({
  label,
  value,
  detail,
  color,
}: {
  label: string;
  value: number;
  detail: string;
  color: string;
}) {
  return (
    <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 text-center">
      <div className="text-sm text-muted mb-2">{label}</div>
      <div className={`text-3xl font-bold ${color}`}>{value}%</div>
      <div className="text-xs text-muted mt-1">{detail}</div>
    </div>
  );
}

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
      <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <div
          className={`h-full ${color} rounded-full transition-all duration-500`}
          style={{ width: `${Math.min(value, 100)}%` }}
        />
      </div>
      <span className="text-xs text-muted w-10 text-right">{value}%</span>
    </div>
  );
}

function ServerIcon({ os }: { os: string }) {
  switch (os) {
    case "ubuntu":
      return <span className="text-2xl">🐧</span>;
    case "debian":
      return <span className="text-2xl">🔴</span>;
    case "centos":
      return <span className="text-2xl">🎯</span>;
    case "windows":
      return <span className="text-2xl">🪟</span>;
    default:
      return <span className="text-2xl">🖥️</span>;
  }
}

function EmptyState({
  searchTerm,
  statusFilter,
}: {
  searchTerm: string;
  statusFilter: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <div className="text-6xl mb-4">🔍</div>
      <h3 className="text-xl font-semibold text-foreground mb-2">No servers found</h3>
      <p className="text-muted text-center max-w-md">
        {searchTerm || statusFilter !== "all"
          ? "Try adjusting your search or filter criteria"
          : "Add your first server to get started"}
      </p>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="flex justify-between">
        <div className="h-10 w-48 bg-gray-200 dark:bg-gray-700 rounded-lg" />
        <div className="flex gap-3">
          <div className="h-10 w-64 bg-gray-200 dark:bg-gray-700 rounded-xl" />
          <div className="h-10 w-32 bg-gray-200 dark:bg-gray-700 rounded-xl" />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-64 bg-gray-200 dark:bg-gray-700 rounded-2xl" />
        ))}
      </div>
    </div>
  );
}

// Add/Edit Server Modal
function AddEditServerModal({
  server,
  onClose,
  onSave,
}: {
  server?: VpsServer;
  onClose: () => void;
  onSave: (data: Partial<VpsServer>) => void;
}) {
  const [formData, setFormData] = useState({
    name: server?.name || "",
    hostname: server?.hostname || "",
    ipAddress: server?.ipAddress || "",
    os: server?.os || "ubuntu",
    osVersion: server?.osVersion || "22.04 LTS",
    location: server?.location || "",
    provider: server?.provider || "",
    tags: server?.tags?.join(", ") || "",
  });

  const modalSpring = useSpring({
    from: { opacity: 0, transform: "scale(0.95)" },
    to: { opacity: 1, transform: "scale(1)" },
  });

  const handleSubmit = () => {
    onSave({
      ...formData,
      tags: formData.tags.split(",").map((t) => t.trim()).filter(Boolean),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <animated.div style={modalSpring} className="relative w-full max-w-lg">
        <GlassCard className="p-6">
          <h3 className="text-xl font-bold text-foreground mb-6">
            {server ? "Edit Server" : "Add New Server"}
          </h3>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Server Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 rounded-xl bg-surface border border-border focus:border-primary focus:outline-none"
                placeholder="e.g., Production Web Server"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Hostname</label>
                <input
                  type="text"
                  value={formData.hostname}
                  onChange={(e) => setFormData({ ...formData, hostname: e.target.value })}
                  className="w-full px-4 py-2 rounded-xl bg-surface border border-border focus:border-primary focus:outline-none"
                  placeholder="e.g., web-prod-01"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">IP Address</label>
                <input
                  type="text"
                  value={formData.ipAddress}
                  onChange={(e) => setFormData({ ...formData, ipAddress: e.target.value })}
                  className="w-full px-4 py-2 rounded-xl bg-surface border border-border focus:border-primary focus:outline-none"
                  placeholder="e.g., 192.168.1.100"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">OS</label>
                <select
                  value={formData.os}
                  onChange={(e) => setFormData({ ...formData, os: e.target.value as ServerOS })}
                  className="w-full px-4 py-2 rounded-xl bg-surface border border-border focus:border-primary focus:outline-none"
                >
                  <option value="ubuntu">Ubuntu</option>
                  <option value="debian">Debian</option>
                  <option value="centos">CentOS</option>
                  <option value="windows">Windows</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">OS Version</label>
                <input
                  type="text"
                  value={formData.osVersion}
                  onChange={(e) => setFormData({ ...formData, osVersion: e.target.value })}
                  className="w-full px-4 py-2 rounded-xl bg-surface border border-border focus:border-primary focus:outline-none"
                  placeholder="e.g., 22.04 LTS"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Location</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full px-4 py-2 rounded-xl bg-surface border border-border focus:border-primary focus:outline-none"
                  placeholder="e.g., Singapore"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Provider</label>
                <input
                  type="text"
                  value={formData.provider}
                  onChange={(e) => setFormData({ ...formData, provider: e.target.value })}
                  className="w-full px-4 py-2 rounded-xl bg-surface border border-border focus:border-primary focus:outline-none"
                  placeholder="e.g., DigitalOcean"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Tags (comma separated)</label>
              <input
                type="text"
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                className="w-full px-4 py-2 rounded-xl bg-surface border border-border focus:border-primary focus:outline-none"
                placeholder="e.g., production, web, nginx"
              />
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <button onClick={onClose} className="btn-secondary flex-1">
              Cancel
            </button>
            <button onClick={handleSubmit} className="btn-primary flex-1">
              {server ? "Save Changes" : "Add Server"}
            </button>
          </div>
        </GlassCard>
      </animated.div>
    </div>
  );
}

// Delete Confirmation Modal
function DeleteConfirmModal({
  server,
  onClose,
  onConfirm,
}: {
  server: VpsServer;
  onClose: () => void;
  onConfirm: () => void;
}) {
  const modalSpring = useSpring({
    from: { opacity: 0, transform: "scale(0.95)" },
    to: { opacity: 1, transform: "scale(1)" },
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <animated.div style={modalSpring} className="relative w-full max-w-md">
        <GlassCard className="p-6 text-center">
          <div className="w-16 h-16 rounded-full bg-error/10 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-error" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-foreground mb-2">Delete Server?</h3>
          <p className="text-muted mb-6">
            Are you sure you want to delete <strong>{server.name}</strong>? This action cannot be undone.
          </p>
          <div className="flex gap-3">
            <button onClick={onClose} className="btn-secondary flex-1">
              Cancel
            </button>
            <button onClick={onConfirm} className="btn-primary flex-1 !bg-error hover:!bg-error/90">
              Delete Server
            </button>
          </div>
        </GlassCard>
      </animated.div>
    </div>
  );
}

