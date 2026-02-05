/**
 * VpsRepositoryFactory
 * Factory for creating VPS server repositories
 * Following Clean Architecture - Infrastructure Layer
 */

import { IFileRepository } from '@/src/application/repositories/IFileRepository';
import { ITerminalRepository } from '@/src/application/repositories/ITerminalRepository';
import { IVpsServerRepository } from '@/src/application/repositories/IVpsServerRepository';
import { ApiFileRepository } from './api/ApiFileRepository';
import { ApiTerminalRepository } from './api/ApiTerminalRepository';
import { ApiVpsServerRepository } from './api/ApiVpsServerRepository';
import { MockFileRepository } from './mock/MockFileRepository';
import { MockTerminalRepository } from './mock/MockTerminalRepository';
import { MockVpsServerRepository } from './mock/MockVpsServerRepository';

export class VpsRepositoryFactory {
  private static vpsInstance: IVpsServerRepository | null = null;
  private static fileInstance: IFileRepository | null = null;
  private static terminalInstance: ITerminalRepository | null = null;

  static getRepository(): IVpsServerRepository {
    if (this.vpsInstance) {
      return this.vpsInstance;
    }

    const repoType = process.env.NEXT_PUBLIC_VPS_REPO_TYPE || 'mock';

    if (repoType === 'ssh') {
      console.log('[VpsRepositoryFactory] Using ApiVpsServerRepository (SSH backend)');
      this.vpsInstance = new ApiVpsServerRepository();
    } else {
      console.log('[VpsRepositoryFactory] Using MockVpsServerRepository');
      this.vpsInstance = new MockVpsServerRepository();
    }

    return this.vpsInstance;
  }

  static getFileRepository(): IFileRepository {
    if (this.fileInstance) {
      return this.fileInstance;
    }

    const repoType = process.env.NEXT_PUBLIC_VPS_REPO_TYPE || 'mock';

    if (repoType === 'ssh') {
      console.log('[VpsRepositoryFactory] Using ApiFileRepository (SSH backend)');
      this.fileInstance = new ApiFileRepository();
    } else {
      console.log('[VpsRepositoryFactory] Using MockFileRepository');
      this.fileInstance = new MockFileRepository();
    }

    return this.fileInstance;
  }

  static getTerminalRepository(): ITerminalRepository {
    if (this.terminalInstance) {
      return this.terminalInstance;
    }

    const repoType = process.env.NEXT_PUBLIC_VPS_REPO_TYPE || 'mock';

    if (repoType === 'ssh') {
      console.log('[VpsRepositoryFactory] Using ApiTerminalRepository (SSH backend)');
      this.terminalInstance = new ApiTerminalRepository();
    } else {
      console.log('[VpsRepositoryFactory] Using MockTerminalRepository');
      this.terminalInstance = new MockTerminalRepository();
    }

    return this.terminalInstance;
  }
}

// Export singleton instances for convenience
export const vpsServerRepository = VpsRepositoryFactory.getRepository();
export const fileRepository = VpsRepositoryFactory.getFileRepository();
export const terminalRepository = VpsRepositoryFactory.getTerminalRepository();
