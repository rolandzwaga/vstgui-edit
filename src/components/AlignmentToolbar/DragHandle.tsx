/**
 * DragHandle Component
 *
 * A draggable handle for undocking the toolbar into a floating panel.
 */

import type { Component } from 'solid-js';
import styles from './AlignmentToolbar.module.css';

export interface DragHandleProps {
  /** Called when drag starts with minimum distance threshold */
  onDragStart?: (startX: number, startY: number) => void;
}

/**
 * DragHandle - A grip handle that can be dragged to undock the toolbar.
 *
 * Displays a 2x3 dot pattern as a visual affordance for dragging.
 */
export const DragHandle: Component<DragHandleProps> = () => {
  return (
    <div class={styles.dragHandle} aria-hidden="true">
      <div class={styles.dragHandleIcon}>
        <div class={styles.dragHandleRow}>
          <span class={styles.dragHandleDot} />
          <span class={styles.dragHandleDot} />
        </div>
        <div class={styles.dragHandleRow}>
          <span class={styles.dragHandleDot} />
          <span class={styles.dragHandleDot} />
        </div>
        <div class={styles.dragHandleRow}>
          <span class={styles.dragHandleDot} />
          <span class={styles.dragHandleDot} />
        </div>
      </div>
    </div>
  );
};
