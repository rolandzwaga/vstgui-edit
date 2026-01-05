import type { ParseResult, ValidationError } from '../../types/parser';
import type { VSTGUIUIDescription } from '../../types/uidesc';
import { validateUidesc } from './validator';

/**
 * Parses JSON content and validates it against the uidesc schema.
 *
 * FR-005: Validate JSON against vstgui-uidesc.schema.json
 * FR-006: Collect all validation errors (not fail on first error)
 * FR-007: Validation errors include JSON path to invalid property
 * FR-008: Parse valid JSON into a typed document model
 * FR-008a: Reject files with unknown/extra properties (strict mode)
 *
 * @param content - The raw JSON string to parse
 * @returns ParseResult with either the parsed document or validation errors
 */
export function parseJson(content: string): ParseResult {
  // Step 1: Parse JSON string
  let parsed: unknown;
  try {
    parsed = JSON.parse(content);
  } catch (err) {
    const syntaxError: ValidationError = {
      type: 'syntax',
      message: err instanceof Error ? err.message : 'Invalid JSON syntax',
    };
    return {
      success: false,
      errors: [syntaxError],
      format: 'json',
    };
  }

  // Step 2: Validate against schema
  const validationResult = validateUidesc(parsed);

  if (!validationResult.valid) {
    return {
      success: false,
      errors: validationResult.errors,
      format: 'json',
    };
  }

  // Step 3: Return typed document
  return {
    success: true,
    document: parsed as VSTGUIUIDescription,
    format: 'json',
  };
}
