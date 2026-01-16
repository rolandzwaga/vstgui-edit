import type { Component } from 'solid-js';
import { Show } from 'solid-js';
import { resizeStore } from '../../stores/resizeStore';
import styles from './ResizePreview.module.css';

export const ResizePreview: Component = () => {
  // Calculate absolute position by adding parent offset to relative origin
  const absoluteX = () => resizeStore.newOrigin.x + resizeStore.parentOffset.x;
  const absoluteY = () => resizeStore.newOrigin.y + resizeStore.parentOffset.y;

  return (
    <Show when={resizeStore.isResizing}>
      <rect
        data-testid="resize-preview"
        class={styles.preview}
        x={absoluteX()}
        y={absoluteY()}
        width={resizeStore.newSize.width}
        height={resizeStore.newSize.height}
      />
    </Show>
  );
};
