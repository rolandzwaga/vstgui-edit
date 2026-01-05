import type { ValidationError } from '../../types/parser';

/**
 * Result of XML parsing
 */
export type XmlParseResult =
  | { success: true; document: Document }
  | { success: false; error: ValidationError };

/**
 * Unicode BOM (Byte Order Mark) character
 */
const BOM = '\uFEFF';

/**
 * Parses XML content using browser-native DOMParser.
 *
 * FR-009: System MUST parse XML using browser-native DOMParser
 *
 * @param content - The raw XML string to parse
 * @returns XmlParseResult with either the parsed Document or an error
 */
export function parseXmlContent(content: string): XmlParseResult {
  // Strip BOM if present
  let xmlContent = content;
  if (xmlContent.startsWith(BOM)) {
    xmlContent = xmlContent.slice(1);
  }

  // Handle empty content
  if (xmlContent.trim().length === 0) {
    return {
      success: false,
      error: {
        type: 'syntax',
        message: 'Empty XML content',
      },
    };
  }

  // Parse using DOMParser
  const parser = new DOMParser();
  const doc = parser.parseFromString(xmlContent, 'application/xml');

  // Check for parse errors
  // DOMParser doesn't throw - it returns a document with a parsererror element
  const parseError = doc.querySelector('parsererror');
  if (parseError) {
    // Extract error message from parsererror element
    const errorMessage = parseError.textContent ?? 'XML parse error';

    return {
      success: false,
      error: {
        type: 'syntax',
        message: errorMessage,
      },
    };
  }

  return {
    success: true,
    document: doc,
  };
}
