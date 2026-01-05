import { type Component, createMemo, For, onCleanup, Show } from 'solid-js';
import { documentStore } from '../../stores/documentStore';
import { canvasStore, startPan, updatePan, endPan } from '../../stores/canvasStore';
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
          onMouseDown={handleMouseDown}
          style={{
            width: `${templateBounds()?.width ?? 100}px`,
            height: `${templateBounds()?.height ?? 100}px`,
            transform: `translate(${canvasStore.panOffset.x}px, ${canvasStore.panOffset.y}px)`,
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
