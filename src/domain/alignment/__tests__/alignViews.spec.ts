import { describe, expect, it } from 'vitest';
import { createMockRenderableView } from '../../../__tests__/helpers/fixtures';
import type { RenderableView } from '../../../types/canvas';
import type { SelectionBounds, ViewBounds } from '../../../types/alignment';
import {
  alignViews,
  calculateAlignedPosition,
  getAlignmentReference,
} from '../alignViews';

describe('getAlignmentReference', () => {
  const bounds: SelectionBounds = {
    left: 10,
    right: 200,
    top: 20,
    bottom: 150,
    centerX: 105,
    centerY: 85,
    width: 190,
    height: 130,
  };

  it('returns left edge for left alignment', () => {
    expect(getAlignmentReference(bounds, 'left')).toBe(10);
  });

  it('returns center X for center alignment', () => {
    expect(getAlignmentReference(bounds, 'center')).toBe(105);
  });

  it('returns right edge for right alignment', () => {
    expect(getAlignmentReference(bounds, 'right')).toBe(200);
  });

  it('returns top edge for top alignment', () => {
    expect(getAlignmentReference(bounds, 'top')).toBe(20);
  });

  it('returns center Y for middle alignment', () => {
    expect(getAlignmentReference(bounds, 'middle')).toBe(85);
  });

  it('returns bottom edge for bottom alignment', () => {
    expect(getAlignmentReference(bounds, 'bottom')).toBe(150);
  });
});

describe('calculateAlignedPosition', () => {
  const viewBounds: ViewBounds = {
    id: 'test',
    left: 100,
    right: 200,
    top: 50,
    bottom: 100,
    centerX: 150,
    centerY: 75,
    width: 100,
    height: 50,
  };

  const originalOrigin = { x: 100, y: 50 };

  describe('horizontal alignment', () => {
    it('aligns left edge to reference', () => {
      // View currently at left=100, align to left=50
      const newOrigin = calculateAlignedPosition(viewBounds, 50, 'left', originalOrigin);
      // Need to move left by 50 (from 100 to 50)
      expect(newOrigin.x).toBe(50);
      expect(newOrigin.y).toBe(50); // Y unchanged
    });

    it('aligns center to reference', () => {
      // View center currently at 150, align center to 200
      const newOrigin = calculateAlignedPosition(viewBounds, 200, 'center', originalOrigin);
      // Need to move right by 50 (center from 150 to 200)
      // New left = 200 - 50 = 150
      expect(newOrigin.x).toBe(150);
      expect(newOrigin.y).toBe(50);
    });

    it('aligns right edge to reference', () => {
      // View right currently at 200, align right to 300
      const newOrigin = calculateAlignedPosition(viewBounds, 300, 'right', originalOrigin);
      // New left = 300 - 100 = 200
      expect(newOrigin.x).toBe(200);
      expect(newOrigin.y).toBe(50);
    });
  });

  describe('vertical alignment', () => {
    it('aligns top edge to reference', () => {
      // View currently at top=50, align to top=100
      const newOrigin = calculateAlignedPosition(viewBounds, 100, 'top', originalOrigin);
      expect(newOrigin.x).toBe(100); // X unchanged
      expect(newOrigin.y).toBe(100);
    });

    it('aligns middle to reference', () => {
      // View middle currently at 75, align middle to 150
      const newOrigin = calculateAlignedPosition(viewBounds, 150, 'middle', originalOrigin);
      // New top = 150 - 25 = 125
      expect(newOrigin.x).toBe(100);
      expect(newOrigin.y).toBe(125);
    });

    it('aligns bottom edge to reference', () => {
      // View bottom currently at 100, align bottom to 200
      const newOrigin = calculateAlignedPosition(viewBounds, 200, 'bottom', originalOrigin);
      // New top = 200 - 50 = 150
      expect(newOrigin.x).toBe(100);
      expect(newOrigin.y).toBe(150);
    });
  });

  it('preserves original relative offset from absolute position', () => {
    // View has absoluteX=100 but relativeX=20 (parent at 80)
    const viewWithOffset: ViewBounds = {
      id: 'offset-view',
      left: 100,
      right: 200,
      top: 50,
      bottom: 100,
      centerX: 150,
      centerY: 75,
      width: 100,
      height: 50,
    };
    const relativeOrigin = { x: 20, y: 10 };

    // Align left to 50 (move by -50 in absolute terms)
    const newOrigin = calculateAlignedPosition(viewWithOffset, 50, 'left', relativeOrigin);
    // Relative X should decrease by same amount: 20 - 50 = -30
    expect(newOrigin.x).toBe(-30);
    expect(newOrigin.y).toBe(10);
  });
});

describe('alignViews', () => {
  describe('multi-select alignment', () => {
    const views: Record<string, RenderableView> = {
      view1: createMockRenderableView({
        id: 'view1',
        absoluteX: 10,
        absoluteY: 20,
        relativeX: 10,
        relativeY: 20,
        width: 100,
        height: 50,
        parentId: 'root',
      }),
      view2: createMockRenderableView({
        id: 'view2',
        absoluteX: 200,
        absoluteY: 100,
        relativeX: 200,
        relativeY: 100,
        width: 80,
        height: 60,
        parentId: 'root',
      }),
      view3: createMockRenderableView({
        id: 'view3',
        absoluteX: 50,
        absoluteY: 150,
        relativeX: 50,
        relativeY: 150,
        width: 120,
        height: 40,
        parentId: 'root',
      }),
      root: createMockRenderableView({
        id: 'root',
        absoluteX: 0,
        absoluteY: 0,
        relativeX: 0,
        relativeY: 0,
        width: 800,
        height: 600,
        parentId: null,
      }),
    };

    const getView = (id: string): RenderableView | null => views[id] ?? null;
    const getParentId = (id: string): string | null => views[id]?.parentId ?? null;

    it('aligns all views to leftmost left edge', () => {
      // Leftmost left edge is view1 at x=10
      const results = alignViews(['view1', 'view2', 'view3'], 'left', getView, getParentId);

      // view1 already at 10, should not be in results
      expect(results.find((r) => r.viewId === 'view1')).toBeUndefined();

      // view2 should move from 200 to 10
      const view2Result = results.find((r) => r.viewId === 'view2');
      expect(view2Result?.originalOrigin).toEqual({ x: 200, y: 100 });
      expect(view2Result?.newOrigin.x).toBe(10);

      // view3 should move from 50 to 10
      const view3Result = results.find((r) => r.viewId === 'view3');
      expect(view3Result?.originalOrigin).toEqual({ x: 50, y: 150 });
      expect(view3Result?.newOrigin.x).toBe(10);
    });

    it('aligns all views to horizontal center of bounding box', () => {
      // Bounding box: left=10, right=280 -> centerX=145
      const results = alignViews(['view1', 'view2', 'view3'], 'center', getView, getParentId);

      // view1 (width 100): center should be at 145, so left = 145-50 = 95
      const view1Result = results.find((r) => r.viewId === 'view1');
      expect(view1Result?.newOrigin.x).toBe(95);

      // view2 (width 80): center at 145, left = 145-40 = 105
      const view2Result = results.find((r) => r.viewId === 'view2');
      expect(view2Result?.newOrigin.x).toBe(105);

      // view3 (width 120): center at 145, left = 145-60 = 85
      const view3Result = results.find((r) => r.viewId === 'view3');
      expect(view3Result?.newOrigin.x).toBe(85);
    });

    it('aligns all views to rightmost right edge', () => {
      // Rightmost right edge is view2 at 200+80=280
      const results = alignViews(['view1', 'view2', 'view3'], 'right', getView, getParentId);

      // view1 (width 100): right at 280, left = 280-100 = 180
      const view1Result = results.find((r) => r.viewId === 'view1');
      expect(view1Result?.newOrigin.x).toBe(180);

      // view2 already at right edge, should not be in results
      expect(results.find((r) => r.viewId === 'view2')).toBeUndefined();

      // view3 (width 120): right at 280, left = 280-120 = 160
      const view3Result = results.find((r) => r.viewId === 'view3');
      expect(view3Result?.newOrigin.x).toBe(160);
    });

    it('aligns all views to topmost top edge', () => {
      // Topmost top edge is view1 at y=20
      const results = alignViews(['view1', 'view2', 'view3'], 'top', getView, getParentId);

      // view1 already at 20, should not be in results
      expect(results.find((r) => r.viewId === 'view1')).toBeUndefined();

      // view2 should move from 100 to 20
      const view2Result = results.find((r) => r.viewId === 'view2');
      expect(view2Result?.newOrigin.y).toBe(20);

      // view3 should move from 150 to 20
      const view3Result = results.find((r) => r.viewId === 'view3');
      expect(view3Result?.newOrigin.y).toBe(20);
    });

    it('aligns all views to vertical center of bounding box', () => {
      // Bounding box: top=20, bottom=190 -> centerY=105
      const results = alignViews(['view1', 'view2', 'view3'], 'middle', getView, getParentId);

      // view1 (height 50): center at 105, top = 105-25 = 80
      const view1Result = results.find((r) => r.viewId === 'view1');
      expect(view1Result?.newOrigin.y).toBe(80);

      // view2 (height 60): center at 105, top = 105-30 = 75
      const view2Result = results.find((r) => r.viewId === 'view2');
      expect(view2Result?.newOrigin.y).toBe(75);

      // view3 (height 40): center at 105, top = 105-20 = 85
      const view3Result = results.find((r) => r.viewId === 'view3');
      expect(view3Result?.newOrigin.y).toBe(85);
    });

    it('aligns all views to bottommost bottom edge', () => {
      // Bottommost bottom edge is view3 at 150+40=190
      const results = alignViews(['view1', 'view2', 'view3'], 'bottom', getView, getParentId);

      // view1 (height 50): bottom at 190, top = 190-50 = 140
      const view1Result = results.find((r) => r.viewId === 'view1');
      expect(view1Result?.newOrigin.y).toBe(140);

      // view2 (height 60): bottom at 190, top = 190-60 = 130
      const view2Result = results.find((r) => r.viewId === 'view2');
      expect(view2Result?.newOrigin.y).toBe(130);

      // view3 already at bottom, should not be in results
      expect(results.find((r) => r.viewId === 'view3')).toBeUndefined();
    });

    it('returns empty array if views already aligned', () => {
      // All three views already have left edge at 10
      const alignedViews: Record<string, RenderableView> = {
        viewA: createMockRenderableView({
          id: 'viewA',
          absoluteX: 10,
          relativeX: 10,
          absoluteY: 20,
          relativeY: 20,
          parentId: 'root',
        }),
        viewB: createMockRenderableView({
          id: 'viewB',
          absoluteX: 10,
          relativeX: 10,
          absoluteY: 80,
          relativeY: 80,
          parentId: 'root',
        }),
        root: createMockRenderableView({
          id: 'root',
          absoluteX: 0,
          relativeX: 0,
          absoluteY: 0,
          relativeY: 0,
          parentId: null,
        }),
      };

      const getAlignedView = (id: string) => alignedViews[id] ?? null;
      const getAlignedParentId = (id: string) => alignedViews[id]?.parentId ?? null;

      const results = alignViews(['viewA', 'viewB'], 'left', getAlignedView, getAlignedParentId);
      expect(results).toHaveLength(0);
    });

    it('returns empty array for empty selection', () => {
      const results = alignViews([], 'left', getView, getParentId);
      expect(results).toHaveLength(0);
    });

    it('returns empty array for nonexistent views', () => {
      const results = alignViews(['nonexistent'], 'left', getView, getParentId);
      expect(results).toHaveLength(0);
    });
  });

  describe('single-view alignment to parent', () => {
    const views: Record<string, RenderableView> = {
      root: createMockRenderableView({
        id: 'root',
        absoluteX: 0,
        absoluteY: 0,
        relativeX: 0,
        relativeY: 0,
        width: 800,
        height: 600,
        parentId: null,
      }),
      container: createMockRenderableView({
        id: 'container',
        absoluteX: 100,
        absoluteY: 50,
        relativeX: 100,
        relativeY: 50,
        width: 400,
        height: 300,
        parentId: 'root',
      }),
      child: createMockRenderableView({
        id: 'child',
        absoluteX: 120,
        absoluteY: 70,
        relativeX: 20,
        relativeY: 20,
        width: 100,
        height: 50,
        parentId: 'container',
      }),
    };

    const getView = (id: string): RenderableView | null => views[id] ?? null;
    const getParentId = (id: string): string | null => views[id]?.parentId ?? null;

    it('aligns left edge to parent left (x=0 relative)', () => {
      const results = alignViews(['child'], 'left', getView, getParentId);

      expect(results).toHaveLength(1);
      expect(results[0].viewId).toBe('child');
      expect(results[0].newOrigin.x).toBe(0);
      expect(results[0].newOrigin.y).toBe(20); // Y unchanged
    });

    it('aligns center to parent center', () => {
      // Parent (container) center: 100 + 200 = 300 absolute
      // Child width 100, so center to be at 300, left = 250 absolute
      // In relative to parent: 250 - 100 = 150
      const results = alignViews(['child'], 'center', getView, getParentId);

      expect(results).toHaveLength(1);
      expect(results[0].newOrigin.x).toBe(150);
    });

    it('aligns right edge to parent right', () => {
      // Parent right: 100 + 400 = 500 absolute
      // Child width 100, so right at 500, left = 400 absolute
      // In relative to parent: 400 - 100 = 300
      const results = alignViews(['child'], 'right', getView, getParentId);

      expect(results).toHaveLength(1);
      expect(results[0].newOrigin.x).toBe(300);
    });

    it('aligns top edge to parent top (y=0 relative)', () => {
      const results = alignViews(['child'], 'top', getView, getParentId);

      expect(results).toHaveLength(1);
      expect(results[0].newOrigin.y).toBe(0);
      expect(results[0].newOrigin.x).toBe(20); // X unchanged
    });

    it('aligns middle to parent middle', () => {
      // Parent (container) middle: 50 + 150 = 200 absolute
      // Child height 50, so middle at 200, top = 175 absolute
      // In relative to parent: 175 - 50 = 125
      const results = alignViews(['child'], 'middle', getView, getParentId);

      expect(results).toHaveLength(1);
      expect(results[0].newOrigin.y).toBe(125);
    });

    it('aligns bottom edge to parent bottom', () => {
      // Parent bottom: 50 + 300 = 350 absolute
      // Child height 50, so bottom at 350, top = 300 absolute
      // In relative to parent: 300 - 50 = 250
      const results = alignViews(['child'], 'bottom', getView, getParentId);

      expect(results).toHaveLength(1);
      expect(results[0].newOrigin.y).toBe(250);
    });

    it('returns empty array for root view (no parent)', () => {
      const results = alignViews(['root'], 'left', getView, getParentId);
      expect(results).toHaveLength(0);
    });

    it('returns empty array if already at target position', () => {
      // Modify child to be at top-left of parent
      const viewsAtCorner: Record<string, RenderableView> = {
        ...views,
        child: createMockRenderableView({
          id: 'child',
          absoluteX: 100,
          absoluteY: 50,
          relativeX: 0,
          relativeY: 0,
          width: 100,
          height: 50,
          parentId: 'container',
        }),
      };

      const getViewAtCorner = (id: string) => viewsAtCorner[id] ?? null;

      const results = alignViews(['child'], 'left', getViewAtCorner, getParentId);
      expect(results).toHaveLength(0);
    });
  });
});
