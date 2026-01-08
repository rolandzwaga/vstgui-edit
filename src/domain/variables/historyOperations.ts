import type { HistoryOperation } from '../../types/history';

export interface RemovedVariableReference {
  viewId: string;
  attribute: string;
  value: string;
}

interface VariableStoreFunctions {
  addVariable: (name: string, value: string) => boolean;
  deleteVariable: (
    name: string
  ) => { value: string; removedReferences: RemovedVariableReference[] } | null;
  updateVariableName: (oldName: string, newName: string) => boolean;
  updateVariableValue: (name: string, newValue: string) => string | null;
  restoreVariableReference: (viewId: string, attribute: string, value: string) => boolean;
}

let storeFns: VariableStoreFunctions | null = null;

export function initVariableHistoryOperations(fns: VariableStoreFunctions): void {
  storeFns = fns;
}

export function createAddVariableOperation(name: string, value: string): HistoryOperation {
  let removedReferences: RemovedVariableReference[] = [];

  return {
    type: 'add-variable',
    description: `Add variable "${name}"`,
    timestamp: Date.now(),
    undo: () => {
      if (!storeFns) return;
      const result = storeFns.deleteVariable(name);
      if (result) {
        removedReferences = result.removedReferences;
      }
    },
    redo: () => {
      if (!storeFns) return;
      storeFns.addVariable(name, value);
      for (const ref of removedReferences) {
        storeFns.restoreVariableReference(ref.viewId, ref.attribute, ref.value);
      }
    },
  };
}

export function createEditVariableNameOperation(
  oldName: string,
  newName: string
): HistoryOperation {
  return {
    type: 'edit-variable-name',
    description: `Rename variable "${oldName}" to "${newName}"`,
    timestamp: Date.now(),
    undo: () => {
      if (!storeFns) return;
      storeFns.updateVariableName(newName, oldName);
    },
    redo: () => {
      if (!storeFns) return;
      storeFns.updateVariableName(oldName, newName);
    },
  };
}

export function createEditVariableValueOperation(
  name: string,
  oldValue: string,
  newValue: string
): HistoryOperation {
  return {
    type: 'edit-variable-value',
    description: `Change variable "${name}" value`,
    timestamp: Date.now(),
    undo: () => {
      if (!storeFns) return;
      storeFns.updateVariableValue(name, oldValue);
    },
    redo: () => {
      if (!storeFns) return;
      storeFns.updateVariableValue(name, newValue);
    },
  };
}

export function createDeleteVariableOperation(
  name: string,
  value: string,
  removedReferences: RemovedVariableReference[] = []
): HistoryOperation {
  return {
    type: 'delete-variable',
    description: `Delete variable "${name}"`,
    timestamp: Date.now(),
    undo: () => {
      if (!storeFns) return;
      storeFns.addVariable(name, value);
      for (const ref of removedReferences) {
        storeFns.restoreVariableReference(ref.viewId, ref.attribute, ref.value);
      }
    },
    redo: () => {
      if (!storeFns) return;
      storeFns.deleteVariable(name);
    },
  };
}
