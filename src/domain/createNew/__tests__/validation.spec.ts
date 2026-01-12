import { describe, expect, it } from 'vitest';
import { validateDimension, validateDimensions, areDimensionsValid } from '../validation';

describe('validateDimension', () => {
  describe('valid values', () => {
    it('returns valid result with parsed value for valid integer', () => {
      const result = validateDimension('400', 'Width');
      expect(result).toEqual({ valid: true, value: 400 });
    });

    it('returns valid result for minimum value 1', () => {
      const result = validateDimension('1', 'Height');
      expect(result).toEqual({ valid: true, value: 1 });
    });

    it('returns valid result for maximum value 10000', () => {
      const result = validateDimension('10000', 'Width');
      expect(result).toEqual({ valid: true, value: 10000 });
    });

    it('rounds decimal values to nearest integer', () => {
      expect(validateDimension('400.4', 'Width')).toEqual({ valid: true, value: 400 });
      expect(validateDimension('400.5', 'Width')).toEqual({ valid: true, value: 401 });
      expect(validateDimension('400.7', 'Width')).toEqual({ valid: true, value: 401 });
    });

    it('accepts values with leading/trailing whitespace', () => {
      const result = validateDimension('  300  ', 'Height');
      expect(result).toEqual({ valid: true, value: 300 });
    });
  });

  describe('empty string', () => {
    it('returns invalid with "Width is required" error for width', () => {
      const result = validateDimension('', 'Width');
      expect(result).toEqual({ valid: false, error: 'Width is required' });
    });

    it('returns invalid with "Height is required" error for height', () => {
      const result = validateDimension('', 'Height');
      expect(result).toEqual({ valid: false, error: 'Height is required' });
    });

    it('returns invalid for whitespace-only string', () => {
      const result = validateDimension('   ', 'Width');
      expect(result).toEqual({ valid: false, error: 'Width is required' });
    });
  });

  describe('negative numbers', () => {
    it('returns invalid with "Must be at least 1" error', () => {
      const result = validateDimension('-100', 'Width');
      expect(result).toEqual({ valid: false, error: 'Must be at least 1' });
    });

    it('returns invalid for -1', () => {
      const result = validateDimension('-1', 'Height');
      expect(result).toEqual({ valid: false, error: 'Must be at least 1' });
    });
  });

  describe('zero', () => {
    it('returns invalid with "Must be at least 1" error', () => {
      const result = validateDimension('0', 'Width');
      expect(result).toEqual({ valid: false, error: 'Must be at least 1' });
    });
  });

  describe('values exceeding maximum', () => {
    it('returns invalid with "Must be at most 10000" error', () => {
      const result = validateDimension('10001', 'Width');
      expect(result).toEqual({ valid: false, error: 'Must be at most 10000' });
    });

    it('returns invalid for very large values', () => {
      const result = validateDimension('50000', 'Height');
      expect(result).toEqual({ valid: false, error: 'Must be at most 10000' });
    });
  });

  describe('non-numeric values', () => {
    it('returns invalid with "Must be a number" error for text', () => {
      const result = validateDimension('abc', 'Width');
      expect(result).toEqual({ valid: false, error: 'Must be a number' });
    });

    it('returns invalid for mixed text and numbers', () => {
      const result = validateDimension('400px', 'Height');
      expect(result).toEqual({ valid: false, error: 'Must be a number' });
    });

    it('returns invalid for special characters', () => {
      const result = validateDimension('$400', 'Width');
      expect(result).toEqual({ valid: false, error: 'Must be a number' });
    });
  });
});

describe('validateDimensions', () => {
  it('validates both width and height', () => {
    const result = validateDimensions('400', '300');
    expect(result.width).toEqual({ valid: true, value: 400 });
    expect(result.height).toEqual({ valid: true, value: 300 });
  });

  it('returns errors for both invalid width and height', () => {
    const result = validateDimensions('', '-5');
    expect(result.width).toEqual({ valid: false, error: 'Width is required' });
    expect(result.height).toEqual({ valid: false, error: 'Must be at least 1' });
  });

  it('validates width while height is invalid', () => {
    const result = validateDimensions('800', 'abc');
    expect(result.width).toEqual({ valid: true, value: 800 });
    expect(result.height).toEqual({ valid: false, error: 'Must be a number' });
  });
});

describe('areDimensionsValid', () => {
  it('returns true when both dimensions are valid', () => {
    const results = {
      width: { valid: true, value: 400 },
      height: { valid: true, value: 300 },
    };
    expect(areDimensionsValid(results)).toBe(true);
  });

  it('returns false when width is invalid', () => {
    const results = {
      width: { valid: false, error: 'Must be at least 1' },
      height: { valid: true, value: 300 },
    };
    expect(areDimensionsValid(results)).toBe(false);
  });

  it('returns false when height is invalid', () => {
    const results = {
      width: { valid: true, value: 400 },
      height: { valid: false, error: 'Must be a number' },
    };
    expect(areDimensionsValid(results)).toBe(false);
  });

  it('returns false when both are invalid', () => {
    const results = {
      width: { valid: false, error: 'Width is required' },
      height: { valid: false, error: 'Height is required' },
    };
    expect(areDimensionsValid(results)).toBe(false);
  });
});
