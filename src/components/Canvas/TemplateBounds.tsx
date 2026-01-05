import type { Component } from 'solid-js';
import type { TemplateBounds as TemplateBoundsType } from '../../types/canvas';
import styles from './Canvas.module.css';

export interface TemplateBoundsProps {
  bounds: TemplateBoundsType;
}

/**
 * Renders the template bounds indicator as a dashed rectangle at the origin.
 * This shows the overall dimensions of the template.
 */
export const TemplateBounds: Component<TemplateBoundsProps> = (props) => {
  return (
    <g data-testid="template-bounds">
      <rect
        class={styles.templateBounds}
        x={0}
        y={0}
        width={props.bounds.width}
        height={props.bounds.height}
      />
    </g>
  );
};
