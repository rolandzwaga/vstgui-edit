/**
 * Slider Geometry Generation
 *
 * Utilities for creating Three.js geometries for slider components:
 * track, handle, value fill, and grip lines.
 * Uses RoundedBoxGeometry from Three.js addons for track and handle.
 */

import { BoxGeometry, type BufferGeometry, SphereGeometry } from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import type {
  SliderDesign,
  SliderHandle,
  SliderTrack,
  SliderValueFill,
} from '../../types/controlDesigner/slider';

// ============================================================================
// Constants
// ============================================================================

/** Default segment count for rounded geometries */
const DEFAULT_SEGMENTS = 32;

/** Default bevel segments for RoundedBoxGeometry */
const DEFAULT_BEVEL_SEGMENTS = 4;

/** Minimum segment count */
const MIN_SEGMENTS = 16;

/** Maximum segment count */
const MAX_SEGMENTS = 64;

/**
 * Scale factor for track length to ensure 100% fits within viewport.
 * This accounts for handle overhang and padding around the edges.
 * Value of 0.65 means 100% track length uses 65% of the frame dimension.
 */
const TRACK_LENGTH_SCALE = 0.65;

// ============================================================================
// World Unit Conversions
// ============================================================================

/**
 * Converts a percentage value to world units.
 *
 * @param percent - Value as percentage (0-100)
 * @param dimension - Reference dimension in world units
 * @returns Value in world units
 */
export function percentToWorldUnits(percent: number, dimension: number): number {
  return (percent / 100) * dimension;
}

/**
 * Calculates track dimensions in world units.
 *
 * @param track - Track configuration
 * @param frameWidth - Frame width in world units
 * @param frameHeight - Frame height in world units
 * @returns Track dimensions: { length, width, depth }
 */
export function calculateTrackDimensions(
  track: SliderTrack,
  frameWidth: number,
  frameHeight: number
): { length: number; width: number; depth: number } {
  const isVertical = track.orientation === 'vertical';
  const lengthDimension = isVertical ? frameHeight : frameWidth;
  const widthDimension = isVertical ? frameWidth : frameHeight;

  return {
    // Apply scale factor so 100% length fits within viewport with margins
    length: percentToWorldUnits(track.length, lengthDimension) * TRACK_LENGTH_SCALE,
    width: percentToWorldUnits(track.width, widthDimension),
    depth: track.depth,
  };
}

/**
 * Calculates handle dimensions in world units.
 *
 * @param handle - Handle configuration
 * @param trackWidth - Track width in world units
 * @returns Handle dimensions: { width, height, depth }
 */
export function calculateHandleDimensions(
  handle: SliderHandle,
  trackWidth: number
): { width: number; height: number; depth: number } {
  return {
    width: percentToWorldUnits(handle.width, trackWidth),
    height: percentToWorldUnits(handle.height, trackWidth),
    // Handle depth is slightly higher than track for visual separation
    depth: trackWidth * 0.8,
  };
}

// ============================================================================
// Segment Calculation
// ============================================================================

/**
 * Calculates adaptive segment count based on output frame size.
 *
 * @param frameSize - Larger dimension of the output frame in pixels
 * @returns Recommended segment count
 */
export function calculateSegments(frameSize: number): number {
  const segments = Math.floor(frameSize * 0.3);
  return Math.max(MIN_SEGMENTS, Math.min(MAX_SEGMENTS, segments));
}

// ============================================================================
// Track Geometry
// ============================================================================

/**
 * Creates geometry for the slider track.
 * Uses RoundedBoxGeometry for smooth corners.
 *
 * @param track - Track configuration
 * @param frameWidth - Frame width in world units
 * @param frameHeight - Frame height in world units
 * @returns BufferGeometry for the track
 */
export function createTrackGeometry(
  track: SliderTrack,
  frameWidth: number,
  frameHeight: number
): BufferGeometry {
  const { length, width, depth } = calculateTrackDimensions(track, frameWidth, frameHeight);
  const isVertical = track.orientation === 'vertical';

  // Calculate corner radius in world units
  // Clamp to half of the smallest dimension to prevent invalid geometry
  const maxRadius = Math.min(width, depth) / 2;
  const cornerRadius = Math.min(track.cornerRadius, maxRadius);

  // Create rounded box geometry
  // For vertical sliders: length is Y (height), width is X, depth is Z
  // For horizontal sliders: length is X, width is Y (height), depth is Z
  const geometry = new RoundedBoxGeometry(
    isVertical ? width : length, // x
    isVertical ? length : width, // y
    depth, // z
    DEFAULT_BEVEL_SEGMENTS,
    cornerRadius
  );

  geometry.computeVertexNormals();
  return geometry;
}

/**
 * Creates geometry for the track groove (inner depression).
 * This creates a slightly recessed area inside the track.
 *
 * @param track - Track configuration
 * @param frameWidth - Frame width in world units
 * @param frameHeight - Frame height in world units
 * @param grooveDepth - Depth of the groove relative to track depth
 * @returns BufferGeometry for the groove
 */
export function createTrackGrooveGeometry(
  track: SliderTrack,
  frameWidth: number,
  frameHeight: number,
  grooveDepth = 0.3
): BufferGeometry {
  const { length, width, depth } = calculateTrackDimensions(track, frameWidth, frameHeight);
  const isVertical = track.orientation === 'vertical';

  const grooveWidth = width * 0.6;
  const grooveHeight = depth * grooveDepth;
  const grooveLength = length * 0.95;

  const geometry = new BoxGeometry(
    isVertical ? grooveWidth : grooveLength,
    isVertical ? grooveLength : grooveWidth,
    grooveHeight
  );

  return geometry;
}

// ============================================================================
// Handle Geometry
// ============================================================================

/**
 * Creates geometry for a rectangle handle.
 *
 * @param handle - Handle configuration
 * @param trackWidth - Track width in world units
 * @returns BufferGeometry for the handle
 */
export function createRectangleHandleGeometry(
  handle: SliderHandle,
  trackWidth: number
): BufferGeometry {
  const { width, height, depth } = calculateHandleDimensions(handle, trackWidth);

  // Use sharp corners for rectangle shape
  const geometry = new BoxGeometry(width, height, depth);
  geometry.computeVertexNormals();
  return geometry;
}

/**
 * Creates geometry for a rounded rectangle handle.
 *
 * @param handle - Handle configuration
 * @param trackWidth - Track width in world units
 * @returns BufferGeometry for the handle
 */
export function createRoundedHandleGeometry(
  handle: SliderHandle,
  trackWidth: number
): BufferGeometry {
  const { width, height, depth } = calculateHandleDimensions(handle, trackWidth);

  // Calculate corner radius - 20% of smallest dimension
  const cornerRadius = Math.min(width, height, depth) * 0.2;

  const geometry = new RoundedBoxGeometry(
    width,
    height,
    depth,
    DEFAULT_BEVEL_SEGMENTS,
    cornerRadius
  );
  geometry.computeVertexNormals();
  return geometry;
}

/**
 * Creates geometry for a circular handle.
 *
 * @param handle - Handle configuration
 * @param trackWidth - Track width in world units
 * @param segments - Number of segments for the sphere
 * @returns BufferGeometry for the handle
 */
export function createCircleHandleGeometry(
  handle: SliderHandle,
  trackWidth: number,
  segments = DEFAULT_SEGMENTS
): BufferGeometry {
  const { width, height, depth } = calculateHandleDimensions(handle, trackWidth);

  // Use the average of dimensions for radius
  const radius = (width + height + depth) / 6;

  // Create a squashed sphere for a disc-like appearance
  const geometry = new SphereGeometry(radius, segments, segments / 2);

  // Scale to match the desired dimensions
  const scaleX = width / (radius * 2);
  const scaleY = height / (radius * 2);
  const scaleZ = depth / (radius * 2);
  geometry.scale(scaleX, scaleY, scaleZ);

  geometry.computeVertexNormals();
  return geometry;
}

/**
 * Creates geometry for a fader cap handle.
 * A fader cap has a flat top and tapered sides.
 *
 * @param handle - Handle configuration
 * @param trackWidth - Track width in world units
 * @returns BufferGeometry for the handle
 */
export function createFaderCapHandleGeometry(
  handle: SliderHandle,
  trackWidth: number
): BufferGeometry {
  const { width, height, depth } = calculateHandleDimensions(handle, trackWidth);

  // Create a rounded box with more aggressive rounding on the sides
  const cornerRadius = Math.min(width, depth) * 0.3;

  const geometry = new RoundedBoxGeometry(
    width,
    height,
    depth,
    DEFAULT_BEVEL_SEGMENTS + 2,
    cornerRadius
  );

  geometry.computeVertexNormals();
  return geometry;
}

/**
 * Creates geometry for the slider handle based on shape.
 *
 * @param handle - Handle configuration
 * @param trackWidth - Track width in world units
 * @param segments - Number of segments for curved shapes
 * @returns BufferGeometry for the handle
 */
export function createHandleGeometry(
  handle: SliderHandle,
  trackWidth: number,
  segments = DEFAULT_SEGMENTS
): BufferGeometry {
  switch (handle.shape) {
    case 'rectangle':
      return createRectangleHandleGeometry(handle, trackWidth);
    case 'rounded':
      return createRoundedHandleGeometry(handle, trackWidth);
    case 'circle':
      return createCircleHandleGeometry(handle, trackWidth, segments);
    case 'faderCap':
      return createFaderCapHandleGeometry(handle, trackWidth);
    default:
      return createRoundedHandleGeometry(handle, trackWidth);
  }
}

// ============================================================================
// Grip Lines Geometry
// ============================================================================

/**
 * Creates geometry for grip lines on the handle.
 *
 * @param handle - Handle configuration
 * @param trackWidth - Track width in world units
 * @param isVertical - Whether the slider is vertical
 * @returns Array of BufferGeometry for each grip line
 */
export function createGripLinesGeometry(
  handle: SliderHandle,
  trackWidth: number,
  isVertical: boolean
): BufferGeometry[] {
  if (handle.gripLines === 0) return [];

  const { width, height } = calculateHandleDimensions(handle, trackWidth);
  const geometries: BufferGeometry[] = [];

  // Grip line dimensions
  const lineDepth = 0.3;
  const lineWidth = (isVertical ? width : height) * 0.7;
  const lineHeight = 0.5;

  for (let i = 1; i <= handle.gripLines; i++) {
    const geometry = new BoxGeometry(
      isVertical ? lineWidth : lineHeight,
      isVertical ? lineHeight : lineWidth,
      lineDepth
    );

    geometries.push(geometry);
  }

  return geometries;
}

/**
 * Calculates positions for grip lines on the handle.
 *
 * @param handle - Handle configuration
 * @param trackWidth - Track width in world units
 * @param isVertical - Whether the slider is vertical
 * @param handleZ - Z position of the handle surface
 * @returns Array of { x, y, z } positions for each grip line
 */
export function calculateGripLinePositions(
  handle: SliderHandle,
  trackWidth: number,
  isVertical: boolean,
  handleZ: number
): Array<{ x: number; y: number; z: number }> {
  if (handle.gripLines === 0) return [];

  const { width, height, depth } = calculateHandleDimensions(handle, trackWidth);
  const positions: Array<{ x: number; y: number; z: number }> = [];

  // Spacing between grip lines
  const travelDimension = isVertical ? height : width;
  const spacing = travelDimension / (handle.gripLines + 1);
  const startOffset = -travelDimension / 2;

  for (let i = 1; i <= handle.gripLines; i++) {
    const offset = startOffset + spacing * i;
    positions.push({
      x: isVertical ? 0 : offset,
      y: isVertical ? offset : 0,
      z: handleZ + depth / 2 + 0.2, // Slightly above handle surface
    });
  }

  return positions;
}

// ============================================================================
// Value Fill Geometry
// ============================================================================

/**
 * Creates geometry for the value fill indicator.
 *
 * @param valueFill - Value fill configuration
 * @param track - Track configuration
 * @param frameWidth - Frame width in world units
 * @param frameHeight - Frame height in world units
 * @param fillAmount - Current fill amount (0-1)
 * @returns BufferGeometry for the value fill, or null if mode is 'none'
 */
export function createValueFillGeometry(
  valueFill: SliderValueFill,
  track: SliderTrack,
  frameWidth: number,
  frameHeight: number,
  fillAmount: number
): BufferGeometry | null {
  if (valueFill.mode === 'none') return null;

  const { length, width, depth } = calculateTrackDimensions(track, frameWidth, frameHeight);
  const isVertical = track.orientation === 'vertical';

  // Fill dimensions
  const fillWidth = width * 0.5;
  const fillDepth = depth * 0.3;

  let fillLength: number;

  switch (valueFill.mode) {
    case 'fromStart':
      fillLength = length * fillAmount;
      break;
    case 'fromCenter':
      fillLength = length * Math.abs(fillAmount - 0.5) * 2;
      break;
    case 'segmented':
      // For segmented, we still return a single geometry
      // The segmentation is handled by the renderer using multiple meshes
      fillLength = length * fillAmount;
      break;
    default:
      return null;
  }

  if (fillLength <= 0) return null;

  const geometry = new BoxGeometry(
    isVertical ? fillWidth : fillLength,
    isVertical ? fillLength : fillWidth,
    fillDepth
  );

  return geometry;
}

/**
 * Creates geometries for segmented value fill.
 *
 * @param valueFill - Value fill configuration
 * @param track - Track configuration
 * @param frameWidth - Frame width in world units
 * @param frameHeight - Frame height in world units
 * @param segmentCount - Number of segments
 * @returns Array of BufferGeometry for each segment
 */
export function createSegmentedFillGeometries(
  valueFill: SliderValueFill,
  track: SliderTrack,
  frameWidth: number,
  frameHeight: number,
  segmentCount = 10
): BufferGeometry[] {
  if (valueFill.mode !== 'segmented') return [];

  const { length, width, depth } = calculateTrackDimensions(track, frameWidth, frameHeight);
  const isVertical = track.orientation === 'vertical';

  // Segment dimensions
  const gap = length * 0.02; // 2% gap between segments
  const segmentLength = (length - gap * (segmentCount - 1)) / segmentCount;
  const segmentWidth = width * 0.5;
  const segmentDepth = depth * 0.3;

  const geometries: BufferGeometry[] = [];

  for (let i = 0; i < segmentCount; i++) {
    const geometry = new BoxGeometry(
      isVertical ? segmentWidth : segmentLength,
      isVertical ? segmentLength : segmentWidth,
      segmentDepth
    );
    geometries.push(geometry);
  }

  return geometries;
}

// ============================================================================
// Handle Position Calculation
// ============================================================================

/**
 * Calculates the handle position for a given normalized value.
 *
 * @param position - Normalized position (0-1)
 * @param track - Track configuration
 * @param handle - Handle configuration
 * @param frameWidth - Frame width in world units
 * @param frameHeight - Frame height in world units
 * @returns Position vector { x, y, z }
 */
export function calculateHandlePosition(
  position: number,
  track: SliderTrack,
  handle: SliderHandle,
  frameWidth: number,
  frameHeight: number
): { x: number; y: number; z: number } {
  const { length: trackLength } = calculateTrackDimensions(track, frameWidth, frameHeight);
  const { height: handleHeight, width: handleWidth } = calculateHandleDimensions(
    handle,
    calculateTrackDimensions(track, frameWidth, frameHeight).width
  );

  const isVertical = track.orientation === 'vertical';

  // Calculate travel range (track length minus handle size)
  const travelDimension = isVertical ? handleHeight : handleWidth;
  const travelRange = trackLength - travelDimension;

  // Calculate offset from center
  const offset = (position - 0.5) * travelRange;

  return {
    x: isVertical ? 0 : offset,
    y: isVertical ? offset : 0,
    z: 0, // Handle is positioned above track in the renderer
  };
}

/**
 * Calculates the value fill position for a given normalized value.
 *
 * @param position - Normalized position (0-1)
 * @param track - Track configuration
 * @param valueFill - Value fill configuration
 * @param frameWidth - Frame width in world units
 * @param frameHeight - Frame height in world units
 * @returns Position vector { x, y, z }
 */
export function calculateValueFillPosition(
  position: number,
  track: SliderTrack,
  valueFill: SliderValueFill,
  frameWidth: number,
  frameHeight: number
): { x: number; y: number; z: number } {
  const { length: trackLength } = calculateTrackDimensions(track, frameWidth, frameHeight);
  const isVertical = track.orientation === 'vertical';

  const fillLength = trackLength * position;

  switch (valueFill.mode) {
    case 'fromStart': {
      const offset = -trackLength / 2 + fillLength / 2;
      return {
        x: isVertical ? 0 : offset,
        y: isVertical ? offset : 0,
        z: 0,
      };
    }
    case 'fromCenter': {
      // For center mode, position determines direction
      const centerOffset = (position - 0.5) * trackLength;
      const fillCenterOffset = centerOffset / 2;
      return {
        x: isVertical ? 0 : fillCenterOffset,
        y: isVertical ? fillCenterOffset : 0,
        z: 0,
      };
    }
    default:
      return { x: 0, y: 0, z: 0 };
  }
}

// ============================================================================
// Full Slider Assembly
// ============================================================================

/**
 * Calculates all geometry parameters for a complete slider.
 *
 * @param design - Complete slider design
 * @param frameWidth - Frame width in world units
 * @param frameHeight - Frame height in world units
 * @returns Object with all calculated dimensions and positions
 */
export function calculateSliderGeometry(
  design: SliderDesign,
  frameWidth: number,
  frameHeight: number
): {
  track: { length: number; width: number; depth: number };
  handle: { width: number; height: number; depth: number };
  isVertical: boolean;
  cornerRadius: number;
} {
  const trackDims = calculateTrackDimensions(design.track, frameWidth, frameHeight);
  const handleDims = calculateHandleDimensions(design.handle, trackDims.width);

  return {
    track: trackDims,
    handle: handleDims,
    isVertical: design.track.orientation === 'vertical',
    cornerRadius: Math.min(design.track.cornerRadius, trackDims.width / 2, trackDims.depth / 2),
  };
}
