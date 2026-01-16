/**
 * Styled View Props
 *
 * Functions for building styled view properties from uidesc attributes.
 */

import type { ColorsDefinition, ViewAttributes } from '../../types/uidesc';
import type { ResolvedColor, StyledViewProps } from '../../types/viewMode';
import { resolveColor } from './colorResolution';

/**
 * Parses the frame-width attribute to a number.
 *
 * @param frameWidthAttr - The frame-width attribute value
 * @returns Frame width in pixels (default 1, minimum 0)
 */
export function parseFrameWidth(frameWidthAttr: string | undefined): number {
  if (frameWidthAttr === undefined || frameWidthAttr === '') {
    return 1;
  }

  const parsed = Number.parseFloat(frameWidthAttr);
  if (Number.isNaN(parsed)) {
    return 1;
  }

  return Math.max(0, parsed);
}

/**
 * Parses the opacity attribute to a number.
 *
 * @param opacityAttr - The opacity attribute value
 * @returns Opacity value clamped to 0.0-1.0 range (default 1.0)
 */
export function parseOpacity(opacityAttr: string | undefined): number {
  if (opacityAttr === undefined || opacityAttr === '') {
    return 1.0;
  }

  const parsed = Number.parseFloat(opacityAttr);
  if (Number.isNaN(parsed)) {
    return 1.0;
  }

  return Math.max(0.0, Math.min(1.0, parsed));
}

/**
 * Parses the transparent attribute to a boolean.
 *
 * @param transparentAttr - The transparent attribute value
 * @returns True if transparent="true"
 */
export function parseTransparent(transparentAttr: string | undefined): boolean {
  return transparentAttr === 'true';
}

/**
 * Determines if a view should use wireframe fallback in styled mode.
 *
 * Wireframe fallback is used when:
 * - No background-color is defined
 * - background-color references a non-existent color
 * - View is not explicitly transparent
 *
 * @param backgroundColor - Resolved background color (or null)
 * @param isTransparent - Whether view has transparent="true"
 * @returns True if wireframe fallback should be used
 */
export function shouldUseWireframeFallback(
  backgroundColor: ResolvedColor,
  isTransparent: boolean
): boolean {
  // If the view is explicitly transparent, it's intentionally without fill
  if (isTransparent) {
    return false;
  }

  // If background color is resolved, no wireframe fallback needed
  if (backgroundColor !== null) {
    return false;
  }

  // No background color and not transparent -> use wireframe fallback
  return true;
}

/**
 * Builds styled view properties from uidesc view attributes.
 *
 * Resolves all color references and determines rendering mode.
 *
 * @param attributes - The view's attributes from uidesc
 * @param documentColors - The document's colors definition map
 * @returns StyledViewProps for use in rendering
 */
export function buildStyledViewProps(
  attributes: ViewAttributes,
  documentColors: ColorsDefinition | undefined
): StyledViewProps {
  const backgroundColor = resolveColor(attributes['background-color'], documentColors);
  const frameColor = resolveColor(attributes['frame-color'], documentColors);
  const frameWidth = parseFrameWidth(attributes['frame-width']);
  const isTransparent = parseTransparent(attributes.transparent);
  const opacity = parseOpacity(attributes.opacity);
  const useWireframeFallback = shouldUseWireframeFallback(backgroundColor, isTransparent);

  return {
    backgroundColor,
    frameColor,
    frameWidth,
    isTransparent,
    opacity,
    useWireframeFallback,
  };
}

/**
 * Builds styled props for multiple views efficiently.
 *
 * Caches resolved document colors for performance.
 *
 * @param viewsAttributes - Array of view attributes
 * @param documentColors - The document's colors definition map
 * @returns Map of view ID to StyledViewProps
 */
export function buildStyledViewPropsMap(
  viewsAttributes: Array<{ id: string; attributes: ViewAttributes }>,
  documentColors: ColorsDefinition | undefined
): Map<string, StyledViewProps> {
  const map = new Map<string, StyledViewProps>();

  for (const { id, attributes } of viewsAttributes) {
    map.set(id, buildStyledViewProps(attributes, documentColors));
  }

  return map;
}
