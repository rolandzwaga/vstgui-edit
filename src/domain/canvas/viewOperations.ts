import {
  duplicateView,
  type RemovedViewInfo,
  removeView,
  removeViews,
  restoreView,
} from '../../stores/documentStore';
import { clearSelection, selectAll, selectionStore } from '../../stores/selectionStore';
import type { HistoryOperation } from '../../types/history';

const DUPLICATE_OFFSET = 10;

export function deleteSelectedViews(): RemovedViewInfo[] {
  const selectedIds = Array.from(selectionStore.selectedIds);

  if (selectedIds.length === 0) {
    return [];
  }

  const removed = removeViews(selectedIds);
  clearSelection();

  return removed;
}

export function createDeleteOperation(removedViews: RemovedViewInfo[]): HistoryOperation {
  const count = removedViews.length;
  const description = `Delete ${count} view${count === 1 ? '' : 's'}`;

  return {
    type: 'delete',
    description,
    timestamp: Date.now(),
    undo: () => {
      for (const info of removedViews) {
        restoreView(info);
      }
    },
    redo: () => {
      for (const info of removedViews) {
        removeView(info.viewId);
      }
    },
  };
}

export function duplicateSelectedViews(): string[] {
  const selectedIds = Array.from(selectionStore.selectedIds);

  if (selectedIds.length === 0) {
    return [];
  }

  const duplicatedIds: string[] = [];
  const offset = { x: DUPLICATE_OFFSET, y: DUPLICATE_OFFSET };

  for (const viewId of selectedIds) {
    const newId = duplicateView(viewId, offset);
    if (newId) {
      duplicatedIds.push(newId);
    }
  }

  if (duplicatedIds.length > 0) {
    selectAll(duplicatedIds);
  }

  return duplicatedIds;
}

export function createDuplicateOperation(duplicatedViewIds: string[]): HistoryOperation {
  const count = duplicatedViewIds.length;
  const description = `Duplicate ${count} view${count === 1 ? '' : 's'}`;

  return {
    type: 'duplicate',
    description,
    timestamp: Date.now(),
    undo: () => {
      for (const viewId of duplicatedViewIds) {
        removeView(viewId);
      }
    },
    redo: () => {},
  };
}
