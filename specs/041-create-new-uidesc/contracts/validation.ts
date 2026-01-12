/**
 * Validation API contract for Create New uidesc feature
 *
 * NOTE: This is a contract/design file, not actual source code.
 * Source will be created in src/domain/createNew/validation.ts
 */

import type { DimensionValidationResult } from './types';

/**
 * Validates a dimension value (width or height).
 *
 * @param value - The string value from the input field
 * @param fieldName - "Width" or "Height" for error messages
 * @returns Validation result with error or parsed value
 *
 * @example
 * validateDimension('400', 'Width')
 * // => { valid: true, value: 400 }
 *
 * @example
 * validateDimension('', 'Width')
 * // => { valid: false, error: 'Width is required' }
 *
 * @example
 * validateDimension('-100', 'Height')
 * // => { valid: false, error: 'Must be at least 1' }
 *
 * @example
 * validateDimension('50000', 'Width')
 * // => { valid: false, error: 'Must be at most 10000' }
 *
 * @example
 * validateDimension('400.7', 'Width')
 * // => { valid: true, value: 401 } // rounds to nearest integer
 */
export function validateDimension(
  value: string,
  fieldName: 'Width' | 'Height'
): DimensionValidationResult;

/**
 * Validates both width and height together.
 *
 * @param width - Width input value
 * @param height - Height input value
 * @returns Object with individual validation results
 *
 * @example
 * validateDimensions('400', '300')
 * // => {
 * //   width: { valid: true, value: 400 },
 * //   height: { valid: true, value: 300 }
 * // }
 */
export function validateDimensions(
  width: string,
  height: string
): {
  width: DimensionValidationResult;
  height: DimensionValidationResult;
};

/**
 * Checks if both dimension validation results are valid.
 *
 * @param results - Results from validateDimensions
 * @returns true if both are valid
 */
export function areDimensionsValid(results: {
  width: DimensionValidationResult;
  height: DimensionValidationResult;
}): boolean;
