import { type Component, createEffect, createMemo, createSignal, For, onCleanup, Show } from 'solid-js';
import type { TemplateDefinition } from '../../types/uidesc';
import { documentStore } from '../../stores/documentStore';
import {
  applyZoom,
  canvasStore,
  endPan,
  fitToView,
  resetZoom,
  startPan,
  updatePan,
  zoomIn,
  zoomOut,
} from '../../stores/canvasStore';
import { toggleVisibility } from '../../stores/gridStore';
import {
  activateMarquee,
  beginTracking,
  cancelMarquee,
  completeMarquee,
  marqueeStore,
  updateMarquee,
} from '../../stores/marqueeStore';
import {
  cancelDrag,
  dragStore,
  endDrag,
  resetDrag,
  startDrag,
  updateDrag,
} from '../../stores/dragStore';
import {
  endResize,
  resetResize,
  resizeStore,
  startResize,
  updateResize,
} from '../../stores/resizeStore';
import { updateViewOrigin, updateViewSize } from '../../stores/documentStore';
import { clearSelection, isSelected, select, selectAll, selectionStore, toggleSelect } from '../../stores/selectionStore';
import { flattenHierarchy } from '../../domain/canvas/flattenHierarchy';
import { hitTest } from '../../domain/canvas/hitTest';
import { applyDelta, applyDeltaToAll, createMoveOperation } from '../../domain/canvas/move';
import { createResizeOperation } from '../../domain/canvas/resize';
import { pushOperation, redo, undo } from '../../stores/historyStore';
import { CLICK_TOLERANCE, NUDGE_DISTANCE, NUDGE_DISTANCE_FAST } from '../../types/history';
import { findIntersectingViews, isMinimumSize, normalizeRect } from '../../domain/canvas/marquee';
import { mouseToCanvas } from '../../domain/canvas/mouseToCanvas';
import { parseSize } from '../../domain/canvas/coordinates';
import type { RenderableView, TemplateBounds as TemplateBoundsType } from '../../types/canvas';
import type { HandlePosition } from '../../types/selection';
import { EmptyState } from './EmptyState';
import { Grid } from './Grid';
import { HoverTooltip } from './HoverTooltip';
import { Legend } from './Legend';
import { MarqueeRectangle } from './MarqueeRectangle';
import { SelectionOverlay } from './SelectionOverlay';
import { TemplateBounds } from './TemplateBounds';
import { ViewRectangle } from './ViewRectangle';
import { DragPreview } from './DragPreview';
import styles from './Canvas.module.css';

/** Tooltip delay in milliseconds (SC-003) */
const TOOLTIP_DELAY_MS = 500;

/**
 * Main canvas component that renders the uidesc template visualization.
 * Reads view hierarchy from documentStore and renders as SVG.
 */
export const Canvas: Component = () => {
  /**
   * Gets the templates object from documentStore.
   */
  const templates = () => {
    const doc = documentStore.document;
    if (!doc) return null;

    // Access vstgui-ui-description.templates
    const vstgui = doc['vstgui-ui-description'];
    if (!vstgui) return null;

    return vstgui.templates ?? null;
  };

  /**
   * Gets the first template from the templates object.
   * Returns [templateName, templateView] tuple or null.
   */
  const firstTemplate = createMemo((): [string, TemplateDefinition] | null => {
    const t = templates();
    if (!t) return null;

    const entries = Object.entries(t) as [string, TemplateDefinition][];
    if (entries.length === 0) return null;

    return entries[0];
  });

  /**
   * Flattens the template hierarchy into renderable views.
   * Passes fonts and colors from document for style resolution.
   */
  const renderableViews = createMemo((): RenderableView[] => {
    const template = firstTemplate();
    if (!template) return [];

    const doc = documentStore.document;
    const vstgui = doc?.['vstgui-ui-description'];

    const [name, view] = template;
    return flattenHierarchy(view, name, {
      fonts: vstgui?.fonts,
      colors: vstgui?.colors,
    });
  });

  /**
   * Gets the template bounds from the root view.
   */
  const templateBounds = createMemo((): TemplateBoundsType | null => {
    const template = firstTemplate();
    if (!template) return null;

    const [, view] = template;
    const size = parseSize(view.attributes.size);

    return {
      width: size.width,
      height: size.height,
    };
  });

  /**
   * Whether to show the empty state.
   */
  const isEmpty = () => firstTemplate() === null;

  /**
   * Gets the selected views for rendering selection overlays.
   */
  const selectedViews = createMemo((): RenderableView[] => {
    const views = renderableViews();
    const selectedIds = selectionStore.selectedIds;
    return views.filter((view) => selectedIds.has(view.id));
  });

  /**
   * Reference to the canvas wrapper element for coordinate transforms.
   */
  let wrapperRef: HTMLDivElement | undefined;

  const [showTooltip, setShowTooltip] = createSignal(false);
  const [tooltipPosition, setTooltipPosition] = createSignal({ x: 0, y: 0 });
  let tooltipTimer: ReturnType<typeof setTimeout> | null = null;

  const [pendingDragStart, setPendingDragStart] = createSignal<{ x: number; y: number } | null>(null);
  const [pendingDragViewId, setPendingDragViewId] = createSignal<string | null>(null);

  const getHandlePosition = (handle: HandlePosition, view: RenderableView): { x: number; y: number } => {
    const { absoluteX: x, absoluteY: y, width: w, height: h } = view;
    switch (handle) {
      case 'nw': return { x, y };
      case 'n': return { x: x + w / 2, y };
      case 'ne': return { x: x + w, y };
      case 'w': return { x, y: y + h / 2 };
      case 'e': return { x: x + w, y: y + h / 2 };
      case 'sw': return { x, y: y + h };
      case 's': return { x: x + w / 2, y: y + h };
      case 'se': return { x: x + w, y: y + h };
    }
  };

  const handleResizeStart = (handle: HandlePosition, view: RenderableView) => {
    const point = getHandlePosition(handle, view);
    const origin = { x: view.absoluteX, y: view.absoluteY };
    const size = { width: view.width, height: view.height };

    startResize(handle, view.id, point, origin, size);

    document.addEventListener('mousemove', handleResizeMove);
    document.addEventListener('mouseup', handleResizeUp);
  };

  const handleResizeMove = (e: MouseEvent) => {
    if (!resizeStore.isResizing || !wrapperRef) return;

    const wrapperRect = wrapperRef.getBoundingClientRect();
    const canvasPoint = mouseToCanvas(
      e.clientX,
      e.clientY,
      wrapperRect,
      canvasStore.panOffset,
      canvasStore.zoomLevel
    );

    updateResize(canvasPoint, e.shiftKey, e.altKey);
  };

  const handleResizeUp = () => {
    document.removeEventListener('mousemove', handleResizeMove);
    document.removeEventListener('mouseup', handleResizeUp);

    if (resizeStore.isResizing && resizeStore.viewId) {
      const viewId = resizeStore.viewId;
      const originalOrigin = resizeStore.originalOrigin;
      const originalSize = resizeStore.originalSize;
      const newOrigin = resizeStore.newOrigin;
      const newSize = resizeStore.newSize;

      if (originalOrigin && originalSize) {
        const sizeChanged =
          newSize.width !== originalSize.width || newSize.height !== originalSize.height;
        const originChanged =
          newOrigin.x !== originalOrigin.x || newOrigin.y !== originalOrigin.y;

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



  /**
   * Gets the currently hovered view for tooltip display.
   */
  const hoveredView = createMemo((): RenderableView | null => {
    const hoveredId = selectionStore.hoveredId;
    if (!hoveredId) return null;
    return renderableViews().find((v) => v.id === hoveredId) ?? null;
  });

  /**
   * Handle mouse move on canvas - track position for tooltip
   */
  const handleCanvasMouseMove = (e: MouseEvent) => {
    setTooltipPosition({ x: e.clientX, y: e.clientY });

    // Reset tooltip timer on mouse move
    if (tooltipTimer) {
      clearTimeout(tooltipTimer);
      setShowTooltip(false);
    }

    // Start new tooltip delay timer if hovering a view
    if (selectionStore.hoveredId) {
      tooltipTimer = setTimeout(() => {
        setShowTooltip(true);
      }, TOOLTIP_DELAY_MS);
    }
  };

  /**
   * Handle mouse leave on canvas - hide tooltip
   */
  const handleCanvasMouseLeave = () => {
    if (tooltipTimer) {
      clearTimeout(tooltipTimer);
      tooltipTimer = null;
    }
    setShowTooltip(false);
  };

  /**
   * Find the view ID from a click target element by traversing up the DOM.
   * Looks for data-view-id attribute on the target or its ancestors.
   */
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

  /**
   * Handle mouse down for pan initiation.
   * Middle mouse button (button=1) or Ctrl+left-click (button=0) starts panning.
   */
  const handleMouseDown = (e: MouseEvent) => {
    // Don't start new pan if already panning
    if (canvasStore.isPanning) {
      return;
    }

    // Middle mouse button = button 1
    // Or Ctrl held + left mouse button = button 0
    if (e.button === 1 || (e.button === 0 && e.ctrlKey)) {
      e.preventDefault(); // Prevent browser auto-scroll
      startPan(e.clientX, e.clientY);

      // Add document-level listeners for drag
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }
  };

  /**
   * Handle mouse move during pan gesture.
   */
  const handleMouseMove = (e: MouseEvent) => {
    updatePan(e.clientX, e.clientY);
  };

  /**
   * Handle mouse up to end pan gesture.
   */
  const handleMouseUp = () => {
    endPan();
    // Remove document-level listeners
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  };

  const handleSvgMouseDown = (e: MouseEvent) => {
    if (e.button !== 0 || e.ctrlKey || canvasStore.isPanning) {
      return;
    }

    if (!wrapperRef) return;
    const wrapperRect = wrapperRef.getBoundingClientRect();
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

  const captureOriginsForSelectedViews = (): Record<string, { x: number; y: number }> => {
    const views = renderableViews();
    const selectedIds = selectionStore.selectedIds;
    const origins: Record<string, { x: number; y: number }> = {};

    for (const view of views) {
      if (selectedIds.has(view.id)) {
        origins[view.id] = { x: view.absoluteX, y: view.absoluteY };
      }
    }

    return origins;
  };

  const handleDragMove = (e: MouseEvent) => {
    if (!wrapperRef) return;
    const start = pendingDragStart();

    if (!start) return;

    if (!dragStore.isDragging) {
      const dx = Math.abs(e.clientX - start.x);
      const dy = Math.abs(e.clientY - start.y);
      const distance = Math.max(dx, dy);

      if (distance >= CLICK_TOLERANCE) {
        const wrapperRect = wrapperRef.getBoundingClientRect();
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

    const wrapperRect = wrapperRef.getBoundingClientRect();
    const canvasPoint = mouseToCanvas(
      e.clientX,
      e.clientY,
      wrapperRect,
      canvasStore.panOffset,
      canvasStore.zoomLevel
    );

    updateDrag(canvasPoint, e.shiftKey);
  };

  const handleDragUp = () => {
    document.removeEventListener('mousemove', handleDragMove);
    document.removeEventListener('mouseup', handleDragUp);

    if (dragStore.isDragging) {
      const delta = dragStore.delta;
      const origins = dragStore.originalOrigins;
      const viewIds = Object.keys(origins);
      const newOrigins = applyDeltaToAll(origins, delta);

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
  };

  const handleMarqueeMove = (e: MouseEvent) => {
    if (!wrapperRef) return;
    const wrapperRect = wrapperRef.getBoundingClientRect();
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

  /**
   * Handle mouse up to complete marquee selection or click-select.
   */
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
    const views = renderableViews();
    const intersectingIds = findIntersectingViews(marqueeRect, views);

    if (marqueeStore.isAdditive) {
      const merged = new Set([...marqueeStore.previousSelection, ...intersectingIds]);
      selectAll([...merged]);
    } else {
      selectAll(intersectingIds);
    }

    completeMarquee();
  };

  createEffect(() => {
    if (canvasStore.isPanning && (marqueeStore.isActive || marqueeStore.isPending)) {
      cancelMarquee();
      document.removeEventListener('mousemove', handleMarqueeMove);
      document.removeEventListener('mouseup', handleMarqueeUp);
    }
  });

  /**
   * Handle wheel event for zoom.
   * Prevents default browser zoom and applies cursor-centered zoom.
   */
  const handleWheel = (e: WheelEvent) => {
    e.preventDefault();
    const wrapper = e.currentTarget as HTMLElement;
    applyZoom(e.clientX, e.clientY, wrapper.getBoundingClientRect(), e.deltaY);
  };

  /**
   * Handle keyboard events for zoom, selection, and grid shortcuts.
   * Ctrl+A / Cmd+A: select all views (FR-005)
   * Escape: deselect all views (FR-006)
   * + or = key: zoom in
   * - key: zoom out
   * 0 key: reset to 100%
   * F key: fit to view
   * G key: toggle grid
   * Ignores when focus is in a text input/textarea (FR-007, FR-013).
   */
  const handleKeyDown = (e: KeyboardEvent) => {
    // Ignore when focus is in a text input or textarea (FR-007, FR-013)
    const target = e.target as HTMLElement;
    const tagName = target.tagName.toLowerCase();
    if (tagName === 'input' || tagName === 'textarea') {
      return;
    }

    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'a') {
      e.preventDefault();
      const views = renderableViews();
      selectAll(views.map((v) => v.id));
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
      if (dragStore.isDragging) {
        const origins = dragStore.originalOrigins;
        for (const [viewId, origin] of Object.entries(origins)) {
          updateViewOrigin(viewId, origin);
        }
        cancelDrag();
        setPendingDragStart(null);
        setPendingDragViewId(null);
        document.removeEventListener('mousemove', handleDragMove);
        document.removeEventListener('mouseup', handleDragUp);
        return;
      }

      if (marqueeStore.isActive) {
        selectAll([...marqueeStore.previousSelection]);
        cancelMarquee();
        document.removeEventListener('mousemove', handleMarqueeMove);
        document.removeEventListener('mouseup', handleMarqueeUp);
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
          originalOrigins[view.id] = { x: view.absoluteX, y: view.absoluteY };
          newOrigins[view.id] = applyDelta({ x: view.absoluteX, y: view.absoluteY }, delta);
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
    } else if (e.key === 'g' || e.key === 'G') {
      toggleVisibility();
    }
  };

  /**
   * Handle contextmenu (right-click) to cancel marquee selection.
   */
  const handleContextMenu = (e: MouseEvent) => {
    if (marqueeStore.isActive) {
      e.preventDefault();
      selectAll([...marqueeStore.previousSelection]);
      cancelMarquee();
      document.removeEventListener('mousemove', handleMarqueeMove);
      document.removeEventListener('mouseup', handleMarqueeUp);
    }
  };

  /**
   * Handle fit to view action.
   * Gets the viewport size from the canvas container and template size from bounds.
   */
  const handleFitToView = () => {
    const bounds = templateBounds();
    if (!bounds) return;

    // Use a reasonable default viewport size if we can't get the actual size
    // In practice, this would come from the parent container
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    fitToView(
      { width: viewportWidth, height: viewportHeight },
      { width: bounds.width, height: bounds.height }
    );
  };

  onCleanup(() => {
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
    document.removeEventListener('mousemove', handleMarqueeMove);
    document.removeEventListener('mouseup', handleMarqueeUp);
    document.removeEventListener('mousemove', handleDragMove);
    document.removeEventListener('mouseup', handleDragUp);
    document.removeEventListener('mousemove', handleResizeMove);
    document.removeEventListener('mouseup', handleResizeUp);
    if (tooltipTimer) {
      clearTimeout(tooltipTimer);
    }
  });

  return (
    <Show
      when={!isEmpty()}
      fallback={<EmptyState />}
    >
      <div>
        <div
          ref={wrapperRef}
          class={styles.canvasWrapper}
          classList={{
            [styles.grabbing]: canvasStore.isPanning,
            [styles.marqueeCursor]: marqueeStore.isActive,
            [styles.moveCursor]: dragStore.isDragging,
            [styles.noSelect]: marqueeStore.isPending || marqueeStore.isActive || canvasStore.isPanning || dragStore.isDragging,
          }}
          data-testid="canvas-wrapper"
          tabIndex={0}
          onMouseDown={handleMouseDown}
          onMouseMove={handleCanvasMouseMove}
          onMouseLeave={handleCanvasMouseLeave}
          onWheel={handleWheel}
          onKeyDown={handleKeyDown}
          onContextMenu={handleContextMenu}
          style={{
            width: `${templateBounds()?.width ?? 100}px`,
            height: `${templateBounds()?.height ?? 100}px`,
            transform: `translate(${canvasStore.panOffset.x}px, ${canvasStore.panOffset.y}px) scale(${canvasStore.zoomLevel})`,
          }}
        >
          {/* Grid renders behind template views */}
          <Show when={templateBounds()}>
            {(bounds) => <Grid width={bounds().width} height={bounds().height} />}
          </Show>
          <svg
            class={styles.canvas}
            width={templateBounds()?.width ?? 100}
            height={templateBounds()?.height ?? 100}
            viewBox={`0 0 ${templateBounds()?.width ?? 100} ${templateBounds()?.height ?? 100}`}
            data-testid="canvas"
            onMouseDown={handleSvgMouseDown}
          >
            <Show when={templateBounds()}>
              {(bounds) => <TemplateBounds bounds={bounds()} />}
            </Show>
            <For each={renderableViews()}>
              {(view) => <ViewRectangle view={view} allViews={renderableViews()} />}
            </For>
            <For each={selectedViews()}>
              {(view) => <SelectionOverlay view={view} onResizeStart={handleResizeStart} />}
            </For>
            <DragPreview views={selectedViews()} />
            <Show when={marqueeStore.isActive}>
              <MarqueeRectangle />
            </Show>
          </svg>
        </div>
        <Legend />
        {/* Hover tooltip - renders when hovering and after delay (FR-011, SC-003) */}
        <Show when={showTooltip() && hoveredView()}>
          {(view) => (
            <HoverTooltip
              view={view()}
              x={tooltipPosition().x}
              y={tooltipPosition().y}
            />
          )}
        </Show>
      </div>
    </Show>
  );
};
