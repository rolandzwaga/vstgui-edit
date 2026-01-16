import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup } from '@solidjs/testing-library';
import { ViewRectangle } from '../ViewRectangle';
import { resetViewModeStore, setViewMode } from '../../../stores/viewModeStore';
import type { RenderableView } from '../../../types/canvas';
import type { StyledViewProps } from '../../../types/viewMode';

const createMockView = (overrides: Partial<RenderableView> = {}): RenderableView => ({
  id: 'test-view',
  absoluteX: 50,
  absoluteY: 100,
  relativeX: 50,
  relativeY: 100,
  width: 200,
  height: 80,
  className: 'CTextButton',
  category: 'control',
  zIndex: 0,
  parentId: null,
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

  describe('Given a view with a title attribute (title rendering)', () => {
    it('should render SVG text element with the title', () => {
      const view = createMockView({
        className: 'CTextLabel',
        category: 'display',
        title: 'Hello World',
      });

      render(() => (
        <svg>
          <ViewRectangle view={view} />
        </svg>
      ));

      const group = screen.getByTestId('view-test-view');
      const text = group.querySelector('text');

      expect(text).toBeInTheDocument();
      expect(text).toHaveTextContent('Hello World');
    });

    it('should not render text when no title attribute', () => {
      const view = createMockView({
        className: 'CViewContainer',
        category: 'container',
      });

      render(() => (
        <svg>
          <ViewRectangle view={view} />
        </svg>
      ));

      const group = screen.getByTestId('view-test-view');
      const text = group.querySelector('text');

      expect(text).toBeNull();
    });

    it('should position title inside the view rectangle', () => {
      const view = createMockView({
        absoluteX: 100,
        absoluteY: 200,
        title: 'Test Title',
      });

      render(() => (
        <svg>
          <ViewRectangle view={view} />
        </svg>
      ));

      const group = screen.getByTestId('view-test-view');
      const text = group.querySelector('text');

      // Title should be positioned with some padding from the left edge
      const textX = Number(text?.getAttribute('x'));
      expect(textX).toBeGreaterThanOrEqual(100);
    });

    it('should apply fontSize as SVG attribute when provided', () => {
      const view = createMockView({
        title: 'Test',
        fontSize: 16,
      });

      render(() => (
        <svg>
          <ViewRectangle view={view} />
        </svg>
      ));

      const group = screen.getByTestId('view-test-view');
      const text = group.querySelector('text');

      expect(text).toHaveAttribute('font-size', '16');
    });

    it('should use default fontSize of 10 when not provided', () => {
      const view = createMockView({
        title: 'Test',
      });

      render(() => (
        <svg>
          <ViewRectangle view={view} />
        </svg>
      ));

      const group = screen.getByTestId('view-test-view');
      const text = group.querySelector('text');

      expect(text).toHaveAttribute('font-size', '10');
    });

    it('should apply fontColor as fill attribute when provided', () => {
      const view = createMockView({
        title: 'Test',
        fontColor: '#FF0000',
      });

      render(() => (
        <svg>
          <ViewRectangle view={view} />
        </svg>
      ));

      const group = screen.getByTestId('view-test-view');
      const text = group.querySelector('text');

      expect(text).toHaveAttribute('fill', '#FF0000');
    });

    it('should apply both fontSize and fontColor when both provided', () => {
      const view = createMockView({
        title: 'Test',
        fontSize: 14,
        fontColor: 'rgba(0, 0, 255, 0.50)',
      });

      render(() => (
        <svg>
          <ViewRectangle view={view} />
        </svg>
      ));

      const group = screen.getByTestId('view-test-view');
      const text = group.querySelector('text');

      expect(text).toHaveAttribute('font-size', '14');
      expect(text).toHaveAttribute('fill', 'rgba(0, 0, 255, 0.50)');
    });
  });

  describe('Given views with different categories (US4 - category coloring)', () => {
    // Note: CSS Modules transform class names, so we check that the class attribute
    // contains the category name pattern (e.g., '_container_' or 'container')

    it('should apply container CSS class for container category', () => {
      const view = createMockView({ category: 'container' });

      render(() => (
        <svg>
          <ViewRectangle view={view} />
        </svg>
      ));

      const group = screen.getByTestId('view-test-view');
      const rect = group.querySelector('rect');
      const classAttr = rect?.getAttribute('class') ?? '';

      // CSS Modules adds the category class (transformed)
      expect(classAttr).toMatch(/container/i);
    });

    it('should apply control CSS class for control category', () => {
      const view = createMockView({ category: 'control' });

      render(() => (
        <svg>
          <ViewRectangle view={view} />
        </svg>
      ));

      const group = screen.getByTestId('view-test-view');
      const rect = group.querySelector('rect');
      const classAttr = rect?.getAttribute('class') ?? '';

      expect(classAttr).toMatch(/control/i);
    });

    it('should apply display CSS class for display category', () => {
      const view = createMockView({ category: 'display' });

      render(() => (
        <svg>
          <ViewRectangle view={view} />
        </svg>
      ));

      const group = screen.getByTestId('view-test-view');
      const rect = group.querySelector('rect');
      const classAttr = rect?.getAttribute('class') ?? '';

      expect(classAttr).toMatch(/display/i);
    });

    it('should apply custom CSS class for custom category', () => {
      const view = createMockView({ category: 'custom' });

      render(() => (
        <svg>
          <ViewRectangle view={view} />
        </svg>
      ));

      const group = screen.getByTestId('view-test-view');
      const rect = group.querySelector('rect');
      const classAttr = rect?.getAttribute('class') ?? '';

      expect(classAttr).toMatch(/custom/i);
    });
  });

  describe('Given styled mode rendering (US2 - document colors)', () => {
    const createMockStyledProps = (
      overrides: Partial<StyledViewProps> = {}
    ): StyledViewProps => ({
      backgroundColor: null,
      frameColor: null,
      frameWidth: 1,
      isTransparent: false,
      opacity: 1.0,
      useWireframeFallback: true,
      ...overrides,
    });

    beforeEach(() => {
      resetViewModeStore();
    });

    afterEach(() => {
      cleanup();
    });

    it('should render with inline fill when styled mode and background-color is provided', () => {
      setViewMode('styled');
      const view = createMockView({ category: 'container' });
      const styledProps = createMockStyledProps({
        backgroundColor: '#FF5500FF',
        useWireframeFallback: false,
      });

      render(() => (
        <svg>
          <ViewRectangle view={view} styledProps={styledProps} />
        </svg>
      ));

      const group = screen.getByTestId('view-test-view');
      const rect = group.querySelector('rect');

      expect(rect).toHaveAttribute('fill', '#FF5500FF');
    });

    it('should render with inline stroke when styled mode and frame-color is provided', () => {
      setViewMode('styled');
      const view = createMockView({ category: 'control' });
      const styledProps = createMockStyledProps({
        backgroundColor: '#FFFFFFFF',
        frameColor: '#000000FF',
        useWireframeFallback: false,
      });

      render(() => (
        <svg>
          <ViewRectangle view={view} styledProps={styledProps} />
        </svg>
      ));

      const group = screen.getByTestId('view-test-view');
      const rect = group.querySelector('rect');

      expect(rect).toHaveAttribute('stroke', '#000000FF');
    });

    it('should render with inline stroke-width when styled mode and frame-width is provided', () => {
      setViewMode('styled');
      const view = createMockView({ category: 'display' });
      const styledProps = createMockStyledProps({
        backgroundColor: '#CCCCCCFF',
        frameColor: '#333333FF',
        frameWidth: 3,
        useWireframeFallback: false,
      });

      render(() => (
        <svg>
          <ViewRectangle view={view} styledProps={styledProps} />
        </svg>
      ));

      const group = screen.getByTestId('view-test-view');
      const rect = group.querySelector('rect');

      expect(rect).toHaveAttribute('stroke-width', '3');
    });

    it('should use resolved hex color from document color reference', () => {
      // The color resolution happens in the parent, we just verify it renders
      setViewMode('styled');
      const view = createMockView({ category: 'container' });
      const styledProps = createMockStyledProps({
        backgroundColor: '#3366AAFF', // Resolved from document color "Primary"
        useWireframeFallback: false,
      });

      render(() => (
        <svg>
          <ViewRectangle view={view} styledProps={styledProps} />
        </svg>
      ));

      const group = screen.getByTestId('view-test-view');
      const rect = group.querySelector('rect');

      expect(rect).toHaveAttribute('fill', '#3366AAFF');
    });

    it('should use resolved hex color from predefined color reference', () => {
      // Resolved from predefined ~BlackCColor
      setViewMode('styled');
      const view = createMockView({ category: 'control' });
      const styledProps = createMockStyledProps({
        backgroundColor: '#000000FF',
        useWireframeFallback: false,
      });

      render(() => (
        <svg>
          <ViewRectangle view={view} styledProps={styledProps} />
        </svg>
      ));

      const group = screen.getByTestId('view-test-view');
      const rect = group.querySelector('rect');

      expect(rect).toHaveAttribute('fill', '#000000FF');
    });

    it('should NOT apply inline styles in wireframe mode even with styledProps', () => {
      setViewMode('wireframe');
      const view = createMockView({ category: 'container' });
      const styledProps = createMockStyledProps({
        backgroundColor: '#FF5500FF',
        frameColor: '#000000FF',
        useWireframeFallback: false,
      });

      render(() => (
        <svg>
          <ViewRectangle view={view} styledProps={styledProps} />
        </svg>
      ));

      const group = screen.getByTestId('view-test-view');
      const rect = group.querySelector('rect');

      // In wireframe mode, CSS classes control styling, not inline styles
      expect(rect).not.toHaveAttribute('fill', '#FF5500FF');
      expect(rect).not.toHaveAttribute('stroke', '#000000FF');
    });

    it('should work without styledProps (backward compatibility)', () => {
      setViewMode('wireframe');
      const view = createMockView({ category: 'control' });

      render(() => (
        <svg>
          <ViewRectangle view={view} />
        </svg>
      ));

      const group = screen.getByTestId('view-test-view');
      const rect = group.querySelector('rect');

      // Should render normally with CSS classes
      expect(rect).toBeInTheDocument();
      const classAttr = rect?.getAttribute('class') ?? '';
      expect(classAttr).toMatch(/control/i);
    });
  });
});
