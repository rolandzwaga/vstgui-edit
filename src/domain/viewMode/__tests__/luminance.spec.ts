import { describe, expect, test } from 'vitest';
import { LUMINANCE_THRESHOLD, OVERLAY_OPACITY } from '../../../types/viewMode';
import {
  calculateLuminance,
  getAdaptiveOverlayStyle,
  getDefaultOverlayStyle,
  isDarkColor,
  isLightColor,
  parseColorToRgb,
} from '../luminance';

describe('luminance', () => {
  describe('parseColorToRgb', () => {
    describe('hex colors', () => {
      test('parses 8-digit hex color', () => {
        expect(parseColorToRgb('#FF0000FF')).toEqual({ r: 255, g: 0, b: 0 });
      });

      test('parses 6-digit hex color', () => {
        expect(parseColorToRgb('#00FF00')).toEqual({ r: 0, g: 255, b: 0 });
      });

      test('parses 3-digit hex color', () => {
        expect(parseColorToRgb('#00F')).toEqual({ r: 0, g: 0, b: 255 });
      });

      test('parses lowercase hex color', () => {
        expect(parseColorToRgb('#ff5500')).toEqual({ r: 255, g: 85, b: 0 });
      });

      test('parses white hex', () => {
        expect(parseColorToRgb('#FFFFFF')).toEqual({ r: 255, g: 255, b: 255 });
      });

      test('parses black hex', () => {
        expect(parseColorToRgb('#000000')).toEqual({ r: 0, g: 0, b: 0 });
      });
    });

    describe('rgba colors', () => {
      test('parses rgba color', () => {
        expect(parseColorToRgb('rgba(255, 0, 0, 1.00)')).toEqual({ r: 255, g: 0, b: 0 });
      });

      test('parses rgba color with different alpha', () => {
        expect(parseColorToRgb('rgba(128, 128, 128, 0.5)')).toEqual({ r: 128, g: 128, b: 128 });
      });

      test('parses rgba without spaces', () => {
        expect(parseColorToRgb('rgba(100,150,200,1)')).toEqual({ r: 100, g: 150, b: 200 });
      });
    });

    describe('rgb colors', () => {
      test('parses rgb color', () => {
        expect(parseColorToRgb('rgb(0, 255, 0)')).toEqual({ r: 0, g: 255, b: 0 });
      });

      test('parses rgb without spaces', () => {
        expect(parseColorToRgb('rgb(50,100,150)')).toEqual({ r: 50, g: 100, b: 150 });
      });
    });

    describe('invalid colors', () => {
      test('returns null for invalid color string', () => {
        expect(parseColorToRgb('notacolor')).toBeNull();
      });

      test('returns null for empty string', () => {
        expect(parseColorToRgb('')).toBeNull();
      });

      test('returns null for malformed hex', () => {
        expect(parseColorToRgb('#GG0000')).toBeNull();
      });
    });
  });

  describe('calculateLuminance', () => {
    test('returns 1.0 for white', () => {
      expect(calculateLuminance('#FFFFFF')).toBeCloseTo(1.0, 2);
    });

    test('returns 0.0 for black', () => {
      expect(calculateLuminance('#000000')).toBeCloseTo(0.0, 2);
    });

    test('returns ~0.21 for red', () => {
      // Using simplified formula: 0.299 * 1.0 + 0.587 * 0.0 + 0.114 * 0.0 = 0.299
      expect(calculateLuminance('#FF0000')).toBeCloseTo(0.299, 2);
    });

    test('returns ~0.587 for green', () => {
      // 0.299 * 0.0 + 0.587 * 1.0 + 0.114 * 0.0 = 0.587
      expect(calculateLuminance('#00FF00')).toBeCloseTo(0.587, 2);
    });

    test('returns ~0.114 for blue', () => {
      // 0.299 * 0.0 + 0.587 * 0.0 + 0.114 * 1.0 = 0.114
      expect(calculateLuminance('#0000FF')).toBeCloseTo(0.114, 2);
    });

    test('returns ~0.5 for middle gray', () => {
      // 0.299 * 0.5 + 0.587 * 0.5 + 0.114 * 0.5 = 0.5
      expect(calculateLuminance('#808080')).toBeCloseTo(0.5, 1);
    });

    test('returns 0.5 for unparseable color as fallback', () => {
      expect(calculateLuminance('invalid')).toBe(0.5);
    });

    test('parses rgba format', () => {
      expect(calculateLuminance('rgba(255, 255, 255, 1.00)')).toBeCloseTo(1.0, 2);
    });

    test('parses rgb format', () => {
      expect(calculateLuminance('rgb(0, 0, 0)')).toBeCloseTo(0.0, 2);
    });
  });

  describe('isLightColor', () => {
    test('returns true for white', () => {
      expect(isLightColor('#FFFFFF')).toBe(true);
    });

    test('returns false for black', () => {
      expect(isLightColor('#000000')).toBe(false);
    });

    test('returns true for light gray', () => {
      expect(isLightColor('#CCCCCC')).toBe(true);
    });

    test('returns false for dark gray', () => {
      expect(isLightColor('#333333')).toBe(false);
    });

    test('uses default threshold of 0.5', () => {
      // 50% gray should be at the threshold boundary
      // Pure 50% gray #808080 has luminance ~0.5
      expect(isLightColor('#808080')).toBe(true); // >= 0.5
    });

    test('accepts custom threshold', () => {
      // Red has luminance ~0.299
      expect(isLightColor('#FF0000', 0.2)).toBe(true);
      expect(isLightColor('#FF0000', 0.4)).toBe(false);
    });
  });

  describe('isDarkColor', () => {
    test('returns false for white', () => {
      expect(isDarkColor('#FFFFFF')).toBe(false);
    });

    test('returns true for black', () => {
      expect(isDarkColor('#000000')).toBe(true);
    });

    test('returns false for light gray', () => {
      expect(isDarkColor('#CCCCCC')).toBe(false);
    });

    test('returns true for dark gray', () => {
      expect(isDarkColor('#333333')).toBe(true);
    });

    test('uses default threshold of 0.5', () => {
      expect(isDarkColor('#808080')).toBe(false); // luminance ~0.5, not < 0.5
    });

    test('accepts custom threshold', () => {
      expect(isDarkColor('#FF0000', 0.2)).toBe(false);
      expect(isDarkColor('#FF0000', 0.4)).toBe(true);
    });
  });

  describe('getAdaptiveOverlayStyle', () => {
    test('returns white overlay for dark background (black)', () => {
      const style = getAdaptiveOverlayStyle('#000000');
      expect(style.fillColor).toBe('#FFFFFF');
      expect(style.fillOpacity).toBe(OVERLAY_OPACITY);
      expect(style.strokeColor).toBe('#FFFFFF');
    });

    test('returns dark overlay for light background (white)', () => {
      const style = getAdaptiveOverlayStyle('#FFFFFF');
      expect(style.fillColor).toBe('#000000');
      expect(style.fillOpacity).toBe(OVERLAY_OPACITY);
      expect(style.strokeColor).toBe('#000000');
    });

    test('returns white overlay for dark blue', () => {
      const style = getAdaptiveOverlayStyle('#000080');
      expect(style.fillColor).toBe('#FFFFFF');
      expect(style.strokeColor).toBe('#FFFFFF');
    });

    test('returns dark overlay for yellow (high luminance)', () => {
      const style = getAdaptiveOverlayStyle('#FFFF00');
      expect(style.fillColor).toBe('#000000');
      expect(style.strokeColor).toBe('#000000');
    });

    test('returns white overlay for rgba dark color', () => {
      const style = getAdaptiveOverlayStyle('rgba(45, 45, 45, 1.00)');
      expect(style.fillColor).toBe('#FFFFFF');
    });

    test('returns default overlay style for null background', () => {
      const style = getAdaptiveOverlayStyle(null);
      const defaultStyle = getDefaultOverlayStyle();
      expect(style.fillColor).toBe(defaultStyle.fillColor);
      expect(style.fillOpacity).toBe(defaultStyle.fillOpacity);
      expect(style.strokeColor).toBe(defaultStyle.strokeColor);
    });

    describe('edge cases at luminance threshold', () => {
      test('pure white #FFFFFF uses dark overlay', () => {
        const style = getAdaptiveOverlayStyle('#FFFFFF');
        expect(style.fillColor).toBe('#000000');
      });

      test('pure black #000000 uses white overlay', () => {
        const style = getAdaptiveOverlayStyle('#000000');
        expect(style.fillColor).toBe('#FFFFFF');
      });

      test('threshold gray #808080 uses dark overlay (luminance ~0.5)', () => {
        // #808080 has luminance ~0.5 which is >= threshold, so uses dark overlay
        const style = getAdaptiveOverlayStyle('#808080');
        expect(style.fillColor).toBe('#000000');
      });

      test('slightly dark gray uses white overlay', () => {
        // #7F7F7F should be just below threshold
        const style = getAdaptiveOverlayStyle('#7F7F7F');
        expect(style.fillColor).toBe('#FFFFFF');
      });
    });
  });

  describe('getDefaultOverlayStyle', () => {
    test('returns overlay style object', () => {
      const style = getDefaultOverlayStyle();
      expect(style).toHaveProperty('fillColor');
      expect(style).toHaveProperty('fillOpacity');
      expect(style).toHaveProperty('strokeColor');
    });

    test('returns consistent values', () => {
      const style1 = getDefaultOverlayStyle();
      const style2 = getDefaultOverlayStyle();
      expect(style1).toEqual(style2);
    });

    test('uses 50% opacity', () => {
      const style = getDefaultOverlayStyle();
      expect(style.fillOpacity).toBe(OVERLAY_OPACITY);
    });
  });

  describe('constants', () => {
    test('LUMINANCE_THRESHOLD is 0.5', () => {
      expect(LUMINANCE_THRESHOLD).toBe(0.5);
    });

    test('OVERLAY_OPACITY is 0.5', () => {
      expect(OVERLAY_OPACITY).toBe(0.5);
    });
  });
});
