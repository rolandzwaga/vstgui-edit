/**
 * Tests for GuidePreview component
 */
import { describe, test, expect, beforeEach } from 'vitest';
import { render, screen, cleanup } from '@solidjs/testing-library';
import { GuidePreview } from '../GuidePreview';
import {
  resetGuidesStore,
  startCreationDrag,
  updateCreationDrag,
} from '../../../../stores/guidesStore';
import { testInRoot } from '../../../../__tests__/helpers/solidjs';

describe('GuidePreview', () => {
  beforeEach(() => {
    testInRoot(() => {
      resetGuidesStore();
    });
    cleanup();
  });

  test('renders nothing when no creation drag active', () => {
    testInRoot(() => {
      resetGuidesStore();
    });
    const { container } = render(() => (
      <svg data-testid="canvas">
        <GuidePreview canvasWidth={800} canvasHeight={600} />
      </svg>
    ));
    expect(container.querySelector('[data-testid="guide-preview"]')).toBeNull();
  });

  test('renders horizontal line during horizontal creation drag', () => {
    testInRoot(() => {
      resetGuidesStore();
      startCreationDrag('horizontal', 100);
      updateCreationDrag(150, true);
    });

    render(() => (
      <svg data-testid="canvas">
        <GuidePreview canvasWidth={800} canvasHeight={600} />
      </svg>
    ));

    const preview = screen.getByTestId('guide-preview');
    expect(preview).toBeInTheDocument();

    // Should be a horizontal line (x1=0, x2=canvasWidth)
    const line = preview.querySelector('line');
    expect(line).toBeInTheDocument();
    expect(line?.getAttribute('x1')).toBe('0');
    expect(line?.getAttribute('x2')).toBe('800');
  });

  test('renders vertical line during vertical creation drag', () => {
    testInRoot(() => {
      resetGuidesStore();
      startCreationDrag('vertical', 200);
      updateCreationDrag(250, true);
    });

    render(() => (
      <svg data-testid="canvas">
        <GuidePreview canvasWidth={800} canvasHeight={600} />
      </svg>
    ));

    const preview = screen.getByTestId('guide-preview');
    const line = preview.querySelector('line');

    // Should be a vertical line (y1=0, y2=canvasHeight)
    expect(line?.getAttribute('y1')).toBe('0');
    expect(line?.getAttribute('y2')).toBe('600');
  });

  test('follows cursor position during drag', () => {
    testInRoot(() => {
      resetGuidesStore();
      startCreationDrag('horizontal', 100);
      updateCreationDrag(175, true);
    });

    render(() => (
      <svg data-testid="canvas">
        <GuidePreview canvasWidth={800} canvasHeight={600} />
      </svg>
    ));

    const line = screen.getByTestId('guide-preview').querySelector('line');
    // Horizontal line should be at y=175
    expect(line?.getAttribute('y1')).toBe('175');
    expect(line?.getAttribute('y2')).toBe('175');
  });

  test('hidden when no active drag', () => {
    testInRoot(() => {
      resetGuidesStore();
      // No startCreationDrag called
    });

    const { container } = render(() => (
      <svg data-testid="canvas">
        <GuidePreview canvasWidth={800} canvasHeight={600} />
      </svg>
    ));

    expect(container.querySelector('[data-testid="guide-preview"]')).toBeNull();
  });

  test('uses dashed stroke pattern', () => {
    testInRoot(() => {
      resetGuidesStore();
      startCreationDrag('horizontal', 100);
      updateCreationDrag(150, true);
    });

    render(() => (
      <svg data-testid="canvas">
        <GuidePreview canvasWidth={800} canvasHeight={600} />
      </svg>
    ));

    const line = screen.getByTestId('guide-preview').querySelector('line');
    expect(line?.getAttribute('stroke-dasharray')).toBeTruthy();
  });
});
