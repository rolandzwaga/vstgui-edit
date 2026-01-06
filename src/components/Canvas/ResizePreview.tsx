import type { Component } from 'solid-js';
import { Show } from 'solid-js';
import { resizeStore } from '../../stores/resizeStore';
import styles from './ResizePreview.module.css';

export const ResizePreview: Component = () => {
  return (
    <Show when={resizeStore.isResizing}>
      <rect
        data-testid="resize-preview"
        class={styles.preview}
        x={resizeStore.newOrigin.x}
        y={resizeStore.newOrigin.y}
        width={resizeStore.newSize.width}
        height={resizeStore.newSize.height}
      />
    </Show>
  );
};
