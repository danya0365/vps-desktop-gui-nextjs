/**
 * FilesPresenterClientFactory
 * Factory for creating FilesPresenter on the client side
 */

'use client';

import { ApiFileRepository } from '@/src/infrastructure/repositories/api/ApiFileRepository';
import { ApiVpsServerRepository } from '@/src/infrastructure/repositories/api/ApiVpsServerRepository';
import { MockFileRepository } from '@/src/infrastructure/repositories/mock/MockFileRepository';
import { MockVpsServerRepository } from '@/src/infrastructure/repositories/mock/MockVpsServerRepository';
import { FilesPresenter } from './FilesPresenter';

export class FilesPresenterClientFactory {
  static create(): FilesPresenter {
    const repoType = process.env.NEXT_PUBLIC_VPS_REPO_TYPE || 'mock';

    if (repoType === 'ssh') {
      return new FilesPresenter(
        new ApiVpsServerRepository(),
        new ApiFileRepository()
      );
    }

    return new FilesPresenter(
      new MockVpsServerRepository(),
      new MockFileRepository()
    );
  }
}

export function createClientFilesPresenter(): FilesPresenter {
  return FilesPresenterClientFactory.create();
}
