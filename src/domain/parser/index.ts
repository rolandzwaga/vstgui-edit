/**
 * Parser module public API
 *
 * This module handles parsing and validation of uidesc files in both JSON and XML formats.
 */

import type { ParseResult, ValidationError } from '../../types/parser';
import type { VSTGUIUIDescription } from '../../types/uidesc';
import { detectFormat } from './formatDetector';
import { parseJson } from './jsonParser';
import { validateUidesc } from './validator';
import { parseXmlContent } from './xmlParser';
import { xmlToJson } from './xmlToJson';

// Re-export types for convenience
export type {
  FormatType,
  ParseResult,
  ParseState,
  ValidationError,
} from '../../types/parser';

// Format detection (Phase 2)
export { detectFormat } from './formatDetector';
// JSON parsing (Phase 3)
export { parseJson } from './jsonParser';
// Schema validation (Phase 2)
export { type ValidateResult, validateUidesc } from './validator';
// XML parsing (Phase 4)
export { parseXmlContent, type XmlParseResult } from './xmlParser';
export { type XmlToJsonResult, xmlToJson } from './xmlToJson';

/**
 * Main entry point for parsing uidesc content.
 *
 * Automatically detects format (JSON or XML) and routes to the appropriate parser.
 *
 * FR-000: Automatically trigger parsing
 * FR-001: Auto-detect file format
 * FR-003: Report clear error if format cannot be determined
 *
 * @param content - The raw uidesc file content
 * @returns ParseResult with either the parsed document or errors
 */
export function parseUidesc(content: string): ParseResult {
  const format = detectFormat(content);

  if (format === 'unknown') {
    const error: ValidationError = {
      type: 'format',
      message: 'Unable to determine file format. Expected JSON or XML.',
    };
    return {
      success: false,
      errors: [error],
      format: 'unknown',
    };
  }

  if (format === 'json') {
    return parseJson(content);
  }

  // XML format (FR-009, FR-010, FR-011)
  return parseXml(content);
}

/**
 * Parses XML content, converts to JSON, and validates against schema.
 *
 * FR-009: Parse XML using browser-native DOMParser
 * FR-010: Convert XML tree to JSON-equivalent structure
 * FR-011: Validate converted JSON using AJV
 * FR-012: Map validation errors back to XML element locations
 *
 * @param content - The raw XML string to parse
 * @returns ParseResult with either the parsed document or errors
 */
function parseXml(content: string): ParseResult {
  // Step 1: Parse XML with DOMParser (FR-009)
  const xmlResult = parseXmlContent(content);

  if (!xmlResult.success) {
    return {
      success: false,
      errors: [xmlResult.error],
      format: 'xml',
    };
  }

  // Step 2: Convert to JSON structure (FR-010)
  const { json, pathMap } = xmlToJson(xmlResult.document);

  // Step 3: Validate against schema (FR-011)
  const validationResult = validateUidesc(json);

  if (!validationResult.valid) {
    // FR-012: Map error paths to XML element locations
    const errorsWithXmlPaths: ValidationError[] = validationResult.errors.map(error => {
      const xmlElement = error.path ? pathMap.get(error.path) : undefined;
      return {
        ...error,
        xmlPath: xmlElement ? getXmlPath(xmlElement) : undefined,
      };
    });

    return {
      success: false,
      errors: errorsWithXmlPaths,
      format: 'xml',
    };
  }

  // Step 4: Return typed document
  return {
    success: true,
    document: json as VSTGUIUIDescription,
    format: 'xml',
  };
}

/**
 * Builds an XPath-like string for an XML element
 */
function getXmlPath(element: Element): string {
  const parts: string[] = [];
  let current: Element | null = element;

  while (current && current.nodeType === Node.ELEMENT_NODE) {
    let selector = current.tagName.toLowerCase();
    const nameAttr = current.getAttribute('name');
    if (nameAttr) {
      selector += `[@name="${nameAttr}"]`;
    }
    parts.unshift(selector);
    current = current.parentElement;
  }

  return `/${parts.join('/')}`;
}
