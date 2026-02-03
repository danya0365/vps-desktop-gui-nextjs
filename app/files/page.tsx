"use client";

import type { VpsServer } from "@/src/domain/entities/VpsServer";
import { mockVpsServerRepository } from "@/src/infrastructure/repositories/mock/MockVpsServerRepository";
import { GlassCard } from "@/src/presentation/components/ui/GlassCard";
import { IconButton } from "@/src/presentation/components/ui/IconButton";
import { WindowPanel } from "@/src/presentation/components/ui/WindowPanel";
import { animated, useSpring } from "@react-spring/web";
import { useEffect, useState } from "react";

interface FileItem {
  id: string;
  name: string;
  type: "file" | "folder";
  size?: number;
  modified: string;
  permissions: string;
  owner: string;
}

// Mock file system data
const mockFileSystem: Record<string, FileItem[]> = {
  "/": [
    { id: "1", name: "bin", type: "folder", modified: "2025-01-15", permissions: "drwxr-xr-x", owner: "root" },
    { id: "2", name: "etc", type: "folder", modified: "2025-01-20", permissions: "drwxr-xr-x", owner: "root" },
    { id: "3", name: "home", type: "folder", modified: "2025-01-28", permissions: "drwxr-xr-x", owner: "root" },
    { id: "4", name: "var", type: "folder", modified: "2025-02-01", permissions: "drwxr-xr-x", owner: "root" },
    { id: "5", name: "usr", type: "folder", modified: "2025-01-10", permissions: "drwxr-xr-x", owner: "root" },
    { id: "6", name: "tmp", type: "folder", modified: "2025-02-03", permissions: "drwxrwxrwt", owner: "root" },
    { id: "7", name: "opt", type: "folder", modified: "2025-01-25", permissions: "drwxr-xr-x", owner: "root" },
    { id: "8", name: "root", type: "folder", modified: "2025-02-02", permissions: "drwx------", owner: "root" },
  ],
  "/home": [
    { id: "h1", name: "admin", type: "folder", modified: "2025-02-01", permissions: "drwxr-xr-x", owner: "admin" },
    { id: "h2", name: "www-data", type: "folder", modified: "2025-01-28", permissions: "drwxr-xr-x", owner: "www-data" },
  ],
  "/home/admin": [
    { id: "a1", name: ".bashrc", type: "file", size: 3771, modified: "2025-01-15", permissions: "-rw-r--r--", owner: "admin" },
    { id: "a2", name: ".profile", type: "file", size: 807, modified: "2025-01-15", permissions: "-rw-r--r--", owner: "admin" },
    { id: "a3", name: "projects", type: "folder", modified: "2025-02-01", permissions: "drwxr-xr-x", owner: "admin" },
    { id: "a4", name: "backups", type: "folder", modified: "2025-01-30", permissions: "drwxr-xr-x", owner: "admin" },
    { id: "a5", name: "deploy.sh", type: "file", size: 2048, modified: "2025-02-02", permissions: "-rwxr-xr-x", owner: "admin" },
  ],
  "/var": [
    { id: "v1", name: "log", type: "folder", modified: "2025-02-03", permissions: "drwxr-xr-x", owner: "root" },
    { id: "v2", name: "www", type: "folder", modified: "2025-02-01", permissions: "drwxr-xr-x", owner: "www-data" },
    { id: "v3", name: "lib", type: "folder", modified: "2025-01-28", permissions: "drwxr-xr-x", owner: "root" },
  ],
  "/var/log": [
    { id: "l1", name: "syslog", type: "file", size: 1048576, modified: "2025-02-03", permissions: "-rw-r-----", owner: "syslog" },
    { id: "l2", name: "auth.log", type: "file", size: 524288, modified: "2025-02-03", permissions: "-rw-r-----", owner: "syslog" },
    { id: "l3", name: "nginx", type: "folder", modified: "2025-02-03", permissions: "drwxr-xr-x", owner: "root" },
    { id: "l4", name: "mysql", type: "folder", modified: "2025-02-02", permissions: "drwxr-xr-x", owner: "mysql" },
  ],
  "/etc": [
    { id: "e1", name: "nginx", type: "folder", modified: "2025-01-28", permissions: "drwxr-xr-x", owner: "root" },
    { id: "e2", name: "ssh", type: "folder", modified: "2025-01-20", permissions: "drwxr-xr-x", owner: "root" },
    { id: "e3", name: "passwd", type: "file", size: 2048, modified: "2025-01-15", permissions: "-rw-r--r--", owner: "root" },
    { id: "e4", name: "hosts", type: "file", size: 256, modified: "2025-01-10", permissions: "-rw-r--r--", owner: "root" },
    { id: "e5", name: "crontab", type: "file", size: 722, modified: "2025-01-25", permissions: "-rw-r--r--", owner: "root" },
  ],
};

export default function FilesPage() {
  const [servers, setServers] = useState<VpsServer[]>([]);
  const [selectedServer, setSelectedServer] = useState<VpsServer | null>(null);
  const [currentPath, setCurrentPath] = useState("/");
  const [files, setFiles] = useState<FileItem[]>([]);
  const [selectedFile, setSelectedFile] = useState<FileItem | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");

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
    // Load files for current path
    const pathFiles = mockFileSystem[currentPath] || [];
    setFiles(pathFiles);
    setSelectedFile(null);
  }, [currentPath]);

  const navigateTo = (path: string) => {
    setCurrentPath(path);
  };

  const navigateUp = () => {
    if (currentPath === "/") return;
    const parts = currentPath.split("/").filter(Boolean);
    parts.pop();
    setCurrentPath(parts.length === 0 ? "/" : "/" + parts.join("/"));
  };

  const handleFileClick = (file: FileItem) => {
    if (file.type === "folder") {
      const newPath = currentPath === "/" ? `/${file.name}` : `${currentPath}/${file.name}`;
      navigateTo(newPath);
    } else {
      setSelectedFile(file);
    }
  };

  const formatSize = (bytes?: number) => {
    if (!bytes) return "-";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  };

  const breadcrumbs = currentPath.split("/").filter(Boolean);

  const headerSpring = useSpring({
    from: { opacity: 0, transform: "translateY(-20px)" },
    to: { opacity: 1, transform: "translateY(0px)" },
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <animated.div style={headerSpring} className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">File Manager</h1>
          <p className="text-muted mt-1">Browse and manage server files</p>
        </div>

        {/* Server Selector */}
        <div className="flex items-center gap-4">
          <span className="text-sm text-muted">Server:</span>
          <select
            value={selectedServer?.id || ""}
            onChange={(e) => {
              const server = servers.find((s) => s.id === e.target.value);
              setSelectedServer(server || null);
              setCurrentPath("/");
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
          <div className="text-6xl mb-4">📁</div>
          <h3 className="text-xl font-semibold text-foreground mb-2">No server selected</h3>
          <p className="text-muted">Select a server to browse its file system</p>
        </GlassCard>
      ) : (
        <>
          {/* Toolbar */}
          <GlassCard className="p-3 flex items-center gap-3">
            {/* Navigation */}
            <IconButton onClick={navigateUp} label="Go up" variant={currentPath === "/" ? "ghost" : "default"}>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 10l7-7m0 0l7 7m-7-7v18" />
              </svg>
            </IconButton>

            <IconButton onClick={() => setCurrentPath("/")} label="Home">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
            </IconButton>

            {/* Breadcrumb */}
            <div className="flex-1 flex items-center gap-1 px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 overflow-x-auto">
              <button onClick={() => setCurrentPath("/")} className="text-sm text-primary hover:underline">
                /
              </button>
              {breadcrumbs.map((part, index) => (
                <span key={index} className="flex items-center gap-1">
                  <span className="text-muted">/</span>
                  <button
                    onClick={() => setCurrentPath("/" + breadcrumbs.slice(0, index + 1).join("/"))}
                    className="text-sm text-primary hover:underline"
                  >
                    {part}
                  </button>
                </span>
              ))}
            </div>

            {/* View Mode Toggle */}
            <div className="flex rounded-lg overflow-hidden border border-border">
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 ${viewMode === "list" ? "bg-primary text-white" : "bg-surface"}`}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                </svg>
              </button>
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 ${viewMode === "grid" ? "bg-primary text-white" : "bg-surface"}`}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
              </button>
            </div>

            {/* Actions */}
            <IconButton label="New folder">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
              </svg>
            </IconButton>

            <IconButton label="Upload">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
            </IconButton>
          </GlassCard>

          {/* File List */}
          <WindowPanel title={`${currentPath} (${files.length} items)`}>
            {files.length === 0 ? (
              <div className="py-12 text-center">
                <div className="text-4xl mb-2">📂</div>
                <p className="text-muted">This folder is empty</p>
              </div>
            ) : viewMode === "list" ? (
              <div className="divide-y divide-border">
                {/* Header */}
                <div className="grid grid-cols-12 gap-4 px-4 py-2 text-sm font-medium text-muted bg-gray-50 dark:bg-gray-800/50">
                  <div className="col-span-5">Name</div>
                  <div className="col-span-2">Size</div>
                  <div className="col-span-2">Modified</div>
                  <div className="col-span-2">Permissions</div>
                  <div className="col-span-1">Owner</div>
                </div>
                {/* Files */}
                {files.map((file) => (
                  <div
                    key={file.id}
                    onClick={() => handleFileClick(file)}
                    className={`grid grid-cols-12 gap-4 px-4 py-3 cursor-pointer transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/50 ${
                      selectedFile?.id === file.id ? "bg-primary/5" : ""
                    }`}
                  >
                    <div className="col-span-5 flex items-center gap-3">
                      <span className="text-xl">{file.type === "folder" ? "📁" : getFileIcon(file.name)}</span>
                      <span className="font-medium text-foreground truncate">{file.name}</span>
                    </div>
                    <div className="col-span-2 text-sm text-muted">{formatSize(file.size)}</div>
                    <div className="col-span-2 text-sm text-muted">{file.modified}</div>
                    <div className="col-span-2 text-sm font-mono text-muted">{file.permissions}</div>
                    <div className="col-span-1 text-sm text-muted">{file.owner}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4 p-4">
                {files.map((file) => (
                  <div
                    key={file.id}
                    onClick={() => handleFileClick(file)}
                    className={`flex flex-col items-center p-4 rounded-xl cursor-pointer transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/50 ${
                      selectedFile?.id === file.id ? "bg-primary/10" : ""
                    }`}
                  >
                    <span className="text-4xl mb-2">{file.type === "folder" ? "📁" : getFileIcon(file.name)}</span>
                    <span className="text-sm text-foreground text-center truncate w-full">{file.name}</span>
                  </div>
                ))}
              </div>
            )}
          </WindowPanel>

          {/* File Info Sidebar */}
          {selectedFile && (
            <GlassCard className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-foreground">File Info</h3>
                <button onClick={() => setSelectedFile(null)} className="text-muted hover:text-foreground">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="flex items-center gap-4 mb-4">
                <span className="text-4xl">{getFileIcon(selectedFile.name)}</span>
                <div>
                  <div className="font-medium text-foreground">{selectedFile.name}</div>
                  <div className="text-sm text-muted">{formatSize(selectedFile.size)}</div>
                </div>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted">Modified</span>
                  <span className="text-foreground">{selectedFile.modified}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">Permissions</span>
                  <span className="font-mono text-foreground">{selectedFile.permissions}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">Owner</span>
                  <span className="text-foreground">{selectedFile.owner}</span>
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <button className="btn-primary text-sm flex-1">Download</button>
                <button className="btn-secondary text-sm flex-1">Edit</button>
                <button className="btn-secondary text-sm text-error">Delete</button>
              </div>
            </GlassCard>
          )}
        </>
      )}
    </div>
  );
}

function getFileIcon(filename: string): string {
  const ext = filename.split(".").pop()?.toLowerCase();
  switch (ext) {
    case "js":
    case "ts":
    case "jsx":
    case "tsx":
      return "📜";
    case "json":
    case "yaml":
    case "yml":
      return "📋";
    case "sh":
    case "bash":
      return "⚡";
    case "log":
      return "📝";
    case "conf":
    case "config":
      return "⚙️";
    case "png":
    case "jpg":
    case "jpeg":
    case "gif":
    case "svg":
      return "🖼️";
    case "zip":
    case "tar":
    case "gz":
      return "📦";
    default:
      return "📄";
  }
}
