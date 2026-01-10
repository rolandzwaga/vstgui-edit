/**
 * GuidePreview Component
 *
 * Renders a preview line during guide creation drag from ruler.
 * Shows a dashed line at the current cursor position.
 */

import { Show } from 'solid-js';
import { guidesStore } from '../../../stores/guidesStore';
import { canvasStore } from '../../../stores/canvasStore';
import styles from './GuidePreview.module.css';

export interface GuidePreviewProps {
  /** Canvas width in screen pixels */
  canvasWidth: number;
  /** Canvas height in screen pixels */
  canvasHeight: number;
}

export function GuidePreview(props: GuidePreviewProps) {
  // Get zoom-invariant stroke width (always 1px on screen)
  const strokeWidth = () => 1 / canvasStore.zoomLevel;

  return (
    <Show when={guidesStore.creationDrag}>
      {(drag) => {
        const isHorizontal = () => drag().orientation === 'horizontal';

        return (
          <g data-testid="guide-preview" class={styles.preview}>
            {isHorizontal() ? (
              <line
                x1={0}
                y1={drag().currentPosition}
                x2={props.canvasWidth}
                y2={drag().currentPosition}
                stroke="var(--color-custom-guide, #00bfff)"
                stroke-width={strokeWidth()}
                stroke-dasharray={`${4 / canvasStore.zoomLevel} ${4 / canvasStore.zoomLevel}`}
                class={styles.line}
              />
            ) : (
              <line
                x1={drag().currentPosition}
                y1={0}
                x2={drag().currentPosition}
                y2={props.canvasHeight}
                stroke="var(--color-custom-guide, #00bfff)"
                stroke-width={strokeWidth()}
                stroke-dasharray={`${4 / canvasStore.zoomLevel} ${4 / canvasStore.zoomLevel}`}
                class={styles.line}
              />
            )}
          </g>
        );
      }}
    </Show>
  );
}
