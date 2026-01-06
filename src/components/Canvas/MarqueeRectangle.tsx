import type { Component } from 'solid-js';
import { createMemo, Show } from 'solid-js';
import { marqueeStore } from '../../stores/marqueeStore';
import { normalizeRect } from '../../domain/canvas/marquee';
import styles from './Canvas.module.css';

export const MarqueeRectangle: Component = () => {
  const rect = createMemo(() => {
    const start = marqueeStore.startPoint;
    const current = marqueeStore.currentPoint;
    if (!start || !current) return null;
    return normalizeRect(start, current);
  });

  return (
    <Show when={rect()}>
      {(r) => (
        <rect
          class={styles.marqueeRect}
          x={r().x}
          y={r().y}
          width={r().width}
          height={r().height}
          data-testid="marquee-rect"
        />
      )}
    </Show>
  );
};
