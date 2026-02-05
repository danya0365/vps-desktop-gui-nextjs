/**
 * SshFileRepository
 * Implementation of IFileRepository using SSH
 * Following Clean Architecture - Infrastructure Layer
 */

import { IFileRepository } from '@/src/application/repositories/IFileRepository';
import { FileItem } from '@/src/domain/entities/FileItem';
import { Client } from 'ssh2';

import { SshConfigManager } from '../../config/SshConfigManager';

export class SshFileRepository implements IFileRepository {
  private async executeCommand(serverId: string, command: string): Promise<string> {
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
              .on('close', (code: number, signal: string) => {
                conn.end();
                resolve(data);
              })
              .on('data', (chunk: Buffer) => {
                data += chunk.toString();
              })
              .stderr.on('data', (chunk: Buffer) => {
                console.error('SSH STDERR:', chunk.toString());
              });
          });
        })
        .on('error', (err) => {
          reject(err);
        })
        .connect(config);
    });
  }

  async listDirectory(serverId: string, path: string): Promise<FileItem[]> {
    try {
      // Use ls -lA --time-style=long-iso for consistent output
      const cleanPath = path.replace(/[;&|]/g, ''); // Basic sanitize
      const command = `ls -lA --time-style=long-iso "${cleanPath}"`;
      const output = await this.executeCommand(serverId, command);
      
      return this.parseLsOutput(output, cleanPath);
    } catch (error) {
      console.error('Error listing directory via SSH:', error);
      return [];
    }
  }

  async getFileContent(serverId: string, path: string): Promise<string> {
    try {
      const cleanPath = path.replace(/[;&|]/g, '');
      const ext = path.split('.').pop()?.toLowerCase();
      const isImage = ['png', 'jpg', 'jpeg', 'gif', 'svg', 'webp', 'ico'].includes(ext || '');

      if (isImage) {
        // Read file as base64 for images
        // We use -w 0 to prevent line wrapping which can break data URIs
        const command = `cat "${cleanPath}" | base64 -w 0 || cat "${cleanPath}" | base64`;
        const output = await this.executeCommand(serverId, command);
        // Remove any remaining newlines or spaces
        return output.replace(/\s/g, '');
      }

      // Use head to limit reading to first 1MB for text
      const command = `head -c 1048576 "${cleanPath}"`;
      const output = await this.executeCommand(serverId, command);
      return output;
    } catch (error) {
      console.error('Error fetching file content via SSH:', error);
      throw error;
    }
  }

  private parseLsOutput(output: string, parentPath: string): FileItem[] {
    const lines = output.split('\n');
    const items: FileItem[] = [];

    // Skip the first line if it contains "total"
    const startLine = lines[0]?.startsWith('total') ? 1 : 0;

    for (let i = startLine; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      // drwxr-xr-x 2 root root 4096 2024-12-31 23:59:59 name
      // Split by one or more whitespace characters
      const parts = line.split(/\s+/);
      if (parts.length < 8) continue;

      const permissions = parts[0];
      const owner = parts[2];
      const sizeBytes = parseInt(parts[4]);
      const date = parts[5];
      const time = parts[6];
      const name = parts.slice(7).join(' '); // Name might contain spaces

      if (name === '.' || name === '..') continue;

      const type = permissions.startsWith('d') ? 'folder' : 'file';
      const fullPath = parentPath === '/' ? `/${name}` : `${parentPath}/${name}`;

      items.push({
        id: Buffer.from(fullPath).toString('base64'), // Stable ID for react keys
        name,
        type,
        size: sizeBytes,
        modified: `${date}T${time}`,
        permissions,
        owner,
        path: fullPath
      });
    }

    return items;
  }
}
