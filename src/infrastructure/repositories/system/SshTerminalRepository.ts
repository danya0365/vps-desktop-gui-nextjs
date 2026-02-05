/**
 * SshTerminalRepository
 * Implementation of ITerminalRepository using real SSH execution
 * Following Clean Architecture - Infrastructure Layer
 * For use in Server Components / API Routes
 */

import { ITerminalRepository } from "@/src/application/repositories/ITerminalRepository";
import { Client } from 'ssh2';

import { SshConfigManager } from "../../config/SshConfigManager";

export class SshTerminalRepository implements ITerminalRepository {
  private async executeRawCommand(serverId: string, command: string): Promise<string> {
    const config = SshConfigManager.getConfig(serverId);
    if (!config) {
        throw new Error(`Server with ID ${serverId} not found in configuration`);
    }

    if (!config.host || !config.username) {
      throw new Error(`SSH credentials not configured for server ${serverId}`);
    }

    return new Promise((resolve, reject) => {
      const conn = new Client();
      conn
        .on('ready', () => {
          conn.exec(command, (err, stream) => {
            if (err) {
              conn.end();
              return reject(err);
            }
            let data = '';
            stream
              .on('close', () => {
                conn.end();
                resolve(data);
              })
              .on('data', (chunk: Buffer) => {
                data += chunk.toString();
              })
              .stderr.on('data', (chunk: Buffer) => {
                data += chunk.toString();
              });
          });
        })
        .on('error', (err) => {
          reject(err);
        })
        .connect(config);
    });
  }

  async executeCommand(serverId: string, command: string, cwd: string): Promise<{ output: string; cwd: string }> {
    // Execute the command in the specified cwd and then print the final directory
    // We use a separator to split the output from the final pwd
    const separator = '___CWD_SEPARATOR___';
    const fullCommand = `cd "${cwd}" 2>/dev/null || cd /; ${command}; echo "${separator}"; pwd`;

    const rawOutput = await this.executeRawCommand(serverId, fullCommand);
    
    // Split the output to get the command result and the new cwd
    const parts = rawOutput.split(separator);
    const output = parts[0]?.trim() || '';
    const newCwd = parts[1]?.trim() || cwd;

    return { output, cwd: newCwd };
  }
}
