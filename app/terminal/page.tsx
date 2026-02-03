"use client";

import type { VpsServer } from "@/src/domain/entities/VpsServer";
import { mockVpsServerRepository } from "@/src/infrastructure/repositories/mock/MockVpsServerRepository";
import { GlassCard } from "@/src/presentation/components/ui/GlassCard";
import { animated, useSpring } from "@react-spring/web";
import { useEffect, useRef, useState } from "react";

interface CommandOutput {
  id: number;
  command: string;
  output: string;
  timestamp: Date;
}

// Simulated command responses
const mockCommands: Record<string, string> = {
  help: `Available commands:
  ls          - List directory contents
  pwd         - Print working directory
  whoami      - Print current user
  uname       - Print system information
  df          - Display disk space usage
  free        - Display memory usage
  uptime      - Show system uptime
  top         - Display running processes
  docker ps   - List Docker containers
  clear       - Clear terminal
  exit        - Close connection`,
  ls: `bin   dev   etc   home   lib   media   mnt   opt   proc   root   run   sbin   srv   sys   tmp   usr   var`,
  pwd: `/root`,
  whoami: `root`,
  uname: `Linux vps-server 5.15.0-generic #1 SMP x86_64 GNU/Linux`,
  "uname -a": `Linux vps-server 5.15.0-generic #1 SMP Tue Jan 28 10:00:00 UTC 2025 x86_64 x86_64 x86_64 GNU/Linux`,
  df: `Filesystem     1K-blocks      Used Available Use% Mounted on
/dev/sda1      52428800   5242880  47185920  10% /
tmpfs           8388608         0   8388608   0% /dev/shm
/dev/sdb1     104857600  10485760  94371840  10% /data`,
  "df -h": `Filesystem      Size  Used Avail Use% Mounted on
/dev/sda1        50G  5.0G   45G  10% /
tmpfs           8.0G     0  8.0G   0% /dev/shm
/dev/sdb1       100G   10G   90G  10% /data`,
  free: `              total        used        free      shared  buff/cache   available
Mem:       32768000    18432000     8192000      256000     6144000    13824000
Swap:       4194304      524288     3670016`,
  "free -h": `              total        used        free      shared  buff/cache   available
Mem:           31Gi        18Gi       7.8Gi       250Mi       5.8Gi        13Gi
Swap:         4.0Gi       512Mi       3.5Gi`,
  uptime: ` 10:45:32 up 30 days,  4:22,  1 user,  load average: 0.42, 0.38, 0.35`,
  top: `top - 10:45:32 up 30 days,  4:22,  1 user,  load average: 0.42, 0.38, 0.35
Tasks: 128 total,   1 running, 127 sleeping,   0 stopped,   0 zombie
%Cpu(s):  5.2 us,  2.1 sy,  0.0 ni, 92.3 id,  0.2 wa,  0.0 hi,  0.2 si,  0.0 st
MiB Mem :  32000.0 total,   8000.0 free,  18000.0 used,   6000.0 buff/cache
MiB Swap:   4096.0 total,   3500.0 free,    596.0 used.  13500.0 avail Mem

  PID USER      PR  NI    VIRT    RES    SHR S  %CPU  %MEM     TIME+ COMMAND
    1 root      20   0  168936  12284   8820 S   0.0   0.0   0:03.81 systemd
  245 root      20   0   47928  14320  11532 S   0.3   0.0   0:15.43 nginx
  389 mysql     20   0 1854332 524288  32768 S   1.2   1.6   5:42.15 mysqld
  512 www-data  20   0  256128  65536  24576 S   0.5   0.2   2:18.92 php-fpm`,
  "docker ps": `CONTAINER ID   IMAGE          COMMAND                  STATUS          PORTS                    NAMES
a1b2c3d4e5f6   nginx:latest   "nginx -g 'daemon of…"   Up 15 days      0.0.0.0:80->80/tcp       web-proxy
b2c3d4e5f6a1   mysql:8.0      "docker-entrypoint.s…"   Up 15 days      0.0.0.0:3306->3306/tcp   database
c3d4e5f6a1b2   redis:alpine   "docker-entrypoint.s…"   Up 7 days       0.0.0.0:6379->6379/tcp   cache`,
  date: new Date().toString(),
  hostname: `vps-server`,
  "cat /etc/os-release": `PRETTY_NAME="Ubuntu 22.04.3 LTS"
NAME="Ubuntu"
VERSION_ID="22.04"
VERSION="22.04.3 LTS (Jammy Jellyfish)"
ID=ubuntu
ID_LIKE=debian`,
};

export default function TerminalPage() {
  const [servers, setServers] = useState<VpsServer[]>([]);
  const [selectedServer, setSelectedServer] = useState<VpsServer | null>(null);
  const [history, setHistory] = useState<CommandOutput[]>([]);
  const [currentCommand, setCurrentCommand] = useState("");
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const terminalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadServers = async () => {
      const data = await mockVpsServerRepository.getAll();
      setServers(data);
      const online = data.find((s) => s.status === "online");
      if (online) setSelectedServer(online);
    };
    loadServers();
  }, []);

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [history]);

  const executeCommand = (cmd: string) => {
    const trimmedCmd = cmd.trim().toLowerCase();
    let output = "";

    if (trimmedCmd === "clear") {
      setHistory([]);
      return;
    }

    if (trimmedCmd === "exit") {
      output = "Connection closed.";
      setSelectedServer(null);
    } else if (mockCommands[trimmedCmd]) {
      output = mockCommands[trimmedCmd];
    } else if (trimmedCmd.startsWith("echo ")) {
      output = trimmedCmd.substring(5);
    } else if (trimmedCmd === "") {
      return;
    } else {
      output = `bash: ${trimmedCmd.split(" ")[0]}: command not found`;
    }

    setHistory((prev) => [
      ...prev,
      {
        id: Date.now(),
        command: cmd,
        output,
        timestamp: new Date(),
      },
    ]);

    setCommandHistory((prev) => [cmd, ...prev]);
    setHistoryIndex(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      executeCommand(currentCommand);
      setCurrentCommand("");
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (historyIndex < commandHistory.length - 1) {
        const newIndex = historyIndex + 1;
        setHistoryIndex(newIndex);
        setCurrentCommand(commandHistory[newIndex]);
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (historyIndex > 0) {
        const newIndex = historyIndex - 1;
        setHistoryIndex(newIndex);
        setCurrentCommand(commandHistory[newIndex]);
      } else if (historyIndex === 0) {
        setHistoryIndex(-1);
        setCurrentCommand("");
      }
    }
  };

  const headerSpring = useSpring({
    from: { opacity: 0, transform: "translateY(-20px)" },
    to: { opacity: 1, transform: "translateY(0px)" },
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <animated.div style={headerSpring} className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Terminal</h1>
          <p className="text-muted mt-1">SSH Console for your servers</p>
        </div>

        {/* Server Selector */}
        <div className="flex items-center gap-4">
          <span className="text-sm text-muted">Connect to:</span>
          <select
            value={selectedServer?.id || ""}
            onChange={(e) => {
              const server = servers.find((s) => s.id === e.target.value);
              setSelectedServer(server || null);
              setHistory([]);
            }}
            className="px-4 py-2 rounded-xl bg-surface border border-border focus:border-primary focus:outline-none cursor-pointer min-w-48"
          >
            <option value="">Select server...</option>
            {servers
              .filter((s) => s.status === "online")
              .map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.ipAddress})
                </option>
              ))}
          </select>
        </div>
      </animated.div>

      {/* Terminal Window */}
      <div className="macos-window overflow-hidden">
        {/* Terminal Header */}
        <div className="macos-titlebar">
          <div className="traffic-lights">
            <div className="traffic-light traffic-light-close" />
            <div className="traffic-light traffic-light-minimize" />
            <div className="traffic-light traffic-light-maximize" />
          </div>
          <div className="flex-1 text-center text-sm text-muted">
            {selectedServer
              ? `${selectedServer.hostname} — SSH`
              : "Terminal — Not Connected"}
          </div>
          <div className="w-16" />
        </div>

        {/* Terminal Body */}
        <div
          ref={terminalRef}
          onClick={() => inputRef.current?.focus()}
          className="bg-gray-900 text-green-400 font-mono text-sm p-4 h-[500px] overflow-y-auto cursor-text"
        >
          {!selectedServer ? (
            <div className="text-gray-500">
              <p>No server connected.</p>
              <p>Select a server from the dropdown above to start.</p>
            </div>
          ) : (
            <>
              {/* Welcome Message */}
              <div className="text-gray-500 mb-4">
                <p>Connected to {selectedServer.hostname}</p>
                <p>Type &apos;help&apos; for available commands.</p>
                <p className="mt-2">---</p>
              </div>

              {/* Command History */}
              {history.map((item) => (
                <div key={item.id} className="mb-2">
                  <div className="flex">
                    <span className="text-blue-400">root@{selectedServer.hostname}</span>
                    <span className="text-white">:</span>
                    <span className="text-cyan-400">~</span>
                    <span className="text-white">$ </span>
                    <span className="text-white">{item.command}</span>
                  </div>
                  <pre className="text-gray-300 whitespace-pre-wrap mt-1">{item.output}</pre>
                </div>
              ))}

              {/* Current Input Line */}
              <div className="flex items-center">
                <span className="text-blue-400">root@{selectedServer.hostname}</span>
                <span className="text-white">:</span>
                <span className="text-cyan-400">~</span>
                <span className="text-white">$ </span>
                <input
                  ref={inputRef}
                  type="text"
                  value={currentCommand}
                  onChange={(e) => setCurrentCommand(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="flex-1 bg-transparent text-white outline-none caret-green-400"
                  autoFocus
                  spellCheck={false}
                />
              </div>
            </>
          )}
        </div>
      </div>

      {/* Quick Commands */}
      {selectedServer && (
        <GlassCard className="p-4">
          <h3 className="text-sm font-semibold text-foreground mb-3">Quick Commands</h3>
          <div className="flex flex-wrap gap-2">
            {["ls", "pwd", "uptime", "df -h", "free -h", "docker ps", "top"].map((cmd) => (
              <button
                key={cmd}
                onClick={() => {
                  executeCommand(cmd);
                }}
                className="px-3 py-1.5 text-xs font-mono rounded-lg bg-gray-100 dark:bg-gray-800 text-foreground hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                {cmd}
              </button>
            ))}
          </div>
        </GlassCard>
      )}
    </div>
  );
}
