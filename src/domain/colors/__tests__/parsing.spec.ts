import { describe, expect, test } from 'vitest';
import { getPredefinedColorValue, isPredefinedColor, parseHexColor } from '../parsing';

describe('parseHexColor', () => {
  describe('#RGB format', () => {
    test('parses #f00 to red', () => {
      const result = parseHexColor('#f00');
      expect(result).toEqual({ r: 255, g: 0, b: 0, a: 255 });
    });

    test('parses #0f0 to green', () => {
      const result = parseHexColor('#0f0');
      expect(result).toEqual({ r: 0, g: 255, b: 0, a: 255 });
    });

    test('parses #00f to blue', () => {
      const result = parseHexColor('#00f');
      expect(result).toEqual({ r: 0, g: 0, b: 255, a: 255 });
    });

    test('defaults alpha to 255', () => {
      const result = parseHexColor('#abc');
      expect(result?.a).toBe(255);
    });
  });

  describe('#RRGGBB format', () => {
    test('parses #ff0000 to red', () => {
      const result = parseHexColor('#ff0000');
      expect(result).toEqual({ r: 255, g: 0, b: 0, a: 255 });
    });

    test('parses #2d2d2d to dark gray', () => {
      const result = parseHexColor('#2d2d2d');
      expect(result).toEqual({ r: 45, g: 45, b: 45, a: 255 });
    });

    test('parses without # prefix', () => {
      const result = parseHexColor('ff0000');
      expect(result).toEqual({ r: 255, g: 0, b: 0, a: 255 });
    });
  });

  describe('#RRGGBBAA format', () => {
    test('parses #ff0000ff to opaque red', () => {
      const result = parseHexColor('#ff0000ff');
      expect(result).toEqual({ r: 255, g: 0, b: 0, a: 255 });
    });

    test('parses #ff000080 to 50% transparent red', () => {
      const result = parseHexColor('#ff000080');
      expect(result).toEqual({ r: 255, g: 0, b: 0, a: 128 });
    });

    test('parses #ff000000 to fully transparent red', () => {
      const result = parseHexColor('#ff000000');
      expect(result).toEqual({ r: 255, g: 0, b: 0, a: 0 });
    });
  });

  describe('invalid input', () => {
    test('returns null for invalid hex', () => {
      expect(parseHexColor('#gg0000')).toBeNull();
    });

    test('returns null for wrong length', () => {
      expect(parseHexColor('#ff00')).toBeNull();
      expect(parseHexColor('#ff00000')).toBeNull();
    });

    test('returns null for empty string', () => {
      expect(parseHexColor('')).toBeNull();
    });
  });
});

describe('isPredefinedColor', () => {
  test('returns true for ~ prefix', () => {
    expect(isPredefinedColor('~ BlackCColor')).toBe(true);
    expect(isPredefinedColor('~ WhiteCColor')).toBe(true);
  });

  test('returns false for regular colors', () => {
    expect(isPredefinedColor('Background')).toBe(false);
    expect(isPredefinedColor('#ff0000')).toBe(false);
  });
});

describe('getPredefinedColorValue', () => {
  test('returns hex for BlackCColor', () => {
    expect(getPredefinedColorValue('~ BlackCColor')).toBe('#000000ff');
  });

  test('returns hex for WhiteCColor', () => {
    expect(getPredefinedColorValue('~ WhiteCColor')).toBe('#ffffffff');
  });

  test('returns hex for TransparentCColor', () => {
    expect(getPredefinedColorValue('~ TransparentCColor')).toBe('#00000000');
  });

  test('returns null for unknown predefined', () => {
    expect(getPredefinedColorValue('~ UnknownCColor')).toBeNull();
  });

  test('returns null for non-predefined', () => {
    expect(getPredefinedColorValue('Background')).toBeNull();
  });
});
