import { describe, expect, test } from 'vitest';
import type { GradientColorStop } from '../../../types/uidesc';
import {
  getColorAtPosition,
  interpolateColor,
  normalizePosition,
  sortStops,
} from '../stopCalculations';

describe('normalizePosition', () => {
  test('clamps value below 0 to 0', () => {
    expect(normalizePosition(-0.5)).toBe(0);
    expect(normalizePosition(-1)).toBe(0);
  });

  test('clamps value above 1 to 1', () => {
    expect(normalizePosition(1.5)).toBe(1);
    expect(normalizePosition(2)).toBe(1);
  });

  test('returns value unchanged when in valid range', () => {
    expect(normalizePosition(0)).toBe(0);
    expect(normalizePosition(0.5)).toBe(0.5);
    expect(normalizePosition(1)).toBe(1);
  });

  test('handles edge cases', () => {
    expect(normalizePosition(0.001)).toBe(0.001);
    expect(normalizePosition(0.999)).toBe(0.999);
  });
});

describe('sortStops', () => {
  test('sorts stops by position ascending', () => {
    const stops: GradientColorStop[] = [
      { rgba: '#FF0000FF', start: '0.75' },
      { rgba: '#00FF00FF', start: '0.25' },
      { rgba: '#0000FFFF', start: '0.50' },
    ];
    const sorted = sortStops(stops);
    expect(sorted[0].start).toBe('0.25');
    expect(sorted[1].start).toBe('0.50');
    expect(sorted[2].start).toBe('0.75');
  });

  test('does not mutate original array', () => {
    const stops: GradientColorStop[] = [
      { rgba: '#FF0000FF', start: '1.00' },
      { rgba: '#00FF00FF', start: '0.00' },
    ];
    const original = [...stops];
    sortStops(stops);
    expect(stops).toEqual(original);
  });

  test('handles already sorted stops', () => {
    const stops: GradientColorStop[] = [
      { rgba: '#000000FF', start: '0.00' },
      { rgba: '#FFFFFFFF', start: '1.00' },
    ];
    const sorted = sortStops(stops);
    expect(sorted[0].start).toBe('0.00');
    expect(sorted[1].start).toBe('1.00');
  });

  test('handles single stop', () => {
    const stops: GradientColorStop[] = [{ rgba: '#FF0000FF', start: '0.50' }];
    const sorted = sortStops(stops);
    expect(sorted).toHaveLength(1);
    expect(sorted[0].start).toBe('0.50');
  });

  test('handles empty array', () => {
    const sorted = sortStops([]);
    expect(sorted).toEqual([]);
  });
});

describe('interpolateColor', () => {
  test('returns color1 at t=0', () => {
    const result = interpolateColor('#000000FF', '#FFFFFFFF', 0);
    expect(result).toBe('#000000FF');
  });

  test('returns color2 at t=1', () => {
    const result = interpolateColor('#000000FF', '#FFFFFFFF', 1);
    expect(result).toBe('#FFFFFFFF');
  });

  test('interpolates midpoint correctly', () => {
    const result = interpolateColor('#000000FF', '#FFFFFFFF', 0.5);
    expect(result).toBe('#808080FF');
  });

  test('interpolates red channel', () => {
    const result = interpolateColor('#000000FF', '#FF0000FF', 0.5);
    expect(result).toBe('#800000FF');
  });

  test('interpolates green channel', () => {
    const result = interpolateColor('#000000FF', '#00FF00FF', 0.5);
    expect(result).toBe('#008000FF');
  });

  test('interpolates blue channel', () => {
    const result = interpolateColor('#000000FF', '#0000FFFF', 0.5);
    expect(result).toBe('#000080FF');
  });

  test('interpolates alpha channel', () => {
    const result = interpolateColor('#00000000', '#000000FF', 0.5);
    expect(result).toBe('#00000080');
  });

  test('clamps t below 0', () => {
    const result = interpolateColor('#000000FF', '#FFFFFFFF', -0.5);
    expect(result).toBe('#000000FF');
  });

  test('clamps t above 1', () => {
    const result = interpolateColor('#000000FF', '#FFFFFFFF', 1.5);
    expect(result).toBe('#FFFFFFFF');
  });
});

describe('getColorAtPosition', () => {
  const twoStopGradient: GradientColorStop[] = [
    { rgba: '#000000FF', start: '0.00' },
    { rgba: '#FFFFFFFF', start: '1.00' },
  ];

  test('returns first stop color at position 0', () => {
    expect(getColorAtPosition(twoStopGradient, 0)).toBe('#000000FF');
  });

  test('returns last stop color at position 1', () => {
    expect(getColorAtPosition(twoStopGradient, 1)).toBe('#FFFFFFFF');
  });

  test('interpolates at midpoint', () => {
    expect(getColorAtPosition(twoStopGradient, 0.5)).toBe('#808080FF');
  });

  test('handles position before first stop', () => {
    const stops: GradientColorStop[] = [
      { rgba: '#FF0000FF', start: '0.25' },
      { rgba: '#0000FFFF', start: '0.75' },
    ];
    expect(getColorAtPosition(stops, 0)).toBe('#FF0000FF');
  });

  test('handles position after last stop', () => {
    const stops: GradientColorStop[] = [
      { rgba: '#FF0000FF', start: '0.25' },
      { rgba: '#0000FFFF', start: '0.75' },
    ];
    expect(getColorAtPosition(stops, 1)).toBe('#0000FFFF');
  });

  test('handles multi-stop gradient', () => {
    const stops: GradientColorStop[] = [
      { rgba: '#FF0000FF', start: '0.00' },
      { rgba: '#00FF00FF', start: '0.50' },
      { rgba: '#0000FFFF', start: '1.00' },
    ];
    expect(getColorAtPosition(stops, 0.25)).toBe('#808000FF');
    expect(getColorAtPosition(stops, 0.75)).toBe('#008080FF');
  });

  test('handles unsorted stops', () => {
    const stops: GradientColorStop[] = [
      { rgba: '#FFFFFFFF', start: '1.00' },
      { rgba: '#000000FF', start: '0.00' },
    ];
    expect(getColorAtPosition(stops, 0.5)).toBe('#808080FF');
  });

  test('returns empty string for empty stops', () => {
    expect(getColorAtPosition([], 0.5)).toBe('');
  });

  test('returns single stop color for any position', () => {
    const stops: GradientColorStop[] = [{ rgba: '#FF0000FF', start: '0.50' }];
    expect(getColorAtPosition(stops, 0)).toBe('#FF0000FF');
    expect(getColorAtPosition(stops, 0.5)).toBe('#FF0000FF');
    expect(getColorAtPosition(stops, 1)).toBe('#FF0000FF');
  });
});
