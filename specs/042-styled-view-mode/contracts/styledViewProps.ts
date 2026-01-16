/**
 * Styled View Props Contract
 *
 * Functions for building styled view properties from uidesc attributes.
 * Location: src/domain/viewMode/styledViewProps.ts
 */

import type { ViewAttributes, ColorsDefinition } from '../../types/uidesc';
import type { StyledViewProps, ResolvedColor } from '../../types/viewMode';

// =============================================================================
// Styled Props Builder
// =============================================================================

/**
 * Builds styled view properties from uidesc view attributes.
 *
 * Resolves all color references and determines rendering mode.
 *
 * @param attributes - The view's attributes from uidesc
 * @param documentColors - The document's colors definition map
 * @returns StyledViewProps for use in rendering
 *
 * @example
 * const props = buildStyledViewProps(
 *   { class: 'CViewContainer', 'background-color': '#FF0000FF' },
 *   {}
 * );
 * // Returns:
 * // {
 * //   backgroundColor: 'rgba(255, 0, 0, 1.00)',
 * //   frameColor: null,
 * //   frameWidth: 1,
 * //   isTransparent: false,
 * //   opacity: 1.0,
 * //   useWireframeFallback: false
 * // }
 */
export declare function buildStyledViewProps(
  attributes: ViewAttributes,
  documentColors: ColorsDefinition | undefined
): StyledViewProps;

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
export declare function shouldUseWireframeFallback(
  backgroundColor: ResolvedColor,
  isTransparent: boolean
): boolean;

/**
 * Parses the frame-width attribute to a number.
 *
 * @param frameWidthAttr - The frame-width attribute value
 * @returns Frame width in pixels (default 1, minimum 0)
 */
export declare function parseFrameWidth(frameWidthAttr: string | undefined): number;

/**
 * Parses the opacity attribute to a number.
 *
 * @param opacityAttr - The opacity attribute value
 * @returns Opacity value clamped to 0.0-1.0 range (default 1.0)
 */
export declare function parseOpacity(opacityAttr: string | undefined): number;

/**
 * Parses the transparent attribute to a boolean.
 *
 * @param transparentAttr - The transparent attribute value
 * @returns True if transparent="true"
 */
export declare function parseTransparent(transparentAttr: string | undefined): boolean;

// =============================================================================
// Batch Processing
// =============================================================================

/**
 * Builds styled props for multiple views efficiently.
 *
 * Caches resolved document colors for performance.
 *
 * @param viewsAttributes - Array of view attributes
 * @param documentColors - The document's colors definition map
 * @returns Map of view attributes to StyledViewProps
 */
export declare function buildStyledViewPropsMap(
  viewsAttributes: Array<{ id: string; attributes: ViewAttributes }>,
  documentColors: ColorsDefinition | undefined
): Map<string, StyledViewProps>;
