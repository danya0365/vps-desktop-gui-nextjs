"use client";

import { WindowPanel } from "@/src/presentation/components/ui/WindowPanel";
import { animated, useSpring } from "@react-spring/web";
import { useTheme } from "next-themes";
import { useState } from "react";

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const [notifications, setNotifications] = useState({
    serverDown: true,
    highCpuUsage: true,
    diskSpaceLow: true,
    securityAlerts: true,
    weeklyReport: false,
  });
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState("30");

  const headerSpring = useSpring({
    from: { opacity: 0, transform: "translateY(-20px)" },
    to: { opacity: 1, transform: "translateY(0px)" },
  });

  const handleNotificationChange = (key: keyof typeof notifications) => {
    setNotifications((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <animated.div style={headerSpring}>
        <h1 className="text-3xl font-bold text-foreground">Settings</h1>
        <p className="text-muted mt-1">Configure your VPS Desktop preferences</p>
      </animated.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Appearance Settings */}
        <WindowPanel
          title="Appearance"
          icon={
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
            </svg>
          }
        >
          <div className="space-y-6">
            {/* Theme Selection */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-3">Theme</label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { id: "light", label: "Light", icon: "☀️" },
                  { id: "dark", label: "Dark", icon: "🌙" },
                  { id: "system", label: "System", icon: "💻" },
                ].map((option) => (
                  <button
                    key={option.id}
                    onClick={() => setTheme(option.id)}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      theme === option.id
                        ? "border-primary bg-primary/10"
                        : "border-border hover:border-gray-400"
                    }`}
                  >
                    <div className="text-2xl mb-2">{option.icon}</div>
                    <div className="text-sm font-medium text-foreground">{option.label}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Accent Color */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-3">Accent Color</label>
              <div className="flex gap-2">
                {[
                  { color: "bg-blue-500", name: "Blue" },
                  { color: "bg-purple-500", name: "Purple" },
                  { color: "bg-green-500", name: "Green" },
                  { color: "bg-orange-500", name: "Orange" },
                  { color: "bg-pink-500", name: "Pink" },
                ].map((item) => (
                  <button
                    key={item.name}
                    className={`w-8 h-8 rounded-full ${item.color} hover:ring-2 ring-offset-2 ring-offset-surface ring-gray-400 transition-all`}
                    title={item.name}
                  />
                ))}
              </div>
            </div>
          </div>
        </WindowPanel>

        {/* Notification Settings */}
        <WindowPanel
          title="Notifications"
          icon={
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          }
        >
          <div className="space-y-4">
            {[
              { key: "serverDown", label: "Server Down Alerts", desc: "Get notified when a server goes offline" },
              { key: "highCpuUsage", label: "High CPU Usage", desc: "Alert when CPU exceeds 90%" },
              { key: "diskSpaceLow", label: "Low Disk Space", desc: "Alert when disk usage exceeds 85%" },
              { key: "securityAlerts", label: "Security Alerts", desc: "Suspicious activity notifications" },
              { key: "weeklyReport", label: "Weekly Report", desc: "Receive weekly usage summary" },
            ].map((item) => (
              <div key={item.key} className="flex items-center justify-between py-2">
                <div>
                  <div className="font-medium text-foreground">{item.label}</div>
                  <div className="text-sm text-muted">{item.desc}</div>
                </div>
                <Toggle
                  enabled={notifications[item.key as keyof typeof notifications]}
                  onChange={() => handleNotificationChange(item.key as keyof typeof notifications)}
                />
              </div>
            ))}
          </div>
        </WindowPanel>

        {/* Data & Refresh Settings */}
        <WindowPanel
          title="Data & Refresh"
          icon={
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          }
        >
          <div className="space-y-6">
            {/* Auto Refresh */}
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-foreground">Auto Refresh</div>
                <div className="text-sm text-muted">Automatically update server metrics</div>
              </div>
              <Toggle enabled={autoRefresh} onChange={() => setAutoRefresh(!autoRefresh)} />
            </div>

            {/* Refresh Interval */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Refresh Interval</label>
              <select
                value={refreshInterval}
                onChange={(e) => setRefreshInterval(e.target.value)}
                disabled={!autoRefresh}
                className="w-full px-4 py-2 rounded-xl bg-surface border border-border focus:border-primary focus:outline-none disabled:opacity-50"
              >
                <option value="10">Every 10 seconds</option>
                <option value="30">Every 30 seconds</option>
                <option value="60">Every 1 minute</option>
                <option value="300">Every 5 minutes</option>
              </select>
            </div>

            {/* Data Retention */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">History Retention</label>
              <select className="w-full px-4 py-2 rounded-xl bg-surface border border-border focus:border-primary focus:outline-none">
                <option value="7">7 days</option>
                <option value="30">30 days</option>
                <option value="90">90 days</option>
                <option value="365">1 year</option>
              </select>
            </div>
          </div>
        </WindowPanel>

        {/* Account & Security */}
        <WindowPanel
          title="Account & Security"
          icon={
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          }
        >
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50">
              <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center text-2xl">
                👤
              </div>
              <div>
                <div className="font-semibold text-foreground">Admin User</div>
                <div className="text-sm text-muted">admin@example.com</div>
              </div>
            </div>

            <div className="space-y-2">
              <button className="w-full px-4 py-3 rounded-xl text-left hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors flex items-center justify-between">
                <span className="text-foreground">Change Password</span>
                <svg className="w-4 h-4 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>
              <button className="w-full px-4 py-3 rounded-xl text-left hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors flex items-center justify-between">
                <span className="text-foreground">Two-Factor Authentication</span>
                <svg className="w-4 h-4 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>
              <button className="w-full px-4 py-3 rounded-xl text-left hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors flex items-center justify-between">
                <span className="text-foreground">API Keys</span>
                <svg className="w-4 h-4 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        </WindowPanel>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button className="btn-primary px-8">Save Changes</button>
      </div>
    </div>
  );
}

function Toggle({ enabled, onChange }: { enabled: boolean; onChange: () => void }) {
  return (
    <button
      onClick={onChange}
      className={`relative w-11 h-6 rounded-full transition-colors ${
        enabled ? "bg-primary" : "bg-gray-300 dark:bg-gray-600"
      }`}
    >
      <div
        className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
          enabled ? "translate-x-5" : "translate-x-0"
        }`}
      />
    </button>
  );
}
