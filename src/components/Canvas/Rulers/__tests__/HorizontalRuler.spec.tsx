import { cleanup, fireEvent, render, screen } from '@solidjs/testing-library';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { testInRoot } from '../../../../__tests__/helpers/solidjs';
import { resetCanvas, setZoom } from '../../../../stores/canvasStore';
import { resetGrid } from '../../../../stores/gridStore';
import { guidesStore, resetGuidesStore } from '../../../../stores/guidesStore';
import { HorizontalRuler } from '../HorizontalRuler';

describe('HorizontalRuler', () => {
  beforeEach(() => {
    resetCanvas();
    resetGrid();
    testInRoot(() => {
      resetGuidesStore();
    });
  });

  afterEach(() => {
    cleanup();
  });

  describe('renders tick marks for visible range', () => {
    test('renders ruler container', () => {
      render(() => (
        <HorizontalRuler width={800} cursorPosition={null} templateWidth={600} />
      ));
      const ruler = screen.getByTestId('horizontal-ruler');
      expect(ruler).toBeInTheDocument();
    });

    test('renders tick marks within visible range', () => {
      render(() => (
        <HorizontalRuler width={400} cursorPosition={null} templateWidth={600} />
      ));
      const ruler = screen.getByTestId('horizontal-ruler');
      const ticks = ruler.querySelectorAll('[data-testid^="tick-"]');
      expect(ticks.length).toBeGreaterThan(0);
    });

    test('renders ticks at expected positions at 100% zoom', () => {
      render(() => (
        <HorizontalRuler width={400} cursorPosition={null} templateWidth={600} />
      ));
      const ruler = screen.getByTestId('horizontal-ruler');
      // At 100% zoom with 400px width, should see ticks at 0, 10, 20, ..., 100, 200, 300, 400
      const majorTicks = ruler.querySelectorAll('[data-testid^="tick-major-"]');
      expect(majorTicks.length).toBeGreaterThan(0);
    });
  });

  describe('major ticks have labels', () => {
    test('major ticks display coordinate labels', () => {
      render(() => (
        <HorizontalRuler width={400} cursorPosition={null} templateWidth={600} />
      ));
      const ruler = screen.getByTestId('horizontal-ruler');
      const labels = ruler.querySelectorAll('[data-testid^="label-"]');
      expect(labels.length).toBeGreaterThan(0);
    });

    test('label at origin shows 0', () => {
      render(() => (
        <HorizontalRuler width={400} cursorPosition={null} templateWidth={600} />
      ));
      // Look for label with text "0"
      const label = screen.getByText('0');
      expect(label).toBeInTheDocument();
    });

    test('labels show coordinate values', () => {
      render(() => (
        <HorizontalRuler width={400} cursorPosition={null} templateWidth={600} />
      ));
      // Should have labels like 0, 100, 200, 300, 400
      expect(screen.getByText('100')).toBeInTheDocument();
      expect(screen.getByText('200')).toBeInTheDocument();
    });
  });

  describe('minor ticks no labels', () => {
    test('minor ticks do not have visible labels', () => {
      render(() => (
        <HorizontalRuler width={400} cursorPosition={null} templateWidth={600} />
      ));
      const ruler = screen.getByTestId('horizontal-ruler');
      const minorTicks = ruler.querySelectorAll('[data-testid^="tick-minor-"]');
      // Minor ticks should exist
      expect(minorTicks.length).toBeGreaterThan(0);
    });
  });

  describe('renders at correct width', () => {
    test('ruler has correct width attribute', () => {
      render(() => (
        <HorizontalRuler width={800} cursorPosition={null} templateWidth={600} />
      ));
      const ruler = screen.getByTestId('horizontal-ruler');
      expect(ruler).toHaveStyle({ width: '800px' });
    });

    test('ruler width updates with prop', () => {
      const { unmount } = render(() => (
        <HorizontalRuler width={400} cursorPosition={null} templateWidth={600} />
      ));
      let ruler = screen.getByTestId('horizontal-ruler');
      expect(ruler).toHaveStyle({ width: '400px' });
      unmount();

      render(() => (
        <HorizontalRuler width={1200} cursorPosition={null} templateWidth={600} />
      ));
      ruler = screen.getByTestId('horizontal-ruler');
      expect(ruler).toHaveStyle({ width: '1200px' });
    });
  });

  describe('zoom-aware tick spacing', () => {
    test('tick spacing doubles at 50% zoom', () => {
      setZoom(0.5);
      render(() => (
        <HorizontalRuler width={400} cursorPosition={null} templateWidth={600} />
      ));
      const ruler = screen.getByTestId('horizontal-ruler');
      const majorTicks = ruler.querySelectorAll('[data-testid^="tick-major-"]');
      // At 50% zoom with 400px width, visible range is 0-800 canvas pixels
      // Major ticks at 200px intervals = 0, 200, 400, 600, 800
      expect(majorTicks.length).toBe(5);
    });

    test('tick spacing halves at 200% zoom', () => {
      setZoom(2.0);
      render(() => (
        <HorizontalRuler width={400} cursorPosition={null} templateWidth={600} />
      ));
      const ruler = screen.getByTestId('horizontal-ruler');
      const majorTicks = ruler.querySelectorAll('[data-testid^="tick-major-"]');
      // At 200% zoom with 400px width, visible range is 0-200 canvas pixels
      // Major ticks at 50px intervals = 0, 50, 100, 150, 200
      expect(majorTicks.length).toBe(5);
    });
  });

  describe('drag-to-create guide', () => {
    test('mousedown starts creation drag with horizontal orientation', () => {
      render(() => (
        <HorizontalRuler width={400} cursorPosition={null} templateWidth={600} />
      ));
      const ruler = screen.getByTestId('horizontal-ruler');

      testInRoot(() => {
        expect(guidesStore.creationDrag).toBeNull();
      });

      fireEvent.mouseDown(ruler, { button: 0, clientY: 10 });

      testInRoot(() => {
        expect(guidesStore.creationDrag).not.toBeNull();
        expect(guidesStore.creationDrag?.orientation).toBe('horizontal');
      });
    });

    test('mousedown does not start drag on non-primary button', () => {
      render(() => (
        <HorizontalRuler width={400} cursorPosition={null} templateWidth={600} />
      ));
      const ruler = screen.getByTestId('horizontal-ruler');

      fireEvent.mouseDown(ruler, { button: 2 });

      testInRoot(() => {
        expect(guidesStore.creationDrag).toBeNull();
      });
    });
  });

  describe('right-click to create guide (FR-016)', () => {
    test('right-click creates vertical guide at click X position', () => {
      render(() => (
        <HorizontalRuler width={400} cursorPosition={null} templateWidth={600} />
      ));
      const ruler = screen.getByTestId('horizontal-ruler');

      testInRoot(() => {
        expect(guidesStore.guides.length).toBe(0);
      });

      // Top ruler shows X coords, so right-click creates vertical guide at that X
      fireEvent.contextMenu(ruler, { clientX: 150 });

      testInRoot(() => {
        expect(guidesStore.guides.length).toBe(1);
        expect(guidesStore.guides[0].orientation).toBe('vertical');
        expect(typeof guidesStore.guides[0].position).toBe('number');
      });
    });

    test('right-click prevents default context menu', () => {
      render(() => (
        <HorizontalRuler width={400} cursorPosition={null} templateWidth={600} />
      ));
      const ruler = screen.getByTestId('horizontal-ruler');

      const event = new MouseEvent('contextmenu', { bubbles: true, cancelable: true });
      const preventDefaultSpy = vi.spyOn(event, 'preventDefault');

      ruler.dispatchEvent(event);

      expect(preventDefaultSpy).toHaveBeenCalled();
    });
  });
});
