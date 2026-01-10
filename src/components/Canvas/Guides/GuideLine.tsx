/**
 * GuideLine Component
 *
 * Renders a single custom guide line on the canvas.
 * Horizontal guides span full canvas width at fixed Y.
 * Vertical guides span full canvas height at fixed X.
 */

import { canvasStore } from '../../../stores/canvasStore';
import type { CustomGuide } from '../../../types/guides';
import styles from './GuideLine.module.css';

export interface GuideLineProps {
  /** The guide to render */
  guide: CustomGuide;
  /** Canvas width in canvas coordinates */
  canvasWidth: number;
  /** Canvas height in canvas coordinates */
  canvasHeight: number;
  /** Optional: callback when guide is clicked */
  onClick?: (guideId: string) => void;
  /** Optional: callback when mousedown for reposition drag */
  onMouseDown?: (guideId: string, e: MouseEvent) => void;
  /** Optional: callback when guide is double-clicked (for deletion) */
  onDblClick?: (guideId: string) => void;
  /** Optional: callback when guide is right-clicked (for precise repositioning) */
  onContextMenu?: (guideId: string, e: MouseEvent) => void;
}

export function GuideLine(props: GuideLineProps) {
  // Zoom-invariant stroke width (1px on screen regardless of zoom)
  const strokeWidth = () => 1 / canvasStore.zoomLevel;
  // Zoom-invariant dash array
  const dashArray = () => {
    const unit = 4 / canvasStore.zoomLevel;
    return `${unit} ${unit}`;
  };

  const handleClick = (e: MouseEvent) => {
    if (props.onClick) {
      e.stopPropagation();
      props.onClick(props.guide.id);
    }
  };

  const handleMouseDown = (e: MouseEvent) => {
    if (props.onMouseDown && e.button === 0) {
      e.stopPropagation();
      props.onMouseDown(props.guide.id, e);
    }
  };

  const handleDblClick = (e: MouseEvent) => {
    if (props.onDblClick) {
      e.stopPropagation();
      props.onDblClick(props.guide.id);
    }
  };

  const handleContextMenu = (e: MouseEvent) => {
    if (props.onContextMenu) {
      e.stopPropagation();
      e.preventDefault();
      props.onContextMenu(props.guide.id, e);
    }
  };

  const isHorizontal = () => props.guide.orientation === 'horizontal';

  return (
    <g
      data-testid={`guide-${props.guide.id}`}
      data-orientation={props.guide.orientation}
      class={styles.guideLine}
      onClick={handleClick}
      onMouseDown={handleMouseDown}
      onDblClick={handleDblClick}
      onContextMenu={handleContextMenu}
    >
      {isHorizontal() ? (
        <line
          x1={0}
          y1={props.guide.position}
          x2={props.canvasWidth}
          y2={props.guide.position}
          stroke="var(--color-custom-guide, #00bfff)"
          stroke-width={strokeWidth()}
          stroke-dasharray={dashArray()}
          class={styles.line}
        />
      ) : (
        <line
          x1={props.guide.position}
          y1={0}
          x2={props.guide.position}
          y2={props.canvasHeight}
          stroke="var(--color-custom-guide, #00bfff)"
          stroke-width={strokeWidth()}
          stroke-dasharray={dashArray()}
          class={styles.line}
        />
      )}
      {/* Invisible hit area for easier clicking/dragging */}
      {isHorizontal() ? (
        <line
          x1={0}
          y1={props.guide.position}
          x2={props.canvasWidth}
          y2={props.guide.position}
          stroke="transparent"
          stroke-width={8 / canvasStore.zoomLevel}
          class={styles.hitArea}
        />
      ) : (
        <line
          x1={props.guide.position}
          y1={0}
          x2={props.guide.position}
          y2={props.canvasHeight}
          stroke="transparent"
          stroke-width={8 / canvasStore.zoomLevel}
          class={styles.hitArea}
        />
      )}
    </g>
  );
}
