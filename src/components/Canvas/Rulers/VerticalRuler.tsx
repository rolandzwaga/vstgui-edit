/**
 * VerticalRuler Component
 *
 * Displays a vertical ruler along the left edge of the canvas with
 * tick marks, labels, and template bounds indicator.
 */

import { createMemo, For, Show } from 'solid-js';
import { canvasStore } from '../../../stores/canvasStore';
import { startCreationDrag, addGuideWithHistory } from '../../../stores/guidesStore';
import {
  calculateTemplateBoundsPosition,
  calculateTickIntervals,
  calculateVisibleRange,
  canvasToScreenPosition,
  generateTicks,
  screenToCanvasPosition,
} from '../../../domain/rulers';
import type { VerticalRulerProps } from '../../../types/ruler';
import { CursorIndicator } from './CursorIndicator';
import styles from './VerticalRuler.module.css';

export function VerticalRuler(props: VerticalRulerProps) {
  // Memoize tick intervals based on zoom level
  const intervals = createMemo(() => calculateTickIntervals(canvasStore.zoomLevel));

  // Calculate visible range based on pan and zoom
  const visibleRange = createMemo(() =>
    calculateVisibleRange(props.height, canvasStore.panOffset.y, canvasStore.zoomLevel)
  );

  // Generate tick marks for the visible range
  const ticks = createMemo(() => generateTicks(visibleRange(), intervals()));

  // Calculate cursor indicator position
  const cursorScreenPosition = createMemo(() => {
    if (!props.cursorPosition) return 0;
    return canvasToScreenPosition(
      props.cursorPosition.y,
      canvasStore.panOffset.y,
      canvasStore.zoomLevel
    );
  });

  // Calculate template bounds for shaded region
  const templateBounds = createMemo(() =>
    calculateTemplateBoundsPosition(
      props.templateHeight,
      canvasStore.panOffset.y,
      canvasStore.zoomLevel
    )
  );

  // Handle mousedown to start guide creation drag
  const handleMouseDown = (e: MouseEvent) => {
    // Only respond to primary button
    if (e.button !== 0) return;

    // Get ruler element for position calculation
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    // Use X position relative to ruler for vertical guides
    const screenX = e.clientX - rect.left;
    // Convert to canvas coordinates
    const canvasX = screenToCanvasPosition(
      screenX,
      canvasStore.panOffset.x,
      canvasStore.zoomLevel
    );

    startCreationDrag('vertical', canvasX);
  };

  // Handle context menu to create guide at click position
  const handleContextMenu = (e: MouseEvent) => {
    e.preventDefault();

    // Get click position in canvas coordinates
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const screenX = e.clientX - rect.left;
    const canvasX = Math.round(
      screenToCanvasPosition(screenX, canvasStore.panOffset.x, canvasStore.zoomLevel)
    );

    addGuideWithHistory('vertical', canvasX);
  };

  return (
    <div
      class={styles.ruler}
      style={{ height: `${props.height}px` }}
      data-testid="vertical-ruler"
      onMouseDown={handleMouseDown}
      onContextMenu={handleContextMenu}
    >
      {/* Template bounds indicator */}
      <Show when={props.templateHeight > 0}>
        <div
          class={styles.templateBounds}
          style={{
            top: `${Math.max(0, templateBounds().start)}px`,
            height: `${Math.max(0, Math.min(props.height, templateBounds().end) - Math.max(0, templateBounds().start))}px`,
          }}
          data-testid="template-bounds-vertical"
        />
      </Show>

      {/* Tick container */}
      <div class={styles.tickContainer}>
        <For each={ticks()}>
          {tick => {
            const screenY = createMemo(() =>
              canvasToScreenPosition(tick.position, canvasStore.panOffset.y, canvasStore.zoomLevel)
            );

            return (
              <>
                <div
                  class={`${styles.tick} ${tick.type === 'major' ? styles.tickMajor : styles.tickMinor}`}
                  style={{ top: `${screenY()}px` }}
                  data-testid={`tick-${tick.type}-${tick.position}`}
                />
                {tick.type === 'major' && tick.label !== null && (
                  <span
                    class={styles.label}
                    style={{ top: `${screenY()}px` }}
                    data-testid={`label-${tick.position}`}
                  >
                    {tick.label}
                  </span>
                )}
              </>
            );
          }}
        </For>
      </div>

      {/* Cursor indicator */}
      <CursorIndicator
        screenPosition={cursorScreenPosition()}
        canvasValue={props.cursorPosition?.y ?? 0}
        orientation="vertical"
        visible={props.cursorPosition !== null}
      />
    </div>
  );
}
