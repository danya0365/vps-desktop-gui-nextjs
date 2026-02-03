/**
 * FilesPresenter
 * Handles business logic for file management
 * Separates data fetching and state preparation from UI
 */

import { IFileRepository } from '@/src/application/repositories/IFileRepository';
import { IVpsServerRepository } from '@/src/application/repositories/IVpsServerRepository';
import { FileItem } from '@/src/domain/entities/FileItem';
import { VpsServer } from '@/src/domain/entities/VpsServer';
import { Metadata } from 'next';

export interface FilesViewModel {
  servers: VpsServer[];
  selectedServer: VpsServer | null;
  files: FileItem[];
  currentPath: string;
}

export class FilesPresenter {
  constructor(
    private readonly vpsRepository: IVpsServerRepository,
    private readonly fileRepository: IFileRepository
  ) {}

  /**
   * Get initial view model for the page
   */
  async getViewModel(serverId?: string, path: string = '/'): Promise<FilesViewModel> {
    try {
      const servers = await this.vpsRepository.getAll();
      let selectedServer = null;

      if (serverId) {
        selectedServer = await this.vpsRepository.getById(serverId);
      } else {
        selectedServer = servers.find(s => s.status === 'online') || servers[0] || null;
      }

      let files: FileItem[] = [];
      if (selectedServer) {
        files = await this.fileRepository.listDirectory(selectedServer.id, path);
      }

      return {
        servers,
        selectedServer,
        files,
        currentPath: path
      };
    } catch (error) {
      console.error('Error getting Files view model:', error);
      throw error;
    }
  }

  /**
   * List files in a directory
   */
  async listFiles(serverId: string, path: string): Promise<FileItem[]> {
    return this.fileRepository.listDirectory(serverId, path);
  }

  /**
   * Get file content
   */
  async getFileContent(serverId: string, path: string): Promise<string> {
    return this.fileRepository.getFileContent(serverId, path);
  }

  /**
   * Generate page metadata
   */
  generateMetadata(): Metadata {
    return {
      title: 'File Manager | VPS Dashboard',
      description: 'Manage files on your remote VPS servers over SSH'
    };
  }
}
