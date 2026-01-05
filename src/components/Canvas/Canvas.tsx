import { type Component, createMemo, For, onCleanup, Show } from 'solid-js';
import { documentStore } from '../../stores/documentStore';
import {
  canvasStore,
  startPan,
  updatePan,
  endPan,
  applyZoom,
  fitToView,
  zoomIn,
  zoomOut,
  resetZoom,
} from '../../stores/canvasStore';
import { flattenHierarchy } from '../../domain/canvas/flattenHierarchy';
import { parseSize } from '../../domain/canvas/coordinates';
import type { RenderableView, TemplateBounds as TemplateBoundsType } from '../../types/canvas';
import { EmptyState } from './EmptyState';
import { Legend } from './Legend';
import { TemplateBounds } from './TemplateBounds';
import { ViewRectangle } from './ViewRectangle';
import styles from './Canvas.module.css';

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
   * Handle wheel event for zoom.
   * Prevents default browser zoom and applies cursor-centered zoom.
   */
  const handleWheel = (e: WheelEvent) => {
    e.preventDefault();
    const wrapper = e.currentTarget as HTMLElement;
    applyZoom(e.clientX, e.clientY, wrapper.getBoundingClientRect(), e.deltaY);
  };

  /**
   * Handle keyboard events for zoom shortcuts.
   * + or = key: zoom in
   * - key: zoom out
   * 0 key: reset to 100%
   * F key: fit to view
   * Ignores when modifier keys are held to avoid conflicts with browser shortcuts.
   */
  const handleKeyDown = (e: KeyboardEvent) => {
    // Ignore when modifier keys are held (browser shortcuts)
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

  // Clean up listeners on component unmount
  onCleanup(() => {
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  });

  return (
    <Show
      when={!isEmpty()}
      fallback={<EmptyState />}
    >
      <div>
        <div
          class={styles.canvasWrapper}
          classList={{
            [styles.grabbing]: canvasStore.isPanning,
          }}
          data-testid="canvas-wrapper"
          tabIndex={0}
          onMouseDown={handleMouseDown}
          onWheel={handleWheel}
          onKeyDown={handleKeyDown}
          style={{
            width: `${templateBounds()?.width ?? 100}px`,
            height: `${templateBounds()?.height ?? 100}px`,
            transform: `translate(${canvasStore.panOffset.x}px, ${canvasStore.panOffset.y}px) scale(${canvasStore.zoomLevel})`,
          }}
        >
          <svg
            class={styles.canvas}
            width={templateBounds()?.width ?? 100}
            height={templateBounds()?.height ?? 100}
            viewBox={`0 0 ${templateBounds()?.width ?? 100} ${templateBounds()?.height ?? 100}`}
            data-testid="canvas"
          >
            <Show when={templateBounds()}>
              {(bounds) => <TemplateBounds bounds={bounds()} />}
            </Show>
            <For each={renderableViews()}>
              {(view) => <ViewRectangle view={view} />}
            </For>
          </svg>
        </div>
        <Legend />
      </div>
    </Show>
  );
};
