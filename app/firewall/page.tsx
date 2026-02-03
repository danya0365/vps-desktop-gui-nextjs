"use client";

import type { VpsServer } from "@/src/domain/entities/VpsServer";
import { vpsServerRepository } from "@/src/infrastructure/repositories/VpsRepositoryFactory";
import { GlassCard } from "@/src/presentation/components/ui/GlassCard";
import { IconButton } from "@/src/presentation/components/ui/IconButton";
import { WindowPanel } from "@/src/presentation/components/ui/WindowPanel";
import { animated, useSpring } from "@react-spring/web";
import { useEffect, useState } from "react";

interface FirewallRule {
  id: string;
  name: string;
  protocol: "TCP" | "UDP" | "ICMP" | "ALL";
  port: string;
  source: string;
  destination: string;
  action: "allow" | "deny";
  enabled: boolean;
  description: string;
}

const mockFirewallRules: FirewallRule[] = [
  { id: "1", name: "SSH Access", protocol: "TCP", port: "22", source: "0.0.0.0/0", destination: "any", action: "allow", enabled: true, description: "Allow SSH connections" },
  { id: "2", name: "HTTP", protocol: "TCP", port: "80", source: "0.0.0.0/0", destination: "any", action: "allow", enabled: true, description: "Allow HTTP traffic" },
  { id: "3", name: "HTTPS", protocol: "TCP", port: "443", source: "0.0.0.0/0", destination: "any", action: "allow", enabled: true, description: "Allow HTTPS traffic" },
  { id: "4", name: "MySQL", protocol: "TCP", port: "3306", source: "10.0.0.0/8", destination: "any", action: "allow", enabled: true, description: "MySQL from internal network" },
  { id: "5", name: "Redis", protocol: "TCP", port: "6379", source: "127.0.0.1", destination: "any", action: "allow", enabled: true, description: "Redis localhost only" },
  { id: "6", name: "Block Telnet", protocol: "TCP", port: "23", source: "0.0.0.0/0", destination: "any", action: "deny", enabled: true, description: "Block telnet access" },
  { id: "7", name: "Docker API", protocol: "TCP", port: "2375", source: "192.168.1.0/24", destination: "any", action: "allow", enabled: false, description: "Docker API (disabled)" },
];

export default function FirewallPage() {
  const [servers, setServers] = useState<VpsServer[]>([]);
  const [selectedServer, setSelectedServer] = useState<VpsServer | null>(null);
  const [rules, setRules] = useState<FirewallRule[]>(mockFirewallRules);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingRule, setEditingRule] = useState<FirewallRule | null>(null);
  const [filter, setFilter] = useState<"all" | "allow" | "deny">("all");

  useEffect(() => {
    const loadServers = async () => {
      const data = await vpsServerRepository.getAll();
      setServers(data);
      const online = data.find((s) => s.status === "online");
      if (online) setSelectedServer(online);
    };
    loadServers();
  }, []);

  const toggleRule = (id: string) => {
    setRules((prev) =>
      prev.map((rule) => (rule.id === id ? { ...rule, enabled: !rule.enabled } : rule))
    );
  };

  const deleteRule = (id: string) => {
    setRules((prev) => prev.filter((rule) => rule.id !== id));
  };

  const filteredRules = rules.filter((rule) => {
    if (filter === "all") return true;
    return rule.action === filter;
  });

  const headerSpring = useSpring({
    from: { opacity: 0, transform: "translateY(-20px)" },
    to: { opacity: 1, transform: "translateY(0px)" },
  });

  const stats = {
    total: rules.length,
    allow: rules.filter((r) => r.action === "allow").length,
    deny: rules.filter((r) => r.action === "deny").length,
    disabled: rules.filter((r) => !r.enabled).length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <animated.div style={headerSpring} className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Firewall</h1>
          <p className="text-muted mt-1">Manage firewall rules and security</p>
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
          <div className="text-6xl mb-4">🔥</div>
          <h3 className="text-xl font-semibold text-foreground mb-2">No server selected</h3>
          <p className="text-muted">Select a server to manage firewall rules</p>
        </GlassCard>
      ) : (
        <>
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <GlassCard className="p-4 text-center">
              <div className="text-2xl font-bold text-primary">{stats.total}</div>
              <div className="text-sm text-muted">Total Rules</div>
            </GlassCard>
            <GlassCard className="p-4 text-center">
              <div className="text-2xl font-bold text-success">{stats.allow}</div>
              <div className="text-sm text-muted">Allow</div>
            </GlassCard>
            <GlassCard className="p-4 text-center">
              <div className="text-2xl font-bold text-error">{stats.deny}</div>
              <div className="text-sm text-muted">Deny</div>
            </GlassCard>
            <GlassCard className="p-4 text-center">
              <div className="text-2xl font-bold text-warning">{stats.disabled}</div>
              <div className="text-sm text-muted">Disabled</div>
            </GlassCard>
          </div>

          {/* Toolbar */}
          <GlassCard className="p-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setFilter("all")}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  filter === "all" ? "bg-primary text-white" : "text-muted hover:bg-gray-100 dark:hover:bg-gray-800"
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilter("allow")}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  filter === "allow" ? "bg-success text-white" : "text-muted hover:bg-gray-100 dark:hover:bg-gray-800"
                }`}
              >
                Allow
              </button>
              <button
                onClick={() => setFilter("deny")}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  filter === "deny" ? "bg-error text-white" : "text-muted hover:bg-gray-100 dark:hover:bg-gray-800"
                }`}
              >
                Deny
              </button>
            </div>

            <button
              onClick={() => setShowAddModal(true)}
              className="btn-primary flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              Add Rule
            </button>
          </GlassCard>

          {/* Rules List */}
          <WindowPanel title={`Firewall Rules (${filteredRules.length})`}>
            <div className="divide-y divide-border">
              {/* Header */}
              <div className="grid grid-cols-12 gap-4 px-4 py-2 text-sm font-medium text-muted bg-gray-50 dark:bg-gray-800/50">
                <div className="col-span-1">Status</div>
                <div className="col-span-2">Name</div>
                <div className="col-span-1">Action</div>
                <div className="col-span-1">Protocol</div>
                <div className="col-span-1">Port</div>
                <div className="col-span-2">Source</div>
                <div className="col-span-3">Description</div>
                <div className="col-span-1">Actions</div>
              </div>

              {filteredRules.map((rule) => (
                <div
                  key={rule.id}
                  className={`grid grid-cols-12 gap-4 px-4 py-3 items-center transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/30 ${
                    !rule.enabled ? "opacity-50" : ""
                  }`}
                >
                  <div className="col-span-1">
                    <button
                      onClick={() => toggleRule(rule.id)}
                      className={`relative w-10 h-5 rounded-full transition-colors ${
                        rule.enabled ? "bg-success" : "bg-gray-300 dark:bg-gray-600"
                      }`}
                    >
                      <div
                        className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${
                          rule.enabled ? "translate-x-5" : ""
                        }`}
                      />
                    </button>
                  </div>
                  <div className="col-span-2 font-medium text-foreground">{rule.name}</div>
                  <div className="col-span-1">
                    <span
                      className={`px-2 py-0.5 rounded text-xs font-medium uppercase ${
                        rule.action === "allow"
                          ? "bg-success/10 text-success"
                          : "bg-error/10 text-error"
                      }`}
                    >
                      {rule.action}
                    </span>
                  </div>
                  <div className="col-span-1 text-sm font-mono text-muted">{rule.protocol}</div>
                  <div className="col-span-1 text-sm font-mono text-foreground">{rule.port}</div>
                  <div className="col-span-2 text-sm font-mono text-muted truncate">{rule.source}</div>
                  <div className="col-span-3 text-sm text-muted truncate">{rule.description}</div>
                  <div className="col-span-1 flex gap-1">
                    <IconButton
                      label="Edit"
                      onClick={() => setEditingRule(rule)}
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </IconButton>
                    <IconButton
                      label="Delete"
                      variant="danger"
                      onClick={() => deleteRule(rule.id)}
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </IconButton>
                  </div>
                </div>
              ))}
            </div>
          </WindowPanel>

          {/* Add/Edit Modal */}
          {(showAddModal || editingRule) && (
            <RuleModal
              rule={editingRule}
              onClose={() => {
                setShowAddModal(false);
                setEditingRule(null);
              }}
              onSave={(rule) => {
                if (editingRule) {
                  setRules((prev) => prev.map((r) => (r.id === rule.id ? rule : r)));
                } else {
                  setRules((prev) => [...prev, { ...rule, id: `rule-${Date.now()}` }]);
                }
                setShowAddModal(false);
                setEditingRule(null);
              }}
            />
          )}
        </>
      )}
    </div>
  );
}

function RuleModal({
  rule,
  onClose,
  onSave,
}: {
  rule: FirewallRule | null;
  onClose: () => void;
  onSave: (rule: FirewallRule) => void;
}) {
  const [formData, setFormData] = useState<Partial<FirewallRule>>({
    name: rule?.name || "",
    protocol: rule?.protocol || "TCP",
    port: rule?.port || "",
    source: rule?.source || "0.0.0.0/0",
    destination: rule?.destination || "any",
    action: rule?.action || "allow",
    enabled: rule?.enabled ?? true,
    description: rule?.description || "",
  });

  const modalSpring = useSpring({
    from: { opacity: 0, transform: "scale(0.95)" },
    to: { opacity: 1, transform: "scale(1)" },
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <animated.div style={modalSpring} className="relative w-full max-w-lg">
        <GlassCard className="p-6">
          <h3 className="text-xl font-bold text-foreground mb-6">
            {rule ? "Edit Rule" : "Add Firewall Rule"}
          </h3>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Rule Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 rounded-xl bg-surface border border-border focus:border-primary focus:outline-none"
                placeholder="e.g., Allow SSH"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Protocol</label>
                <select
                  value={formData.protocol}
                  onChange={(e) => setFormData({ ...formData, protocol: e.target.value as FirewallRule["protocol"] })}
                  className="w-full px-4 py-2 rounded-xl bg-surface border border-border focus:border-primary focus:outline-none"
                >
                  <option value="TCP">TCP</option>
                  <option value="UDP">UDP</option>
                  <option value="ICMP">ICMP</option>
                  <option value="ALL">ALL</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Port</label>
                <input
                  type="text"
                  value={formData.port}
                  onChange={(e) => setFormData({ ...formData, port: e.target.value })}
                  className="w-full px-4 py-2 rounded-xl bg-surface border border-border focus:border-primary focus:outline-none"
                  placeholder="e.g., 22, 80-443"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Source IP/CIDR</label>
              <input
                type="text"
                value={formData.source}
                onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                className="w-full px-4 py-2 rounded-xl bg-surface border border-border focus:border-primary focus:outline-none"
                placeholder="e.g., 0.0.0.0/0 or 192.168.1.0/24"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Action</label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    checked={formData.action === "allow"}
                    onChange={() => setFormData({ ...formData, action: "allow" })}
                    className="text-success"
                  />
                  <span className="text-success font-medium">Allow</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    checked={formData.action === "deny"}
                    onChange={() => setFormData({ ...formData, action: "deny" })}
                    className="text-error"
                  />
                  <span className="text-error font-medium">Deny</span>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Description</label>
              <input
                type="text"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-2 rounded-xl bg-surface border border-border focus:border-primary focus:outline-none"
                placeholder="Optional description"
              />
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <button onClick={onClose} className="btn-secondary flex-1">
              Cancel
            </button>
            <button
              onClick={() => onSave(formData as FirewallRule)}
              className="btn-primary flex-1"
            >
              {rule ? "Save Changes" : "Add Rule"}
            </button>
          </div>
        </GlassCard>
      </animated.div>
    </div>
  );
}
