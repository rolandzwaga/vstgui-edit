import type { SaveFormat } from './serializer';

export interface SaveResult {
  success: boolean;
  error?: string;
  fileHandle?: FileSystemFileHandle;
  filename?: string;
}

export declare function saveDocument(content: string): Promise<SaveResult>;

export declare function saveAsDocument(
  content: string,
  filename: string,
  format: SaveFormat
): Promise<SaveResult>;

export declare function downloadDocument(
  content: string,
  filename: string,
  format: SaveFormat
): void;

export declare function hasFileSystemAccess(): boolean;
