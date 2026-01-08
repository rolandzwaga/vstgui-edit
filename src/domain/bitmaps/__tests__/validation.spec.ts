import { describe, expect, test } from 'vitest';
import { validateBitmapName } from '../validation';

describe('validateBitmapName', () => {
  const existingNames = ['Background', 'Knob', 'Slider'];

  describe('valid names', () => {
    test('accepts unique name', () => {
      const result = validateBitmapName('NewBitmap', existingNames);
      expect(result.valid).toBe(true);
    });

    test('accepts name with spaces', () => {
      const result = validateBitmapName('Background Image', existingNames);
      expect(result.valid).toBe(true);
    });

    test('accepts name with numbers', () => {
      const result = validateBitmapName('Bitmap123', existingNames);
      expect(result.valid).toBe(true);
    });

    test('is case-sensitive', () => {
      const result = validateBitmapName('background', existingNames);
      expect(result.valid).toBe(true);
    });

    test('accepts name with special characters', () => {
      const result = validateBitmapName('my-bitmap_v2', existingNames);
      expect(result.valid).toBe(true);
    });
  });

  describe('invalid names', () => {
    test('rejects duplicate name', () => {
      const result = validateBitmapName('Background', existingNames);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('already exists');
    });

    test('rejects empty string', () => {
      const result = validateBitmapName('', existingNames);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('cannot be empty');
    });

    test('rejects whitespace-only', () => {
      const result = validateBitmapName('   ', existingNames);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('cannot be empty');
    });
  });

  describe('edge cases', () => {
    test('accepts name when existing list is empty', () => {
      const result = validateBitmapName('AnyName', []);
      expect(result.valid).toBe(true);
    });

    test('trims name for empty check but not for uniqueness', () => {
      const result = validateBitmapName('  valid  ', existingNames);
      expect(result.valid).toBe(true);
    });
  });
});
