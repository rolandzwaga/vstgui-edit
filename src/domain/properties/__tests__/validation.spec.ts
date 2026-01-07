import { describe, expect, test } from 'vitest';
import {
  validatePoint,
  validateSize,
  validateNumber,
  validateBoolean,
  validateColor,
} from '../validation';

describe('validation', () => {
  describe('validatePoint', () => {
    test('valid point "0, 0"', () => {
      const result = validatePoint('0, 0');
      expect(result.valid).toBe(true);
      expect(result.normalizedValue).toBe('0, 0');
    });

    test('valid point with positive integers', () => {
      const result = validatePoint('100, 200');
      expect(result.valid).toBe(true);
      expect(result.normalizedValue).toBe('100, 200');
    });

    test('valid point with negative integers', () => {
      const result = validatePoint('-50, -100');
      expect(result.valid).toBe(true);
      expect(result.normalizedValue).toBe('-50, -100');
    });

    test('normalizes extra whitespace', () => {
      const result = validatePoint('  100  ,   200  ');
      expect(result.valid).toBe(true);
      expect(result.normalizedValue).toBe('100, 200');
    });

    test('invalid when missing comma', () => {
      const result = validatePoint('100 200');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('x, y');
    });

    test('invalid when too few parts', () => {
      const result = validatePoint('100');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('x, y');
    });

    test('invalid when too many parts', () => {
      const result = validatePoint('100, 200, 300');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('x, y');
    });

    test('invalid when non-numeric x', () => {
      const result = validatePoint('abc, 200');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('integer');
    });

    test('invalid when non-numeric y', () => {
      const result = validatePoint('100, xyz');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('integer');
    });

    test('invalid when float values', () => {
      const result = validatePoint('100.5, 200.5');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('integer');
    });

    test('completes validation in under 50ms', () => {
      const start = performance.now();
      for (let i = 0; i < 1000; i++) {
        validatePoint(`${i}, ${i}`);
      }
      const elapsed = performance.now() - start;
      expect(elapsed / 1000).toBeLessThan(50);
    });
  });

  describe('validateSize', () => {
    test('valid size with positive dimensions', () => {
      const result = validateSize('200, 100');
      expect(result.valid).toBe(true);
      expect(result.normalizedValue).toBe('200, 100');
    });

    test('valid size with zero dimensions', () => {
      const result = validateSize('0, 0');
      expect(result.valid).toBe(true);
      expect(result.normalizedValue).toBe('0, 0');
    });

    test('invalid when width is negative', () => {
      const result = validateSize('-100, 200');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('non-negative');
    });

    test('invalid when height is negative', () => {
      const result = validateSize('100, -200');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('non-negative');
    });

    test('invalid point format propagates', () => {
      const result = validateSize('100');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('x, y');
    });
  });

  describe('validateNumber', () => {
    test('valid integer', () => {
      const result = validateNumber('42');
      expect(result.valid).toBe(true);
      expect(result.normalizedValue).toBe('42');
    });

    test('valid float', () => {
      const result = validateNumber('3.14');
      expect(result.valid).toBe(true);
      expect(result.normalizedValue).toBe('3.14');
    });

    test('valid negative number', () => {
      const result = validateNumber('-10.5');
      expect(result.valid).toBe(true);
      expect(result.normalizedValue).toBe('-10.5');
    });

    test('valid zero', () => {
      const result = validateNumber('0');
      expect(result.valid).toBe(true);
      expect(result.normalizedValue).toBe('0');
    });

    test('invalid non-numeric string', () => {
      const result = validateNumber('abc');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('valid number');
    });

    test('invalid empty string', () => {
      const result = validateNumber('');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('valid number');
    });

    test('respects min constraint', () => {
      const result = validateNumber('-5', 0);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('at least 0');
    });

    test('respects max constraint', () => {
      const result = validateNumber('2', undefined, 1);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('at most 1');
    });

    test('valid within range', () => {
      const result = validateNumber('0.5', 0, 1);
      expect(result.valid).toBe(true);
    });

    test('valid at boundaries', () => {
      expect(validateNumber('0', 0, 1).valid).toBe(true);
      expect(validateNumber('1', 0, 1).valid).toBe(true);
    });

    test('completes validation in under 50ms', () => {
      const start = performance.now();
      for (let i = 0; i < 1000; i++) {
        validateNumber(String(i), 0, 1000);
      }
      const elapsed = performance.now() - start;
      expect(elapsed / 1000).toBeLessThan(50);
    });
  });

  describe('validateBoolean', () => {
    test('valid "true"', () => {
      const result = validateBoolean('true');
      expect(result.valid).toBe(true);
      expect(result.normalizedValue).toBe('true');
    });

    test('valid "false"', () => {
      const result = validateBoolean('false');
      expect(result.valid).toBe(true);
      expect(result.normalizedValue).toBe('false');
    });

    test('valid "True" normalizes to lowercase', () => {
      const result = validateBoolean('True');
      expect(result.valid).toBe(true);
      expect(result.normalizedValue).toBe('true');
    });

    test('valid "FALSE" normalizes to lowercase', () => {
      const result = validateBoolean('FALSE');
      expect(result.valid).toBe(true);
      expect(result.normalizedValue).toBe('false');
    });

    test('invalid "yes"', () => {
      const result = validateBoolean('yes');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('true');
      expect(result.error).toContain('false');
    });

    test('invalid "1"', () => {
      const result = validateBoolean('1');
      expect(result.valid).toBe(false);
    });

    test('invalid empty string', () => {
      const result = validateBoolean('');
      expect(result.valid).toBe(false);
    });
  });

  describe('validateColor', () => {
    test('valid named document color', () => {
      const result = validateColor('Background', ['Background', 'Foreground']);
      expect(result.valid).toBe(true);
    });

    test('valid predefined color with tilde', () => {
      const result = validateColor('~BlackCColor', []);
      expect(result.valid).toBe(true);
    });

    test('valid hex 6-digit color', () => {
      const result = validateColor('#FF5500', []);
      expect(result.valid).toBe(true);
      expect(result.normalizedValue).toBe('#FF5500');
    });

    test('valid hex 8-digit color with alpha', () => {
      const result = validateColor('#FF5500FF', []);
      expect(result.valid).toBe(true);
      expect(result.normalizedValue).toBe('#FF5500FF');
    });

    test('normalizes lowercase hex to uppercase', () => {
      const result = validateColor('#ff5500', []);
      expect(result.valid).toBe(true);
      expect(result.normalizedValue).toBe('#FF5500');
    });

    test('invalid hex with wrong length', () => {
      const result = validateColor('#FFF', []);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('hex');
    });

    test('invalid hex with invalid characters', () => {
      const result = validateColor('#GGGGGG', []);
      expect(result.valid).toBe(false);
    });

    test('invalid undefined color name', () => {
      const result = validateColor('UndefinedColor', ['Background']);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('defined color');
    });
  });
});
