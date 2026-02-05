/**
 * ITerminalRepository
 * Interface for terminal command execution
 * Following Clean Architecture - Application layer
 */

export interface ITerminalRepository {
  /**
   * Execute a command on a specific server
   * @param serverId The ID of the server to execute the command on
   * @param command The command string to execute
   * @param cwd The current working directory to execute the command in
   * @returns The standard output/error of the command, and the new cwd after execution
   */
  executeCommand(serverId: string, command: string, cwd: string): Promise<{ output: string; cwd: string }>;
}
