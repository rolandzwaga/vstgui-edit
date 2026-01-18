export interface ValidationResult {
  valid: boolean;
  error?: string;
}

export function validateBitmapName(name: string, existingNames: string[]): ValidationResult {
  const trimmed = name.trim();

  if (!trimmed) {
    return { valid: false, error: 'Bitmap name cannot be empty' };
  }

  if (existingNames.includes(name)) {
    return { valid: false, error: 'A bitmap with this name already exists' };
  }

  return { valid: true };
}

/**
 * Validates nine-part tiled offsets format: "top, left, bottom, right"
 */
export function validateNinepartOffsets(value: string): ValidationResult {
  if (!value.trim()) {
    return { valid: true };
  }

  const pattern = /^\d+\s*,\s*\d+\s*,\s*\d+\s*,\s*\d+$/;
  if (!pattern.test(value.trim())) {
    return { valid: false, error: 'Expected format: "top, left, bottom, right"' };
  }

  return { valid: true };
}

/**
 * Validates multiframe size format: "width, height"
 */
export function validateMultiframeSize(value: string): ValidationResult {
  if (!value.trim()) {
    return { valid: true };
  }

  const pattern = /^\d+(\.\d+)?\s*,\s*\d+(\.\d+)?$/;
  if (!pattern.test(value.trim())) {
    return { valid: false, error: 'Expected format: "width, height"' };
  }

  return { valid: true };
}

/**
 * Validates multiframe frame count (positive integer)
 */
export function validateFrameCount(value: string): ValidationResult {
  if (!value.trim()) {
    return { valid: true };
  }

  const num = parseInt(value, 10);
  if (Number.isNaN(num) || num < 1 || !Number.isInteger(num)) {
    return { valid: false, error: 'Must be a positive integer' };
  }

  return { valid: true };
}

/**
 * Validates frames per row (positive integer or empty)
 */
export function validateFramesPerRow(value: string): ValidationResult {
  if (!value.trim()) {
    return { valid: true };
  }

  const num = parseInt(value, 10);
  if (Number.isNaN(num) || num < 1 || !Number.isInteger(num)) {
    return { valid: false, error: 'Must be a positive integer' };
  }

  return { valid: true };
}
