/**
 * Hit Test Utility Tests
 * Tests for point-in-view hit testing
 */
import { describe, expect, it } from 'vitest';
import type { RenderableView } from '../../../types/canvas';
import { hitTest } from '../hitTest';

// Helper to create mock views
const createMockView = (
  id: string,
  x: number,
  y: number,
  width: number,
  height: number,
  zIndex: number
): RenderableView => ({
  id,
  absoluteX: x,
  absoluteY: y,
  relativeX: x,
  relativeY: y,
  width,
  height,
  className: 'CView',
  category: 'control',
  zIndex,
  parentId: null,
});

describe('hitTest', () => {
  describe('single view', () => {
    const views = [createMockView('view-1', 0, 0, 100, 100, 0)];

    it('should return view ID when point is inside', () => {
      expect(hitTest({ x: 50, y: 50 }, views)).toBe('view-1');
    });

    it('should return view ID when point is at top-left corner', () => {
      expect(hitTest({ x: 0, y: 0 }, views)).toBe('view-1');
    });

    it('should return null when point is at bottom-right corner (exclusive)', () => {
      // Bottom-right corner is exclusive (x < x + width, not x <= x + width)
      expect(hitTest({ x: 100, y: 100 }, views)).toBeNull();
    });

    it('should return view ID when point is just inside bottom-right', () => {
      expect(hitTest({ x: 99, y: 99 }, views)).toBe('view-1');
    });

    it('should return null when point is outside', () => {
      expect(hitTest({ x: 150, y: 150 }, views)).toBeNull();
    });

    it('should return null when point is to the left', () => {
      expect(hitTest({ x: -10, y: 50 }, views)).toBeNull();
    });

    it('should return null when point is above', () => {
      expect(hitTest({ x: 50, y: -10 }, views)).toBeNull();
    });
  });

  describe('multiple non-overlapping views', () => {
    const views = [
      createMockView('view-1', 0, 0, 100, 100, 0),
      createMockView('view-2', 150, 0, 100, 100, 1),
      createMockView('view-3', 0, 150, 100, 100, 2),
    ];

    it('should return correct view for each position', () => {
      expect(hitTest({ x: 50, y: 50 }, views)).toBe('view-1');
      expect(hitTest({ x: 200, y: 50 }, views)).toBe('view-2');
      expect(hitTest({ x: 50, y: 200 }, views)).toBe('view-3');
    });

    it('should return null in gaps between views', () => {
      expect(hitTest({ x: 125, y: 50 }, views)).toBeNull();
      expect(hitTest({ x: 50, y: 125 }, views)).toBeNull();
    });
  });

  describe('overlapping views (z-order)', () => {
    const views = [
      createMockView('bottom', 0, 0, 100, 100, 0),
      createMockView('middle', 25, 25, 100, 100, 1),
      createMockView('top', 50, 50, 100, 100, 2),
    ];

    it('should return topmost view at overlapping point', () => {
      // Point (75, 75) is inside all three views - should return top
      expect(hitTest({ x: 75, y: 75 }, views)).toBe('top');
    });

    it('should return middle when top is not covering', () => {
      // Point (30, 30) is in bottom and middle, but not top
      expect(hitTest({ x: 30, y: 30 }, views)).toBe('middle');
    });

    it('should return bottom when only bottom covers point', () => {
      // Point (10, 10) is only in bottom
      expect(hitTest({ x: 10, y: 10 }, views)).toBe('bottom');
    });

    it('should return top even when middle/bottom also contain point', () => {
      // Point at edge of overlap
      expect(hitTest({ x: 50, y: 50 }, views)).toBe('top');
    });
  });

  describe('empty views array', () => {
    it('should return null', () => {
      expect(hitTest({ x: 50, y: 50 }, [])).toBeNull();
    });
  });

  describe('view with offset position', () => {
    const views = [createMockView('offset', 100, 200, 50, 50, 0)];

    it('should hit view at correct offset position', () => {
      expect(hitTest({ x: 125, y: 225 }, views)).toBe('offset');
    });

    it('should miss before offset', () => {
      expect(hitTest({ x: 50, y: 50 }, views)).toBeNull();
    });
  });
});
