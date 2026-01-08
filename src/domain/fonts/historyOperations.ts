import type { HistoryOperation } from '../../types/history';
import type { FontDefinition } from '../../types/uidesc';

export interface RemovedFontReference {
  viewId: string;
  attribute: string;
  value: string;
}

type AddFontFn = (name: string, font: FontDefinition) => void;
type DeleteFontFn = (name: string) => { removedReferences: RemovedFontReference[] } | null;
type UpdateFontNameFn = (oldName: string, newName: string) => boolean;
type UpdateFontPropertyFn = (
  name: string,
  prop: string,
  value: string
) => string | null | undefined;
type UpdateViewAttributeFn = (viewId: string, attribute: string, value: string) => void;

let storeAddFont: AddFontFn;
let storeDeleteFont: DeleteFontFn;
let storeUpdateFontName: UpdateFontNameFn;
let storeUpdateFontProperty: UpdateFontPropertyFn;
let storeUpdateViewAttribute: UpdateViewAttributeFn;

export function initFontHistoryOperations(
  addFont: AddFontFn,
  deleteFont: DeleteFontFn,
  updateFontName: UpdateFontNameFn,
  updateFontProperty: UpdateFontPropertyFn,
  updateViewAttribute: UpdateViewAttributeFn
): void {
  storeAddFont = addFont;
  storeDeleteFont = deleteFont;
  storeUpdateFontName = updateFontName;
  storeUpdateFontProperty = updateFontProperty;
  storeUpdateViewAttribute = updateViewAttribute;
}

export function createAddFontOperation(name: string, font: FontDefinition): HistoryOperation {
  let removedReferences: RemovedFontReference[] = [];
  return {
    type: 'add-font',
    description: `Add font "${name}"`,
    timestamp: Date.now(),
    undo: () => {
      const result = storeDeleteFont(name);
      if (result) {
        removedReferences = result.removedReferences;
      }
    },
    redo: () => {
      storeAddFont(name, font);
      for (const ref of removedReferences) {
        storeUpdateViewAttribute(ref.viewId, ref.attribute, ref.value);
      }
    },
  };
}

export function createEditFontNameOperation(oldName: string, newName: string): HistoryOperation {
  return {
    type: 'edit-font-name',
    description: `Rename font "${oldName}" to "${newName}"`,
    timestamp: Date.now(),
    undo: () => storeUpdateFontName(newName, oldName),
    redo: () => storeUpdateFontName(oldName, newName),
  };
}

export function createEditFontPropertyOperation(
  name: string,
  prop: string,
  oldValue: string,
  newValue: string
): HistoryOperation {
  return {
    type: 'edit-font-property',
    description: `Change ${prop} of font "${name}"`,
    timestamp: Date.now(),
    undo: () => storeUpdateFontProperty(name, prop, oldValue),
    redo: () => storeUpdateFontProperty(name, prop, newValue),
  };
}

export function createDeleteFontOperation(
  name: string,
  font: FontDefinition,
  removedReferences: RemovedFontReference[] = []
): HistoryOperation {
  return {
    type: 'delete-font',
    description: `Delete font "${name}"`,
    timestamp: Date.now(),
    undo: () => {
      storeAddFont(name, font);
      for (const ref of removedReferences) {
        storeUpdateViewAttribute(ref.viewId, ref.attribute, ref.value);
      }
    },
    redo: () => storeDeleteFont(name),
  };
}
