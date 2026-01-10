/**
 * HorizontalRuler Component
 *
 * Displays a horizontal ruler along the top edge of the canvas with
 * tick marks, labels, and template bounds indicator.
 */

import { createMemo, For, Show } from 'solid-js';
import { canvasStore } from '../../../stores/canvasStore';
import { startCreationDrag } from '../../../stores/guidesStore';
import {
  calculateTemplateBoundsPosition,
  calculateTickIntervals,
  calculateVisibleRange,
  canvasToScreenPosition,
  generateTicks,
  screenToCanvasPosition,
} from '../../../domain/rulers';
import type { HorizontalRulerProps } from '../../../types/ruler';
import { CursorIndicator } from './CursorIndicator';
import styles from './HorizontalRuler.module.css';

export function HorizontalRuler(props: HorizontalRulerProps) {
  // Memoize tick intervals based on zoom level
  const intervals = createMemo(() => calculateTickIntervals(canvasStore.zoomLevel));

  // Calculate visible range based on pan and zoom
  const visibleRange = createMemo(() =>
    calculateVisibleRange(props.width, canvasStore.panOffset.x, canvasStore.zoomLevel)
  );

  // Generate tick marks for the visible range
  const ticks = createMemo(() => generateTicks(visibleRange(), intervals()));

  // Calculate cursor indicator position
  const cursorScreenPosition = createMemo(() => {
    if (!props.cursorPosition) return 0;
    return canvasToScreenPosition(
      props.cursorPosition.x,
      canvasStore.panOffset.x,
      canvasStore.zoomLevel
    );
  });

  // Calculate template bounds for shaded region
  const templateBounds = createMemo(() =>
    calculateTemplateBoundsPosition(
      props.templateWidth,
      canvasStore.panOffset.x,
      canvasStore.zoomLevel
    )
  );

  // Handle mousedown to start guide creation drag
  const handleMouseDown = (e: MouseEvent) => {
    // Only respond to primary button
    if (e.button !== 0) return;

    // Get ruler element for position calculation
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    // Use Y position relative to ruler for horizontal guides
    const screenY = e.clientY - rect.top;
    // Convert to canvas coordinates
    const canvasY = screenToCanvasPosition(
      screenY,
      canvasStore.panOffset.y,
      canvasStore.zoomLevel
    );

    startCreationDrag('horizontal', canvasY);
  };

  return (
    <div
      class={styles.ruler}
      style={{ width: `${props.width}px` }}
      data-testid="horizontal-ruler"
      onMouseDown={handleMouseDown}
    >
      {/* Template bounds indicator */}
      <Show when={props.templateWidth > 0}>
        <div
          class={styles.templateBounds}
          style={{
            left: `${Math.max(0, templateBounds().start)}px`,
            width: `${Math.max(0, Math.min(props.width, templateBounds().end) - Math.max(0, templateBounds().start))}px`,
          }}
          data-testid="template-bounds-horizontal"
        />
      </Show>

      {/* Tick container */}
      <div class={styles.tickContainer}>
        <For each={ticks()}>
          {tick => {
            const screenX = createMemo(() =>
              canvasToScreenPosition(tick.position, canvasStore.panOffset.x, canvasStore.zoomLevel)
            );

            return (
              <>
                <div
                  class={`${styles.tick} ${tick.type === 'major' ? styles.tickMajor : styles.tickMinor}`}
                  style={{ left: `${screenX()}px` }}
                  data-testid={`tick-${tick.type}-${tick.position}`}
                />
                {tick.type === 'major' && tick.label !== null && (
                  <span
                    class={styles.label}
                    style={{ left: `${screenX()}px` }}
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
        canvasValue={props.cursorPosition?.x ?? 0}
        orientation="horizontal"
        visible={props.cursorPosition !== null}
      />
    </div>
  );
}
