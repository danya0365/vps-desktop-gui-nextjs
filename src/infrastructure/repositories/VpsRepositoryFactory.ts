/**
 * VpsRepositoryFactory
 * Factory for creating VPS server repositories
 * Following Clean Architecture - Infrastructure Layer
 */

import { IVpsServerRepository } from '@/src/application/repositories/IVpsServerRepository';
import { ApiVpsServerRepository } from './api/ApiVpsServerRepository';
import { MockVpsServerRepository } from './mock/MockVpsServerRepository';

export class VpsRepositoryFactory {
  private static instance: IVpsServerRepository | null = null;

  static getRepository(): IVpsServerRepository {
    if (this.instance) {
      return this.instance;
    }

    const repoType = process.env.NEXT_PUBLIC_VPS_REPO_TYPE || 'mock';

    if (repoType === 'ssh') {
      console.log('[VpsRepositoryFactory] Using ApiVpsServerRepository (SSH backend)');
      this.instance = new ApiVpsServerRepository();
    } else {
      console.log('[VpsRepositoryFactory] Using MockVpsServerRepository');
      this.instance = new MockVpsServerRepository();
    }

    return this.instance;
  }
}

// Export a singleton instance for convenience
export const vpsServerRepository = VpsRepositoryFactory.getRepository();
