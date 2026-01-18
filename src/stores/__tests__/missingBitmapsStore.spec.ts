import { afterEach, beforeEach, describe, expect, test } from 'vitest';
import { testInRoot } from '../../__tests__/helpers/solidjs';
import {
  missingBitmapsStore,
  openMissingBitmapsModal,
  closeMissingBitmapsModal,
  setMissingBitmaps,
  markBitmapUploaded,
  markBitmapsUploaded,
  clearUploadedBitmaps,
  removeMissingBitmap,
  resetMissingBitmapsStore,
  hasMissingBitmaps,
  getMissingCount,
  getTotalMissingCount,
  isBitmapMissing,
  getMissingBitmapPath,
  getRemainingMissingNames,
  getRemainingMissingBitmaps,
  openDuplicateWarning,
  closeDuplicateWarning,
  setDuplicateBitmaps,
  clearDuplicateBitmaps,
  hasDuplicateBitmaps,
} from '../missingBitmapsStore';
import type { MissingBitmapInfo, DuplicateBitmapInfo } from '../../domain/bitmaps/missingBitmaps';

describe('missingBitmapsStore', () => {
  beforeEach(() => {
    resetMissingBitmapsStore();
  });

  afterEach(() => {
    resetMissingBitmapsStore();
  });

  describe('modal state', () => {
    test('modal is closed by default', () => {
      testInRoot(() => {
        expect(missingBitmapsStore.isModalOpen).toBe(false);
      });
    });

    test('openMissingBitmapsModal opens the modal', () => {
      testInRoot(() => {
        openMissingBitmapsModal();
        expect(missingBitmapsStore.isModalOpen).toBe(true);
      });
    });

    test('closeMissingBitmapsModal closes the modal', () => {
      testInRoot(() => {
        openMissingBitmapsModal();
        closeMissingBitmapsModal();
        expect(missingBitmapsStore.isModalOpen).toBe(false);
      });
    });
  });

  describe('missing bitmaps management', () => {
    const testBitmaps: MissingBitmapInfo[] = [
      { name: 'knob', path: 'resources/knob.png' },
      { name: 'button', path: 'images/button.png' },
      { name: 'slider', path: 'controls/slider.png' },
    ];

    test('setMissingBitmaps stores bitmap infos', () => {
      testInRoot(() => {
        setMissingBitmaps(testBitmaps);
        expect(missingBitmapsStore.missingBitmaps).toEqual(testBitmaps);
      });
    });

    test('setMissingBitmaps clears uploaded set', () => {
      testInRoot(() => {
        setMissingBitmaps(testBitmaps);
        markBitmapUploaded('knob');

        // Set new missing bitmaps
        setMissingBitmaps([{ name: 'other', path: 'other.png' }]);

        expect(missingBitmapsStore.uploadedBitmaps.size).toBe(0);
      });
    });

    test('markBitmapUploaded adds to uploaded set', () => {
      testInRoot(() => {
        setMissingBitmaps(testBitmaps);
        markBitmapUploaded('knob');

        expect(missingBitmapsStore.uploadedBitmaps.has('knob')).toBe(true);
        expect(missingBitmapsStore.uploadedBitmaps.has('button')).toBe(false);
      });
    });

    test('markBitmapUploaded is idempotent', () => {
      testInRoot(() => {
        setMissingBitmaps(testBitmaps);
        markBitmapUploaded('knob');
        markBitmapUploaded('knob');

        expect(missingBitmapsStore.uploadedBitmaps.size).toBe(1);
      });
    });

    test('markBitmapsUploaded adds multiple at once', () => {
      testInRoot(() => {
        setMissingBitmaps(testBitmaps);
        markBitmapsUploaded(['knob', 'button']);

        expect(missingBitmapsStore.uploadedBitmaps.has('knob')).toBe(true);
        expect(missingBitmapsStore.uploadedBitmaps.has('button')).toBe(true);
        expect(missingBitmapsStore.uploadedBitmaps.has('slider')).toBe(false);
      });
    });

    test('clearUploadedBitmaps clears the uploaded set', () => {
      testInRoot(() => {
        setMissingBitmaps(testBitmaps);
        markBitmapsUploaded(['knob', 'button']);
        clearUploadedBitmaps();

        expect(missingBitmapsStore.uploadedBitmaps.size).toBe(0);
      });
    });

    test('removeMissingBitmap removes from missing list', () => {
      testInRoot(() => {
        setMissingBitmaps(testBitmaps);
        removeMissingBitmap('knob');

        const names = missingBitmapsStore.missingBitmaps.map((b) => b.name);
        expect(names).not.toContain('knob');
        expect(names).toContain('button');
      });
    });
  });

  describe('derived helpers', () => {
    const testBitmaps: MissingBitmapInfo[] = [
      { name: 'knob', path: 'resources/knob.png' },
      { name: 'button', path: 'images/button.png' },
      { name: 'slider', path: 'controls/slider.png' },
    ];

    test('hasMissingBitmaps returns true when bitmaps not uploaded', () => {
      testInRoot(() => {
        setMissingBitmaps(testBitmaps);
        expect(hasMissingBitmaps()).toBe(true);
      });
    });

    test('hasMissingBitmaps returns false when all uploaded', () => {
      testInRoot(() => {
        setMissingBitmaps(testBitmaps);
        markBitmapsUploaded(['knob', 'button', 'slider']);
        expect(hasMissingBitmaps()).toBe(false);
      });
    });

    test('getMissingCount returns count of non-uploaded bitmaps', () => {
      testInRoot(() => {
        setMissingBitmaps(testBitmaps);
        expect(getMissingCount()).toBe(3);

        markBitmapUploaded('knob');
        expect(getMissingCount()).toBe(2);

        markBitmapsUploaded(['button', 'slider']);
        expect(getMissingCount()).toBe(0);
      });
    });

    test('getTotalMissingCount returns total in missing list', () => {
      testInRoot(() => {
        setMissingBitmaps(testBitmaps);
        expect(getTotalMissingCount()).toBe(3);

        // Total doesn't change when marking uploaded
        markBitmapUploaded('knob');
        expect(getTotalMissingCount()).toBe(3);
      });
    });

    test('isBitmapMissing checks specific bitmap status', () => {
      testInRoot(() => {
        setMissingBitmaps(testBitmaps);

        expect(isBitmapMissing('knob')).toBe(true);
        expect(isBitmapMissing('unknown')).toBe(false);

        markBitmapUploaded('knob');
        expect(isBitmapMissing('knob')).toBe(false);
      });
    });

    test('getMissingBitmapPath returns path for missing bitmap', () => {
      testInRoot(() => {
        setMissingBitmaps(testBitmaps);

        expect(getMissingBitmapPath('knob')).toBe('resources/knob.png');
        expect(getMissingBitmapPath('unknown')).toBeUndefined();
      });
    });

    test('getRemainingMissingNames returns names not uploaded', () => {
      testInRoot(() => {
        setMissingBitmaps(testBitmaps);
        markBitmapUploaded('knob');

        const remaining = getRemainingMissingNames();
        expect(remaining).not.toContain('knob');
        expect(remaining).toContain('button');
        expect(remaining).toContain('slider');
      });
    });

    test('getRemainingMissingBitmaps returns full info for non-uploaded', () => {
      testInRoot(() => {
        setMissingBitmaps(testBitmaps);
        markBitmapUploaded('knob');

        const remaining = getRemainingMissingBitmaps();
        expect(remaining).toHaveLength(2);
        expect(remaining.find((b) => b.name === 'button')).toBeDefined();
        expect(remaining.find((b) => b.name === 'knob')).toBeUndefined();
      });
    });
  });

  describe('duplicate bitmaps warning', () => {
    const testDuplicates: DuplicateBitmapInfo[] = [
      { name: 'knob', count: 2, paths: ['knob1.png', 'knob2.png'] },
      { name: 'button', count: 3, paths: ['b1.png', 'b2.png', 'b3.png'] },
    ];

    test('duplicate warning is closed by default', () => {
      testInRoot(() => {
        expect(missingBitmapsStore.isDuplicateWarningOpen).toBe(false);
      });
    });

    test('openDuplicateWarning opens the dialog', () => {
      testInRoot(() => {
        openDuplicateWarning();
        expect(missingBitmapsStore.isDuplicateWarningOpen).toBe(true);
      });
    });

    test('closeDuplicateWarning closes the dialog', () => {
      testInRoot(() => {
        openDuplicateWarning();
        closeDuplicateWarning();
        expect(missingBitmapsStore.isDuplicateWarningOpen).toBe(false);
      });
    });

    test('setDuplicateBitmaps stores duplicates and opens dialog', () => {
      testInRoot(() => {
        setDuplicateBitmaps(testDuplicates);

        expect(missingBitmapsStore.duplicateBitmaps).toEqual(testDuplicates);
        expect(missingBitmapsStore.isDuplicateWarningOpen).toBe(true);
      });
    });

    test('setDuplicateBitmaps with empty array does not open dialog', () => {
      testInRoot(() => {
        setDuplicateBitmaps([]);

        expect(missingBitmapsStore.duplicateBitmaps).toEqual([]);
        expect(missingBitmapsStore.isDuplicateWarningOpen).toBe(false);
      });
    });

    test('clearDuplicateBitmaps clears and closes dialog', () => {
      testInRoot(() => {
        setDuplicateBitmaps(testDuplicates);
        clearDuplicateBitmaps();

        expect(missingBitmapsStore.duplicateBitmaps).toEqual([]);
        expect(missingBitmapsStore.isDuplicateWarningOpen).toBe(false);
      });
    });

    test('hasDuplicateBitmaps returns correct state', () => {
      testInRoot(() => {
        expect(hasDuplicateBitmaps()).toBe(false);

        setDuplicateBitmaps(testDuplicates);
        expect(hasDuplicateBitmaps()).toBe(true);

        clearDuplicateBitmaps();
        expect(hasDuplicateBitmaps()).toBe(false);
      });
    });
  });

  describe('resetMissingBitmapsStore', () => {
    test('resets all state to initial values', () => {
      testInRoot(() => {
        // Set up some state
        openMissingBitmapsModal();
        setMissingBitmaps([{ name: 'test', path: 'test.png' }]);
        markBitmapUploaded('test');
        setDuplicateBitmaps([{ name: 'dup', count: 2, paths: ['d1.png', 'd2.png'] }]);

        // Reset
        resetMissingBitmapsStore();

        expect(missingBitmapsStore.isModalOpen).toBe(false);
        expect(missingBitmapsStore.missingBitmaps).toEqual([]);
        expect(missingBitmapsStore.uploadedBitmaps.size).toBe(0);
        expect(missingBitmapsStore.isDuplicateWarningOpen).toBe(false);
        expect(missingBitmapsStore.duplicateBitmaps).toEqual([]);
      });
    });
  });
});
