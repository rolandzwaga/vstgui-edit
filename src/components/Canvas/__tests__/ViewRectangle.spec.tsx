import { describe, it, expect } from 'vitest';
import { render, screen } from '@solidjs/testing-library';
import { ViewRectangle } from '../ViewRectangle';
import type { RenderableView } from '../../../types/canvas';

const createMockView = (overrides: Partial<RenderableView> = {}): RenderableView => ({
  id: 'test-view',
  absoluteX: 50,
  absoluteY: 100,
  width: 200,
  height: 80,
  label: 'CTextButton',
  category: 'control',
  zIndex: 0,
  ...overrides,
});

describe('ViewRectangle', () => {
  describe('Given a RenderableView (US1 - basic rendering)', () => {
    it('should render an SVG group element', () => {
      const view = createMockView();

      render(() => (
        <svg>
          <ViewRectangle view={view} />
        </svg>
      ));

      expect(screen.getByTestId('view-test-view')).toBeInTheDocument();
    });

    it('should include data-view-id attribute for identification', () => {
      const view = createMockView({ id: 'my-button' });

      render(() => (
        <svg>
          <ViewRectangle view={view} />
        </svg>
      ));

      const group = screen.getByTestId('view-my-button');
      expect(group).toHaveAttribute('data-view-id', 'my-button');
    });

    it('should render rect with correct position', () => {
      const view = createMockView({
        absoluteX: 100,
        absoluteY: 200,
      });

      render(() => (
        <svg>
          <ViewRectangle view={view} />
        </svg>
      ));

      const group = screen.getByTestId('view-test-view');
      const rect = group.querySelector('rect');

      expect(rect).toHaveAttribute('x', '100');
      expect(rect).toHaveAttribute('y', '200');
    });

    it('should render rect with correct dimensions', () => {
      const view = createMockView({
        width: 300,
        height: 150,
      });

      render(() => (
        <svg>
          <ViewRectangle view={view} />
        </svg>
      ));

      const group = screen.getByTestId('view-test-view');
      const rect = group.querySelector('rect');

      expect(rect).toHaveAttribute('width', '300');
      expect(rect).toHaveAttribute('height', '150');
    });
  });

  describe('Given different view IDs', () => {
    it('should use view id for test id', () => {
      const view = createMockView({ id: 'unique-id-123' });

      render(() => (
        <svg>
          <ViewRectangle view={view} />
        </svg>
      ));

      expect(screen.getByTestId('view-unique-id-123')).toBeInTheDocument();
    });
  });
});
