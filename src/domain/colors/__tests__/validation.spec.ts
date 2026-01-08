import { describe, expect, test } from 'vitest';
import { normalizeHexColor, validateColorName, validateHexColor } from '../validation';

describe('validateHexColor', () => {
  describe('valid formats', () => {
    test('accepts #RGB format', () => {
      const result = validateHexColor('#f00');
      expect(result.valid).toBe(true);
      expect(result.normalized).toBe('#f00');
    });

    test('accepts #RRGGBB format', () => {
      const result = validateHexColor('#ff0000');
      expect(result.valid).toBe(true);
      expect(result.normalized).toBe('#ff0000');
    });

    test('accepts #RRGGBBAA format', () => {
      const result = validateHexColor('#ff0000ff');
      expect(result.valid).toBe(true);
      expect(result.normalized).toBe('#ff0000ff');
    });

    test('accepts uppercase hex values', () => {
      const result = validateHexColor('#FF0000');
      expect(result.valid).toBe(true);
    });

    test('accepts mixed case hex values', () => {
      const result = validateHexColor('#Ff00Aa');
      expect(result.valid).toBe(true);
    });
  });

  describe('auto-correction', () => {
    test('prepends # if missing', () => {
      const result = validateHexColor('ff0000');
      expect(result.valid).toBe(true);
      expect(result.normalized).toBe('#ff0000');
    });

    test('prepends # to 3-char hex if missing', () => {
      const result = validateHexColor('f00');
      expect(result.valid).toBe(true);
      expect(result.normalized).toBe('#f00');
    });
  });

  describe('invalid formats', () => {
    test('rejects named colors', () => {
      const result = validateHexColor('red');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Invalid hex color');
    });

    test('rejects 2-char hex', () => {
      const result = validateHexColor('#ff');
      expect(result.valid).toBe(false);
    });

    test('rejects 4-char hex', () => {
      const result = validateHexColor('#ffff');
      expect(result.valid).toBe(false);
    });

    test('rejects 5-char hex', () => {
      const result = validateHexColor('#fffff');
      expect(result.valid).toBe(false);
    });

    test('rejects 7-char hex', () => {
      const result = validateHexColor('#fffffff');
      expect(result.valid).toBe(false);
    });

    test('rejects 9-char hex', () => {
      const result = validateHexColor('#fffffffff');
      expect(result.valid).toBe(false);
    });

    test('rejects non-hex characters', () => {
      const result = validateHexColor('#gggggg');
      expect(result.valid).toBe(false);
    });

    test('rejects empty string', () => {
      const result = validateHexColor('');
      expect(result.valid).toBe(false);
    });

    test('rejects whitespace-only', () => {
      const result = validateHexColor('   ');
      expect(result.valid).toBe(false);
    });
  });
});

describe('validateColorName', () => {
  const existingNames = ['Background', 'Text', 'Accent'];

  describe('valid names', () => {
    test('accepts unique name', () => {
      const result = validateColorName('NewColor', existingNames);
      expect(result.valid).toBe(true);
    });

    test('accepts name with spaces', () => {
      const result = validateColorName('Background Color', existingNames);
      expect(result.valid).toBe(true);
    });

    test('accepts name with numbers', () => {
      const result = validateColorName('Color123', existingNames);
      expect(result.valid).toBe(true);
    });

    test('is case-sensitive', () => {
      const result = validateColorName('background', existingNames);
      expect(result.valid).toBe(true);
    });
  });

  describe('invalid names', () => {
    test('rejects duplicate name', () => {
      const result = validateColorName('Background', existingNames);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('already exists');
    });

    test('rejects empty string', () => {
      const result = validateColorName('', existingNames);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('cannot be empty');
    });

    test('rejects whitespace-only', () => {
      const result = validateColorName('   ', existingNames);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('cannot be empty');
    });
  });
});

describe('normalizeHexColor', () => {
  test('converts uppercase to lowercase', () => {
    expect(normalizeHexColor('#FF0000')).toBe('#ff0000');
  });

  test('preserves lowercase', () => {
    expect(normalizeHexColor('#ff0000')).toBe('#ff0000');
  });

  test('handles mixed case', () => {
    expect(normalizeHexColor('#Ff00Aa')).toBe('#ff00aa');
  });

  test('handles 3-char format', () => {
    expect(normalizeHexColor('#F00')).toBe('#f00');
  });

  test('handles 8-char format with alpha', () => {
    expect(normalizeHexColor('#FF0000FF')).toBe('#ff0000ff');
  });
});
