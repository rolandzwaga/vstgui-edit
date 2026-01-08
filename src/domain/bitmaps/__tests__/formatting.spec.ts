import { describe, expect, test } from 'vitest';
import { formatBitmapForDisplay, truncateBitmapName, truncatePath } from '../formatting';

describe('truncateBitmapName', () => {
  test('returns name unchanged if within limit', () => {
    expect(truncateBitmapName('ShortName')).toBe('ShortName');
  });

  test('truncates name exceeding default limit', () => {
    const longName = 'ThisIsAVeryLongBitmapNameThatExceedsLimit';
    const result = truncateBitmapName(longName);
    expect(result.length).toBe(30);
    expect(result.endsWith('…')).toBe(true);
  });

  test('uses custom maxLength', () => {
    const result = truncateBitmapName('LongerName', 8);
    expect(result).toBe('LongerN…');
    expect(result.length).toBe(8);
  });

  test('handles exactly maxLength characters', () => {
    const exactlyThirty = 'Exactly30CharacterNameHere!!';
    expect(exactlyThirty.length).toBe(28);
    expect(truncateBitmapName(exactlyThirty, 28)).toBe(exactlyThirty);
  });
});

describe('truncatePath', () => {
  test('returns path unchanged if within limit', () => {
    expect(truncatePath('images/icon.png')).toBe('images/icon.png');
  });

  test('truncates path exceeding default limit', () => {
    const longPath = 'very/long/path/to/some/deeply/nested/directory/with/image/file.png';
    const result = truncatePath(longPath);
    expect(result.length).toBe(40);
    expect(result.endsWith('…')).toBe(true);
  });

  test('uses custom maxLength', () => {
    const result = truncatePath('path/to/file.png', 10);
    expect(result).toBe('path/to/f…');
    expect(result.length).toBe(10);
  });

  test('handles empty path', () => {
    expect(truncatePath('')).toBe('');
  });
});

describe('formatBitmapForDisplay', () => {
  test('returns path for string bitmap', () => {
    expect(formatBitmapForDisplay('images/knob.png')).toBe('images/knob.png');
  });

  test('returns path from BitmapDefinition object', () => {
    expect(formatBitmapForDisplay({ path: 'images/slider.png' })).toBe('images/slider.png');
  });

  test('returns path from BitmapDefinition with extra properties', () => {
    expect(formatBitmapForDisplay({
      path: 'images/button.png',
      'scale-factor': '2',
      'nineparttiled-offsets': '10, 10, 10, 10'
    })).toBe('images/button.png');
  });

  test('returns embedded indicator for base64 bitmap', () => {
    expect(formatBitmapForDisplay({
      path: 'embedded.png',
      data: { encoding: 'base64', data: 'abc123' }
    })).toBe('[embedded]');
  });
});
