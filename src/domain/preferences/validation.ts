/**
 * Preferences Validation
 *
 * AJV-based validation for user preferences.
 */

import Ajv from 'ajv';
import type { PreferencesValidationResult } from './types';
import { PREFERENCES_SCHEMA } from './schema';

const ajv = new Ajv({ allErrors: true, strict: false });
const validateSchema = ajv.compile(PREFERENCES_SCHEMA);

/**
 * Validates user preferences against the schema.
 *
 * @param data - Data to validate
 * @returns Validation result with errors if invalid
 */
export function validatePreferences(data: unknown): PreferencesValidationResult {
  if (data === null || data === undefined) {
    return {
      valid: false,
      errors: ['root: must be an object'],
    };
  }

  const valid = validateSchema(data);

  if (!valid) {
    const errors = validateSchema.errors?.map(e => {
      const path = e.instancePath || 'root';
      return `${path}: ${e.message}`;
    }) ?? [];
    return { valid: false, errors };
  }

  return { valid: true, errors: [] };
}
