import { describe, expect, test } from 'vitest';
import type { RenderableView } from '../../../types/canvas';
import type { ViewBounds } from '../../../types/smartGuides';
import {
  getViewBounds,
  isWithinThreshold,
  createGuide,
  GUIDE_THRESHOLD,
} from '../smartGuides';

describe('smartGuides foundational utilities', () => {
  describe('GUIDE_THRESHOLD', () => {
    test('equals 5 pixels', () => {
      expect(GUIDE_THRESHOLD).toBe(5);
    });
  });

  describe('getViewBounds', () => {
    const createMockView = (overrides: Partial<RenderableView> = {}): RenderableView => ({
      id: 'test-view',
      absoluteX: 100,
      absoluteY: 50,
      width: 200,
      height: 100,
      className: 'CView',
      category: 'container',
      zIndex: 0,
      parentId: null,
      ...overrides,
    });

    test('calculates left edge from absoluteX', () => {
      const view = createMockView({ absoluteX: 100 });
      const bounds = getViewBounds(view);
      expect(bounds.left).toBe(100);
    });

    test('calculates right edge from absoluteX + width', () => {
      const view = createMockView({ absoluteX: 100, width: 200 });
      const bounds = getViewBounds(view);
      expect(bounds.right).toBe(300);
    });

    test('calculates top edge from absoluteY', () => {
      const view = createMockView({ absoluteY: 50 });
      const bounds = getViewBounds(view);
      expect(bounds.top).toBe(50);
    });

    test('calculates bottom edge from absoluteY + height', () => {
      const view = createMockView({ absoluteY: 50, height: 100 });
      const bounds = getViewBounds(view);
      expect(bounds.bottom).toBe(150);
    });

    test('calculates centerX from absoluteX + width/2', () => {
      const view = createMockView({ absoluteX: 100, width: 200 });
      const bounds = getViewBounds(view);
      expect(bounds.centerX).toBe(200);
    });

    test('calculates centerY from absoluteY + height/2', () => {
      const view = createMockView({ absoluteY: 50, height: 100 });
      const bounds = getViewBounds(view);
      expect(bounds.centerY).toBe(100);
    });

    test('preserves view id', () => {
      const view = createMockView({ id: 'my-view-id' });
      const bounds = getViewBounds(view);
      expect(bounds.id).toBe('my-view-id');
    });

    test('handles zero position', () => {
      const view = createMockView({ absoluteX: 0, absoluteY: 0 });
      const bounds = getViewBounds(view);
      expect(bounds.left).toBe(0);
      expect(bounds.top).toBe(0);
    });

    test('handles small dimensions', () => {
      const view = createMockView({ width: 10, height: 10, absoluteX: 0, absoluteY: 0 });
      const bounds = getViewBounds(view);
      expect(bounds.right).toBe(10);
      expect(bounds.bottom).toBe(10);
      expect(bounds.centerX).toBe(5);
      expect(bounds.centerY).toBe(5);
    });
  });

  describe('isWithinThreshold', () => {
    test('returns true when distance is 0', () => {
      expect(isWithinThreshold(0)).toBe(true);
    });

    test('returns true when distance equals threshold', () => {
      expect(isWithinThreshold(GUIDE_THRESHOLD)).toBe(true);
    });

    test('returns true when distance is less than threshold', () => {
      expect(isWithinThreshold(3)).toBe(true);
    });

    test('returns false when distance is greater than threshold', () => {
      expect(isWithinThreshold(6)).toBe(false);
    });

    test('handles negative values (absolute distance)', () => {
      expect(isWithinThreshold(-3)).toBe(true);
      expect(isWithinThreshold(-6)).toBe(false);
    });

    test('handles floating point values', () => {
      expect(isWithinThreshold(4.9)).toBe(true);
      expect(isWithinThreshold(5.1)).toBe(false);
    });
  });

  describe('createGuide', () => {
    test('creates guide with vertical orientation', () => {
      const guide = createGuide('vertical', 100, 'edge', ['view-1', 'view-2']);
      expect(guide.orientation).toBe('vertical');
    });

    test('creates guide with horizontal orientation', () => {
      const guide = createGuide('horizontal', 50, 'center', ['view-1']);
      expect(guide.orientation).toBe('horizontal');
    });

    test('sets position correctly', () => {
      const guide = createGuide('vertical', 150, 'edge', ['view-1']);
      expect(guide.position).toBe(150);
    });

    test('sets type correctly for edge', () => {
      const guide = createGuide('vertical', 100, 'edge', ['view-1']);
      expect(guide.type).toBe('edge');
    });

    test('sets type correctly for center', () => {
      const guide = createGuide('horizontal', 100, 'center', ['view-1']);
      expect(guide.type).toBe('center');
    });

    test('sets type correctly for parent-center', () => {
      const guide = createGuide('vertical', 100, 'parent-center', ['view-1', 'parent']);
      expect(guide.type).toBe('parent-center');
    });

    test('sets type correctly for spacing', () => {
      const guide = createGuide('horizontal', 100, 'spacing', ['view-1', 'view-2', 'view-3']);
      expect(guide.type).toBe('spacing');
    });

    test('includes participating view IDs', () => {
      const viewIds = ['view-1', 'view-2', 'view-3'];
      const guide = createGuide('vertical', 100, 'edge', viewIds);
      expect(guide.participatingViewIds).toEqual(viewIds);
    });

    test('generates unique IDs for each guide', () => {
      const guide1 = createGuide('vertical', 100, 'edge', ['view-1']);
      const guide2 = createGuide('vertical', 100, 'edge', ['view-1']);
      expect(guide1.id).not.toBe(guide2.id);
    });

    test('generated IDs contain orientation and type', () => {
      const guide = createGuide('vertical', 100, 'edge', ['view-1']);
      expect(guide.id).toContain('vertical');
      expect(guide.id).toContain('edge');
    });
  });
});
