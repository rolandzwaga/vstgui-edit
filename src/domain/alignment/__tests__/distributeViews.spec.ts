import { describe, expect, it } from 'vitest';
import { createMockRenderableView } from '../../../__tests__/helpers/fixtures';
import type { RenderableView } from '../../../types/canvas';
import type { ViewBounds } from '../../../types/alignment';
import { calculateEqualGap, distributeViews } from '../distributeViews';

describe('calculateEqualGap', () => {
  describe('horizontal distribution', () => {
    it('calculates gap for evenly spaced views', () => {
      const views: ViewBounds[] = [
        { id: 'v1', left: 0, right: 100, top: 0, bottom: 50, centerX: 50, centerY: 25, width: 100, height: 50 },
        { id: 'v2', left: 150, right: 250, top: 0, bottom: 50, centerX: 200, centerY: 25, width: 100, height: 50 },
        { id: 'v3', left: 300, right: 400, top: 0, bottom: 50, centerX: 350, centerY: 25, width: 100, height: 50 },
      ];

      // Total span: 0 to 400 = 400
      // Total width: 100 + 100 + 100 = 300
      // Gap = (400 - 300) / (3 - 1) = 100 / 2 = 50
      const gap = calculateEqualGap(views, 'horizontal');

      expect(gap).toBe(50);
    });

    it('handles views of different widths', () => {
      const views: ViewBounds[] = [
        { id: 'v1', left: 0, right: 50, top: 0, bottom: 50, centerX: 25, centerY: 25, width: 50, height: 50 },
        { id: 'v2', left: 100, right: 200, top: 0, bottom: 50, centerX: 150, centerY: 25, width: 100, height: 50 },
        { id: 'v3', left: 250, right: 400, top: 0, bottom: 50, centerX: 325, centerY: 25, width: 150, height: 50 },
      ];

      // Total span: 0 to 400 = 400
      // Total width: 50 + 100 + 150 = 300
      // Gap = (400 - 300) / (3 - 1) = 100 / 2 = 50
      const gap = calculateEqualGap(views, 'horizontal');

      expect(gap).toBe(50);
    });

    it('handles overlapping views (negative gap)', () => {
      const views: ViewBounds[] = [
        { id: 'v1', left: 0, right: 100, top: 0, bottom: 50, centerX: 50, centerY: 25, width: 100, height: 50 },
        { id: 'v2', left: 50, right: 150, top: 0, bottom: 50, centerX: 100, centerY: 25, width: 100, height: 50 },
        { id: 'v3', left: 100, right: 200, top: 0, bottom: 50, centerX: 150, centerY: 25, width: 100, height: 50 },
      ];

      // Total span: 0 to 200 = 200
      // Total width: 100 + 100 + 100 = 300
      // Gap = (200 - 300) / (3 - 1) = -100 / 2 = -50
      const gap = calculateEqualGap(views, 'horizontal');

      expect(gap).toBe(-50);
    });
  });

  describe('vertical distribution', () => {
    it('calculates gap for evenly spaced views', () => {
      const views: ViewBounds[] = [
        { id: 'v1', left: 0, right: 100, top: 0, bottom: 50, centerX: 50, centerY: 25, width: 100, height: 50 },
        { id: 'v2', left: 0, right: 100, top: 100, bottom: 150, centerX: 50, centerY: 125, width: 100, height: 50 },
        { id: 'v3', left: 0, right: 100, top: 200, bottom: 250, centerX: 50, centerY: 225, width: 100, height: 50 },
      ];

      // Total span: 0 to 250 = 250
      // Total height: 50 + 50 + 50 = 150
      // Gap = (250 - 150) / (3 - 1) = 100 / 2 = 50
      const gap = calculateEqualGap(views, 'vertical');

      expect(gap).toBe(50);
    });
  });

  it('returns 0 for less than 2 views', () => {
    const views: ViewBounds[] = [
      { id: 'v1', left: 0, right: 100, top: 0, bottom: 50, centerX: 50, centerY: 25, width: 100, height: 50 },
    ];

    expect(calculateEqualGap(views, 'horizontal')).toBe(0);
    expect(calculateEqualGap([], 'horizontal')).toBe(0);
  });
});

describe('distributeViews', () => {
  describe('horizontal distribution', () => {
    const views: Record<string, RenderableView> = {
      view1: createMockRenderableView({
        id: 'view1',
        absoluteX: 0,
        absoluteY: 0,
        relativeX: 0,
        relativeY: 0,
        width: 100,
        height: 50,
        parentId: 'root',
      }),
      view2: createMockRenderableView({
        id: 'view2',
        absoluteX: 100,
        absoluteY: 0,
        relativeX: 100,
        relativeY: 0,
        width: 100,
        height: 50,
        parentId: 'root',
      }),
      view3: createMockRenderableView({
        id: 'view3',
        absoluteX: 400,
        absoluteY: 0,
        relativeX: 400,
        relativeY: 0,
        width: 100,
        height: 50,
        parentId: 'root',
      }),
    };

    const getView = (id: string): RenderableView | null => views[id] ?? null;

    it('distributes 3 views with equal gaps', () => {
      const results = distributeViews(['view1', 'view2', 'view3'], 'horizontal', getView);

      // view1 (leftmost) and view3 (rightmost) should not move
      expect(results.find((r) => r.viewId === 'view1')).toBeUndefined();
      expect(results.find((r) => r.viewId === 'view3')).toBeUndefined();

      // view2 should move to create equal gaps
      // Total span: 0 to 500 = 500
      // Total width: 100 + 100 + 100 = 300
      // Gap = (500 - 300) / (3 - 1) = 200 / 2 = 100
      // view2 new position: view1.right + gap = 100 + 100 = 200
      const view2Result = results.find((r) => r.viewId === 'view2');
      expect(view2Result).toBeDefined();
      expect(view2Result?.originalOrigin.x).toBe(100);
      expect(view2Result?.newOrigin.x).toBe(200);
    });

    it('keeps outer views fixed', () => {
      const fourViews: Record<string, RenderableView> = {
        v1: createMockRenderableView({
          id: 'v1',
          absoluteX: 0,
          relativeX: 0,
          width: 50,
          parentId: 'root',
        }),
        v2: createMockRenderableView({
          id: 'v2',
          absoluteX: 50,
          relativeX: 50,
          width: 50,
          parentId: 'root',
        }),
        v3: createMockRenderableView({
          id: 'v3',
          absoluteX: 100,
          relativeX: 100,
          width: 50,
          parentId: 'root',
        }),
        v4: createMockRenderableView({
          id: 'v4',
          absoluteX: 300,
          relativeX: 300,
          width: 50,
          parentId: 'root',
        }),
      };

      const getView4 = (id: string) => fourViews[id] ?? null;
      const results = distributeViews(['v1', 'v2', 'v3', 'v4'], 'horizontal', getView4);

      // Outer views (v1, v4) should not be in results
      expect(results.find((r) => r.viewId === 'v1')).toBeUndefined();
      expect(results.find((r) => r.viewId === 'v4')).toBeUndefined();

      // Inner views (v2, v3) should be redistributed
      expect(results.find((r) => r.viewId === 'v2')).toBeDefined();
      expect(results.find((r) => r.viewId === 'v3')).toBeDefined();
    });
  });

  describe('vertical distribution', () => {
    const views: Record<string, RenderableView> = {
      view1: createMockRenderableView({
        id: 'view1',
        absoluteX: 0,
        absoluteY: 0,
        relativeX: 0,
        relativeY: 0,
        width: 100,
        height: 50,
        parentId: 'root',
      }),
      view2: createMockRenderableView({
        id: 'view2',
        absoluteX: 0,
        absoluteY: 50,
        relativeX: 0,
        relativeY: 50,
        width: 100,
        height: 50,
        parentId: 'root',
      }),
      view3: createMockRenderableView({
        id: 'view3',
        absoluteX: 0,
        absoluteY: 250,
        relativeX: 0,
        relativeY: 250,
        width: 100,
        height: 50,
        parentId: 'root',
      }),
    };

    const getView = (id: string): RenderableView | null => views[id] ?? null;

    it('distributes 3 views vertically with equal gaps', () => {
      const results = distributeViews(['view1', 'view2', 'view3'], 'vertical', getView);

      // view1 (topmost) and view3 (bottommost) should not move
      expect(results.find((r) => r.viewId === 'view1')).toBeUndefined();
      expect(results.find((r) => r.viewId === 'view3')).toBeUndefined();

      // view2 should move
      // Total span: 0 to 300 = 300
      // Total height: 50 + 50 + 50 = 150
      // Gap = (300 - 150) / (3 - 1) = 150 / 2 = 75
      // view2 new position: view1.bottom + gap = 50 + 75 = 125
      const view2Result = results.find((r) => r.viewId === 'view2');
      expect(view2Result).toBeDefined();
      expect(view2Result?.originalOrigin.y).toBe(50);
      expect(view2Result?.newOrigin.y).toBe(125);
    });
  });

  describe('edge cases', () => {
    it('returns empty array for less than 3 views', () => {
      const views: Record<string, RenderableView> = {
        v1: createMockRenderableView({ id: 'v1', parentId: 'root' }),
        v2: createMockRenderableView({ id: 'v2', parentId: 'root' }),
      };
      const getView = (id: string) => views[id] ?? null;

      expect(distributeViews(['v1', 'v2'], 'horizontal', getView)).toEqual([]);
      expect(distributeViews(['v1'], 'horizontal', getView)).toEqual([]);
      expect(distributeViews([], 'horizontal', getView)).toEqual([]);
    });

    it('returns empty array if already evenly distributed', () => {
      const evenViews: Record<string, RenderableView> = {
        v1: createMockRenderableView({
          id: 'v1',
          absoluteX: 0,
          relativeX: 0,
          width: 100,
          parentId: 'root',
        }),
        v2: createMockRenderableView({
          id: 'v2',
          absoluteX: 150,
          relativeX: 150,
          width: 100,
          parentId: 'root',
        }),
        v3: createMockRenderableView({
          id: 'v3',
          absoluteX: 300,
          relativeX: 300,
          width: 100,
          parentId: 'root',
        }),
      };

      const getView = (id: string) => evenViews[id] ?? null;
      const results = distributeViews(['v1', 'v2', 'v3'], 'horizontal', getView);

      // All views are already at equal gaps (50px), no movement needed
      expect(results).toHaveLength(0);
    });

    it('handles views of different sizes correctly', () => {
      const diffSizeViews: Record<string, RenderableView> = {
        v1: createMockRenderableView({
          id: 'v1',
          absoluteX: 0,
          relativeX: 0,
          width: 50,
          parentId: 'root',
        }),
        v2: createMockRenderableView({
          id: 'v2',
          absoluteX: 75,
          relativeX: 75,
          width: 100,
          parentId: 'root',
        }),
        v3: createMockRenderableView({
          id: 'v3',
          absoluteX: 300,
          relativeX: 300,
          width: 150,
          parentId: 'root',
        }),
      };

      const getView = (id: string) => diffSizeViews[id] ?? null;
      const results = distributeViews(['v1', 'v2', 'v3'], 'horizontal', getView);

      // Total span: 0 to 450 = 450
      // Total width: 50 + 100 + 150 = 300
      // Gap = (450 - 300) / (3 - 1) = 150 / 2 = 75
      // v2 new position: v1.right + gap = 50 + 75 = 125
      const v2Result = results.find((r) => r.viewId === 'v2');
      expect(v2Result).toBeDefined();
      expect(v2Result?.newOrigin.x).toBe(125);
    });
  });
});
