import { Show, type Component } from 'solid-js';
import type { RenderableView } from '../../types/canvas';
import { isSelected, selectionStore, setHovered } from '../../stores/selectionStore';
import { isAncestorOfSelected } from '../../domain/canvas/ancestors';
import styles from './Canvas.module.css';

/** Padding from left edge for title */
const TITLE_PADDING_X = 4;

export interface ViewRectangleProps {
  view: RenderableView;
  /** All views in the hierarchy for ancestor calculation */
  allViews?: RenderableView[];
}

/**
 * Renders a single view as an SVG group containing a rectangle.
 * For views with a title attribute (e.g., CTextLabel), displays the title text.
 * Supports selection and hover states with visual feedback.
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

  /**
   * Check if this view is currently hovered.
   */
  const isHovered = () => selectionStore.hoveredId === props.view.id;

  /**
   * Check if this view is an ancestor of any selected view (FR-012).
   */
  const isParentOfSelected = () => {
    if (!props.allViews || props.allViews.length === 0) {
      return false;
    }
    return isAncestorOfSelected(props.view.id, selectionStore.selectedIds, props.allViews);
  };

  /**
   * Builds the CSS class string based on category, selection, hover, and parent state.
   */
  const rectClass = () => {
    const classes = [styles.viewRect, styles[props.view.category]];
    if (isSelected(props.view.id)) {
      classes.push(styles.selected);
    } else if (isParentOfSelected()) {
      // Parent highlight only when not selected itself
      classes.push(styles.parentOfSelected);
    }
    if (isHovered() && !isSelected(props.view.id)) {
      classes.push(styles.hovered);
    }
    return classes.join(' ');
  };

  /**
   * Handle mouse enter - set hover state (FR-010)
   */
  const handleMouseEnter = () => {
    setHovered(props.view.id);
  };

  /**
   * Handle mouse leave - clear hover state
   */
  const handleMouseLeave = () => {
    setHovered(null);
  };

  return (
    <g data-testid={`view-${props.view.id}`} data-view-id={props.view.id}>
      <rect
        data-testid={`view-rect-${props.view.id}`}
        class={rectClass()}
        x={props.view.absoluteX}
        y={props.view.absoluteY}
        width={props.view.width}
        height={props.view.height}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
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
