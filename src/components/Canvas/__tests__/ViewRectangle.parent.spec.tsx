/**
 * ViewRectangle Parent Highlighting Tests
 * Tests for parent highlight when child is selected (FR-012)
 */
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@solidjs/testing-library';
import { ViewRectangle } from '../ViewRectangle';
import { resetSelection, select } from '../../../stores/selectionStore';
import { testInRoot } from '../../../__tests__/helpers/solidjs';
import type { RenderableView } from '../../../types/canvas';

// Mock selectionStore with vi.hoisted pattern
const mockSelectionStore = vi.hoisted(() => ({
  selectedIds: new Set<string>(),
  hoveredId: null as string | null,
}));

const mockIsSelected = vi.hoisted(() => vi.fn());
const mockIsAncestorOfSelected = vi.hoisted(() => vi.fn());

vi.mock('../../../stores/selectionStore', async () => {
  const actual = await vi.importActual<typeof import('../../../stores/selectionStore')>(
    '../../../stores/selectionStore'
  );
  return {
    ...actual,
    selectionStore: mockSelectionStore,
    isSelected: mockIsSelected,
  };
});

vi.mock('../../../domain/canvas/ancestors', () => ({
  getAncestorIds: vi.fn(),
  isAncestorOfSelected: mockIsAncestorOfSelected,
}));

const createMockView = (overrides: Partial<RenderableView> = {}): RenderableView => ({
  id: 'test-view',
  absoluteX: 100,
  absoluteY: 50,
  relativeX: 100,
  relativeY: 50,
  width: 200,
  height: 100,
  className: 'CViewContainer',
  category: 'container',
  zIndex: 0,
  parentId: null,
  ...overrides,
});

describe('ViewRectangle Parent Highlighting (FR-012)', () => {
  beforeEach(() => {
    testInRoot(() => {
      resetSelection();
    });
    mockSelectionStore.selectedIds = new Set();
    mockSelectionStore.hoveredId = null;
    mockIsSelected.mockReset();
    mockIsSelected.mockReturnValue(false);
    mockIsAncestorOfSelected.mockReset();
    mockIsAncestorOfSelected.mockReturnValue(false);
  });

  describe('Given a parent view with a selected child', () => {
    it('should show parent highlight styling when child is selected', () => {
      const parentView = createMockView({
        id: 'parent-view',
        parentId: null,
      });

      // Parent is an ancestor of a selected child
      mockIsAncestorOfSelected.mockReturnValue(true);
      mockSelectionStore.selectedIds = new Set(['child-view']);

      render(() => <ViewRectangle view={parentView} allViews={[parentView]} />);

      const rect = screen.getByTestId('view-rect-parent-view');
      const classAttr = rect.getAttribute('class') ?? '';
      expect(classAttr).toMatch(/parentOfSelected/i);
    });
  });

  describe('Given a parent view with no selected children', () => {
    it('should not show parent highlight styling', () => {
      const parentView = createMockView({
        id: 'parent-view',
        parentId: null,
      });

      mockIsAncestorOfSelected.mockReturnValue(false);
      mockSelectionStore.selectedIds = new Set();

      render(() => <ViewRectangle view={parentView} allViews={[parentView]} />);

      const rect = screen.getByTestId('view-rect-parent-view');
      const classAttr = rect.getAttribute('class') ?? '';
      expect(classAttr).not.toMatch(/parentOfSelected/i);
    });
  });

  describe('Given a deeply nested hierarchy', () => {
    it('should highlight root ancestor view when deepest child is selected', () => {
      const rootView = createMockView({ id: 'root', parentId: null });
      const allViews = [rootView];

      // When leaf is selected, root is an ancestor
      mockSelectionStore.selectedIds = new Set(['leaf']);
      mockIsAncestorOfSelected.mockReturnValue(true);

      render(() => <ViewRectangle view={rootView} allViews={allViews} />);

      const rootClassAttr = screen.getByTestId('view-rect-root').getAttribute('class') ?? '';
      expect(rootClassAttr).toMatch(/parentOfSelected/i);
    });

    it('should highlight middle ancestor view when deepest child is selected', () => {
      const middleView = createMockView({ id: 'middle', parentId: 'root' });
      const allViews = [middleView];

      // When leaf is selected, middle is an ancestor
      mockSelectionStore.selectedIds = new Set(['leaf']);
      mockIsAncestorOfSelected.mockReturnValue(true);

      render(() => <ViewRectangle view={middleView} allViews={allViews} />);

      const middleClassAttr = screen.getByTestId('view-rect-middle').getAttribute('class') ?? '';
      expect(middleClassAttr).toMatch(/parentOfSelected/i);
    });
  });

  describe('Given a view that is selected', () => {
    it('should show selection styling instead of parent highlight', () => {
      const view = createMockView({
        id: 'selected-view',
        parentId: null,
      });

      // View is selected itself
      mockSelectionStore.selectedIds = new Set(['selected-view']);
      mockIsSelected.mockReturnValue(true);
      // Even if isAncestorOfSelected returns true, selection takes precedence
      mockIsAncestorOfSelected.mockReturnValue(false);

      render(() => <ViewRectangle view={view} allViews={[view]} />);

      const rect = screen.getByTestId('view-rect-selected-view');
      const classAttr = rect.getAttribute('class') ?? '';
      expect(classAttr).toMatch(/selected/i);
      expect(classAttr).not.toMatch(/parentOfSelected/i);
    });
  });

  describe('Given multiple selected children', () => {
    it('should highlight parent when any child is selected', () => {
      const parentView = createMockView({
        id: 'parent-view',
        parentId: null,
      });

      // Parent is ancestor of multiple selected children
      mockIsAncestorOfSelected.mockReturnValue(true);
      mockSelectionStore.selectedIds = new Set(['child-1', 'child-2']);

      render(() => <ViewRectangle view={parentView} allViews={[parentView]} />);

      const rect = screen.getByTestId('view-rect-parent-view');
      const classAttr = rect.getAttribute('class') ?? '';
      expect(classAttr).toMatch(/parentOfSelected/i);
    });
  });
});
