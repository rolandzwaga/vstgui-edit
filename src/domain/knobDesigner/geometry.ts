/**
 * Knob Geometry Generation
 *
 * Utilities for creating Three.js geometries for knob layers and indicators.
 * Uses LatheGeometry for rotational symmetry.
 */

import {
  BoxGeometry,
  type BufferGeometry,
  LatheGeometry,
  SphereGeometry,
  TorusGeometry,
  Vector2,
} from 'three';
import type { KnobIndicator, KnobLayer, LayerGeometry, SkirtStyle } from '../../types/knobDesigner';

// ============================================================================
// Constants
// ============================================================================

/** Minimum radial segments for geometry */
const MIN_SEGMENTS = 16;

/** Maximum radial segments for geometry */
const MAX_SEGMENTS = 128;

/** Points per arc for bevel smoothness */
const BEVEL_ARC_POINTS = 8;

// ============================================================================
// Adaptive Segment Calculation
// ============================================================================

/**
 * Calculates adaptive segment count based on output diameter.
 * Formula: segments = clamp(floor(diameter * 0.4), 16, 128)
 *
 * @param diameter - Output frame diameter in pixels
 * @returns Recommended segment count
 */
export function calculateSegments(diameter: number): number {
  const segments = Math.floor(diameter * 0.4);
  return Math.max(MIN_SEGMENTS, Math.min(MAX_SEGMENTS, segments));
}

// ============================================================================
// Layer Y-Offset Calculation
// ============================================================================

/**
 * Calculates the Y offset for a layer based on cumulative heights of layers below.
 *
 * @param layers - Array of all layers
 * @param currentIndex - Index of the layer to calculate offset for
 * @param totalHeight - Total knob height in world units
 * @returns Y offset for the layer's base position
 */
export function calculateLayerYOffset(
  layers: KnobLayer[],
  currentIndex: number,
  totalHeight: number
): number {
  let offset = 0;
  for (let i = 0; i < currentIndex; i++) {
    offset += (layers[i].geometry.height / 100) * totalHeight;
  }
  return offset;
}

// ============================================================================
// Profile Generation
// ============================================================================

/**
 * Creates a 2D profile for LatheGeometry from layer geometry.
 * Profile is an array of Vector2 points from center axis outward.
 *
 * @param geometry - Layer geometry configuration
 * @param overallDiameter - Overall knob diameter in world units
 * @param overallHeight - Overall knob height in world units
 * @returns Array of 2D profile points
 */
export function createLayerProfile(
  geometry: LayerGeometry,
  overallDiameter: number,
  overallHeight: number
): Vector2[] {
  const radius = (geometry.diameter / 100) * (overallDiameter / 2);
  const height = (geometry.height / 100) * overallHeight;
  const bevel = geometry.bevelRadius;

  const points: Vector2[] = [];

  // Start at center bottom
  points.push(new Vector2(0, 0));

  // Handle skirt style for bottom edge
  const basePoints = handleSkirtStyle(radius, height, geometry.skirtStyle);
  points.push(...basePoints);

  // Apply top bevel if needed
  if (bevel > 0 && bevel < radius && bevel < height) {
    const topPoints = applyTopBevel(radius, height, bevel);
    points.push(...topPoints);
  } else {
    // No bevel - sharp edge
    points.push(new Vector2(radius, height));
  }

  // End at center top
  points.push(new Vector2(0, height));

  return points;
}

/**
 * Generates profile points for the bottom edge based on skirt style.
 *
 * @param radius - Layer radius
 * @param height - Layer height
 * @param skirtStyle - Skirt style
 * @returns Array of Vector2 points for the bottom portion
 */
function handleSkirtStyle(radius: number, height: number, skirtStyle: SkirtStyle): Vector2[] {
  const points: Vector2[] = [];
  const skirtHeight = height * 0.3; // Skirt is bottom 30%

  switch (skirtStyle) {
    case 'tapered':
      // Tapered inward from bottom to skirt height
      points.push(new Vector2(radius * 1.1, 0)); // Wider at base
      points.push(new Vector2(radius, skirtHeight)); // Tapers to normal at skirt top
      break;

    case 'angled':
      // Angled edge at 45 degrees
      points.push(new Vector2(radius, 0));
      points.push(new Vector2(radius - skirtHeight * 0.5, skirtHeight));
      break;
    default:
      // Straight vertical edge
      points.push(new Vector2(radius, 0));
      break;
  }

  return points;
}

/**
 * Applies a bevel to the top edge of the profile.
 *
 * @param radius - Layer radius
 * @param height - Layer height
 * @param bevelRadius - Bevel radius
 * @returns Array of Vector2 points for the beveled top edge
 */
function applyTopBevel(radius: number, height: number, bevelRadius: number): Vector2[] {
  const points: Vector2[] = [];
  const bevelCenterX = radius - bevelRadius;
  const bevelCenterY = height - bevelRadius;

  // Add arc points for smooth bevel
  for (let i = 0; i <= BEVEL_ARC_POINTS; i++) {
    const angle = (i / BEVEL_ARC_POINTS) * (Math.PI / 2);
    const x = bevelCenterX + Math.cos(angle) * bevelRadius;
    const y = bevelCenterY + Math.sin(angle) * bevelRadius;
    points.push(new Vector2(x, y));
  }

  return points;
}

/**
 * Public wrapper for applying bevel - for testing and direct use.
 *
 * @param points - Existing profile points
 * @param bevelRadius - Bevel radius to apply
 * @returns Points with bevel applied
 */
export function applyBevel(points: Vector2[], bevelRadius: number): Vector2[] {
  if (bevelRadius <= 0 || points.length < 2) return points;

  // Find the outer edge point (max x)
  let maxXIndex = 0;
  for (let i = 1; i < points.length; i++) {
    if (points[i].x > points[maxXIndex].x) {
      maxXIndex = i;
    }
  }

  const radius = points[maxXIndex].x;
  const height = points[points.length - 1].y;

  // If bevel is too large, skip
  if (bevelRadius >= radius || bevelRadius >= height) return points;

  // Replace the top portion with beveled version
  const result = points.slice(0, maxXIndex);
  result.push(...applyTopBevel(radius, height, bevelRadius));
  result.push(new Vector2(0, height));

  return result;
}

// ============================================================================
// Layer Geometry Creation
// ============================================================================

/**
 * Creates a Three.js geometry for a knob layer.
 *
 * @param layer - Layer configuration
 * @param overallDiameter - Overall knob diameter in world units
 * @param overallHeight - Overall knob height in world units
 * @param segments - Number of radial segments
 * @returns LatheGeometry for the layer
 */
export function createLayerGeometry(
  layer: KnobLayer,
  overallDiameter: number,
  overallHeight: number,
  segments: number
): BufferGeometry {
  const profile = createLayerProfile(layer.geometry, overallDiameter, overallHeight);
  const geometry = new LatheGeometry(profile, segments, 0, Math.PI * 2);

  // Compute normals for proper lighting
  geometry.computeVertexNormals();

  return geometry;
}

// ============================================================================
// Indicator Geometry Creation
// ============================================================================

/**
 * Creates geometry for a dot indicator.
 * Uses a squashed sphere (ellipsoid) to create a dome shape.
 *
 * @param radius - Dot radius (horizontal extent)
 * @param height - Dot height (vertical extent)
 * @param segments - Number of segments
 * @returns SphereGeometry scaled to form an ellipsoid
 */
export function createDotGeometry(
  radius: number,
  height: number,
  segments: number
): SphereGeometry {
  // Create a hemisphere (half sphere facing up)
  const geometry = new SphereGeometry(
    radius,
    segments,
    segments / 2,
    0,
    Math.PI * 2,
    0,
    Math.PI / 2
  );
  // Scale vertically based on height (relative to radius)
  const scaleY = height / radius;
  geometry.scale(1, scaleY, 1);
  // Recompute normals after scaling to fix lighting
  geometry.computeVertexNormals();
  return geometry;
}

/**
 * Creates geometry for a line indicator.
 *
 * @param length - Line length (z-axis, radial direction)
 * @param width - Line width (x-axis, tangential direction)
 * @param height - Line height (y-axis, vertical thickness)
 * @returns BoxGeometry for the line
 */
export function createLineGeometry(length: number, width: number, height: number): BoxGeometry {
  // BoxGeometry has flat face normals by default, which is correct for a box shape
  return new BoxGeometry(width, height, length);
}

/**
 * Creates geometry for a notch indicator (edge marker).
 *
 * @param depth - Notch depth
 * @param width - Notch width
 * @returns BoxGeometry for the notch
 */
export function createNotchGeometry(depth: number, width: number): BoxGeometry {
  return new BoxGeometry(width, depth, depth);
}

/**
 * Creates geometry for a groove indicator (top surface groove).
 *
 * @param depth - Groove depth
 * @param width - Groove width
 * @param radius - Arc radius from center
 * @returns TorusGeometry for the groove
 */
export function createGrooveGeometry(_depth: number, width: number, radius: number): TorusGeometry {
  // TorusGeometry: (radius, tube, radialSegments, tubularSegments, arc)
  return new TorusGeometry(radius, width / 2, 8, 4, Math.PI / 6);
}

/**
 * Creates geometry for an indicator based on its type.
 *
 * @param indicator - Indicator configuration
 * @param layerRadius - Radius of the top layer
 * @param segments - Number of segments for curved indicators
 * @returns BufferGeometry for the indicator
 */
export function createIndicatorGeometry(
  indicator: KnobIndicator,
  layerRadius: number,
  segments: number
): BufferGeometry {
  const indicatorRadius = (indicator.radialPosition / 100) * layerRadius;
  const height = indicator.size.height ?? 2; // Default height for backward compatibility

  switch (indicator.type) {
    case 'dot':
      return createDotGeometry(indicator.size.radius, height, segments);

    case 'line':
      return createLineGeometry(indicator.size.length, indicator.size.width, height);

    case 'notch':
      return createNotchGeometry(indicator.size.depth, indicator.size.width);

    case 'groove':
      return createGrooveGeometry(indicator.size.depth, indicator.size.width, indicatorRadius);

    default:
      // Fallback to dot
      return createDotGeometry(indicator.size.radius, height, segments);
  }
}
