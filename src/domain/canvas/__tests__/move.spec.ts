import { describe, expect, it } from 'vitest';
import {
  applyDelta,
  applyDeltaToAll,
  calculateDelta,
  formatOrigin,
} from '../move';

describe('calculateDelta', () => {
  describe('Given two points', () => {
    it('should calculate positive delta', () => {
      const result = calculateDelta({ x: 10, y: 20 }, { x: 50, y: 70 });
      expect(result).toEqual({ x: 40, y: 50 });
    });

    it('should calculate negative delta', () => {
      const result = calculateDelta({ x: 100, y: 100 }, { x: 50, y: 30 });
      expect(result).toEqual({ x: -50, y: -70 });
    });

    it('should handle zero delta', () => {
      const result = calculateDelta({ x: 50, y: 50 }, { x: 50, y: 50 });
      expect(result).toEqual({ x: 0, y: 0 });
    });

    it('should handle negative start point', () => {
      const result = calculateDelta({ x: -10, y: -20 }, { x: 30, y: 40 });
      expect(result).toEqual({ x: 40, y: 60 });
    });

    it('should handle mixed positive/negative movement', () => {
      const result = calculateDelta({ x: 0, y: 0 }, { x: -30, y: 50 });
      expect(result).toEqual({ x: -30, y: 50 });
    });
  });
});

describe('applyDelta', () => {
  describe('Given origin and delta', () => {
    it('should apply positive delta', () => {
      const result = applyDelta({ x: 10, y: 20 }, { x: 5, y: 10 });
      expect(result).toEqual({ x: 15, y: 30 });
    });

    it('should apply negative delta', () => {
      const result = applyDelta({ x: 100, y: 100 }, { x: -30, y: -50 });
      expect(result).toEqual({ x: 70, y: 50 });
    });

    it('should handle zero delta', () => {
      const result = applyDelta({ x: 50, y: 60 }, { x: 0, y: 0 });
      expect(result).toEqual({ x: 50, y: 60 });
    });

    it('should allow negative result', () => {
      const result = applyDelta({ x: 10, y: 20 }, { x: -50, y: -50 });
      expect(result).toEqual({ x: -40, y: -30 });
    });
  });
});

describe('applyDeltaToAll', () => {
  describe('Given origins record and delta', () => {
    it('should apply delta to all origins', () => {
      const origins = {
        'view-1': { x: 10, y: 20 },
        'view-2': { x: 100, y: 50 },
        'view-3': { x: 0, y: 0 },
      };
      const delta = { x: 15, y: -10 };

      const result = applyDeltaToAll(origins, delta);

      expect(result).toEqual({
        'view-1': { x: 25, y: 10 },
        'view-2': { x: 115, y: 40 },
        'view-3': { x: 15, y: -10 },
      });
    });

    it('should handle empty origins', () => {
      const result = applyDeltaToAll({}, { x: 10, y: 10 });
      expect(result).toEqual({});
    });

    it('should handle single origin', () => {
      const result = applyDeltaToAll({ solo: { x: 50, y: 50 } }, { x: -25, y: 25 });
      expect(result).toEqual({ solo: { x: 25, y: 75 } });
    });

    it('should not mutate original origins', () => {
      const origins = { 'view-1': { x: 10, y: 20 } };
      applyDeltaToAll(origins, { x: 100, y: 100 });
      expect(origins).toEqual({ 'view-1': { x: 10, y: 20 } });
    });
  });
});

describe('formatOrigin', () => {
  describe('Given a point', () => {
    it('should format positive integers', () => {
      const result = formatOrigin({ x: 50, y: 100 });
      expect(result).toBe('50, 100');
    });

    it('should format zero values', () => {
      const result = formatOrigin({ x: 0, y: 0 });
      expect(result).toBe('0, 0');
    });

    it('should format negative values', () => {
      const result = formatOrigin({ x: -10, y: -20 });
      expect(result).toBe('-10, -20');
    });

    it('should format mixed positive/negative', () => {
      const result = formatOrigin({ x: -5, y: 15 });
      expect(result).toBe('-5, 15');
    });

    it('should format large values', () => {
      const result = formatOrigin({ x: 1920, y: 1080 });
      expect(result).toBe('1920, 1080');
    });
  });
});
