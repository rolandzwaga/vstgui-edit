import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { cleanup, render, screen } from '@solidjs/testing-library';
import { MarqueeRectangle } from '../MarqueeRectangle';
import { activateMarquee, beginTracking, resetMarquee, updateMarquee } from '../../../stores/marqueeStore';
import { testInRoot } from '../../../__tests__/helpers/solidjs';

describe('MarqueeRectangle', () => {
  beforeEach(() => {
    testInRoot(() => {
      resetMarquee();
    });
  });

  afterEach(() => {
    cleanup();
  });

  describe('Given marquee is not active', () => {
    it('should not render the rectangle', () => {
      render(() => <MarqueeRectangle />);
      expect(screen.queryByTestId('marquee-rect')).not.toBeInTheDocument();
    });
  });

  describe('Given marquee is active', () => {
    it('should render the rectangle', () => {
      testInRoot(() => {
        beginTracking({ x: 10, y: 10 }, false, new Set(), null);
        activateMarquee();
        updateMarquee({ x: 100, y: 100 });
      });

      render(() => <MarqueeRectangle />);
      expect(screen.getByTestId('marquee-rect')).toBeInTheDocument();
    });

    it('should use normalized coordinates for down-right drag', () => {
      testInRoot(() => {
        beginTracking({ x: 10, y: 20 }, false, new Set(), null);
        activateMarquee();
        updateMarquee({ x: 110, y: 120 });
      });

      render(() => <MarqueeRectangle />);
      const rect = screen.getByTestId('marquee-rect');

      expect(rect.getAttribute('x')).toBe('10');
      expect(rect.getAttribute('y')).toBe('20');
      expect(rect.getAttribute('width')).toBe('100');
      expect(rect.getAttribute('height')).toBe('100');
    });

    it('should use normalized coordinates for up-left drag', () => {
      testInRoot(() => {
        beginTracking({ x: 110, y: 120 }, false, new Set(), null);
        activateMarquee();
        updateMarquee({ x: 10, y: 20 });
      });

      render(() => <MarqueeRectangle />);
      const rect = screen.getByTestId('marquee-rect');

      expect(rect.getAttribute('x')).toBe('10');
      expect(rect.getAttribute('y')).toBe('20');
      expect(rect.getAttribute('width')).toBe('100');
      expect(rect.getAttribute('height')).toBe('100');
    });

    it('should apply the marqueeRect CSS class', () => {
      testInRoot(() => {
        beginTracking({ x: 0, y: 0 }, false, new Set(), null);
        activateMarquee();
        updateMarquee({ x: 50, y: 50 });
      });

      render(() => <MarqueeRectangle />);
      const rect = screen.getByTestId('marquee-rect');

      expect(rect.classList.toString()).toContain('marqueeRect');
    });

    it('should update when currentPoint changes', () => {
      testInRoot(() => {
        beginTracking({ x: 0, y: 0 }, false, new Set(), null);
        activateMarquee();
        updateMarquee({ x: 50, y: 50 });
      });

      render(() => <MarqueeRectangle />);
      let rect = screen.getByTestId('marquee-rect');
      expect(rect.getAttribute('width')).toBe('50');
      expect(rect.getAttribute('height')).toBe('50');

      testInRoot(() => {
        updateMarquee({ x: 100, y: 150 });
      });

      rect = screen.getByTestId('marquee-rect');
      expect(rect.getAttribute('width')).toBe('100');
      expect(rect.getAttribute('height')).toBe('150');
    });
  });
});
