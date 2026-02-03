"use client";

import type { VpsServer } from "@/src/domain/entities/VpsServer";
import { mockVpsServerRepository } from "@/src/infrastructure/repositories/mock/MockVpsServerRepository";
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

  useEffect(() => {
    const loadData = async () => {
      const serversData = await mockVpsServerRepository.getAll();
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
          <button className="btn-primary flex items-center gap-2">
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
}: {
  server: VpsServer;
  onClose: () => void;
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
                <button className="btn-secondary text-sm">Restart</button>
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
