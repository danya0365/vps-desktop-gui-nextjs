/**
 * FilesPresenterServerFactory
 * Factory for creating FilesPresenter on the server side
 */

import { MockFileRepository } from '@/src/infrastructure/repositories/mock/MockFileRepository';
import { MockVpsServerRepository } from '@/src/infrastructure/repositories/mock/MockVpsServerRepository';
import { SshFileRepository } from '@/src/infrastructure/repositories/system/SshFileRepository';
import { SshVpsServerRepository } from '@/src/infrastructure/repositories/system/SshVpsServerRepository';
import { FilesPresenter } from './FilesPresenter';

export class FilesPresenterServerFactory {
  static create(): FilesPresenter {
    const repoType = process.env.NEXT_PUBLIC_VPS_REPO_TYPE || 'mock';

    if (repoType === 'ssh') {
      return new FilesPresenter(
        new SshVpsServerRepository(),
        new SshFileRepository()
      );
    }

    return new FilesPresenter(
      new MockVpsServerRepository(),
      new MockFileRepository()
    );
  }
}

export function createServerFilesPresenter(): FilesPresenter {
  return FilesPresenterServerFactory.create();
}
