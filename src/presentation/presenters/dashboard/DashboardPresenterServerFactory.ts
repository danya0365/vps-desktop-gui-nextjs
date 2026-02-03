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

    if (repoType === 'ssh') {
      return new DashboardPresenter(new SshVpsServerRepository());
    }

    return new DashboardPresenter(new MockVpsServerRepository());
  }
}

export function createServerDashboardPresenter(): DashboardPresenter {
  return DashboardPresenterServerFactory.create();
}
