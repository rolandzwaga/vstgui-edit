/**
 * Duplicate bitmap detection using proper JSON tokenization.
 *
 * JSON.parse() silently discards duplicate keys, keeping only the last value.
 * This module detects duplicates by tokenizing the raw JSON content and tracking
 * key occurrences at the bitmaps object level.
 */

/**
 * Information about a duplicate bitmap name.
 */
export interface DuplicateBitmapInfo {
  /** The duplicate bitmap name */
  name: string;
  /** Number of times this name appears */
  count: number;
  /** The paths associated with each occurrence (if available) */
  paths: string[];
}

/**
 * Token types for JSON parsing.
 */
type TokenType =
  | 'string'
  | 'number'
  | 'true'
  | 'false'
  | 'null'
  | 'lbrace'
  | 'rbrace'
  | 'lbracket'
  | 'rbracket'
  | 'colon'
  | 'comma';

interface Token {
  type: TokenType;
  value: string;
  raw?: string; // Original string content before unescaping
}

/**
 * Simple JSON tokenizer.
 * Returns an array of tokens from JSON content.
 */
function tokenize(json: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;

  while (i < json.length) {
    const char = json[i];

    // Skip whitespace
    if (char === ' ' || char === '\t' || char === '\n' || char === '\r') {
      i++;
      continue;
    }

    // Structural characters
    if (char === '{') {
      tokens.push({ type: 'lbrace', value: '{' });
      i++;
      continue;
    }
    if (char === '}') {
      tokens.push({ type: 'rbrace', value: '}' });
      i++;
      continue;
    }
    if (char === '[') {
      tokens.push({ type: 'lbracket', value: '[' });
      i++;
      continue;
    }
    if (char === ']') {
      tokens.push({ type: 'rbracket', value: ']' });
      i++;
      continue;
    }
    if (char === ':') {
      tokens.push({ type: 'colon', value: ':' });
      i++;
      continue;
    }
    if (char === ',') {
      tokens.push({ type: 'comma', value: ',' });
      i++;
      continue;
    }

    // String
    if (char === '"') {
      const start = i;
      i++; // Skip opening quote
      let value = '';

      while (i < json.length) {
        const c = json[i];
        if (c === '\\' && i + 1 < json.length) {
          // Handle escape sequences
          const next = json[i + 1];
          if (next === '"') {
            value += '"';
            i += 2;
          } else if (next === '\\') {
            value += '\\';
            i += 2;
          } else if (next === '/') {
            value += '/';
            i += 2;
          } else if (next === 'b') {
            value += '\b';
            i += 2;
          } else if (next === 'f') {
            value += '\f';
            i += 2;
          } else if (next === 'n') {
            value += '\n';
            i += 2;
          } else if (next === 'r') {
            value += '\r';
            i += 2;
          } else if (next === 't') {
            value += '\t';
            i += 2;
          } else if (next === 'u' && i + 5 < json.length) {
            // Unicode escape
            const hex = json.substring(i + 2, i + 6);
            const codePoint = parseInt(hex, 16);
            if (!isNaN(codePoint)) {
              value += String.fromCharCode(codePoint);
              i += 6;
            } else {
              value += c;
              i++;
            }
          } else {
            value += c;
            i++;
          }
        } else if (c === '"') {
          // End of string
          i++; // Skip closing quote
          break;
        } else {
          value += c;
          i++;
        }
      }

      tokens.push({ type: 'string', value, raw: json.substring(start, i) });
      continue;
    }

    // Numbers
    if (char === '-' || (char >= '0' && char <= '9')) {
      let value = '';
      while (i < json.length && /[-+0-9.eE]/.test(json[i])) {
        value += json[i];
        i++;
      }
      tokens.push({ type: 'number', value });
      continue;
    }

    // true, false, null
    if (json.substring(i, i + 4) === 'true') {
      tokens.push({ type: 'true', value: 'true' });
      i += 4;
      continue;
    }
    if (json.substring(i, i + 5) === 'false') {
      tokens.push({ type: 'false', value: 'false' });
      i += 5;
      continue;
    }
    if (json.substring(i, i + 4) === 'null') {
      tokens.push({ type: 'null', value: 'null' });
      i += 4;
      continue;
    }

    // Unknown character - skip (allows for some malformed JSON tolerance)
    i++;
  }

  return tokens;
}

/**
 * Detects duplicate bitmap keys in JSON content.
 *
 * Parses the JSON tokens and tracks keys within the "bitmaps" object,
 * reporting any keys that appear more than once.
 *
 * @param content - Raw JSON content
 * @returns Array of duplicate bitmap info (only names that appear more than once)
 */
export function detectDuplicateKeysInJsonBitmaps(content: string): DuplicateBitmapInfo[] {
  let tokens: Token[];
  try {
    tokens = tokenize(content);
  } catch {
    return [];
  }

  if (tokens.length === 0) {
    return [];
  }

  // Track bitmap keys: name -> { count, paths }
  const bitmapKeys = new Map<string, { count: number; paths: string[] }>();

  // State machine to find and parse the bitmaps object
  let i = 0;
  let depth = 0;
  let inBitmapsObject = false;
  let bitmapsObjectDepth = -1;
  let expectingKey = false;
  let lastKey = '';
  let expectingValue = false;
  let inNestedObject = false;
  let nestedObjectDepth = -1;

  while (i < tokens.length) {
    const token = tokens[i];

    if (token.type === 'lbrace') {
      depth++;

      if (inBitmapsObject && !inNestedObject && depth > bitmapsObjectDepth + 1) {
        // Entering a nested object within a bitmap value
        inNestedObject = true;
        nestedObjectDepth = depth;
      }

      if (inBitmapsObject && depth === bitmapsObjectDepth + 1 && expectingValue) {
        // This is the start of a bitmap value object like { "path": "..." }
        inNestedObject = true;
        nestedObjectDepth = depth;
      }

      i++;
      continue;
    }

    if (token.type === 'rbrace') {
      if (inNestedObject && depth === nestedObjectDepth) {
        inNestedObject = false;
        nestedObjectDepth = -1;
        expectingValue = false;
      }

      if (inBitmapsObject && depth === bitmapsObjectDepth) {
        // Exiting the bitmaps object
        inBitmapsObject = false;
        bitmapsObjectDepth = -1;
      }

      depth--;
      i++;
      continue;
    }

    if (token.type === 'lbracket') {
      // Skip arrays - bitmaps shouldn't be in arrays
      i++;
      continue;
    }

    if (token.type === 'rbracket') {
      i++;
      continue;
    }

    if (token.type === 'colon') {
      expectingValue = true;
      i++;
      continue;
    }

    if (token.type === 'comma') {
      expectingValue = false;
      if (inBitmapsObject && depth === bitmapsObjectDepth + 1 && !inNestedObject) {
        expectingKey = true;
      }
      i++;
      continue;
    }

    if (token.type === 'string') {
      // Check if this is the "bitmaps" key
      if (!inBitmapsObject && token.value === 'bitmaps') {
        // Look ahead for colon and lbrace
        if (i + 2 < tokens.length && tokens[i + 1].type === 'colon' && tokens[i + 2].type === 'lbrace') {
          inBitmapsObject = true;
          bitmapsObjectDepth = depth + 1; // The depth after we enter the bitmaps object
          expectingKey = true;
          i += 3; // Skip "bitmaps", colon, and lbrace
          depth++; // We entered the bitmaps object
          continue;
        }
      }

      // If we're in the bitmaps object at the right depth, track keys
      if (inBitmapsObject && depth === bitmapsObjectDepth && !inNestedObject) {
        // Check if this is a key (followed by colon)
        if (i + 1 < tokens.length && tokens[i + 1].type === 'colon') {
          // This is a bitmap key
          const key = token.value;
          lastKey = key;

          const existing = bitmapKeys.get(key);
          if (existing) {
            existing.count++;
          } else {
            bitmapKeys.set(key, { count: 1, paths: [] });
          }

          expectingKey = false;
          i++;
          continue;
        }
      }

      // If we're expecting a value and have a lastKey, this might be a path
      if (inBitmapsObject && expectingValue && lastKey) {
        if (!inNestedObject) {
          // Direct string value - this is the path
          const entry = bitmapKeys.get(lastKey);
          if (entry) {
            entry.paths.push(token.value);
          }
          expectingValue = false;
          lastKey = '';
        } else if (inNestedObject && depth === nestedObjectDepth) {
          // We're inside a nested object, check if this is a "path" key
          if (token.value === 'path' && i + 2 < tokens.length) {
            if (tokens[i + 1].type === 'colon' && tokens[i + 2].type === 'string') {
              const pathValue = tokens[i + 2].value;
              const entry = bitmapKeys.get(lastKey);
              if (entry) {
                entry.paths.push(pathValue);
              }
              i += 3;
              continue;
            }
          }
        }
      }
    }

    i++;
  }

  // Convert to result array, filtering to only duplicates
  const duplicates: DuplicateBitmapInfo[] = [];
  for (const [name, info] of bitmapKeys) {
    if (info.count > 1) {
      duplicates.push({
        name,
        count: info.count,
        paths: info.paths,
      });
    }
  }

  return duplicates;
}
