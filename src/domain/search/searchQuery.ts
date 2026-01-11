/**
 * Search Query Parsing
 * Functions for parsing user input into structured search queries.
 */

import type { SearchQuery, SearchQueryType } from '../../types/search';

/**
 * Known VSTGUI class prefixes for class detection.
 */
export const CLASS_PREFIXES = ['C', 'UI'] as const;

/**
 * Parse raw search input into structured query.
 *
 * Determines query type based on input format:
 * - "attribute:value" -> attribute search
 * - "CClassName" (starts with C + uppercase) -> class search
 * - Other -> global search (matches class or any attribute)
 *
 * @param input - Raw search input string
 * @returns Parsed SearchQuery
 */
export function parseSearchQuery(input: string): SearchQuery {
  const trimmed = input.trim();

  if (trimmed === '') {
    return { type: 'global', term: '' };
  }

  // Check for attribute:value syntax
  // Find first unescaped colon
  const colonIndex = findUnescapedColon(trimmed);

  if (colonIndex > 0) {
    const attributeName = trimmed.slice(0, colonIndex);
    const value = unescapeValue(trimmed.slice(colonIndex + 1));

    return {
      type: 'attribute',
      term: trimmed,
      attributeName,
      value,
    };
  }

  // Check if it looks like a class name
  if (isClassNameLike(trimmed)) {
    return {
      type: 'class',
      term: trimmed,
    };
  }

  // Default to global search
  return {
    type: 'global',
    term: trimmed,
  };
}

/**
 * Find the index of the first unescaped colon in a string.
 * Returns -1 if no unescaped colon is found.
 *
 * @param input - String to search
 * @returns Index of first unescaped colon, or -1
 */
function findUnescapedColon(input: string): number {
  for (let i = 0; i < input.length; i++) {
    if (input[i] === ':') {
      // Check if the colon is escaped (preceded by backslash)
      if (i > 0 && input[i - 1] === '\\') {
        continue;
      }
      return i;
    }
  }
  return -1;
}

/**
 * Determine if input looks like a VSTGUI class name search.
 *
 * @param input - String to check
 * @returns true if matches class name pattern
 */
export function isClassNameLike(input: string): boolean {
  if (input.length < 2) {
    return false;
  }

  // Check for known class prefixes followed by uppercase letter
  for (const prefix of CLASS_PREFIXES) {
    if (input.startsWith(prefix) && input.length > prefix.length) {
      const nextChar = input[prefix.length];
      // Next character should be uppercase
      if (nextChar >= 'A' && nextChar <= 'Z') {
        return true;
      }
    }
  }

  return false;
}

/**
 * Escape special characters in search term for literal matching.
 * Escapes colons and backslashes.
 *
 * @param term - Search term
 * @returns Escaped term
 */
export function escapeSearchTerm(term: string): string {
  return term.replace(/\\/g, '\\\\').replace(/:/g, '\\:');
}

/**
 * Unescape special characters (e.g., \: -> :).
 *
 * @param value - Escaped value
 * @returns Unescaped value
 */
export function unescapeValue(value: string): string {
  return value.replace(/\\:/g, ':').replace(/\\\\/g, '\\');
}
