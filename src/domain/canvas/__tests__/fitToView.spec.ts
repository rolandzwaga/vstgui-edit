import { describe, expect, test } from 'vitest';
import { calculateFitZoom } from '../fitToView';

describe('calculateFitZoom', () => {
  describe('basic fit calculation', () => {
    test('returns zoom that fits template width in viewport', () => {
      // Viewport: 1000x800, Template: 500x400
      // With 5% padding on each side (10% total), effective viewport: 900x720
      // Zoom to fit width: 900/500 = 1.8, Zoom to fit height: 720/400 = 1.8
      // Since capped at 1.0, result is 1.0
      const result = calculateFitZoom(
        { width: 500, height: 400 },
        { width: 1000, height: 800 }
      );
      expect(result.zoom).toBe(1.0);
    });

    test('returns zoom that fits large template in small viewport', () => {
      // Viewport: 800x600, Template: 1600x1200
      // With 5% padding, effective viewport: 720x540
      // Zoom to fit: min(720/1600, 540/1200) = min(0.45, 0.45) = 0.45
      const result = calculateFitZoom(
        { width: 1600, height: 1200 },
        { width: 800, height: 600 }
      );
      expect(result.zoom).toBeCloseTo(0.45, 2);
    });

    test('returns smaller zoom when template aspect ratio differs from viewport', () => {
      // Viewport: 800x600 (4:3), Template: 1000x200 (5:1 wide)
      // With 5% padding, effective viewport: 720x540
      // Zoom to fit: min(720/1000, 540/200) = min(0.72, 2.7) = 0.72
      const result = calculateFitZoom(
        { width: 1000, height: 200 },
        { width: 800, height: 600 }
      );
      expect(result.zoom).toBeCloseTo(0.72, 2);
    });
  });

  describe('5% padding margin (FR-010)', () => {
    test('includes 5% padding on each side', () => {
      // Viewport: 1000x1000, Template: 1000x1000
      // With 5% padding on each side (10% total), effective viewport: 900x900
      // Zoom to fit: 900/1000 = 0.9
      const result = calculateFitZoom(
        { width: 1000, height: 1000 },
        { width: 1000, height: 1000 }
      );
      expect(result.zoom).toBe(0.9);
    });

    test('custom padding percentage can be specified', () => {
      // Viewport: 1000x1000, Template: 1000x1000
      // With 10% padding on each side (20% total), effective viewport: 800x800
      // Zoom to fit: 800/1000 = 0.8
      const result = calculateFitZoom(
        { width: 1000, height: 1000 },
        { width: 1000, height: 1000 },
        0.1 // 10% padding
      );
      expect(result.zoom).toBe(0.8);
    });
  });

  describe('caps zoom at 1.0 for small templates (FR-011)', () => {
    test('does not zoom above 100% for small templates', () => {
      // Viewport: 1000x800, Template: 100x100 (very small)
      // With 5% padding, effective viewport: 900x720
      // Natural zoom: min(900/100, 720/100) = min(9.0, 7.2) = 7.2
      // Capped at 1.0
      const result = calculateFitZoom(
        { width: 100, height: 100 },
        { width: 1000, height: 800 }
      );
      expect(result.zoom).toBe(1.0);
    });

    test('returns exactly 1.0 when natural fit would be 1.0', () => {
      // Viewport: 1000x1000, Template: 900x900
      // With 5% padding, effective viewport: 900x900
      // Zoom to fit: 900/900 = 1.0
      const result = calculateFitZoom(
        { width: 900, height: 900 },
        { width: 1000, height: 1000 }
      );
      expect(result.zoom).toBe(1.0);
    });
  });

  describe('edge cases', () => {
    test('handles 0x0 template dimensions gracefully', () => {
      const result = calculateFitZoom(
        { width: 0, height: 0 },
        { width: 1000, height: 800 }
      );
      expect(result.zoom).toBe(1.0);
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

  describe('pan offset calculation', () => {
    test('returns pan offset to center template in viewport', () => {
      // Viewport: 800x600, Template: 400x300
      // Template fits at zoom 1.0 (capped)
      // Centered: panX = (800 - 400*1.0) / 2 = 200, panY = (600 - 300*1.0) / 2 = 150
      const result = calculateFitZoom(
        { width: 400, height: 300 },
        { width: 800, height: 600 }
      );
      expect(result.zoom).toBe(1.0);
      expect(result.panX).toBe(200);
      expect(result.panY).toBe(150);
    });

    test('centers zoomed-out template', () => {
      // Viewport: 800x600, Template: 1600x1200
      // Zoom: 0.45, Scaled template: 720x540
      // Centered: panX = (800 - 720) / 2 = 40, panY = (600 - 540) / 2 = 30
      const result = calculateFitZoom(
        { width: 1600, height: 1200 },
        { width: 800, height: 600 }
      );
      expect(result.panX).toBeCloseTo(40, 0);
      expect(result.panY).toBeCloseTo(30, 0);
    });
  });
});
