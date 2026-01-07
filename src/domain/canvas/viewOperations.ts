import {
  clipboardStore,
  copyToClipboard,
  getClipboardContent,
  incrementPasteCount,
} from '../../stores/clipboardStore';
import {
  addView,
  duplicateView,
  getView,
  type RemovedViewInfo,
  removeView,
  removeViews,
  restoreView,
} from '../../stores/documentStore';
import { clearSelection, selectAll, selectionStore } from '../../stores/selectionStore';
import type { HistoryOperation } from '../../types/history';
import type { SerializedView } from '../../types/views';
import {
  applyOffsetToSerialized,
  collectOriginsFromSerialized,
  deserializeView,
  serializeView,
} from '../views/serialization';

const DUPLICATE_OFFSET = 10;
const PASTE_OFFSET = 10;

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

export function copySelectedViews(): boolean {
  const selectedIds = Array.from(selectionStore.selectedIds);

  if (selectedIds.length === 0) {
    return false;
  }

  const serializedViews: SerializedView[] = [];

  for (const viewId of selectedIds) {
    const viewNode = getView(viewId);
    if (viewNode) {
      serializedViews.push(serializeView(viewId, viewNode));
    }
  }

  if (serializedViews.length === 0) {
    return false;
  }

  const sourceOrigins = collectOriginsFromSerialized(serializedViews);
  copyToClipboard(serializedViews, sourceOrigins);

  return true;
}

export function cutSelectedViews(): RemovedViewInfo[] {
  const copied = copySelectedViews();
  if (!copied) {
    return [];
  }

  return deleteSelectedViews();
}

export function pasteViews(): string[] {
  const clipboardContent = getClipboardContent();

  if (!clipboardContent || clipboardContent.views.length === 0) {
    return [];
  }

  const pastedIds: string[] = [];
  const offset = (clipboardContent.pasteCount + 1) * PASTE_OFFSET;

  for (const serializedView of clipboardContent.views) {
    const offsetView = applyOffsetToSerialized(serializedView, { x: offset, y: offset });
    const viewNode = deserializeView(offsetView);

    const parentId = extractParentId(serializedView.originalId);
    if (parentId) {
      const newId = addView(parentId, viewNode);
      if (newId) {
        pastedIds.push(newId);
      }
    }
  }

  if (pastedIds.length > 0) {
    incrementPasteCount();
    selectAll(pastedIds);
  }

  return pastedIds;
}

function extractParentId(viewId: string): string | null {
  const lastDash = viewId.lastIndexOf('-');
  if (lastDash === -1) {
    return null;
  }
  return viewId.substring(0, lastDash);
}

export function createPasteOperation(pastedViewIds: string[]): HistoryOperation {
  const count = pastedViewIds.length;
  const description = `Paste ${count} view${count === 1 ? '' : 's'}`;

  return {
    type: 'create',
    description,
    timestamp: Date.now(),
    undo: () => {
      for (const viewId of pastedViewIds) {
        removeView(viewId);
      }
    },
    redo: () => {},
  };
}

export function canPaste(): boolean {
  return clipboardStore.hasContent;
}
