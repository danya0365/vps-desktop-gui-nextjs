/**
 * DashboardPresenterClientFactory
 * Factory for creating DashboardPresenter instances on the client side
 */

'use client';

import { ApiVpsServerRepository } from "@/src/infrastructure/repositories/api/ApiVpsServerRepository";
import { MockVpsServerRepository } from "@/src/infrastructure/repositories/mock/MockVpsServerRepository";
import { DashboardPresenter } from "./DashboardPresenter";

export class DashboardPresenterClientFactory {
  static create(): DashboardPresenter {
    const repoType = process.env.NEXT_PUBLIC_VPS_REPO_TYPE || 'mock';

    if (repoType === 'ssh') {
      return new DashboardPresenter(new ApiVpsServerRepository());
    }

    return new DashboardPresenter(new MockVpsServerRepository());
  }
}

export function createClientDashboardPresenter(): DashboardPresenter {
  return DashboardPresenterClientFactory.create();
}
