/**
 * Zoom utility tests
 */
import { describe, expect, test } from 'vitest';
import { MIN_ZOOM, MAX_ZOOM, ZOOM_FACTOR, clampZoom } from '../zoom';

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
