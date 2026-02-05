/**
 * ApiTerminalRepository
 * Implementation of ITerminalRepository using API calls
 * Following Clean Architecture - Infrastructure Layer
 * For use in Client Components
 */

import { ITerminalRepository } from "@/src/application/repositories/ITerminalRepository";

export class ApiTerminalRepository implements ITerminalRepository {
  private baseUrl = '/api/vps';

  async executeCommand(serverId: string, command: string, cwd: string): Promise<{ output: string; cwd: string }> {
    const res = await fetch(`${this.baseUrl}/terminal/execute`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ serverId, command, cwd }),
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || 'Failed to execute command');
    }

    return res.json();
  }
}
