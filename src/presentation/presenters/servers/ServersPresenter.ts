/**
 * ServersPresenter
 * Handles business logic for server management
 * Following Clean Architecture - Presentation Layer
 */

import { CreateVpsServerData, IVpsServerRepository, UpdateVpsServerData } from "@/src/application/repositories/IVpsServerRepository";
import type { VpsServer } from "@/src/domain/entities/VpsServer";
import { Metadata } from "next";

export interface ServersViewModel {
  servers: VpsServer[];
}

export class ServersPresenter {
  constructor(private readonly repository: IVpsServerRepository) {}

  /**
   * Get initial view model for the servers page
   */
  async getViewModel(): Promise<ServersViewModel> {
    try {
      const servers = await this.repository.getAll();
      return { servers };
    } catch (error) {
      console.error("Error getting servers view model:", error);
      throw error;
    }
  }

  /**
   * Generate metadata for the servers page
   */
  generateMetadata(): Metadata {
    return {
      title: "Servers Management | VPS Desktop",
      description: "Manage your virtual private servers instances",
    };
  }

  /**
   * Create a new server
   */
  async createServer(data: CreateVpsServerData): Promise<VpsServer> {
    try {
      return await this.repository.create(data);
    } catch (error) {
      console.error("Error creating server:", error);
      throw error;
    }
  }

  /**
   * Update an existing server
   */
  async updateServer(id: string, data: UpdateVpsServerData): Promise<VpsServer> {
    try {
      return await this.repository.update(id, data);
    } catch (error) {
      console.error("Error updating server:", error);
      throw error;
    }
  }

  /**
   * Delete a server
   */
  async deleteServer(id: string): Promise<boolean> {
    try {
      return await this.repository.delete(id);
    } catch (error) {
      console.error("Error deleting server:", error);
      throw error;
    }
  }

  /**
   * Search servers
   */
  async searchServers(query: string): Promise<VpsServer[]> {
    return this.repository.search(query);
  }

  /**
   * Refresh server metrics
   */
  async refreshServer(id: string): Promise<VpsServer> {
    return this.repository.refreshMetrics(id);
  }
}
