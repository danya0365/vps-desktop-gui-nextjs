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

    if (repoType === 'ssh') {
      return new ServersPresenter(new SshVpsServerRepository());
    }

    return new ServersPresenter(new MockVpsServerRepository());
  }
}

export function createServerServersPresenter(): ServersPresenter {
  return ServersPresenterServerFactory.create();
}
