/**
 * SshVpsServerRepository
 * Implementation of IVpsServerRepository using SSH connections
 * Following Clean Architecture - Infrastructure Layer
 */

import type {
  CreateVpsServerData,
  IVpsServerRepository,
  PaginatedResult,
  UpdateVpsServerData,
} from '@/src/application/repositories/IVpsServerRepository';
import type { ServerOS, ServerStats, ServerStatus, VpsServer } from '@/src/domain/entities/VpsServer';
import { Client } from 'ssh2';

import { SshConfig, SshConfigManager } from '../../config/SshConfigManager';

export class SshVpsServerRepository implements IVpsServerRepository {
  private async executeCommand(config: SshConfig, command: string): Promise<string> {
    if (!config.host || !config.username) {
      throw new Error('SSH credentials not configured');
    }

    return new Promise((resolve, reject) => {
      const conn = new Client();
      conn
        .on('ready', () => {
          conn.exec(command, (err, stream) => {
            if (err) {
              conn.end();
              return reject(err);
            }
            let data = '';
            stream
              .on('close', (code: number, signal: string) => {
                conn.end();
                resolve(data);
              })
              .on('data', (chunk: Buffer) => {
                data += chunk.toString();
              })
              .stderr.on('data', (chunk: Buffer) => {
                console.error('SSH STDERR:', chunk.toString());
              });
          });
        })
        .on('error', (err) => {
          reject(err);
        })
        .connect(config);
    });
  }

  async getById(id: string): Promise<VpsServer | null> {
    const servers = await this.getAll();
    return servers.find((s) => s.id === id) || null;
  }

  async getAll(): Promise<VpsServer[]> {
    const configs = SshConfigManager.getAllConfigs();
    const serverPromises = configs.map(async (config) => {
      try {
        const command = `
          echo "---OS---"
          lsb_release -d 2>/dev/null | cut -f2 || cat /etc/os-release | grep PRETTY_NAME | cut -d'"' -f2
          echo "---CPU---"
          lscpu | grep "Model name" | sed 's/Model name:[[:space:]]*//'
          nproc
          echo "---MEM---"
          free -b
          echo "---DISK---"
          df -B1 / | tail -1 | awk '{print $2,$3}'
          echo "---UPTIME---"
          cat /proc/uptime | awk '{print $1}'
          echo "---LOAD---"
          cat /proc/loadavg
          echo "---TRAFFIC---"
          INTERFACE=$(ip -o -4 route show to default | head -1 | awk '{print $5}')
          if [ -n "$INTERFACE" ]; then
            grep "$INTERFACE" /proc/net/dev | awk '{print $2,$10}'
          else
            cat /proc/net/dev | grep -E "eth0|enp|eno" | head -1 | awk '{print $2,$10}'
          fi
        `;

        const output = await this.executeCommand(config, command);
        return this.parseOutput(config, output);
      } catch (error) {
        console.error(`Error fetching SSH data for ${config.name}:`, error);
        // Return a "offline" placeholder for this server
        return this.getOfflinePlaceholder(config);
      }
    });

    return Promise.all(serverPromises);
  }

  private getOfflinePlaceholder(config: SshConfig): VpsServer {
    return {
        id: config.id,
        name: config.name,
        hostname: config.host,
        ipAddress: config.host,
        port: config.port,
        status: 'offline',
        os: 'custom',
        osVersion: 'Unknown',
        cpu: { cores: 0, usage: 0 },
        memory: { total: 0, used: 0, usage: 0 },
        storage: { total: 0, used: 0, usage: 0 },
        network: { inbound: 0, outbound: 0 },
        uptime: 0,
        location: 'Remote',
        provider: 'Managed',
        lastUpdated: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        tags: ['remote', 'ssh'],
    };
  }

  async getPaginated(page: number, perPage: number): Promise<PaginatedResult<VpsServer>> {
    const servers = await this.getAll();
    return {
      data: servers.slice((page - 1) * perPage, page * perPage),
      total: servers.length,
      page,
      perPage,
    };
  }

  async getByStatus(status: ServerStatus): Promise<VpsServer[]> {
    const servers = await this.getAll();
    return servers.filter((s) => s.status === status);
  }

  async search(query: string): Promise<VpsServer[]> {
    const servers = await this.getAll();
    const lowerQuery = query.toLowerCase();
    return servers.filter(
      (s) =>
        s.name.toLowerCase().includes(lowerQuery) ||
        s.hostname.toLowerCase().includes(lowerQuery) ||
        s.ipAddress.includes(query)
    );
  }

  async create(data: CreateVpsServerData): Promise<VpsServer> {
    throw new Error('Create not supported in SSH repository');
  }

  async update(id: string, data: UpdateVpsServerData): Promise<VpsServer> {
    throw new Error('Update not supported in SSH repository');
  }

  async delete(id: string): Promise<boolean> {
    throw new Error('Delete not supported in SSH repository');
  }

  async getStats(): Promise<ServerStats> {
    const servers = await this.getAll();
    return {
      totalServers: servers.length,
      onlineServers: servers.filter((s) => s.status === 'online').length,
      offlineServers: servers.filter((s) => s.status === 'offline').length,
      maintenanceServers: servers.filter((s) => s.status === 'maintenance').length,
      errorServers: servers.filter((s) => s.status === 'error').length,
      totalCpuCores: servers.reduce((acc, s) => acc + s.cpu.cores, 0),
      totalMemoryGB: servers.reduce((acc, s) => acc + s.memory.total, 0),
      totalStorageGB: servers.reduce((acc, s) => acc + s.storage.total, 0),
    };
  }

  async refreshMetrics(id: string): Promise<VpsServer> {
    const server = await this.getById(id);
    if (!server) throw new Error('Server not found');
    return server;
  }

  private parseOutput(config: SshConfig, output: string): VpsServer {
    const sections: Record<string, string[]> = {};
    let currentSection = '';

    output.split('\n').forEach((line) => {
      const trimmed = line.trim();
      if (trimmed.startsWith('---') && trimmed.endsWith('---')) {
        currentSection = trimmed.replace(/---/g, '');
        sections[currentSection] = [];
      } else if (currentSection && trimmed) {
        sections[currentSection].push(trimmed);
      }
    });

    const osFull = sections['OS']?.[0] || 'Ubuntu 22.04 LTS';
    const cpuModel = sections['CPU']?.[0] || 'Unknown CPU';
    const cpuCores = parseInt(sections['CPU']?.[1] || '1');

    // Memory Parsing
    const memLines = sections['MEM'] || [];
    const memRow = memLines.find((l) => l.startsWith('Mem:'))?.split(/\s+/) || [];
    const totalMemBytes = parseInt(memRow[1] || '0');
    const usedMemBytes = parseInt(memRow[2] || '0');

    // Disk Parsing
    const diskData = sections['DISK']?.[0]?.split(' ') || ['0', '0'];
    const totalDiskBytes = parseInt(diskData[0]);
    const usedDiskBytes = parseInt(diskData[1]);

    const uptimeSeconds = parseFloat(sections['UPTIME']?.[0] || '0');
    const loadData = sections['LOAD']?.[0]?.split(' ') || ['0', '0', '0'];
    const load1 = parseFloat(loadData[0]) || 0;

    const traffic = sections['TRAFFIC']?.[0]?.split(' ') || ['0', '0'];

    const totalRamGB = Math.round(totalMemBytes / (1024 * 1024 * 1024));
    const usedRamGB = usedMemBytes / (1024 * 1024 * 1024);
    const totalDiskGB = Math.round(totalDiskBytes / (1024 * 1024 * 1024));
    const usedDiskGB = usedDiskBytes / (1024 * 1024 * 1024);

    return {
      id: config.id,
      name: config.name,
      hostname: config.host,
      ipAddress: config.host,
      port: config.port,
      status: 'online',
      os: this.detectOs(osFull),
      osVersion: osFull,
      cpu: {
        cores: cpuCores,
        usage: Math.min(Math.round((load1 * 100) / cpuCores), 100),
      },
      memory: {
        total: totalRamGB,
        used: parseFloat(usedRamGB.toFixed(2)),
        usage: totalMemBytes > 0 ? Math.round((usedMemBytes / totalMemBytes) * 100) : 0,
      },
      storage: {
        total: totalDiskGB,
        used: parseFloat(usedDiskGB.toFixed(2)),
        usage: totalDiskBytes > 0 ? Math.round((usedDiskBytes / totalDiskBytes) * 100) : 0,
      },
      network: {
        inbound: Math.round(parseInt(traffic[0] || '0') / 1024 / 1024), // Approx MB
        outbound: Math.round(parseInt(traffic[1] || '0') / 1024 / 1024), // Approx MB
      },
      uptime: Math.round(uptimeSeconds / 3600), // Hours
      location: 'Remote',
      provider: 'Managed',
      lastUpdated: new Date().toISOString(),
      createdAt: new Date(Date.now() - uptimeSeconds * 1000).toISOString(),
      tags: ['remote', 'ssh'],
    };
  }

  private detectOs(osName: string): ServerOS {
    const name = osName.toLowerCase();
    if (name.includes('ubuntu')) return 'ubuntu';
    if (name.includes('debian')) return 'debian';
    if (name.includes('centos')) return 'centos';
    if (name.includes('windows')) return 'windows';
    return 'custom';
  }
}
