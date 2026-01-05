import { describe, expect, it } from 'vitest';
import { parsePoint, parseSize } from '../coordinates';

describe('parsePoint', () => {
  describe('Given undefined input', () => {
    it('should return default point (0, 0)', () => {
      const result = parsePoint(undefined);
      expect(result).toEqual({ x: 0, y: 0 });
    });
  });

  describe('Given valid "x, y" string', () => {
    it('should parse positive integers', () => {
      const result = parsePoint('50, 100');
      expect(result).toEqual({ x: 50, y: 100 });
    });

    it('should parse negative x value', () => {
      const result = parsePoint('-10, 20');
      expect(result).toEqual({ x: -10, y: 20 });
    });

    it('should parse negative y value', () => {
      const result = parsePoint('30, -15');
      expect(result).toEqual({ x: 30, y: -15 });
    });

    it('should parse both negative values', () => {
      const result = parsePoint('-5, -10');
      expect(result).toEqual({ x: -5, y: -10 });
    });

    it('should parse zero values', () => {
      const result = parsePoint('0, 0');
      expect(result).toEqual({ x: 0, y: 0 });
    });

    it('should handle extra whitespace', () => {
      const result = parsePoint('  50 ,  100  ');
      expect(result).toEqual({ x: 50, y: 100 });
    });

    it('should parse large values', () => {
      const result = parsePoint('1920, 1080');
      expect(result).toEqual({ x: 1920, y: 1080 });
    });
  });

  describe('Given invalid input', () => {
    it('should return default for empty string', () => {
      const result = parsePoint('');
      expect(result).toEqual({ x: 0, y: 0 });
    });

    it('should return default for single value', () => {
      const result = parsePoint('50');
      expect(result).toEqual({ x: 0, y: 0 });
    });

    it('should return default for non-numeric values', () => {
      const result = parsePoint('abc, def');
      expect(result).toEqual({ x: 0, y: 0 });
    });
  });
});

describe('parseSize', () => {
  describe('Given undefined input', () => {
    it('should return default size (20, 20)', () => {
      const result = parseSize(undefined);
      expect(result).toEqual({ width: 20, height: 20 });
    });
  });

  describe('Given valid "width, height" string', () => {
    it('should parse positive integers', () => {
      const result = parseSize('200, 80');
      expect(result).toEqual({ width: 200, height: 80 });
    });

    it('should parse equal dimensions', () => {
      const result = parseSize('100, 100');
      expect(result).toEqual({ width: 100, height: 100 });
    });

    it('should handle extra whitespace', () => {
      const result = parseSize('  200 ,  80  ');
      expect(result).toEqual({ width: 200, height: 80 });
    });

    it('should parse large values', () => {
      const result = parseSize('1920, 1080');
      expect(result).toEqual({ width: 1920, height: 1080 });
    });
  });

  describe('Given zero or invalid dimensions', () => {
    it('should enforce minimum width of 20 for zero width', () => {
      const result = parseSize('0, 100');
      expect(result).toEqual({ width: 20, height: 100 });
    });

    it('should enforce minimum height of 20 for zero height', () => {
      const result = parseSize('100, 0');
      expect(result).toEqual({ width: 100, height: 20 });
    });

    it('should enforce minimum size for both zero', () => {
      const result = parseSize('0, 0');
      expect(result).toEqual({ width: 20, height: 20 });
    });

    it('should enforce minimum for negative width', () => {
      const result = parseSize('-10, 50');
      expect(result).toEqual({ width: 20, height: 50 });
    });

    it('should enforce minimum for negative height', () => {
      const result = parseSize('50, -10');
      expect(result).toEqual({ width: 50, height: 20 });
    });
  });

  describe('Given invalid input', () => {
    it('should return default for empty string', () => {
      const result = parseSize('');
      expect(result).toEqual({ width: 20, height: 20 });
    });

    it('should return default for single value', () => {
      const result = parseSize('200');
      expect(result).toEqual({ width: 20, height: 20 });
    });

    it('should return default for non-numeric values', () => {
      const result = parseSize('abc, def');
      expect(result).toEqual({ width: 20, height: 20 });
    });
  });
});
