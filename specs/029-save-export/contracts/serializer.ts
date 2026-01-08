/**
 * Serializer Contract
 *
 * Defines the interface for document serialization to JSON and XML formats.
 */

import type { ValidationError } from '../../../src/types/parser';
import type { VSTGUIUIDescription } from '../../../src/types/uidesc';

// ============================================================================
// Types
// ============================================================================

/**
 * Supported output formats for serialization.
 */
export type SaveFormat = 'json' | 'xml';

/**
 * Options for JSON serialization.
 */
export interface JsonSerializeOptions {
  /**
   * Output pretty-printed JSON with indentation.
   * @default true
   */
  pretty?: boolean;

  /**
   * Number of spaces for indentation (when pretty=true).
   * @default 2
   */
  indent?: number;
}

/**
 * Result of pre-save validation.
 */
export interface SaveValidationResult {
  /**
   * True if document is valid for saving.
   */
  valid: boolean;

  /**
   * Critical errors that should block save.
   */
  errors: ValidationError[];

  /**
   * Non-critical warnings (save can proceed with user confirmation).
   */
  warnings: ValidationError[];
}

// ============================================================================
// Serializer Interface
// ============================================================================

/**
 * Serialize document to JSON string.
 *
 * @param doc - The VSTGUIUIDescription document to serialize
 * @param options - Optional formatting options
 * @returns JSON string representation
 *
 * @example
 * ```typescript
 * // Pretty-printed (default)
 * const json = serializeToJson(doc);
 *
 * // Minified
 * const minified = serializeToJson(doc, { pretty: false });
 *
 * // Custom indentation
 * const custom = serializeToJson(doc, { indent: 4 });
 * ```
 */
export declare function serializeToJson(
  doc: VSTGUIUIDescription,
  options?: JsonSerializeOptions
): string;

/**
 * Serialize document to VSTGUI XML string.
 *
 * Output follows VSTGUI's expected XML format:
 * - XML declaration with UTF-8 encoding
 * - vstgui-ui-description root element with version
 * - Resource sections (colors, fonts, bitmaps, etc.)
 * - Templates with nested view hierarchy
 *
 * @param doc - The VSTGUIUIDescription document to serialize
 * @returns XML string representation
 *
 * @example
 * ```typescript
 * const xml = serializeToXml(doc);
 * // <?xml version="1.0" encoding="UTF-8"?>
 * // <vstgui-ui-description version="1">
 * //   ...
 * // </vstgui-ui-description>
 * ```
 */
export declare function serializeToXml(doc: VSTGUIUIDescription): string;

/**
 * Validate document before saving.
 *
 * Performs schema validation and custom checks:
 * - JSON Schema validation (via existing AJV validator)
 * - Required structure validation
 * - Reference integrity checks (warnings only)
 *
 * @param doc - The document to validate
 * @returns Validation result with errors and warnings
 *
 * @example
 * ```typescript
 * const result = validateDocument(doc);
 * if (!result.valid) {
 *   console.error('Cannot save:', result.errors);
 * }
 * if (result.warnings.length > 0) {
 *   console.warn('Warnings:', result.warnings);
 *   // Allow save with user confirmation
 * }
 * ```
 */
export declare function validateDocument(doc: VSTGUIUIDescription): SaveValidationResult;
