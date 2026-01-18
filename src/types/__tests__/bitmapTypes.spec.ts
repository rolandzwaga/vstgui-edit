import { describe, expect, test } from 'vitest';
import {
  type BitmapDefinition,
  getBitmapType,
  isMultiframeBitmap,
  isNinePartBitmap,
  isStandardBitmap,
  type MultiframeBitmapDefinition,
  type NinePartBitmapDefinition,
  type StandardBitmapDefinition,
} from '../uidesc';

describe('bitmap type guards', () => {
  // Sample bitmaps for testing
  const stringBitmap = 'resources/knob.png';

  const standardBitmap: StandardBitmapDefinition = {
    path: 'resources/background.png',
  };

  const standardBitmapWithScale: StandardBitmapDefinition = {
    path: 'resources/background.png',
    'scale-factor': '2',
  };

  const ninePartBitmap: NinePartBitmapDefinition = {
    path: 'resources/frame.png',
    'nineparttiled-offsets': '10, 10, 10, 10',
  };

  const multiframeBitmap: MultiframeBitmapDefinition = {
    path: 'resources/knob-strip.png',
    'multiframe-num-frames': '128',
    'multiframe-size': '50, 50',
  };

  const multiframeBitmapWithPerRow: MultiframeBitmapDefinition = {
    path: 'resources/button-strip.png',
    'multiframe-num-frames': '36',
    'multiframe-size': '20, 20',
    'mulitframe-frames-per-row': '6',
  };

  describe('isNinePartBitmap', () => {
    test('returns true for nine-part bitmap', () => {
      expect(isNinePartBitmap(ninePartBitmap)).toBe(true);
    });

    test('returns false for string bitmap', () => {
      expect(isNinePartBitmap(stringBitmap)).toBe(false);
    });

    test('returns false for standard bitmap', () => {
      expect(isNinePartBitmap(standardBitmap)).toBe(false);
    });

    test('returns false for multiframe bitmap', () => {
      expect(isNinePartBitmap(multiframeBitmap)).toBe(false);
    });
  });

  describe('isMultiframeBitmap', () => {
    test('returns true for multiframe bitmap', () => {
      expect(isMultiframeBitmap(multiframeBitmap)).toBe(true);
    });

    test('returns true for multiframe bitmap with frames-per-row', () => {
      expect(isMultiframeBitmap(multiframeBitmapWithPerRow)).toBe(true);
    });

    test('returns false for string bitmap', () => {
      expect(isMultiframeBitmap(stringBitmap)).toBe(false);
    });

    test('returns false for standard bitmap', () => {
      expect(isMultiframeBitmap(standardBitmap)).toBe(false);
    });

    test('returns false for nine-part bitmap', () => {
      expect(isMultiframeBitmap(ninePartBitmap)).toBe(false);
    });

    test('returns false if only num-frames is present', () => {
      const partial = { path: 'test.png', 'multiframe-num-frames': '10' };
      expect(isMultiframeBitmap(partial as BitmapDefinition)).toBe(false);
    });

    test('returns false if only size is present', () => {
      const partial = { path: 'test.png', 'multiframe-size': '10, 10' };
      expect(isMultiframeBitmap(partial as BitmapDefinition)).toBe(false);
    });
  });

  describe('isStandardBitmap', () => {
    test('returns true for standard bitmap', () => {
      expect(isStandardBitmap(standardBitmap)).toBe(true);
    });

    test('returns true for standard bitmap with scale-factor', () => {
      expect(isStandardBitmap(standardBitmapWithScale)).toBe(true);
    });

    test('returns false for string bitmap', () => {
      expect(isStandardBitmap(stringBitmap)).toBe(false);
    });

    test('returns false for nine-part bitmap', () => {
      expect(isStandardBitmap(ninePartBitmap)).toBe(false);
    });

    test('returns false for multiframe bitmap', () => {
      expect(isStandardBitmap(multiframeBitmap)).toBe(false);
    });
  });

  describe('getBitmapType', () => {
    test('returns "standard" for string bitmap', () => {
      expect(getBitmapType(stringBitmap)).toBe('standard');
    });

    test('returns "standard" for standard bitmap object', () => {
      expect(getBitmapType(standardBitmap)).toBe('standard');
    });

    test('returns "standard" for standard bitmap with scale-factor', () => {
      expect(getBitmapType(standardBitmapWithScale)).toBe('standard');
    });

    test('returns "ninepart" for nine-part bitmap', () => {
      expect(getBitmapType(ninePartBitmap)).toBe('ninepart');
    });

    test('returns "multiframe" for multiframe bitmap', () => {
      expect(getBitmapType(multiframeBitmap)).toBe('multiframe');
    });

    test('returns "multiframe" for multiframe bitmap with frames-per-row', () => {
      expect(getBitmapType(multiframeBitmapWithPerRow)).toBe('multiframe');
    });
  });
});
