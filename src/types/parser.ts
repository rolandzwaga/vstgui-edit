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

export interface ValidationError {
  type: 'syntax' | 'schema' | 'format';
  message: string;
  path?: string;
  xmlPath?: string;
  line?: number;
  column?: number;
  data?: string;
}

/**
 * Discriminated union representing parse result
 */
export type ParseResult =
  | { success: true; document: VSTGUIUIDescription; format: FormatType }
  | { success: false; errors: ValidationError[]; format: FormatType };
