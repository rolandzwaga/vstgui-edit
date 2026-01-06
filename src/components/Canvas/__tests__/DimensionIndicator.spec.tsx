import { render, cleanup } from '@solidjs/testing-library';
import { describe, expect, it, afterEach, beforeEach } from 'vitest';
import { DimensionIndicator } from '../DimensionIndicator';
import { resetResize, startResize, updateResize } from '../../../stores/resizeStore';
import { testInRoot } from '../../../__tests__/helpers/solidjs';

describe('DimensionIndicator', () => {
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
    const { container } = render(() => <DimensionIndicator />);

    const indicator = container.querySelector('[data-testid="dimension-indicator"]');
    expect(indicator).toBeNull();
  });

  it('should render when resizing', () => {
    testInRoot(() => {
      startResize('se', 'test-view', { x: 100, y: 100 }, { x: 50, y: 50 }, { width: 100, height: 80 });
      updateResize({ x: 120, y: 110 }, false, false);
    });

    const { container } = render(() => <DimensionIndicator />);

    const indicator = container.querySelector('[data-testid="dimension-indicator"]');
    expect(indicator).toBeTruthy();
  });

  it('should display dimensions in "width × height" format', () => {
    testInRoot(() => {
      startResize('se', 'test-view', { x: 150, y: 130 }, { x: 50, y: 50 }, { width: 100, height: 80 });
      updateResize({ x: 170, y: 150 }, false, false);
    });

    const { container } = render(() => <DimensionIndicator />);

    const indicator = container.querySelector('[data-testid="dimension-indicator"]');
    expect(indicator?.textContent).toBe('120 × 100');
  });

  it('should round dimensions to whole numbers', () => {
    testInRoot(() => {
      startResize('se', 'test-view', { x: 150, y: 130 }, { x: 50, y: 50 }, { width: 100, height: 80 });
      updateResize({ x: 155.7, y: 138.3 }, false, false);
    });

    const { container } = render(() => <DimensionIndicator />);

    const indicator = container.querySelector('[data-testid="dimension-indicator"]');
    expect(indicator?.textContent).toMatch(/^\d+ × \d+$/);
  });

  it('should position near the resize handle', () => {
    testInRoot(() => {
      startResize('se', 'test-view', { x: 150, y: 130 }, { x: 50, y: 50 }, { width: 100, height: 80 });
      updateResize({ x: 170, y: 150 }, false, false);
    });

    const { container } = render(() => <DimensionIndicator />);

    const indicator = container.querySelector('[data-testid="dimension-indicator"]') as HTMLElement;
    expect(indicator).toBeTruthy();
    expect(indicator.style.left).toBeTruthy();
    expect(indicator.style.top).toBeTruthy();
  });

  it('should update dimensions as resize changes', () => {
    testInRoot(() => {
      startResize('se', 'test-view', { x: 150, y: 130 }, { x: 50, y: 50 }, { width: 100, height: 80 });
      updateResize({ x: 160, y: 140 }, false, false);
    });

    const { container } = render(() => <DimensionIndicator />);
    let indicator = container.querySelector('[data-testid="dimension-indicator"]');
    const firstContent = indicator?.textContent;

    testInRoot(() => {
      updateResize({ x: 180, y: 160 }, false, false);
    });

    indicator = container.querySelector('[data-testid="dimension-indicator"]');
    const secondContent = indicator?.textContent;

    expect(firstContent).not.toBe(secondContent);
  });
});
