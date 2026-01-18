/**
 * Filmstrip Generation Utilities
 *
 * Helper functions for filmstrip layout calculation and data conversion.
 */

import type { OutputConfig } from '../../types/knobDesigner';

// ============================================================================
// Layout Calculation
// ============================================================================

/**
 * Calculates optimal frames per row for filmstrip layout.
 * Prefers power of 2 values for better memory alignment.
 *
 * @param frameCount - Total number of frames
 * @returns Optimal frames per row
 */
export function calculateFramesPerRow(frameCount: number): number {
  const sqrt = Math.sqrt(frameCount);
  const candidates = [8, 16, 32, 64];
  return candidates.find(c => c >= sqrt) ?? 64;
}

/**
 * Calculates total filmstrip dimensions.
 *
 * @param output - Output configuration
 * @returns Object with total width, height, and layout info
 */
export function calculateFilmstripDimensions(output: OutputConfig): {
  totalWidth: number;
  totalHeight: number;
  framesPerRow: number;
  rows: number;
} {
  const framesPerRow = calculateFramesPerRow(output.frameCount);
  const rows = Math.ceil(output.frameCount / framesPerRow);

  return {
    totalWidth: output.frameWidth * framesPerRow,
    totalHeight: output.frameHeight * rows,
    framesPerRow,
    rows,
  };
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
): { x: number; y: number; width: number; height: number } {
  const col = frameIndex % framesPerRow;
  const row = Math.floor(frameIndex / framesPerRow);

  // WebGL Y-axis is inverted (origin at bottom-left)
  const x = col * frameWidth;
  const y = (totalRows - 1 - row) * frameHeight;

  return { x, y, width: frameWidth, height: frameHeight };
}

/**
 * Calculates the rotation angle for a specific frame.
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
 * Validates filmstrip dimensions are within reasonable bounds.
 *
 * @param output - Output configuration
 * @returns Object with valid flag and optional error message
 */
export function validateFilmstripSize(output: OutputConfig): {
  valid: boolean;
  error?: string;
  totalPixels?: number;
} {
  const { totalWidth, totalHeight } = calculateFilmstripDimensions(output);
  const totalPixels = totalWidth * totalHeight;

  // Maximum texture size (8192 x 8192 is widely supported)
  const MAX_DIMENSION = 8192;
  // Maximum total pixels (to avoid memory issues)
  const MAX_PIXELS = 64 * 1024 * 1024; // 64 megapixels

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
 * Estimates the final PNG file size based on filmstrip dimensions.
 * This is a rough estimate - actual size depends on image content.
 *
 * @param output - Output configuration
 * @returns Estimated file size in bytes
 */
export function estimateFilmstripSize(output: OutputConfig): number {
  const { totalWidth, totalHeight } = calculateFilmstripDimensions(output);

  // PNG compression is highly variable, but for rendered 3D content
  // expect roughly 2-4 bytes per pixel after compression
  // Use 3 bytes per pixel as a middle estimate
  const bytesPerPixel = 3;

  return totalWidth * totalHeight * bytesPerPixel;
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
