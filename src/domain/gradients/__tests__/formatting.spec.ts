import { describe, expect, test } from 'vitest';
import { formatStopCount, truncateGradientName } from '../formatting';

describe('truncateGradientName', () => {
  test('returns name unchanged when shorter than maxLength', () => {
    expect(truncateGradientName('Short', 20)).toBe('Short');
  });

  test('returns name unchanged when equal to maxLength', () => {
    expect(truncateGradientName('Exactly20Chars!!!!!!', 20)).toBe('Exactly20Chars!!!!!!');
  });

  test('truncates and adds ellipsis when longer than maxLength', () => {
    expect(truncateGradientName('This is a very long gradient name', 20)).toBe('This is a very lo...');
  });

  test('uses default maxLength of 24', () => {
    const longName = 'This is a very long gradient name that exceeds default';
    expect(truncateGradientName(longName)).toBe('This is a very long g...');
  });

  test('handles empty string', () => {
    expect(truncateGradientName('', 20)).toBe('');
  });

  test('handles maxLength of 3 (minimum for ellipsis)', () => {
    expect(truncateGradientName('Hello', 3)).toBe('...');
  });

  test('handles maxLength less than 3', () => {
    expect(truncateGradientName('Hello', 2)).toBe('..');
  });
});

describe('formatStopCount', () => {
  test('formats singular stop', () => {
    expect(formatStopCount(1)).toBe('1 stop');
  });

  test('formats plural stops', () => {
    expect(formatStopCount(2)).toBe('2 stops');
    expect(formatStopCount(5)).toBe('5 stops');
    expect(formatStopCount(10)).toBe('10 stops');
  });

  test('formats zero stops', () => {
    expect(formatStopCount(0)).toBe('0 stops');
  });
});
