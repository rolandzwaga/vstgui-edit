import type { RenderableView } from '../../types/canvas';
import type { ViewDefinition } from '../../types/uidesc';
import { parsePoint, parseSize } from './coordinates';
import { getViewCategory } from './viewCategory';

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
