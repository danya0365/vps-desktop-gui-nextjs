/**
 * VPS Server Entity
 * Domain entity for VPS server management
 */

export type ServerStatus = 'online' | 'offline' | 'maintenance' | 'error';
export type ServerOS = 'ubuntu' | 'debian' | 'centos' | 'windows' | 'custom';

export interface VpsServer {
  id: string;
  name: string;
  hostname: string;
  ipAddress: string;
  port: number;
  status: ServerStatus;
  os: ServerOS;
  osVersion: string;
  cpu: {
    cores: number;
    usage: number; // percentage
  };
  memory: {
    total: number; // GB
    used: number;  // GB
    usage: number; // percentage
  };
  storage: {
    total: number; // GB
    used: number;  // GB
    usage: number; // percentage
  };
  network: {
    inbound: number;  // Mbps
    outbound: number; // Mbps
  };
  uptime: number; // hours
  location: string;
  provider: string;
  lastUpdated: string;
  createdAt: string;
  tags: string[];
}

export interface ServerStats {
  totalServers: number;
  onlineServers: number;
  offlineServers: number;
  maintenanceServers: number;
  errorServers: number;
  totalCpuCores: number;
  totalMemoryGB: number;
  totalStorageGB: number;
}
