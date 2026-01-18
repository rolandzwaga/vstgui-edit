import { bitmapService } from '../../services/indexedDB/bitmapService';
import type { HistoryOperation } from '../../types/history';
import type { BitmapDefinition, BitmapType } from '../../types/uidesc';
import type { Bitmap } from '../project/types';
import { invalidateThumbnailCache } from './thumbnail';

/** Properties exclusive to each bitmap type (cleared when switching away) */
export const BITMAP_TYPE_PROPERTIES: Record<BitmapType, string[]> = {
  standard: [],
  ninepart: ['nineparttiled-offsets'],
  multiframe: ['multiframe-num-frames', 'multiframe-size', 'mulitframe-frames-per-row'],
};

export interface RemovedBitmapReference {
  viewId: string;
  attribute: string;
  value: string;
}

/**
 * Data needed to undo/redo a bitmap upload operation.
 */
export interface UploadBitmapData {
  /** The name of the bitmap in the uidesc document */
  bitmapName: string;
  /** The bitmap definition to add to uidesc */
  bitmapDefinition: BitmapDefinition;
  /** The full IndexedDB bitmap record (includes blob) */
  indexedDBBitmap: Bitmap;
}

type AddBitmapFn = (name: string, bitmap: BitmapDefinition | string) => void;
type DeleteBitmapFn = (name: string) => { removedReferences: RemovedBitmapReference[] } | null;
type UpdateBitmapNameFn = (oldName: string, newName: string) => boolean;
type UpdateBitmapPropertyFn = (
  name: string,
  prop: string,
  value: string
) => string | null | undefined;
type UpdateViewAttributeFn = (viewId: string, attribute: string, value: string) => void;

let storeAddBitmap: AddBitmapFn;
let storeDeleteBitmap: DeleteBitmapFn;
let storeUpdateBitmapName: UpdateBitmapNameFn;
let storeUpdateBitmapProperty: UpdateBitmapPropertyFn;
let storeUpdateViewAttribute: UpdateViewAttributeFn;

export function initBitmapHistoryOperations(
  addBitmap: AddBitmapFn,
  deleteBitmap: DeleteBitmapFn,
  updateBitmapName: UpdateBitmapNameFn,
  updateBitmapProperty: UpdateBitmapPropertyFn,
  updateViewAttribute: UpdateViewAttributeFn
): void {
  storeAddBitmap = addBitmap;
  storeDeleteBitmap = deleteBitmap;
  storeUpdateBitmapName = updateBitmapName;
  storeUpdateBitmapProperty = updateBitmapProperty;
  storeUpdateViewAttribute = updateViewAttribute;
}

export function createAddBitmapOperation(name: string, bitmap: BitmapDefinition): HistoryOperation {
  let removedReferences: RemovedBitmapReference[] = [];
  return {
    type: 'add-bitmap',
    description: `Add bitmap "${name}"`,
    timestamp: Date.now(),
    undo: () => {
      const result = storeDeleteBitmap(name);
      if (result) {
        removedReferences = result.removedReferences;
      }
    },
    redo: () => {
      storeAddBitmap(name, bitmap);
      for (const ref of removedReferences) {
        storeUpdateViewAttribute(ref.viewId, ref.attribute, ref.value);
      }
    },
  };
}

export function createEditBitmapNameOperation(oldName: string, newName: string): HistoryOperation {
  return {
    type: 'edit-bitmap-name',
    description: `Rename bitmap "${oldName}" to "${newName}"`,
    timestamp: Date.now(),
    undo: () => storeUpdateBitmapName(newName, oldName),
    redo: () => storeUpdateBitmapName(oldName, newName),
  };
}

export function createEditBitmapPropertyOperation(
  name: string,
  prop: string,
  oldValue: string,
  newValue: string
): HistoryOperation {
  return {
    type: 'edit-bitmap-property',
    description: `Change ${prop} of bitmap "${name}"`,
    timestamp: Date.now(),
    undo: () => storeUpdateBitmapProperty(name, prop, oldValue),
    redo: () => storeUpdateBitmapProperty(name, prop, newValue),
  };
}

export function createDeleteBitmapOperation(
  name: string,
  bitmap: BitmapDefinition | string,
  removedReferences: RemovedBitmapReference[] = [],
  indexedDBBitmap?: Bitmap
): HistoryOperation {
  return {
    type: 'delete-bitmap',
    description: `Delete bitmap "${name}"`,
    timestamp: Date.now(),
    undo: () => {
      storeAddBitmap(name, bitmap);
      for (const ref of removedReferences) {
        storeUpdateViewAttribute(ref.viewId, ref.attribute, ref.value);
      }
      // Restore blob to IndexedDB if it existed
      if (indexedDBBitmap) {
        bitmapService.add(indexedDBBitmap).catch(err => {
          console.error('Failed to restore bitmap to IndexedDB during undo:', err);
        });
        invalidateThumbnailCache(indexedDBBitmap.projectId, name);
      }
    },
    redo: () => {
      storeDeleteBitmap(name);
      // Delete blob from IndexedDB if it existed
      if (indexedDBBitmap) {
        bitmapService.delete(indexedDBBitmap.id).catch(err => {
          console.error('Failed to delete bitmap from IndexedDB during redo:', err);
        });
        invalidateThumbnailCache(indexedDBBitmap.projectId, name);
      }
    },
  };
}

/**
 * Creates a history operation for uploading a bitmap file.
 *
 * This operation handles both:
 * - Adding/removing the bitmap definition in the uidesc document
 * - Adding/removing the blob in IndexedDB
 *
 * On undo: removes from uidesc AND deletes blob from IndexedDB
 * On redo: adds back to uidesc AND re-stores blob in IndexedDB
 *
 * @param data - The upload data containing bitmap name, definition, and IndexedDB record
 * @returns A history operation that can be undone/redone
 */
export function createUploadBitmapOperation(data: UploadBitmapData): HistoryOperation {
  const { bitmapName, bitmapDefinition, indexedDBBitmap } = data;
  let removedReferences: RemovedBitmapReference[] = [];

  return {
    type: 'add-bitmap',
    description: `Upload bitmap "${bitmapName}"`,
    timestamp: Date.now(),
    undo: () => {
      // Remove from uidesc document
      const result = storeDeleteBitmap(bitmapName);
      if (result) {
        removedReferences = result.removedReferences;
      }

      // Delete blob from IndexedDB
      bitmapService.delete(indexedDBBitmap.id).catch(err => {
        console.error('Failed to delete bitmap from IndexedDB during undo:', err);
      });

      // Invalidate thumbnail cache
      invalidateThumbnailCache(indexedDBBitmap.projectId, bitmapName);
    },
    redo: () => {
      // Add back to uidesc document
      storeAddBitmap(bitmapName, bitmapDefinition);

      // Restore view references
      for (const ref of removedReferences) {
        storeUpdateViewAttribute(ref.viewId, ref.attribute, ref.value);
      }

      // Re-store blob in IndexedDB
      bitmapService.add(indexedDBBitmap).catch(err => {
        console.error('Failed to re-add bitmap to IndexedDB during redo:', err);
      });

      // Invalidate thumbnail cache (so it gets re-fetched)
      invalidateThumbnailCache(indexedDBBitmap.projectId, bitmapName);
    },
  };
}

/**
 * Data needed to undo/redo updating an existing bitmap with a new upload.
 */
export interface UpdateBitmapUploadData {
  /** Original bitmap name before any rename */
  originalName: string;
  /** Final bitmap name after rename (same as originalName if no rename) */
  finalName: string;
  /** Original path before upload */
  originalPath: string;
  /** New path after upload */
  newPath: string;
  /** The IndexedDB bitmap record to store/delete */
  indexedDBBitmap: Bitmap;
  /** Project ID for cache invalidation */
  projectId: string;
}

/**
 * Creates a history operation for updating an existing bitmap with an uploaded file.
 *
 * This handles:
 * - Renaming the bitmap (if it had a default "New Bitmap" name)
 * - Updating the path property
 * - Managing the IndexedDB blob
 *
 * On undo: reverts name, reverts path, deletes blob from IndexedDB
 * On redo: re-applies name, re-applies path, re-stores blob in IndexedDB
 */
export function createUpdateBitmapUploadOperation(data: UpdateBitmapUploadData): HistoryOperation {
  const { originalName, finalName, originalPath, newPath, indexedDBBitmap, projectId } = data;
  const wasRenamed = originalName !== finalName;

  return {
    type: 'edit-bitmap-property',
    description: wasRenamed
      ? `Upload and rename bitmap "${originalName}" to "${finalName}"`
      : `Upload to bitmap "${finalName}"`,
    timestamp: Date.now(),
    undo: () => {
      // Delete blob from IndexedDB first
      bitmapService.delete(indexedDBBitmap.id).catch(err => {
        console.error('Failed to delete bitmap from IndexedDB during undo:', err);
      });

      // Revert path
      storeUpdateBitmapProperty(finalName, 'path', originalPath);

      // Revert name if it was renamed
      if (wasRenamed) {
        storeUpdateBitmapName(finalName, originalName);
      }

      // Invalidate thumbnail cache
      invalidateThumbnailCache(projectId, wasRenamed ? originalName : finalName);
    },
    redo: () => {
      // Re-apply name if it was renamed
      if (wasRenamed) {
        storeUpdateBitmapName(originalName, finalName);
      }

      // Re-apply path
      storeUpdateBitmapProperty(finalName, 'path', newPath);

      // Re-store blob in IndexedDB
      bitmapService.add(indexedDBBitmap).catch(err => {
        console.error('Failed to re-add bitmap to IndexedDB during redo:', err);
      });

      // Invalidate thumbnail cache
      invalidateThumbnailCache(projectId, finalName);
    },
  };
}

/**
 * Data needed to undo/redo a bitmap type change operation.
 */
export interface BitmapTypeChangeData {
  /** The bitmap name */
  bitmapName: string;
  /** The type being switched from */
  fromType: BitmapType;
  /** The type being switched to */
  toType: BitmapType;
  /** Properties that were cleared, with their original values */
  clearedProperties: Record<string, string>;
}

/**
 * Creates a history operation for changing a bitmap's type.
 *
 * When switching between types (standard, ninepart, multiframe), the exclusive
 * properties of the old type are cleared. This operation captures those values
 * so they can be restored on undo.
 *
 * @param data - The type change data
 * @returns A history operation that can be undone/redone
 */
export function createBitmapTypeChangeOperation(data: BitmapTypeChangeData): HistoryOperation {
  const { bitmapName, fromType, toType, clearedProperties } = data;

  return {
    type: 'change-bitmap-type',
    description: `Change bitmap "${bitmapName}" from ${fromType} to ${toType}`,
    timestamp: Date.now(),
    undo: () => {
      // First clear the new type's properties (if any were set)
      for (const prop of BITMAP_TYPE_PROPERTIES[toType]) {
        storeUpdateBitmapProperty(bitmapName, prop, '');
      }
      // Restore all properties that were cleared
      for (const [prop, value] of Object.entries(clearedProperties)) {
        storeUpdateBitmapProperty(bitmapName, prop, value);
      }
    },
    redo: () => {
      // Clear the old type's properties again
      for (const prop of Object.keys(clearedProperties)) {
        storeUpdateBitmapProperty(bitmapName, prop, '');
      }
    },
  };
}

/**
 * Gets the properties that should be cleared when switching from one bitmap type to another.
 *
 * @param fromType - The current bitmap type
 * @param toType - The target bitmap type
 * @returns Array of property names to clear
 */
export function getPropertiesToClearForTypeChange(
  fromType: BitmapType,
  toType: BitmapType
): string[] {
  if (fromType === toType) return [];
  return BITMAP_TYPE_PROPERTIES[fromType];
}
