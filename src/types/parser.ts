/**
 * Type definitions for uidesc parsing and validation
 */

import type { VSTGUIUIDescription } from './uidesc';

/**
 * Detected format of the uidesc file
 */
export type FormatType = 'json' | 'xml' | 'unknown';

/**
 * Parse state machine for the parsing process
 * - idle: No parsing attempted
 * - parsing: Parsing in progress
 * - valid: Successfully parsed and validated
 * - invalid: Parse or validation failed
 */
export type ParseState = 'idle' | 'parsing' | 'valid' | 'invalid';

/**
 * Validation error with location information
 */
export interface ValidationError {
  /** Error category */
  type: 'syntax' | 'schema' | 'format';

  /** Human-readable error message */
  message: string;

  /** JSON pointer path (e.g., "/vstgui-ui-description/colors/Background") */
  path?: string;

  /** For XML: original element path */
  xmlPath?: string;

  /** Line number if available (1-indexed) */
  line?: number;

  /** Column number if available (1-indexed) */
  column?: number;
}

/**
 * Discriminated union representing parse result
 */
export type ParseResult =
  | { success: true; document: VSTGUIUIDescription; format: FormatType }
  | { success: false; errors: ValidationError[]; format: FormatType };
