/**
 * Document Store Extension API contract for Create New uidesc feature
 *
 * NOTE: This is a contract/design file showing additions to documentStore.
 * Implementation will be added to src/stores/documentStore.ts
 */

import type { NewDocumentConfig } from './types';

/**
 * Creates a new uidesc document and sets it as the active document.
 *
 * This function:
 * 1. Resets all canvas/editing state (canvas, template, guides, lock/hide stores)
 * 2. Creates a new document from the config
 * 3. Sets the document in the store with parseState: 'valid'
 * 4. Sets format as 'json' (detectedFormat and originalFormat)
 * 5. Clears file-related state (content, metadata, fileHandle)
 * 6. Marks document as NOT dirty (isDirty: false)
 * 7. Selects the first template
 * 8. Applies default preferences
 *
 * @param config - Document configuration (width, height, containerClass)
 *
 * @example
 * createNewDocument({ width: 800, height: 600, containerClass: 'CViewContainer' });
 * // Document is now loaded, editor view displays
 */
export function createNewDocument(config: NewDocumentConfig): void;
