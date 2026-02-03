/**
 * IFileRepository
 * Repository interface for file system operations
 * Following Clean Architecture - Application layer
 */


import { FileItem } from '@/src/domain/entities/FileItem';

export interface IFileRepository {
  /** List files and directories in a specific path */
  listDirectory(serverId: string, path: string): Promise<FileItem[]>;

  /** Get file content (if text-based) */
  getFileContent(serverId: string, path: string): Promise<string>;
  
  /** Create a new directory */
  createDirectory?(serverId: string, path: string): Promise<boolean>;
  
  /** Delete a file or directory */
  deleteItem?(serverId: string, path: string): Promise<boolean>;
}
