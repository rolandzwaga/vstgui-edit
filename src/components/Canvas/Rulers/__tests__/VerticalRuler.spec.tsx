import { cleanup, fireEvent, render, screen } from '@solidjs/testing-library';
import { afterEach, beforeEach, describe, expect, test } from 'vitest';
import { testInRoot } from '../../../../__tests__/helpers/solidjs';
import { resetCanvas, setZoom } from '../../../../stores/canvasStore';
import { resetGrid } from '../../../../stores/gridStore';
import { guidesStore, resetGuidesStore } from '../../../../stores/guidesStore';
import { VerticalRuler } from '../VerticalRuler';

describe('VerticalRuler', () => {
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
        <VerticalRuler height={600} cursorPosition={null} templateHeight={400} />
      ));
      const ruler = screen.getByTestId('vertical-ruler');
      expect(ruler).toBeInTheDocument();
    });

    test('renders tick marks within visible range', () => {
      render(() => (
        <VerticalRuler height={400} cursorPosition={null} templateHeight={400} />
      ));
      const ruler = screen.getByTestId('vertical-ruler');
      const ticks = ruler.querySelectorAll('[data-testid^="tick-"]');
      expect(ticks.length).toBeGreaterThan(0);
    });
  });

  describe('labels positioned correctly', () => {
    test('labels are positioned to right of ticks', () => {
      render(() => (
        <VerticalRuler height={400} cursorPosition={null} templateHeight={400} />
      ));
      const ruler = screen.getByTestId('vertical-ruler');
      const labels = ruler.querySelectorAll('[data-testid^="label-"]');
      expect(labels.length).toBeGreaterThan(0);
    });

    test('label at origin shows 0', () => {
      render(() => (
        <VerticalRuler height={400} cursorPosition={null} templateHeight={400} />
      ));
      const label = screen.getByText('0');
      expect(label).toBeInTheDocument();
    });

    test('labels show coordinate values', () => {
      render(() => (
        <VerticalRuler height={400} cursorPosition={null} templateHeight={400} />
      ));
      expect(screen.getByText('100')).toBeInTheDocument();
      expect(screen.getByText('200')).toBeInTheDocument();
    });
  });

  describe('renders at correct height', () => {
    test('ruler has correct height attribute', () => {
      render(() => (
        <VerticalRuler height={600} cursorPosition={null} templateHeight={400} />
      ));
      const ruler = screen.getByTestId('vertical-ruler');
      expect(ruler).toHaveStyle({ height: '600px' });
    });

    test('ruler height updates with prop', () => {
      const { unmount } = render(() => (
        <VerticalRuler height={400} cursorPosition={null} templateHeight={400} />
      ));
      let ruler = screen.getByTestId('vertical-ruler');
      expect(ruler).toHaveStyle({ height: '400px' });
      unmount();

      render(() => (
        <VerticalRuler height={800} cursorPosition={null} templateHeight={400} />
      ));
      ruler = screen.getByTestId('vertical-ruler');
      expect(ruler).toHaveStyle({ height: '800px' });
    });
  });

  describe('zoom-aware tick spacing', () => {
    test('tick spacing adjusts at 50% zoom', () => {
      setZoom(0.5);
      render(() => (
        <VerticalRuler height={400} cursorPosition={null} templateHeight={400} />
      ));
      const ruler = screen.getByTestId('vertical-ruler');
      const majorTicks = ruler.querySelectorAll('[data-testid^="tick-major-"]');
      // At 50% zoom with 400px height, visible range is 0-800 canvas pixels
      // Major ticks at 200px intervals = 0, 200, 400, 600, 800
      expect(majorTicks.length).toBe(5);
    });

    test('tick spacing adjusts at 200% zoom', () => {
      setZoom(2.0);
      render(() => (
        <VerticalRuler height={400} cursorPosition={null} templateHeight={400} />
      ));
      const ruler = screen.getByTestId('vertical-ruler');
      const majorTicks = ruler.querySelectorAll('[data-testid^="tick-major-"]');
      // At 200% zoom with 400px height, visible range is 0-200 canvas pixels
      // Major ticks at 50px intervals = 0, 50, 100, 150, 200
      expect(majorTicks.length).toBe(5);
    });
  });

  describe('drag-to-create guide', () => {
    test('mousedown starts creation drag with vertical orientation', () => {
      render(() => (
        <VerticalRuler height={400} cursorPosition={null} templateHeight={400} />
      ));
      const ruler = screen.getByTestId('vertical-ruler');

      testInRoot(() => {
        expect(guidesStore.creationDrag).toBeNull();
      });

      fireEvent.mouseDown(ruler, { button: 0, clientX: 10 });

      testInRoot(() => {
        expect(guidesStore.creationDrag).not.toBeNull();
        expect(guidesStore.creationDrag?.orientation).toBe('vertical');
      });
    });

    test('mousedown does not start drag on non-primary button', () => {
      render(() => (
        <VerticalRuler height={400} cursorPosition={null} templateHeight={400} />
      ));
      const ruler = screen.getByTestId('vertical-ruler');

      fireEvent.mouseDown(ruler, { button: 2 });

      testInRoot(() => {
        expect(guidesStore.creationDrag).toBeNull();
      });
    });
  });
});
