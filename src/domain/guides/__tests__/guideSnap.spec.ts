/**
 * Tests for guideSnap domain functions
 */
import { describe, expect, test } from 'vitest';
import type { Point, Size } from '../../../types/canvas';
import type { CustomGuide } from '../../../types/guides';
import {
  applySnapToMoveWithGuides,
  applySnapToResizeWithGuides,
  filterGuidesByOrientation,
  findClosestGuide,
  snapEdgesWithGuides,
  snapPointWithGuides,
  snapToGuide,
  snapToNearest,
} from '../guideSnap';

describe('guideSnap', () => {
  const horizontalGuides: CustomGuide[] = [
    { id: 'h1', orientation: 'horizontal', position: 100 },
    { id: 'h2', orientation: 'horizontal', position: 200 },
  ];

  const verticalGuides: CustomGuide[] = [
    { id: 'v1', orientation: 'vertical', position: 150 },
    { id: 'v2', orientation: 'vertical', position: 300 },
  ];

  const allGuides: CustomGuide[] = [...horizontalGuides, ...verticalGuides];

  describe('filterGuidesByOrientation', () => {
    test('filters to horizontal guides', () => {
      const result = filterGuidesByOrientation(allGuides, 'horizontal');
      expect(result).toHaveLength(2);
      expect(result.every((g) => g.orientation === 'horizontal')).toBe(true);
    });

    test('filters to vertical guides', () => {
      const result = filterGuidesByOrientation(allGuides, 'vertical');
      expect(result).toHaveLength(2);
      expect(result.every((g) => g.orientation === 'vertical')).toBe(true);
    });

    test('returns empty array for no matches', () => {
      const result = filterGuidesByOrientation(horizontalGuides, 'vertical');
      expect(result).toHaveLength(0);
    });
  });

  describe('findClosestGuide', () => {
    test('finds closest guide within threshold', () => {
      const guide = findClosestGuide(98, horizontalGuides, 'horizontal', 5);
      expect(guide).toEqual(horizontalGuides[0]);
    });

    test('returns null when outside threshold', () => {
      const guide = findClosestGuide(90, horizontalGuides, 'horizontal', 5);
      expect(guide).toBeNull();
    });

    test('finds closest when multiple guides within threshold', () => {
      const nearbyGuides: CustomGuide[] = [
        { id: 'g1', orientation: 'horizontal', position: 100 },
        { id: 'g2', orientation: 'horizontal', position: 103 },
      ];
      // Position 101 is 1 away from 100, 2 away from 103, so 100 is closer
      const guide = findClosestGuide(101, nearbyGuides, 'horizontal', 5);
      expect(guide?.position).toBe(100);
    });

    test('returns null for wrong orientation', () => {
      const guide = findClosestGuide(100, horizontalGuides, 'vertical', 5);
      expect(guide).toBeNull();
    });
  });

  describe('snapToGuide', () => {
    test('snaps to nearest guide within threshold', () => {
      const result = snapToGuide(98, horizontalGuides, 'horizontal', 5);
      expect(result.snapped).toBe(true);
      expect(result.value).toBe(100);
      expect(result.snapDelta).toBe(2);
      expect(result.snappedTo).toBe('guide');
      expect(result.guideId).toBe('h1');
    });

    test('returns no snap when outside threshold', () => {
      const result = snapToGuide(90, horizontalGuides, 'horizontal', 5);
      expect(result.snapped).toBe(false);
      expect(result.value).toBe(90);
      expect(result.snapDelta).toBe(0);
      expect(result.snappedTo).toBe('none');
      expect(result.guideId).toBeUndefined();
    });

    test('filters by orientation', () => {
      const result = snapToGuide(100, horizontalGuides, 'vertical', 5);
      expect(result.snapped).toBe(false);
    });

    test('handles negative snap delta', () => {
      const result = snapToGuide(102, horizontalGuides, 'horizontal', 5);
      expect(result.snapped).toBe(true);
      expect(result.value).toBe(100);
      expect(result.snapDelta).toBe(-2);
    });
  });

  describe('snapToNearest', () => {
    test('prefers closer of grid or guide', () => {
      // Position 98, grid line at 100, guide at 100
      // Both same distance, guide should win
      const result = snapToNearest(98, 10, horizontalGuides, 'horizontal', 5, true, true);
      expect(result.snapped).toBe(true);
      expect(result.value).toBe(100);
      expect(result.snappedTo).toBe('guide');
    });

    test('snaps to grid when guide disabled', () => {
      const result = snapToNearest(98, 10, horizontalGuides, 'horizontal', 5, true, false);
      expect(result.snapped).toBe(true);
      expect(result.value).toBe(100);
      expect(result.snappedTo).toBe('grid');
    });

    test('snaps to guide when grid disabled', () => {
      const result = snapToNearest(98, 10, horizontalGuides, 'horizontal', 5, false, true);
      expect(result.snapped).toBe(true);
      expect(result.value).toBe(100);
      expect(result.snappedTo).toBe('guide');
    });

    test('no snap when both disabled', () => {
      const result = snapToNearest(98, 10, horizontalGuides, 'horizontal', 5, false, false);
      expect(result.snapped).toBe(false);
      expect(result.value).toBe(98);
    });

    test('prefers grid when closer', () => {
      // Position 11, grid at 10, no guide nearby
      const result = snapToNearest(11, 10, horizontalGuides, 'horizontal', 5, true, true);
      expect(result.snapped).toBe(true);
      expect(result.value).toBe(10);
      expect(result.snappedTo).toBe('grid');
    });

    test('prefers guide when closer than grid', () => {
      // Position 99, guide at 100, grid at 100 (same), guide wins by preference
      const result = snapToNearest(99, 10, horizontalGuides, 'horizontal', 5, true, true);
      expect(result.snapped).toBe(true);
      expect(result.snappedTo).toBe('guide');
    });
  });

  describe('snapPointWithGuides', () => {
    test('snaps X to vertical guides', () => {
      const point: Point = { x: 152, y: 50 };
      const result = snapPointWithGuides(point, 10, allGuides, 5, true, true);

      expect(result.x.snapped).toBe(true);
      expect(result.x.value).toBe(150);
      expect(result.x.snappedTo).toBe('guide');
    });

    test('snaps Y to horizontal guides', () => {
      const point: Point = { x: 50, y: 98 };
      const result = snapPointWithGuides(point, 10, allGuides, 5, true, true);

      expect(result.y.snapped).toBe(true);
      expect(result.y.value).toBe(100);
      expect(result.y.snappedTo).toBe('guide');
    });

    test('returns snapped guide IDs', () => {
      const point: Point = { x: 152, y: 98 };
      const result = snapPointWithGuides(point, 10, allGuides, 5, true, true);

      expect(result.snappedGuideIds).toContain('v1');
      expect(result.snappedGuideIds).toContain('h1');
    });

    test('returns final snapped point', () => {
      const point: Point = { x: 152, y: 98 };
      const result = snapPointWithGuides(point, 10, allGuides, 5, true, true);

      expect(result.point.x).toBe(150);
      expect(result.point.y).toBe(100);
    });
  });

  describe('snapEdgesWithGuides', () => {
    const origin: Point = { x: 95, y: 45 };
    const size: Size = { width: 100, height: 60 };

    test('snaps north handle to horizontal guides', () => {
      const result = snapEdgesWithGuides(origin, size, 'n', 10, allGuides, 5, true, true);
      expect(result.top?.snapped).toBe(true);
      // Top edge at y=45, nearest grid at 50, no horizontal guide nearby
      expect(result.top?.value).toBe(50);
      expect(result.bottom).toBeNull();
    });

    test('snaps south handle to horizontal guides', () => {
      // bottom edge at y=105, guide at y=100
      const testOrigin: Point = { x: 50, y: 50 };
      const testSize: Size = { width: 100, height: 48 }; // bottom at 98
      const result = snapEdgesWithGuides(testOrigin, testSize, 's', 10, allGuides, 5, true, true);
      expect(result.bottom?.snapped).toBe(true);
      expect(result.bottom?.value).toBe(100);
      expect(result.top).toBeNull();
    });

    test('snaps east handle to vertical guides', () => {
      // right edge near 150
      const testOrigin: Point = { x: 45, y: 50 };
      const testSize: Size = { width: 103, height: 60 }; // right at 148
      const result = snapEdgesWithGuides(testOrigin, testSize, 'e', 10, allGuides, 5, true, true);
      expect(result.right?.snapped).toBe(true);
      expect(result.right?.value).toBe(150);
      expect(result.left).toBeNull();
    });

    test('snaps west handle to vertical guides', () => {
      // left edge near 150
      const testOrigin: Point = { x: 148, y: 50 };
      const testSize: Size = { width: 100, height: 60 };
      const result = snapEdgesWithGuides(testOrigin, testSize, 'w', 10, allGuides, 5, true, true);
      expect(result.left?.snapped).toBe(true);
      expect(result.left?.value).toBe(150);
      expect(result.right).toBeNull();
    });

    test('snaps nw handle to both', () => {
      const testOrigin: Point = { x: 152, y: 98 };
      const testSize: Size = { width: 100, height: 60 };
      const result = snapEdgesWithGuides(testOrigin, testSize, 'nw', 10, allGuides, 5, true, true);
      expect(result.top?.snapped).toBe(true);
      expect(result.left?.snapped).toBe(true);
      expect(result.bottom).toBeNull();
      expect(result.right).toBeNull();
    });

    test('snaps ne handle to both', () => {
      const testOrigin: Point = { x: 40, y: 98 };
      const testSize: Size = { width: 108, height: 60 }; // right at 148
      const result = snapEdgesWithGuides(testOrigin, testSize, 'ne', 10, allGuides, 5, true, true);
      expect(result.top?.snapped).toBe(true);
      expect(result.right?.snapped).toBe(true);
      expect(result.bottom).toBeNull();
      expect(result.left).toBeNull();
    });

    test('snaps sw handle to both', () => {
      const testOrigin: Point = { x: 152, y: 40 };
      const testSize: Size = { width: 100, height: 58 }; // bottom at 98
      const result = snapEdgesWithGuides(testOrigin, testSize, 'sw', 10, allGuides, 5, true, true);
      expect(result.bottom?.snapped).toBe(true);
      expect(result.left?.snapped).toBe(true);
      expect(result.top).toBeNull();
      expect(result.right).toBeNull();
    });

    test('snaps se handle to both', () => {
      const testOrigin: Point = { x: 40, y: 40 };
      const testSize: Size = { width: 108, height: 58 }; // right at 148, bottom at 98
      const result = snapEdgesWithGuides(testOrigin, testSize, 'se', 10, allGuides, 5, true, true);
      expect(result.bottom?.snapped).toBe(true);
      expect(result.right?.snapped).toBe(true);
      expect(result.top).toBeNull();
      expect(result.left).toBeNull();
    });
  });

  describe('applySnapToMoveWithGuides', () => {
    test('anchor view snaps and delta applied to all', () => {
      const origins: Record<string, Point> = {
        view1: { x: 152, y: 98 },
        view2: { x: 200, y: 150 },
      };
      const result = applySnapToMoveWithGuides(
        origins,
        'view1',
        10,
        allGuides,
        5,
        true,
        true
      );

      expect(result.didSnap).toBe(true);
      expect(result.snappedOrigins.view1.x).toBe(150);
      expect(result.snappedOrigins.view1.y).toBe(100);
      // view2 should have same delta applied
      expect(result.snappedOrigins.view2.x).toBe(198); // 200 + (-2)
      expect(result.snappedOrigins.view2.y).toBe(152); // 150 + 2
    });

    test('returns snapped guide IDs', () => {
      const origins: Record<string, Point> = {
        view1: { x: 152, y: 98 },
      };
      const result = applySnapToMoveWithGuides(
        origins,
        'view1',
        10,
        allGuides,
        5,
        true,
        true
      );

      expect(result.snappedGuideIds).toContain('v1');
      expect(result.snappedGuideIds).toContain('h1');
    });

    test('returns empty snappedGuideIds when no guide snap', () => {
      const origins: Record<string, Point> = {
        view1: { x: 11, y: 21 },
      };
      const result = applySnapToMoveWithGuides(
        origins,
        'view1',
        10,
        allGuides,
        5,
        true,
        true
      );

      // Should snap to grid, not guide
      expect(result.snappedGuideIds).toHaveLength(0);
    });

    test('handles missing anchor', () => {
      const origins: Record<string, Point> = {
        view1: { x: 152, y: 98 },
      };
      const result = applySnapToMoveWithGuides(
        origins,
        'nonexistent',
        10,
        allGuides,
        5,
        true,
        true
      );

      expect(result.didSnap).toBe(false);
      expect(result.snappedOrigins.view1).toEqual({ x: 152, y: 98 });
    });
  });

  describe('applySnapToResizeWithGuides', () => {
    test('edge snaps and returns adjusted origin/size', () => {
      // Resize from west, left edge at 152, should snap to 150
      const origin: Point = { x: 152, y: 50 };
      const size: Size = { width: 100, height: 60 };

      const result = applySnapToResizeWithGuides(
        origin,
        size,
        'w',
        10,
        allGuides,
        5,
        true,
        true
      );

      expect(result.didSnap).toBe(true);
      expect(result.origin.x).toBe(150);
      expect(result.size.width).toBe(102); // grew by 2
    });

    test('returns snapped guide IDs', () => {
      const origin: Point = { x: 152, y: 50 };
      const size: Size = { width: 100, height: 60 };

      const result = applySnapToResizeWithGuides(
        origin,
        size,
        'w',
        10,
        allGuides,
        5,
        true,
        true
      );

      expect(result.snappedGuideIds).toContain('v1');
    });

    test('respects minimum size constraint', () => {
      // Try to shrink width below minimum
      const origin: Point = { x: 148, y: 50 };
      const size: Size = { width: 5, height: 60 }; // already very small

      const result = applySnapToResizeWithGuides(
        origin,
        size,
        'w',
        10,
        allGuides,
        5,
        true,
        true
      );

      expect(result.size.width).toBeGreaterThanOrEqual(10);
    });

    test('no snap when guides disabled', () => {
      const origin: Point = { x: 152, y: 50 };
      const size: Size = { width: 100, height: 60 };

      const result = applySnapToResizeWithGuides(
        origin,
        size,
        'w',
        10,
        allGuides,
        5,
        true,
        false
      );

      // Should snap to grid (150) not guide
      expect(result.origin.x).toBe(150);
      expect(result.snappedGuideIds).toHaveLength(0);
    });
  });
});
