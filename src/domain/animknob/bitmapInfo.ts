/**
 * Bitmap Information Extraction for CAnimKnob
 *
 * Functions to extract filmstrip metadata from view attributes and bitmap definitions.
 */

import type { Bitmap } from '../project/types';
import type { AnimKnobBitmapInfo } from '../../types/animknob';
import type { BitmapDefinition, ViewAttributes } from '../../types/uidesc';
import { isMultiframeBitmap } from '../../types/uidesc';
import { calculateNumFrames } from './frameCalculation';

/**
 * Checks if a view is a CAnimKnob with a bitmap attribute.
 *
 * @param className - View class name
 * @param attributes - View attributes
 * @returns True if view is CAnimKnob with bitmap attribute
 */
export function isAnimKnobWithBitmap(
  className: string,
  attributes: ViewAttributes
): boolean {
  return className === 'CAnimKnob' && typeof attributes.bitmap === 'string';
}

/**
 * Parses the default-value attribute or returns 0.
 *
 * @param attributes - View attributes
 * @returns Default value (0.0 to 1.0)
 */
export function parseDefaultValue(attributes: ViewAttributes): number {
  const defaultVal = attributes['default-value'];
  if (defaultVal === undefined || defaultVal === null) {
    return 0;
  }

  const parsed = parseFloat(String(defaultVal));
  if (Number.isNaN(parsed)) {
    return 0;
  }

  return Math.max(0, Math.min(1, parsed));
}

/**
 * Parses the inverse-bitmap attribute.
 *
 * @param attributes - View attributes
 * @returns True if inverse mode is enabled
 */
export function parseInverseMode(attributes: ViewAttributes): boolean {
  const inverse = attributes['inverse-bitmap'];
  return inverse === 'true';
}

/**
 * Extracts the frame height from bitmap definition.
 *
 * Uses bitmap's multiframe-size attribute (modern approach).
 * Falls back to view height if not a multiframe bitmap.
 *
 * @param bitmapDef - Bitmap definition from document
 * @param viewHeight - Height of the view (fallback)
 * @returns Frame height in pixels
 */
export function extractFrameHeight(
  bitmapDef: string | BitmapDefinition | undefined,
  viewHeight: number
): number {
  // Use multiframe-size from bitmap definition
  if (isMultiframeBitmap(bitmapDef)) {
    const multiframeSize = bitmapDef['multiframe-size'];
    // Format: "width, height"
    const parts = multiframeSize.split(',').map((s) => s.trim());
    if (parts.length >= 2) {
      const height = parseFloat(parts[1]);
      if (!Number.isNaN(height) && height > 0) {
        return height;
      }
    }
  }

  // Fallback: use view height (assumes single frame)
  return viewHeight;
}

/**
 * Extracts the number of frames from bitmap definition.
 *
 * Uses bitmap's multiframe-num-frames attribute (modern approach).
 * Falls back to calculating from bitmap height / frame height.
 *
 * @param bitmapDef - Bitmap definition from document
 * @param totalHeight - Total height of bitmap
 * @param frameHeight - Height of each frame
 * @returns Number of frames
 */
export function extractNumFrames(
  bitmapDef: string | BitmapDefinition | undefined,
  totalHeight: number,
  frameHeight: number
): number {
  // Use multiframe-num-frames from bitmap definition
  if (isMultiframeBitmap(bitmapDef)) {
    const numFramesStr = bitmapDef['multiframe-num-frames'];
    const parsed = parseInt(numFramesStr, 10);
    if (!Number.isNaN(parsed) && parsed > 0) {
      return parsed;
    }
  }

  // Fallback: calculate from dimensions
  return calculateNumFrames(totalHeight, frameHeight);
}

/**
 * Builds complete AnimKnobBitmapInfo from available data.
 *
 * @param bitmapName - Name of the bitmap
 * @param imageUrl - Resolved URL (blob: or data:)
 * @param bitmapDef - Bitmap definition from document
 * @param storedBitmap - Stored bitmap with dimensions
 * @param viewAttributes - View attributes
 * @param viewHeight - View height for fallback frame height
 * @returns AnimKnobBitmapInfo or null if insufficient data
 */
export function buildAnimKnobBitmapInfo(
  bitmapName: string,
  imageUrl: string | null,
  bitmapDef: string | BitmapDefinition | undefined,
  storedBitmap: Bitmap | null,
  viewAttributes: ViewAttributes,
  viewHeight: number
): AnimKnobBitmapInfo | null {
  // Must have an image URL to render
  if (!imageUrl) {
    return null;
  }

  // Must have bitmap dimensions
  if (!storedBitmap) {
    return null;
  }

  const { width, height: totalHeight } = storedBitmap;

  // Extract frame height from bitmap definition (modern approach)
  const frameHeight = extractFrameHeight(bitmapDef, viewHeight);

  // Extract number of frames from bitmap definition, or calculate from dimensions
  const numFrames = extractNumFrames(bitmapDef, totalHeight, frameHeight);

  // Check inverse mode
  const inverse = parseInverseMode(viewAttributes);

  return {
    bitmapName,
    imageUrl,
    totalHeight,
    frameHeight,
    numFrames,
    width,
    inverse,
  };
}

/**
 * Gets the bitmap name from view attributes.
 *
 * @param attributes - View attributes
 * @returns Bitmap name or null if not present
 */
export function getBitmapName(attributes: ViewAttributes): string | null {
  const bitmap = attributes.bitmap;
  if (typeof bitmap === 'string' && bitmap.length > 0) {
    return bitmap;
  }
  return null;
}
