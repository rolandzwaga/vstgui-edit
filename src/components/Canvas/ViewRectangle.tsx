import { Show, type Component } from 'solid-js';
import type { RenderableView } from '../../types/canvas';
import styles from './Canvas.module.css';

/** Padding from left edge for title */
const TITLE_PADDING_X = 4;

export interface ViewRectangleProps {
  view: RenderableView;
}

/**
 * Renders a single view as an SVG group containing a rectangle.
 * For views with a title attribute (e.g., CTextLabel), displays the title text.
 */
export const ViewRectangle: Component<ViewRectangleProps> = (props) => {

  /**
   * Computes the vertical offset for title text.
   * Uses font size if available, otherwise defaults to TITLE_OFFSET_Y.
   */
  const titleOffsetY = () => {
    const fontSize = props.view.fontSize ?? 10;
    // Position text with baseline roughly in the middle-ish of the view
    return Math.min(fontSize + 2, props.view.height - 2);
  };

  return (
    <g data-testid={`view-${props.view.id}`} data-view-id={props.view.id}>
      <rect
        class={`${styles.viewRect} ${styles[props.view.category]}`}
        x={props.view.absoluteX}
        y={props.view.absoluteY}
        width={props.view.width}
        height={props.view.height}
      />
      <Show when={props.view.title}>
        <text
          x={props.view.absoluteX + TITLE_PADDING_X}
          y={props.view.absoluteY + titleOffsetY()}
          font-size={String(props.view.fontSize ?? 10)}
          fill={props.view.fontColor ?? 'var(--color-text-primary)'}
          pointer-events="none"
        >
          {props.view.title}
        </text>
      </Show>
    </g>
  );
};
