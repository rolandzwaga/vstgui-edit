import { Show, type Component } from 'solid-js';
import type { RenderableView } from '../../types/canvas';
import type { StyledViewProps } from '../../types/viewMode';
import { isSelected, selectionStore, setHovered } from '../../stores/selectionStore';
import { viewModeStore } from '../../stores/viewModeStore';
import { isAncestorOfSelected } from '../../domain/canvas/ancestors';
import styles from './Canvas.module.css';

/** Padding from left edge for title */
const TITLE_PADDING_X = 4;

export interface ViewRectangleProps {
  view: RenderableView;
  /** All views in the hierarchy for ancestor calculation */
  allViews?: RenderableView[];
  /** Styled rendering props for styled mode */
  styledProps?: StyledViewProps;
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
   * In styled mode with actual colors, omits the category class to prevent CSS override.
   */
  const rectClass = () => {
    const classes = [styles.viewRect];
    // Only add category class if NOT using styled rendering (CSS would override inline styles)
    if (!useStyledRendering()) {
      classes.push(styles[props.view.category]);
    }
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

  /**
   * Checks if we're in styled mode with styledProps available.
   */
  const isInStyledMode = () => {
    return viewModeStore.mode === 'styled' && props.styledProps !== undefined;
  };

  /**
   * Determines if styled rendering should be used for fill.
   * True when in styled mode AND styledProps are provided AND not using wireframe fallback.
   */
  const useStyledRendering = () => {
    return isInStyledMode() && !props.styledProps!.useWireframeFallback;
  };

  /**
   * Gets the fill attribute for the rect.
   * - Transparent views: fill = 'none'
   * - Styled rendering: uses resolved background color
   * - Wireframe mode/fallback: undefined (CSS handles it)
   */
  const getFill = () => {
    // Check for transparent views first
    if (isInStyledMode() && props.styledProps?.isTransparent) {
      return 'none';
    }

    if (useStyledRendering() && props.styledProps?.backgroundColor) {
      return props.styledProps.backgroundColor;
    }
    return undefined;
  };

  /**
   * Gets the stroke attribute for the rect.
   * In styled mode, uses the resolved frame color (even for wireframe fallback).
   * In wireframe mode, returns undefined to let CSS handle it.
   */
  const getStroke = () => {
    if (isInStyledMode() && props.styledProps?.frameColor) {
      return props.styledProps.frameColor;
    }
    return undefined;
  };

  /**
   * Gets the stroke-width attribute for the rect.
   * In styled mode, uses the frame width from styledProps (even for wireframe fallback).
   * In wireframe mode, returns undefined to let CSS handle it.
   */
  const getStrokeWidth = () => {
    if (isInStyledMode() && props.styledProps?.frameColor) {
      return props.styledProps.frameWidth;
    }
    return undefined;
  };

  /**
   * Gets the opacity attribute for the group element.
   * Only applies when opacity is not 1.0 (to avoid cluttering the DOM).
   */
  const getGroupOpacity = () => {
    if (isInStyledMode() && props.styledProps?.opacity !== undefined && props.styledProps.opacity < 1.0) {
      return props.styledProps.opacity;
    }
    return undefined;
  };

  /**
   * Gets the inline style object for styled mode rendering.
   * Uses inline style to override CSS class styles with highest specificity.
   */
  const getRectStyle = (): Record<string, string> | undefined => {
    if (!isInStyledMode()) {
      return undefined;
    }

    const style: Record<string, string> = {};

    // Handle transparent views
    if (props.styledProps?.isTransparent) {
      style.fill = 'none';
      return style;
    }

    // Handle styled rendering (has background color)
    if (useStyledRendering() && props.styledProps?.backgroundColor) {
      style.fill = props.styledProps.backgroundColor;
      style['fill-opacity'] = '1'; // Override .viewRect fill-opacity: 0.1
    }

    // Apply frame color/width in styled mode (both for styled and wireframe fallback)
    if (props.styledProps?.frameColor) {
      style.stroke = props.styledProps.frameColor;
      style['stroke-width'] = String(props.styledProps.frameWidth ?? 1);
    }

    return Object.keys(style).length > 0 ? style : undefined;
  };

  return (
    <g data-testid={`view-${props.view.id}`} data-view-id={props.view.id} opacity={getGroupOpacity()}>
      <rect
        data-testid={`view-rect-${props.view.id}`}
        class={rectClass()}
        x={props.view.absoluteX}
        y={props.view.absoluteY}
        width={props.view.width}
        height={props.view.height}
        style={getRectStyle()}
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
