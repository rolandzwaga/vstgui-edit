import type { HistoryOperation } from '../../types/history';
import type { BitmapDefinition } from '../../types/uidesc';

export interface RemovedBitmapReference {
  viewId: string;
  attribute: string;
  value: string;
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
  removedReferences: RemovedBitmapReference[] = []
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
    },
    redo: () => storeDeleteBitmap(name),
  };
}
