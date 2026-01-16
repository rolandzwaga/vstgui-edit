import { describe, expect, test } from 'vitest';
import { calculateFitZoom } from '../fitToView';

describe('calculateFitZoom', () => {
  describe('zoom calculation', () => {
    test('returns zoom that fits template in viewport (width constrained)', () => {
      // Viewport: 800x600, Template: 1600x600
      // Zoom to fit width: 800/1600 = 0.5
      // Zoom to fit height: 600/600 = 1.0
      // Uses smaller: 0.5
      const result = calculateFitZoom(
        { width: 1600, height: 600 },
        { width: 800, height: 600 }
      );
      expect(result.zoom).toBe(0.5);
    });

    test('returns zoom that fits template in viewport (height constrained)', () => {
      // Viewport: 800x600, Template: 400x1200
      // Zoom to fit width: 800/400 = 2.0
      // Zoom to fit height: 600/1200 = 0.5
      // Uses smaller: 0.5
      const result = calculateFitZoom(
        { width: 400, height: 1200 },
        { width: 800, height: 600 }
      );
      expect(result.zoom).toBe(0.5);
    });

    test('returns zoom > 1 for small templates', () => {
      // Viewport: 800x600, Template: 100x100
      // Zoom to fit: min(800/100, 600/100) = min(8, 6) = 6
      const result = calculateFitZoom(
        { width: 100, height: 100 },
        { width: 800, height: 600 }
      );
      expect(result.zoom).toBe(6);
    });

    test('returns zoom = 1 when template exactly fits viewport', () => {
      const result = calculateFitZoom(
        { width: 800, height: 600 },
        { width: 800, height: 600 }
      );
      expect(result.zoom).toBe(1.0);
    });
  });

  describe('pan offset (top-left anchored)', () => {
    test('always returns pan at origin (0, 0)', () => {
      const result = calculateFitZoom(
        { width: 1600, height: 1200 },
        { width: 800, height: 600 }
      );
      expect(result.panX).toBe(0);
      expect(result.panY).toBe(0);
    });

    test('returns origin for small templates too', () => {
      const result = calculateFitZoom(
        { width: 100, height: 100 },
        { width: 800, height: 600 }
      );
      expect(result.panX).toBe(0);
      expect(result.panY).toBe(0);
    });
  });

  describe('edge cases', () => {
    test('handles 0x0 template dimensions gracefully', () => {
      const result = calculateFitZoom(
        { width: 0, height: 0 },
        { width: 1000, height: 800 }
      );
      expect(result.zoom).toBe(1.0);
      expect(result.panX).toBe(0);
      expect(result.panY).toBe(0);
    });

    test('handles 0 width template', () => {
      const result = calculateFitZoom(
        { width: 0, height: 100 },
        { width: 1000, height: 800 }
      );
      expect(result.zoom).toBe(1.0);
    });

    test('handles 0 height template', () => {
      const result = calculateFitZoom(
        { width: 100, height: 0 },
        { width: 1000, height: 800 }
      );
      expect(result.zoom).toBe(1.0);
    });

    test('handles 0x0 viewport dimensions', () => {
      const result = calculateFitZoom(
        { width: 500, height: 400 },
        { width: 0, height: 0 }
      );
      expect(result.zoom).toBe(1.0);
    });
  });
});
