/**
 * IVpsServerRepository
 * Repository interface for VPS Server data access
 * Following Clean Architecture - Application layer
 */

import type { ServerStats, VpsServer } from '@/src/domain/entities/VpsServer';

export interface CreateVpsServerData {
  name: string;
  hostname: string;
  ipAddress: string;
  port?: number;
  os: VpsServer['os'];
  osVersion: string;
  location: string;
  provider: string;
  tags?: string[];
}

export interface UpdateVpsServerData {
  name?: string;
  hostname?: string;
  ipAddress?: string;
  port?: number;
  status?: VpsServer['status'];
  tags?: string[];
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  perPage: number;
}

export interface IVpsServerRepository {
  /** Get server by ID */
  getById(id: string): Promise<VpsServer | null>;

  /** Get all servers */
  getAll(): Promise<VpsServer[]>;

  /** Get paginated servers */
  getPaginated(page: number, perPage: number): Promise<PaginatedResult<VpsServer>>;

  /** Get servers by status */
  getByStatus(status: VpsServer['status']): Promise<VpsServer[]>;

  /** Search servers by name or hostname */
  search(query: string): Promise<VpsServer[]>;

  /** Create a new server */
  create(data: CreateVpsServerData): Promise<VpsServer>;

  /** Update an existing server */
  update(id: string, data: UpdateVpsServerData): Promise<VpsServer>;

  /** Delete a server */
  delete(id: string): Promise<boolean>;

  /** Get server statistics */
  getStats(): Promise<ServerStats>;

  /** Refresh server metrics */
  refreshMetrics(id: string): Promise<VpsServer>;
}
