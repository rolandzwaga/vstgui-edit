/**
 * Zoom utility tests
 */
import { describe, expect, test } from 'vitest';
import {
  MIN_ZOOM,
  MAX_ZOOM,
  ZOOM_FACTOR,
  clampZoom,
  calculateNewZoom,
  calculateZoomPanAdjustment,
} from '../zoom';

describe('zoom constants', () => {
  test('MIN_ZOOM is 0.1 (10%)', () => {
    expect(MIN_ZOOM).toBe(0.1);
  });

  test('MAX_ZOOM is 5.0 (500%)', () => {
    expect(MAX_ZOOM).toBe(5.0);
  });

  test('ZOOM_FACTOR is 1.1 (10% per tick)', () => {
    expect(ZOOM_FACTOR).toBe(1.1);
  });
});

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

  test('keeps cursor point stationary when zooming in at center', () => {
    const wrapperRect = createMockRect(0, 0, 800, 600);
    const cursorX = 400; // center
    const cursorY = 300;
    const currentPan = { x: 0, y: 0 };
    const oldZoom = 1.0;
    const newZoom = 2.0;

    const newPan = calculateZoomPanAdjustment(cursorX, cursorY, wrapperRect, currentPan, oldZoom, newZoom);

    // Canvas point under cursor before: (400, 300)
    // After zoom to 2x, to keep same canvas point under cursor:
    // newPan.x = 400 - 400 * 2 = -400
    // newPan.y = 300 - 300 * 2 = -300
    expect(newPan.x).toBeCloseTo(-400);
    expect(newPan.y).toBeCloseTo(-300);
  });

  test('keeps cursor point stationary when zooming out', () => {
    const wrapperRect = createMockRect(0, 0, 800, 600);
    const cursorX = 400;
    const cursorY = 300;
    const currentPan = { x: 0, y: 0 };
    const oldZoom = 2.0;
    const newZoom = 1.0;

    const newPan = calculateZoomPanAdjustment(cursorX, cursorY, wrapperRect, currentPan, oldZoom, newZoom);

    // Canvas point under cursor before: (400/2, 300/2) = (200, 150)
    // After zoom to 1x:
    // newPan.x = 400 - 200 * 1 = 200
    // newPan.y = 300 - 150 * 1 = 150
    expect(newPan.x).toBeCloseTo(200);
    expect(newPan.y).toBeCloseTo(150);
  });

  test('works with existing pan offset', () => {
    const wrapperRect = createMockRect(0, 0, 800, 600);
    const cursorX = 400;
    const cursorY = 300;
    const currentPan = { x: 100, y: 50 };
    const oldZoom = 1.0;
    const newZoom = 2.0;

    const newPan = calculateZoomPanAdjustment(cursorX, cursorY, wrapperRect, currentPan, oldZoom, newZoom);

    // Canvas point under cursor: (400 - 100) / 1 = 300, (300 - 50) / 1 = 250
    // After zoom to 2x:
    // newPan.x = 400 - 300 * 2 = -200
    // newPan.y = 300 - 250 * 2 = -200
    expect(newPan.x).toBeCloseTo(-200);
    expect(newPan.y).toBeCloseTo(-200);
  });

  test('handles cursor at wrapper origin (0, 0)', () => {
    const wrapperRect = createMockRect(100, 100, 800, 600);
    const cursorX = 100; // at wrapper left
    const cursorY = 100; // at wrapper top
    const currentPan = { x: 0, y: 0 };
    const oldZoom = 1.0;
    const newZoom = 2.0;

    const newPan = calculateZoomPanAdjustment(cursorX, cursorY, wrapperRect, currentPan, oldZoom, newZoom);

    // Cursor relative to wrapper: (0, 0)
    // Canvas point: (0, 0)
    // After zoom: pan stays at (0, 0) because we're zooming at origin
    expect(newPan.x).toBeCloseTo(0);
    expect(newPan.y).toBeCloseTo(0);
  });

  test('handles non-origin wrapper position', () => {
    const wrapperRect = createMockRect(200, 150, 800, 600);
    const cursorX = 600; // relative to wrapper: 400
    const cursorY = 450; // relative to wrapper: 300
    const currentPan = { x: 0, y: 0 };
    const oldZoom = 1.0;
    const newZoom = 1.5;

    const newPan = calculateZoomPanAdjustment(cursorX, cursorY, wrapperRect, currentPan, oldZoom, newZoom);

    // Cursor relative: (400, 300)
    // Canvas point: (400, 300)
    // After zoom to 1.5x:
    // newPan.x = 400 - 400 * 1.5 = -200
    // newPan.y = 300 - 300 * 1.5 = -150
    expect(newPan.x).toBeCloseTo(-200);
    expect(newPan.y).toBeCloseTo(-150);
  });

  test('returns pan that keeps point stationary (mathematical verification)', () => {
    const wrapperRect = createMockRect(0, 0, 1000, 800);
    const cursorX = 500;
    const cursorY = 400;
    const currentPan = { x: 50, y: -30 };
    const oldZoom = 1.5;
    const newZoom = 2.5;

    const newPan = calculateZoomPanAdjustment(cursorX, cursorY, wrapperRect, currentPan, oldZoom, newZoom);

    // Verify: the canvas point under cursor should be the same before and after
    // Before: canvasPoint = (cursorRel - pan) / zoom
    const canvasXBefore = (500 - 50) / 1.5;
    const canvasYBefore = (400 - (-30)) / 1.5;

    // After: canvasPoint = (cursorRel - newPan) / newZoom
    const canvasXAfter = (500 - newPan.x) / 2.5;
    const canvasYAfter = (400 - newPan.y) / 2.5;

    expect(canvasXAfter).toBeCloseTo(canvasXBefore);
    expect(canvasYAfter).toBeCloseTo(canvasYBefore);
  });
});
