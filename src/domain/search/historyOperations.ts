/**
 * History Operations for Find/Replace
 * Creates undoable/redoable operations for replace actions.
 */

import { markDirty, updateViewAttribute } from '../../stores/documentStore';
import type { HistoryOperation } from '../../types/history';
import type { ReplaceChange } from '../../types/search';

/**
 * Create a history operation for a single replace.
 *
 * @param change - The replacement change
 * @returns HistoryOperation for undo/redo
 */
export function createReplaceOperation(change: ReplaceChange): HistoryOperation {
  return {
    type: 'property-change',
    description: `Replace ${change.attributeName}`,
    timestamp: Date.now(),
    undo: () => {
      updateViewAttribute(change.viewId, change.attributeName, change.oldValue);
    },
    redo: () => {
      updateViewAttribute(change.viewId, change.attributeName, change.newValue);
      markDirty();
    },
  };
}

/**
 * Create a history operation for replace all.
 *
 * @param changes - Array of replacement changes
 * @param attributeName - Attribute being replaced
 * @returns HistoryOperation for undo/redo
 */
export function createReplaceAllOperation(
  changes: ReplaceChange[],
  attributeName: string
): HistoryOperation {
  return {
    type: 'property-change',
    description: `Replace all ${attributeName} (${changes.length} views)`,
    timestamp: Date.now(),
    undo: () => {
      for (const change of changes) {
        updateViewAttribute(change.viewId, change.attributeName, change.oldValue);
      }
    },
    redo: () => {
      for (const change of changes) {
        updateViewAttribute(change.viewId, change.attributeName, change.newValue);
      }
      markDirty();
    },
  };
}
