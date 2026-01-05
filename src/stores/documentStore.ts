import { createStore } from 'solid-js/store';
import { parseUidesc } from '../domain/parser';
import type { DocumentMetadata, DocumentStoreState } from '../types';

const initialState: DocumentStoreState = {
  // Upload state (from 001-uidesc-upload)
  content: null,
  metadata: null,
  uploadState: 'idle',
  error: null,
  // Parse state (from 002-uidesc-parsing)
  document: null,
  parseState: 'idle',
  parseErrors: null,
  detectedFormat: null,
};

const [store, setStore] = createStore<DocumentStoreState>({ ...initialState });

/**
 * Validates that the file has a .uidesc extension (case-insensitive)
 */
function validateExtension(filename: string): boolean {
  return filename.toLowerCase().endsWith('.uidesc');
}

/**
 * Reads a file as text using FileReader
 */
function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsText(file);
  });
}

/**
 * Parse the content and update parse state
 * FR-000: Automatically triggered after successful file upload
 */
function parseContent(content: string): void {
  // Set parsing state
  setStore({ parseState: 'parsing' });

  const result = parseUidesc(content);

  if (result.success) {
    setStore({
      parseState: 'valid',
      document: result.document,
      parseErrors: null,
      detectedFormat: result.format,
    });
  } else {
    setStore({
      parseState: 'invalid',
      document: null,
      parseErrors: result.errors,
      detectedFormat: result.format,
    });
  }
}

/**
 * Load a file into the document store
 * Validates extension and empty file, stores raw string content
 */
export async function loadFile(file: File): Promise<void> {
  // Validate extension first
  if (!validateExtension(file.name)) {
    setStore({
      uploadState: 'error',
      error: {
        type: 'invalid-extension',
        filename: file.name,
        message: `File "${file.name}" is not a .uidesc file`,
      },
    });
    return;
  }

  // Set loading state
  setStore({ uploadState: 'loading', error: null });

  try {
    const content = await readFileAsText(file);

    // Check for empty file
    if (content.length === 0) {
      setStore({
        uploadState: 'error',
        error: {
          type: 'empty-file',
          message: 'The file is empty',
        },
      });
      return;
    }

    // Success - store raw content and metadata
    const metadata: DocumentMetadata = {
      filename: file.name,
      fileSize: content.length,
      loadedAt: new Date(),
    };

    setStore({
      content,
      metadata,
      uploadState: 'success',
      error: null,
    });

    // FR-000: Automatically trigger parsing after successful upload
    parseContent(content);
  } catch {
    setStore({
      uploadState: 'error',
      error: {
        type: 'empty-file',
        message: 'Failed to read file',
      },
    });
  }
}

/**
 * Reset the store to initial state
 */
export function reset(): void {
  setStore({ ...initialState });
}

/**
 * Set the dragging state
 * Only transitions from idle to dragging or dragging to idle
 */
export function setDragging(isDragging: boolean): void {
  if (isDragging) {
    setStore({ uploadState: 'dragging' });
  } else if (store.uploadState === 'dragging') {
    setStore({ uploadState: 'idle' });
  }
}

/**
 * Exported store for reactive access
 */
export const documentStore = store;
