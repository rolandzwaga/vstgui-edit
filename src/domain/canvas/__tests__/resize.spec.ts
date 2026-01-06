import { describe, expect, it, vi } from 'vitest';
import { MIN_VIEW_SIZE } from '../../../types/resize';
import {
  calculateResizeBounds,
  clampToMinimumSize,
  createResizeOperation,
  formatSize,
} from '../resize';

describe('resize utilities', () => {
  describe('formatSize', () => {
    it('should format size as "width, height"', () => {
      expect(formatSize({ width: 100, height: 50 })).toBe('100, 50');
    });

    it('should handle zero dimensions', () => {
      expect(formatSize({ width: 0, height: 0 })).toBe('0, 0');
    });

    it('should handle large numbers', () => {
      expect(formatSize({ width: 1920, height: 1080 })).toBe('1920, 1080');
    });

    it('should round fractional values', () => {
      expect(formatSize({ width: 100.6, height: 50.4 })).toBe('101, 50');
    });
  });

  describe('clampToMinimumSize', () => {
    it('should not change bounds when size is above minimum', () => {
      const bounds = { origin: { x: 10, y: 10 }, size: { width: 100, height: 100 } };
      const result = clampToMinimumSize(bounds, 'se');
      expect(result).toEqual(bounds);
    });

    it('should clamp width to minimum when too small', () => {
      const bounds = { origin: { x: 10, y: 10 }, size: { width: 5, height: 100 } };
      const result = clampToMinimumSize(bounds, 'se');
      expect(result.size.width).toBe(MIN_VIEW_SIZE);
    });

    it('should clamp height to minimum when too small', () => {
      const bounds = { origin: { x: 10, y: 10 }, size: { width: 100, height: 3 } };
      const result = clampToMinimumSize(bounds, 'se');
      expect(result.size.height).toBe(MIN_VIEW_SIZE);
    });

    it('should clamp both dimensions when both too small', () => {
      const bounds = { origin: { x: 10, y: 10 }, size: { width: 2, height: 5 } };
      const result = clampToMinimumSize(bounds, 'se');
      expect(result.size.width).toBe(MIN_VIEW_SIZE);
      expect(result.size.height).toBe(MIN_VIEW_SIZE);
    });

    it('should allow custom minimum size', () => {
      const bounds = { origin: { x: 10, y: 10 }, size: { width: 15, height: 15 } };
      const result = clampToMinimumSize(bounds, 'se', 20);
      expect(result.size.width).toBe(20);
      expect(result.size.height).toBe(20);
    });

    describe('origin adjustment for handles that affect origin', () => {
      it('should adjust origin for NW handle when clamped', () => {
        const bounds = { origin: { x: 95, y: 95 }, size: { width: 5, height: 5 } };
        const result = clampToMinimumSize(bounds, 'nw');
        expect(result.origin.x).toBe(90);
        expect(result.origin.y).toBe(90);
      });

      it('should adjust origin.x for W handle when clamped', () => {
        const bounds = { origin: { x: 95, y: 10 }, size: { width: 5, height: 100 } };
        const result = clampToMinimumSize(bounds, 'w');
        expect(result.origin.x).toBe(90);
        expect(result.origin.y).toBe(10);
      });

      it('should adjust origin.y for N handle when clamped', () => {
        const bounds = { origin: { x: 10, y: 95 }, size: { width: 100, height: 5 } };
        const result = clampToMinimumSize(bounds, 'n');
        expect(result.origin.x).toBe(10);
        expect(result.origin.y).toBe(90);
      });

      it('should adjust origin.y for NE handle when clamped', () => {
        const bounds = { origin: { x: 10, y: 95 }, size: { width: 5, height: 5 } };
        const result = clampToMinimumSize(bounds, 'ne');
        expect(result.origin.x).toBe(10);
        expect(result.origin.y).toBe(90);
      });

      it('should adjust origin.x for SW handle when clamped', () => {
        const bounds = { origin: { x: 95, y: 10 }, size: { width: 5, height: 5 } };
        const result = clampToMinimumSize(bounds, 'sw');
        expect(result.origin.x).toBe(90);
        expect(result.origin.y).toBe(10);
      });

      it('should not adjust origin for SE handle', () => {
        const bounds = { origin: { x: 10, y: 10 }, size: { width: 5, height: 5 } };
        const result = clampToMinimumSize(bounds, 'se');
        expect(result.origin.x).toBe(10);
        expect(result.origin.y).toBe(10);
      });

      it('should not adjust origin for E handle', () => {
        const bounds = { origin: { x: 10, y: 10 }, size: { width: 5, height: 100 } };
        const result = clampToMinimumSize(bounds, 'e');
        expect(result.origin.x).toBe(10);
      });

      it('should not adjust origin for S handle', () => {
        const bounds = { origin: { x: 10, y: 10 }, size: { width: 100, height: 5 } };
        const result = clampToMinimumSize(bounds, 's');
        expect(result.origin.y).toBe(10);
      });
    });
  });

  describe('calculateResizeBounds', () => {
    const originalOrigin = { x: 50, y: 50 };
    const originalSize = { width: 100, height: 100 };

    describe('SE handle (bottom-right corner)', () => {
      it('should increase size when dragging right and down', () => {
        const delta = { x: 20, y: 30 };
        const result = calculateResizeBounds('se', originalOrigin, originalSize, delta);
        expect(result.origin).toEqual({ x: 50, y: 50 });
        expect(result.size).toEqual({ width: 120, height: 130 });
      });

      it('should decrease size when dragging left and up', () => {
        const delta = { x: -20, y: -30 };
        const result = calculateResizeBounds('se', originalOrigin, originalSize, delta);
        expect(result.origin).toEqual({ x: 50, y: 50 });
        expect(result.size).toEqual({ width: 80, height: 70 });
      });
    });

    describe('NW handle (top-left corner)', () => {
      it('should move origin and adjust size when dragging left and up', () => {
        const delta = { x: -20, y: -30 };
        const result = calculateResizeBounds('nw', originalOrigin, originalSize, delta);
        expect(result.origin).toEqual({ x: 30, y: 20 });
        expect(result.size).toEqual({ width: 120, height: 130 });
      });

      it('should move origin and shrink when dragging right and down', () => {
        const delta = { x: 20, y: 30 };
        const result = calculateResizeBounds('nw', originalOrigin, originalSize, delta);
        expect(result.origin).toEqual({ x: 70, y: 80 });
        expect(result.size).toEqual({ width: 80, height: 70 });
      });
    });

    describe('NE handle (top-right corner)', () => {
      it('should move origin.y and adjust size', () => {
        const delta = { x: 20, y: -30 };
        const result = calculateResizeBounds('ne', originalOrigin, originalSize, delta);
        expect(result.origin).toEqual({ x: 50, y: 20 });
        expect(result.size).toEqual({ width: 120, height: 130 });
      });
    });

    describe('SW handle (bottom-left corner)', () => {
      it('should move origin.x and adjust size', () => {
        const delta = { x: -20, y: 30 };
        const result = calculateResizeBounds('sw', originalOrigin, originalSize, delta);
        expect(result.origin).toEqual({ x: 30, y: 50 });
        expect(result.size).toEqual({ width: 120, height: 130 });
      });
    });

    describe('E handle (right edge)', () => {
      it('should only change width', () => {
        const delta = { x: 25, y: 100 };
        const result = calculateResizeBounds('e', originalOrigin, originalSize, delta);
        expect(result.origin).toEqual({ x: 50, y: 50 });
        expect(result.size).toEqual({ width: 125, height: 100 });
      });
    });

    describe('W handle (left edge)', () => {
      it('should change origin.x and width', () => {
        const delta = { x: -25, y: 100 };
        const result = calculateResizeBounds('w', originalOrigin, originalSize, delta);
        expect(result.origin).toEqual({ x: 25, y: 50 });
        expect(result.size).toEqual({ width: 125, height: 100 });
      });
    });

    describe('S handle (bottom edge)', () => {
      it('should only change height', () => {
        const delta = { x: 100, y: 25 };
        const result = calculateResizeBounds('s', originalOrigin, originalSize, delta);
        expect(result.origin).toEqual({ x: 50, y: 50 });
        expect(result.size).toEqual({ width: 100, height: 125 });
      });
    });

    describe('N handle (top edge)', () => {
      it('should change origin.y and height', () => {
        const delta = { x: 100, y: -25 };
        const result = calculateResizeBounds('n', originalOrigin, originalSize, delta);
        expect(result.origin).toEqual({ x: 50, y: 25 });
        expect(result.size).toEqual({ width: 100, height: 125 });
      });
    });

    describe('with maintainAspectRatio option', () => {
      it('should maintain aspect ratio when resizing SE corner with horizontal movement', () => {
        const size = { width: 200, height: 100 };
        const delta = { x: 50, y: 10 };
        const result = calculateResizeBounds('se', originalOrigin, size, delta, {
          maintainAspectRatio: true,
        });
        expect(result.size.width).toBe(250);
        expect(result.size.height).toBe(125);
      });

      it('should use height as driver when vertical movement is larger', () => {
        const size = { width: 200, height: 100 };
        const delta = { x: 10, y: 50 };
        const result = calculateResizeBounds('se', originalOrigin, size, delta, {
          maintainAspectRatio: true,
        });
        expect(result.size.height).toBe(150);
        expect(result.size.width).toBe(300);
      });
    });

    describe('with resizeFromCenter option', () => {
      it('should resize symmetrically from center for SE corner', () => {
        const delta = { x: 20, y: 10 };
        const result = calculateResizeBounds('se', originalOrigin, originalSize, delta, {
          resizeFromCenter: true,
        });
        expect(result.origin).toEqual({ x: 30, y: 40 });
        expect(result.size).toEqual({ width: 140, height: 120 });
      });

      it('should resize symmetrically from center for NW corner', () => {
        const delta = { x: -20, y: -10 };
        const result = calculateResizeBounds('nw', originalOrigin, originalSize, delta, {
          resizeFromCenter: true,
        });
        expect(result.origin).toEqual({ x: 70, y: 60 });
        expect(result.size).toEqual({ width: 60, height: 80 });
      });
    });

    describe('with both maintainAspectRatio and resizeFromCenter', () => {
      it('should combine both behaviors', () => {
        const size = { width: 200, height: 100 };
        const delta = { x: 40, y: 10 };
        const result = calculateResizeBounds('se', originalOrigin, size, delta, {
          maintainAspectRatio: true,
          resizeFromCenter: true,
        });
        expect(result.size.width / result.size.height).toBeCloseTo(2, 1);
      });
    });
  });

  describe('createResizeOperation', () => {
    it('should create operation with correct type and description', () => {
      const mockUpdateOrigin = vi.fn();
      const mockUpdateSize = vi.fn();
      const data = {
        viewId: 'view-1',
        originalOrigin: { x: 10, y: 20 },
        originalSize: { width: 100, height: 50 },
        newOrigin: { x: 15, y: 25 },
        newSize: { width: 120, height: 60 },
      };

      const operation = createResizeOperation(data, mockUpdateOrigin, mockUpdateSize);

      expect(operation.type).toBe('resize');
      expect(operation.description).toBe('Resize view');
      expect(typeof operation.timestamp).toBe('number');
    });

    it('should restore original values on undo', () => {
      const mockUpdateOrigin = vi.fn();
      const mockUpdateSize = vi.fn();
      const data = {
        viewId: 'view-1',
        originalOrigin: { x: 10, y: 20 },
        originalSize: { width: 100, height: 50 },
        newOrigin: { x: 15, y: 25 },
        newSize: { width: 120, height: 60 },
      };

      const operation = createResizeOperation(data, mockUpdateOrigin, mockUpdateSize);
      operation.undo();

      expect(mockUpdateOrigin).toHaveBeenCalledWith('view-1', { x: 10, y: 20 });
      expect(mockUpdateSize).toHaveBeenCalledWith('view-1', { width: 100, height: 50 });
    });

    it('should apply new values on redo', () => {
      const mockUpdateOrigin = vi.fn();
      const mockUpdateSize = vi.fn();
      const data = {
        viewId: 'view-1',
        originalOrigin: { x: 10, y: 20 },
        originalSize: { width: 100, height: 50 },
        newOrigin: { x: 15, y: 25 },
        newSize: { width: 120, height: 60 },
      };

      const operation = createResizeOperation(data, mockUpdateOrigin, mockUpdateSize);
      operation.redo();

      expect(mockUpdateOrigin).toHaveBeenCalledWith('view-1', { x: 15, y: 25 });
      expect(mockUpdateSize).toHaveBeenCalledWith('view-1', { width: 120, height: 60 });
    });
  });
});
