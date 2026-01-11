import type { Accessor } from 'solid-js';
import {
  alignViews,
  createAlignmentOperation,
  getAlignmentDescription,
  handleAlignmentShortcut,
} from '../../domain/alignment';
import { applyDelta, createMoveOperation } from '../../domain/canvas/move';
import {
  copySelectedViews,
  createDeleteOperation,
  createDuplicateOperation,
  createPasteOperation,
  cutSelectedViews,
  deleteSelectedViews,
  duplicateSelectedViews,
  pasteViews,
} from '../../domain/canvas/viewOperations';
import {
  createGroupHistoryOperation,
  createUngroupHistoryOperation,
} from '../../domain/hierarchy/groupOperations';
import { filterUnlockedViews } from '../../domain/lockHide/lockOperations';
import { fitToView, resetZoom, zoomIn, zoomOut } from '../../stores/canvasStore';
import { getParentId, isRoot, updateViewOrigin } from '../../stores/documentStore';
import { cancelDrag, dragStore } from '../../stores/dragStore';
import { toggleSnap, toggleVisibility } from '../../stores/gridStore';
import {
  cancelCreationDrag,
  cancelRepositionDrag,
  guidesStore,
  toggleGuidesVisibility,
} from '../../stores/guidesStore';
import { pushOperation, redo, undo } from '../../stores/historyStore';
import {
  isHidden,
  isLocked,
  lockSelectedWithHistory,
  showAllWithHistory,
  toggleHideSelectedWithHistory,
  unlockSelectedWithHistory,
} from '../../stores/lockHideStore';
import { cancelMarquee, marqueeStore } from '../../stores/marqueeStore';
import { cancelResize, resizeStore } from '../../stores/resizeStore';
import { clearSelection, selectAll, selectionStore } from '../../stores/selectionStore';
import { toggleSmartGuides } from '../../stores/smartGuidesStore';
import type { AlignmentType } from '../../types/alignment';
import type { Point, RenderableView, TemplateBounds } from '../../types/canvas';
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
  getMousePosition?: () => Point | null;
}

export interface UseCanvasKeyboardResult {
  handleKeyDown: (e: KeyboardEvent) => void;
}

export function useCanvasKeyboard(options: UseCanvasKeyboardOptions): UseCanvasKeyboardResult {
  const { renderableViews, templateBounds, cancelCallbacks, getMousePosition } = options;

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

    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'd') {
      e.preventDefault();
      const selectedIds = selectionStore.selectedIds;
      if (selectedIds.size === 0) {
        return;
      }
      const duplicated = duplicateSelectedViews();
      if (duplicated.length > 0) {
        const operation = createDuplicateOperation(duplicated);
        pushOperation(operation);
      }
      return;
    }

    if ((e.ctrlKey || e.metaKey) && !e.shiftKey && e.key.toLowerCase() === 'c') {
      e.preventDefault();
      copySelectedViews();
      return;
    }

    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'x') {
      e.preventDefault();
      const removed = cutSelectedViews();
      if (removed.length > 0) {
        const operation = createDeleteOperation(removed);
        pushOperation(operation);
      }
      return;
    }

    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'v') {
      e.preventDefault();
      const bounds = templateBounds();
      const pointerPosition = getMousePosition?.() ?? null;
      const pasted = pasteViews({
        pointerPosition: pointerPosition ?? undefined,
        templateBounds: bounds ? { width: bounds.width, height: bounds.height } : undefined,
      });
      if (pasted.length > 0) {
        const operation = createPasteOperation(pasted);
        pushOperation(operation);
      }
      return;
    }

    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'g' && !e.shiftKey) {
      e.preventDefault();
      const selectedIds = selectionStore.selectedIds;
      if (selectedIds.size < 2) {
        return;
      }

      const operation = createGroupHistoryOperation([...selectedIds]);
      if (operation) {
        pushOperation(operation);
      }
      return;
    }

    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'g' && e.shiftKey) {
      e.preventDefault();
      const selectedIds = selectionStore.selectedIds;
      if (selectedIds.size !== 1) {
        return;
      }

      const operation = createUngroupHistoryOperation([...selectedIds][0]);
      if (operation) {
        pushOperation(operation);
      }
      return;
    }

    // Ctrl+L - Toggle lock for selected views (lock if any unlocked, unlock if all locked)
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'l' && !e.shiftKey) {
      e.preventDefault();
      const selectedIds = selectionStore.selectedIds;
      if (selectedIds.size === 0) {
        return;
      }

      // Check if all selected views are locked
      const allLocked = Array.from(selectedIds).every(id => isLocked(id));
      if (allLocked) {
        unlockSelectedWithHistory(selectedIds);
      } else {
        lockSelectedWithHistory(selectedIds);
      }
      return;
    }

    // Ctrl+H - Toggle hide for selected views
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'h' && !e.shiftKey) {
      e.preventDefault();
      const selectedIds = selectionStore.selectedIds;
      if (selectedIds.size === 0) {
        return;
      }
      toggleHideSelectedWithHistory(selectedIds);
      // Clear selection after hiding since the views are no longer visible
      const allHidden = Array.from(selectedIds).every(id => isHidden(id));
      if (allHidden) {
        clearSelection();
      }
      return;
    }

    // Ctrl+Shift+H - Show all hidden views
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'h' && e.shiftKey) {
      e.preventDefault();
      showAllWithHistory();
      return;
    }

    if (e.key === 'Escape') {
      // Cancel guide creation drag first
      if (guidesStore.creationDrag) {
        cancelCreationDrag();
        return;
      }

      // Cancel guide reposition drag
      if (guidesStore.repositionDrag) {
        cancelRepositionDrag();
        return;
      }

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
      e.preventDefault();
      const selectedIds = selectionStore.selectedIds;
      if (selectedIds.size === 0) {
        return;
      }

      // Filter out locked views and root container from nudge operation
      const unlockedIds = filterUnlockedViews(Array.from(selectedIds), isLocked);
      const movableIds = unlockedIds.filter(id => !isRoot(id));
      if (movableIds.length === 0) {
        // All selected views are locked or root, do nothing
        return;
      }
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
      const movableIdSet = new Set(movableIds);

      for (const view of views) {
        if (movableIdSet.has(view.id)) {
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
      e.preventDefault();
      const selectedIds = selectionStore.selectedIds;
      if (selectedIds.size === 0) {
        return;
      }

      // Filter out locked views from deletion
      const unlockedIds = filterUnlockedViews(Array.from(selectedIds), isLocked);
      if (unlockedIds.length === 0) {
        // All selected views are locked, do nothing
        return;
      }
      // Temporarily select only unlocked views for deletion
      selectAll(unlockedIds);
      const removed = deleteSelectedViews();
      if (removed.length > 0) {
        const operation = createDeleteOperation(removed);
        pushOperation(operation);
      }
      return;
    }

    // Handle Ctrl+Shift+{L,C,R,T,M,B} alignment shortcuts
    if ((e.ctrlKey || e.metaKey) && e.shiftKey) {
      const views = renderableViews();
      const viewMap = new Map(views.map(v => [v.id, v]));
      const getView = (id: string) => viewMap.get(id) ?? null;

      const handleAlign = (type: AlignmentType, selectedIdArray: string[]) => {
        const results = alignViews(selectedIdArray, type, getView, getParentId);
        if (results.length === 0) return;

        // Apply new positions
        for (const result of results) {
          updateViewOrigin(result.viewId, result.newOrigin);
        }

        // Create history operation
        const isParentAlign = selectedIdArray.length === 1;
        const description = getAlignmentDescription(results.length, type, isParentAlign);
        const operation = createAlignmentOperation(results, description, updateViewOrigin);
        pushOperation(operation);
      };

      const handled = handleAlignmentShortcut(e, selectionStore.selectedIds, handleAlign);
      if (handled) {
        e.preventDefault();
        return;
      }
    }

    // Handle Ctrl+; for toggling guide visibility (must be before the ctrl/meta/alt early return)
    if (e.key === ';' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      toggleGuidesVisibility();
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
