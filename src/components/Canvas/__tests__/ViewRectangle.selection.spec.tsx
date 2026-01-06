/**
 * ViewRectangle Selection Styling Tests
 * Tests for visual styling when a view is selected (US1)
 */
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { cleanup, render, screen } from '@solidjs/testing-library';
import { ViewRectangle } from '../ViewRectangle';
import { resetSelection, select } from '../../../stores/selectionStore';
import type { RenderableView } from '../../../types/canvas';
import { testInRoot } from '../../../__tests__/helpers/solidjs';

const createMockView = (overrides: Partial<RenderableView> = {}): RenderableView => ({
  id: 'test-view',
  absoluteX: 50,
  absoluteY: 100,
  width: 200,
  height: 80,
  className: 'CTextButton',
  category: 'control',
  zIndex: 0,
  parentId: null,
  ...overrides,
});

describe('ViewRectangle Selection Styling', () => {
  beforeEach(() => {
    resetSelection();
  });

  afterEach(() => {
    cleanup();
  });

  describe('Given a view that is NOT selected', () => {
    it('should not have selected CSS class', () => {
      const view = createMockView();

      render(() => (
        <svg>
          <ViewRectangle view={view} />
        </svg>
      ));

      const group = screen.getByTestId('view-test-view');
      const rect = group.querySelector('rect');
      const classAttr = rect?.getAttribute('class') ?? '';

      expect(classAttr).not.toMatch(/selected/i);
    });

    it('should have default stroke styling', () => {
      const view = createMockView();

      render(() => (
        <svg>
          <ViewRectangle view={view} />
        </svg>
      ));

      const group = screen.getByTestId('view-test-view');
      const rect = group.querySelector('rect');
      const classAttr = rect?.getAttribute('class') ?? '';

      // Should have base styling, not selection styling
      expect(classAttr).toMatch(/control/i);
      expect(classAttr).not.toMatch(/selected/i);
    });
  });

  describe('Given a view that IS selected', () => {
    it('should have selected CSS class when selected', () => {
      testInRoot(() => {
        const view = createMockView({ id: 'selected-view' });

        // Select the view first
        select('selected-view');

        render(() => (
          <svg>
            <ViewRectangle view={view} />
          </svg>
        ));

        const group = screen.getByTestId('view-selected-view');
        const rect = group.querySelector('rect');
        const classAttr = rect?.getAttribute('class') ?? '';

        expect(classAttr).toMatch(/selected/i);
      });
    });

    it('should maintain category class when selected', () => {
      testInRoot(() => {
        const view = createMockView({ id: 'selected-view', category: 'control' });

        select('selected-view');

        render(() => (
          <svg>
            <ViewRectangle view={view} />
          </svg>
        ));

        const group = screen.getByTestId('view-selected-view');
        const rect = group.querySelector('rect');
        const classAttr = rect?.getAttribute('class') ?? '';

        // Should have both control and selected classes
        expect(classAttr).toMatch(/control/i);
        expect(classAttr).toMatch(/selected/i);
      });
    });
  });

  describe('Given selection state changes', () => {
    it('should update styling when view becomes selected', () => {
      testInRoot(() => {
        const view = createMockView({ id: 'dynamic-view' });

        // Render without selection
        const { unmount } = render(() => (
          <svg>
            <ViewRectangle view={view} />
          </svg>
        ));

        let group = screen.getByTestId('view-dynamic-view');
        let rect = group.querySelector('rect');
        let classAttr = rect?.getAttribute('class') ?? '';

        expect(classAttr).not.toMatch(/selected/i);

        unmount();

        // Now select and re-render
        select('dynamic-view');

        render(() => (
          <svg>
            <ViewRectangle view={view} />
          </svg>
        ));

        group = screen.getByTestId('view-dynamic-view');
        rect = group.querySelector('rect');
        classAttr = rect?.getAttribute('class') ?? '';

        expect(classAttr).toMatch(/selected/i);
      });
    });
  });

  describe('Given multiple views with one selected', () => {
    it('should only apply selected class to selected view', () => {
      testInRoot(() => {
        const view1 = createMockView({ id: 'view-1' });
        const view2 = createMockView({ id: 'view-2', absoluteX: 300 });

        // Select only view-1
        select('view-1');

        render(() => (
          <svg>
            <ViewRectangle view={view1} />
            <ViewRectangle view={view2} />
          </svg>
        ));

        const group1 = screen.getByTestId('view-view-1');
        const rect1 = group1.querySelector('rect');
        const class1 = rect1?.getAttribute('class') ?? '';

        const group2 = screen.getByTestId('view-view-2');
        const rect2 = group2.querySelector('rect');
        const class2 = rect2?.getAttribute('class') ?? '';

        expect(class1).toMatch(/selected/i);
        expect(class2).not.toMatch(/selected/i);
      });
    });
  });
});
