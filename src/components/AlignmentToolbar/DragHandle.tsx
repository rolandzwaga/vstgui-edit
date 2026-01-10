/**
 * DragHandle Component
 *
 * A draggable handle for undocking the toolbar into a floating panel.
 * Requires a minimum 20px drag distance before triggering undock (FR-015a).
 */

import { type Component, createSignal, onCleanup } from 'solid-js';
import type { Point } from '../../types/canvas';
import styles from './AlignmentToolbar.module.css';

/**
 * Minimum drag distance in pixels before undocking (FR-015a).
 */
export const UNDOCK_THRESHOLD = 20;

export interface DragHandleProps {
  /** Called when drag exceeds 20px threshold */
  onUndock?: (position: Point) => void;
}

/**
 * DragHandle - A grip handle that can be dragged to undock the toolbar.
 *
 * Displays a 2x3 dot pattern as a visual affordance for dragging.
 * Requires 20px minimum drag distance before triggering undock.
 */
export const DragHandle: Component<DragHandleProps> = (props) => {
  const [isDragging, setIsDragging] = createSignal(false);
  let startPoint: Point | null = null;

  const handleMouseDown = (e: MouseEvent): void => {
    if (e.button !== 0) return; // Only left click
    e.preventDefault();

    startPoint = { x: e.clientX, y: e.clientY };
    setIsDragging(true);

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleMouseMove = (e: MouseEvent): void => {
    if (!startPoint || !isDragging()) return;

    const dx = e.clientX - startPoint.x;
    const dy = e.clientY - startPoint.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance >= UNDOCK_THRESHOLD) {
      // Trigger undock at current mouse position (offset for panel)
      props.onUndock?.({ x: e.clientX - 50, y: e.clientY - 10 });
      cleanup();
    }
  };

  const handleMouseUp = (): void => {
    cleanup();
  };

  const cleanup = (): void => {
    setIsDragging(false);
    startPoint = null;
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  };

  onCleanup(cleanup);

  return (
    <div
      class={styles.dragHandle}
      onMouseDown={handleMouseDown}
      data-testid="drag-handle"
      title="Drag to undock toolbar"
      aria-hidden="true"
    >
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
