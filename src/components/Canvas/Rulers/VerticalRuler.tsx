/**
 * VerticalRuler Component
 *
 * Displays a vertical ruler along the left edge of the canvas with
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
import type { VerticalRulerProps } from '../../../types/ruler';
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

  return (
    <div
      class={styles.ruler}
      style={{ height: `${props.height}px` }}
      data-testid="vertical-ruler"
    >
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
    </div>
  );
}
