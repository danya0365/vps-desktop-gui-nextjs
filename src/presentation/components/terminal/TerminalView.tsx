/**
 * TerminalView
 * UI component for the SSH Terminal
 * Following Clean Architecture - Presentation Layer
 */

'use client';

import { GlassCard } from "@/src/presentation/components/ui/GlassCard";
import { animated, useSpring } from "@react-spring/web";
import React, { useEffect, useRef } from "react";
import { TerminalViewModel } from "../../presenters/terminal/TerminalPresenter";
import { useTerminalPresenter } from "../../presenters/terminal/useTerminalPresenter";

interface TerminalViewProps {
  initialViewModel: TerminalViewModel;
}

export const TerminalView: React.FC<TerminalViewProps> = ({ initialViewModel }) => {
  const [state, actions] = useTerminalPresenter(initialViewModel);
  const { 
    onlineServers, 
    selectedServer, 
    history, 
    currentInput, 
    isExecuting,
    cwd 
  } = state;

  const inputRef = useRef<HTMLInputElement>(null);
  const terminalRef = useRef<HTMLDivElement>(null);

  // Auto-scroll terminal
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [history]);

  // Handle keyboard shortcuts
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      actions.executeCommand(currentInput);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      actions.navigateHistory('up');
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      actions.navigateHistory('down');
    }
  };

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
          <h1 className="text-3xl font-bold text-foreground">Terminal</h1>
          <p className="text-muted mt-1">Execute commands directly on your servers</p>
        </div>

        {/* Server Selector */}
        <div className="flex items-center gap-4">
          <span className="text-sm font-bold text-muted uppercase tracking-widest px-1">Connect to:</span>
          <select
            value={selectedServer?.id || ""}
            onChange={(e) => {
              const server = onlineServers.find((s) => s.id === e.target.value);
              actions.setSelectedServer(server || null);
            }}
            className="px-5 py-2.5 rounded-2xl bg-white/5 dark:bg-gray-800/40 border border-white/10 dark:border-gray-700/50 focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all font-bold min-w-[240px] appearance-none"
          >
            <option value="">Select a server...</option>
            {onlineServers.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} ({s.ipAddress})
              </option>
            ))}
          </select>
        </div>
      </animated.div>

      {/* Terminal Window */}
      <div className="macos-window overflow-hidden border border-white/5 shadow-2xl">
        {/* Terminal Header */}
        <div className="macos-titlebar bg-gray-800/80 backdrop-blur-md px-6 py-3">
          <div className="traffic-lights">
            <div className="traffic-light traffic-light-close" />
            <div className="traffic-light traffic-light-minimize" />
            <div className="traffic-light traffic-light-maximize" />
          </div>
          <div className="flex-1 text-center text-[11px] font-bold text-gray-400 uppercase tracking-widest">
            {selectedServer
              ? `${selectedServer.hostname} — ssh — 80x24`
              : "Terminal — disconnected"}
          </div>
          <div className="w-16" />
        </div>

        {/* Terminal Body */}
        <div
          ref={terminalRef}
          onClick={() => inputRef.current?.focus()}
          className="bg-[#0c0c0c] text-emerald-400 font-mono text-sm p-6 h-[550px] overflow-y-auto cursor-text transition-colors duration-500 selection:bg-primary/30"
        >
          {!selectedServer ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-600 animate-pulse">
              <span className="text-6xl mb-4">🔌</span>
              <p className="font-bold uppercase tracking-widest">No Active Connection</p>
              <p className="text-xs mt-2">Please select a server from the dropdown above</p>
            </div>
          ) : (
            <div className="space-y-1">
              {/* Welcome Message */}
              <div className="text-gray-500 mb-6 font-medium border-l-2 border-gray-800 pl-4 py-1">
                <p className="text-white font-bold mb-1">VPS Desktop SSH Gateway v2.0.0</p>
                <p>Welcome to {selectedServer.name} ({selectedServer.ipAddress})</p>
                <p>Last login: {new Date().toLocaleString()} from 127.0.0.1</p>
                <p className="mt-4 text-[10px] uppercase tracking-widest">Type 'help' for available commands</p>
              </div>

              {/* Command History */}
              {history.map((item) => (
                <div key={item.id} className="mb-4 animate-in fade-in slide-in-from-left-2 duration-300">
                  <div className="flex gap-2">
                    <span className="text-blue-400 font-bold">root@{selectedServer.hostname}</span>
                    <span className="text-primary font-bold">:</span>
                    <span className="text-emerald-500 font-bold">{item.cwd || '/'}</span>
                    <span className="text-white">$</span>
                    <span className="text-white font-medium">{item.command}</span>
                  </div>
                  {item.output && <pre className="text-gray-300 whitespace-pre-wrap mt-2 leading-relaxed selection:bg-primary/40 pl-4 border-l border-gray-800/50">{item.output}</pre>}
                </div>
              ))}

              {/* Current Input Line */}
              <div className="flex items-center gap-2">
                <span className="text-blue-400 font-bold">root@{selectedServer.hostname}</span>
                <span className="text-primary font-bold">:</span>
                <span className="text-emerald-500 font-bold">{cwd}</span>
                <span className="text-white">$</span>
                <input
                  ref={inputRef}
                  disabled={isExecuting}
                  type="text"
                  value={currentInput}
                  onChange={(e) => actions.setCurrentInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="flex-1 bg-transparent text-white outline-none caret-primary font-medium"
                  autoFocus
                  spellCheck={false}
                  autoComplete="off"
                />
                {isExecuting && (
                  <div className="w-2 h-2 rounded-full bg-primary animate-ping" />
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Quick Commands */}
      {selectedServer && (
        <GlassCard className="p-6 border border-white/5 shadow-xl">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-sm font-bold text-muted uppercase tracking-widest">Macro shortcuts</h3>
            <button 
              onClick={actions.clearHistory}
              className="text-[10px] font-bold text-red-500 uppercase tracking-widest hover:text-red-400 transition-colors"
            >
              Clear screen
            </button>
          </div>
          <div className="flex flex-wrap gap-2.5">
            {[
              { label: "List files", cmd: "ls -la" },
              { label: "Working dir", cmd: "pwd" },
              { label: "Check uptime", cmd: "uptime" },
              { label: "Disk usage", cmd: "df -h" },
              { label: "Memory info", cmd: "free -h" },
              { label: "Docker status", cmd: "docker ps" },
              { label: "System load", cmd: "top" },
              { label: "Who am I?", cmd: "whoami" },
              { label: "Release info", cmd: "cat /etc/os-release" }
            ].map((shortcut) => (
              <button
                key={shortcut.cmd}
                onClick={() => actions.executeCommand(shortcut.cmd)}
                className="px-4 py-2 text-xs font-bold rounded-xl bg-white/5 dark:bg-white/5 text-foreground border border-white/5 hover:bg-primary/10 hover:border-primary/20 hover:text-primary transition-all active:scale-95"
              >
                {shortcut.label}
              </button>
            ))}
          </div>
        </GlassCard>
      )}
    </div>
  );
};
