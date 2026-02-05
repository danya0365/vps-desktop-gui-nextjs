/**
 * ServersPresenterServerFactory
 * Factory for creating ServersPresenter instances on the server side
 */

import { MockVpsServerRepository } from "@/src/infrastructure/repositories/mock/MockVpsServerRepository";
import { SshVpsServerRepository } from "@/src/infrastructure/repositories/system/SshVpsServerRepository";
import { ServersPresenter } from "./ServersPresenter";

export class ServersPresenterServerFactory {
  static create(): ServersPresenter {
    const repoType = process.env.NEXT_PUBLIC_VPS_REPO_TYPE || 'mock';
    const repository = repoType === 'ssh'
      ? new SshVpsServerRepository()
      : new MockVpsServerRepository();
      
    return new ServersPresenter(repository);
  }
}

export function createServerServersPresenter(): ServersPresenter {
  return ServersPresenterServerFactory.create();
}
