import type { RenderableView } from '../../types/canvas';
import type { ColorsDefinition, FontsDefinition, ViewDefinition } from '../../types/uidesc';
import { parsePoint, parseSize } from './coordinates';
import { getViewCategory } from './viewCategory';

/**
 * Options for flattening a view hierarchy.
 */
export interface FlattenOptions {
  /** Font definitions from the uidesc document */
  fonts?: FontsDefinition;
  /** Color definitions from the uidesc document */
  colors?: ColorsDefinition;
}

/**
 * Resolves a color value from the colors definition.
 * Handles hex values, color name references, and predefined colors.
 */
function resolveColor(
  colorRef: string | undefined,
  colors: ColorsDefinition | undefined
): string | undefined {
  if (!colorRef) return undefined;

  // Direct hex color (8 or 6 chars after #)
  if (colorRef.startsWith('#')) {
    // Convert VSTGUI's #RRGGBBAA to CSS rgba or keep as #RRGGBB
    if (colorRef.length === 9) {
      // #RRGGBBAA -> rgba(r, g, b, a)
      const r = Number.parseInt(colorRef.slice(1, 3), 16);
      const g = Number.parseInt(colorRef.slice(3, 5), 16);
      const b = Number.parseInt(colorRef.slice(5, 7), 16);
      const a = Number.parseInt(colorRef.slice(7, 9), 16) / 255;
      return `rgba(${r}, ${g}, ${b}, ${a.toFixed(2)})`;
    }
    return colorRef; // #RRGGBB is valid CSS
  }

  // Predefined VSTGUI color (starts with ~)
  if (colorRef.startsWith('~')) {
    const predefined = colorRef.slice(1).trim();
    // Map common VSTGUI predefined colors
    const predefinedColors: Record<string, string> = {
      BlackCColor: '#000000',
      WhiteCColor: '#FFFFFF',
      RedCColor: '#FF0000',
      GreenCColor: '#00FF00',
      BlueCColor: '#0000FF',
      TransparentCColor: 'transparent',
    };
    return predefinedColors[predefined] ?? '#000000';
  }

  // Look up in colors definition
  if (colors?.[colorRef]) {
    return resolveColor(colors[colorRef], colors);
  }

  return undefined;
}

/**
 * Resolves font size from the fonts definition.
 */
function resolveFontSize(
  fontRef: string | undefined,
  fonts: FontsDefinition | undefined
): number | undefined {
  if (!fontRef || !fonts?.[fontRef]) {
    return undefined;
  }

  const fontDef = fonts[fontRef];
  const size = Number.parseFloat(fontDef.size);
  return Number.isNaN(size) ? undefined : size;
}

/**
 * Flattens a view hierarchy into an array of RenderableViews.
 *
 * Recursively processes the view tree, calculating absolute positions
 * by accumulating parent origins and assigning z-indices in traversal order.
 *
 * @param root - The root ViewDefinition to flatten
 * @param rootId - Optional ID for the root view (defaults to 'view-0')
 * @param options - Optional fonts and colors definitions for resolving styles
 * @returns Array of RenderableViews in render order (parents before children)
 */
export function flattenHierarchy(
  root: ViewDefinition,
  rootId?: string,
  options?: FlattenOptions
): RenderableView[] {
  const views: RenderableView[] = [];
  let viewCounter = 0;

  const processView = (
    view: ViewDefinition,
    viewId: string,
    parentX: number,
    parentY: number,
    zIndex: number,
    parentId: string | null
  ): number => {
    const { attributes, children } = view;
    const origin = parsePoint(attributes.origin);
    const size = parseSize(attributes.size);
    const className = attributes.class as string | undefined;
    const category = getViewCategory(className);
    const title = attributes.title as string | undefined;
    const fontRef = attributes.font as string | undefined;
    const fontColorRef = attributes['font-color'] as string | undefined;

    const absoluteX = parentX + origin.x;
    const absoluteY = parentY + origin.y;

    const renderableView: RenderableView = {
      id: viewId,
      absoluteX,
      absoluteY,
      width: size.width,
      height: size.height,
      className: className ?? 'Unknown',
      category,
      zIndex,
      parentId,
    };

    if (title) {
      renderableView.title = title;
    }

    // Resolve font size and color if options provided
    const fontSize = resolveFontSize(fontRef, options?.fonts);
    if (fontSize !== undefined) {
      renderableView.fontSize = fontSize;
    }

    const fontColor = resolveColor(fontColorRef, options?.colors);
    if (fontColor !== undefined) {
      renderableView.fontColor = fontColor;
    }

    views.push(renderableView);

    let nextZIndex = zIndex + 1;

    // US2: Recursively process children
    if (children) {
      for (const [childKey, childView] of Object.entries(children)) {
        nextZIndex = processView(childView, childKey, absoluteX, absoluteY, nextZIndex, viewId);
      }
    }

    return nextZIndex;
  };

  const id = rootId ?? `view-${viewCounter++}`;
  processView(root, id, 0, 0, 0, null);

  return views;
}
