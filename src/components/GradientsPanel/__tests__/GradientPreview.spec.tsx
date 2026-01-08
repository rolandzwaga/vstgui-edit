import { describe, expect, it } from 'vitest';
import { render, screen } from '@solidjs/testing-library';
import type { GradientColorStop } from '../../../types/uidesc';
import { GradientPreview } from '../GradientPreview';

describe('GradientPreview', () => {
  const twoStopGradient: GradientColorStop[] = [
    { rgba: '#000000FF', start: '0.00' },
    { rgba: '#FFFFFFFF', start: '1.00' },
  ];

  const threeStopGradient: GradientColorStop[] = [
    { rgba: '#FF0000FF', start: '0.00' },
    { rgba: '#00FF00FF', start: '0.50' },
    { rgba: '#0000FFFF', start: '1.00' },
  ];

  describe('given two-stop gradient', () => {
    it('should render preview container', () => {
      render(() => <GradientPreview stops={twoStopGradient} />);

      expect(screen.getByTestId('gradient-preview')).toBeInTheDocument();
    });

    it('should apply gradient background', () => {
      render(() => <GradientPreview stops={twoStopGradient} />);

      const preview = screen.getByTestId('gradient-preview');
      const style = window.getComputedStyle(preview);
      expect(style.background).toContain('linear-gradient');
    });
  });

  describe('given three-stop gradient', () => {
    it('should render preview', () => {
      render(() => <GradientPreview stops={threeStopGradient} />);

      expect(screen.getByTestId('gradient-preview')).toBeInTheDocument();
    });
  });

  describe('given empty stops', () => {
    it('should render with fallback', () => {
      render(() => <GradientPreview stops={[]} />);

      expect(screen.getByTestId('gradient-preview')).toBeInTheDocument();
    });
  });

  describe('given single stop', () => {
    it('should render solid color', () => {
      const singleStop: GradientColorStop[] = [{ rgba: '#FF0000FF', start: '0.50' }];
      render(() => <GradientPreview stops={singleStop} />);

      expect(screen.getByTestId('gradient-preview')).toBeInTheDocument();
    });
  });

  describe('given custom size', () => {
    it('should apply custom width and height', () => {
      render(() => <GradientPreview stops={twoStopGradient} width={100} height={30} />);

      const preview = screen.getByTestId('gradient-preview');
      expect(preview).toHaveStyle({ width: '100px', height: '30px' });
    });
  });

  describe('given unsorted stops', () => {
    it('should render correctly', () => {
      const unsorted: GradientColorStop[] = [
        { rgba: '#FFFFFFFF', start: '1.00' },
        { rgba: '#000000FF', start: '0.00' },
      ];
      render(() => <GradientPreview stops={unsorted} />);

      expect(screen.getByTestId('gradient-preview')).toBeInTheDocument();
    });
  });
});
