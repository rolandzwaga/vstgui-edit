import type { Component } from 'solid-js';
import { canvasStore, resetZoom, zoomIn, zoomOut } from '../../stores/canvasStore';
import { formatZoomPercent } from '../../domain/canvas/zoom';
import styles from './ZoomToolbar.module.css';

/**
 * ZoomToolbar - Displays current zoom level and provides zoom controls.
 *
 * Features:
 * - Zoom percentage display (FR-001)
 * - Zoom in (+) button (FR-002)
 * - Zoom out (-) button (FR-003)
 * - Reset to 100% button (FR-005)
 */
export const ZoomToolbar: Component = () => {
  return (
    <div class={styles.toolbar} role="toolbar" aria-label="Zoom controls">
      <button
        type="button"
        class={styles.button}
        onClick={() => zoomOut()}
        aria-label="Zoom out"
      >
        −
      </button>

      <span class={styles.zoomLevel} role="status" aria-live="polite">
        {formatZoomPercent(canvasStore.zoomLevel)}
      </span>

      <button
        type="button"
        class={styles.button}
        onClick={() => zoomIn()}
        aria-label="Zoom in"
      >
        +
      </button>

      <button
        type="button"
        class={styles.button}
        onClick={() => resetZoom()}
        aria-label="Reset zoom to 100%"
      >
        100%
      </button>
    </div>
  );
};
