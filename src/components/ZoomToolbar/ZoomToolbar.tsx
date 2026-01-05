import { type Component, createMemo } from 'solid-js';
import { canvasStore, resetZoom, zoomIn, zoomOut } from '../../stores/canvasStore';
import { formatZoomPercent, MAX_ZOOM, MIN_ZOOM } from '../../domain/canvas/zoom';
import styles from './ZoomToolbar.module.css';

export interface ZoomToolbarProps {
  /** Callback when Fit button is clicked. Caller should invoke fitToView with viewport/template sizes. */
  onFitToView?: () => void;
}

/**
 * ZoomToolbar - Displays current zoom level and provides zoom controls.
 *
 * Features:
 * - Zoom percentage display (FR-001)
 * - Zoom in (+) button (FR-002)
 * - Zoom out (-) button (FR-003)
 * - Fit to view button (FR-004)
 * - Reset to 100% button (FR-005)
 * - Disabled states at zoom limits (FR-012)
 */
export const ZoomToolbar: Component<ZoomToolbarProps> = (props) => {
  // Derive disabled states based on zoom limits
  const isZoomInDisabled = createMemo(() => canvasStore.zoomLevel >= MAX_ZOOM);
  const isZoomOutDisabled = createMemo(() => canvasStore.zoomLevel <= MIN_ZOOM);

  return (
    <div class={styles.toolbar} role="toolbar" aria-label="Zoom controls">
      <button
        type="button"
        class={styles.button}
        onClick={() => zoomOut()}
        aria-label="Zoom out"
        disabled={isZoomOutDisabled()}
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
        disabled={isZoomInDisabled()}
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

      <button
        type="button"
        class={styles.button}
        onClick={() => props.onFitToView?.()}
        aria-label="Fit to view"
      >
        Fit
      </button>
    </div>
  );
};
