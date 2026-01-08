import { describe, expect, it } from 'vitest';
import { render, screen } from '@solidjs/testing-library';
import { ColorSwatch } from '../ColorSwatch';

describe('ColorSwatch', () => {
  describe('given opaque color', () => {
    it('should render swatch without transparency indicator', () => {
      render(() => <ColorSwatch color="#ff0000ff" />);

      const swatch = screen.getByTestId('color-swatch');
      expect(swatch).toBeInTheDocument();
      expect(swatch).not.toHaveAttribute('data-transparent');
    });
  });

  describe('given transparent color', () => {
    it('should render swatch with transparency indicator', () => {
      render(() => <ColorSwatch color="#ff000080" />);

      const swatch = screen.getByTestId('color-swatch');
      expect(swatch).toHaveAttribute('data-transparent', 'true');
    });
  });

  describe('given size prop', () => {
    it('should apply sm class for small size', () => {
      render(() => <ColorSwatch color="#ff0000" size="sm" />);

      const swatch = screen.getByTestId('color-swatch');
      expect(swatch.className).toContain('sm');
    });

    it('should apply md class for medium size', () => {
      render(() => <ColorSwatch color="#ff0000" size="md" />);

      const swatch = screen.getByTestId('color-swatch');
      expect(swatch.className).toContain('md');
    });

    it('should apply lg class for large size', () => {
      render(() => <ColorSwatch color="#ff0000" size="lg" />);

      const swatch = screen.getByTestId('color-swatch');
      expect(swatch.className).toContain('lg');
    });

    it('should default to md size when not specified', () => {
      render(() => <ColorSwatch color="#ff0000" />);

      const swatch = screen.getByTestId('color-swatch');
      expect(swatch.className).toContain('md');
    });
  });

  describe('given 3-char hex color', () => {
    it('should render correctly', () => {
      render(() => <ColorSwatch color="#f00" />);

      const swatch = screen.getByTestId('color-swatch');
      expect(swatch).toBeInTheDocument();
    });
  });

  describe('given 6-char hex color', () => {
    it('should render without transparency', () => {
      render(() => <ColorSwatch color="#ff0000" />);

      const swatch = screen.getByTestId('color-swatch');
      expect(swatch).not.toHaveAttribute('data-transparent');
    });
  });
});
