/**
 * ApiVpsServerRepository
 * Implementation of IVpsServerRepository using API calls
 * Following Clean Architecture - Infrastructure Layer
 * For use in Client Components
 */

import type {
    CreateVpsServerData,
    IVpsServerRepository,
    PaginatedResult,
    UpdateVpsServerData,
} from '@/src/application/repositories/IVpsServerRepository';
import type { ServerStats, ServerStatus, VpsServer } from '@/src/domain/entities/VpsServer';

export class ApiVpsServerRepository implements IVpsServerRepository {
  private baseUrl = '/api/vps';

  async getById(id: string): Promise<VpsServer | null> {
    const res = await fetch(`${this.baseUrl}/${id}`);
    if (res.status === 404) return null;
    if (!res.ok) throw new Error('Failed to fetch server');
    return res.json();
  }

  async getAll(): Promise<VpsServer[]> {
    const res = await fetch(this.baseUrl);
    if (!res.ok) throw new Error('Failed to fetch servers');
    return res.json();
  }

  async getPaginated(page: number, perPage: number): Promise<PaginatedResult<VpsServer>> {
    const res = await fetch(`${this.baseUrl}?page=${page}&perPage=${perPage}`);
    if (!res.ok) throw new Error('Failed to fetch paginated servers');
    return res.json();
  }

  async getByStatus(status: ServerStatus): Promise<VpsServer[]> {
    const res = await fetch(`${this.baseUrl}?status=${status}`);
    if (!res.ok) throw new Error('Failed to fetch servers by status');
    return res.json();
  }

  async search(query: string): Promise<VpsServer[]> {
    const res = await fetch(`${this.baseUrl}?search=${encodeURIComponent(query)}`);
    if (!res.ok) throw new Error('Failed to search servers');
    return res.json();
  }

  async create(data: CreateVpsServerData): Promise<VpsServer> {
    const res = await fetch(this.baseUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to create server');
    return res.json();
  }

  async update(id: string, data: UpdateVpsServerData): Promise<VpsServer> {
    const res = await fetch(`${this.baseUrl}/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to update server');
    return res.json();
  }

  async delete(id: string): Promise<boolean> {
    const res = await fetch(`${this.baseUrl}/${id}`, { method: 'DELETE' });
    if (!res.ok) return false;
    const result = await res.json();
    return result.success;
  }

  async getStats(): Promise<ServerStats> {
    const res = await fetch(`${this.baseUrl}/stats`);
    if (!res.ok) throw new Error('Failed to fetch stats');
    return res.json();
  }

  async refreshMetrics(id: string): Promise<VpsServer> {
    const res = await fetch(`${this.baseUrl}/${id}/refresh`, { method: 'POST' });
    if (!res.ok) throw new Error('Failed to refresh metrics');
    return res.json();
  }
}
