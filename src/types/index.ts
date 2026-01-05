/**
 * Type definitions for the uidesc file upload feature
 */

/**
 * State machine for upload process
 * - idle: No file loaded, waiting for user action
 * - dragging: File is being dragged over the drop zone
 * - loading: File is being read
 * - success: File successfully loaded
 * - error: An error occurred during upload
 */
export type UploadState = 'idle' | 'dragging' | 'loading' | 'success' | 'error';

/**
 * Discriminated union for upload error types
 */
export type UploadError =
  | { type: 'invalid-extension'; filename: string; message: string }
  | { type: 'empty-file'; message: string };

/**
 * Metadata about the loaded document
 */
export interface DocumentMetadata {
  filename: string;
  fileSize: number;
  loadedAt: Date;
}

/**
 * Global store state for the document
 */
export interface DocumentStoreState {
  content: string | null;
  metadata: DocumentMetadata | null;
  uploadState: UploadState;
  error: UploadError | null;
}
