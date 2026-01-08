import { describe, expect, test } from 'vitest';
import { validateGradientName } from '../validation';

describe('validateGradientName', () => {
  const existingNames = ['Background Gradient', 'Highlight', 'Shadow'];

  describe('valid names', () => {
    test('accepts unique name', () => {
      const result = validateGradientName('NewGradient', existingNames);
      expect(result.valid).toBe(true);
    });

    test('accepts name with spaces', () => {
      const result = validateGradientName('My Gradient', existingNames);
      expect(result.valid).toBe(true);
    });

    test('accepts name with numbers', () => {
      const result = validateGradientName('Gradient123', existingNames);
      expect(result.valid).toBe(true);
    });

    test('is case-sensitive', () => {
      const result = validateGradientName('background gradient', existingNames);
      expect(result.valid).toBe(true);
    });

    test('accepts name with special characters', () => {
      const result = validateGradientName('my-gradient_v2', existingNames);
      expect(result.valid).toBe(true);
    });
  });

  describe('invalid names', () => {
    test('rejects duplicate name', () => {
      const result = validateGradientName('Background Gradient', existingNames);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('already exists');
    });

    test('rejects empty string', () => {
      const result = validateGradientName('', existingNames);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('cannot be empty');
    });

    test('rejects whitespace-only', () => {
      const result = validateGradientName('   ', existingNames);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('cannot be empty');
    });
  });

  describe('edge cases', () => {
    test('accepts name when existing list is empty', () => {
      const result = validateGradientName('AnyName', []);
      expect(result.valid).toBe(true);
    });

    test('trims name for empty check but not for uniqueness', () => {
      const result = validateGradientName('  valid  ', existingNames);
      expect(result.valid).toBe(true);
    });
  });
});
