import type { Accessor } from 'solid-js';
import { applyDelta, createMoveOperation } from '../../domain/canvas/move';
import { createDeleteOperation, deleteSelectedViews } from '../../domain/canvas/viewOperations';
import { fitToView, resetZoom, zoomIn, zoomOut } from '../../stores/canvasStore';
import { updateViewOrigin } from '../../stores/documentStore';
import { cancelDrag, dragStore } from '../../stores/dragStore';
import { toggleSnap, toggleVisibility } from '../../stores/gridStore';
import { pushOperation, redo, undo } from '../../stores/historyStore';
import { cancelMarquee, marqueeStore } from '../../stores/marqueeStore';
import { cancelResize, resizeStore } from '../../stores/resizeStore';
import { clearSelection, selectAll, selectionStore } from '../../stores/selectionStore';
import { toggleSmartGuides } from '../../stores/smartGuidesStore';
import type { RenderableView, TemplateBounds } from '../../types/canvas';
import { NUDGE_DISTANCE, NUDGE_DISTANCE_FAST } from '../../types/history';

export interface CancelCallbacks {
  cancelResizeListeners: () => void;
  cancelDragListeners: () => void;
  cancelMarqueeListeners: () => void;
  clearPendingDrag: () => void;
}

export interface UseCanvasKeyboardOptions {
  renderableViews: Accessor<RenderableView[]>;
  templateBounds: Accessor<TemplateBounds | null>;
  cancelCallbacks: CancelCallbacks;
}

export interface UseCanvasKeyboardResult {
  handleKeyDown: (e: KeyboardEvent) => void;
}

export function useCanvasKeyboard(options: UseCanvasKeyboardOptions): UseCanvasKeyboardResult {
  const { renderableViews, templateBounds, cancelCallbacks } = options;

  const handleFitToView = () => {
    const bounds = templateBounds();
    if (!bounds) return;

    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    fitToView(
      { width: viewportWidth, height: viewportHeight },
      { width: bounds.width, height: bounds.height }
    );
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    const target = e.target as HTMLElement;
    const tagName = target.tagName.toLowerCase();
    if (tagName === 'input' || tagName === 'textarea') {
      return;
    }

    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'a') {
      e.preventDefault();
      const views = renderableViews();
      selectAll(views.map(v => v.id));
      return;
    }

    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z' && !e.shiftKey) {
      e.preventDefault();
      undo();
      return;
    }

    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') {
      e.preventDefault();
      redo();
      return;
    }

    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z' && e.shiftKey) {
      e.preventDefault();
      redo();
      return;
    }

    if (e.key === 'Escape') {
      if (resizeStore.isResizing) {
        cancelResize();
        cancelCallbacks.cancelResizeListeners();
        return;
      }

      if (dragStore.isDragging) {
        const origins = dragStore.originalOrigins;
        for (const [viewId, origin] of Object.entries(origins)) {
          updateViewOrigin(viewId, origin);
        }
        cancelDrag();
        cancelCallbacks.clearPendingDrag();
        cancelCallbacks.cancelDragListeners();
        return;
      }

      if (marqueeStore.isActive) {
        selectAll([...marqueeStore.previousSelection]);
        cancelMarquee();
        cancelCallbacks.cancelMarqueeListeners();
        return;
      }
      clearSelection();
      return;
    }

    if (e.key.startsWith('Arrow') && !e.ctrlKey && !e.metaKey && !e.altKey) {
      const selectedIds = selectionStore.selectedIds;
      if (selectedIds.size === 0) {
        return;
      }

      e.preventDefault();
      const distance = e.shiftKey ? NUDGE_DISTANCE_FAST : NUDGE_DISTANCE;
      let delta = { x: 0, y: 0 };

      switch (e.key) {
        case 'ArrowRight':
          delta = { x: distance, y: 0 };
          break;
        case 'ArrowLeft':
          delta = { x: -distance, y: 0 };
          break;
        case 'ArrowDown':
          delta = { x: 0, y: distance };
          break;
        case 'ArrowUp':
          delta = { x: 0, y: -distance };
          break;
      }

      const views = renderableViews();
      const originalOrigins: Record<string, { x: number; y: number }> = {};
      const newOrigins: Record<string, { x: number; y: number }> = {};
      const viewIds: string[] = [];

      for (const view of views) {
        if (selectedIds.has(view.id)) {
          viewIds.push(view.id);
          originalOrigins[view.id] = { x: view.relativeX, y: view.relativeY };
          newOrigins[view.id] = applyDelta({ x: view.relativeX, y: view.relativeY }, delta);
        }
      }

      for (const [viewId, newOrigin] of Object.entries(newOrigins)) {
        updateViewOrigin(viewId, newOrigin);
      }

      const operation = createMoveOperation(
        { viewIds, originalOrigins, newOrigins },
        updateViewOrigin
      );
      pushOperation(operation);
      return;
    }

    if (e.key === 'Delete' || e.key === 'Backspace') {
      const selectedIds = selectionStore.selectedIds;
      if (selectedIds.size === 0) {
        return;
      }
      e.preventDefault();
      const removed = deleteSelectedViews();
      if (removed.length > 0) {
        const operation = createDeleteOperation(removed);
        pushOperation(operation);
      }
      return;
    }

    if (e.ctrlKey || e.metaKey || e.altKey) {
      return;
    }

    if (e.key === '+' || e.key === '=') {
      zoomIn();
    } else if (e.key === '-') {
      zoomOut();
    } else if (e.key === '0') {
      resetZoom();
    } else if (e.key === 'f' || e.key === 'F') {
      handleFitToView();
    } else if ((e.key === 'g' || e.key === 'G') && !e.shiftKey) {
      toggleVisibility();
    } else if ((e.key === 'g' || e.key === 'G') && e.shiftKey) {
      toggleSnap();
    } else if (e.key === 's' || e.key === 'S') {
      toggleSmartGuides();
    }
  };

  return {
    handleKeyDown,
  };
}
