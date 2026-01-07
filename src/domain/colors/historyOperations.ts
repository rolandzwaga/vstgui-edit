import type { HistoryOperation } from '../../types/history';
import {
  addColor,
  deleteColor,
  updateColorName,
  updateColorValue,
} from '../../stores/documentStore';

export function createAddColorOperation(name: string, value: string): HistoryOperation {
  return {
    type: 'add-color',
    description: `Add color "${name}"`,
    timestamp: Date.now(),
    undo: () => deleteColor(name),
    redo: () => addColor(name, value),
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

export function createDeleteColorOperation(name: string, value: string): HistoryOperation {
  return {
    type: 'delete-color',
    description: `Delete color "${name}"`,
    timestamp: Date.now(),
    undo: () => addColor(name, value),
    redo: () => deleteColor(name),
  };
}
