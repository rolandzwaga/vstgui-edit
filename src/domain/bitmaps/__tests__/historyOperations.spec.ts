import { beforeEach, describe, expect, test, vi } from 'vitest';
import type { BitmapDefinition } from '../../../types/uidesc';
import {
  BITMAP_TYPE_PROPERTIES,
  createAddBitmapOperation,
  createBitmapTypeChangeOperation,
  createDeleteBitmapOperation,
  createEditBitmapNameOperation,
  createEditBitmapPropertyOperation,
  getPropertiesToClearForTypeChange,
  initBitmapHistoryOperations,
} from '../historyOperations';

describe('bitmap history operations', () => {
  const mockAddBitmap = vi.fn();
  const mockDeleteBitmap = vi.fn();
  const mockUpdateBitmapName = vi.fn();
  const mockUpdateBitmapProperty = vi.fn();
  const mockUpdateViewAttribute = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    initBitmapHistoryOperations(
      mockAddBitmap,
      mockDeleteBitmap,
      mockUpdateBitmapName,
      mockUpdateBitmapProperty,
      mockUpdateViewAttribute
    );
  });

  describe('createAddBitmapOperation', () => {
    const bitmap: BitmapDefinition = { path: 'images/knob.png' };

    test('creates operation with correct type and description', () => {
      const op = createAddBitmapOperation('myBitmap', bitmap);
      expect(op.type).toBe('add-bitmap');
      expect(op.description).toBe('Add bitmap "myBitmap"');
      expect(op.timestamp).toBeGreaterThan(0);
    });

    test('redo calls addBitmap', () => {
      const op = createAddBitmapOperation('myBitmap', bitmap);
      op.redo();
      expect(mockAddBitmap).toHaveBeenCalledWith('myBitmap', bitmap);
    });

    test('undo calls deleteBitmap', () => {
      mockDeleteBitmap.mockReturnValue({ removedReferences: [] });
      const op = createAddBitmapOperation('myBitmap', bitmap);
      op.undo();
      expect(mockDeleteBitmap).toHaveBeenCalledWith('myBitmap');
    });

    test('redo restores references after undo', () => {
      const refs = [{ viewId: 'main-0', attribute: 'bitmap', value: 'myBitmap' }];
      mockDeleteBitmap.mockReturnValue({ removedReferences: refs });

      const op = createAddBitmapOperation('myBitmap', bitmap);
      op.undo();
      op.redo();

      expect(mockUpdateViewAttribute).toHaveBeenCalledWith('main-0', 'bitmap', 'myBitmap');
    });
  });

  describe('createEditBitmapNameOperation', () => {
    test('creates operation with correct type and description', () => {
      const op = createEditBitmapNameOperation('oldName', 'newName');
      expect(op.type).toBe('edit-bitmap-name');
      expect(op.description).toBe('Rename bitmap "oldName" to "newName"');
    });

    test('redo calls updateBitmapName with old->new', () => {
      const op = createEditBitmapNameOperation('oldName', 'newName');
      op.redo();
      expect(mockUpdateBitmapName).toHaveBeenCalledWith('oldName', 'newName');
    });

    test('undo calls updateBitmapName with new->old', () => {
      const op = createEditBitmapNameOperation('oldName', 'newName');
      op.undo();
      expect(mockUpdateBitmapName).toHaveBeenCalledWith('newName', 'oldName');
    });
  });

  describe('createEditBitmapPropertyOperation', () => {
    test('creates operation with correct type and description', () => {
      const op = createEditBitmapPropertyOperation('myBitmap', 'path', 'old.png', 'new.png');
      expect(op.type).toBe('edit-bitmap-property');
      expect(op.description).toBe('Change path of bitmap "myBitmap"');
    });

    test('redo calls updateBitmapProperty with new value', () => {
      const op = createEditBitmapPropertyOperation('myBitmap', 'path', 'old.png', 'new.png');
      op.redo();
      expect(mockUpdateBitmapProperty).toHaveBeenCalledWith('myBitmap', 'path', 'new.png');
    });

    test('undo calls updateBitmapProperty with old value', () => {
      const op = createEditBitmapPropertyOperation('myBitmap', 'path', 'old.png', 'new.png');
      op.undo();
      expect(mockUpdateBitmapProperty).toHaveBeenCalledWith('myBitmap', 'path', 'old.png');
    });
  });

  describe('createDeleteBitmapOperation', () => {
    const bitmap: BitmapDefinition = { path: 'images/slider.png' };

    test('creates operation with correct type and description', () => {
      const op = createDeleteBitmapOperation('myBitmap', bitmap);
      expect(op.type).toBe('delete-bitmap');
      expect(op.description).toBe('Delete bitmap "myBitmap"');
    });

    test('redo calls deleteBitmap', () => {
      const op = createDeleteBitmapOperation('myBitmap', bitmap);
      op.redo();
      expect(mockDeleteBitmap).toHaveBeenCalledWith('myBitmap');
    });

    test('undo calls addBitmap to restore', () => {
      const op = createDeleteBitmapOperation('myBitmap', bitmap);
      op.undo();
      expect(mockAddBitmap).toHaveBeenCalledWith('myBitmap', bitmap);
    });

    test('undo restores view references', () => {
      const refs = [
        { viewId: 'main-0', attribute: 'bitmap', value: 'myBitmap' },
        { viewId: 'main-1', attribute: 'handle-bitmap', value: 'myBitmap' },
      ];
      const op = createDeleteBitmapOperation('myBitmap', bitmap, refs);
      op.undo();

      expect(mockUpdateViewAttribute).toHaveBeenCalledWith('main-0', 'bitmap', 'myBitmap');
      expect(mockUpdateViewAttribute).toHaveBeenCalledWith('main-1', 'handle-bitmap', 'myBitmap');
    });

    test('handles string bitmap format', () => {
      const op = createDeleteBitmapOperation('myBitmap', 'path/to/bitmap.png');
      op.undo();
      expect(mockAddBitmap).toHaveBeenCalledWith('myBitmap', 'path/to/bitmap.png');
    });
  });

  describe('createBitmapTypeChangeOperation', () => {
    test('creates operation with correct type and description', () => {
      const op = createBitmapTypeChangeOperation({
        bitmapName: 'myBitmap',
        fromType: 'standard',
        toType: 'ninepart',
        clearedProperties: {},
      });
      expect(op.type).toBe('change-bitmap-type');
      expect(op.description).toBe('Change bitmap "myBitmap" from standard to ninepart');
    });

    test('undo restores cleared properties', () => {
      const op = createBitmapTypeChangeOperation({
        bitmapName: 'myBitmap',
        fromType: 'ninepart',
        toType: 'standard',
        clearedProperties: { 'nineparttiled-offsets': '10, 10, 10, 10' },
      });
      op.undo();

      expect(mockUpdateBitmapProperty).toHaveBeenCalledWith(
        'myBitmap',
        'nineparttiled-offsets',
        '10, 10, 10, 10'
      );
    });

    test('undo clears new type properties first', () => {
      const op = createBitmapTypeChangeOperation({
        bitmapName: 'myBitmap',
        fromType: 'standard',
        toType: 'ninepart',
        clearedProperties: {},
      });
      op.undo();

      expect(mockUpdateBitmapProperty).toHaveBeenCalledWith(
        'myBitmap',
        'nineparttiled-offsets',
        ''
      );
    });

    test('redo clears the old type properties again', () => {
      const op = createBitmapTypeChangeOperation({
        bitmapName: 'myBitmap',
        fromType: 'multiframe',
        toType: 'standard',
        clearedProperties: {
          'multiframe-num-frames': '128',
          'multiframe-size': '50, 50',
        },
      });
      op.redo();

      expect(mockUpdateBitmapProperty).toHaveBeenCalledWith(
        'myBitmap',
        'multiframe-num-frames',
        ''
      );
      expect(mockUpdateBitmapProperty).toHaveBeenCalledWith('myBitmap', 'multiframe-size', '');
    });

    test('handles switching from ninepart to multiframe', () => {
      const op = createBitmapTypeChangeOperation({
        bitmapName: 'myBitmap',
        fromType: 'ninepart',
        toType: 'multiframe',
        clearedProperties: { 'nineparttiled-offsets': '5, 5, 5, 5' },
      });

      // On undo, should clear multiframe props and restore ninepart
      op.undo();

      // Should clear multiframe properties
      expect(mockUpdateBitmapProperty).toHaveBeenCalledWith(
        'myBitmap',
        'multiframe-num-frames',
        ''
      );
      expect(mockUpdateBitmapProperty).toHaveBeenCalledWith('myBitmap', 'multiframe-size', '');
      expect(mockUpdateBitmapProperty).toHaveBeenCalledWith(
        'myBitmap',
        'mulitframe-frames-per-row',
        ''
      );

      // Should restore ninepart properties
      expect(mockUpdateBitmapProperty).toHaveBeenCalledWith(
        'myBitmap',
        'nineparttiled-offsets',
        '5, 5, 5, 5'
      );
    });
  });
});

describe('BITMAP_TYPE_PROPERTIES', () => {
  test('standard has no special properties', () => {
    expect(BITMAP_TYPE_PROPERTIES.standard).toEqual([]);
  });

  test('ninepart has nineparttiled-offsets', () => {
    expect(BITMAP_TYPE_PROPERTIES.ninepart).toEqual(['nineparttiled-offsets']);
  });

  test('multiframe has three properties', () => {
    expect(BITMAP_TYPE_PROPERTIES.multiframe).toEqual([
      'multiframe-num-frames',
      'multiframe-size',
      'mulitframe-frames-per-row',
    ]);
  });
});

describe('getPropertiesToClearForTypeChange', () => {
  test('returns empty array for same type', () => {
    expect(getPropertiesToClearForTypeChange('standard', 'standard')).toEqual([]);
    expect(getPropertiesToClearForTypeChange('ninepart', 'ninepart')).toEqual([]);
    expect(getPropertiesToClearForTypeChange('multiframe', 'multiframe')).toEqual([]);
  });

  test('returns ninepart properties when switching from ninepart', () => {
    expect(getPropertiesToClearForTypeChange('ninepart', 'standard')).toEqual([
      'nineparttiled-offsets',
    ]);
    expect(getPropertiesToClearForTypeChange('ninepart', 'multiframe')).toEqual([
      'nineparttiled-offsets',
    ]);
  });

  test('returns multiframe properties when switching from multiframe', () => {
    expect(getPropertiesToClearForTypeChange('multiframe', 'standard')).toEqual([
      'multiframe-num-frames',
      'multiframe-size',
      'mulitframe-frames-per-row',
    ]);
    expect(getPropertiesToClearForTypeChange('multiframe', 'ninepart')).toEqual([
      'multiframe-num-frames',
      'multiframe-size',
      'mulitframe-frames-per-row',
    ]);
  });

  test('returns empty array when switching from standard', () => {
    expect(getPropertiesToClearForTypeChange('standard', 'ninepart')).toEqual([]);
    expect(getPropertiesToClearForTypeChange('standard', 'multiframe')).toEqual([]);
  });
});
