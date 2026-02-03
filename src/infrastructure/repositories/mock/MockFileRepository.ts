/**
 * MockFileRepository
 * Mock implementation of IFileRepository
 */

import { IFileRepository } from '@/src/application/repositories/IFileRepository';
import { FileItem } from '@/src/domain/entities/FileItem';

export class MockFileRepository implements IFileRepository {
  private mockData: Record<string, FileItem[]> = {
    '/': [
      { id: '1', name: 'bin', type: 'folder', modified: '2025-01-15T10:30:00', permissions: 'drwxr-xr-x', owner: 'root', path: '/bin' },
      { id: '2', name: 'etc', type: 'folder', modified: '2025-01-20T14:45:00', permissions: 'drwxr-xr-x', owner: 'root', path: '/etc' },
      { id: '3', name: 'home', type: 'folder', modified: '2025-01-28T09:12:00', permissions: 'drwxr-xr-x', owner: 'root', path: '/home' },
      { id: '4', name: 'var', type: 'folder', modified: '2025-02-01T16:20:00', permissions: 'drwxr-xr-x', owner: 'root', path: '/var' },
    ],
    '/home': [
      { id: 'h1', name: 'admin', type: 'folder', modified: '2025-02-01T10:00:00', permissions: 'drwxr-xr-x', owner: 'admin', path: '/home/admin' },
    ],
    '/home/admin': [
      { id: 'a1', name: '.bashrc', type: 'file', size: 3771, modified: '2025-01-15T12:00:00', permissions: '-rw-r--r--', owner: 'admin', path: '/home/admin/.bashrc' },
      { id: 'a5', name: 'deploy.sh', type: 'file', size: 2048, modified: '2025-02-02T15:30:00', permissions: '-rwxr-xr-x', owner: 'admin', path: '/home/admin/deploy.sh' },
    ]
  };

  async listDirectory(serverId: string, path: string): Promise<FileItem[]> {
    await new Promise(resolve => setTimeout(resolve, 300)); // Simulate network delay
    return this.mockData[path] || [];
  }

  async getFileContent(serverId: string, path: string): Promise<string> {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    if (path === '/home/admin/.bashrc') {
      return `# .bashrc\n\n# User specific aliases and functions\nalias ll='ls -al'\nalias l='ls -CF'\n\n# Source global definitions\nif [ -f /etc/bashrc ]; then\n\t. /etc/bashrc\nfi`;
    }
    
    if (path === '/home/admin/deploy.sh') {
      return `#!/bin/bash\n\necho "Starting deployment..."\nnpm install\nnpm run build\npm2 restart all\necho "Deployment finished!"`;
    }

    const ext = path.split('.').pop()?.toLowerCase();
    if (['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg', 'ico'].includes(ext || '')) {
      if (ext === 'svg') {
        // Mock SVG base64 (a simple blue circle)
        const svgContent = '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="50" r="40" fill="blue" /></svg>';
        return Buffer.from(svgContent).toString('base64');
      }
      // Mock base64 for other images
      return 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';
    }

    return `// Content for ${path}\n// This is a mock file content.`;
  }
}
