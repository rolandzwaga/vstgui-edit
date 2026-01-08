import { describe, expect, test } from 'vitest';
import { getBitmapPath, getThumbnailUrl, isEmbeddedBitmap, normalizeBitmap } from '../thumbnail';

describe('normalizeBitmap', () => {
  test('converts string to BitmapDefinition', () => {
    const result = normalizeBitmap('images/knob.png');
    expect(result).toEqual({ path: 'images/knob.png' });
  });

  test('returns BitmapDefinition unchanged', () => {
    const input = { path: 'images/slider.png', 'scale-factor': '2' };
    const result = normalizeBitmap(input);
    expect(result).toBe(input);
  });
});

describe('getBitmapPath', () => {
  test('extracts path from string', () => {
    expect(getBitmapPath('images/icon.png')).toBe('images/icon.png');
  });

  test('extracts path from BitmapDefinition', () => {
    expect(getBitmapPath({ path: 'images/button.png' })).toBe('images/button.png');
  });
});

describe('isEmbeddedBitmap', () => {
  test('returns false for string bitmap', () => {
    expect(isEmbeddedBitmap('images/knob.png')).toBe(false);
  });

  test('returns false for path-only BitmapDefinition', () => {
    expect(isEmbeddedBitmap({ path: 'images/slider.png' })).toBe(false);
  });

  test('returns true for bitmap with base64 data', () => {
    expect(isEmbeddedBitmap({
      path: 'embedded.png',
      data: { encoding: 'base64', data: 'abc123' }
    })).toBe(true);
  });

  test('returns false for BitmapDefinition without data property', () => {
    expect(isEmbeddedBitmap({
      path: 'images/icon.png',
      'scale-factor': '2'
    })).toBe(false);
  });
});

describe('getThumbnailUrl', () => {
  test('returns path for string bitmap', () => {
    expect(getThumbnailUrl('images/knob.png')).toBe('images/knob.png');
  });

  test('returns path for path-only BitmapDefinition', () => {
    expect(getThumbnailUrl({ path: 'images/slider.png' })).toBe('images/slider.png');
  });

  test('returns null for empty path', () => {
    expect(getThumbnailUrl({ path: '' })).toBeNull();
  });

  test('returns null for empty string', () => {
    expect(getThumbnailUrl('')).toBeNull();
  });

  describe('embedded base64 data', () => {
    test('returns data URL for PNG', () => {
      const result = getThumbnailUrl({
        path: 'image.png',
        data: { encoding: 'base64', data: 'abc123' }
      });
      expect(result).toBe('data:image/png;base64,abc123');
    });

    test('returns data URL for JPG', () => {
      const result = getThumbnailUrl({
        path: 'photo.jpg',
        data: { encoding: 'base64', data: 'xyz789' }
      });
      expect(result).toBe('data:image/jpeg;base64,xyz789');
    });

    test('returns data URL for JPEG', () => {
      const result = getThumbnailUrl({
        path: 'photo.jpeg',
        data: { encoding: 'base64', data: 'xyz789' }
      });
      expect(result).toBe('data:image/jpeg;base64,xyz789');
    });

    test('returns data URL for BMP', () => {
      const result = getThumbnailUrl({
        path: 'image.bmp',
        data: { encoding: 'base64', data: 'bmpdata' }
      });
      expect(result).toBe('data:image/bmp;base64,bmpdata');
    });

    test('returns data URL for GIF', () => {
      const result = getThumbnailUrl({
        path: 'animation.gif',
        data: { encoding: 'base64', data: 'gifdata' }
      });
      expect(result).toBe('data:image/gif;base64,gifdata');
    });

    test('defaults to PNG for unknown extension', () => {
      const result = getThumbnailUrl({
        path: 'image.unknown',
        data: { encoding: 'base64', data: 'data' }
      });
      expect(result).toBe('data:image/png;base64,data');
    });

    test('handles uppercase extension', () => {
      const result = getThumbnailUrl({
        path: 'IMAGE.PNG',
        data: { encoding: 'base64', data: 'data' }
      });
      expect(result).toBe('data:image/png;base64,data');
    });
  });
});
