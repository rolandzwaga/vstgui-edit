/**
 * HorizontalRuler Component
 *
 * Displays a horizontal ruler along the top edge of the canvas with
 * tick marks, labels, and template bounds indicator.
 */

import { createMemo, For } from 'solid-js';
import { canvasStore } from '../../../stores/canvasStore';
import {
  calculateTickIntervals,
  calculateVisibleRange,
  canvasToScreenPosition,
  generateTicks,
} from '../../../domain/rulers';
import type { HorizontalRulerProps } from '../../../types/ruler';
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

  return (
    <div
      class={styles.ruler}
      style={{ width: `${props.width}px` }}
      data-testid="horizontal-ruler"
    >
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
    </div>
  );
}
