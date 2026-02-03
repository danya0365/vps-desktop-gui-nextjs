/**
 * ServersView
 * UI component for server management
 * Following Clean Architecture - Presentation Layer
 */

'use client';

import type { ServerOS, VpsServer } from "@/src/domain/entities/VpsServer";
import { GlassCard } from "@/src/presentation/components/ui/GlassCard";
import { IconButton } from "@/src/presentation/components/ui/IconButton";
import { StatusIndicator } from "@/src/presentation/components/ui/StatusIndicator";
import { WindowPanel } from "@/src/presentation/components/ui/WindowPanel";
import { animated, useSpring } from "@react-spring/web";
import Link from "next/link";
import React, { useState } from "react";
import { ServersViewModel } from "../../presenters/servers/ServersPresenter";
import { useServersPresenter } from "../../presenters/servers/useServersPresenter";

interface ServersViewProps {
  initialViewModel: ServersViewModel;
}

export const ServersView: React.FC<ServersViewProps> = ({ initialViewModel }) => {
  const [state, actions] = useServersPresenter(initialViewModel);
  const { 
    filteredServers, 
    loading, 
    searchTerm, 
    statusFilter,
    selectedServer,
    isAddModalOpen,
    editingServer,
    deletingServer
  } = state;

  // Header animation
  const headerSpring = useSpring({
    from: { opacity: 0, transform: "translateY(-20px)" },
    to: { opacity: 1, transform: "translateY(0px)" },
    config: { tension: 280, friction: 60 },
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <animated.div style={headerSpring} className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Servers</h1>
          <p className="text-muted mt-1">Manage and monitor your VPS instances</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Search */}
          <div className="relative min-w-[240px]">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search servers..."
              value={searchTerm}
              onChange={(e) => actions.setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2.5 w-full rounded-2xl bg-white/5 dark:bg-gray-800/40 border border-white/10 dark:border-gray-700/50 focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all font-medium"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => actions.setStatusFilter(e.target.value)}
            className="px-4 py-2.5 rounded-2xl bg-white/5 dark:bg-gray-800/40 border border-white/10 dark:border-gray-700/50 focus:border-primary focus:outline-none cursor-pointer font-medium"
          >
            <option value="all">All Status</option>
            <option value="online">Online</option>
            <option value="offline">Offline</option>
            <option value="maintenance">Maintenance</option>
            <option value="error">Error</option>
          </select>

          {/* Add Server Button */}
          <button 
            onClick={actions.openAddModal} 
            className="bg-primary text-white px-5 py-2.5 rounded-2xl font-bold flex items-center gap-2 shadow-lg shadow-primary/25 hover:bg-primary/90 transition-all active:scale-95"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Add Server
          </button>
        </div>
      </animated.div>

      {/* Server Grid */}
      {filteredServers.length === 0 ? (
        <EmptyState searchTerm={searchTerm} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredServers.map((server, index) => (
            <FadeIn key={server.id} delay={100 + index * 50}>
              <ServerCard
                server={server}
                onSelect={() => actions.openDetailModal(server)}
              />
            </FadeIn>
          ))}
        </div>
      )}

      {/* Modals */}
      {selectedServer && (
        <ServerDetailModal
          server={selectedServer}
          onClose={actions.closeDetailModal}
          onEdit={() => actions.openEditModal(selectedServer)}
          onDelete={() => actions.openDeleteModal(selectedServer)}
        />
      )}

      {isAddModalOpen && (
        <AddEditServerModal
          onClose={actions.closeAddModal}
          onSave={actions.createServer}
          loading={loading}
        />
      )}

      {editingServer && (
        <AddEditServerModal
          server={editingServer}
          onClose={actions.closeEditModal}
          onSave={(data: any) => actions.updateServer(editingServer.id, data)}
          loading={loading}
        />
      )}

      {deletingServer && (
        <DeleteConfirmModal
          server={deletingServer}
          onClose={actions.closeDeleteModal}
          onConfirm={() => actions.deleteServer(deletingServer.id)}
          loading={loading}
        />
      )}
    </div>
  );
};

// --- Sub-components ---

function FadeIn({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const spring = useSpring({
    from: { opacity: 0, transform: "scale(0.98) translateY(10px)" },
    to: { opacity: 1, transform: "scale(1) translateY(0px)" },
    delay,
    config: { tension: 300, friction: 30 },
  });
  return <animated.div style={spring}>{children}</animated.div>;
}

function ServerCard({ server, onSelect }: { server: VpsServer; onSelect: () => void }) {
  return (
    <GlassCard onClick={onSelect} className="p-6 cursor-pointer group hover:scale-[1.02] hover:shadow-2xl transition-all duration-300">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
            <ServerIcon os={server.os} size="lg" />
          </div>
          <div>
            <h4 className="font-bold text-lg text-foreground truncate max-w-[160px]">{server.name}</h4>
            <p className="text-xs text-muted font-mono">{server.ipAddress}</p>
          </div>
        </div>
        <StatusIndicator status={server.status} showLabel />
      </div>

      <div className="space-y-4">
        <MetricBar label="CPU" value={server.cpu.usage} color="bg-primary" />
        <MetricBar label="RAM" value={server.memory.usage} color="bg-secondary" />
        <MetricBar label="Disk" value={server.storage.usage} color="bg-emerald-500" />
      </div>

      <div className="flex flex-wrap gap-2 mt-5">
        {server.tags.slice(0, 3).map((tag) => (
          <span key={tag} className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-lg bg-gray-100 dark:bg-white/5 text-muted border border-border/50">
            {tag}
          </span>
        ))}
        {server.tags.length > 3 && (
          <span className="text-[10px] text-muted font-bold self-center">+{server.tags.length - 3}</span>
        )}
      </div>

      <div className="flex items-center justify-between mt-6 pt-4 border-t border-border/50">
        <span className="text-xs font-bold text-muted uppercase tracking-widest">📍 {server.location}</span>
        <span className="text-xs font-medium text-muted/60 bg-gray-100 dark:bg-white/5 px-2 py-0.5 rounded-md">{server.provider}</span>
      </div>
    </GlassCard>
  );
}

function ServerDetailModal({ server, onClose, onEdit, onDelete }: any) {
  const modalSpring = useSpring({
    from: { opacity: 0, transform: "scale(0.95)" },
    to: { opacity: 1, transform: "scale(1)" },
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={onClose} />
      <animated.div style={modalSpring} className="relative w-full max-w-2xl">
        <WindowPanel
          title={server.name}
          icon={<ServerIcon os={server.os} />}
          actions={
            <IconButton onClick={onClose} label="Close">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </IconButton>
          }
        >
          <div className="space-y-8 p-2">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <StatusIndicator status={server.status} showLabel size="lg" />
              <div className="flex flex-wrap gap-3">
                <button onClick={onEdit} className="px-4 py-2 rounded-xl bg-gray-100 dark:bg-white/5 font-bold text-sm hover:bg-gray-200 dark:hover:bg-white/10 transition-all">Edit Details</button>
                <button onClick={onDelete} className="px-4 py-2 rounded-xl bg-red-500/10 text-red-500 font-bold text-sm hover:bg-red-500/20 transition-all">Delete</button>
                <Link href={`/terminal?server=${server.id}`} className="px-6 py-2 rounded-xl bg-primary text-white font-bold text-sm shadow-lg shadow-primary/20 hover:scale-105 transition-all">Connect SSH</Link>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <InfoItem label="Hostname" value={server.hostname} />
              <InfoItem label="IP Address" value={server.ipAddress} />
              <InfoItem label="OS" value={`${server.os} ${server.osVersion}`} />
              <InfoItem label="Location" value={server.location} />
              <InfoItem label="Provider" value={server.provider} />
              <InfoItem label="Uptime" value={server.uptime > 0 ? `${Math.floor(server.uptime / 24)}d ${server.uptime % 24}h` : "Offline"} />
            </div>

            <div className="space-y-4">
              <h4 className="text-sm font-bold text-muted uppercase tracking-widest px-1">Resource Health</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <ResourceCard label="CPU" value={server.cpu.usage} detail={`${server.cpu.cores} Cores`} color="text-primary" />
                <ResourceCard label="Memory" value={server.memory.usage} detail={`${server.memory.used}/${server.memory.total} GB`} color="text-secondary" />
                <ResourceCard label="Storage" value={server.storage.usage} detail={`${server.storage.used}/${server.storage.total} GB`} color="text-emerald-500" />
              </div>
            </div>

            <div className="flex gap-4 p-5 rounded-2xl bg-gray-50/50 dark:bg-white/5 border border-border/30">
              <div className="flex-1">
                <div className="text-[10px] font-bold text-muted uppercase mb-1">Incoming</div>
                <div className="text-xl font-mono font-bold text-emerald-500">{server.network.inbound} <span className="text-xs">MBPS</span></div>
              </div>
              <div className="w-px bg-border/30" />
              <div className="flex-1">
                <div className="text-[10px] font-bold text-muted uppercase mb-1">Outgoing</div>
                <div className="text-xl font-mono font-bold text-primary">{server.network.outbound} <span className="text-xs">MBPS</span></div>
              </div>
            </div>
          </div>
        </WindowPanel>
      </animated.div>
    </div>
  );
}

function AddEditServerModal({ server, onClose, onSave, loading }: any) {
  const [formData, setFormData] = useState({
    name: server?.name || "",
    hostname: server?.hostname || "",
    ipAddress: server?.ipAddress || "",
    os: (server?.os || "ubuntu") as ServerOS,
    osVersion: server?.osVersion || "22.04 LTS",
    location: server?.location || "",
    provider: server?.provider || "",
    tags: server?.tags?.join(", ") || "",
  });

  const modalSpring = useSpring({
    from: { opacity: 0, transform: "translateY(20px) scale(0.98)" },
    to: { opacity: 1, transform: "translateY(0px) scale(1)" },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...formData,
      tags: formData.tags.split(",").map((t: string) => t.trim()).filter(Boolean),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <animated.div style={modalSpring} className="relative w-full max-w-lg">
        <GlassCard className="p-8">
          <h3 className="text-2xl font-bold text-foreground mb-8">
            {server ? "Edit Server Configuration" : "Deploy New Server"}
          </h3>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-muted uppercase tracking-widest mb-2 px-1">Friendly Name</label>
              <input
                required
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 rounded-2xl bg-white/5 dark:bg-gray-800/40 border border-border focus:border-primary focus:outline-none transition-all font-medium"
                placeholder="e.g., Production Web 01"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-muted uppercase tracking-widest mb-2 px-1">Hostname</label>
                <input
                  required
                  type="text"
                  value={formData.hostname}
                  onChange={(e) => setFormData({ ...formData, hostname: e.target.value })}
                  className="w-full px-4 py-3 rounded-2xl bg-white/5 dark:bg-gray-800/40 border border-border focus:border-primary focus:outline-none transition-all font-medium"
                  placeholder="web-01"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-muted uppercase tracking-widest mb-2 px-1">IP Address</label>
                <input
                  required
                  type="text"
                  value={formData.ipAddress}
                  onChange={(e) => setFormData({ ...formData, ipAddress: e.target.value })}
                  className="w-full px-4 py-3 rounded-2xl bg-white/5 dark:bg-gray-800/40 border border-border focus:border-primary focus:outline-none transition-all font-medium font-mono"
                  placeholder="123.123.123.123"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-muted uppercase tracking-widest mb-2 px-1">OS Family</label>
                <select
                  value={formData.os}
                  onChange={(e) => setFormData({ ...formData, os: e.target.value as ServerOS })}
                  className="w-full px-4 py-3 rounded-2xl bg-white/5 dark:bg-gray-800/40 border border-border focus:border-primary focus:outline-none transition-all font-medium appearance-none"
                >
                  <option value="ubuntu">Ubuntu</option>
                  <option value="debian">Debian</option>
                  <option value="centos">CentOS</option>
                  <option value="windows">Windows</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-muted uppercase tracking-widest mb-2 px-1">Release Version</label>
                <input
                  required
                  type="text"
                  value={formData.osVersion}
                  onChange={(e) => setFormData({ ...formData, osVersion: e.target.value })}
                  className="w-full px-4 py-3 rounded-2xl bg-white/5 dark:bg-gray-800/40 border border-border focus:border-primary focus:outline-none transition-all font-medium"
                  placeholder="22.04 LTS"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-muted uppercase tracking-widest mb-2 px-1">Region</label>
                <input
                  required
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full px-4 py-3 rounded-2xl bg-white/5 dark:bg-gray-800/40 border border-border focus:border-primary focus:outline-none transition-all font-medium"
                  placeholder="Singapore"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-muted uppercase tracking-widest mb-2 px-1">Infrastructure</label>
                <input
                  required
                  type="text"
                  value={formData.provider}
                  onChange={(e) => setFormData({ ...formData, provider: e.target.value })}
                  className="w-full px-4 py-3 rounded-2xl bg-white/5 dark:bg-gray-800/40 border border-border focus:border-primary focus:outline-none transition-all font-medium"
                  placeholder="GCP / AWS / DO"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-muted uppercase tracking-widest mb-2 px-1">Tags (Comma Separated)</label>
              <input
                type="text"
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                className="w-full px-4 py-3 rounded-2xl bg-white/5 dark:bg-gray-800/40 border border-border focus:border-primary focus:outline-none transition-all font-medium"
                placeholder="production, web, nginx"
              />
            </div>

            <div className="flex gap-4 pt-4">
              <button 
                type="button"
                onClick={onClose} 
                className="flex-1 px-6 py-3.5 rounded-2xl bg-gray-100 dark:bg-white/5 font-bold hover:bg-gray-200 dark:hover:bg-white/10 transition-all active:scale-95"
              >
                Cancel
              </button>
              <button 
                type="submit"
                disabled={loading}
                className="flex-1 px-6 py-3.5 rounded-2xl bg-primary text-white font-bold shadow-xl shadow-primary/20 hover:bg-primary/90 transition-all active:scale-95 disabled:opacity-50"
              >
                {loading ? "Processing..." : server ? "Update Server" : "Save Server"}
              </button>
            </div>
          </form>
        </GlassCard>
      </animated.div>
    </div>
  );
}

function DeleteConfirmModal({ server, onClose, onConfirm, loading }: any) {
  const modalSpring = useSpring({
    from: { opacity: 0, transform: "scale(0.95)" },
    to: { opacity: 1, transform: "scale(1)" },
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={onClose} />
      <animated.div style={modalSpring} className="relative w-full max-w-md">
        <GlassCard className="p-10 text-center">
          <div className="w-20 h-20 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h3 className="text-2xl font-bold text-foreground mb-3">Terminate Server?</h3>
          <p className="text-muted leading-relaxed mb-8">
            This will permanently remove <strong>{server.name}</strong> from your dashboard. This action cannot be undone.
          </p>
          <div className="flex gap-4">
            <button onClick={onClose} className="flex-1 px-6 py-3.5 rounded-2xl bg-gray-100 dark:bg-white/5 font-bold hover:bg-gray-200 dark:hover:bg-white/10 transition-all">
              Abort
            </button>
            <button 
              onClick={onConfirm} 
              disabled={loading}
              className="flex-1 px-6 py-3.5 rounded-2xl bg-red-500 text-white font-bold shadow-xl shadow-red-500/20 hover:bg-red-600 transition-all active:scale-95 disabled:opacity-50"
            >
              {loading ? "Deleting..." : "Confirm Delete"}
            </button>
          </div>
        </GlassCard>
      </animated.div>
    </div>
  );
}

// --- Helpers ---

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="p-4 rounded-2xl bg-gray-50/50 dark:bg-white/5 border border-border/20">
      <div className="text-[10px] font-bold text-muted uppercase tracking-widest mb-1.5">{label}</div>
      <div className="font-bold text-foreground truncate">{value}</div>
    </div>
  );
}

function ResourceCard({ label, value, detail, color }: any) {
  return (
    <div className="p-5 rounded-2xl bg-gray-50/50 dark:bg-white/5 border border-border/20 text-center">
      <div className="text-[10px] font-bold text-muted uppercase mb-3">{label}</div>
      <div className={`text-3xl font-mono font-bold ${color} mb-1`}>{value}%</div>
      <div className="text-[10px] font-bold text-muted/60">{detail}</div>
    </div>
  );
}

function MetricBar({ label, value, color }: any) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-[10px] font-bold text-muted w-8 uppercase">{label}</span>
      <div className="flex-1 h-1.5 bg-gray-100 dark:bg-white/5 rounded-full overflow-hidden">
        <animated.div
          className={`h-full ${color} rounded-full transition-all duration-700`}
          style={{ width: `${Math.min(value, 100)}%` }}
        />
      </div>
      <span className="text-[10px] font-bold font-mono text-muted w-8 text-right">{value}%</span>
    </div>
  );
}

function ServerIcon({ os, size = "md" }: any) {
  const iconSize = size === "lg" ? "text-3xl" : "text-2xl";
  switch (os) {
    case "ubuntu": return <span className={iconSize}>🐧</span>;
    case "debian": return <span className={iconSize}>🔴</span>;
    case "centos": return <span className={iconSize}>🎯</span>;
    case "windows": return <span className={iconSize}>🪟</span>;
    default: return <span className={iconSize}>🖥️</span>;
  }
}

function EmptyState({ searchTerm }: any) {
  return (
    <div className="flex flex-col items-center justify-center py-24 bg-gray-50/30 dark:bg-white/5 rounded-[40px] border border-dashed border-border/50">
      <div className="text-7xl mb-6 grayscale opacity-50">🛰️</div>
      <h3 className="text-2xl font-bold text-foreground mb-3">No matching servers</h3>
      <p className="text-muted text-center max-w-sm font-medium">
        We couldn't find any servers matching your criteria. Try adjusting your filters or search terms.
      </p>
    </div>
  );
}
