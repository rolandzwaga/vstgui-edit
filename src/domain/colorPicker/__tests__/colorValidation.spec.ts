/**
 * Color Validation Tests
 *
 * Tests for validating hex, RGB, and HSL color inputs.
 * Written following TDD approach - tests first, then implementation.
 */

import { describe, test, expect } from 'vitest';
import {
  validateHexInput,
  validateRgbInput,
  validateHslInput,
} from '../colorValidation';

describe('colorValidation', () => {
  // ===========================================================================
  // Hex Input Validation
  // ===========================================================================

  describe('validateHexInput', () => {
    describe('valid inputs', () => {
      test('validates 6-digit hex with #', () => {
        const result = validateHexInput('#FF5500');
        expect(result.valid).toBe(true);
        expect(result.error).toBeUndefined();
        expect(result.normalized).toBe('#FF5500FF');
      });

      test('validates 8-digit hex with #', () => {
        const result = validateHexInput('#FF5500AA');
        expect(result.valid).toBe(true);
        expect(result.error).toBeUndefined();
        expect(result.normalized).toBe('#FF5500AA');
      });

      test('validates 3-digit shorthand hex', () => {
        const result = validateHexInput('#F50');
        expect(result.valid).toBe(true);
        expect(result.normalized).toBe('#FF5500FF');
      });

      test('validates lowercase hex', () => {
        const result = validateHexInput('#ff5500');
        expect(result.valid).toBe(true);
        expect(result.normalized).toBe('#FF5500FF');
      });

      test('validates mixed case hex', () => {
        const result = validateHexInput('#fF5500aA');
        expect(result.valid).toBe(true);
        expect(result.normalized).toBe('#FF5500AA');
      });
    });

    describe('auto-add # prefix', () => {
      test('adds # prefix to 6-digit hex without #', () => {
        const result = validateHexInput('FF5500');
        expect(result.valid).toBe(true);
        expect(result.normalized).toBe('#FF5500FF');
      });

      test('adds # prefix to 8-digit hex without #', () => {
        const result = validateHexInput('FF5500AA');
        expect(result.valid).toBe(true);
        expect(result.normalized).toBe('#FF5500AA');
      });

      test('adds # prefix to 3-digit hex without #', () => {
        const result = validateHexInput('F50');
        expect(result.valid).toBe(true);
        expect(result.normalized).toBe('#FF5500FF');
      });
    });

    describe('case normalization', () => {
      test('normalizes to uppercase', () => {
        const result = validateHexInput('#abcdef');
        expect(result.normalized).toBe('#ABCDEFFF');
      });

      test('preserves uppercase', () => {
        const result = validateHexInput('#ABCDEF');
        expect(result.normalized).toBe('#ABCDEFFF');
      });
    });

    describe('invalid inputs', () => {
      test('rejects invalid characters', () => {
        const result = validateHexInput('#GG5500');
        expect(result.valid).toBe(false);
        expect(result.error).toBeDefined();
      });

      test('rejects wrong length (4 digits)', () => {
        const result = validateHexInput('#FF55');
        expect(result.valid).toBe(false);
        expect(result.error).toBeDefined();
      });

      test('rejects wrong length (5 digits)', () => {
        const result = validateHexInput('#FF550');
        expect(result.valid).toBe(false);
        expect(result.error).toBeDefined();
      });

      test('rejects wrong length (7 digits)', () => {
        const result = validateHexInput('#FF55001');
        expect(result.valid).toBe(false);
        expect(result.error).toBeDefined();
      });

      test('rejects empty string', () => {
        const result = validateHexInput('');
        expect(result.valid).toBe(false);
        expect(result.error).toBeDefined();
      });

      test('rejects whitespace only', () => {
        const result = validateHexInput('   ');
        expect(result.valid).toBe(false);
        expect(result.error).toBeDefined();
      });

      test('rejects arbitrary text', () => {
        const result = validateHexInput('red');
        expect(result.valid).toBe(false);
        expect(result.error).toBeDefined();
      });
    });
  });

  // ===========================================================================
  // RGB Input Validation
  // ===========================================================================

  describe('validateRgbInput', () => {
    describe('valid inputs', () => {
      test('validates RGB with values in range', () => {
        const result = validateRgbInput(255, 128, 0, 255);
        expect(result.valid).toBe(true);
        expect(result.error).toBeUndefined();
      });

      test('validates minimum values (0)', () => {
        const result = validateRgbInput(0, 0, 0, 0);
        expect(result.valid).toBe(true);
      });

      test('validates maximum values (255)', () => {
        const result = validateRgbInput(255, 255, 255, 255);
        expect(result.valid).toBe(true);
      });

      test('validates middle values', () => {
        const result = validateRgbInput(128, 64, 192, 100);
        expect(result.valid).toBe(true);
      });
    });

    describe('out of range errors', () => {
      test('rejects red value below 0', () => {
        const result = validateRgbInput(-1, 128, 128, 255);
        expect(result.valid).toBe(false);
        expect(result.error).toContain('0');
        expect(result.error).toContain('255');
      });

      test('rejects red value above 255', () => {
        const result = validateRgbInput(256, 128, 128, 255);
        expect(result.valid).toBe(false);
        expect(result.error).toBeDefined();
      });

      test('rejects green value below 0', () => {
        const result = validateRgbInput(128, -1, 128, 255);
        expect(result.valid).toBe(false);
        expect(result.error).toBeDefined();
      });

      test('rejects green value above 255', () => {
        const result = validateRgbInput(128, 256, 128, 255);
        expect(result.valid).toBe(false);
        expect(result.error).toBeDefined();
      });

      test('rejects blue value below 0', () => {
        const result = validateRgbInput(128, 128, -1, 255);
        expect(result.valid).toBe(false);
        expect(result.error).toBeDefined();
      });

      test('rejects blue value above 255', () => {
        const result = validateRgbInput(128, 128, 256, 255);
        expect(result.valid).toBe(false);
        expect(result.error).toBeDefined();
      });

      test('rejects alpha value below 0', () => {
        const result = validateRgbInput(128, 128, 128, -1);
        expect(result.valid).toBe(false);
        expect(result.error).toBeDefined();
      });

      test('rejects alpha value above 255', () => {
        const result = validateRgbInput(128, 128, 128, 256);
        expect(result.valid).toBe(false);
        expect(result.error).toBeDefined();
      });
    });

    describe('non-integer values', () => {
      test('rejects decimal R value', () => {
        const result = validateRgbInput(128.5, 128, 128, 255);
        expect(result.valid).toBe(false);
        expect(result.error).toBeDefined();
      });

      test('rejects NaN values', () => {
        const result = validateRgbInput(Number.NaN, 128, 128, 255);
        expect(result.valid).toBe(false);
        expect(result.error).toBeDefined();
      });
    });
  });

  // ===========================================================================
  // HSL Input Validation
  // ===========================================================================

  describe('validateHslInput', () => {
    describe('valid inputs', () => {
      test('validates HSL with values in range', () => {
        const result = validateHslInput(180, 50, 50, 100);
        expect(result.valid).toBe(true);
        expect(result.error).toBeUndefined();
      });

      test('validates minimum values', () => {
        const result = validateHslInput(0, 0, 0, 0);
        expect(result.valid).toBe(true);
      });

      test('validates maximum values', () => {
        const result = validateHslInput(360, 100, 100, 100);
        expect(result.valid).toBe(true);
      });
    });

    describe('hue validation (0-360)', () => {
      test('rejects hue below 0', () => {
        const result = validateHslInput(-1, 50, 50, 100);
        expect(result.valid).toBe(false);
        expect(result.error).toContain('Hue');
      });

      test('rejects hue above 360', () => {
        const result = validateHslInput(361, 50, 50, 100);
        expect(result.valid).toBe(false);
        expect(result.error).toContain('Hue');
      });

      test('accepts hue at boundaries', () => {
        expect(validateHslInput(0, 50, 50, 100).valid).toBe(true);
        expect(validateHslInput(360, 50, 50, 100).valid).toBe(true);
      });
    });

    describe('saturation validation (0-100)', () => {
      test('rejects saturation below 0', () => {
        const result = validateHslInput(180, -1, 50, 100);
        expect(result.valid).toBe(false);
        expect(result.error).toContain('Saturation');
      });

      test('rejects saturation above 100', () => {
        const result = validateHslInput(180, 101, 50, 100);
        expect(result.valid).toBe(false);
        expect(result.error).toContain('Saturation');
      });
    });

    describe('lightness validation (0-100)', () => {
      test('rejects lightness below 0', () => {
        const result = validateHslInput(180, 50, -1, 100);
        expect(result.valid).toBe(false);
        expect(result.error).toContain('Lightness');
      });

      test('rejects lightness above 100', () => {
        const result = validateHslInput(180, 50, 101, 100);
        expect(result.valid).toBe(false);
        expect(result.error).toContain('Lightness');
      });
    });

    describe('alpha validation (0-100)', () => {
      test('rejects alpha below 0', () => {
        const result = validateHslInput(180, 50, 50, -1);
        expect(result.valid).toBe(false);
        expect(result.error).toContain('Alpha');
      });

      test('rejects alpha above 100', () => {
        const result = validateHslInput(180, 50, 50, 101);
        expect(result.valid).toBe(false);
        expect(result.error).toContain('Alpha');
      });
    });

    describe('non-integer values', () => {
      test('rejects decimal hue value', () => {
        const result = validateHslInput(180.5, 50, 50, 100);
        expect(result.valid).toBe(false);
        expect(result.error).toBeDefined();
      });

      test('rejects NaN values', () => {
        const result = validateHslInput(Number.NaN, 50, 50, 100);
        expect(result.valid).toBe(false);
        expect(result.error).toBeDefined();
      });
    });
  });
});
