import { createStore, produce } from 'solid-js/store';
import { formatOrigin, parsePoint } from '../domain/canvas';
import { parseUidesc } from '../domain/parser';
import type { DocumentMetadata, DocumentStoreState } from '../types';
import type { Point, Size } from '../types/canvas';
import type { ViewNode, VSTGUIUIDescription } from '../types/uidesc';
import { resetCanvas } from './canvasStore';

function parseSizeRaw(size: string | undefined): Size {
  if (!size) {
    return { width: 0, height: 0 };
  }
  const parts = size.split(',');
  if (parts.length !== 2) {
    return { width: 0, height: 0 };
  }
  const width = Number.parseInt(parts[0].trim(), 10);
  const height = Number.parseInt(parts[1].trim(), 10);
  if (Number.isNaN(width) || Number.isNaN(height)) {
    return { width: 0, height: 0 };
  }
  return { width, height };
}

function formatSize(size: Size): string {
  return `${Math.round(size.width)}, ${Math.round(size.height)}`;
}

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
    // FR-009: Reset canvas (pan and zoom) on new document load
    resetCanvas();

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

export const documentStore = store;

export function setDocumentForTest(doc: VSTGUIUIDescription): void {
  setStore({
    document: doc,
    parseState: 'valid',
    parseErrors: null,
    detectedFormat: 'json',
  });
}

function findViewInTree(root: ViewNode, compositeId: string, rootId: string): ViewNode | null {
  if (compositeId === rootId) {
    return root;
  }

  const prefix = `${rootId}-`;
  if (!compositeId.startsWith(prefix)) {
    return null;
  }

  const remainingPath = compositeId.slice(prefix.length);
  const pathParts = remainingPath.split('-');

  let current: ViewNode = root;
  for (const part of pathParts) {
    if (!current.children?.[part]) {
      return null;
    }
    current = current.children[part];
  }

  return current;
}

export function updateViewOrigin(viewId: string, newOrigin: Point): Point | null {
  const doc = store.document;
  if (!doc) {
    return null;
  }

  const vstgui = doc['vstgui-ui-description'];
  if (!vstgui?.templates) {
    return null;
  }

  const templates = vstgui.templates;
  const templateEntries = Object.entries(templates);
  if (templateEntries.length === 0) {
    return null;
  }

  const [templateId, templateView] = templateEntries[0];
  const view = findViewInTree(templateView, viewId, templateId);

  if (!view) {
    return null;
  }

  const previousOrigin = parsePoint(view.attributes.origin);
  const newOriginStr = formatOrigin(newOrigin);

  setStore(
    produce(draft => {
      const draftDoc = draft.document;
      if (!draftDoc) return;

      const draftVstgui = draftDoc['vstgui-ui-description'];
      if (!draftVstgui?.templates) return;

      const draftView = findViewInTree(draftVstgui.templates[templateId], viewId, templateId);
      if (draftView) {
        draftView.attributes.origin = newOriginStr;
      }
    })
  );

  return previousOrigin;
}

export function updateViewSize(viewId: string, newSize: Size): Size | null {
  const doc = store.document;
  if (!doc) {
    return null;
  }

  const vstgui = doc['vstgui-ui-description'];
  if (!vstgui?.templates) {
    return null;
  }

  const templates = vstgui.templates;
  const templateEntries = Object.entries(templates);
  if (templateEntries.length === 0) {
    return null;
  }

  const [templateId, templateView] = templateEntries[0];
  const view = findViewInTree(templateView, viewId, templateId);

  if (!view) {
    return null;
  }

  const previousSize = parseSizeRaw(view.attributes.size);
  const newSizeStr = formatSize(newSize);

  setStore(
    produce(draft => {
      const draftDoc = draft.document;
      if (!draftDoc) return;

      const draftVstgui = draftDoc['vstgui-ui-description'];
      if (!draftVstgui?.templates) return;

      const draftView = findViewInTree(draftVstgui.templates[templateId], viewId, templateId);
      if (draftView) {
        draftView.attributes.size = newSizeStr;
      }
    })
  );

  return previousSize;
}
