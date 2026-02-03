/**
 * DashboardPresenter
 * Handles business logic for the main dashboard
 * Follows Clean Architecture - Presentation Layer
 */

import { IVpsServerRepository } from "@/src/application/repositories/IVpsServerRepository";
import type { ServerStats, VpsServer } from "@/src/domain/entities/VpsServer";

export interface DashboardViewModel {
  servers: VpsServer[];
  stats: ServerStats | null;
}

export class DashboardPresenter {
  constructor(private readonly repository: IVpsServerRepository) {}

  /**
   * Get initial view model for the dashboard
   */
  async getViewModel(): Promise<DashboardViewModel> {
    try {
      const [servers, stats] = await Promise.all([
        this.repository.getAll(),
        this.repository.getStats(),
      ]);

      return {
        servers,
        stats,
      };
    } catch (error) {
      console.error("Error fetching dashboard view model:", error);
      throw error;
    }
  }

  /**
   * Refresh servers data
   */
  async getServers(): Promise<VpsServer[]> {
    return this.repository.getAll();
  }

  /**
   * Refresh stats data
   */
  async getStats(): Promise<ServerStats> {
    return this.repository.getStats();
  }
}
