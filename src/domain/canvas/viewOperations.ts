import {
  type RemovedViewInfo,
  removeView,
  removeViews,
  restoreView,
} from '../../stores/documentStore';
import { clearSelection, selectionStore } from '../../stores/selectionStore';
import type { HistoryOperation } from '../../types/history';

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
