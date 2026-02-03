/**
 * SshFileRepository
 * Implementation of IFileRepository using SSH
 * Following Clean Architecture - Infrastructure Layer
 */

import { IFileRepository } from '@/src/application/repositories/IFileRepository';
import { FileItem } from '@/src/domain/entities/FileItem';
import { Client } from 'ssh2';

export class SshFileRepository implements IFileRepository {
  private config = {
    host: process.env.VPS_SSH_HOST || '',
    port: parseInt(process.env.VPS_SSH_PORT || '22'),
    username: process.env.VPS_SSH_USER || '',
    password: process.env.VPS_SSH_PASS || '',
  };

  private async executeCommand(command: string): Promise<string> {
    if (!this.config.host || !this.config.username) {
      throw new Error('SSH credentials not configured');
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
        .connect(this.config);
    });
  }

  async listDirectory(serverId: string, path: string): Promise<FileItem[]> {
    try {
      // Use ls -lA --time-style=long-iso for consistent output
      const cleanPath = path.replace(/[;&|]/g, ''); // Basic sanitize
      const command = `ls -lA --time-style=long-iso "${cleanPath}"`;
      const output = await this.executeCommand(command);
      
      return this.parseLsOutput(output, cleanPath);
    } catch (error) {
      console.error('Error listing directory via SSH:', error);
      return [];
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
