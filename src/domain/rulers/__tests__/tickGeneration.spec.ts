import { describe, expect, it } from 'vitest';
import { calculateVisibleRange, formatTickLabel, generateTicks } from '../tickGeneration';

describe('calculateVisibleRange', () => {
  describe('no pan 100% zoom', () => {
    it('should return range from 0 to viewport length at 100% zoom with no pan', () => {
      const result = calculateVisibleRange(800, 0, 1.0);
      expect(result.start).toBe(0);
      expect(result.end).toBe(800);
    });

    it('should handle different viewport sizes', () => {
      const result = calculateVisibleRange(1200, 0, 1.0);
      expect(result.start).toBe(0);
      expect(result.end).toBe(1200);
    });
  });

  describe('panned left', () => {
    it('should shift range right when panned left (negative pan offset)', () => {
      // Panned left by 100px means we see canvas coords 100 to 900
      const result = calculateVisibleRange(800, -100, 1.0);
      expect(result.start).toBe(100);
      expect(result.end).toBe(900);
    });
  });

  describe('panned right', () => {
    it('should shift range left (negative coords) when panned right', () => {
      // Panned right by 100px means we see canvas coords -100 to 700
      const result = calculateVisibleRange(800, 100, 1.0);
      expect(result.start).toBe(-100);
      expect(result.end).toBe(700);
    });
  });

  describe('zoomed in', () => {
    it('should show smaller canvas range when zoomed in', () => {
      // At 200% zoom, 800px viewport shows 400px of canvas
      const result = calculateVisibleRange(800, 0, 2.0);
      expect(result.start).toBe(0);
      expect(result.end).toBe(400);
    });

    it('should handle zoom with pan combined', () => {
      // At 200% zoom with 50px pan offset
      // Start: (0 - 50) / 2 = -25
      // End: (800 - 50) / 2 = 375
      const result = calculateVisibleRange(800, 50, 2.0);
      expect(result.start).toBe(-25);
      expect(result.end).toBe(375);
    });
  });

  describe('zoomed out', () => {
    it('should show larger canvas range when zoomed out', () => {
      // At 50% zoom, 800px viewport shows 1600px of canvas
      const result = calculateVisibleRange(800, 0, 0.5);
      expect(result.start).toBe(0);
      expect(result.end).toBe(1600);
    });
  });

  describe('large templates up to 4000px', () => {
    it('should handle large viewports correctly', () => {
      const result = calculateVisibleRange(4000, 0, 1.0);
      expect(result.start).toBe(0);
      expect(result.end).toBe(4000);
    });

    it('should handle large templates with zoom', () => {
      // 4000px template at 25% zoom needs 16000px viewport to see all
      const result = calculateVisibleRange(4000, 0, 0.25);
      expect(result.start).toBe(0);
      expect(result.end).toBe(16000);
    });
  });

  describe('invariant: end - start = viewportLength / zoomLevel', () => {
    it('should maintain the visible range formula', () => {
      const testCases = [
        { viewport: 800, pan: 0, zoom: 1.0 },
        { viewport: 800, pan: -100, zoom: 1.0 },
        { viewport: 800, pan: 100, zoom: 2.0 },
        { viewport: 1200, pan: -50, zoom: 0.5 },
      ];

      for (const { viewport, pan, zoom } of testCases) {
        const result = calculateVisibleRange(viewport, pan, zoom);
        expect(result.end - result.start).toBeCloseTo(viewport / zoom, 5);
      }
    });
  });
});

describe('formatTickLabel', () => {
  describe('positive integers', () => {
    it('should format positive integers correctly', () => {
      expect(formatTickLabel(100)).toBe('100');
      expect(formatTickLabel(0)).toBe('0');
      expect(formatTickLabel(250)).toBe('250');
    });
  });

  describe('negative values', () => {
    it('should format negative values with minus sign', () => {
      expect(formatTickLabel(-50)).toBe('-50');
      expect(formatTickLabel(-100)).toBe('-100');
      expect(formatTickLabel(-1)).toBe('-1');
    });
  });

  describe('rounding decimals', () => {
    it('should round decimals to nearest integer', () => {
      expect(formatTickLabel(99.7)).toBe('100');
      expect(formatTickLabel(99.4)).toBe('99');
      expect(formatTickLabel(100.5)).toBe('101');
    });

    it('should round negative decimals correctly', () => {
      expect(formatTickLabel(-50.6)).toBe('-51');
      expect(formatTickLabel(-50.4)).toBe('-50');
    });
  });

  describe('large values', () => {
    it('should handle large values', () => {
      expect(formatTickLabel(1000)).toBe('1000');
      expect(formatTickLabel(4000)).toBe('4000');
      expect(formatTickLabel(10000)).toBe('10000');
    });
  });
});

describe('generateTicks', () => {
  describe('major ticks with labels', () => {
    it('should generate major ticks with labels at major intervals', () => {
      const range = { start: 0, end: 300 };
      const intervals = { major: 100, minor: 10 };
      const ticks = generateTicks(range, intervals);

      const majorTicks = ticks.filter(t => t.type === 'major');
      expect(majorTicks).toEqual([
        { position: 0, type: 'major', label: '0' },
        { position: 100, type: 'major', label: '100' },
        { position: 200, type: 'major', label: '200' },
        { position: 300, type: 'major', label: '300' },
      ]);
    });

    it('should include label on all major ticks', () => {
      const range = { start: 0, end: 500 };
      const intervals = { major: 100, minor: 10 };
      const ticks = generateTicks(range, intervals);

      const majorTicks = ticks.filter(t => t.type === 'major');
      for (const tick of majorTicks) {
        expect(tick.label).not.toBeNull();
      }
    });
  });

  describe('minor ticks without labels', () => {
    it('should generate minor ticks with null labels', () => {
      const range = { start: 0, end: 100 };
      const intervals = { major: 100, minor: 10 };
      const ticks = generateTicks(range, intervals);

      const minorTicks = ticks.filter(t => t.type === 'minor');
      // Minor ticks at 10, 20, 30, 40, 50, 60, 70, 80, 90
      expect(minorTicks.length).toBe(9);
      for (const tick of minorTicks) {
        expect(tick.label).toBeNull();
      }
    });
  });

  describe('sorted ascending', () => {
    it('should return ticks sorted by position in ascending order', () => {
      const range = { start: -100, end: 200 };
      const intervals = { major: 100, minor: 50 };
      const ticks = generateTicks(range, intervals);

      for (let i = 1; i < ticks.length; i++) {
        expect(ticks[i].position).toBeGreaterThanOrEqual(ticks[i - 1].position);
      }
    });
  });

  describe('visible range boundaries', () => {
    it('should include ticks at and within range boundaries', () => {
      const range = { start: 50, end: 250 };
      const intervals = { major: 100, minor: 50 };
      const ticks = generateTicks(range, intervals);

      // Should include 50 (start), 100, 150, 200, 250 (end)
      const positions = ticks.map(t => t.position);
      expect(positions).toContain(50);
      expect(positions).toContain(100);
      expect(positions).toContain(200);
      expect(positions).toContain(250);
    });

    it('should not include ticks outside the range', () => {
      const range = { start: 50, end: 250 };
      const intervals = { major: 100, minor: 50 };
      const ticks = generateTicks(range, intervals);

      const positions = ticks.map(t => t.position);
      expect(positions.every(p => p >= 50 && p <= 250)).toBe(true);
    });
  });

  describe('negative coordinates', () => {
    it('should handle ranges with negative start', () => {
      const range = { start: -150, end: 150 };
      const intervals = { major: 100, minor: 50 };
      const ticks = generateTicks(range, intervals);

      const majorTicks = ticks.filter(t => t.type === 'major');
      const majorPositions = majorTicks.map(t => t.position);

      expect(majorPositions).toContain(-100);
      expect(majorPositions).toContain(0);
      expect(majorPositions).toContain(100);
    });

    it('should format negative labels correctly', () => {
      const range = { start: -200, end: 0 };
      const intervals = { major: 100, minor: 50 };
      const ticks = generateTicks(range, intervals);

      const majorTicks = ticks.filter(t => t.type === 'major');
      const negativeLabel = majorTicks.find(t => t.position === -100);
      expect(negativeLabel?.label).toBe('-100');
    });
  });

  describe('edge cases', () => {
    it('should handle empty range', () => {
      const range = { start: 100, end: 100 };
      const intervals = { major: 100, minor: 10 };
      const ticks = generateTicks(range, intervals);

      // Should at least include the single point if it falls on an interval
      expect(ticks.length).toBeGreaterThanOrEqual(1);
    });

    it('should handle range smaller than minor interval', () => {
      const range = { start: 95, end: 105 };
      const intervals = { major: 100, minor: 10 };
      const ticks = generateTicks(range, intervals);

      // Should include 100
      expect(ticks.some(t => t.position === 100)).toBe(true);
    });
  });
});
