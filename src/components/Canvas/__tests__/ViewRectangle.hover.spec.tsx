/**
 * ViewRectangle Hover Styling Tests
 * Tests for hover state visual feedback (FR-010)
 */
import { beforeEach, describe, expect, it } from 'vitest';
import { fireEvent, render, screen } from '@solidjs/testing-library';
import { ViewRectangle } from '../ViewRectangle';
import { resetSelection, select, setHovered, selectionStore } from '../../../stores/selectionStore';
import { testInRoot } from '../../../__tests__/helpers/solidjs';
import type { RenderableView } from '../../../types/canvas';

const createMockView = (overrides: Partial<RenderableView> = {}): RenderableView => ({
  id: 'test-view',
  absoluteX: 100,
  absoluteY: 50,
  width: 200,
  height: 100,
  className: 'CTextButton',
  category: 'control',
  zIndex: 0,
  parentId: null,
  ...overrides,
});

describe('ViewRectangle Hover Styling (FR-010)', () => {
  beforeEach(() => {
    testInRoot(() => {
      resetSelection();
    });
  });

  describe('Given a view is being hovered', () => {
    it('should show hover highlight when hoveredId matches view id', () => {
      const view = createMockView({ id: 'hover-test' });

      testInRoot(() => {
        setHovered('hover-test');
      });

      render(() => (
        <svg>
          <ViewRectangle view={view} />
        </svg>
      ));

      const rect = screen.getByTestId('view-rect-hover-test');
      const classAttr = rect.getAttribute('class') || '';

      expect(classAttr).toMatch(/hovered/i);
    });

    it('should not show hover highlight when hoveredId is different', () => {
      const view = createMockView({ id: 'view-1' });

      testInRoot(() => {
        setHovered('view-2');
      });

      render(() => (
        <svg>
          <ViewRectangle view={view} />
        </svg>
      ));

      const rect = screen.getByTestId('view-rect-view-1');
      const classAttr = rect.getAttribute('class') || '';

      expect(classAttr).not.toMatch(/hovered/i);
    });

    it('should not show hover highlight when hoveredId is null', () => {
      const view = createMockView({ id: 'view-1' });

      testInRoot(() => {
        setHovered(null);
      });

      render(() => (
        <svg>
          <ViewRectangle view={view} />
        </svg>
      ));

      const rect = screen.getByTestId('view-rect-view-1');
      const classAttr = rect.getAttribute('class') || '';

      expect(classAttr).not.toMatch(/hovered/i);
    });
  });

  describe('Given mouse enter/leave events', () => {
    it('should trigger hover on mouse enter', () => {
      const view = createMockView({ id: 'hover-enter-test' });

      render(() => (
        <svg>
          <ViewRectangle view={view} />
        </svg>
      ));

      const rect = screen.getByTestId('view-rect-hover-enter-test');
      fireEvent.mouseEnter(rect);

      testInRoot(() => {
        expect(selectionStore.hoveredId).toBe('hover-enter-test');
      });
    });

    it('should clear hover on mouse leave', () => {
      const view = createMockView({ id: 'hover-leave-test' });

      testInRoot(() => {
        setHovered('hover-leave-test');
      });

      render(() => (
        <svg>
          <ViewRectangle view={view} />
        </svg>
      ));

      const rect = screen.getByTestId('view-rect-hover-leave-test');
      fireEvent.mouseLeave(rect);

      testInRoot(() => {
        expect(selectionStore.hoveredId).toBeNull();
      });
    });
  });

  describe('Given hover state with selection (US4-4)', () => {
    it('should show selection styling when both selected and hovered', () => {
      const view = createMockView({ id: 'both-test' });

      // Set both selection and hover
      testInRoot(() => {
        select('both-test');
        setHovered('both-test');
      });

      render(() => (
        <svg>
          <ViewRectangle view={view} />
        </svg>
      ));

      const rect = screen.getByTestId('view-rect-both-test');
      const classAttr = rect.getAttribute('class') || '';

      // Should have selected class (selection takes precedence)
      expect(classAttr).toMatch(/selected/i);
    });
  });
});
