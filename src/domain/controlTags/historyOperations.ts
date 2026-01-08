import type { HistoryOperation } from '../../types/history';

export interface RemovedControlTagReference {
  viewId: string;
  attribute: string;
  value: string;
}

interface ControlTagStoreFunctions {
  addControlTag: (name: string, tagId: string) => boolean;
  deleteControlTag: (
    name: string
  ) => { tagId: string; removedReferences: RemovedControlTagReference[] } | null;
  updateControlTagName: (oldName: string, newName: string) => boolean;
  updateControlTagId: (name: string, newTagId: string) => string | null;
  restoreControlTagReference: (viewId: string, value: string) => boolean;
}

let storeFns: ControlTagStoreFunctions | null = null;

export function initControlTagHistoryOperations(fns: ControlTagStoreFunctions): void {
  storeFns = fns;
}

export function createAddControlTagOperation(name: string, tagId: string): HistoryOperation {
  let removedReferences: RemovedControlTagReference[] = [];

  return {
    type: 'add-control-tag',
    description: `Add control tag "${name}"`,
    timestamp: Date.now(),
    undo: () => {
      if (!storeFns) return;
      const result = storeFns.deleteControlTag(name);
      if (result) {
        removedReferences = result.removedReferences;
      }
    },
    redo: () => {
      if (!storeFns) return;
      storeFns.addControlTag(name, tagId);
      for (const ref of removedReferences) {
        storeFns.restoreControlTagReference(ref.viewId, ref.value);
      }
    },
  };
}

export function createEditControlTagNameOperation(
  oldName: string,
  newName: string
): HistoryOperation {
  return {
    type: 'edit-control-tag-name',
    description: `Rename control tag "${oldName}" to "${newName}"`,
    timestamp: Date.now(),
    undo: () => {
      if (!storeFns) return;
      storeFns.updateControlTagName(newName, oldName);
    },
    redo: () => {
      if (!storeFns) return;
      storeFns.updateControlTagName(oldName, newName);
    },
  };
}

export function createEditControlTagIdOperation(
  name: string,
  oldTagId: string,
  newTagId: string
): HistoryOperation {
  return {
    type: 'edit-control-tag-id',
    description: `Change control tag "${name}" ID`,
    timestamp: Date.now(),
    undo: () => {
      if (!storeFns) return;
      storeFns.updateControlTagId(name, oldTagId);
    },
    redo: () => {
      if (!storeFns) return;
      storeFns.updateControlTagId(name, newTagId);
    },
  };
}

export function createDeleteControlTagOperation(
  name: string,
  tagId: string,
  removedReferences: RemovedControlTagReference[] = []
): HistoryOperation {
  return {
    type: 'delete-control-tag',
    description: `Delete control tag "${name}"`,
    timestamp: Date.now(),
    undo: () => {
      if (!storeFns) return;
      storeFns.addControlTag(name, tagId);
      for (const ref of removedReferences) {
        storeFns.restoreControlTagReference(ref.viewId, ref.value);
      }
    },
    redo: () => {
      if (!storeFns) return;
      storeFns.deleteControlTag(name);
    },
  };
}
