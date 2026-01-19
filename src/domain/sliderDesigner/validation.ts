/**
 * Slider Designer Validation
 *
 * Validation utilities for slider designs including constraint checking
 * and validation result types.
 */

import type { ValidationResult } from '../../types/controlDesigner';
import type { SliderDesign } from '../../types/controlDesigner/slider';

// ============================================================================
// Slider Constraints
// ============================================================================

/**
 * Constraints for slider track configuration.
 */
export const TRACK_CONSTRAINTS = {
  LENGTH: {
    MIN: 10,
    MAX: 100,
    UNIT: '%',
  },
  WIDTH: {
    MIN: 5,
    MAX: 50,
    UNIT: '%',
  },
  DEPTH: {
    MIN: 1,
    MAX: 20,
    UNIT: 'units',
  },
  CORNER_RADIUS: {
    MIN: 0,
    MAX: 10,
    UNIT: 'units',
  },
} as const;

/**
 * Constraints for slider handle configuration.
 */
export const HANDLE_CONSTRAINTS = {
  WIDTH: {
    MIN: 50,
    MAX: 150,
    UNIT: '%',
  },
  HEIGHT: {
    MIN: 50,
    MAX: 200,
    UNIT: '%',
  },
  GRIP_LINES: {
    MIN: 0,
    MAX: 5,
    UNIT: 'lines',
  },
} as const;

/**
 * Constraints for value fill configuration.
 */
export const VALUE_FILL_CONSTRAINTS = {
  GLOW_INTENSITY: {
    MIN: 0,
    MAX: 100,
    UNIT: '%',
  },
} as const;

/**
 * Constraints for slider output configuration.
 */
export const SLIDER_OUTPUT_CONSTRAINTS = {
  FRAME_COUNT: {
    MIN: 8,
    MAX: 256,
    UNIT: 'frames',
  },
  FRAME_SIZE: {
    MIN: 20,
    MAX: 512,
    UNIT: 'px',
  },
  MAX_FILMSTRIP_DIMENSION: 8192,
  MAX_TOTAL_PIXELS: 16777216, // 4096x4096 equivalent
} as const;

// ============================================================================
// Validation Functions
// ============================================================================

/**
 * Validates a slider track configuration.
 *
 * @param track - The track configuration to validate
 * @returns Validation result with error message if invalid
 */
export function validateTrack(track: SliderDesign['track']): ValidationResult {
  // Validate length
  if (track.length < TRACK_CONSTRAINTS.LENGTH.MIN || track.length > TRACK_CONSTRAINTS.LENGTH.MAX) {
    return {
      valid: false,
      error: `Track length must be between ${TRACK_CONSTRAINTS.LENGTH.MIN}% and ${TRACK_CONSTRAINTS.LENGTH.MAX}%`,
    };
  }

  // Validate width
  if (track.width < TRACK_CONSTRAINTS.WIDTH.MIN || track.width > TRACK_CONSTRAINTS.WIDTH.MAX) {
    return {
      valid: false,
      error: `Track width must be between ${TRACK_CONSTRAINTS.WIDTH.MIN}% and ${TRACK_CONSTRAINTS.WIDTH.MAX}%`,
    };
  }

  // Validate depth
  if (track.depth < TRACK_CONSTRAINTS.DEPTH.MIN || track.depth > TRACK_CONSTRAINTS.DEPTH.MAX) {
    return {
      valid: false,
      error: `Track depth must be between ${TRACK_CONSTRAINTS.DEPTH.MIN} and ${TRACK_CONSTRAINTS.DEPTH.MAX}`,
    };
  }

  // Validate corner radius
  if (
    track.cornerRadius < TRACK_CONSTRAINTS.CORNER_RADIUS.MIN ||
    track.cornerRadius > TRACK_CONSTRAINTS.CORNER_RADIUS.MAX
  ) {
    return {
      valid: false,
      error: `Corner radius must be between ${TRACK_CONSTRAINTS.CORNER_RADIUS.MIN} and ${TRACK_CONSTRAINTS.CORNER_RADIUS.MAX}`,
    };
  }

  return { valid: true };
}

/**
 * Validates a slider handle configuration.
 *
 * @param handle - The handle configuration to validate
 * @returns Validation result with error message if invalid
 */
export function validateHandle(handle: SliderDesign['handle']): ValidationResult {
  // Validate width
  if (handle.width < HANDLE_CONSTRAINTS.WIDTH.MIN || handle.width > HANDLE_CONSTRAINTS.WIDTH.MAX) {
    return {
      valid: false,
      error: `Handle width must be between ${HANDLE_CONSTRAINTS.WIDTH.MIN}% and ${HANDLE_CONSTRAINTS.WIDTH.MAX}%`,
    };
  }

  // Validate height
  if (
    handle.height < HANDLE_CONSTRAINTS.HEIGHT.MIN ||
    handle.height > HANDLE_CONSTRAINTS.HEIGHT.MAX
  ) {
    return {
      valid: false,
      error: `Handle height must be between ${HANDLE_CONSTRAINTS.HEIGHT.MIN}% and ${HANDLE_CONSTRAINTS.HEIGHT.MAX}%`,
    };
  }

  // Validate grip lines
  if (
    handle.gripLines < HANDLE_CONSTRAINTS.GRIP_LINES.MIN ||
    handle.gripLines > HANDLE_CONSTRAINTS.GRIP_LINES.MAX
  ) {
    return {
      valid: false,
      error: `Grip lines must be between ${HANDLE_CONSTRAINTS.GRIP_LINES.MIN} and ${HANDLE_CONSTRAINTS.GRIP_LINES.MAX}`,
    };
  }

  return { valid: true };
}

/**
 * Validates a slider value fill configuration.
 *
 * @param valueFill - The value fill configuration to validate
 * @returns Validation result with error message if invalid
 */
export function validateValueFill(valueFill: SliderDesign['valueFill']): ValidationResult {
  // Validate glow intensity
  if (
    valueFill.glowIntensity < VALUE_FILL_CONSTRAINTS.GLOW_INTENSITY.MIN ||
    valueFill.glowIntensity > VALUE_FILL_CONSTRAINTS.GLOW_INTENSITY.MAX
  ) {
    return {
      valid: false,
      error: `Glow intensity must be between ${VALUE_FILL_CONSTRAINTS.GLOW_INTENSITY.MIN}% and ${VALUE_FILL_CONSTRAINTS.GLOW_INTENSITY.MAX}%`,
    };
  }

  // Validate color format
  if (!/^#[0-9A-Fa-f]{8}$/.test(valueFill.color)) {
    return {
      valid: false,
      error: 'Fill color must be in #RRGGBBAA format',
    };
  }

  return { valid: true };
}

/**
 * Validates slider output configuration.
 *
 * @param output - The output configuration to validate
 * @returns Validation result with error message if invalid
 */
export function validateSliderOutput(output: SliderDesign['output']): ValidationResult {
  const { FRAME_COUNT, FRAME_SIZE, MAX_FILMSTRIP_DIMENSION, MAX_TOTAL_PIXELS } =
    SLIDER_OUTPUT_CONSTRAINTS;

  // Validate frame count
  if (output.frameCount < FRAME_COUNT.MIN || output.frameCount > FRAME_COUNT.MAX) {
    return {
      valid: false,
      error: `Frame count must be between ${FRAME_COUNT.MIN} and ${FRAME_COUNT.MAX}`,
    };
  }

  // Validate frame dimensions
  if (output.frameWidth < FRAME_SIZE.MIN || output.frameWidth > FRAME_SIZE.MAX) {
    return {
      valid: false,
      error: `Frame width must be between ${FRAME_SIZE.MIN}px and ${FRAME_SIZE.MAX}px`,
    };
  }

  if (output.frameHeight < FRAME_SIZE.MIN || output.frameHeight > FRAME_SIZE.MAX) {
    return {
      valid: false,
      error: `Frame height must be between ${FRAME_SIZE.MIN}px and ${FRAME_SIZE.MAX}px`,
    };
  }

  // Calculate filmstrip dimensions
  let totalWidth: number;
  let totalHeight: number;

  if (output.layout === 'vertical') {
    totalWidth = output.frameWidth;
    totalHeight = output.frameHeight * output.frameCount;
  } else if (output.layout === 'horizontal') {
    totalWidth = output.frameWidth * output.frameCount;
    totalHeight = output.frameHeight;
  } else {
    // Grid layout
    const cols = Math.ceil(Math.sqrt(output.frameCount));
    const rows = Math.ceil(output.frameCount / cols);
    totalWidth = output.frameWidth * cols;
    totalHeight = output.frameHeight * rows;
  }

  // Validate filmstrip dimensions
  if (totalWidth > MAX_FILMSTRIP_DIMENSION || totalHeight > MAX_FILMSTRIP_DIMENSION) {
    return {
      valid: false,
      error: `Filmstrip dimensions (${totalWidth}x${totalHeight}) exceed maximum (${MAX_FILMSTRIP_DIMENSION}x${MAX_FILMSTRIP_DIMENSION})`,
    };
  }

  // Validate total pixels
  const totalPixels = totalWidth * totalHeight;
  if (totalPixels > MAX_TOTAL_PIXELS) {
    return {
      valid: false,
      error: `Total pixel count (${totalPixels.toLocaleString()}) exceeds maximum (${MAX_TOTAL_PIXELS.toLocaleString()})`,
    };
  }

  return { valid: true };
}

/**
 * Validates a complete slider design.
 *
 * @param design - The slider design to validate
 * @returns Validation result with error message if invalid
 */
export function validateSliderDesign(design: SliderDesign): ValidationResult {
  // Validate track
  const trackResult = validateTrack(design.track);
  if (!trackResult.valid) return trackResult;

  // Validate handle
  const handleResult = validateHandle(design.handle);
  if (!handleResult.valid) return handleResult;

  // Validate value fill
  const valueFillResult = validateValueFill(design.valueFill);
  if (!valueFillResult.valid) return valueFillResult;

  // Validate output
  const outputResult = validateSliderOutput(design.output);
  if (!outputResult.valid) return outputResult;

  return { valid: true };
}
