/**
 * TerminalPresenterServerFactory
 * Factory for creating TerminalPresenter instances on the server side
 */

import { MockTerminalRepository } from "@/src/infrastructure/repositories/mock/MockTerminalRepository";
import { MockVpsServerRepository } from "@/src/infrastructure/repositories/mock/MockVpsServerRepository";
import { SshTerminalRepository } from "@/src/infrastructure/repositories/system/SshTerminalRepository";
import { SshVpsServerRepository } from "@/src/infrastructure/repositories/system/SshVpsServerRepository";
import { TerminalPresenter } from "./TerminalPresenter";

export class TerminalPresenterServerFactory {
  static create(): TerminalPresenter {
    const repoType = process.env.NEXT_PUBLIC_VPS_REPO_TYPE || 'mock';

    if (repoType === 'ssh') {
      return new TerminalPresenter(
        new SshVpsServerRepository(),
        new SshTerminalRepository()
      );
    }

    return new TerminalPresenter(
      new MockVpsServerRepository(),
      new MockTerminalRepository()
    );
  }
}

export function createServerTerminalPresenter(): TerminalPresenter {
  return TerminalPresenterServerFactory.create();
}
