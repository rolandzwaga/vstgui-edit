import { describe, expect, it } from 'vitest';
import { createMockRenderableView } from '../../../__tests__/helpers/fixtures';
import type { RenderableView } from '../../../types/canvas';
import {
  calculateParentBounds,
  calculateSelectionBounds,
  viewToBounds,
} from '../calculateBounds';

describe('viewToBounds', () => {
  it('converts a renderable view to view bounds', () => {
    const view = createMockRenderableView({
      id: 'test-view',
      absoluteX: 100,
      absoluteY: 50,
      width: 200,
      height: 100,
    });

    const bounds = viewToBounds(view);

    expect(bounds).toEqual({
      id: 'test-view',
      left: 100,
      right: 300,
      top: 50,
      bottom: 150,
      centerX: 200,
      centerY: 100,
      width: 200,
      height: 100,
    });
  });

  it('handles zero-size views', () => {
    const view = createMockRenderableView({
      id: 'zero-view',
      absoluteX: 10,
      absoluteY: 20,
      width: 0,
      height: 0,
    });

    const bounds = viewToBounds(view);

    expect(bounds.left).toBe(10);
    expect(bounds.right).toBe(10);
    expect(bounds.top).toBe(20);
    expect(bounds.bottom).toBe(20);
    expect(bounds.centerX).toBe(10);
    expect(bounds.centerY).toBe(20);
  });

  it('handles views at origin', () => {
    const view = createMockRenderableView({
      id: 'origin-view',
      absoluteX: 0,
      absoluteY: 0,
      width: 50,
      height: 50,
    });

    const bounds = viewToBounds(view);

    expect(bounds.left).toBe(0);
    expect(bounds.right).toBe(50);
    expect(bounds.top).toBe(0);
    expect(bounds.bottom).toBe(50);
    expect(bounds.centerX).toBe(25);
    expect(bounds.centerY).toBe(25);
  });
});

describe('calculateSelectionBounds', () => {
  const views: Record<string, RenderableView> = {
    view1: createMockRenderableView({
      id: 'view1',
      absoluteX: 10,
      absoluteY: 20,
      relativeX: 10,
      relativeY: 20,
      width: 100,
      height: 50,
    }),
    view2: createMockRenderableView({
      id: 'view2',
      absoluteX: 200,
      absoluteY: 100,
      relativeX: 200,
      relativeY: 100,
      width: 80,
      height: 60,
    }),
    view3: createMockRenderableView({
      id: 'view3',
      absoluteX: 50,
      absoluteY: 150,
      relativeX: 50,
      relativeY: 150,
      width: 120,
      height: 40,
    }),
  };

  const getView = (id: string): RenderableView | null => views[id] ?? null;

  it('calculates bounds for multiple views', () => {
    const bounds = calculateSelectionBounds(['view1', 'view2', 'view3'], getView);

    expect(bounds).not.toBeNull();
    expect(bounds?.left).toBe(10); // leftmost (view1)
    expect(bounds?.right).toBe(280); // rightmost (view2: 200 + 80)
    expect(bounds?.top).toBe(20); // topmost (view1)
    expect(bounds?.bottom).toBe(190); // bottommost (view3: 150 + 40)
    expect(bounds?.width).toBe(270);
    expect(bounds?.height).toBe(170);
  });

  it('calculates center correctly', () => {
    const bounds = calculateSelectionBounds(['view1', 'view2'], getView);

    expect(bounds).not.toBeNull();
    // left=10, right=280 -> centerX = 145
    expect(bounds?.centerX).toBe(145);
    // top=20, bottom=160 -> centerY = 90
    expect(bounds?.centerY).toBe(90);
  });

  it('returns bounds for single view', () => {
    const bounds = calculateSelectionBounds(['view1'], getView);

    expect(bounds).not.toBeNull();
    expect(bounds?.left).toBe(10);
    expect(bounds?.right).toBe(110);
    expect(bounds?.top).toBe(20);
    expect(bounds?.bottom).toBe(70);
    expect(bounds?.centerX).toBe(60);
    expect(bounds?.centerY).toBe(45);
  });

  it('returns null for empty selection', () => {
    const bounds = calculateSelectionBounds([], getView);

    expect(bounds).toBeNull();
  });

  it('returns null if no views found', () => {
    const bounds = calculateSelectionBounds(['nonexistent'], getView);

    expect(bounds).toBeNull();
  });

  it('filters out nonexistent views', () => {
    const bounds = calculateSelectionBounds(['view1', 'nonexistent', 'view2'], getView);

    expect(bounds).not.toBeNull();
    expect(bounds?.left).toBe(10);
    expect(bounds?.right).toBe(280);
  });
});

describe('calculateParentBounds', () => {
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

  it('returns parent bounds for a child view', () => {
    const bounds = calculateParentBounds('child', getParentId, getView);

    expect(bounds).not.toBeNull();
    expect(bounds?.id).toBe('container');
    expect(bounds?.left).toBe(100);
    expect(bounds?.right).toBe(500);
    expect(bounds?.top).toBe(50);
    expect(bounds?.bottom).toBe(350);
    expect(bounds?.width).toBe(400);
    expect(bounds?.height).toBe(300);
  });

  it('returns null for root view (no parent)', () => {
    const bounds = calculateParentBounds('root', getParentId, getView);

    expect(bounds).toBeNull();
  });

  it('returns null for nonexistent view', () => {
    const bounds = calculateParentBounds('nonexistent', getParentId, getView);

    expect(bounds).toBeNull();
  });

  it('returns null if parent not found', () => {
    const badGetParentId = (id: string): string | null => {
      if (id === 'child') return 'nonexistent-parent';
      return null;
    };

    const bounds = calculateParentBounds('child', badGetParentId, getView);

    expect(bounds).toBeNull();
  });

  it('calculates center of parent correctly', () => {
    const bounds = calculateParentBounds('child', getParentId, getView);

    expect(bounds).not.toBeNull();
    // container: left=100, width=400 -> centerX = 300
    expect(bounds?.centerX).toBe(300);
    // container: top=50, height=300 -> centerY = 200
    expect(bounds?.centerY).toBe(200);
  });
});
