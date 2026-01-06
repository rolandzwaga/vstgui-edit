import type { Component } from 'solid-js';
import { Show } from 'solid-js';
import { resizeStore } from '../../stores/resizeStore';
import styles from './DimensionIndicator.module.css';

export const DimensionIndicator: Component = () => {
  const dimensionText = () => {
    const width = Math.round(resizeStore.newSize.width);
    const height = Math.round(resizeStore.newSize.height);
    return `${width} × ${height}`;
  };

  const indicatorStyle = () => {
    const x = resizeStore.newOrigin.x + resizeStore.newSize.width + 8;
    const y = resizeStore.newOrigin.y + resizeStore.newSize.height + 8;
    return {
      left: `${x}px`,
      top: `${y}px`,
    };
  };

  return (
    <Show when={resizeStore.isResizing}>
      <div
        data-testid="dimension-indicator"
        class={styles.indicator}
        style={indicatorStyle()}
      >
        {dimensionText()}
      </div>
    </Show>
  );
};
