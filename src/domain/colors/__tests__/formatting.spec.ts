import { describe, expect, test } from 'vitest';
import { formatAsRgba, formatAsHex, truncateColorName, formatColorForDisplay } from '../formatting';

describe('formatAsRgba', () => {
  test('formats opaque red', () => {
    expect(formatAsRgba({ r: 255, g: 0, b: 0, a: 255 })).toBe('rgba(255, 0, 0, 1.00)');
  });

  test('formats 50% transparent blue', () => {
    expect(formatAsRgba({ r: 0, g: 0, b: 255, a: 128 })).toBe('rgba(0, 0, 255, 0.50)');
  });

  test('formats fully transparent', () => {
    expect(formatAsRgba({ r: 0, g: 0, b: 0, a: 0 })).toBe('rgba(0, 0, 0, 0.00)');
  });

  test('formats white', () => {
    expect(formatAsRgba({ r: 255, g: 255, b: 255, a: 255 })).toBe('rgba(255, 255, 255, 1.00)');
  });
});

describe('formatAsHex', () => {
  test('formats with alpha by default', () => {
    expect(formatAsHex({ r: 255, g: 0, b: 0, a: 255 })).toBe('#ff0000ff');
  });

  test('formats without alpha when specified', () => {
    expect(formatAsHex({ r: 255, g: 0, b: 0, a: 255 }, false)).toBe('#ff0000');
  });

  test('pads single digit values', () => {
    expect(formatAsHex({ r: 0, g: 15, b: 0, a: 255 })).toBe('#000f00ff');
  });

  test('formats dark gray', () => {
    expect(formatAsHex({ r: 45, g: 45, b: 45, a: 255 })).toBe('#2d2d2dff');
  });
});

describe('truncateColorName', () => {
  test('returns short names unchanged', () => {
    expect(truncateColorName('Background')).toBe('Background');
  });

  test('truncates long names with ellipsis', () => {
    const longName = 'This is a very long color name that exceeds the limit';
    const result = truncateColorName(longName, 30);
    expect(result.length).toBe(30);
    expect(result.endsWith('…')).toBe(true);
  });

  test('handles exactly max length', () => {
    const name = 'A'.repeat(30);
    expect(truncateColorName(name, 30)).toBe(name);
  });

  test('handles custom max length', () => {
    expect(truncateColorName('Background Color', 10)).toBe('Backgroun…');
  });
});

describe('formatColorForDisplay', () => {
  test('converts uppercase to lowercase', () => {
    expect(formatColorForDisplay('#FF0000')).toBe('#ff0000');
  });

  test('preserves lowercase', () => {
    expect(formatColorForDisplay('#ff0000')).toBe('#ff0000');
  });

  test('handles mixed case', () => {
    expect(formatColorForDisplay('#Ff00Aa')).toBe('#ff00aa');
  });
});
