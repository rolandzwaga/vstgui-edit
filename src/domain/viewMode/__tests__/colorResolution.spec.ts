import { describe, expect, test } from 'vitest';
import type { ColorsDefinition } from '../../../types/uidesc';
import {
  hexToRgba,
  isHexColor,
  normalizeHexColor,
  resolveColor,
} from '../colorResolution';

describe('colorResolution', () => {
  describe('isHexColor', () => {
    test('returns true for 6-digit hex color', () => {
      expect(isHexColor('#FF0000')).toBe(true);
    });

    test('returns true for 8-digit hex color with alpha', () => {
      expect(isHexColor('#FF0000FF')).toBe(true);
    });

    test('returns true for 3-digit shorthand hex color', () => {
      expect(isHexColor('#F00')).toBe(true);
    });

    test('returns true for lowercase hex color', () => {
      expect(isHexColor('#ff0000ff')).toBe(true);
    });

    test('returns false for non-hex color reference', () => {
      expect(isHexColor('background')).toBe(false);
    });

    test('returns false for predefined color reference', () => {
      expect(isHexColor('~ BlackCColor')).toBe(false);
    });

    test('returns false for empty string', () => {
      expect(isHexColor('')).toBe(false);
    });

    test('returns false for invalid hex without hash', () => {
      expect(isHexColor('FF0000')).toBe(false);
    });
  });

  describe('normalizeHexColor', () => {
    test('expands 3-digit hex to 6-digit with alpha', () => {
      expect(normalizeHexColor('#F00')).toBe('#FF0000FF');
    });

    test('adds alpha to 6-digit hex', () => {
      expect(normalizeHexColor('#FF0000')).toBe('#FF0000FF');
    });

    test('leaves 8-digit hex unchanged', () => {
      expect(normalizeHexColor('#FF0000FF')).toBe('#FF0000FF');
    });

    test('converts lowercase to uppercase', () => {
      expect(normalizeHexColor('#ff0000')).toBe('#FF0000FF');
    });

    test('returns non-hex color unchanged', () => {
      expect(normalizeHexColor('background')).toBe('background');
    });
  });

  describe('hexToRgba', () => {
    test('converts red hex to rgba', () => {
      expect(hexToRgba('#FF0000FF')).toBe('rgba(255, 0, 0, 1.00)');
    });

    test('converts green hex to rgba', () => {
      expect(hexToRgba('#00FF00FF')).toBe('rgba(0, 255, 0, 1.00)');
    });

    test('converts blue hex to rgba', () => {
      expect(hexToRgba('#0000FFFF')).toBe('rgba(0, 0, 255, 1.00)');
    });

    test('converts black hex to rgba', () => {
      expect(hexToRgba('#000000FF')).toBe('rgba(0, 0, 0, 1.00)');
    });

    test('converts white hex to rgba', () => {
      expect(hexToRgba('#FFFFFFFF')).toBe('rgba(255, 255, 255, 1.00)');
    });

    test('handles 50% alpha', () => {
      expect(hexToRgba('#00000080')).toBe('rgba(0, 0, 0, 0.50)');
    });

    test('handles transparent (0% alpha)', () => {
      expect(hexToRgba('#00000000')).toBe('rgba(0, 0, 0, 0.00)');
    });

    test('converts lowercase hex', () => {
      expect(hexToRgba('#ff5500ff')).toBe('rgba(255, 85, 0, 1.00)');
    });
  });

  describe('resolveColor', () => {
    const documentColors: ColorsDefinition = {
      background: '#2D2D2DFF',
      accent: '#FF5500FF',
      text: '#EEEEEEFF',
    };

    describe('hex colors', () => {
      test('resolves direct 8-digit hex color', () => {
        expect(resolveColor('#FF0000FF', documentColors)).toBe('rgba(255, 0, 0, 1.00)');
      });

      test('resolves direct 6-digit hex color', () => {
        expect(resolveColor('#FF0000', documentColors)).toBe('rgba(255, 0, 0, 1.00)');
      });

      test('resolves 3-digit shorthand hex color', () => {
        expect(resolveColor('#F00', documentColors)).toBe('rgba(255, 0, 0, 1.00)');
      });

      test('resolves lowercase hex color', () => {
        expect(resolveColor('#ff0000ff', documentColors)).toBe('rgba(255, 0, 0, 1.00)');
      });
    });

    describe('predefined colors', () => {
      test('resolves BlackCColor', () => {
        expect(resolveColor('~ BlackCColor', documentColors)).toBe('rgba(0, 0, 0, 1.00)');
      });

      test('resolves WhiteCColor', () => {
        expect(resolveColor('~ WhiteCColor', documentColors)).toBe('rgba(255, 255, 255, 1.00)');
      });

      test('resolves GreyCColor', () => {
        expect(resolveColor('~ GreyCColor', documentColors)).toBe('rgba(128, 128, 128, 1.00)');
      });

      test('resolves RedCColor', () => {
        expect(resolveColor('~ RedCColor', documentColors)).toBe('rgba(255, 0, 0, 1.00)');
      });

      test('resolves TransparentCColor', () => {
        expect(resolveColor('~ TransparentCColor', documentColors)).toBe('rgba(0, 0, 0, 0.00)');
      });

      test('returns null for unknown predefined color', () => {
        expect(resolveColor('~ UnknownColor', documentColors)).toBeNull();
      });
    });

    describe('document references', () => {
      test('resolves document color reference', () => {
        expect(resolveColor('background', documentColors)).toBe('rgba(45, 45, 45, 1.00)');
      });

      test('resolves accent color reference', () => {
        expect(resolveColor('accent', documentColors)).toBe('rgba(255, 85, 0, 1.00)');
      });

      test('returns null for non-existent document color', () => {
        expect(resolveColor('nonexistent', documentColors)).toBeNull();
      });

      test('returns null when document colors is undefined', () => {
        expect(resolveColor('background', undefined)).toBeNull();
      });

      test('returns null when document colors is empty', () => {
        expect(resolveColor('background', {})).toBeNull();
      });
    });

    describe('chained references', () => {
      test('resolves chained document color reference', () => {
        const colors: ColorsDefinition = {
          primary: 'accent',
          accent: '#FF5500FF',
        };
        expect(resolveColor('primary', colors)).toBe('rgba(255, 85, 0, 1.00)');
      });

      test('resolves deeply chained reference', () => {
        const colors: ColorsDefinition = {
          level1: 'level2',
          level2: 'level3',
          level3: '#00FF00FF',
        };
        expect(resolveColor('level1', colors)).toBe('rgba(0, 255, 0, 1.00)');
      });

      test('resolves chained reference to predefined color', () => {
        const colors: ColorsDefinition = {
          myBlack: '~ BlackCColor',
        };
        expect(resolveColor('myBlack', colors)).toBe('rgba(0, 0, 0, 1.00)');
      });
    });

    describe('circular reference protection', () => {
      test('returns null for simple circular reference', () => {
        const colors: ColorsDefinition = {
          colorA: 'colorB',
          colorB: 'colorA',
        };
        expect(resolveColor('colorA', colors)).toBeNull();
      });

      test('returns null for self-reference', () => {
        const colors: ColorsDefinition = {
          selfRef: 'selfRef',
        };
        expect(resolveColor('selfRef', colors)).toBeNull();
      });

      test('returns null for deep circular reference', () => {
        const colors: ColorsDefinition = {
          a: 'b',
          b: 'c',
          c: 'd',
          d: 'e',
          e: 'a',
        };
        expect(resolveColor('a', colors)).toBeNull();
      });
    });

    describe('null and undefined cases', () => {
      test('returns null for undefined color reference', () => {
        expect(resolveColor(undefined, documentColors)).toBeNull();
      });

      test('returns null for empty string color reference', () => {
        expect(resolveColor('', documentColors)).toBeNull();
      });
    });
  });
});
