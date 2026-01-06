/**
 * HoverTooltip Component
 *
 * Displays a tooltip with view class name and dimensions.
 * Positioned near the mouse cursor.
 */
import type { Component } from 'solid-js';
import type { RenderableView } from '../../types/canvas';
import styles from './HoverTooltip.module.css';

export interface HoverTooltipProps {
  view: RenderableView;
  x: number;
  y: number;
}

/**
 * Renders a tooltip showing view information.
 * Format: "ClassName (W×H)" per FR-011
 */
export const HoverTooltip: Component<HoverTooltipProps> = (props) => {
  // Offset tooltip from cursor to avoid overlap
  const OFFSET_X = 12;
  const OFFSET_Y = 12;

  return (
    <div
      data-testid="hover-tooltip"
      class={styles.tooltip}
      role="tooltip"
      aria-live="polite"
      style={{
        left: `${props.x + OFFSET_X}px`,
        top: `${props.y + OFFSET_Y}px`,
      }}
    >
      {props.view.className} ({props.view.width}×{props.view.height})
    </div>
  );
};
