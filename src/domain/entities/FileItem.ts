/**
 * FileItem Entity
 * Domain entity for file system management
 */

export interface FileItem {
  id: string;
  name: string;
  type: 'file' | 'folder';
  size?: number; // in bytes
  modified: string; // ISO string
  permissions: string; // e.g., drwxr-xr-x
  owner: string; // e.g., root
  path: string; // absolute path
}
