import type { Point, Size } from '../../types/canvas';

/**
 * Default point when origin attribute is missing or invalid.
 */
const DEFAULT_POINT: Point = { x: 0, y: 0 };

/**
 * Default size when size attribute is missing or invalid.
 * Also used as minimum size to ensure views are visible.
 */
const DEFAULT_SIZE: Size = { width: 20, height: 20 };

/**
 * Parses a uidesc origin string "x, y" into a Point object.
 *
 * @param origin - String in format "x, y" (e.g., "50, 100", "-10, 20")
 * @returns Parsed Point, or default (0, 0) if invalid
 *
 * @example
 * parsePoint("50, 100") // { x: 50, y: 100 }
 * parsePoint(undefined) // { x: 0, y: 0 }
 * parsePoint("-10, 20") // { x: -10, y: 20 }
 */
export function parsePoint(origin: string | undefined): Point {
  if (!origin) {
    return DEFAULT_POINT;
  }

  const parts = origin.split(',');
  if (parts.length !== 2) {
    return DEFAULT_POINT;
  }

  const x = Number.parseInt(parts[0].trim(), 10);
  const y = Number.parseInt(parts[1].trim(), 10);

  if (Number.isNaN(x) || Number.isNaN(y)) {
    return DEFAULT_POINT;
  }

  return { x, y };
}

/**
 * Parses a uidesc size string "width, height" into a Size object.
 * Enforces minimum dimensions to ensure views are always visible.
 *
 * @param size - String in format "width, height" (e.g., "200, 80")
 * @returns Parsed Size with minimum 20x20, or default (20, 20) if invalid
 *
 * @example
 * parseSize("200, 80")  // { width: 200, height: 80 }
 * parseSize(undefined)  // { width: 20, height: 20 }
 * parseSize("0, 0")     // { width: 20, height: 20 } (minimum enforced)
 */
export function parseSize(size: string | undefined): Size {
  if (!size) {
    return DEFAULT_SIZE;
  }

  const parts = size.split(',');
  if (parts.length !== 2) {
    return DEFAULT_SIZE;
  }

  const width = Number.parseInt(parts[0].trim(), 10);
  const height = Number.parseInt(parts[1].trim(), 10);

  if (Number.isNaN(width) || Number.isNaN(height)) {
    return DEFAULT_SIZE;
  }

  return {
    width: Math.max(width, DEFAULT_SIZE.width),
    height: Math.max(height, DEFAULT_SIZE.height),
  };
}
