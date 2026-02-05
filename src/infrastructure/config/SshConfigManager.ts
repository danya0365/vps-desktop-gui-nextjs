/**
 * SshConfigManager
 * Utility for managing multiple SSH server configurations from environment variables
 * Following Clean Architecture - Infrastructure Layer (Config)
 */

export interface SshConfig {
  id: string;
  name: string;
  host: string;
  port: number;
  username: string;
  password?: string;
  privateKey?: string;
}

export class SshConfigManager {
  /**
   * Get all SSH configurations from environment variables
   * Pattern: VPS_SSH_HOST_1, VPS_SSH_USER_1, etc.
   */
  static getAllConfigs(): SshConfig[] {
    const configs: SshConfig[] = [];
    
    // Check for single server pattern first (backward compatibility)
    if (process.env.VPS_SSH_HOST && !process.env.VPS_SSH_HOST_1) {
      configs.push({
        id: 'vps-1',
        name: process.env.VPS_SSH_NAME || 'Primary VPS',
        host: process.env.VPS_SSH_HOST,
        port: parseInt(process.env.VPS_SSH_PORT || '22'),
        username: process.env.VPS_SSH_USER || 'root',
        password: process.env.VPS_SSH_PASS,
      });
    }

    // Check for numbered pattern (1 to 10)
    for (let i = 1; i <= 10; i++) {
        const host = process.env[`VPS_SSH_HOST_${i}`];
        if (host) {
            configs.push({
                id: `vps-ssh-${i}`,
                name: process.env[`VPS_SSH_NAME_${i}`] || `VPS Server ${i}`,
                host: host,
                port: parseInt(process.env[`VPS_SSH_PORT_${i}`] || '22'),
                username: process.env[`VPS_SSH_USER_${i}`] || 'root',
                password: process.env[`VPS_SSH_PASS_${i}`],
            });
        }
    }

    return configs;
  }

  /**
   * Get configuration for a specific server ID
   */
  static getConfig(serverId: string): SshConfig | null {
    const configs = this.getAllConfigs();
    return configs.find(c => c.id === serverId) || null;
  }
}
