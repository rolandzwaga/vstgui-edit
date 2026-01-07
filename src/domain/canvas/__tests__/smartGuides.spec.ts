import { describe, expect, test } from 'vitest';
import type { RenderableView } from '../../../types/canvas';
import type { SmartGuide, SpacingGuide, ViewBounds } from '../../../types/smartGuides';
import { isSpacingGuide } from '../../../types/smartGuides';
import {
  calculateSmartGuides,
  createGuide,
  findCenterAlignments,
  findEdgeAlignments,
  findParentCenterGuides,
  findSpacingGuides,
  GUIDE_THRESHOLD,
  getViewBounds,
  isWithinThreshold,
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
      relativeX: 100,
      relativeY: 50,
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

describe('findEdgeAlignments', () => {
  const createBounds = (overrides: Partial<ViewBounds> = {}): ViewBounds => ({
    id: 'test-view',
    left: 100,
    right: 200,
    top: 50,
    bottom: 150,
    centerX: 150,
    centerY: 100,
    ...overrides,
  });

  test('returns empty array when no siblings', () => {
    const dragged = createBounds({ id: 'dragged' });
    const guides = findEdgeAlignments(dragged, []);
    expect(guides).toEqual([]);
  });

  test('finds left edge alignment with sibling left edge', () => {
    const dragged = createBounds({ id: 'dragged', left: 100 });
    const sibling = createBounds({ id: 'sibling', left: 100, top: 200 });
    const guides = findEdgeAlignments(dragged, [sibling]);
    const leftGuides = guides.filter(g => g.position === 100 && g.orientation === 'vertical');
    expect(leftGuides.length).toBeGreaterThan(0);
    expect(leftGuides[0].type).toBe('edge');
  });

  test('finds left edge alignment with sibling right edge', () => {
    const dragged = createBounds({ id: 'dragged', left: 200 });
    const sibling = createBounds({ id: 'sibling', right: 200, left: 100 });
    const guides = findEdgeAlignments(dragged, [sibling]);
    const matching = guides.filter(g => g.position === 200 && g.orientation === 'vertical');
    expect(matching.length).toBeGreaterThan(0);
  });

  test('finds right edge alignment with sibling right edge', () => {
    const dragged = createBounds({ id: 'dragged', right: 300 });
    const sibling = createBounds({ id: 'sibling', right: 300 });
    const guides = findEdgeAlignments(dragged, [sibling]);
    const matching = guides.filter(g => g.position === 300 && g.orientation === 'vertical');
    expect(matching.length).toBeGreaterThan(0);
  });

  test('finds right edge alignment with sibling left edge', () => {
    const dragged = createBounds({ id: 'dragged', right: 100 });
    const sibling = createBounds({ id: 'sibling', left: 100 });
    const guides = findEdgeAlignments(dragged, [sibling]);
    const matching = guides.filter(g => g.position === 100 && g.orientation === 'vertical');
    expect(matching.length).toBeGreaterThan(0);
  });

  test('finds top edge alignment with sibling top edge', () => {
    const dragged = createBounds({ id: 'dragged', top: 50 });
    const sibling = createBounds({ id: 'sibling', top: 50, left: 300 });
    const guides = findEdgeAlignments(dragged, [sibling]);
    const matching = guides.filter(g => g.position === 50 && g.orientation === 'horizontal');
    expect(matching.length).toBeGreaterThan(0);
  });

  test('finds top edge alignment with sibling bottom edge', () => {
    const dragged = createBounds({ id: 'dragged', top: 150 });
    const sibling = createBounds({ id: 'sibling', bottom: 150 });
    const guides = findEdgeAlignments(dragged, [sibling]);
    const matching = guides.filter(g => g.position === 150 && g.orientation === 'horizontal');
    expect(matching.length).toBeGreaterThan(0);
  });

  test('finds bottom edge alignment with sibling bottom edge', () => {
    const dragged = createBounds({ id: 'dragged', bottom: 200 });
    const sibling = createBounds({ id: 'sibling', bottom: 200, top: 100 });
    const guides = findEdgeAlignments(dragged, [sibling]);
    const matching = guides.filter(g => g.position === 200 && g.orientation === 'horizontal');
    expect(matching.length).toBeGreaterThan(0);
  });

  test('finds bottom edge alignment with sibling top edge', () => {
    const dragged = createBounds({ id: 'dragged', bottom: 50 });
    const sibling = createBounds({ id: 'sibling', top: 50 });
    const guides = findEdgeAlignments(dragged, [sibling]);
    const matching = guides.filter(g => g.position === 50 && g.orientation === 'horizontal');
    expect(matching.length).toBeGreaterThan(0);
  });

  test('finds alignment within threshold (not exact)', () => {
    const dragged = createBounds({ id: 'dragged', left: 102 });
    const sibling = createBounds({ id: 'sibling', left: 100 });
    const guides = findEdgeAlignments(dragged, [sibling]);
    expect(guides.length).toBeGreaterThan(0);
  });

  test('does not find alignment beyond threshold', () => {
    const dragged = createBounds({ id: 'dragged', left: 110 });
    const sibling = createBounds({ id: 'sibling', left: 100 });
    const guides = findEdgeAlignments(dragged, [sibling]);
    const leftGuides = guides.filter(g => g.position === 100);
    expect(leftGuides.length).toBe(0);
  });

  test('includes both view IDs in participatingViewIds', () => {
    const dragged = createBounds({ id: 'dragged', left: 100 });
    const sibling = createBounds({ id: 'sibling', left: 100 });
    const guides = findEdgeAlignments(dragged, [sibling]);
    expect(guides[0].participatingViewIds).toContain('dragged');
    expect(guides[0].participatingViewIds).toContain('sibling');
  });

  test('finds alignments with multiple siblings', () => {
    const dragged = createBounds({ id: 'dragged', left: 100, top: 200 });
    const sibling1 = createBounds({ id: 'sibling1', left: 100 });
    const sibling2 = createBounds({ id: 'sibling2', top: 200, left: 300 });
    const guides = findEdgeAlignments(dragged, [sibling1, sibling2]);
    expect(guides.length).toBeGreaterThan(0);
  });
});

describe('findCenterAlignments', () => {
  const createBounds = (overrides: Partial<ViewBounds> = {}): ViewBounds => ({
    id: 'test-view',
    left: 100,
    right: 200,
    top: 50,
    bottom: 150,
    centerX: 150,
    centerY: 100,
    ...overrides,
  });

  test('returns empty array when no siblings', () => {
    const dragged = createBounds({ id: 'dragged' });
    const guides = findCenterAlignments(dragged, []);
    expect(guides).toEqual([]);
  });

  test('finds centerX alignment', () => {
    const dragged = createBounds({ id: 'dragged', centerX: 150 });
    const sibling = createBounds({ id: 'sibling', centerX: 150, top: 200 });
    const guides = findCenterAlignments(dragged, [sibling]);
    const matching = guides.filter(g => g.position === 150 && g.orientation === 'vertical');
    expect(matching.length).toBeGreaterThan(0);
    expect(matching[0].type).toBe('center');
  });

  test('finds centerY alignment', () => {
    const dragged = createBounds({ id: 'dragged', centerY: 100 });
    const sibling = createBounds({ id: 'sibling', centerY: 100, left: 300 });
    const guides = findCenterAlignments(dragged, [sibling]);
    const matching = guides.filter(g => g.position === 100 && g.orientation === 'horizontal');
    expect(matching.length).toBeGreaterThan(0);
    expect(matching[0].type).toBe('center');
  });

  test('finds center alignment within threshold', () => {
    const dragged = createBounds({ id: 'dragged', centerX: 152 });
    const sibling = createBounds({ id: 'sibling', centerX: 150 });
    const guides = findCenterAlignments(dragged, [sibling]);
    expect(guides.length).toBeGreaterThan(0);
  });

  test('does not find center alignment beyond threshold', () => {
    const dragged = createBounds({ id: 'dragged', centerX: 160 });
    const sibling = createBounds({ id: 'sibling', centerX: 150 });
    const guides = findCenterAlignments(dragged, [sibling]);
    const centerXGuides = guides.filter(g => g.position === 150);
    expect(centerXGuides.length).toBe(0);
  });

  test('includes both view IDs in participatingViewIds', () => {
    const dragged = createBounds({ id: 'dragged', centerX: 150 });
    const sibling = createBounds({ id: 'sibling', centerX: 150 });
    const guides = findCenterAlignments(dragged, [sibling]);
    expect(guides[0].participatingViewIds).toContain('dragged');
    expect(guides[0].participatingViewIds).toContain('sibling');
  });
});

describe('calculateSmartGuides', () => {
  const createBounds = (overrides: Partial<ViewBounds> = {}): ViewBounds => ({
    id: 'test-view',
    left: 100,
    right: 200,
    top: 50,
    bottom: 150,
    centerX: 150,
    centerY: 100,
    ...overrides,
  });

  test('returns empty array when no siblings', () => {
    const dragged = createBounds({ id: 'dragged' });
    const guides = calculateSmartGuides(dragged, []);
    expect(guides).toEqual([]);
  });

  test('combines edge and center alignments', () => {
    const dragged = createBounds({ id: 'dragged', left: 100, centerX: 200 });
    const sibling1 = createBounds({ id: 'sibling1', left: 100 });
    const sibling2 = createBounds({ id: 'sibling2', centerX: 200 });
    const guides = calculateSmartGuides(dragged, [sibling1, sibling2]);
    const hasEdge = guides.some(g => g.type === 'edge');
    const hasCenter = guides.some(g => g.type === 'center');
    expect(hasEdge).toBe(true);
    expect(hasCenter).toBe(true);
  });

  test('deduplicates guides at same position', () => {
    const dragged = createBounds({ id: 'dragged', left: 100 });
    const sibling1 = createBounds({ id: 'sibling1', left: 100 });
    const sibling2 = createBounds({ id: 'sibling2', left: 100 });
    const guides = calculateSmartGuides(dragged, [sibling1, sibling2]);
    const verticalAt100 = guides.filter(g => g.position === 100 && g.orientation === 'vertical');
    expect(verticalAt100.length).toBe(1);
  });

  test('returns guides for all matching siblings', () => {
    const dragged = createBounds({ id: 'dragged', left: 100, top: 50 });
    const sibling = createBounds({ id: 'sibling', left: 100, top: 50 });
    const guides = calculateSmartGuides(dragged, [sibling]);
    expect(guides.length).toBeGreaterThan(0);
  });

  test('does not include dragged view id in siblings check', () => {
    const dragged = createBounds({ id: 'dragged', left: 100 });
    const guides = calculateSmartGuides(dragged, [dragged]);
    expect(guides).toEqual([]);
  });
});

describe('findParentCenterGuides', () => {
  const createBounds = (overrides: Partial<ViewBounds> = {}): ViewBounds => ({
    id: 'test-view',
    left: 100,
    right: 200,
    top: 50,
    bottom: 150,
    centerX: 150,
    centerY: 100,
    ...overrides,
  });

  test('returns empty array when no parent provided', () => {
    const dragged = createBounds({ id: 'dragged' });
    const guides = findParentCenterGuides(dragged, undefined);
    expect(guides).toEqual([]);
  });

  test('returns empty array when parent is null', () => {
    const dragged = createBounds({ id: 'dragged' });
    const guides = findParentCenterGuides(dragged, null);
    expect(guides).toEqual([]);
  });

  test('finds vertical guide when centerX aligns with parent centerX', () => {
    const parent = createBounds({ id: 'parent', centerX: 200 });
    const dragged = createBounds({ id: 'dragged', centerX: 200 });
    const guides = findParentCenterGuides(dragged, parent);
    const vertical = guides.filter(g => g.orientation === 'vertical' && g.position === 200);
    expect(vertical.length).toBeGreaterThan(0);
    expect(vertical[0].type).toBe('parent-center');
  });

  test('finds horizontal guide when centerY aligns with parent centerY', () => {
    const parent = createBounds({ id: 'parent', centerY: 150 });
    const dragged = createBounds({ id: 'dragged', centerY: 150 });
    const guides = findParentCenterGuides(dragged, parent);
    const horizontal = guides.filter(g => g.orientation === 'horizontal' && g.position === 150);
    expect(horizontal.length).toBeGreaterThan(0);
    expect(horizontal[0].type).toBe('parent-center');
  });

  test('finds alignment within threshold', () => {
    const parent = createBounds({ id: 'parent', centerX: 200 });
    const dragged = createBounds({ id: 'dragged', centerX: 202 });
    const guides = findParentCenterGuides(dragged, parent);
    expect(guides.length).toBeGreaterThan(0);
  });

  test('does not find alignment beyond threshold', () => {
    const parent = createBounds({ id: 'parent', centerX: 200 });
    const dragged = createBounds({ id: 'dragged', centerX: 210 });
    const guides = findParentCenterGuides(dragged, parent);
    const centerXGuides = guides.filter(g => g.position === 200);
    expect(centerXGuides.length).toBe(0);
  });

  test('includes both dragged and parent IDs in participatingViewIds', () => {
    const parent = createBounds({ id: 'parent-view', centerX: 200 });
    const dragged = createBounds({ id: 'dragged-view', centerX: 200 });
    const guides = findParentCenterGuides(dragged, parent);
    expect(guides[0].participatingViewIds).toContain('dragged-view');
    expect(guides[0].participatingViewIds).toContain('parent-view');
  });

  test('finds both centerX and centerY alignments', () => {
    const parent = createBounds({ id: 'parent', centerX: 200, centerY: 150 });
    const dragged = createBounds({ id: 'dragged', centerX: 200, centerY: 150 });
    const guides = findParentCenterGuides(dragged, parent);
    const vertical = guides.filter(g => g.orientation === 'vertical');
    const horizontal = guides.filter(g => g.orientation === 'horizontal');
    expect(vertical.length).toBeGreaterThan(0);
    expect(horizontal.length).toBeGreaterThan(0);
  });
});

describe('findSpacingGuides', () => {
  const createBounds = (overrides: Partial<ViewBounds> = {}): ViewBounds => ({
    id: 'test-view',
    left: 100,
    right: 200,
    top: 50,
    bottom: 150,
    centerX: 150,
    centerY: 100,
    ...overrides,
  });

  test('returns empty array when fewer than 2 siblings', () => {
    const dragged = createBounds({ id: 'dragged' });
    const sibling = createBounds({ id: 'sibling', left: 300 });
    const guides = findSpacingGuides(dragged, [sibling]);
    expect(guides).toEqual([]);
  });

  test('returns empty array when no equal horizontal spacing', () => {
    const siblingA = createBounds({ id: 'a', left: 0, right: 50 });
    const siblingB = createBounds({ id: 'b', left: 200, right: 250 });
    const dragged = createBounds({ id: 'dragged', left: 80, right: 130 });
    const guides = findSpacingGuides(dragged, [siblingA, siblingB]);
    const spacingGuides = guides.filter(g => g.type === 'spacing');
    expect(spacingGuides.length).toBe(0);
  });

  test('finds horizontal equal spacing when view is centered between two siblings', () => {
    const siblingA = createBounds({ id: 'a', left: 0, right: 50, top: 50, bottom: 150 });
    const siblingB = createBounds({ id: 'b', left: 150, right: 200, top: 50, bottom: 150 });
    const dragged = createBounds({ id: 'dragged', left: 75, right: 125, top: 50, bottom: 150 });
    const guides = findSpacingGuides(dragged, [siblingA, siblingB]);
    const spacingGuides = guides.filter(g => isSpacingGuide(g));
    expect(spacingGuides.length).toBeGreaterThan(0);
    const spacing = spacingGuides[0] as SpacingGuide;
    expect(spacing.distance).toBe(25);
  });

  test('finds vertical equal spacing when view is centered between two siblings', () => {
    const siblingA = createBounds({ id: 'a', left: 50, right: 150, top: 0, bottom: 50 });
    const siblingB = createBounds({ id: 'b', left: 50, right: 150, top: 150, bottom: 200 });
    const dragged = createBounds({ id: 'dragged', left: 50, right: 150, top: 75, bottom: 125 });
    const guides = findSpacingGuides(dragged, [siblingA, siblingB]);
    const spacingGuides = guides.filter(g => isSpacingGuide(g));
    expect(spacingGuides.length).toBeGreaterThan(0);
    const spacing = spacingGuides[0] as SpacingGuide;
    expect(spacing.distance).toBe(25);
  });

  test('includes all three view IDs in participatingViewIds', () => {
    const siblingA = createBounds({ id: 'view-a', left: 0, right: 50, top: 50, bottom: 150 });
    const siblingB = createBounds({ id: 'view-b', left: 150, right: 200, top: 50, bottom: 150 });
    const dragged = createBounds({ id: 'dragged', left: 75, right: 125, top: 50, bottom: 150 });
    const guides = findSpacingGuides(dragged, [siblingA, siblingB]);
    const spacingGuides = guides.filter(g => isSpacingGuide(g));
    expect(spacingGuides[0].participatingViewIds).toContain('dragged');
    expect(spacingGuides[0].participatingViewIds).toContain('view-a');
    expect(spacingGuides[0].participatingViewIds).toContain('view-b');
  });

  test('finds spacing within threshold (not exact)', () => {
    const siblingA = createBounds({ id: 'a', left: 0, right: 50, top: 50, bottom: 150 });
    const siblingB = createBounds({ id: 'b', left: 150, right: 200, top: 50, bottom: 150 });
    const dragged = createBounds({ id: 'dragged', left: 77, right: 127, top: 50, bottom: 150 });
    const guides = findSpacingGuides(dragged, [siblingA, siblingB]);
    const spacingGuides = guides.filter(g => isSpacingGuide(g));
    expect(spacingGuides.length).toBeGreaterThan(0);
  });

  test('does not find spacing beyond threshold', () => {
    const siblingA = createBounds({ id: 'a', left: 0, right: 50, top: 50, bottom: 150 });
    const siblingB = createBounds({ id: 'b', left: 150, right: 200, top: 50, bottom: 150 });
    const dragged = createBounds({ id: 'dragged', left: 85, right: 135, top: 50, bottom: 150 });
    const guides = findSpacingGuides(dragged, [siblingA, siblingB]);
    const spacingGuides = guides.filter(g => isSpacingGuide(g));
    expect(spacingGuides.length).toBe(0);
  });

  test('spacing guide has correct measureStart and measureEnd', () => {
    const siblingA = createBounds({ id: 'a', left: 0, right: 50, top: 50, bottom: 150 });
    const siblingB = createBounds({ id: 'b', left: 150, right: 200, top: 50, bottom: 150 });
    const dragged = createBounds({ id: 'dragged', left: 75, right: 125, top: 50, bottom: 150 });
    const guides = findSpacingGuides(dragged, [siblingA, siblingB]);
    const spacingGuides = guides.filter(g => isSpacingGuide(g)) as SpacingGuide[];
    const horizontalSpacing = spacingGuides.find(g => g.orientation === 'horizontal');
    expect(horizontalSpacing).toBeDefined();
    expect(horizontalSpacing!.measureStart).toBe(50);
    expect(horizontalSpacing!.measureEnd).toBe(75);
  });

  test('spacing guide position is at the midpoint of the gap', () => {
    const siblingA = createBounds({ id: 'a', left: 0, right: 50, top: 50, bottom: 150 });
    const siblingB = createBounds({ id: 'b', left: 150, right: 200, top: 50, bottom: 150 });
    const dragged = createBounds({ id: 'dragged', left: 75, right: 125, top: 50, bottom: 150 });
    const guides = findSpacingGuides(dragged, [siblingA, siblingB]);
    const spacingGuides = guides.filter(g => isSpacingGuide(g)) as SpacingGuide[];
    const horizontalSpacing = spacingGuides.find(g => g.orientation === 'horizontal');
    expect(horizontalSpacing!.position).toBe(62.5);
  });

  test('only considers views in same horizontal band for vertical spacing', () => {
    const siblingA = createBounds({ id: 'a', left: 0, right: 100, top: 0, bottom: 50 });
    const siblingB = createBounds({ id: 'b', left: 200, right: 300, top: 150, bottom: 200 });
    const dragged = createBounds({ id: 'dragged', left: 50, right: 150, top: 75, bottom: 125 });
    const guides = findSpacingGuides(dragged, [siblingA, siblingB]);
    const verticalSpacing = guides.filter(g => isSpacingGuide(g) && g.orientation === 'vertical');
    expect(verticalSpacing.length).toBe(0);
  });
});
