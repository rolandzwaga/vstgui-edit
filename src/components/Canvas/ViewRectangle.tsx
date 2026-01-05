import { Show, type Component } from 'solid-js';
import type { RenderableView } from '../../types/canvas';
import styles from './Canvas.module.css';

/** Minimum width in pixels to show label */
const MIN_WIDTH_FOR_LABEL = 60;
/** Minimum height in pixels to show label */
const MIN_HEIGHT_FOR_LABEL = 20;
/** Padding from left edge for label */
const LABEL_PADDING_X = 4;
/** Vertical offset for label (from top) */
const LABEL_OFFSET_Y = 14;

export interface ViewRectangleProps {
  view: RenderableView;
}

/**
 * Renders a single view as an SVG group containing a rectangle and label.
 */
export const ViewRectangle: Component<ViewRectangleProps> = (props) => {
  const shouldShowLabel = () =>
    props.view.width >= MIN_WIDTH_FOR_LABEL && props.view.height >= MIN_HEIGHT_FOR_LABEL;

  return (
    <g data-testid={`view-${props.view.id}`} data-view-id={props.view.id}>
      <rect
        class={`${styles.viewRect} ${styles[props.view.category]}`}
        x={props.view.absoluteX}
        y={props.view.absoluteY}
        width={props.view.width}
        height={props.view.height}
      />
      <Show when={shouldShowLabel()}>
        <text
          class={styles.viewLabel}
          x={props.view.absoluteX + LABEL_PADDING_X}
          y={props.view.absoluteY + LABEL_OFFSET_Y}
        >
          {props.view.label}
        </text>
      </Show>
    </g>
  );
};
