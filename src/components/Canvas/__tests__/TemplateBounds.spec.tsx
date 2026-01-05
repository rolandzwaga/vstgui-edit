import { describe, it, expect } from 'vitest';
import { render, screen } from '@solidjs/testing-library';
import { TemplateBounds } from '../TemplateBounds';
import type { TemplateBounds as TemplateBoundsType } from '../../../types/canvas';

describe('TemplateBounds', () => {
  describe('Given valid bounds (US5 - template bounds)', () => {
    it('should render an SVG rect element', () => {
      const bounds: TemplateBoundsType = { width: 400, height: 300 };

      render(() => (
        <svg>
          <TemplateBounds bounds={bounds} />
        </svg>
      ));

      expect(screen.getByTestId('template-bounds')).toBeInTheDocument();
    });

    it('should render rect at origin (0, 0)', () => {
      const bounds: TemplateBoundsType = { width: 400, height: 300 };

      render(() => (
        <svg>
          <TemplateBounds bounds={bounds} />
        </svg>
      ));

      const boundsElement = screen.getByTestId('template-bounds');
      const rect = boundsElement.querySelector('rect');

      expect(rect).toHaveAttribute('x', '0');
      expect(rect).toHaveAttribute('y', '0');
    });

    it('should render rect with correct width and height', () => {
      const bounds: TemplateBoundsType = { width: 800, height: 600 };

      render(() => (
        <svg>
          <TemplateBounds bounds={bounds} />
        </svg>
      ));

      const boundsElement = screen.getByTestId('template-bounds');
      const rect = boundsElement.querySelector('rect');

      expect(rect).toHaveAttribute('width', '800');
      expect(rect).toHaveAttribute('height', '600');
    });

    it('should apply templateBounds CSS class', () => {
      const bounds: TemplateBoundsType = { width: 400, height: 300 };

      render(() => (
        <svg>
          <TemplateBounds bounds={bounds} />
        </svg>
      ));

      const boundsElement = screen.getByTestId('template-bounds');
      const rect = boundsElement.querySelector('rect');
      const classAttr = rect?.getAttribute('class') ?? '';

      // CSS Modules transform class names
      expect(classAttr).toMatch(/templateBounds/i);
    });
  });

  describe('Given different template sizes', () => {
    it('should handle small templates', () => {
      const bounds: TemplateBoundsType = { width: 100, height: 50 };

      render(() => (
        <svg>
          <TemplateBounds bounds={bounds} />
        </svg>
      ));

      const boundsElement = screen.getByTestId('template-bounds');
      const rect = boundsElement.querySelector('rect');

      expect(rect).toHaveAttribute('width', '100');
      expect(rect).toHaveAttribute('height', '50');
    });

    it('should handle large templates', () => {
      const bounds: TemplateBoundsType = { width: 1920, height: 1080 };

      render(() => (
        <svg>
          <TemplateBounds bounds={bounds} />
        </svg>
      ));

      const boundsElement = screen.getByTestId('template-bounds');
      const rect = boundsElement.querySelector('rect');

      expect(rect).toHaveAttribute('width', '1920');
      expect(rect).toHaveAttribute('height', '1080');
    });
  });
});
