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
import { clearSelection, select, selectAll, selectionStore } from '../../stores/selectionStore';
import type { Point, RenderableView } from '../../types/canvas';
import type { HistoryOperation } from '../../types/history';
import type { ViewNode } from '../../types/uidesc';
import type { SerializedView } from '../../types/views';
import {
  applyOffsetToSerialized,
  collectOriginsFromSerialized,
  deserializeView,
  extractOrigin,
  serializeView,
} from '../views/serialization';
import { isContainerClass } from '../views/viewClasses';
import { getDefaultSize } from '../views/viewDefaults';

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

export interface PasteOptions {
  pointerPosition?: Point;
  templateBounds?: { width: number; height: number };
}

export function pasteViews(options: PasteOptions = {}): string[] {
  const clipboardContent = getClipboardContent();

  if (!clipboardContent || clipboardContent.views.length === 0) {
    return [];
  }

  const pastedIds: string[] = [];
  const targetParentId = determinePasteTarget(clipboardContent.views[0].originalId);

  const usePointerPosition = shouldUsePointerPosition(options);

  if (usePointerPosition && options.pointerPosition) {
    const viewsWithPositions = calculatePointerPastePositions(
      clipboardContent.views,
      options.pointerPosition
    );

    for (const { serializedView, position } of viewsWithPositions) {
      const positionedView = applyAbsolutePosition(serializedView, position);
      const viewNode = deserializeView(positionedView);

      if (targetParentId) {
        const newId = addView(targetParentId, viewNode);
        if (newId) {
          pastedIds.push(newId);
        }
      }
    }
  } else {
    const offset = (clipboardContent.pasteCount + 1) * PASTE_OFFSET;

    for (const serializedView of clipboardContent.views) {
      const offsetView = applyOffsetToSerialized(serializedView, { x: offset, y: offset });
      const viewNode = deserializeView(offsetView);

      if (targetParentId) {
        const newId = addView(targetParentId, viewNode);
        if (newId) {
          pastedIds.push(newId);
        }
      }
    }
  }

  if (pastedIds.length > 0) {
    incrementPasteCount();
    selectAll(pastedIds);
  }

  return pastedIds;
}

function shouldUsePointerPosition(options: PasteOptions): boolean {
  const { pointerPosition, templateBounds } = options;

  if (!pointerPosition || !templateBounds) {
    return false;
  }

  return (
    pointerPosition.x >= 0 &&
    pointerPosition.x <= templateBounds.width &&
    pointerPosition.y >= 0 &&
    pointerPosition.y <= templateBounds.height
  );
}

function calculatePointerPastePositions(
  views: SerializedView[],
  pointerPosition: Point
): Array<{ serializedView: SerializedView; position: Point }> {
  const origins = views.map(v => extractOrigin(v));
  const sizes = views.map(v => extractSize(v));

  let minX = Number.POSITIVE_INFINITY;
  let minY = Number.POSITIVE_INFINITY;
  let maxX = Number.NEGATIVE_INFINITY;
  let maxY = Number.NEGATIVE_INFINITY;

  for (let i = 0; i < views.length; i++) {
    minX = Math.min(minX, origins[i].x);
    minY = Math.min(minY, origins[i].y);
    maxX = Math.max(maxX, origins[i].x + sizes[i].width);
    maxY = Math.max(maxY, origins[i].y + sizes[i].height);
  }

  const groupWidth = maxX - minX;
  const groupHeight = maxY - minY;

  const groupCenterX = minX + groupWidth / 2;
  const groupCenterY = minY + groupHeight / 2;

  const offsetX = pointerPosition.x - groupCenterX;
  const offsetY = pointerPosition.y - groupCenterY;

  return views.map((serializedView, i) => ({
    serializedView,
    position: {
      x: Math.round(origins[i].x + offsetX),
      y: Math.round(origins[i].y + offsetY),
    },
  }));
}

function extractSize(serialized: SerializedView): { width: number; height: number } {
  const size = serialized.attributes.size ?? '100, 100';
  const parts = size.split(',').map(s => s.trim());
  const width = Number.parseInt(parts[0], 10) || 100;
  const height = Number.parseInt(parts[1], 10) || 100;
  return { width, height };
}

function applyAbsolutePosition(serialized: SerializedView, position: Point): SerializedView {
  return {
    ...serialized,
    attributes: {
      ...serialized.attributes,
      origin: `${position.x}, ${position.y}`,
    },
    children: serialized.children,
  };
}

function determinePasteTarget(originalViewId: string): string | null {
  const selectedIds = Array.from(selectionStore.selectedIds);

  if (selectedIds.length === 1) {
    const selectedId = selectedIds[0];
    const selectedView = getView(selectedId);

    if (selectedView && isContainerClass(selectedView.attributes.class || '')) {
      return selectedId;
    }
  }

  return extractParentId(originalViewId);
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

export function findContainerAtPoint(
  views: RenderableView[],
  point: Point,
  excludeIds: Set<string> = new Set()
): RenderableView | null {
  const containers = views.filter(v => isContainerClass(v.className) && !excludeIds.has(v.id));

  containers.sort((a, b) => b.zIndex - a.zIndex);

  for (const container of containers) {
    const inBounds =
      point.x >= container.absoluteX &&
      point.x <= container.absoluteX + container.width &&
      point.y >= container.absoluteY &&
      point.y <= container.absoluteY + container.height;

    if (inBounds) {
      return container;
    }
  }

  return null;
}

export interface CreateViewParams {
  className: string;
  parentId: string;
  position: Point;
}

export function createNewView(params: CreateViewParams): string | null {
  const { className, parentId, position } = params;
  const defaultSize = getDefaultSize(className);

  const viewNode: ViewNode = {
    attributes: {
      class: className,
      origin: `${Math.round(position.x)}, ${Math.round(position.y)}`,
      size: `${defaultSize.width}, ${defaultSize.height}`,
    },
  };

  if (isContainerClass(className)) {
    viewNode.children = {};
  }

  const newId = addView(parentId, viewNode);

  if (newId) {
    select(newId);
  }

  return newId;
}

export function createCreateOperation(createdViewId: string, className: string): HistoryOperation {
  return {
    type: 'create',
    description: `Create ${className}`,
    timestamp: Date.now(),
    undo: () => {
      removeView(createdViewId);
    },
    redo: () => {},
  };
}
