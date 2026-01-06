import { type Component, createMemo, createSignal, For, onCleanup, Show } from 'solid-js';
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
  cancelMarquee,
  completeMarquee,
  marqueeStore,
  startMarquee,
  updateMarquee,
} from '../../stores/marqueeStore';
import { clearSelection, select, selectAll, selectionStore, toggleSelect } from '../../stores/selectionStore';
import { flattenHierarchy } from '../../domain/canvas/flattenHierarchy';
import { hitTest } from '../../domain/canvas/hitTest';
import { findIntersectingViews, isMinimumSize, normalizeRect } from '../../domain/canvas/marquee';
import { mouseToCanvas } from '../../domain/canvas/mouseToCanvas';
import { parseSize } from '../../domain/canvas/coordinates';
import type { RenderableView, TemplateBounds as TemplateBoundsType } from '../../types/canvas';
import { EmptyState } from './EmptyState';
import { Grid } from './Grid';
import { HoverTooltip } from './HoverTooltip';
import { Legend } from './Legend';
import { MarqueeRectangle } from './MarqueeRectangle';
import { SelectionOverlay } from './SelectionOverlay';
import { TemplateBounds } from './TemplateBounds';
import { ViewRectangle } from './ViewRectangle';
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
  const firstTemplate = createMemo(() => {
    const t = templates();
    if (!t) return null;

    const entries = Object.entries(t);
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

  /**
   * Tooltip state - tracks mouse position and show/hide state (FR-011, SC-003)
   */
  const [showTooltip, setShowTooltip] = createSignal(false);
  const [tooltipPosition, setTooltipPosition] = createSignal({ x: 0, y: 0 });
  let tooltipTimer: ReturnType<typeof setTimeout> | null = null;

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
   * Handle click on canvas for view selection (FR-001, FR-002, FR-003, FR-004).
   * Uses DOM target first, then falls back to hit testing for coordinates.
   * Shift+click toggles selection (add/remove from multi-selection).
   */
  const handleCanvasClick = (e: MouseEvent) => {
    // Ignore if this was a pan gesture (ctrl+click or middle button)
    if (e.ctrlKey || e.button !== 0) {
      return;
    }

    const isShiftClick = e.shiftKey;

    // First, try to get view ID from DOM target (most reliable for view clicks)
    const targetViewId = getViewIdFromTarget(e.target);
    if (targetViewId) {
      if (isShiftClick) {
        // Shift+click: toggle selection (FR-004)
        toggleSelect(targetViewId);
      } else {
        // Regular click: select single view, clear others (FR-001, FR-002)
        select(targetViewId);
      }
      return;
    }

    // If we didn't click on a view element, attempt hit testing
    // If wrapperRef is available, try coordinate-based hit testing
    if (wrapperRef) {
      const wrapperRect = wrapperRef.getBoundingClientRect();

      // Only use hit testing if we have valid bounds (not in JSDOM)
      if (wrapperRect.width > 0 && wrapperRect.height > 0) {
        // Convert mouse coordinates to canvas space
        const canvasPoint = mouseToCanvas(
          e.clientX,
          e.clientY,
          wrapperRect,
          canvasStore.panOffset,
          canvasStore.zoomLevel
        );

        // Hit test to find view under cursor
        const views = renderableViews();
        const hitViewId = hitTest(canvasPoint, views);

        if (hitViewId) {
          if (isShiftClick) {
            // Shift+click: toggle selection (FR-004)
            toggleSelect(hitViewId);
          } else {
            // Regular click: select single view (FR-001)
            select(hitViewId);
          }
          return;
        }
      }
    }

    // No view was clicked - deselect all (FR-003)
    clearSelection();
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

  /**
   * Handle mouse down on canvas SVG for marquee selection.
   * Starts marquee only on left-click on empty space (not on views, not panning).
   */
  const handleSvgMouseDown = (e: MouseEvent) => {
    if (e.button !== 0 || e.ctrlKey || canvasStore.isPanning) {
      return;
    }

    const targetViewId = getViewIdFromTarget(e.target);
    if (targetViewId) {
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

    startMarquee(canvasPoint, e.shiftKey, selectionStore.selectedIds);

    document.addEventListener('mousemove', handleMarqueeMove);
    document.addEventListener('mouseup', handleMarqueeUp);
  };

  /**
   * Handle mouse move during marquee selection.
   */
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
  };

  /**
   * Handle mouse up to complete marquee selection.
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

    if (!isMinimumSize(start, current)) {
      clearSelection();
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

    // Handle Ctrl+A / Cmd+A: select all views (FR-005)
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'a') {
      e.preventDefault(); // Prevent browser's select all
      const views = renderableViews();
      selectAll(views.map((v) => v.id));
      return;
    }

    // Handle Escape: cancel marquee if active, otherwise deselect all (FR-006)
    if (e.key === 'Escape') {
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

    // For remaining shortcuts, ignore when modifier keys are held (browser shortcuts)
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

  // Clean up listeners and timers on component unmount
  onCleanup(() => {
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
    document.removeEventListener('mousemove', handleMarqueeMove);
    document.removeEventListener('mouseup', handleMarqueeUp);
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
            onClick={handleCanvasClick}
            onMouseDown={handleSvgMouseDown}
          >
            <Show when={templateBounds()}>
              {(bounds) => <TemplateBounds bounds={bounds()} />}
            </Show>
            <For each={renderableViews()}>
              {(view) => <ViewRectangle view={view} allViews={renderableViews()} />}
            </For>
            {/* Selection overlays render on top of all views */}
            <For each={selectedViews()}>
              {(view) => <SelectionOverlay view={view} />}
            </For>
            {/* Marquee selection rectangle */}
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
