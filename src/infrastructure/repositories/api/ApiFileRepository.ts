/**
 * ApiFileRepository
 * Implementation of IFileRepository using API calls
 * Following Clean Architecture - Infrastructure Layer
 */

import { IFileRepository } from '@/src/application/repositories/IFileRepository';
import { FileItem } from '@/src/domain/entities/FileItem';

export class ApiFileRepository implements IFileRepository {
  private baseUrl = '/api/vps/files';

  async listDirectory(serverId: string, path: string): Promise<FileItem[]> {
    const res = await fetch(`${this.baseUrl}?serverId=${serverId}&path=${encodeURIComponent(path)}`);
    if (!res.ok) {
      throw new Error('Failed to fetch file list');
    }
    return res.json();
  }
}
