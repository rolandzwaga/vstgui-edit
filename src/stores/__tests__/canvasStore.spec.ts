import { describe, expect, test } from 'vitest';
import { testInRoot } from '../../__tests__/helpers/solidjs';
import {
  canvasStore,
  endPan,
  resetPan,
  startPan,
  updatePan,
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
});
