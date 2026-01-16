import { type Accessor, createEffect, createSignal, onCleanup } from 'solid-js';
import { findIntersectingViews, isMinimumSize, normalizeRect } from '../../domain/canvas/marquee';
import { mouseToCanvas } from '../../domain/canvas/mouseToCanvas';
import { applyDeltaToAll, createMoveOperation } from '../../domain/canvas/move';
import { createResizeOperation } from '../../domain/canvas/resize';
import { calculateSmartGuides, getViewBounds } from '../../domain/canvas/smartGuides';
import { getEffectiveThreshold } from '../../domain/canvas/snap';
import {
  applySnapToMoveWithGuides,
  applySnapToResizeWithGuides,
} from '../../domain/guides/guideSnap';
import { filterUnlockedViews } from '../../domain/lockHide/lockOperations';
import { canvasStore } from '../../stores/canvasStore';
import { showContextMenu } from '../../stores/contextMenuStore';
import { isRoot, updateViewOrigin, updateViewSize } from '../../stores/documentStore';
import { dragStore, resetDrag, startDrag, updateDrag } from '../../stores/dragStore';
import { gridStore } from '../../stores/gridStore';
import { guidesStore } from '../../stores/guidesStore';
import { pushOperation } from '../../stores/historyStore';
import { isLocked } from '../../stores/lockHideStore';
import {
  activateMarquee,
  beginTracking,
  cancelMarquee,
  completeMarquee,
  marqueeStore,
  updateMarquee,
} from '../../stores/marqueeStore';
import {
  endResize,
  resetResize,
  resizeStore,
  startResize,
  updateResize,
  updateResizePreview,
} from '../../stores/resizeStore';
import {
  clearSelection,
  isSelected,
  select,
  selectAll,
  selectionStore,
  toggleSelect,
} from '../../stores/selectionStore';
import {
  clearActiveGuides,
  setActiveGuides,
  smartGuidesStore,
} from '../../stores/smartGuidesStore';
import type { RenderableView } from '../../types/canvas';
import { CLICK_TOLERANCE } from '../../types/history';
import type { HandlePosition } from '../../types/selection';
import type { CancelCallbacks } from './useCanvasKeyboard';

export interface UseCanvasInteractionsOptions {
  renderableViews: Accessor<RenderableView[]>;
  visibleViews?: Accessor<RenderableView[]>;
}

export interface UseCanvasInteractionsResult {
  wrapperRef: (el: HTMLDivElement) => void;
  handleSvgMouseDown: (e: MouseEvent) => void;
  handleResizeStart: (handle: HandlePosition, view: RenderableView) => void;
  handleContextMenu: (e: MouseEvent) => void;
  cancelCallbacks: CancelCallbacks;
}

export function useCanvasInteractions(
  options: UseCanvasInteractionsOptions
): UseCanvasInteractionsResult {
  const { renderableViews, visibleViews } = options;

  // Use visibleViews for selection operations, fall back to renderableViews if not provided
  const selectableViews = visibleViews ?? renderableViews;

  let wrapperRefValue: HTMLDivElement | undefined;
  const wrapperRef = (el: HTMLDivElement) => {
    wrapperRefValue = el;
  };

  const handleGlobalMouseDown = (e: MouseEvent) => {
    if (!wrapperRefValue) return;
    if (wrapperRefValue.contains(e.target as Node)) return;

    const target = e.target as Element;
    if (target.closest('[data-testid="properties-panel"]')) return;
    if (target.closest('[data-testid="hierarchy-panel"]')) return;
    if (target.closest('[data-testid="context-menu"]')) return;
    if (target.closest('[data-testid="alignment-toolbar"]')) return;
    // Ignore clicks inside Portal-rendered dropdowns (ColorPicker, EnumEditor, etc.)
    if (target.closest('[data-floating-dropdown]')) return;

    if (selectionStore.selectedIds.size > 0) {
      clearSelection();
    }
  };

  document.addEventListener('mousedown', handleGlobalMouseDown);

  const [pendingDragStart, setPendingDragStart] = createSignal<{ x: number; y: number } | null>(
    null
  );
  const [, setPendingDragViewId] = createSignal<string | null>(null);

  const getHandlePosition = (
    handle: HandlePosition,
    view: RenderableView
  ): { x: number; y: number } => {
    const { absoluteX: x, absoluteY: y, width: w, height: h } = view;
    switch (handle) {
      case 'nw':
        return { x, y };
      case 'n':
        return { x: x + w / 2, y };
      case 'ne':
        return { x: x + w, y };
      case 'w':
        return { x, y: y + h / 2 };
      case 'e':
        return { x: x + w, y: y + h / 2 };
      case 'sw':
        return { x, y: y + h };
      case 's':
        return { x: x + w / 2, y: y + h };
      case 'se':
        return { x: x + w, y: y + h };
    }
  };

  const handleResizeMove = (e: MouseEvent) => {
    if (!resizeStore.isResizing || !wrapperRefValue) return;

    const wrapperRect = wrapperRefValue.getBoundingClientRect();
    const canvasPoint = mouseToCanvas(
      e.clientX,
      e.clientY,
      wrapperRect,
      canvasStore.panOffset,
      canvasStore.zoomLevel
    );

    updateResize(canvasPoint, e.shiftKey, e.altKey);

    // Apply snapping for preview if enabled (Alt disables snap, Shift disables for aspect ratio lock)
    const gridSnapEnabled =
      gridStore.isSnapEnabled && gridStore.isVisible && !e.altKey && !e.shiftKey;
    const guideSnapEnabled = guidesStore.isSnapEnabled && !e.altKey && !e.shiftKey;

    if (gridSnapEnabled || guideSnapEnabled) {
      const handle = resizeStore.activeHandle;
      if (handle) {
        const threshold = getEffectiveThreshold(gridStore.snapThreshold, gridStore.size);
        const snapResult = applySnapToResizeWithGuides(
          resizeStore.newOrigin,
          resizeStore.newSize,
          handle,
          gridStore.size,
          guidesStore.guides,
          threshold,
          gridSnapEnabled,
          guideSnapEnabled
        );
        updateResizePreview(snapResult.origin, snapResult.size);
      }
    }
  };

  const handleResizeUp = (e: MouseEvent) => {
    document.removeEventListener('mousemove', handleResizeMove);
    document.removeEventListener('mouseup', handleResizeUp);

    if (resizeStore.isResizing && resizeStore.viewId) {
      const viewId = resizeStore.viewId;
      const originalOrigin = resizeStore.originalOrigin;
      const originalSize = resizeStore.originalSize;
      let newOrigin = resizeStore.newOrigin;
      let newSize = resizeStore.newSize;
      const handle = resizeStore.activeHandle;

      if (originalOrigin && originalSize && handle) {
        // Disable snap when Shift is held (aspect ratio lock)
        const gridSnapEnabled =
          gridStore.isSnapEnabled && gridStore.isVisible && !e.altKey && !e.shiftKey;
        const guideSnapEnabled = guidesStore.isSnapEnabled && !e.altKey && !e.shiftKey;

        if (gridSnapEnabled || guideSnapEnabled) {
          const threshold = getEffectiveThreshold(gridStore.snapThreshold, gridStore.size);
          const snapResult = applySnapToResizeWithGuides(
            newOrigin,
            newSize,
            handle,
            gridStore.size,
            guidesStore.guides,
            threshold,
            gridSnapEnabled,
            guideSnapEnabled
          );
          newOrigin = snapResult.origin;
          newSize = snapResult.size;
        }

        const sizeChanged =
          newSize.width !== originalSize.width || newSize.height !== originalSize.height;
        const originChanged = newOrigin.x !== originalOrigin.x || newOrigin.y !== originalOrigin.y;

        if (sizeChanged || originChanged) {
          updateViewOrigin(viewId, newOrigin);
          updateViewSize(viewId, newSize);

          const operation = createResizeOperation(
            { viewId, originalOrigin, originalSize, newOrigin, newSize },
            updateViewOrigin,
            updateViewSize
          );
          pushOperation(operation);
        }
      }
    }

    endResize();
    resetResize();
  };

  const handleResizeStart = (handle: HandlePosition, view: RenderableView) => {
    // Block resize on locked views
    if (isLocked(view.id)) {
      return;
    }

    const point = getHandlePosition(handle, view);
    const origin = { x: view.relativeX, y: view.relativeY };
    const size = { width: view.width, height: view.height };
    // Calculate parent offset for absolute positioning of resize preview
    const parentOffsetValue = {
      x: view.absoluteX - view.relativeX,
      y: view.absoluteY - view.relativeY,
    };

    startResize(handle, view.id, point, origin, size, parentOffsetValue);

    document.addEventListener('mousemove', handleResizeMove);
    document.addEventListener('mouseup', handleResizeUp);
  };

  const getViewIdFromTarget = (target: EventTarget | null): string | null => {
    let element = target as Element | null;
    while (element && element !== document.documentElement) {
      const viewId = element.getAttribute?.('data-view-id');
      if (viewId) {
        return viewId;
      }
      element = element.parentElement;
    }
    return null;
  };

  const captureOriginsForSelectedViews = (): Record<string, { x: number; y: number }> => {
    const views = renderableViews();
    const selectedIds = selectionStore.selectedIds;
    const origins: Record<string, { x: number; y: number }> = {};

    // Filter out locked views and root container from drag operation
    const unlockedIds = filterUnlockedViews(Array.from(selectedIds), isLocked);
    const movableIds = unlockedIds.filter(id => !isRoot(id));
    const movableIdSet = new Set(movableIds);

    for (const view of views) {
      if (movableIdSet.has(view.id)) {
        origins[view.id] = { x: view.relativeX, y: view.relativeY };
      }
    }

    return origins;
  };

  const handleDragMove = (e: MouseEvent) => {
    if (!wrapperRefValue) return;
    const start = pendingDragStart();

    if (!start) return;

    if (!dragStore.isDragging) {
      const dx = Math.abs(e.clientX - start.x);
      const dy = Math.abs(e.clientY - start.y);
      const distance = Math.max(dx, dy);

      if (distance >= CLICK_TOLERANCE) {
        const wrapperRect = wrapperRefValue.getBoundingClientRect();
        const canvasStart = mouseToCanvas(
          start.x,
          start.y,
          wrapperRect,
          canvasStore.panOffset,
          canvasStore.zoomLevel
        );

        const origins = captureOriginsForSelectedViews();
        startDrag(canvasStart, origins);
      } else {
        return;
      }
    }

    const wrapperRect = wrapperRefValue.getBoundingClientRect();
    const canvasPoint = mouseToCanvas(
      e.clientX,
      e.clientY,
      wrapperRect,
      canvasStore.panOffset,
      canvasStore.zoomLevel
    );

    updateDrag(canvasPoint, e.shiftKey);

    if (smartGuidesStore.isEnabled && dragStore.isDragging) {
      const delta = dragStore.delta;
      const selectedIds = selectionStore.selectedIds;
      const views = renderableViews();
      const anchorId = Object.keys(dragStore.originalOrigins)[0];

      if (anchorId) {
        const anchorView = views.find(v => v.id === anchorId);
        if (anchorView) {
          const draggedBounds = getViewBounds({
            ...anchorView,
            absoluteX: anchorView.absoluteX + delta.x,
            absoluteY: anchorView.absoluteY + delta.y,
          });

          const siblings = views.filter(v => !selectedIds.has(v.id)).map(getViewBounds);

          const parentView = anchorView.parentId
            ? views.find(v => v.id === anchorView.parentId)
            : undefined;
          const parentBounds = parentView ? getViewBounds(parentView) : undefined;

          const guides = calculateSmartGuides(draggedBounds, siblings, parentBounds);
          setActiveGuides(guides);
        }
      }
    }
  };

  const handleDragUp = (e: MouseEvent) => {
    document.removeEventListener('mousemove', handleDragMove);
    document.removeEventListener('mouseup', handleDragUp);

    if (dragStore.isDragging) {
      const delta = dragStore.delta;
      const origins = dragStore.originalOrigins;
      const viewIds = Object.keys(origins);
      let newOrigins = applyDeltaToAll(origins, delta);

      const gridSnapEnabled = gridStore.isSnapEnabled && gridStore.isVisible && !e.altKey;
      const guideSnapEnabled = guidesStore.isSnapEnabled && !e.altKey;

      if (gridSnapEnabled || guideSnapEnabled) {
        const anchorId = viewIds[0];
        if (anchorId) {
          const threshold = getEffectiveThreshold(gridStore.snapThreshold, gridStore.size);
          const snapResult = applySnapToMoveWithGuides(
            newOrigins,
            anchorId,
            gridStore.size,
            guidesStore.guides,
            threshold,
            gridSnapEnabled,
            guideSnapEnabled
          );
          newOrigins = snapResult.snappedOrigins;
        }
      }

      for (const [viewId, newOrigin] of Object.entries(newOrigins)) {
        updateViewOrigin(viewId, newOrigin);
      }

      const operation = createMoveOperation(
        { viewIds, originalOrigins: origins, newOrigins },
        updateViewOrigin
      );
      pushOperation(operation);
    } else {
      clearSelection();
    }

    setPendingDragStart(null);
    setPendingDragViewId(null);
    resetDrag();
    clearActiveGuides();
  };

  const handleMarqueeMove = (e: MouseEvent) => {
    if (!wrapperRefValue) return;
    const wrapperRect = wrapperRefValue.getBoundingClientRect();
    const canvasPoint = mouseToCanvas(
      e.clientX,
      e.clientY,
      wrapperRect,
      canvasStore.panOffset,
      canvasStore.zoomLevel
    );

    updateMarquee(canvasPoint);

    if (marqueeStore.isPending && !marqueeStore.isActive) {
      const start = marqueeStore.startPoint;
      if (start && isMinimumSize(start, canvasPoint)) {
        activateMarquee();
      }
    }
  };

  const handleMarqueeUp = () => {
    document.removeEventListener('mousemove', handleMarqueeMove);
    document.removeEventListener('mouseup', handleMarqueeUp);

    const start = marqueeStore.startPoint;
    const current = marqueeStore.currentPoint;

    if (!start || !current) {
      cancelMarquee();
      return;
    }

    if (!marqueeStore.isActive) {
      const targetViewId = marqueeStore.clickTarget;
      if (targetViewId) {
        if (marqueeStore.isAdditive) {
          toggleSelect(targetViewId);
        } else if (isSelected(targetViewId)) {
          clearSelection();
        } else {
          select(targetViewId);
        }
      } else {
        clearSelection();
      }
      completeMarquee();
      return;
    }

    const marqueeRect = normalizeRect(start, current);
    const views = selectableViews();
    const intersectingIds = findIntersectingViews(marqueeRect, views);

    if (marqueeStore.isAdditive) {
      const merged = new Set([...marqueeStore.previousSelection, ...intersectingIds]);
      selectAll([...merged]);
    } else {
      selectAll(intersectingIds);
    }

    completeMarquee();
  };

  const handleSvgMouseDown = (e: MouseEvent) => {
    if (e.button !== 0 || e.ctrlKey || canvasStore.isPanning) {
      return;
    }

    if (!wrapperRefValue) return;
    const wrapperRect = wrapperRefValue.getBoundingClientRect();
    const canvasPoint = mouseToCanvas(
      e.clientX,
      e.clientY,
      wrapperRect,
      canvasStore.panOffset,
      canvasStore.zoomLevel
    );

    const targetViewId = getViewIdFromTarget(e.target);

    if (targetViewId && isSelected(targetViewId) && !e.shiftKey) {
      setPendingDragStart({ x: e.clientX, y: e.clientY });
      setPendingDragViewId(targetViewId);

      document.addEventListener('mousemove', handleDragMove);
      document.addEventListener('mouseup', handleDragUp);
      return;
    }

    beginTracking(canvasPoint, e.shiftKey, selectionStore.selectedIds, targetViewId);

    document.addEventListener('mousemove', handleMarqueeMove);
    document.addEventListener('mouseup', handleMarqueeUp);
  };

  const handleContextMenu = (e: MouseEvent) => {
    e.preventDefault();

    if (marqueeStore.isActive) {
      selectAll([...marqueeStore.previousSelection]);
      cancelMarquee();
      document.removeEventListener('mousemove', handleMarqueeMove);
      document.removeEventListener('mouseup', handleMarqueeUp);
      return;
    }

    showContextMenu(e.clientX, e.clientY);
  };

  createEffect(() => {
    if (canvasStore.isPanning && (marqueeStore.isActive || marqueeStore.isPending)) {
      cancelMarquee();
      document.removeEventListener('mousemove', handleMarqueeMove);
      document.removeEventListener('mouseup', handleMarqueeUp);
    }
  });

  const cancelCallbacks: CancelCallbacks = {
    cancelResizeListeners: () => {
      document.removeEventListener('mousemove', handleResizeMove);
      document.removeEventListener('mouseup', handleResizeUp);
    },
    cancelDragListeners: () => {
      document.removeEventListener('mousemove', handleDragMove);
      document.removeEventListener('mouseup', handleDragUp);
    },
    cancelMarqueeListeners: () => {
      document.removeEventListener('mousemove', handleMarqueeMove);
      document.removeEventListener('mouseup', handleMarqueeUp);
    },
    clearPendingDrag: () => {
      setPendingDragStart(null);
      setPendingDragViewId(null);
    },
  };

  onCleanup(() => {
    document.removeEventListener('mousedown', handleGlobalMouseDown);
    document.removeEventListener('mousemove', handleMarqueeMove);
    document.removeEventListener('mouseup', handleMarqueeUp);
    document.removeEventListener('mousemove', handleDragMove);
    document.removeEventListener('mouseup', handleDragUp);
    document.removeEventListener('mousemove', handleResizeMove);
    document.removeEventListener('mouseup', handleResizeUp);
  });

  return {
    wrapperRef,
    handleSvgMouseDown,
    handleResizeStart,
    handleContextMenu,
    cancelCallbacks,
  };
}
