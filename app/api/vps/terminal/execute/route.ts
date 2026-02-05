/**
 * Terminal Execution API Route
 * Handles terminal command execution on VPS servers
 */

import { MockTerminalRepository } from '@/src/infrastructure/repositories/mock/MockTerminalRepository';
import { SshTerminalRepository } from '@/src/infrastructure/repositories/system/SshTerminalRepository';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { serverId, command, cwd = '/' } = body;

    if (!serverId || !command) {
      return NextResponse.json(
        { message: 'Server ID and command are required' },
        { status: 400 }
      );
    }

    // Get the terminal repository (SSH or Mock) directly for server-side use
    const repoType = process.env.NEXT_PUBLIC_VPS_REPO_TYPE || 'mock';
    const terminalRepository = repoType === 'ssh' 
      ? new SshTerminalRepository() 
      : new MockTerminalRepository();

    // Execute the command with cwd context
    const result = await terminalRepository.executeCommand(serverId, command, cwd);

    return NextResponse.json({
      success: true,
      output: result.output,
      cwd: result.cwd,
    });
  } catch (error: any) {
    console.error('Terminal Execution Error:', error);
    return NextResponse.json(
      { 
        message: 'Failed to execute command', 
        error: error.message 
      },
      { status: 500 }
    );
  }
}
