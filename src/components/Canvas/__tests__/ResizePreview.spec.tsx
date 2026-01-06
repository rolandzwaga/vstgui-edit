import { render, cleanup } from '@solidjs/testing-library';
import { describe, expect, it, afterEach, beforeEach } from 'vitest';
import { ResizePreview } from '../ResizePreview';
import { resetResize, startResize, updateResize } from '../../../stores/resizeStore';
import { testInRoot } from '../../../__tests__/helpers/solidjs';

describe('ResizePreview', () => {
  beforeEach(() => {
    testInRoot(() => {
      resetResize();
    });
  });

  afterEach(() => {
    cleanup();
    testInRoot(() => {
      resetResize();
    });
  });

  it('should not render when not resizing', () => {
    const { container } = render(() => (
      <svg>
        <ResizePreview />
      </svg>
    ));

    const preview = container.querySelector('[data-testid="resize-preview"]');
    expect(preview).toBeNull();
  });

  it('should render preview rectangle when resizing', () => {
    testInRoot(() => {
      startResize('se', 'test-view', { x: 100, y: 100 }, { x: 50, y: 50 }, { width: 100, height: 80 });
      updateResize({ x: 120, y: 110 }, false, false);
    });

    const { container } = render(() => (
      <svg>
        <ResizePreview />
      </svg>
    ));

    const preview = container.querySelector('[data-testid="resize-preview"]');
    expect(preview).toBeTruthy();
  });

  it('should show new dimensions based on resize state', () => {
    testInRoot(() => {
      startResize('se', 'test-view', { x: 150, y: 130 }, { x: 50, y: 50 }, { width: 100, height: 80 });
      updateResize({ x: 170, y: 150 }, false, false);
    });

    const { container } = render(() => (
      <svg>
        <ResizePreview />
      </svg>
    ));

    const preview = container.querySelector('[data-testid="resize-preview"]') as SVGRectElement;
    expect(preview).toBeTruthy();
    expect(preview.getAttribute('width')).toBe('120');
    expect(preview.getAttribute('height')).toBe('100');
  });

  it('should update position based on newOrigin', () => {
    testInRoot(() => {
      startResize('nw', 'test-view', { x: 50, y: 50 }, { x: 50, y: 50 }, { width: 100, height: 80 });
      updateResize({ x: 30, y: 30 }, false, false);
    });

    const { container } = render(() => (
      <svg>
        <ResizePreview />
      </svg>
    ));

    const preview = container.querySelector('[data-testid="resize-preview"]') as SVGRectElement;
    expect(preview).toBeTruthy();
    expect(preview.getAttribute('x')).toBe('30');
    expect(preview.getAttribute('y')).toBe('30');
  });

  it('should have a class applied for styling', () => {
    testInRoot(() => {
      startResize('se', 'test-view', { x: 100, y: 100 }, { x: 50, y: 50 }, { width: 100, height: 80 });
    });

    const { container } = render(() => (
      <svg>
        <ResizePreview />
      </svg>
    ));

    const preview = container.querySelector('[data-testid="resize-preview"]');
    expect(preview).toBeTruthy();
    expect(preview?.getAttribute('class')).toBeTruthy();
  });
});
