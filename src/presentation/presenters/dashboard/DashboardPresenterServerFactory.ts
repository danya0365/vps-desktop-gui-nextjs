/**
 * DashboardPresenterServerFactory
 * Factory for creating DashboardPresenter instances on the server side
 */

import { MockVpsServerRepository } from "@/src/infrastructure/repositories/mock/MockVpsServerRepository";
import { SshVpsServerRepository } from "@/src/infrastructure/repositories/system/SshVpsServerRepository";
import { DashboardPresenter } from "./DashboardPresenter";

export class DashboardPresenterServerFactory {
  static create(): DashboardPresenter {
    const repoType = process.env.NEXT_PUBLIC_VPS_REPO_TYPE || 'mock';
    const repository = repoType === 'ssh'
      ? new SshVpsServerRepository()
      : new MockVpsServerRepository();

    return new DashboardPresenter(repository);
  }
}

export function createServerDashboardPresenter(): DashboardPresenter {
  return DashboardPresenterServerFactory.create();
}
