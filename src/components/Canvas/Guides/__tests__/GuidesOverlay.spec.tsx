/**
 * Tests for GuidesOverlay component
 */
import { describe, test, expect, beforeEach } from 'vitest';
import { render, screen, cleanup } from '@solidjs/testing-library';
import { GuidesOverlay } from '../GuidesOverlay';
import {
  addGuide,
  resetGuidesStore,
  setGuidesVisibility,
} from '../../../../stores/guidesStore';
import { testInRoot } from '../../../../__tests__/helpers/solidjs';

describe('GuidesOverlay', () => {
  beforeEach(() => {
    testInRoot(() => {
      resetGuidesStore();
    });
    cleanup();
  });

  describe('basic rendering', () => {
    test('renders container group', () => {
      render(() => (
        <svg data-testid="canvas" width={800} height={600}>
          <GuidesOverlay canvasWidth={800} canvasHeight={600} />
        </svg>
      ));

      const overlay = screen.getByTestId('guides-overlay');
      expect(overlay).toBeInTheDocument();
    });

    test('renders all guides from store', () => {
      testInRoot(() => {
        resetGuidesStore();
        addGuide('horizontal', 100);
        addGuide('vertical', 200);
        addGuide('horizontal', 300);
      });

      render(() => (
        <svg data-testid="canvas" width={800} height={600}>
          <GuidesOverlay canvasWidth={800} canvasHeight={600} />
        </svg>
      ));

      const overlay = screen.getByTestId('guides-overlay');
      const lines = overlay.querySelectorAll('[data-testid^="guide-"]');
      expect(lines).toHaveLength(3);
    });

    test('renders empty when no guides', () => {
      testInRoot(() => {
        resetGuidesStore();
      });

      render(() => (
        <svg data-testid="canvas" width={800} height={600}>
          <GuidesOverlay canvasWidth={800} canvasHeight={600} />
        </svg>
      ));

      const overlay = screen.getByTestId('guides-overlay');
      const lines = overlay.querySelectorAll('[data-testid^="guide-guide"]');
      expect(lines).toHaveLength(0);
    });
  });

  describe('visibility toggle', () => {
    test('hidden when isVisible is false', () => {
      testInRoot(() => {
        resetGuidesStore();
        addGuide('horizontal', 100);
        setGuidesVisibility(false);
      });

      render(() => (
        <svg data-testid="canvas" width={800} height={600}>
          <GuidesOverlay canvasWidth={800} canvasHeight={600} />
        </svg>
      ));

      const overlay = screen.getByTestId('guides-overlay');
      // The overlay should still exist but be hidden (display: none or visibility: hidden)
      // Or the guides inside should not render
      const lines = overlay.querySelectorAll('[data-testid^="guide-guide"]');
      expect(lines).toHaveLength(0);
    });

    test('visible when isVisible is true', () => {
      testInRoot(() => {
        resetGuidesStore();
        addGuide('horizontal', 100);
        setGuidesVisibility(true);
      });

      render(() => (
        <svg data-testid="canvas" width={800} height={600}>
          <GuidesOverlay canvasWidth={800} canvasHeight={600} />
        </svg>
      ));

      const overlay = screen.getByTestId('guides-overlay');
      const lines = overlay.querySelectorAll('[data-testid^="guide-guide"]');
      expect(lines).toHaveLength(1);
    });
  });

  describe('reactive updates', () => {
    test('updates when guide added', () => {
      testInRoot(() => {
        resetGuidesStore();
      });

      render(() => (
        <svg data-testid="canvas" width={800} height={600}>
          <GuidesOverlay canvasWidth={800} canvasHeight={600} />
        </svg>
      ));

      let overlay = screen.getByTestId('guides-overlay');
      expect(overlay.querySelectorAll('[data-testid^="guide-guide"]')).toHaveLength(0);

      testInRoot(() => {
        addGuide('horizontal', 100);
      });

      overlay = screen.getByTestId('guides-overlay');
      expect(overlay.querySelectorAll('[data-testid^="guide-guide"]')).toHaveLength(1);
    });
  });
});
