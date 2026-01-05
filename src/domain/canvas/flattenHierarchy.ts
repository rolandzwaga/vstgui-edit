import type { RenderableView, ViewCategory } from '../../types/canvas';
import type { ViewDefinition } from '../../types/uidesc';
import { parsePoint, parseSize } from './coordinates';

/**
 * Known container view classes
 */
const CONTAINER_CLASSES = new Set([
  'CView',
  'CViewContainer',
  'CLayeredViewContainer',
  'CRowColumnView',
  'CScrollView',
  'CSplitView',
  'CShadowViewContainer',
  'UIViewSwitchContainer',
]);

/**
 * Known control view classes
 */
const CONTROL_CLASSES = new Set([
  'CControl',
  'CTextEdit',
  'CSearchTextEdit',
  'CTextButton',
  'COnOffButton',
  'CCheckBox',
  'CSegmentButton',
  'CKickButton',
  'CRockerSwitch',
  'CVerticalSwitch',
  'CHorizontalSwitch',
  'CMovieButton',
  'CKnob',
  'CAnimKnob',
  'CSlider',
  'CXYPad',
  'COptionMenu',
]);

/**
 * Known display view classes
 */
const DISPLAY_CLASSES = new Set([
  'CTextLabel',
  'CMultiLineTextLabel',
  'CParamDisplay',
  'CVuMeter',
  'CGradientView',
  'CMovieBitmap',
  'CAutoAnimation',
  'CAnimationSplashScreen',
  'CStringListControl',
]);

/**
 * Classifies a view class name into a category for styling.
 */
function getViewCategory(className: string | undefined): ViewCategory {
  if (!className) {
    return 'custom';
  }

  if (CONTAINER_CLASSES.has(className)) {
    return 'container';
  }

  if (CONTROL_CLASSES.has(className)) {
    return 'control';
  }

  if (DISPLAY_CLASSES.has(className)) {
    return 'display';
  }

  return 'custom';
}

/**
 * Flattens a view hierarchy into an array of RenderableViews.
 *
 * Recursively processes the view tree, calculating absolute positions
 * by accumulating parent origins and assigning z-indices in traversal order.
 *
 * @param root - The root ViewDefinition to flatten
 * @param rootId - Optional ID for the root view (defaults to 'view-0')
 * @returns Array of RenderableViews in render order (parents before children)
 */
export function flattenHierarchy(root: ViewDefinition, rootId?: string): RenderableView[] {
  const views: RenderableView[] = [];
  let viewCounter = 0;

  const processView = (
    view: ViewDefinition,
    viewId: string,
    parentX: number,
    parentY: number,
    zIndex: number
  ): number => {
    const { attributes, children } = view;
    const origin = parsePoint(attributes.origin);
    const size = parseSize(attributes.size);
    const className = attributes.class as string | undefined;
    const category = getViewCategory(className);

    const absoluteX = parentX + origin.x;
    const absoluteY = parentY + origin.y;

    views.push({
      id: viewId,
      absoluteX,
      absoluteY,
      width: size.width,
      height: size.height,
      label: className ?? 'Unknown',
      category,
      zIndex,
    });

    let nextZIndex = zIndex + 1;

    // US2: Recursively process children
    if (children) {
      for (const [childKey, childView] of Object.entries(children)) {
        nextZIndex = processView(childView, childKey, absoluteX, absoluteY, nextZIndex);
      }
    }

    return nextZIndex;
  };

  const id = rootId ?? `view-${viewCounter++}`;
  processView(root, id, 0, 0, 0);

  return views;
}
