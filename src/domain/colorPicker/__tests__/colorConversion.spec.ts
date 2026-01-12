/**
 * Color Conversion Tests
 *
 * Tests for RGB <-> HSV <-> HSL conversions and hex parsing/formatting.
 * Written following TDD approach - tests first, then implementation.
 */

import { describe, expect, test } from 'vitest';
import {
  clamp,
  createColorValue,
  hslToRgb,
  hsvToRgb,
  isValidHex,
  parseHexToRgba,
  rgbaToHex,
  rgbToHsl,
  rgbToHsv,
  roundTo,
} from '../colorConversion';

describe('colorConversion', () => {
  // ===========================================================================
  // Utility Functions
  // ===========================================================================

  describe('clamp', () => {
    test('clamps value below minimum to minimum', () => {
      expect(clamp(-10, 0, 100)).toBe(0);
    });

    test('clamps value above maximum to maximum', () => {
      expect(clamp(150, 0, 100)).toBe(100);
    });

    test('returns value unchanged when within range', () => {
      expect(clamp(50, 0, 100)).toBe(50);
    });

    test('returns minimum when value equals minimum', () => {
      expect(clamp(0, 0, 100)).toBe(0);
    });

    test('returns maximum when value equals maximum', () => {
      expect(clamp(100, 0, 100)).toBe(100);
    });
  });

  describe('roundTo', () => {
    test('rounds to integer by default', () => {
      expect(roundTo(5.6)).toBe(6);
      expect(roundTo(5.4)).toBe(5);
    });

    test('rounds to specified decimal places', () => {
      expect(roundTo(5.678, 2)).toBe(5.68);
      expect(roundTo(5.674, 2)).toBe(5.67);
    });

    test('handles zero decimal places', () => {
      expect(roundTo(5.6, 0)).toBe(6);
    });
  });

  describe('isValidHex', () => {
    test('validates 3-digit hex', () => {
      expect(isValidHex('#F00')).toBe(true);
      expect(isValidHex('#fff')).toBe(true);
      expect(isValidHex('#123')).toBe(true);
    });

    test('validates 6-digit hex', () => {
      expect(isValidHex('#FF0000')).toBe(true);
      expect(isValidHex('#ffffff')).toBe(true);
      expect(isValidHex('#123456')).toBe(true);
    });

    test('validates 8-digit hex', () => {
      expect(isValidHex('#FF0000FF')).toBe(true);
      expect(isValidHex('#12345678')).toBe(true);
    });

    test('rejects invalid hex values', () => {
      expect(isValidHex('FF0000')).toBe(false); // Missing #
      expect(isValidHex('#GG0000')).toBe(false); // Invalid chars
      expect(isValidHex('#FF00')).toBe(false); // Wrong length
      expect(isValidHex('#FF000')).toBe(false); // Wrong length
      expect(isValidHex('')).toBe(false);
      expect(isValidHex('invalid')).toBe(false);
    });
  });

  // ===========================================================================
  // RGB <-> HSV Conversion
  // ===========================================================================

  describe('rgbToHsv', () => {
    test('converts pure red', () => {
      const result = rgbToHsv(255, 0, 0);
      expect(result.h).toBe(0);
      expect(result.s).toBe(100);
      expect(result.v).toBe(100);
    });

    test('converts pure green', () => {
      const result = rgbToHsv(0, 255, 0);
      expect(result.h).toBe(120);
      expect(result.s).toBe(100);
      expect(result.v).toBe(100);
    });

    test('converts pure blue', () => {
      const result = rgbToHsv(0, 0, 255);
      expect(result.h).toBe(240);
      expect(result.s).toBe(100);
      expect(result.v).toBe(100);
    });

    test('converts black', () => {
      const result = rgbToHsv(0, 0, 0);
      expect(result.h).toBe(0);
      expect(result.s).toBe(0);
      expect(result.v).toBe(0);
    });

    test('converts white', () => {
      const result = rgbToHsv(255, 255, 255);
      expect(result.h).toBe(0);
      expect(result.s).toBe(0);
      expect(result.v).toBe(100);
    });

    test('converts gray (50%)', () => {
      const result = rgbToHsv(128, 128, 128);
      expect(result.h).toBe(0);
      expect(result.s).toBe(0);
      expect(result.v).toBeCloseTo(50, 0);
    });

    test('converts yellow', () => {
      const result = rgbToHsv(255, 255, 0);
      expect(result.h).toBe(60);
      expect(result.s).toBe(100);
      expect(result.v).toBe(100);
    });

    test('converts cyan', () => {
      const result = rgbToHsv(0, 255, 255);
      expect(result.h).toBe(180);
      expect(result.s).toBe(100);
      expect(result.v).toBe(100);
    });

    test('converts magenta', () => {
      const result = rgbToHsv(255, 0, 255);
      expect(result.h).toBe(300);
      expect(result.s).toBe(100);
      expect(result.v).toBe(100);
    });
  });

  describe('hsvToRgb', () => {
    test('converts pure red', () => {
      const result = hsvToRgb(0, 100, 100);
      expect(result.r).toBe(255);
      expect(result.g).toBe(0);
      expect(result.b).toBe(0);
    });

    test('converts pure green', () => {
      const result = hsvToRgb(120, 100, 100);
      expect(result.r).toBe(0);
      expect(result.g).toBe(255);
      expect(result.b).toBe(0);
    });

    test('converts pure blue', () => {
      const result = hsvToRgb(240, 100, 100);
      expect(result.r).toBe(0);
      expect(result.g).toBe(0);
      expect(result.b).toBe(255);
    });

    test('converts black', () => {
      const result = hsvToRgb(0, 0, 0);
      expect(result.r).toBe(0);
      expect(result.g).toBe(0);
      expect(result.b).toBe(0);
    });

    test('converts white', () => {
      const result = hsvToRgb(0, 0, 100);
      expect(result.r).toBe(255);
      expect(result.g).toBe(255);
      expect(result.b).toBe(255);
    });

    test('converts gray (50%)', () => {
      const result = hsvToRgb(0, 0, 50);
      expect(result.r).toBeCloseTo(128, 0);
      expect(result.g).toBeCloseTo(128, 0);
      expect(result.b).toBeCloseTo(128, 0);
    });
  });

  describe('RGB <-> HSV round-trip (SC-003)', () => {
    test('red round-trip produces values within +/-1', () => {
      const rgb = { r: 255, g: 0, b: 0 };
      const hsv = rgbToHsv(rgb.r, rgb.g, rgb.b);
      const result = hsvToRgb(hsv.h, hsv.s, hsv.v);
      expect(Math.abs(result.r - rgb.r)).toBeLessThanOrEqual(1);
      expect(Math.abs(result.g - rgb.g)).toBeLessThanOrEqual(1);
      expect(Math.abs(result.b - rgb.b)).toBeLessThanOrEqual(1);
    });

    test('green round-trip produces values within +/-1', () => {
      const rgb = { r: 0, g: 255, b: 0 };
      const hsv = rgbToHsv(rgb.r, rgb.g, rgb.b);
      const result = hsvToRgb(hsv.h, hsv.s, hsv.v);
      expect(Math.abs(result.r - rgb.r)).toBeLessThanOrEqual(1);
      expect(Math.abs(result.g - rgb.g)).toBeLessThanOrEqual(1);
      expect(Math.abs(result.b - rgb.b)).toBeLessThanOrEqual(1);
    });

    test('blue round-trip produces values within +/-1', () => {
      const rgb = { r: 0, g: 0, b: 255 };
      const hsv = rgbToHsv(rgb.r, rgb.g, rgb.b);
      const result = hsvToRgb(hsv.h, hsv.s, hsv.v);
      expect(Math.abs(result.r - rgb.r)).toBeLessThanOrEqual(1);
      expect(Math.abs(result.g - rgb.g)).toBeLessThanOrEqual(1);
      expect(Math.abs(result.b - rgb.b)).toBeLessThanOrEqual(1);
    });

    test('arbitrary color round-trip produces values within +/-1', () => {
      const rgb = { r: 128, g: 64, b: 192 };
      const hsv = rgbToHsv(rgb.r, rgb.g, rgb.b);
      const result = hsvToRgb(hsv.h, hsv.s, hsv.v);
      expect(Math.abs(result.r - rgb.r)).toBeLessThanOrEqual(1);
      expect(Math.abs(result.g - rgb.g)).toBeLessThanOrEqual(1);
      expect(Math.abs(result.b - rgb.b)).toBeLessThanOrEqual(1);
    });
  });

  // ===========================================================================
  // RGB <-> HSL Conversion
  // ===========================================================================

  describe('rgbToHsl', () => {
    test('converts pure red', () => {
      const result = rgbToHsl(255, 0, 0);
      expect(result.h).toBe(0);
      expect(result.s).toBe(100);
      expect(result.l).toBe(50);
    });

    test('converts pure green', () => {
      const result = rgbToHsl(0, 255, 0);
      expect(result.h).toBe(120);
      expect(result.s).toBe(100);
      expect(result.l).toBe(50);
    });

    test('converts pure blue', () => {
      const result = rgbToHsl(0, 0, 255);
      expect(result.h).toBe(240);
      expect(result.s).toBe(100);
      expect(result.l).toBe(50);
    });

    test('converts black', () => {
      const result = rgbToHsl(0, 0, 0);
      expect(result.h).toBe(0);
      expect(result.s).toBe(0);
      expect(result.l).toBe(0);
    });

    test('converts white', () => {
      const result = rgbToHsl(255, 255, 255);
      expect(result.h).toBe(0);
      expect(result.s).toBe(0);
      expect(result.l).toBe(100);
    });

    test('converts gray (50%)', () => {
      const result = rgbToHsl(128, 128, 128);
      expect(result.h).toBe(0);
      expect(result.s).toBe(0);
      expect(result.l).toBeCloseTo(50, 0);
    });
  });

  describe('hslToRgb', () => {
    test('converts pure red', () => {
      const result = hslToRgb(0, 100, 50);
      expect(result.r).toBe(255);
      expect(result.g).toBe(0);
      expect(result.b).toBe(0);
    });

    test('converts pure green', () => {
      const result = hslToRgb(120, 100, 50);
      expect(result.r).toBe(0);
      expect(result.g).toBe(255);
      expect(result.b).toBe(0);
    });

    test('converts pure blue', () => {
      const result = hslToRgb(240, 100, 50);
      expect(result.r).toBe(0);
      expect(result.g).toBe(0);
      expect(result.b).toBe(255);
    });

    test('converts black', () => {
      const result = hslToRgb(0, 0, 0);
      expect(result.r).toBe(0);
      expect(result.g).toBe(0);
      expect(result.b).toBe(0);
    });

    test('converts white', () => {
      const result = hslToRgb(0, 0, 100);
      expect(result.r).toBe(255);
      expect(result.g).toBe(255);
      expect(result.b).toBe(255);
    });
  });

  describe('RGB <-> HSL round-trip (SC-003)', () => {
    test('red round-trip produces values within +/-1', () => {
      const rgb = { r: 255, g: 0, b: 0 };
      const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
      const result = hslToRgb(hsl.h, hsl.s, hsl.l);
      expect(Math.abs(result.r - rgb.r)).toBeLessThanOrEqual(1);
      expect(Math.abs(result.g - rgb.g)).toBeLessThanOrEqual(1);
      expect(Math.abs(result.b - rgb.b)).toBeLessThanOrEqual(1);
    });

    test('arbitrary color round-trip produces values within +/-1', () => {
      const rgb = { r: 128, g: 64, b: 192 };
      const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
      const result = hslToRgb(hsl.h, hsl.s, hsl.l);
      expect(Math.abs(result.r - rgb.r)).toBeLessThanOrEqual(1);
      expect(Math.abs(result.g - rgb.g)).toBeLessThanOrEqual(1);
      expect(Math.abs(result.b - rgb.b)).toBeLessThanOrEqual(1);
    });
  });

  // ===========================================================================
  // Hex Parsing
  // ===========================================================================

  describe('parseHexToRgba', () => {
    test('parses 6-digit hex', () => {
      const result = parseHexToRgba('#FF0000');
      expect(result).toEqual({ r: 255, g: 0, b: 0, a: 255 });
    });

    test('parses 8-digit hex', () => {
      const result = parseHexToRgba('#FF000080');
      expect(result).toEqual({ r: 255, g: 0, b: 0, a: 128 });
    });

    test('parses 3-digit shorthand', () => {
      const result = parseHexToRgba('#F00');
      expect(result).toEqual({ r: 255, g: 0, b: 0, a: 255 });
    });

    test('parses lowercase hex', () => {
      const result = parseHexToRgba('#ff5500');
      expect(result).toEqual({ r: 255, g: 85, b: 0, a: 255 });
    });

    test('returns null for invalid hex', () => {
      expect(parseHexToRgba('invalid')).toBe(null);
      expect(parseHexToRgba('')).toBe(null);
      expect(parseHexToRgba('#GG0000')).toBe(null);
      expect(parseHexToRgba('#FF00')).toBe(null);
    });

    test('handles transparent color', () => {
      const result = parseHexToRgba('#00000000');
      expect(result).toEqual({ r: 0, g: 0, b: 0, a: 0 });
    });

    test('handles white with full alpha', () => {
      const result = parseHexToRgba('#FFFFFFFF');
      expect(result).toEqual({ r: 255, g: 255, b: 255, a: 255 });
    });
  });

  // ===========================================================================
  // Hex Formatting (FR-009a)
  // ===========================================================================

  describe('rgbaToHex', () => {
    test('returns 8-digit uppercase hex', () => {
      const result = rgbaToHex(255, 0, 0);
      expect(result).toBe('#FF0000FF');
    });

    test('includes alpha in output', () => {
      const result = rgbaToHex(255, 0, 0, 128);
      expect(result).toBe('#FF000080');
    });

    test('defaults alpha to 255', () => {
      const result = rgbaToHex(255, 85, 0);
      expect(result).toBe('#FF5500FF');
    });

    test('handles transparent', () => {
      const result = rgbaToHex(0, 0, 0, 0);
      expect(result).toBe('#00000000');
    });

    test('handles white with full alpha', () => {
      const result = rgbaToHex(255, 255, 255, 255);
      expect(result).toBe('#FFFFFFFF');
    });

    test('pads single-digit components with zeros', () => {
      const result = rgbaToHex(1, 2, 3, 4);
      expect(result).toBe('#01020304');
    });
  });

  describe('Output normalization (FR-009a)', () => {
    test('6-digit input normalizes to 8-digit output via parse/format', () => {
      const parsed = parseHexToRgba('#FF5500');
      expect(parsed).not.toBe(null);
      const output = rgbaToHex(parsed!.r, parsed!.g, parsed!.b, parsed!.a);
      expect(output).toBe('#FF5500FF');
    });

    test('RGB input produces 8-digit output', () => {
      const output = rgbaToHex(255, 85, 0);
      expect(output).toBe('#FF5500FF');
    });

    test('HSL input to 8-digit output via conversion', () => {
      // HSL(20, 100%, 50%) is approximately #FF5500
      const rgb = hslToRgb(20, 100, 50);
      const output = rgbaToHex(rgb.r, rgb.g, rgb.b, 255);
      expect(output).toMatch(/^#[0-9A-F]{8}$/);
    });

    test('already 8-digit input returns unchanged format', () => {
      const parsed = parseHexToRgba('#FF5500AA');
      expect(parsed).not.toBe(null);
      const output = rgbaToHex(parsed!.r, parsed!.g, parsed!.b, parsed!.a);
      expect(output).toBe('#FF5500AA');
    });
  });

  describe('HEX round-trip (SC-003)', () => {
    test('HEX -> RGB -> HEX is exact (no loss)', () => {
      const original = '#FF5500FF';
      const parsed = parseHexToRgba(original);
      expect(parsed).not.toBe(null);
      const output = rgbaToHex(parsed!.r, parsed!.g, parsed!.b, parsed!.a);
      expect(output).toBe(original);
    });

    test('8-digit hex round-trip is exact', () => {
      const original = '#12345678';
      const parsed = parseHexToRgba(original);
      expect(parsed).not.toBe(null);
      const output = rgbaToHex(parsed!.r, parsed!.g, parsed!.b, parsed!.a);
      expect(output).toBe(original.toUpperCase());
    });
  });

  // ===========================================================================
  // createColorValue Factory
  // ===========================================================================

  describe('createColorValue', () => {
    test('creates ColorValue from RGBA', () => {
      const result = createColorValue(255, 0, 0, 255);
      expect(result.r).toBe(255);
      expect(result.g).toBe(0);
      expect(result.b).toBe(0);
      expect(result.a).toBe(255);
      // HSV values
      expect(result.h).toBe(0);
      expect(result.s).toBe(100);
      expect(result.v).toBe(100);
      // HSL values
      expect(result.hslS).toBe(100);
      expect(result.l).toBe(50);
    });

    test('calculates HSV values correctly', () => {
      const result = createColorValue(0, 255, 0, 255);
      expect(result.h).toBe(120);
      expect(result.s).toBe(100);
      expect(result.v).toBe(100);
    });

    test('calculates HSL values correctly', () => {
      const result = createColorValue(0, 0, 255, 255);
      expect(result.h).toBe(240);
      expect(result.hslS).toBe(100);
      expect(result.l).toBe(50);
    });

    test('handles grayscale', () => {
      const result = createColorValue(128, 128, 128, 255);
      expect(result.h).toBe(0);
      expect(result.s).toBe(0);
      expect(result.v).toBeCloseTo(50, 0);
      expect(result.hslS).toBe(0);
      expect(result.l).toBeCloseTo(50, 0);
    });
  });
});
