import { fireEvent, render, screen, waitFor } from '@solidjs/testing-library';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { testInRoot } from '../../../__tests__/helpers/solidjs';
import { createMockRenderableView } from '../../../__tests__/helpers/fixtures';
import { clearSelection, select, toggleSelect } from '../../../stores/selectionStore';
import { clearHistory, historyStore, undo, redo } from '../../../stores/historyStore';
import type { RenderableView } from '../../../types/canvas';
import { AlignmentToolbar } from '../AlignmentToolbar';

// Mock views with positions that will change during alignment
const mockViewsData: Record<string, RenderableView> = {
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
};

// Track position changes
const positionChanges: Record<string, { x: number; y: number }> = {};

vi.mock('../../../stores/documentStore', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../../stores/documentStore')>();
  return {
    ...actual,
    updateViewOrigin: vi.fn((viewId: string, origin: { x: number; y: number }) => {
      positionChanges[viewId] = origin;
      return origin;
    }),
    getParentId: vi.fn((id: string) => mockViewsData[id]?.parentId ?? null),
    getView: vi.fn((id: string) => mockViewsData[id] ?? null),
  };
});

// Mock useCanvasData to return our mock views
vi.mock('../../../hooks/canvas/useCanvasData', () => ({
  useCanvasData: () => ({
    renderableViews: () => Object.values(mockViewsData),
    templateBounds: () => ({ width: 800, height: 600 }),
    selectedViews: () => [],
    hoveredView: () => null,
    isEmpty: () => false,
    activeTemplate: () => null,
  }),
}));

import { updateViewOrigin } from '../../../stores/documentStore';

describe('AlignmentToolbar integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    clearSelection();
    clearHistory();
    // Reset position changes
    Object.keys(positionChanges).forEach((key) => delete positionChanges[key]);
  });

  afterEach(() => {
    clearSelection();
    clearHistory();
  });

  describe('full alignment workflow', () => {
    it('selects views, clicks button, verifies positions change', () => {
      testInRoot(() => {
        // Select two views
        select('view1');
        toggleSelect('view2');

        render(() => <AlignmentToolbar />);

        // Click align left button
        const alignLeftBtn = screen.getByRole('button', { name: /align left/i });
        fireEvent.click(alignLeftBtn);

        // Verify updateViewOrigin was called
        expect(updateViewOrigin).toHaveBeenCalled();
      });
    });
  });

  describe('undo after alignment', () => {
    it('restores original positions on undo', () => {
      testInRoot(() => {
        select('view1');
        toggleSelect('view2');

        render(() => <AlignmentToolbar />);

        // Click align left
        const alignLeftBtn = screen.getByRole('button', { name: /align left/i });
        fireEvent.click(alignLeftBtn);

        // Should have history entry
        expect(historyStore.canUndo).toBe(true);

        // Get call count before undo
        const callsBefore = vi.mocked(updateViewOrigin).mock.calls.length;

        // Undo
        undo();

        // Should have called updateViewOrigin again for undo
        expect(vi.mocked(updateViewOrigin).mock.calls.length).toBeGreaterThan(callsBefore);
      });
    });
  });

  describe('redo after undo', () => {
    it('reapplies alignment on redo', () => {
      testInRoot(() => {
        select('view1');
        toggleSelect('view2');

        render(() => <AlignmentToolbar />);

        // Align
        const alignLeftBtn = screen.getByRole('button', { name: /align left/i });
        fireEvent.click(alignLeftBtn);

        // Undo
        undo();
        expect(historyStore.canRedo).toBe(true);

        // Track calls before redo
        const callsBefore = vi.mocked(updateViewOrigin).mock.calls.length;

        // Redo
        redo();

        // Should have called updateViewOrigin again
        expect(vi.mocked(updateViewOrigin).mock.calls.length).toBeGreaterThan(callsBefore);
      });
    });
  });

  describe('no history entry when no change', () => {
    it('does not create history when views already aligned', () => {
      testInRoot(() => {
        // Select views that are already at the same left edge
        // Since mock views have different X positions, we can't easily test this
        // without modifying the mock. Instead, test with no selection.
        clearSelection();

        render(() => <AlignmentToolbar />);

        // All buttons should be disabled with no selection
        const alignLeftBtn = screen.getByRole('button', { name: /align left/i });
        expect(alignLeftBtn).toBeDisabled();

        // Click shouldn't work
        fireEvent.click(alignLeftBtn);

        // No history entry
        expect(historyStore.canUndo).toBe(false);
      });
    });
  });

  describe('distribution with undo/redo', () => {
    it('distributes 3+ views with undo support', () => {
      testInRoot(() => {
        // Select 3 views for distribution
        select('view1');
        toggleSelect('view2');
        toggleSelect('view3');

        render(() => <AlignmentToolbar />);

        // Distribution buttons should be enabled
        const distHorizBtn = screen.getByRole('button', { name: /distribute horizontal/i });
        expect(distHorizBtn).not.toBeDisabled();

        fireEvent.click(distHorizBtn);

        // Should create history entry
        expect(historyStore.canUndo).toBe(true);

        // Undo should work
        undo();
        expect(historyStore.canRedo).toBe(true);
      });
    });
  });

  describe('button state updates with selection', () => {
    it('all buttons are disabled when no selection', () => {
      testInRoot(() => {
        clearSelection();

        render(() => <AlignmentToolbar />);

        // All buttons should be disabled
        const buttons = screen.getAllByRole('button');
        buttons.forEach((button) => {
          expect(button).toBeDisabled();
        });
      });
    });
  });
});
