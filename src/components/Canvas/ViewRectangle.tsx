import type { Component } from 'solid-js';
import type { RenderableView } from '../../types/canvas';
import styles from './Canvas.module.css';

export interface ViewRectangleProps {
  view: RenderableView;
}

/**
 * Renders a single view as an SVG group containing a rectangle.
 * Labels will be added in US3.
 */
export const ViewRectangle: Component<ViewRectangleProps> = (props) => {
  return (
    <g data-testid={`view-${props.view.id}`} data-view-id={props.view.id}>
      <rect
        class={`${styles.viewRect} ${styles[props.view.category]}`}
        x={props.view.absoluteX}
        y={props.view.absoluteY}
        width={props.view.width}
        height={props.view.height}
      />
    </g>
  );
};
