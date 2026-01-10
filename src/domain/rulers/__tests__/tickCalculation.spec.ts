import { describe, expect, it } from 'vitest';
import { alignIntervalToGrid, calculateTickIntervals, DEFAULT_TICK_CONFIG } from '../tickCalculation';

describe('calculateTickIntervals', () => {
  describe('base intervals at 100% zoom', () => {
    it('should return base 100px major and 10px minor intervals at 100% zoom', () => {
      const result = calculateTickIntervals(1.0);
      expect(result.major).toBe(100);
      expect(result.minor).toBe(10);
    });
  });

  describe('doubled intervals at 25% zoom', () => {
    it('should quadruple intervals at 25% zoom to maintain readability', () => {
      // At 25% zoom, 100px would be 25px on screen - too small
      // Should use 400px intervals (100px on screen)
      const result = calculateTickIntervals(0.25);
      expect(result.major).toBe(400);
      expect(result.minor).toBe(40);
    });

    it('should double intervals at 50% zoom', () => {
      // At 50% zoom, 100px would be 50px on screen
      // Should use 200px intervals (100px on screen)
      const result = calculateTickIntervals(0.5);
      expect(result.major).toBe(200);
      expect(result.minor).toBe(20);
    });
  });

  describe('halved intervals at 400%+ zoom', () => {
    it('should halve intervals at 200% zoom to show more detail', () => {
      // At 200% zoom, 100px would be 200px on screen - too sparse
      // Should use 50px intervals (100px on screen)
      const result = calculateTickIntervals(2.0);
      expect(result.major).toBe(50);
      expect(result.minor).toBe(5);
    });

    it('should quarter intervals at 400% zoom', () => {
      // At 400% zoom, use 25px intervals (100px on screen)
      const result = calculateTickIntervals(4.0);
      expect(result.major).toBe(25);
      expect(result.minor).toBe(2.5);
    });
  });

  describe('minScreenSpacing invariant', () => {
    it('should maintain minimum 30px screen spacing at any zoom level', () => {
      const zoomLevels = [0.1, 0.25, 0.5, 0.75, 1.0, 1.5, 2.0, 3.0, 4.0, 5.0];

      for (const zoom of zoomLevels) {
        const result = calculateTickIntervals(zoom);
        const screenSpacing = result.major * zoom;
        expect(screenSpacing).toBeGreaterThanOrEqual(DEFAULT_TICK_CONFIG.minScreenSpacing);
      }
    });
  });

  describe('extreme zoom edge cases', () => {
    it('should maintain minScreenSpacing >= 30px at 10% zoom', () => {
      const result = calculateTickIntervals(0.1);
      const screenSpacing = result.major * 0.1;
      expect(screenSpacing).toBeGreaterThanOrEqual(30);
      // At 10% zoom with power-of-2 scaling: 800px intervals (80px on screen)
      // 800 = 100 * 2^3 is the nearest power-of-2 multiple that gives good screen spacing
      expect(result.major).toBe(800);
      expect(result.minor).toBe(80);
    });

    it('should maintain minScreenSpacing >= 30px at 500% zoom', () => {
      const result = calculateTickIntervals(5.0);
      const screenSpacing = result.major * 5.0;
      expect(screenSpacing).toBeGreaterThanOrEqual(30);
      // At 500% zoom with power-of-2 scaling: 25px intervals (125px on screen)
      // 25 = 100 / 2^2 is the nearest power-of-2 fraction
      expect(result.major).toBe(25);
      expect(result.minor).toBe(2.5);
    });
  });

  describe('custom configuration', () => {
    it('should respect custom baseInterval', () => {
      const result = calculateTickIntervals(1.0, { baseInterval: 50 });
      expect(result.major).toBe(50);
      expect(result.minor).toBe(5);
    });

    it('should respect custom minorTickRatio', () => {
      const result = calculateTickIntervals(1.0, { minorTickRatio: 5 });
      expect(result.major).toBe(100);
      expect(result.minor).toBe(20);
    });
  });

  describe('minor tick ratio', () => {
    it('should always have major >= minor', () => {
      const zoomLevels = [0.1, 0.5, 1.0, 2.0, 5.0];

      for (const zoom of zoomLevels) {
        const result = calculateTickIntervals(zoom);
        expect(result.major).toBeGreaterThanOrEqual(result.minor);
      }
    });
  });
});

describe('alignIntervalToGrid', () => {
  describe('no adjustment when grid disabled', () => {
    it('should return original interval when grid is disabled', () => {
      expect(alignIntervalToGrid(100, 16, false)).toBe(100);
      expect(alignIntervalToGrid(50, 8, false)).toBe(50);
      expect(alignIntervalToGrid(200, 12, false)).toBe(200);
    });
  });

  describe('alignment to grid when enabled for all presets', () => {
    it('should align to 5px grid', () => {
      const result = alignIntervalToGrid(100, 5, true);
      expect(result % 5).toBe(0);
      expect(result).toBe(100); // 100 is already multiple of 5
    });

    it('should align to 8px grid', () => {
      const result = alignIntervalToGrid(100, 8, true);
      expect(result % 8).toBe(0);
      // Nearest multiple of 8 to 100 is 96 or 104
      expect([96, 104]).toContain(result);
    });

    it('should align to 10px grid', () => {
      const result = alignIntervalToGrid(100, 10, true);
      expect(result % 10).toBe(0);
      expect(result).toBe(100); // 100 is already multiple of 10
    });

    it('should align to 12px grid', () => {
      const result = alignIntervalToGrid(100, 12, true);
      expect(result % 12).toBe(0);
      // Nearest multiple of 12 to 100 is 96 or 108
      expect([96, 108]).toContain(result);
    });

    it('should align to 16px grid', () => {
      const result = alignIntervalToGrid(100, 16, true);
      expect(result % 16).toBe(0);
      // Nearest multiple of 16 to 100 is 96 or 112
      expect([96, 112]).toContain(result);
    });

    it('should align to 20px grid', () => {
      const result = alignIntervalToGrid(100, 20, true);
      expect(result % 20).toBe(0);
      // Nearest multiple of 20 to 100 is 100
      expect(result).toBe(100);
    });
  });

  describe('already aligned intervals', () => {
    it('should not change interval already aligned to grid', () => {
      expect(alignIntervalToGrid(100, 10, true)).toBe(100);
      expect(alignIntervalToGrid(200, 20, true)).toBe(200);
      expect(alignIntervalToGrid(80, 8, true)).toBe(80);
    });
  });

  describe('small intervals', () => {
    it('should handle small intervals correctly', () => {
      const result = alignIntervalToGrid(25, 8, true);
      expect(result % 8).toBe(0);
      expect(result).toBeGreaterThan(0);
    });
  });
});
