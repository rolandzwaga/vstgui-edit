import { describe, expect, test } from 'vitest';
import {
  validateBitmapName,
  validateFrameCount,
  validateFramesPerRow,
  validateMultiframeSize,
} from '../validation';

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

describe('validateMultiframeSize', () => {
  describe('valid sizes', () => {
    test('accepts "width, height" format', () => {
      const result = validateMultiframeSize('50, 50');
      expect(result.valid).toBe(true);
    });

    test('accepts without spaces', () => {
      const result = validateMultiframeSize('100,75');
      expect(result.valid).toBe(true);
    });

    test('accepts decimal values', () => {
      const result = validateMultiframeSize('50.5, 25.5');
      expect(result.valid).toBe(true);
    });

    test('accepts large values', () => {
      const result = validateMultiframeSize('1024, 768');
      expect(result.valid).toBe(true);
    });
  });

  describe('optional empty value', () => {
    test('accepts empty string (optional field)', () => {
      const result = validateMultiframeSize('');
      expect(result.valid).toBe(true);
    });

    test('accepts whitespace-only (optional field)', () => {
      const result = validateMultiframeSize('   ');
      expect(result.valid).toBe(true);
    });
  });

  describe('invalid sizes', () => {
    test('rejects single value', () => {
      const result = validateMultiframeSize('50');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('width, height');
    });

    test('rejects non-numeric values', () => {
      const result = validateMultiframeSize('abc, def');
      expect(result.valid).toBe(false);
    });

    test('rejects negative values', () => {
      const result = validateMultiframeSize('-50, 50');
      expect(result.valid).toBe(false);
    });
  });
});

describe('validateFrameCount', () => {
  describe('valid counts', () => {
    test('accepts positive integer', () => {
      const result = validateFrameCount('128');
      expect(result.valid).toBe(true);
    });

    test('accepts 1', () => {
      const result = validateFrameCount('1');
      expect(result.valid).toBe(true);
    });

    test('accepts large numbers', () => {
      const result = validateFrameCount('1000');
      expect(result.valid).toBe(true);
    });
  });

  describe('optional empty value', () => {
    test('accepts empty string (optional field)', () => {
      const result = validateFrameCount('');
      expect(result.valid).toBe(true);
    });
  });

  describe('invalid counts', () => {
    test('rejects zero', () => {
      const result = validateFrameCount('0');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('positive');
    });

    test('rejects negative', () => {
      const result = validateFrameCount('-5');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('positive');
    });

    test('rejects non-numeric', () => {
      const result = validateFrameCount('abc');
      expect(result.valid).toBe(false);
    });
  });
});

describe('validateFramesPerRow', () => {
  describe('valid values', () => {
    test('accepts positive integer', () => {
      const result = validateFramesPerRow('16');
      expect(result.valid).toBe(true);
    });

    test('accepts empty string (optional)', () => {
      const result = validateFramesPerRow('');
      expect(result.valid).toBe(true);
    });

    test('accepts 1', () => {
      const result = validateFramesPerRow('1');
      expect(result.valid).toBe(true);
    });
  });

  describe('invalid values', () => {
    test('rejects zero', () => {
      const result = validateFramesPerRow('0');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('positive');
    });

    test('rejects negative', () => {
      const result = validateFramesPerRow('-1');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('positive');
    });

    test('rejects non-numeric', () => {
      const result = validateFramesPerRow('abc');
      expect(result.valid).toBe(false);
    });
  });
});
