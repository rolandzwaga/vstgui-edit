import { beforeEach, describe, expect, test, vi } from 'vitest';
import type { FontDefinition } from '../../../types/uidesc';
import {
  createAddFontOperation,
  createDeleteFontOperation,
  createEditFontNameOperation,
  createEditFontPropertyOperation,
  initFontHistoryOperations,
} from '../historyOperations';

const mockAddFont = vi.fn();
const mockDeleteFont = vi.fn(() => ({ removedReferences: [] }));
const mockUpdateFontName = vi.fn(() => true);
const mockUpdateFontProperty = vi.fn(() => 'oldValue');
const mockUpdateViewAttribute = vi.fn();

describe('createAddFontOperation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    initFontHistoryOperations(
      mockAddFont,
      mockDeleteFont,
      mockUpdateFontName,
      mockUpdateFontProperty,
      mockUpdateViewAttribute
    );
  });

  const testFont: FontDefinition = {
    'font-name': 'Arial',
    size: '12',
  };

  test('returns operation with correct type', () => {
    const op = createAddFontOperation('TitleFont', testFont);
    expect(op.type).toBe('add-font');
  });

  test('returns operation with descriptive message', () => {
    const op = createAddFontOperation('TitleFont', testFont);
    expect(op.description).toContain('TitleFont');
  });

  test('returns operation with timestamp', () => {
    const before = Date.now();
    const op = createAddFontOperation('TitleFont', testFont);
    const after = Date.now();
    expect(op.timestamp).toBeGreaterThanOrEqual(before);
    expect(op.timestamp).toBeLessThanOrEqual(after);
  });

  test('undo calls deleteFont', () => {
    const op = createAddFontOperation('TitleFont', testFont);
    op.undo();
    expect(mockDeleteFont).toHaveBeenCalledWith('TitleFont');
  });

  test('redo calls addFont', () => {
    const op = createAddFontOperation('TitleFont', testFont);
    op.redo();
    expect(mockAddFont).toHaveBeenCalledWith('TitleFont', testFont);
  });
});

describe('createEditFontNameOperation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    initFontHistoryOperations(
      mockAddFont,
      mockDeleteFont,
      mockUpdateFontName,
      mockUpdateFontProperty,
      mockUpdateViewAttribute
    );
  });

  test('returns operation with correct type', () => {
    const op = createEditFontNameOperation('OldName', 'NewName');
    expect(op.type).toBe('edit-font-name');
  });

  test('returns operation with descriptive message', () => {
    const op = createEditFontNameOperation('OldName', 'NewName');
    expect(op.description).toContain('OldName');
    expect(op.description).toContain('NewName');
  });

  test('undo reverts to old name', () => {
    const op = createEditFontNameOperation('OldName', 'NewName');
    op.undo();
    expect(mockUpdateFontName).toHaveBeenCalledWith('NewName', 'OldName');
  });

  test('redo applies new name', () => {
    const op = createEditFontNameOperation('OldName', 'NewName');
    op.redo();
    expect(mockUpdateFontName).toHaveBeenCalledWith('OldName', 'NewName');
  });
});

describe('createEditFontPropertyOperation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    initFontHistoryOperations(
      mockAddFont,
      mockDeleteFont,
      mockUpdateFontName,
      mockUpdateFontProperty,
      mockUpdateViewAttribute
    );
  });

  test('returns operation with correct type', () => {
    const op = createEditFontPropertyOperation('TitleFont', 'size', '12', '14');
    expect(op.type).toBe('edit-font-property');
  });

  test('returns operation with descriptive message', () => {
    const op = createEditFontPropertyOperation('TitleFont', 'size', '12', '14');
    expect(op.description).toContain('TitleFont');
  });

  test('undo reverts to old value', () => {
    const op = createEditFontPropertyOperation('TitleFont', 'size', '12', '14');
    op.undo();
    expect(mockUpdateFontProperty).toHaveBeenCalledWith('TitleFont', 'size', '12');
  });

  test('redo applies new value', () => {
    const op = createEditFontPropertyOperation('TitleFont', 'size', '12', '14');
    op.redo();
    expect(mockUpdateFontProperty).toHaveBeenCalledWith('TitleFont', 'size', '14');
  });
});

describe('createDeleteFontOperation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    initFontHistoryOperations(
      mockAddFont,
      mockDeleteFont,
      mockUpdateFontName,
      mockUpdateFontProperty,
      mockUpdateViewAttribute
    );
  });

  const testFont: FontDefinition = {
    'font-name': 'Arial',
    size: '12',
    bold: 'true',
  };

  test('returns operation with correct type', () => {
    const op = createDeleteFontOperation('TitleFont', testFont, []);
    expect(op.type).toBe('delete-font');
  });

  test('returns operation with descriptive message', () => {
    const op = createDeleteFontOperation('TitleFont', testFont, []);
    expect(op.description).toContain('TitleFont');
  });

  test('undo restores font', () => {
    const op = createDeleteFontOperation('TitleFont', testFont, []);
    op.undo();
    expect(mockAddFont).toHaveBeenCalledWith('TitleFont', testFont);
  });

  test('undo restores view references', () => {
    const removedRefs = [
      { viewId: 'view1', attribute: 'font', value: '~ TitleFont' },
      { viewId: 'view2', attribute: 'font', value: 'TitleFont' },
    ];
    const op = createDeleteFontOperation('TitleFont', testFont, removedRefs);
    op.undo();
    expect(mockUpdateViewAttribute).toHaveBeenCalledWith('view1', 'font', '~ TitleFont');
    expect(mockUpdateViewAttribute).toHaveBeenCalledWith('view2', 'font', 'TitleFont');
  });

  test('redo calls deleteFont', () => {
    const op = createDeleteFontOperation('TitleFont', testFont, []);
    op.redo();
    expect(mockDeleteFont).toHaveBeenCalledWith('TitleFont');
  });
});
