/**
 * HoverTooltip Tests
 * Tests for the hover tooltip component (FR-011)
 */
import { describe, expect, it } from 'vitest';
import { render, screen } from '@solidjs/testing-library';
import { HoverTooltip } from '../HoverTooltip';
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

describe('HoverTooltip', () => {
  describe('Given a view to display tooltip for', () => {
    it('should render tooltip with view class name and size', () => {
      const view = createMockView({
        className: 'CSlider',
        width: 150,
        height: 40,
      });

      render(() => <HoverTooltip view={view} x={100} y={50} />);

      const tooltip = screen.getByTestId('hover-tooltip');
      expect(tooltip).toBeInTheDocument();
      expect(tooltip.textContent).toContain('CSlider');
      expect(tooltip.textContent).toContain('150');
      expect(tooltip.textContent).toContain('40');
    });

    it('should format tooltip content as "ClassName (W×H)" (FR-011)', () => {
      const view = createMockView({
        className: 'CKnob',
        width: 64,
        height: 64,
      });

      render(() => <HoverTooltip view={view} x={0} y={0} />);

      const tooltip = screen.getByTestId('hover-tooltip');
      // Should contain "CKnob (64×64)" or similar format
      expect(tooltip.textContent).toMatch(/CKnob.*64.*64/);
    });

    it('should position tooltip near the specified coordinates', () => {
      const view = createMockView();

      render(() => <HoverTooltip view={view} x={200} y={150} />);

      const tooltip = screen.getByTestId('hover-tooltip');
      const style = tooltip.getAttribute('style');

      // Tooltip should have left/top positioning based on x, y
      expect(style).toContain('left');
      expect(style).toContain('top');
    });
  });

  describe('Given different view types', () => {
    it('should display container view info', () => {
      const view = createMockView({
        className: 'CViewContainer',
        width: 400,
        height: 300,
        category: 'container',
      });

      render(() => <HoverTooltip view={view} x={0} y={0} />);

      const tooltip = screen.getByTestId('hover-tooltip');
      expect(tooltip.textContent).toContain('CViewContainer');
    });

    it('should display custom view info with class name', () => {
      const view = createMockView({
        className: 'MyCustomKnob',
        width: 80,
        height: 80,
        category: 'custom',
      });

      render(() => <HoverTooltip view={view} x={0} y={0} />);

      const tooltip = screen.getByTestId('hover-tooltip');
      expect(tooltip.textContent).toContain('MyCustomKnob');
    });
  });
});
