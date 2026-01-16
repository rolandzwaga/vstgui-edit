import { describe, expect, test } from 'vitest';
import { testInRoot } from '../../__tests__/helpers/solidjs';
import {
  canvasStore,
  endPan,
  fitToView,
  resetCanvas,
  resetPan,
  resetZoom,
  setZoom,
  startPan,
  updatePan,
  zoomIn,
  zoomOut,
} from '../canvasStore';

describe('canvasStore', () => {
  describe('initial state', () => {
    test('panOffset is { x: 0, y: 0 }', () => {
      testInRoot(() => {
        // Reset to ensure clean state
        resetPan();
        expect(canvasStore.panOffset).toEqual({ x: 0, y: 0 });
      });
    });

    test('isPanning is false', () => {
      testInRoot(() => {
        resetPan();
        expect(canvasStore.isPanning).toBe(false);
      });
    });

    test('panStart is null', () => {
      testInRoot(() => {
        resetPan();
        expect(canvasStore.panStart).toBeNull();
      });
    });
  });

  describe('startPan', () => {
    test('sets isPanning to true', () => {
      testInRoot(() => {
        resetPan();
        startPan(100, 200);
        expect(canvasStore.isPanning).toBe(true);
      });
    });

    test('sets panStart to given coordinates', () => {
      testInRoot(() => {
        resetPan();
        startPan(150, 250);
        expect(canvasStore.panStart).toEqual({ x: 150, y: 250 });
      });
    });

    test('does not change panOffset', () => {
      testInRoot(() => {
        resetPan();
        startPan(100, 200);
        expect(canvasStore.panOffset).toEqual({ x: 0, y: 0 });
      });
    });
  });

  describe('updatePan', () => {
    test('updates panOffset by delta from panStart', () => {
      testInRoot(() => {
        resetPan();
        startPan(100, 100);
        updatePan(150, 120);
        // Delta: x = 150 - 100 = 50, y = 120 - 100 = 20
        expect(canvasStore.panOffset).toEqual({ x: 50, y: 20 });
      });
    });

    test('accumulates multiple updates', () => {
      testInRoot(() => {
        resetPan();
        startPan(100, 100);
        updatePan(150, 150); // Delta: +50, +50
        updatePan(200, 200); // Delta: +50, +50 (from new panStart at 150,150)
        expect(canvasStore.panOffset).toEqual({ x: 100, y: 100 });
      });
    });

    test('updates panStart to current position', () => {
      testInRoot(() => {
        resetPan();
        startPan(100, 100);
        updatePan(150, 120);
        expect(canvasStore.panStart).toEqual({ x: 150, y: 120 });
      });
    });

    test('does nothing if not panning', () => {
      testInRoot(() => {
        resetPan();
        updatePan(100, 100);
        expect(canvasStore.panOffset).toEqual({ x: 0, y: 0 });
        expect(canvasStore.panStart).toBeNull();
      });
    });

    test('handles negative delta (pan left/up)', () => {
      testInRoot(() => {
        resetPan();
        startPan(200, 200);
        updatePan(150, 180);
        // Delta: x = 150 - 200 = -50, y = 180 - 200 = -20
        expect(canvasStore.panOffset).toEqual({ x: -50, y: -20 });
      });
    });
  });

  describe('endPan', () => {
    test('sets isPanning to false', () => {
      testInRoot(() => {
        resetPan();
        startPan(100, 100);
        endPan();
        expect(canvasStore.isPanning).toBe(false);
      });
    });

    test('sets panStart to null', () => {
      testInRoot(() => {
        resetPan();
        startPan(100, 100);
        endPan();
        expect(canvasStore.panStart).toBeNull();
      });
    });

    test('preserves panOffset', () => {
      testInRoot(() => {
        resetPan();
        startPan(100, 100);
        updatePan(150, 150); // panOffset becomes { x: 50, y: 50 }
        endPan();
        expect(canvasStore.panOffset).toEqual({ x: 50, y: 50 });
      });
    });
  });

  describe('resetPan', () => {
    test('resets panOffset to { x: 0, y: 0 }', () => {
      testInRoot(() => {
        startPan(100, 100);
        updatePan(200, 200);
        resetPan();
        expect(canvasStore.panOffset).toEqual({ x: 0, y: 0 });
      });
    });

    test('sets isPanning to false', () => {
      testInRoot(() => {
        startPan(100, 100);
        resetPan();
        expect(canvasStore.isPanning).toBe(false);
      });
    });

    test('sets panStart to null', () => {
      testInRoot(() => {
        startPan(100, 100);
        resetPan();
        expect(canvasStore.panStart).toBeNull();
      });
    });
  });

  describe('pan with existing offset', () => {
    test('new pan gesture adds to existing offset', () => {
      testInRoot(() => {
        resetPan();
        // First pan: move +50, +50
        startPan(100, 100);
        updatePan(150, 150);
        endPan();
        expect(canvasStore.panOffset).toEqual({ x: 50, y: 50 });

        // Second pan: move +30, +20
        startPan(200, 200);
        updatePan(230, 220);
        endPan();
        expect(canvasStore.panOffset).toEqual({ x: 80, y: 70 });
      });
    });
  });

  describe('zoomLevel initial state', () => {
    test('zoomLevel is 1.0 by default', () => {
      testInRoot(() => {
        resetZoom();
        expect(canvasStore.zoomLevel).toBe(1.0);
      });
    });
  });

  describe('setZoom', () => {
    test('sets zoomLevel to specified value', () => {
      testInRoot(() => {
        resetZoom();
        setZoom(2.0);
        expect(canvasStore.zoomLevel).toBe(2.0);
      });
    });

    test('clamps value to MIN_ZOOM when below minimum', () => {
      testInRoot(() => {
        resetZoom();
        setZoom(0.05);
        expect(canvasStore.zoomLevel).toBe(0.1);
      });
    });

    test('clamps value to MAX_ZOOM when above maximum', () => {
      testInRoot(() => {
        resetZoom();
        setZoom(10.0);
        expect(canvasStore.zoomLevel).toBe(5.0);
      });
    });

    test('handles edge values correctly', () => {
      testInRoot(() => {
        resetZoom();
        setZoom(0.1); // MIN_ZOOM
        expect(canvasStore.zoomLevel).toBe(0.1);
        setZoom(5.0); // MAX_ZOOM
        expect(canvasStore.zoomLevel).toBe(5.0);
      });
    });
  });

  describe('resetZoom', () => {
    test('resets zoomLevel to 1.0', () => {
      testInRoot(() => {
        setZoom(2.5);
        resetZoom();
        expect(canvasStore.zoomLevel).toBe(1.0);
      });
    });

    test('works after multiple zoom changes', () => {
      testInRoot(() => {
        setZoom(0.5);
        setZoom(3.0);
        setZoom(1.5);
        resetZoom();
        expect(canvasStore.zoomLevel).toBe(1.0);
      });
    });
  });

  describe('resetCanvas', () => {
    test('resets both zoom and pan to initial values', () => {
      testInRoot(() => {
        // Start from clean state
        resetCanvas();

        // Set up non-default state
        setZoom(2.5);
        startPan(100, 100);
        updatePan(200, 200);
        endPan();

        // Verify non-default state (delta: 200-100=100, 200-100=100)
        expect(canvasStore.zoomLevel).toBe(2.5);
        expect(canvasStore.panOffset).toEqual({ x: 100, y: 100 });

        // Reset canvas
        resetCanvas();

        // Verify both zoom and pan are reset
        expect(canvasStore.zoomLevel).toBe(1.0);
        expect(canvasStore.panOffset).toEqual({ x: 0, y: 0 });
        expect(canvasStore.isPanning).toBe(false);
        expect(canvasStore.panStart).toBeNull();
      });
    });

    test('can be called multiple times safely', () => {
      testInRoot(() => {
        // Start from clean state
        resetCanvas();

        setZoom(3.0);
        startPan(50, 50);
        updatePan(100, 100);

        resetCanvas();
        resetCanvas();
        resetCanvas();

        expect(canvasStore.zoomLevel).toBe(1.0);
        expect(canvasStore.panOffset).toEqual({ x: 0, y: 0 });
      });
    });
  });

  describe('zoomIn', () => {
    test('multiplies zoom by ZOOM_FACTOR (1.1)', () => {
      testInRoot(() => {
        resetZoom();
        expect(canvasStore.zoomLevel).toBe(1.0);
        zoomIn();
        expect(canvasStore.zoomLevel).toBeCloseTo(1.1);
      });
    });

    test('accumulates multiple zoom in calls', () => {
      testInRoot(() => {
        resetZoom();
        zoomIn();
        zoomIn();
        zoomIn();
        // 1.0 * 1.1 * 1.1 * 1.1 = 1.331
        expect(canvasStore.zoomLevel).toBeCloseTo(1.331);
      });
    });

    test('clamps at MAX_ZOOM (5.0)', () => {
      testInRoot(() => {
        setZoom(4.9);
        zoomIn();
        // 4.9 * 1.1 = 5.39 -> clamped to 5.0
        expect(canvasStore.zoomLevel).toBe(5.0);
      });
    });

    test('does not exceed MAX_ZOOM with repeated calls', () => {
      testInRoot(() => {
        setZoom(5.0);
        zoomIn();
        zoomIn();
        zoomIn();
        expect(canvasStore.zoomLevel).toBe(5.0);
      });
    });
  });

  describe('zoomOut', () => {
    test('divides zoom by ZOOM_FACTOR (1.1)', () => {
      testInRoot(() => {
        resetZoom();
        expect(canvasStore.zoomLevel).toBe(1.0);
        zoomOut();
        // 1.0 / 1.1 ≈ 0.909
        expect(canvasStore.zoomLevel).toBeCloseTo(1.0 / 1.1);
      });
    });

    test('accumulates multiple zoom out calls', () => {
      testInRoot(() => {
        resetZoom();
        zoomOut();
        zoomOut();
        zoomOut();
        // 1.0 / 1.1 / 1.1 / 1.1 ≈ 0.751
        expect(canvasStore.zoomLevel).toBeCloseTo(1.0 / 1.1 / 1.1 / 1.1);
      });
    });

    test('clamps at MIN_ZOOM (0.1)', () => {
      testInRoot(() => {
        setZoom(0.105);
        zoomOut();
        // 0.105 / 1.1 ≈ 0.095 -> clamped to 0.1
        expect(canvasStore.zoomLevel).toBe(0.1);
      });
    });

    test('does not go below MIN_ZOOM with repeated calls', () => {
      testInRoot(() => {
        setZoom(0.1);
        zoomOut();
        zoomOut();
        zoomOut();
        expect(canvasStore.zoomLevel).toBe(0.1);
      });
    });
  });

  describe('fitToView', () => {
    test('sets zoom and pan to fit template in viewport', () => {
      testInRoot(() => {
        resetCanvas();
        // Viewport: 800x600, Template: 1600x1200
        // Zoom: min(800/1600, 600/1200) = 0.5, pan at origin
        fitToView({ width: 800, height: 600 }, { width: 1600, height: 1200 });
        expect(canvasStore.zoomLevel).toBe(0.5);
        expect(canvasStore.panOffset.x).toBe(0);
        expect(canvasStore.panOffset.y).toBe(0);
      });
    });

    test('zooms to fit small templates (no cap at 1.0)', () => {
      testInRoot(() => {
        resetCanvas();
        // Viewport: 800x600, Template: 100x100 (small)
        // Zoom: min(800/100, 600/100) = 6
        fitToView({ width: 800, height: 600 }, { width: 100, height: 100 });
        expect(canvasStore.zoomLevel).toBe(6);
      });
    });

    test('positions template at top-left origin', () => {
      testInRoot(() => {
        resetCanvas();
        // Viewport: 800x600, Template: 400x300
        // Pan is always at origin (0, 0) for top-left anchored fit
        fitToView({ width: 800, height: 600 }, { width: 400, height: 300 });
        expect(canvasStore.panOffset.x).toBe(0);
        expect(canvasStore.panOffset.y).toBe(0);
      });
    });

    test('handles 0x0 template gracefully', () => {
      testInRoot(() => {
        resetCanvas();
        fitToView({ width: 800, height: 600 }, { width: 0, height: 0 });
        expect(canvasStore.zoomLevel).toBe(1.0);
        expect(canvasStore.panOffset.x).toBe(0);
        expect(canvasStore.panOffset.y).toBe(0);
      });
    });
  });
});
