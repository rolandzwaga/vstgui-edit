import { describe, expect, test } from 'vitest';
import {
  type DuplicateBitmapInfo,
  detectDuplicateKeysInJsonBitmaps,
} from '../duplicateDetection';

describe('duplicateDetection', () => {
  describe('detectDuplicateKeysInJsonBitmaps', () => {
    test('returns empty array when no bitmaps section', () => {
      const json = '{ "vstgui-ui-description": { "version": "1" } }';
      expect(detectDuplicateKeysInJsonBitmaps(json)).toEqual([]);
    });

    test('returns empty array when bitmaps section is empty', () => {
      const json = '{ "bitmaps": {} }';
      expect(detectDuplicateKeysInJsonBitmaps(json)).toEqual([]);
    });

    test('returns empty array when no duplicates exist', () => {
      const json = `{
        "bitmaps": {
          "knob": "knob.png",
          "button": "button.png"
        }
      }`;
      expect(detectDuplicateKeysInJsonBitmaps(json)).toEqual([]);
    });

    test('detects duplicate bitmap names with string paths', () => {
      const json = `{
        "bitmaps": {
          "knob": "knob1.png",
          "knob": "knob2.png"
        }
      }`;
      const duplicates = detectDuplicateKeysInJsonBitmaps(json);

      expect(duplicates).toHaveLength(1);
      expect(duplicates[0].name).toBe('knob');
      expect(duplicates[0].count).toBe(2);
      expect(duplicates[0].paths).toContain('knob1.png');
      expect(duplicates[0].paths).toContain('knob2.png');
    });

    test('detects duplicate bitmap names with object paths', () => {
      const json = `{
        "bitmaps": {
          "knob": { "path": "knob1.png" },
          "knob": { "path": "knob2.png" }
        }
      }`;
      const duplicates = detectDuplicateKeysInJsonBitmaps(json);

      expect(duplicates).toHaveLength(1);
      expect(duplicates[0].name).toBe('knob');
      expect(duplicates[0].count).toBe(2);
      expect(duplicates[0].paths).toContain('knob1.png');
      expect(duplicates[0].paths).toContain('knob2.png');
    });

    test('detects multiple different duplicates', () => {
      const json = `{
        "bitmaps": {
          "a": "a1.png",
          "a": "a2.png",
          "b": "b1.png",
          "b": "b2.png",
          "b": "b3.png",
          "c": "c.png"
        }
      }`;
      const duplicates = detectDuplicateKeysInJsonBitmaps(json);

      expect(duplicates).toHaveLength(2);

      const adup = duplicates.find(d => d.name === 'a');
      const bdup = duplicates.find(d => d.name === 'b');

      expect(adup?.count).toBe(2);
      expect(bdup?.count).toBe(3);
    });

    test('does not count nested object keys as bitmap names', () => {
      const json = `{
        "bitmaps": {
          "knob": { "path": "knob.png", "nineparttiledoffsets": "1,2,3,4" }
        }
      }`;
      // "path" and "nineparttiledoffsets" are nested keys, not bitmap names
      expect(detectDuplicateKeysInJsonBitmaps(json)).toEqual([]);
    });

    test('handles mixed string and object bitmap definitions', () => {
      const json = `{
        "bitmaps": {
          "knob": "knob1.png",
          "knob": { "path": "knob2.png" }
        }
      }`;
      const duplicates = detectDuplicateKeysInJsonBitmaps(json);

      expect(duplicates).toHaveLength(1);
      expect(duplicates[0].paths).toContain('knob1.png');
      expect(duplicates[0].paths).toContain('knob2.png');
    });

    test('handles bitmaps nested in vstgui-ui-description', () => {
      const json = `{
        "vstgui-ui-description": {
          "version": "1",
          "bitmaps": {
            "knob": "knob1.png",
            "knob": "knob2.png"
          }
        }
      }`;
      const duplicates = detectDuplicateKeysInJsonBitmaps(json);

      expect(duplicates).toHaveLength(1);
      expect(duplicates[0].name).toBe('knob');
    });

    test('returns empty array for invalid JSON', () => {
      const invalid = 'not valid json {{{';
      expect(detectDuplicateKeysInJsonBitmaps(invalid)).toEqual([]);
    });

    test('handles escaped quotes in strings', () => {
      const json = `{
        "bitmaps": {
          "my\\"knob": "path1.png",
          "my\\"knob": "path2.png"
        }
      }`;
      const duplicates = detectDuplicateKeysInJsonBitmaps(json);

      expect(duplicates).toHaveLength(1);
      expect(duplicates[0].name).toBe('my"knob');
    });

    test('handles unicode in bitmap names', () => {
      const json = `{
        "bitmaps": {
          "knöb": "knob1.png",
          "knöb": "knob2.png"
        }
      }`;
      const duplicates = detectDuplicateKeysInJsonBitmaps(json);

      expect(duplicates).toHaveLength(1);
      expect(duplicates[0].name).toBe('knöb');
    });
  });
});
