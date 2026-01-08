import {
  addColor,
  deleteColor,
  type RemovedColorReference,
  updateColorName,
  updateColorValue,
  updateViewAttribute,
} from '../../stores/documentStore';
import type { HistoryOperation } from '../../types/history';

export function createAddColorOperation(name: string, value: string): HistoryOperation {
  let removedReferences: RemovedColorReference[] = [];
  return {
    type: 'add-color',
    description: `Add color "${name}"`,
    timestamp: Date.now(),
    undo: () => {
      const result = deleteColor(name);
      if (result) {
        removedReferences = result.removedReferences;
      }
    },
    redo: () => {
      addColor(name, value);
      for (const ref of removedReferences) {
        updateViewAttribute(ref.viewId, ref.attribute, ref.value);
      }
    },
  };
}

export function createEditColorNameOperation(oldName: string, newName: string): HistoryOperation {
  return {
    type: 'edit-color-name',
    description: `Rename color "${oldName}" to "${newName}"`,
    timestamp: Date.now(),
    undo: () => updateColorName(newName, oldName),
    redo: () => updateColorName(oldName, newName),
  };
}

export function createEditColorValueOperation(
  name: string,
  oldValue: string,
  newValue: string
): HistoryOperation {
  return {
    type: 'edit-color-value',
    description: `Change color "${name}"`,
    timestamp: Date.now(),
    undo: () => updateColorValue(name, oldValue),
    redo: () => updateColorValue(name, newValue),
  };
}

export function createDeleteColorOperation(
  name: string,
  value: string,
  removedReferences: RemovedColorReference[] = []
): HistoryOperation {
  return {
    type: 'delete-color',
    description: `Delete color "${name}"`,
    timestamp: Date.now(),
    undo: () => {
      addColor(name, value);
      for (const ref of removedReferences) {
        updateViewAttribute(ref.viewId, ref.attribute, ref.value);
      }
    },
    redo: () => deleteColor(name),
  };
}
