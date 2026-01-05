import { cleanup, render, screen } from '@solidjs/testing-library';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { resetGrid, setGridSize, setGridStyle, toggleVisibility } from '../../../stores/gridStore';
import { Grid } from '../Grid';

// Mock gridStore to control visibility
vi.mock('../../../stores/gridStore', async () => {
  const actual = await vi.importActual<typeof import('../../../stores/gridStore')>(
    '../../../stores/gridStore'
  );
  return {
    ...actual,
  };
});

describe('Grid', () => {
  beforeEach(() => {
    resetGrid();
  });

  afterEach(() => {
    cleanup();
  });

  describe('visibility', () => {
    test('renders when isVisible is true', () => {
      render(() => <Grid width={100} height={100} />);
      const gridContainer = screen.getByTestId('grid-container');
      expect(gridContainer).toBeInTheDocument();
    });

    test('does not render when isVisible is false', () => {
      toggleVisibility(); // Set to false
      render(() => <Grid width={100} height={100} />);
      expect(screen.queryByTestId('grid-container')).not.toBeInTheDocument();
    });

    test('toggles visibility correctly', () => {
      const { unmount } = render(() => <Grid width={100} height={100} />);
      expect(screen.getByTestId('grid-container')).toBeInTheDocument();
      unmount();

      toggleVisibility(); // false
      const { unmount: unmount2 } = render(() => <Grid width={100} height={100} />);
      expect(screen.queryByTestId('grid-container')).not.toBeInTheDocument();
      unmount2();

      toggleVisibility(); // true again
      render(() => <Grid width={100} height={100} />);
      expect(screen.getByTestId('grid-container')).toBeInTheDocument();
    });
  });

  describe('dimensions', () => {
    test('uses provided width and height', () => {
      render(() => <Grid width={200} height={150} />);
      const svg = screen.getByTestId('grid-svg');
      expect(svg).toHaveAttribute('width', '200');
      expect(svg).toHaveAttribute('height', '150');
    });

    test('updates when dimensions change', () => {
      const { unmount } = render(() => <Grid width={100} height={100} />);
      const svg1 = screen.getByTestId('grid-svg');
      expect(svg1).toHaveAttribute('width', '100');
      unmount();

      render(() => <Grid width={300} height={250} />);
      const svg2 = screen.getByTestId('grid-svg');
      expect(svg2).toHaveAttribute('width', '300');
      expect(svg2).toHaveAttribute('height', '250');
    });
  });

  describe('grid size', () => {
    test('uses default grid size of 10', () => {
      render(() => <Grid width={100} height={100} />);
      const pattern = screen.getByTestId('grid-pattern-minor');
      expect(pattern).toHaveAttribute('width', '10');
      expect(pattern).toHaveAttribute('height', '10');
    });

    test('uses grid size from store when changed to 5', () => {
      setGridSize(5);
      render(() => <Grid width={100} height={100} />);
      const pattern = screen.getByTestId('grid-pattern-minor');
      expect(pattern).toHaveAttribute('width', '5');
      expect(pattern).toHaveAttribute('height', '5');
    });

    test('uses grid size from store when changed to 20', () => {
      setGridSize(20);
      render(() => <Grid width={100} height={100} />);
      const pattern = screen.getByTestId('grid-pattern-minor');
      expect(pattern).toHaveAttribute('width', '20');
      expect(pattern).toHaveAttribute('height', '20');
    });
  });

  describe('grid style - lines', () => {
    test('renders lines style by default', () => {
      render(() => <Grid width={100} height={100} />);
      const pattern = screen.getByTestId('grid-pattern-minor');
      // Lines style has line elements
      const lines = pattern.querySelectorAll('line');
      expect(lines.length).toBeGreaterThan(0);
    });

    test('renders horizontal and vertical lines', () => {
      render(() => <Grid width={100} height={100} />);
      const pattern = screen.getByTestId('grid-pattern-minor');
      const lines = pattern.querySelectorAll('line');
      // Should have 2 lines (horizontal and vertical)
      expect(lines.length).toBe(2);
    });
  });

  describe('grid style - dots', () => {
    test('renders dots when style is dots', () => {
      setGridStyle('dots');
      render(() => <Grid width={100} height={100} />);
      const pattern = screen.getByTestId('grid-pattern-minor');
      // Dots style has circle elements
      const circles = pattern.querySelectorAll('circle');
      expect(circles.length).toBeGreaterThan(0);
    });
  });

  describe('grid style - crosshairs', () => {
    test('renders crosshairs when style is crosshairs', () => {
      setGridStyle('crosshairs');
      render(() => <Grid width={100} height={100} />);
      const pattern = screen.getByTestId('grid-pattern-minor');
      // Crosshairs style has line elements but shorter
      const lines = pattern.querySelectorAll('line');
      expect(lines.length).toBeGreaterThan(0);
    });
  });

  describe('major lines', () => {
    test('renders major line pattern', () => {
      render(() => <Grid width={100} height={100} />);
      const majorPattern = screen.getByTestId('grid-pattern-major');
      expect(majorPattern).toBeInTheDocument();
    });

    test('major pattern size is 5x the minor grid size', () => {
      render(() => <Grid width={100} height={100} />);
      const majorPattern = screen.getByTestId('grid-pattern-major');
      // Default size is 10, major is every 5th = 50
      expect(majorPattern).toHaveAttribute('width', '50');
      expect(majorPattern).toHaveAttribute('height', '50');
    });

    test('major pattern scales with grid size', () => {
      setGridSize(20);
      render(() => <Grid width={100} height={100} />);
      const majorPattern = screen.getByTestId('grid-pattern-major');
      // Size 20 * 5 = 100
      expect(majorPattern).toHaveAttribute('width', '100');
      expect(majorPattern).toHaveAttribute('height', '100');
    });
  });

  describe('SVG structure', () => {
    test('contains defs with patterns', () => {
      render(() => <Grid width={100} height={100} />);
      const svg = screen.getByTestId('grid-svg');
      const defs = svg.querySelector('defs');
      expect(defs).toBeInTheDocument();
    });

    test('contains rect elements using patterns', () => {
      render(() => <Grid width={100} height={100} />);
      const svg = screen.getByTestId('grid-svg');
      const rects = svg.querySelectorAll('rect');
      expect(rects.length).toBeGreaterThan(0);
    });

    test('minor grid rect fills entire area', () => {
      render(() => <Grid width={200} height={150} />);
      const minorRect = screen.getByTestId('grid-rect-minor');
      expect(minorRect).toHaveAttribute('width', '200');
      expect(minorRect).toHaveAttribute('height', '150');
    });

    test('major grid rect fills entire area', () => {
      render(() => <Grid width={200} height={150} />);
      const majorRect = screen.getByTestId('grid-rect-major');
      expect(majorRect).toHaveAttribute('width', '200');
      expect(majorRect).toHaveAttribute('height', '150');
    });
  });
});
