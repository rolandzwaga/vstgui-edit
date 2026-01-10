/**
 * CursorIndicator Component
 *
 * Accent line and tooltip showing current cursor position on ruler.
 * Displays on both horizontal and vertical rulers.
 */

import { Show } from 'solid-js';
import type { CursorIndicatorProps } from '../../../types/ruler';
import styles from './CursorIndicator.module.css';

export function CursorIndicator(props: CursorIndicatorProps) {
  const axisLabel = () => (props.orientation === 'horizontal' ? 'X' : 'Y');
  const roundedValue = () => Math.round(props.canvasValue);

  const positionStyle = () => {
    if (props.orientation === 'horizontal') {
      return { left: `${props.screenPosition}px` };
    }
    return { top: `${props.screenPosition}px` };
  };

  const indicatorClass = () =>
    props.orientation === 'horizontal'
      ? styles.indicatorHorizontal
      : styles.indicatorVertical;

  const tooltipClass = () =>
    props.orientation === 'horizontal'
      ? styles.tooltipHorizontal
      : styles.tooltipVertical;

  return (
    <Show when={props.visible}>
      <div
        class={`${styles.indicator} ${indicatorClass()}`}
        style={positionStyle()}
        data-testid="cursor-indicator"
      >
        <span
          class={`${styles.tooltip} ${tooltipClass()}`}
          data-testid="cursor-tooltip"
        >
          {axisLabel()}: {roundedValue()}
        </span>
      </div>
    </Show>
  );
}
