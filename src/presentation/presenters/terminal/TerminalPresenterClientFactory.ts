/**
 * TerminalPresenterClientFactory
 * Factory for creating TerminalPresenter instances on the client side
 */

'use client';

import { ApiTerminalRepository } from "@/src/infrastructure/repositories/api/ApiTerminalRepository";
import { ApiVpsServerRepository } from "@/src/infrastructure/repositories/api/ApiVpsServerRepository";
import { MockTerminalRepository } from "@/src/infrastructure/repositories/mock/MockTerminalRepository";
import { MockVpsServerRepository } from "@/src/infrastructure/repositories/mock/MockVpsServerRepository";
import { TerminalPresenter } from "./TerminalPresenter";

export class TerminalPresenterClientFactory {
  static create(): TerminalPresenter {
    const repoType = process.env.NEXT_PUBLIC_VPS_REPO_TYPE || 'mock';

    if (repoType === 'ssh') {
      return new TerminalPresenter(
        new ApiVpsServerRepository(),
        new ApiTerminalRepository()
      );
    }

    return new TerminalPresenter(
      new MockVpsServerRepository(),
      new MockTerminalRepository()
    );
  }
}

export function createClientTerminalPresenter(): TerminalPresenter {
  return TerminalPresenterClientFactory.create();
}
