/**
 * Zoom utility tests
 */
import { describe, expect, test } from 'vitest';
import {
  calculateNewZoom,
  calculateZoomPanAdjustment,
  clampZoom,
  formatZoomPercent,
  MAX_ZOOM,
  MIN_ZOOM,
  ZOOM_FACTOR,
} from '../zoom';

describe('clampZoom', () => {
  test('returns value unchanged when within range', () => {
    expect(clampZoom(1.0)).toBe(1.0);
    expect(clampZoom(2.5)).toBe(2.5);
    expect(clampZoom(0.5)).toBe(0.5);
  });

  test('clamps to MIN_ZOOM when value is below minimum', () => {
    expect(clampZoom(0.05)).toBe(MIN_ZOOM);
    expect(clampZoom(0)).toBe(MIN_ZOOM);
    expect(clampZoom(-1)).toBe(MIN_ZOOM);
  });

  test('clamps to MAX_ZOOM when value is above maximum', () => {
    expect(clampZoom(6.0)).toBe(MAX_ZOOM);
    expect(clampZoom(10.0)).toBe(MAX_ZOOM);
    expect(clampZoom(100)).toBe(MAX_ZOOM);
  });

  test('returns exact boundary values unchanged', () => {
    expect(clampZoom(MIN_ZOOM)).toBe(MIN_ZOOM);
    expect(clampZoom(MAX_ZOOM)).toBe(MAX_ZOOM);
  });
});

describe('calculateNewZoom', () => {
  test('zooms in (multiplies by ZOOM_FACTOR) when deltaY is negative', () => {
    const result = calculateNewZoom(1.0, -100);
    expect(result).toBeCloseTo(1.1);
  });

  test('zooms out (divides by ZOOM_FACTOR) when deltaY is positive', () => {
    const result = calculateNewZoom(1.0, 100);
    expect(result).toBeCloseTo(1.0 / ZOOM_FACTOR);
  });

  test('respects MIN_ZOOM when zooming out past minimum', () => {
    const result = calculateNewZoom(MIN_ZOOM, 100);
    expect(result).toBe(MIN_ZOOM);
  });

  test('respects MAX_ZOOM when zooming in past maximum', () => {
    const result = calculateNewZoom(MAX_ZOOM, -100);
    expect(result).toBe(MAX_ZOOM);
  });

  test('handles deltaY of zero (no change)', () => {
    // deltaY === 0 is not < 0, so it triggers zoom out
    const result = calculateNewZoom(1.0, 0);
    expect(result).toBeCloseTo(1.0 / ZOOM_FACTOR);
  });

  test('accumulates zoom correctly over multiple wheel ticks', () => {
    let zoom = 1.0;
    // Zoom in 3 times
    zoom = calculateNewZoom(zoom, -100);
    zoom = calculateNewZoom(zoom, -100);
    zoom = calculateNewZoom(zoom, -100);
    expect(zoom).toBeCloseTo(1.0 * ZOOM_FACTOR * ZOOM_FACTOR * ZOOM_FACTOR);
  });
});

describe('calculateZoomPanAdjustment', () => {
  // Helper to create a mock DOMRect
  const createMockRect = (x: number, y: number, width: number, height: number): DOMRect => ({
    x,
    y,
    left: x,
    top: y,
    right: x + width,
    bottom: y + height,
    width,
    height,
    toJSON: () => ({}),
  });

  // Top-left anchored zoom: pan offset stays unchanged regardless of cursor position
  // This keeps the canvas origin (0,0) at the same screen position during zoom

  test('returns current pan unchanged when zooming in', () => {
    const wrapperRect = createMockRect(0, 0, 800, 600);
    const cursorX = 400;
    const cursorY = 300;
    const currentPan = { x: 0, y: 0 };
    const oldZoom = 1.0;
    const newZoom = 2.0;

    const newPan = calculateZoomPanAdjustment(cursorX, cursorY, wrapperRect, currentPan, oldZoom, newZoom);

    // Top-left anchored: pan stays the same
    expect(newPan.x).toBe(0);
    expect(newPan.y).toBe(0);
  });

  test('returns current pan unchanged when zooming out', () => {
    const wrapperRect = createMockRect(0, 0, 800, 600);
    const cursorX = 400;
    const cursorY = 300;
    const currentPan = { x: 0, y: 0 };
    const oldZoom = 2.0;
    const newZoom = 1.0;

    const newPan = calculateZoomPanAdjustment(cursorX, cursorY, wrapperRect, currentPan, oldZoom, newZoom);

    // Top-left anchored: pan stays the same
    expect(newPan.x).toBe(0);
    expect(newPan.y).toBe(0);
  });

  test('preserves existing pan offset', () => {
    const wrapperRect = createMockRect(0, 0, 800, 600);
    const cursorX = 400;
    const cursorY = 300;
    const currentPan = { x: 100, y: 50 };
    const oldZoom = 1.0;
    const newZoom = 2.0;

    const newPan = calculateZoomPanAdjustment(cursorX, cursorY, wrapperRect, currentPan, oldZoom, newZoom);

    // Top-left anchored: pan stays the same
    expect(newPan.x).toBe(100);
    expect(newPan.y).toBe(50);
  });

  test('preserves negative pan offset', () => {
    const wrapperRect = createMockRect(0, 0, 800, 600);
    const cursorX = 400;
    const cursorY = 300;
    const currentPan = { x: -200, y: -150 };
    const oldZoom = 1.0;
    const newZoom = 1.5;

    const newPan = calculateZoomPanAdjustment(cursorX, cursorY, wrapperRect, currentPan, oldZoom, newZoom);

    // Top-left anchored: pan stays the same
    expect(newPan.x).toBe(-200);
    expect(newPan.y).toBe(-150);
  });

  test('ignores cursor position (top-left anchored)', () => {
    const wrapperRect = createMockRect(0, 0, 800, 600);
    const currentPan = { x: 50, y: 30 };
    const oldZoom = 1.0;
    const newZoom = 2.0;

    // Different cursor positions should all return the same pan
    const pan1 = calculateZoomPanAdjustment(0, 0, wrapperRect, currentPan, oldZoom, newZoom);
    const pan2 = calculateZoomPanAdjustment(400, 300, wrapperRect, currentPan, oldZoom, newZoom);
    const pan3 = calculateZoomPanAdjustment(800, 600, wrapperRect, currentPan, oldZoom, newZoom);

    expect(pan1.x).toBe(50);
    expect(pan1.y).toBe(30);
    expect(pan2.x).toBe(50);
    expect(pan2.y).toBe(30);
    expect(pan3.x).toBe(50);
    expect(pan3.y).toBe(30);
  });

  test('ignores wrapper rect position (top-left anchored)', () => {
    const currentPan = { x: 75, y: -25 };
    const oldZoom = 1.5;
    const newZoom = 2.5;

    // Different wrapper positions should all return the same pan
    const pan1 = calculateZoomPanAdjustment(500, 400, createMockRect(0, 0, 800, 600), currentPan, oldZoom, newZoom);
    const pan2 = calculateZoomPanAdjustment(500, 400, createMockRect(100, 100, 800, 600), currentPan, oldZoom, newZoom);
    const pan3 = calculateZoomPanAdjustment(500, 400, createMockRect(200, 150, 1000, 800), currentPan, oldZoom, newZoom);

    expect(pan1.x).toBe(75);
    expect(pan1.y).toBe(-25);
    expect(pan2.x).toBe(75);
    expect(pan2.y).toBe(-25);
    expect(pan3.x).toBe(75);
    expect(pan3.y).toBe(-25);
  });
});

describe('formatZoomPercent', () => {
  test('formats 1.0 as "100%"', () => {
    expect(formatZoomPercent(1.0)).toBe('100%');
  });

  test('formats 0.5 as "50%"', () => {
    expect(formatZoomPercent(0.5)).toBe('50%');
  });

  test('formats 2.0 as "200%"', () => {
    expect(formatZoomPercent(2.0)).toBe('200%');
  });

  test('formats MIN_ZOOM (0.1) as "10%"', () => {
    expect(formatZoomPercent(MIN_ZOOM)).toBe('10%');
  });

  test('formats MAX_ZOOM (5.0) as "500%"', () => {
    expect(formatZoomPercent(MAX_ZOOM)).toBe('500%');
  });

  test('rounds to nearest integer percent', () => {
    expect(formatZoomPercent(1.1)).toBe('110%');
    expect(formatZoomPercent(1.15)).toBe('115%');
    expect(formatZoomPercent(0.333)).toBe('33%');
  });

  test('handles fractional zoom levels correctly', () => {
    expect(formatZoomPercent(0.75)).toBe('75%');
    expect(formatZoomPercent(1.25)).toBe('125%');
  });
});
