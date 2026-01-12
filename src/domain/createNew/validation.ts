/**
 * Validation functions for Create New uidesc feature
 */

import type { DimensionValidationResult } from '../../types/createNew';
import { DIMENSION_CONSTRAINTS } from '../../types/createNew';

/**
 * Validates a dimension value (width or height).
 *
 * @param value - The string value from the input field
 * @param fieldName - "Width" or "Height" for error messages
 * @returns Validation result with error or parsed value
 */
export function validateDimension(
  value: string,
  fieldName: 'Width' | 'Height'
): DimensionValidationResult {
  const trimmed = value.trim();

  // Check for empty value
  if (trimmed === '') {
    return { valid: false, error: `${fieldName} is required` };
  }

  // Check for non-numeric value using Number() which is stricter than parseFloat
  // parseFloat('400px') returns 400, but Number('400px') returns NaN
  const parsed = Number(trimmed);
  if (Number.isNaN(parsed)) {
    return { valid: false, error: 'Must be a number' };
  }

  // Round to nearest integer
  const rounded = Math.round(parsed);

  // Check minimum constraint
  if (rounded < DIMENSION_CONSTRAINTS.MIN) {
    return { valid: false, error: `Must be at least ${DIMENSION_CONSTRAINTS.MIN}` };
  }

  // Check maximum constraint
  if (rounded > DIMENSION_CONSTRAINTS.MAX) {
    return { valid: false, error: `Must be at most ${DIMENSION_CONSTRAINTS.MAX}` };
  }

  return { valid: true, value: rounded };
}

/**
 * Validates both width and height together.
 *
 * @param width - Width input value
 * @param height - Height input value
 * @returns Object with individual validation results
 */
export function validateDimensions(
  width: string,
  height: string
): {
  width: DimensionValidationResult;
  height: DimensionValidationResult;
} {
  return {
    width: validateDimension(width, 'Width'),
    height: validateDimension(height, 'Height'),
  };
}

/**
 * Checks if both dimension validation results are valid.
 *
 * @param results - Results from validateDimensions
 * @returns true if both are valid
 */
export function areDimensionsValid(results: {
  width: DimensionValidationResult;
  height: DimensionValidationResult;
}): boolean {
  return results.width.valid && results.height.valid;
}
