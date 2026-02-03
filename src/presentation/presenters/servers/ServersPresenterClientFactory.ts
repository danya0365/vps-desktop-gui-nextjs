/**
 * ServersPresenterClientFactory
 * Factory for creating ServersPresenter instances on the client side
 */

'use client';

import { ApiVpsServerRepository } from "@/src/infrastructure/repositories/api/ApiVpsServerRepository";
import { MockVpsServerRepository } from "@/src/infrastructure/repositories/mock/MockVpsServerRepository";
import { ServersPresenter } from "./ServersPresenter";

export class ServersPresenterClientFactory {
  static create(): ServersPresenter {
    const repoType = process.env.NEXT_PUBLIC_VPS_REPO_TYPE || 'mock';

    if (repoType === 'ssh') {
      return new ServersPresenter(new ApiVpsServerRepository());
    }

    return new ServersPresenter(new MockVpsServerRepository());
  }
}

export function createClientServersPresenter(): ServersPresenter {
  return ServersPresenterClientFactory.create();
}
