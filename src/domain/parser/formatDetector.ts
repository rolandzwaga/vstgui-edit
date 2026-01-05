import type { FormatType } from '../../types/parser';

/**
 * Unicode BOM (Byte Order Mark) character
 */
const BOM = '\uFEFF';

/**
 * Detects the format of uidesc file content.
 *
 * FR-001: Auto-detect file format by examining content
 * - JSON starts with `{` or `[`
 * - XML starts with `<` (including `<?xml` declarations)
 *
 * FR-002: Handle leading whitespace before format detection characters
 *
 * @param content - The raw file content to analyze
 * @returns The detected format: 'json', 'xml', or 'unknown'
 */
export function detectFormat(content: string): FormatType {
  // Strip BOM if present (edge case for UTF-8 files with BOM)
  let trimmed = content;
  if (trimmed.startsWith(BOM)) {
    trimmed = trimmed.slice(1);
  }

  // FR-002: Handle leading whitespace
  trimmed = trimmed.trimStart();

  // Empty content after trimming
  if (trimmed.length === 0) {
    return 'unknown';
  }

  const firstChar = trimmed[0];

  // FR-001: JSON detection - starts with { or [
  if (firstChar === '{' || firstChar === '[') {
    return 'json';
  }

  // FR-001: XML detection - starts with <
  if (firstChar === '<') {
    return 'xml';
  }

  return 'unknown';
}
