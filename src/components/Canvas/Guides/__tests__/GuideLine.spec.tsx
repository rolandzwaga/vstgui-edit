/**
 * Tests for GuideLine component
 */
import { describe, test, expect, beforeEach } from 'vitest';
import { render, screen, cleanup } from '@solidjs/testing-library';
import { GuideLine } from '../GuideLine';
import { resetCanvas, setZoom } from '../../../../stores/canvasStore';
import type { CustomGuide } from '../../../../types/guides';

describe('GuideLine', () => {
  beforeEach(() => {
    resetCanvas();
    cleanup();
  });

  const horizontalGuide: CustomGuide = {
    id: 'guide-h1',
    orientation: 'horizontal',
    position: 100,
  };

  const verticalGuide: CustomGuide = {
    id: 'guide-v1',
    orientation: 'vertical',
    position: 200,
  };

  describe('horizontal guide rendering', () => {
    test('renders horizontal line spanning full canvas width', () => {
      render(() => (
        <svg data-testid="canvas" width={800} height={600}>
          <GuideLine guide={horizontalGuide} canvasWidth={800} canvasHeight={600} />
        </svg>
      ));

      const guide = screen.getByTestId('guide-guide-h1');
      expect(guide).toBeInTheDocument();

      const line = guide.querySelector('line');
      expect(line).toBeInTheDocument();
      expect(line?.getAttribute('x1')).toBe('0');
      expect(line?.getAttribute('x2')).toBe('800');
      expect(line?.getAttribute('y1')).toBe('100');
      expect(line?.getAttribute('y2')).toBe('100');
    });
  });

  describe('vertical guide rendering', () => {
    test('renders vertical line spanning full canvas height', () => {
      render(() => (
        <svg data-testid="canvas" width={800} height={600}>
          <GuideLine guide={verticalGuide} canvasWidth={800} canvasHeight={600} />
        </svg>
      ));

      const guide = screen.getByTestId('guide-guide-v1');
      expect(guide).toBeInTheDocument();

      const line = guide.querySelector('line');
      expect(line).toBeInTheDocument();
      expect(line?.getAttribute('x1')).toBe('200');
      expect(line?.getAttribute('x2')).toBe('200');
      expect(line?.getAttribute('y1')).toBe('0');
      expect(line?.getAttribute('y2')).toBe('600');
    });
  });

  describe('visual styling', () => {
    test('uses cyan color from design token', () => {
      render(() => (
        <svg data-testid="canvas" width={800} height={600}>
          <GuideLine guide={horizontalGuide} canvasWidth={800} canvasHeight={600} />
        </svg>
      ));

      const line = screen.getByTestId('guide-guide-h1').querySelector('line');
      const stroke = line?.getAttribute('stroke');
      // Should use the design token variable or its value
      expect(stroke).toContain('--color-custom-guide');
    });

    test('uses dashed stroke pattern', () => {
      render(() => (
        <svg data-testid="canvas" width={800} height={600}>
          <GuideLine guide={horizontalGuide} canvasWidth={800} canvasHeight={600} />
        </svg>
      ));

      const line = screen.getByTestId('guide-guide-h1').querySelector('line');
      expect(line?.getAttribute('stroke-dasharray')).toBeTruthy();
    });
  });

  describe('data-testid', () => {
    test('includes guide ID in testid', () => {
      render(() => (
        <svg data-testid="canvas" width={800} height={600}>
          <GuideLine guide={horizontalGuide} canvasWidth={800} canvasHeight={600} />
        </svg>
      ));

      expect(screen.getByTestId('guide-guide-h1')).toBeInTheDocument();
    });

    test('unique testid for each guide', () => {
      render(() => (
        <svg data-testid="canvas" width={800} height={600}>
          <GuideLine guide={horizontalGuide} canvasWidth={800} canvasHeight={600} />
          <GuideLine guide={verticalGuide} canvasWidth={800} canvasHeight={600} />
        </svg>
      ));

      expect(screen.getByTestId('guide-guide-h1')).toBeInTheDocument();
      expect(screen.getByTestId('guide-guide-v1')).toBeInTheDocument();
    });
  });

  describe('zoom-invariant stroke', () => {
    test('stroke-width inversely scales with zoom at 100%', () => {
      render(() => (
        <svg data-testid="canvas" width={800} height={600}>
          <GuideLine guide={horizontalGuide} canvasWidth={800} canvasHeight={600} />
        </svg>
      ));

      const line = screen.getByTestId('guide-guide-h1').querySelector('line');
      // At 100% zoom (zoomLevel = 1), stroke-width should be 1
      const strokeWidth = parseFloat(line?.getAttribute('stroke-width') ?? '0');
      expect(strokeWidth).toBe(1);
    });

    test('stroke-width scales with zoom at 200%', () => {
      setZoom(2.0);
      render(() => (
        <svg data-testid="canvas" width={800} height={600}>
          <GuideLine guide={horizontalGuide} canvasWidth={800} canvasHeight={600} />
        </svg>
      ));

      const line = screen.getByTestId('guide-guide-h1').querySelector('line');
      // At 200% zoom, stroke-width should be 0.5 (1/2)
      const strokeWidth = parseFloat(line?.getAttribute('stroke-width') ?? '0');
      expect(strokeWidth).toBe(0.5);
    });

    test('stroke-width scales with zoom at 50%', () => {
      setZoom(0.5);
      render(() => (
        <svg data-testid="canvas" width={800} height={600}>
          <GuideLine guide={horizontalGuide} canvasWidth={800} canvasHeight={600} />
        </svg>
      ));

      const line = screen.getByTestId('guide-guide-h1').querySelector('line');
      // At 50% zoom, stroke-width should be 2 (1/0.5)
      const strokeWidth = parseFloat(line?.getAttribute('stroke-width') ?? '0');
      expect(strokeWidth).toBe(2);
    });

    test('dash array scales with zoom', () => {
      setZoom(2.0);
      render(() => (
        <svg data-testid="canvas" width={800} height={600}>
          <GuideLine guide={horizontalGuide} canvasWidth={800} canvasHeight={600} />
        </svg>
      ));

      const line = screen.getByTestId('guide-guide-h1').querySelector('line');
      const dashArray = line?.getAttribute('stroke-dasharray');
      // Dash array should be smaller at higher zoom
      expect(dashArray).toBeTruthy();
      const dashes = dashArray?.split(' ').map(Number);
      // At 200% zoom, dashes should be half size
      expect(dashes?.[0]).toBe(2); // 4/2
    });
  });
});
