import { describe, expect, it } from 'vitest';
import type { RenderableView } from '../../../types/canvas';
import {
  findIntersectingViews,
  isMinimumSize,
  MIN_MARQUEE_SIZE,
  normalizeRect,
  rectIntersect,
} from '../marquee';

describe('normalizeRect', () => {
  describe('Given drag in different directions', () => {
    it('should normalize drag down-right (standard)', () => {
      const result = normalizeRect({ x: 10, y: 10 }, { x: 50, y: 50 });
      expect(result).toEqual({ x: 10, y: 10, width: 40, height: 40 });
    });

    it('should normalize drag up-left (reversed)', () => {
      const result = normalizeRect({ x: 50, y: 50 }, { x: 10, y: 10 });
      expect(result).toEqual({ x: 10, y: 10, width: 40, height: 40 });
    });

    it('should normalize drag up-right', () => {
      const result = normalizeRect({ x: 10, y: 50 }, { x: 50, y: 10 });
      expect(result).toEqual({ x: 10, y: 10, width: 40, height: 40 });
    });

    it('should normalize drag down-left', () => {
      const result = normalizeRect({ x: 50, y: 10 }, { x: 10, y: 50 });
      expect(result).toEqual({ x: 10, y: 10, width: 40, height: 40 });
    });
  });

  describe('Given edge cases', () => {
    it('should handle zero size (same point)', () => {
      const result = normalizeRect({ x: 10, y: 10 }, { x: 10, y: 10 });
      expect(result).toEqual({ x: 10, y: 10, width: 0, height: 0 });
    });

    it('should handle horizontal line (zero height)', () => {
      const result = normalizeRect({ x: 10, y: 20 }, { x: 50, y: 20 });
      expect(result).toEqual({ x: 10, y: 20, width: 40, height: 0 });
    });

    it('should handle vertical line (zero width)', () => {
      const result = normalizeRect({ x: 20, y: 10 }, { x: 20, y: 50 });
      expect(result).toEqual({ x: 20, y: 10, width: 0, height: 40 });
    });

    it('should handle negative coordinates', () => {
      const result = normalizeRect({ x: -20, y: -30 }, { x: 10, y: 10 });
      expect(result).toEqual({ x: -20, y: -30, width: 30, height: 40 });
    });

    it('should handle large coordinates', () => {
      const result = normalizeRect({ x: 0, y: 0 }, { x: 10000, y: 5000 });
      expect(result).toEqual({ x: 0, y: 0, width: 10000, height: 5000 });
    });
  });
});

describe('isMinimumSize', () => {
  describe('Given MIN_MARQUEE_SIZE constant', () => {
    it('should be 5 pixels', () => {
      expect(MIN_MARQUEE_SIZE).toBe(5);
    });
  });

  describe('Given size below threshold', () => {
    it('should return false for 4x4', () => {
      const result = isMinimumSize({ x: 0, y: 0 }, { x: 4, y: 4 });
      expect(result).toBe(false);
    });

    it('should return false for 0x0 (same point)', () => {
      const result = isMinimumSize({ x: 10, y: 10 }, { x: 10, y: 10 });
      expect(result).toBe(false);
    });

    it('should return false for 10x3 (height too small)', () => {
      const result = isMinimumSize({ x: 0, y: 0 }, { x: 10, y: 3 });
      expect(result).toBe(false);
    });

    it('should return false for 3x10 (width too small)', () => {
      const result = isMinimumSize({ x: 0, y: 0 }, { x: 3, y: 10 });
      expect(result).toBe(false);
    });
  });

  describe('Given size at threshold', () => {
    it('should return true for exactly 5x5', () => {
      const result = isMinimumSize({ x: 0, y: 0 }, { x: 5, y: 5 });
      expect(result).toBe(true);
    });
  });

  describe('Given size above threshold', () => {
    it('should return true for 10x10', () => {
      const result = isMinimumSize({ x: 0, y: 0 }, { x: 10, y: 10 });
      expect(result).toBe(true);
    });

    it('should return true for large area', () => {
      const result = isMinimumSize({ x: 0, y: 0 }, { x: 100, y: 200 });
      expect(result).toBe(true);
    });
  });

  describe('Given reversed drag direction', () => {
    it('should work for up-left drag', () => {
      const result = isMinimumSize({ x: 50, y: 50 }, { x: 45, y: 45 });
      expect(result).toBe(true);
    });

    it('should work for mixed direction drag', () => {
      const result = isMinimumSize({ x: 50, y: 10 }, { x: 45, y: 20 });
      expect(result).toBe(true);
    });
  });
});

describe('rectIntersect', () => {
  describe('Given overlapping rectangles', () => {
    it('should return true for full overlap (a contains b)', () => {
      const a = { x: 0, y: 0, width: 100, height: 100 };
      const b = { x: 20, y: 20, width: 30, height: 30 };
      expect(rectIntersect(a, b)).toBe(true);
    });

    it('should return true for full overlap (b contains a)', () => {
      const a = { x: 20, y: 20, width: 30, height: 30 };
      const b = { x: 0, y: 0, width: 100, height: 100 };
      expect(rectIntersect(a, b)).toBe(true);
    });

    it('should return true for partial overlap (corner intersection)', () => {
      const a = { x: 0, y: 0, width: 50, height: 50 };
      const b = { x: 30, y: 30, width: 50, height: 50 };
      expect(rectIntersect(a, b)).toBe(true);
    });

    it('should return true for horizontal overlap', () => {
      const a = { x: 0, y: 0, width: 60, height: 30 };
      const b = { x: 40, y: 0, width: 60, height: 30 };
      expect(rectIntersect(a, b)).toBe(true);
    });

    it('should return true for vertical overlap', () => {
      const a = { x: 0, y: 0, width: 30, height: 60 };
      const b = { x: 0, y: 40, width: 30, height: 60 };
      expect(rectIntersect(a, b)).toBe(true);
    });
  });

  describe('Given edge-touching rectangles', () => {
    it('should return true when a.right === b.left (touching edges)', () => {
      const a = { x: 0, y: 0, width: 50, height: 50 };
      const b = { x: 50, y: 0, width: 50, height: 50 };
      expect(rectIntersect(a, b)).toBe(true);
    });

    it('should return true when a.bottom === b.top (touching edges)', () => {
      const a = { x: 0, y: 0, width: 50, height: 50 };
      const b = { x: 0, y: 50, width: 50, height: 50 };
      expect(rectIntersect(a, b)).toBe(true);
    });

    it('should return true when corners touch (single point)', () => {
      const a = { x: 0, y: 0, width: 50, height: 50 };
      const b = { x: 50, y: 50, width: 50, height: 50 };
      expect(rectIntersect(a, b)).toBe(true);
    });
  });

  describe('Given non-overlapping rectangles', () => {
    it('should return false when separated horizontally', () => {
      const a = { x: 0, y: 0, width: 30, height: 30 };
      const b = { x: 50, y: 0, width: 30, height: 30 };
      expect(rectIntersect(a, b)).toBe(false);
    });

    it('should return false when separated vertically', () => {
      const a = { x: 0, y: 0, width: 30, height: 30 };
      const b = { x: 0, y: 50, width: 30, height: 30 };
      expect(rectIntersect(a, b)).toBe(false);
    });

    it('should return false when diagonally separated', () => {
      const a = { x: 0, y: 0, width: 30, height: 30 };
      const b = { x: 50, y: 50, width: 30, height: 30 };
      expect(rectIntersect(a, b)).toBe(false);
    });
  });

  describe('Given zero-size rectangles', () => {
    it('should return false for 0x0 rect (no area)', () => {
      const a = { x: 0, y: 0, width: 0, height: 0 };
      const b = { x: 0, y: 0, width: 50, height: 50 };
      expect(rectIntersect(a, b)).toBe(false);
    });

    it('should return false for zero-width rect', () => {
      const a = { x: 25, y: 0, width: 0, height: 50 };
      const b = { x: 0, y: 0, width: 50, height: 50 };
      expect(rectIntersect(a, b)).toBe(false);
    });

    it('should return false for zero-height rect', () => {
      const a = { x: 0, y: 25, width: 50, height: 0 };
      const b = { x: 0, y: 0, width: 50, height: 50 };
      expect(rectIntersect(a, b)).toBe(false);
    });
  });
});

describe('findIntersectingViews', () => {
  const createView = (
    id: string,
    x: number,
    y: number,
    width: number,
    height: number,
    parentId: string | null = 'root'
  ): RenderableView => ({
    id,
    absoluteX: x,
    absoluteY: y,
    relativeX: x,
    relativeY: y,
    width,
    height,
    className: 'CView',
    category: 'display',
    zIndex: 0,
    parentId,
  });

  const views: RenderableView[] = [
    createView('view-1', 0, 0, 50, 50),
    createView('view-2', 100, 0, 50, 50),
    createView('view-3', 0, 100, 50, 50),
    createView('view-4', 100, 100, 50, 50),
    createView('view-5', 200, 200, 50, 50),
  ];

  describe('Given marquee with no intersections', () => {
    it('should return empty array when marquee misses all views', () => {
      const marquee = { x: 300, y: 300, width: 50, height: 50 };
      const result = findIntersectingViews(marquee, views);
      expect(result).toEqual([]);
    });

    it('should return empty array for empty views list', () => {
      const marquee = { x: 0, y: 0, width: 100, height: 100 };
      const result = findIntersectingViews(marquee, []);
      expect(result).toEqual([]);
    });

    it('should return empty array for zero-size marquee', () => {
      const marquee = { x: 25, y: 25, width: 0, height: 0 };
      const result = findIntersectingViews(marquee, views);
      expect(result).toEqual([]);
    });
  });

  describe('Given marquee intersecting some views', () => {
    it('should return single view ID when marquee hits one view', () => {
      const marquee = { x: 10, y: 10, width: 30, height: 30 };
      const result = findIntersectingViews(marquee, views);
      expect(result).toEqual(['view-1']);
    });

    it('should return multiple IDs when marquee hits multiple views', () => {
      const marquee = { x: 25, y: 0, width: 100, height: 50 };
      const result = findIntersectingViews(marquee, views);
      expect(result).toContain('view-1');
      expect(result).toContain('view-2');
      expect(result).toHaveLength(2);
    });

    it('should handle partial intersection (corner overlap)', () => {
      const marquee = { x: 40, y: 40, width: 30, height: 30 };
      const result = findIntersectingViews(marquee, views);
      expect(result).toContain('view-1');
    });
  });

  describe('Given marquee covering all views', () => {
    it('should return all view IDs', () => {
      const marquee = { x: 0, y: 0, width: 300, height: 300 };
      const result = findIntersectingViews(marquee, views);
      expect(result).toHaveLength(5);
      expect(result).toContain('view-1');
      expect(result).toContain('view-2');
      expect(result).toContain('view-3');
      expect(result).toContain('view-4');
      expect(result).toContain('view-5');
    });
  });

  describe('Given nested views (parent and child)', () => {
    it('should return both parent and child when both intersect', () => {
      const nestedViews: RenderableView[] = [
        createView('parent', 0, 0, 100, 100, 'root'),
        createView('child', 20, 20, 30, 30, 'parent'),
      ];
      const marquee = { x: 10, y: 10, width: 50, height: 50 };
      const result = findIntersectingViews(marquee, nestedViews);
      expect(result).toContain('parent');
      expect(result).toContain('child');
      expect(result).toHaveLength(2);
    });
  });

  describe('Given root template (parentId === null)', () => {
    it('should exclude root template from selection', () => {
      const viewsWithRoot: RenderableView[] = [
        createView('root-template', 0, 0, 500, 500, null),
        createView('child-1', 10, 10, 50, 50, 'root-template'),
        createView('child-2', 100, 100, 50, 50, 'root-template'),
      ];
      const marquee = { x: 0, y: 0, width: 200, height: 200 };
      const result = findIntersectingViews(marquee, viewsWithRoot);
      expect(result).not.toContain('root-template');
      expect(result).toContain('child-1');
      expect(result).toContain('child-2');
      expect(result).toHaveLength(2);
    });

    it('should return empty array when only root intersects', () => {
      const viewsWithRoot: RenderableView[] = [
        createView('root-template', 0, 0, 500, 500, null),
        createView('child-1', 400, 400, 50, 50, 'root-template'),
      ];
      const marquee = { x: 10, y: 10, width: 50, height: 50 };
      const result = findIntersectingViews(marquee, viewsWithRoot);
      expect(result).toEqual([]);
    });
  });
});
