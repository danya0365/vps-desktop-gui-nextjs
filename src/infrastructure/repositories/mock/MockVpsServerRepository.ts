/**
 * MockVpsServerRepository
 * Mock implementation for development and testing
 * Following Clean Architecture - Infrastructure layer
 */

import type {
    CreateVpsServerData,
    IVpsServerRepository,
    PaginatedResult,
    UpdateVpsServerData,
} from '@/src/application/repositories/IVpsServerRepository';
import type { ServerStats, VpsServer } from '@/src/domain/entities/VpsServer';

// Mock data for VPS servers
const MOCK_VPS_SERVERS: VpsServer[] = [
  {
    id: 'vps-001',
    name: 'Production Web Server',
    hostname: 'prod-web-01.example.com',
    ipAddress: '192.168.1.100',
    port: 22,
    status: 'online',
    os: 'ubuntu',
    osVersion: '22.04 LTS',
    cpu: { cores: 8, usage: 45 },
    memory: { total: 32, used: 18, usage: 56 },
    storage: { total: 500, used: 180, usage: 36 },
    network: { inbound: 150, outbound: 200 },
    uptime: 720,
    location: 'Singapore',
    provider: 'DigitalOcean',
    lastUpdated: '2026-02-03T06:00:00.000Z',
    createdAt: '2025-06-15T10:30:00.000Z',
    tags: ['production', 'web', 'critical'],
  },
  {
    id: 'vps-002',
    name: 'Database Server',
    hostname: 'db-master-01.example.com',
    ipAddress: '192.168.1.101',
    port: 22,
    status: 'online',
    os: 'debian',
    osVersion: '12 Bookworm',
    cpu: { cores: 16, usage: 72 },
    memory: { total: 64, used: 52, usage: 81 },
    storage: { total: 2000, used: 1200, usage: 60 },
    network: { inbound: 300, outbound: 450 },
    uptime: 1440,
    location: 'Tokyo',
    provider: 'Vultr',
    lastUpdated: '2026-02-03T06:00:00.000Z',
    createdAt: '2025-03-20T08:00:00.000Z',
    tags: ['production', 'database', 'critical'],
  },
  {
    id: 'vps-003',
    name: 'Staging Environment',
    hostname: 'staging-01.example.com',
    ipAddress: '192.168.1.102',
    port: 22,
    status: 'online',
    os: 'ubuntu',
    osVersion: '24.04 LTS',
    cpu: { cores: 4, usage: 25 },
    memory: { total: 16, used: 6, usage: 38 },
    storage: { total: 200, used: 80, usage: 40 },
    network: { inbound: 50, outbound: 60 },
    uptime: 168,
    location: 'Bangkok',
    provider: 'Linode',
    lastUpdated: '2026-02-03T06:00:00.000Z',
    createdAt: '2026-01-10T14:00:00.000Z',
    tags: ['staging', 'web'],
  },
  {
    id: 'vps-004',
    name: 'Backup Server',
    hostname: 'backup-01.example.com',
    ipAddress: '192.168.1.103',
    port: 22,
    status: 'maintenance',
    os: 'centos',
    osVersion: 'Stream 9',
    cpu: { cores: 2, usage: 5 },
    memory: { total: 8, used: 2, usage: 25 },
    storage: { total: 5000, used: 3500, usage: 70 },
    network: { inbound: 20, outbound: 10 },
    uptime: 0,
    location: 'Hong Kong',
    provider: 'AWS',
    lastUpdated: '2026-02-03T05:00:00.000Z',
    createdAt: '2025-08-01T12:00:00.000Z',
    tags: ['backup', 'storage'],
  },
  {
    id: 'vps-005',
    name: 'Dev Server',
    hostname: 'dev-01.example.com',
    ipAddress: '192.168.1.104',
    port: 22,
    status: 'offline',
    os: 'ubuntu',
    osVersion: '22.04 LTS',
    cpu: { cores: 4, usage: 0 },
    memory: { total: 8, used: 0, usage: 0 },
    storage: { total: 100, used: 45, usage: 45 },
    network: { inbound: 0, outbound: 0 },
    uptime: 0,
    location: 'Bangkok',
    provider: 'DigitalOcean',
    lastUpdated: '2026-02-02T18:00:00.000Z',
    createdAt: '2026-01-05T09:00:00.000Z',
    tags: ['development'],
  },
  {
    id: 'vps-006',
    name: 'API Gateway',
    hostname: 'api-gw-01.example.com',
    ipAddress: '192.168.1.105',
    port: 22,
    status: 'online',
    os: 'debian',
    osVersion: '12 Bookworm',
    cpu: { cores: 8, usage: 35 },
    memory: { total: 16, used: 10, usage: 62 },
    storage: { total: 100, used: 30, usage: 30 },
    network: { inbound: 500, outbound: 480 },
    uptime: 2160,
    location: 'Singapore',
    provider: 'GCP',
    lastUpdated: '2026-02-03T06:00:00.000Z',
    createdAt: '2025-01-15T10:00:00.000Z',
    tags: ['production', 'api', 'critical'],
  },
];

export class MockVpsServerRepository implements IVpsServerRepository {
  private servers: VpsServer[] = [...MOCK_VPS_SERVERS];

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async getById(id: string): Promise<VpsServer | null> {
    await this.delay(100);
    return this.servers.find((server) => server.id === id) || null;
  }

  async getAll(): Promise<VpsServer[]> {
    await this.delay(150);
    return [...this.servers];
  }

  async getPaginated(page: number, perPage: number): Promise<PaginatedResult<VpsServer>> {
    await this.delay(150);
    const start = (page - 1) * perPage;
    const end = start + perPage;
    return {
      data: this.servers.slice(start, end),
      total: this.servers.length,
      page,
      perPage,
    };
  }

  async getByStatus(status: VpsServer['status']): Promise<VpsServer[]> {
    await this.delay(100);
    return this.servers.filter((server) => server.status === status);
  }

  async search(query: string): Promise<VpsServer[]> {
    await this.delay(100);
    const lowerQuery = query.toLowerCase();
    return this.servers.filter(
      (server) =>
        server.name.toLowerCase().includes(lowerQuery) ||
        server.hostname.toLowerCase().includes(lowerQuery) ||
        server.ipAddress.includes(lowerQuery) ||
        server.tags.some((tag) => tag.toLowerCase().includes(lowerQuery))
    );
  }

  async create(data: CreateVpsServerData): Promise<VpsServer> {
    await this.delay(200);
    const newServer: VpsServer = {
      id: `vps-${Date.now()}`,
      ...data,
      port: data.port || 22,
      status: 'offline',
      cpu: { cores: 4, usage: 0 },
      memory: { total: 8, used: 0, usage: 0 },
      storage: { total: 100, used: 0, usage: 0 },
      network: { inbound: 0, outbound: 0 },
      uptime: 0,
      lastUpdated: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      tags: data.tags || [],
    };
    this.servers.unshift(newServer);
    return newServer;
  }

  async update(id: string, data: UpdateVpsServerData): Promise<VpsServer> {
    await this.delay(200);
    const index = this.servers.findIndex((server) => server.id === id);
    if (index === -1) {
      throw new Error('Server not found');
    }
    const updatedServer: VpsServer = {
      ...this.servers[index],
      ...data,
      lastUpdated: new Date().toISOString(),
    };
    this.servers[index] = updatedServer;
    return updatedServer;
  }

  async delete(id: string): Promise<boolean> {
    await this.delay(200);
    const index = this.servers.findIndex((server) => server.id === id);
    if (index === -1) return false;
    this.servers.splice(index, 1);
    return true;
  }

  async getStats(): Promise<ServerStats> {
    await this.delay(100);
    const stats: ServerStats = {
      totalServers: this.servers.length,
      onlineServers: this.servers.filter((s) => s.status === 'online').length,
      offlineServers: this.servers.filter((s) => s.status === 'offline').length,
      maintenanceServers: this.servers.filter((s) => s.status === 'maintenance').length,
      errorServers: this.servers.filter((s) => s.status === 'error').length,
      totalCpuCores: this.servers.reduce((acc, s) => acc + s.cpu.cores, 0),
      totalMemoryGB: this.servers.reduce((acc, s) => acc + s.memory.total, 0),
      totalStorageGB: this.servers.reduce((acc, s) => acc + s.storage.total, 0),
    };
    return stats;
  }

  async refreshMetrics(id: string): Promise<VpsServer> {
    await this.delay(300);
    const server = await this.getById(id);
    if (!server) {
      throw new Error('Server not found');
    }
    // Simulate random metric changes
    const updatedServer: VpsServer = {
      ...server,
      cpu: { ...server.cpu, usage: Math.floor(Math.random() * 100) },
      memory: {
        ...server.memory,
        usage: Math.floor(Math.random() * 100),
        used: Math.floor((server.memory.total * Math.random()) * 100) / 100,
      },
      network: {
        inbound: Math.floor(Math.random() * 500),
        outbound: Math.floor(Math.random() * 500),
      },
      lastUpdated: new Date().toISOString(),
    };
    const index = this.servers.findIndex((s) => s.id === id);
    this.servers[index] = updatedServer;
    return updatedServer;
  }
}

// Export singleton instance for convenience
export const mockVpsServerRepository = new MockVpsServerRepository();
