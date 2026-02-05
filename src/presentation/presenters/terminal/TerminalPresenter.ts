/**
 * TerminalPresenter
 * Handles terminal business logic (executing commands, history, server management)
 * Following Clean Architecture - Presentation Layer
 */

import { ITerminalRepository } from "@/src/application/repositories/ITerminalRepository";
import { IVpsServerRepository } from "@/src/application/repositories/IVpsServerRepository";
import type { VpsServer } from "@/src/domain/entities/VpsServer";

export interface TerminalViewModel {
  onlineServers: VpsServer[];
}

export class TerminalPresenter {
  constructor(
    private readonly serverRepository: IVpsServerRepository,
    private readonly terminalRepository: ITerminalRepository
  ) {}

  /**
   * Get initial view model (list of online servers)
   */
  async getViewModel(): Promise<TerminalViewModel> {
    try {
      const servers = await this.serverRepository.getAll();
      const onlineServers = servers.filter(s => s.status === 'online');
      return { onlineServers };
    } catch (error) {
      console.error("Error getting terminal view model:", error);
      throw error;
    }
  }

  /**
   * Execute a command on a specific server with cwd context
   */
  async executeCommand(serverId: string, command: string, cwd: string): Promise<{ output: string; cwd: string }> {
    if (!serverId) throw new Error("No server selected");
    if (!command.trim()) return { output: "", cwd };
    
    try {
      return await this.terminalRepository.executeCommand(serverId, command, cwd);
    } catch (error: any) {
      console.error("Error executing command:", error);
      return { output: `Error: ${error.message || 'Unknown error occurred'}`, cwd };
    }
  }
}
