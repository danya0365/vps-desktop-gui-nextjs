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

  async getFileContent(serverId: string, path: string): Promise<string> {
    const res = await fetch(`${this.baseUrl}/content?serverId=${serverId}&path=${encodeURIComponent(path)}`);
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || 'Failed to fetch file content');
    }
    const data = await res.json();
    return data.content;
  }
}
