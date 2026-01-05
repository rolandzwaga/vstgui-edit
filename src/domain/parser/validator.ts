import Ajv from 'ajv';
import schema from '../../../vstgui-uidesc.schema.json';
import type { ValidationError } from '../../types/parser';

/**
 * Result of validation
 */
export interface ValidateResult {
  valid: boolean;
  errors: ValidationError[];
}

/**
 * Singleton AJV instance configured for uidesc validation
 *
 * FR-004: Use AJV library for JSON Schema validation
 * FR-006: Collect all validation errors (allErrors: true)
 * FR-008a: Reject unknown properties (strict mode via schema's additionalProperties: false)
 */
const ajv = new Ajv({
  allErrors: true,
  verbose: true,
});

/**
 * Compiled schema validator
 * FR-005: Validate JSON against vstgui-uidesc.schema.json
 */
const validate = ajv.compile(schema);

/**
 * Converts AJV error path to JSON pointer format
 */
function toJsonPointer(instancePath: string): string {
  // AJV already provides instance paths in JSON pointer format
  return instancePath || '/';
}

/**
 * Validates a parsed uidesc document against the JSON schema.
 *
 * FR-005: Validate JSON against vstgui-uidesc.schema.json
 * FR-006: Collect all validation errors (not fail on first error)
 * FR-007: Validation errors include JSON path to invalid property
 * FR-008a: Reject files with unknown/extra properties (strict mode)
 *
 * @param document - The parsed JSON object to validate
 * @returns Validation result with errors if any
 */
export function validateUidesc(document: unknown): ValidateResult {
  const valid = validate(document);

  if (valid) {
    return { valid: true, errors: [] };
  }

  // FR-006: Collect all errors
  // FR-007: Include path information
  const errors: ValidationError[] = (validate.errors ?? []).map(err => ({
    type: 'schema' as const,
    message: err.message ?? 'Validation error',
    path: toJsonPointer(err.instancePath),
  }));

  return { valid: false, errors };
}
