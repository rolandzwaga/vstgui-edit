/**
 * Control Designer Filmstrip Utilities
 *
 * Helper functions for filmstrip layout calculation and data conversion.
 * Migrated from knobDesigner/filmstrip.ts and extended for all control types.
 */

import type {
  BaseOutputConfig,
  ControlCategory,
  FilmstripLayout,
} from '../../types/controlDesigner';

// ============================================================================
// Layout Calculation
// ============================================================================

/**
 * Calculates optimal frames per row for grid filmstrip layout.
 * Prefers power of 2 values for better memory alignment.
 *
 * @param frameCount - Total number of frames
 * @returns Optimal frames per row
 */
export function calculateFramesPerRowForGrid(frameCount: number): number {
  const sqrt = Math.sqrt(frameCount);
  const candidates = [8, 16, 32, 64];
  return candidates.find(c => c >= sqrt) ?? 64;
}

/**
 * Filmstrip dimension calculation result.
 */
export interface FilmstripDimensions {
  totalWidth: number;
  totalHeight: number;
  framesPerRow: number;
  rows: number;
}

/**
 * Calculates total filmstrip dimensions based on layout type.
 *
 * @param output - Output configuration
 * @returns Object with total width, height, and layout info
 */
export function calculateFilmstripDimensions(output: BaseOutputConfig): FilmstripDimensions {
  const layout = output.layout ?? 'vertical';
  let framesPerRow: number;
  let rows: number;

  switch (layout) {
    case 'vertical':
      // Single column, all frames stacked vertically
      framesPerRow = 1;
      rows = output.frameCount;
      break;
    case 'horizontal':
      // Single row, all frames side by side
      framesPerRow = output.frameCount;
      rows = 1;
      break;
    default:
      // Grid layout (default) with optimal distribution
      framesPerRow = calculateFramesPerRowForGrid(output.frameCount);
      rows = Math.ceil(output.frameCount / framesPerRow);
      break;
  }

  return {
    totalWidth: output.frameWidth * framesPerRow,
    totalHeight: output.frameHeight * rows,
    framesPerRow,
    rows,
  };
}

/**
 * Frame viewport rectangle.
 */
export interface FrameViewport {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * Gets the viewport rectangle for a specific frame.
 *
 * @param frameIndex - Frame index (0-based)
 * @param frameWidth - Single frame width
 * @param frameHeight - Single frame height
 * @param framesPerRow - Frames per row
 * @param totalRows - Total number of rows
 * @returns Viewport rectangle {x, y, width, height}
 */
export function getFrameViewport(
  frameIndex: number,
  frameWidth: number,
  frameHeight: number,
  framesPerRow: number,
  totalRows: number
): FrameViewport {
  const col = frameIndex % framesPerRow;
  const row = Math.floor(frameIndex / framesPerRow);

  // WebGL Y-axis is inverted (origin at bottom-left)
  const x = col * frameWidth;
  const y = (totalRows - 1 - row) * frameHeight;

  return { x, y, width: frameWidth, height: frameHeight };
}

// ============================================================================
// Frame Position Calculation
// ============================================================================

/**
 * Calculates the rotation angle for a specific frame (rotational controls).
 *
 * @param frameIndex - Frame index (0-based)
 * @param frameCount - Total number of frames
 * @param startAngle - Start angle in degrees
 * @param sweepAngle - Sweep angle in degrees
 * @returns Rotation angle in degrees
 */
export function calculateFrameAngle(
  frameIndex: number,
  frameCount: number,
  startAngle: number,
  sweepAngle: number
): number {
  // Avoid division by zero for single frame
  if (frameCount <= 1) return startAngle;

  // Linear interpolation from start through sweep
  const progress = frameIndex / (frameCount - 1);
  return startAngle + progress * sweepAngle;
}

/**
 * Calculates the position (0-1) for a specific frame (linear controls).
 *
 * @param frameIndex - Frame index (0-based)
 * @param frameCount - Total number of frames
 * @returns Normalized position (0-1)
 */
export function calculateFramePosition(
  frameIndex: number,
  frameCount: number
): number {
  // Avoid division by zero for single frame
  if (frameCount <= 1) return 0;

  // Linear interpolation from 0 to 1
  return frameIndex / (frameCount - 1);
}

/**
 * Gets the appropriate frame value calculator based on control category.
 *
 * @param category - Control category
 * @returns Function that calculates frame value for given index
 */
export function getFrameValueCalculator(
  category: ControlCategory
): (frameIndex: number, frameCount: number, options?: { startAngle?: number; sweepAngle?: number }) => number {
  switch (category) {
    case 'rotational':
      return (index, count, options) =>
        calculateFrameAngle(
          index,
          count,
          options?.startAngle ?? 225,
          options?.sweepAngle ?? 270
        );
    case 'linear':
      return (index, count) => calculateFramePosition(index, count);
    case 'binary':
      return (index) => (index === 0 ? 0 : 1);
    case 'multiState':
      return (index, count) => (count <= 1 ? 0 : index / (count - 1));
    case 'grid2D':
      // For 2D grids, this returns a linear index; actual X/Y calculation is separate
      return (index, count) => (count <= 1 ? 0 : index / (count - 1));
    default:
      return (index, count) => calculateFramePosition(index, count);
  }
}

// ============================================================================
// Data Conversion
// ============================================================================

/**
 * Converts a data URL to a Blob.
 *
 * @param dataUrl - PNG data URL
 * @returns Blob of the image data
 */
export function dataUrlToBlob(dataUrl: string): Blob {
  // Extract base64 data
  const [header, base64] = dataUrl.split(',');
  const mimeMatch = header.match(/:(.*?);/);
  const mimeType = mimeMatch ? mimeMatch[1] : 'image/png';

  // Decode base64
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }

  return new Blob([bytes], { type: mimeType });
}

/**
 * Converts a Blob to a data URL.
 *
 * @param blob - Image blob
 * @returns Promise resolving to data URL
 */
export function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}

/**
 * Calculates the file size of a data URL in bytes.
 *
 * @param dataUrl - Data URL to measure
 * @returns Approximate file size in bytes
 */
export function getDataUrlSize(dataUrl: string): number {
  // Remove header and calculate base64 size
  const base64 = dataUrl.split(',')[1];
  if (!base64) return 0;

  // Base64 encodes 3 bytes as 4 characters
  // Account for padding
  const padding = (base64.match(/=/g) || []).length;
  return (base64.length * 3) / 4 - padding;
}

// ============================================================================
// Validation
// ============================================================================

/**
 * Filmstrip size validation result.
 */
export interface FilmstripValidation {
  valid: boolean;
  error?: string;
  totalPixels?: number;
  warning?: string;
}

/** Maximum texture dimension (widely supported) */
const MAX_DIMENSION = 8192;

/** Maximum total pixels (to avoid memory issues) */
const MAX_PIXELS = 64 * 1024 * 1024; // 64 megapixels

/**
 * Validates filmstrip dimensions are within reasonable bounds.
 *
 * @param output - Output configuration
 * @returns Object with valid flag, optional error message, and optional warning
 */
export function validateFilmstripSize(output: BaseOutputConfig): FilmstripValidation {
  const { totalWidth, totalHeight } = calculateFilmstripDimensions(output);
  const totalPixels = totalWidth * totalHeight;

  if (totalWidth > MAX_DIMENSION) {
    return {
      valid: false,
      error: `Filmstrip width (${totalWidth}px) exceeds maximum (${MAX_DIMENSION}px). Reduce frame count or width.`,
      totalPixels,
    };
  }

  if (totalHeight > MAX_DIMENSION) {
    return {
      valid: false,
      error: `Filmstrip height (${totalHeight}px) exceeds maximum (${MAX_DIMENSION}px). Reduce frame count or height.`,
      totalPixels,
    };
  }

  if (totalPixels > MAX_PIXELS) {
    return {
      valid: false,
      error: `Total pixels (${totalPixels.toLocaleString()}) exceeds maximum (${MAX_PIXELS.toLocaleString()}). Reduce frame count or dimensions.`,
      totalPixels,
    };
  }

  return { valid: true, totalPixels };
}

/**
 * Checks for narrow dimension warning (non-blocking).
 *
 * @param frameWidth - Frame width in pixels
 * @param frameHeight - Frame height in pixels
 * @param minDimension - Minimum dimension before warning (default 15)
 * @returns Warning message if dimension is narrow, undefined otherwise
 */
export function checkNarrowDimensionWarning(
  frameWidth: number,
  frameHeight: number,
  minDimension = 15
): string | undefined {
  if (frameWidth < minDimension) {
    return `Frame width (${frameWidth}px) is very narrow. This may affect rendering quality.`;
  }
  if (frameHeight < minDimension) {
    return `Frame height (${frameHeight}px) is very narrow. This may affect rendering quality.`;
  }
  return undefined;
}

// ============================================================================
// Size Estimation
// ============================================================================

/**
 * Estimates the final PNG file size based on filmstrip dimensions.
 * This is a rough estimate - actual size depends on image content.
 * Uses UPNG.js compression which achieves better ratios than canvas.toDataURL.
 *
 * @param output - Output configuration
 * @returns Estimated file size in bytes
 */
export function estimateFilmstripSize(output: BaseOutputConfig): number {
  const { totalWidth, totalHeight } = calculateFilmstripDimensions(output);

  // With UPNG.js compression at level 0 (best compression),
  // rendered 3D control images with gradients and smooth surfaces
  // typically compress to around 0.5-1.2 bytes per pixel.
  // Use 0.8 bytes per pixel as a conservative middle estimate.
  const bytesPerPixel = 0.8;

  return Math.round(totalWidth * totalHeight * bytesPerPixel);
}

/**
 * Formats a byte count as a human-readable string.
 *
 * @param bytes - Byte count
 * @returns Formatted string (e.g., "1.5 MB")
 */
export function formatFileSize(bytes: number): string {
  const units = ['B', 'KB', 'MB', 'GB'];
  let unitIndex = 0;
  let size = bytes;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }

  return `${size.toFixed(unitIndex > 0 ? 1 : 0)} ${units[unitIndex]}`;
}

// ============================================================================
// Layout Helpers
// ============================================================================

/**
 * Gets a human-readable description of the filmstrip layout.
 *
 * @param output - Output configuration
 * @returns Description string
 */
export function getLayoutDescription(output: BaseOutputConfig): string {
  const { totalWidth, totalHeight, framesPerRow, rows } = calculateFilmstripDimensions(output);
  const layout = output.layout ?? 'vertical';

  switch (layout) {
    case 'vertical':
      return `${output.frameCount} frames in a single column (${totalWidth}x${totalHeight}px)`;
    case 'horizontal':
      return `${output.frameCount} frames in a single row (${totalWidth}x${totalHeight}px)`;
    default:
      return `${framesPerRow}x${rows} grid (${totalWidth}x${totalHeight}px)`;
  }
}

/**
 * Suggests an optimal layout based on frame count.
 *
 * @param frameCount - Number of frames
 * @returns Suggested layout type
 */
export function suggestLayout(frameCount: number): FilmstripLayout {
  if (frameCount <= 8) return 'horizontal';
  if (frameCount <= 64) return 'vertical';
  return 'grid';
}
