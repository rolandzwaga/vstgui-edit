/**
 * SelectionOverlay Component
 *
 * Renders a selection border and 8 resize handles around a selected view.
 * Handles are positioned at corners and edge midpoints.
 * Resize functionality is triggered via onResizeStart callback.
 * Shows lock indicator for locked views.
 */
import { Show, type Component } from 'solid-js';
import { isLocked } from '../../stores/lockHideStore';
import type { RenderableView } from '../../types/canvas';
import { HANDLE_CURSORS, HANDLE_SIZE, type HandlePosition } from '../../types/selection';
import { LockIndicator } from './LockIndicator';
import styles from './SelectionOverlay.module.css';

export interface SelectionOverlayProps {
  view: RenderableView;
  /** Callback when resize is initiated via handle mousedown */
  onResizeStart?: (handle: HandlePosition, view: RenderableView) => void;
}

/**
 * Handle positions with their relative coordinates.
 * Uses compass directions: nw, n, ne, e, se, s, sw, w
 */
const HANDLE_POSITIONS_CONFIG: Array<{
  position: HandlePosition;
  getX: (x: number, w: number) => number;
  getY: (y: number, h: number) => number;
}> = [
  { position: 'nw', getX: (x) => x, getY: (y) => y },
  { position: 'n', getX: (x, w) => x + w / 2, getY: (y) => y },
  { position: 'ne', getX: (x, w) => x + w, getY: (y) => y },
  { position: 'w', getX: (x) => x, getY: (y, h) => y + h / 2 },
  { position: 'e', getX: (x, w) => x + w, getY: (y, h) => y + h / 2 },
  { position: 'sw', getX: (x) => x, getY: (y, h) => y + h },
  { position: 's', getX: (x, w) => x + w / 2, getY: (y, h) => y + h },
  { position: 'se', getX: (x, w) => x + w, getY: (y, h) => y + h },
];

/**
 * Renders selection overlay with border and resize handles.
 * For locked views, shows a lock indicator and hides resize handles.
 */
export const SelectionOverlay: Component<SelectionOverlayProps> = (props) => {
  const handleRadius = HANDLE_SIZE / 2;
  const viewIsLocked = () => isLocked(props.view.id);

  return (
    <g
      data-testid={`selection-overlay-${props.view.id}`}
      class={styles.selectionOverlay}
      role="group"
      aria-label={`Selected: ${props.view.className} (${props.view.width}×${props.view.height})${viewIsLocked() ? ' (locked)' : ''}`}
    >
      {/* Selection border */}
      <rect
        data-role="selection-border"
        class={viewIsLocked() ? `${styles.selectionBorder} ${styles.locked}` : styles.selectionBorder}
        x={props.view.absoluteX}
        y={props.view.absoluteY}
        width={props.view.width}
        height={props.view.height}
        aria-hidden="true"
      />

      {/* Resize handles - hidden for locked views */}
      <Show when={!viewIsLocked()}>
        {HANDLE_POSITIONS_CONFIG.map((handle) => (
          <circle
            data-role="resize-handle"
            data-position={handle.position}
            class={styles.resizeHandle}
            cx={handle.getX(props.view.absoluteX, props.view.width)}
            cy={handle.getY(props.view.absoluteY, props.view.height)}
            r={handleRadius}
            style={{ cursor: HANDLE_CURSORS[handle.position] }}
            aria-hidden="true"
            onMouseDown={(e: MouseEvent) => {
              if (e.button !== 0) return;
              e.stopPropagation();
              props.onResizeStart?.(handle.position, props.view);
            }}
          />
        ))}
      </Show>

      {/* Lock indicator - shown for locked views */}
      <Show when={viewIsLocked()}>
        <LockIndicator
          x={props.view.absoluteX + props.view.width}
          y={props.view.absoluteY}
        />
      </Show>
    </g>
  );
};
