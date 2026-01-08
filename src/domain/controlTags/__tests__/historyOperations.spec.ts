import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  createAddControlTagOperation,
  createDeleteControlTagOperation,
  createEditControlTagIdOperation,
  createEditControlTagNameOperation,
  initControlTagHistoryOperations,
  type RemovedControlTagReference,
} from '../historyOperations';

describe('controlTags historyOperations', () => {
  const mockAddControlTag = vi.fn();
  const mockDeleteControlTag = vi.fn();
  const mockUpdateControlTagName = vi.fn();
  const mockUpdateControlTagId = vi.fn();
  const mockRestoreControlTagReference = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    initControlTagHistoryOperations({
      addControlTag: mockAddControlTag,
      deleteControlTag: mockDeleteControlTag,
      updateControlTagName: mockUpdateControlTagName,
      updateControlTagId: mockUpdateControlTagId,
      restoreControlTagReference: mockRestoreControlTagReference,
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('createAddControlTagOperation', () => {
    it('should create operation with correct type', () => {
      const op = createAddControlTagOperation('Volume', '0');
      expect(op.type).toBe('add-control-tag');
    });

    it('should create operation with description', () => {
      const op = createAddControlTagOperation('Volume', '0');
      expect(op.description).toContain('Volume');
    });

    it('should have timestamp', () => {
      const before = Date.now();
      const op = createAddControlTagOperation('Volume', '0');
      expect(op.timestamp).toBeGreaterThanOrEqual(before);
    });

    it('should call deleteControlTag on undo', () => {
      mockDeleteControlTag.mockReturnValue({ tagId: '0', removedReferences: [] });
      const op = createAddControlTagOperation('Volume', '0');
      op.undo();
      expect(mockDeleteControlTag).toHaveBeenCalledWith('Volume');
    });

    it('should call addControlTag on redo', () => {
      mockDeleteControlTag.mockReturnValue({ tagId: '0', removedReferences: [] });
      const op = createAddControlTagOperation('Volume', '0');
      op.undo();
      op.redo();
      expect(mockAddControlTag).toHaveBeenCalledWith('Volume', '0');
    });

    it('should restore references on redo after undo', () => {
      const refs: RemovedControlTagReference[] = [
        { viewId: 'view-1', attribute: 'control-tag', value: 'Volume' },
      ];
      mockDeleteControlTag.mockReturnValue({ tagId: '0', removedReferences: refs });
      const op = createAddControlTagOperation('Volume', '0');
      op.undo();
      op.redo();
      expect(mockRestoreControlTagReference).toHaveBeenCalledWith('view-1', 'Volume');
    });
  });

  describe('createEditControlTagNameOperation', () => {
    it('should create operation with correct type', () => {
      const op = createEditControlTagNameOperation('Volume', 'MainVolume');
      expect(op.type).toBe('edit-control-tag-name');
    });

    it('should create operation with description', () => {
      const op = createEditControlTagNameOperation('Volume', 'MainVolume');
      expect(op.description).toContain('Volume');
      expect(op.description).toContain('MainVolume');
    });

    it('should call updateControlTagName with swapped args on undo', () => {
      const op = createEditControlTagNameOperation('Volume', 'MainVolume');
      op.undo();
      expect(mockUpdateControlTagName).toHaveBeenCalledWith('MainVolume', 'Volume');
    });

    it('should call updateControlTagName with original args on redo', () => {
      const op = createEditControlTagNameOperation('Volume', 'MainVolume');
      op.redo();
      expect(mockUpdateControlTagName).toHaveBeenCalledWith('Volume', 'MainVolume');
    });
  });

  describe('createEditControlTagIdOperation', () => {
    it('should create operation with correct type', () => {
      const op = createEditControlTagIdOperation('Volume', '0', '10');
      expect(op.type).toBe('edit-control-tag-id');
    });

    it('should create operation with description', () => {
      const op = createEditControlTagIdOperation('Volume', '0', '10');
      expect(op.description).toContain('Volume');
    });

    it('should call updateControlTagId with old value on undo', () => {
      const op = createEditControlTagIdOperation('Volume', '0', '10');
      op.undo();
      expect(mockUpdateControlTagId).toHaveBeenCalledWith('Volume', '0');
    });

    it('should call updateControlTagId with new value on redo', () => {
      const op = createEditControlTagIdOperation('Volume', '0', '10');
      op.redo();
      expect(mockUpdateControlTagId).toHaveBeenCalledWith('Volume', '10');
    });
  });

  describe('createDeleteControlTagOperation', () => {
    it('should create operation with correct type', () => {
      const op = createDeleteControlTagOperation('Volume', '0', []);
      expect(op.type).toBe('delete-control-tag');
    });

    it('should create operation with description', () => {
      const op = createDeleteControlTagOperation('Volume', '0', []);
      expect(op.description).toContain('Volume');
    });

    it('should call addControlTag on undo', () => {
      const op = createDeleteControlTagOperation('Volume', '0', []);
      op.undo();
      expect(mockAddControlTag).toHaveBeenCalledWith('Volume', '0');
    });

    it('should restore references on undo', () => {
      const refs: RemovedControlTagReference[] = [
        { viewId: 'view-1', attribute: 'control-tag', value: 'Volume' },
        { viewId: 'view-2', attribute: 'control-tag', value: 'Volume' },
      ];
      const op = createDeleteControlTagOperation('Volume', '0', refs);
      op.undo();
      expect(mockRestoreControlTagReference).toHaveBeenCalledTimes(2);
      expect(mockRestoreControlTagReference).toHaveBeenCalledWith('view-1', 'Volume');
      expect(mockRestoreControlTagReference).toHaveBeenCalledWith('view-2', 'Volume');
    });

    it('should call deleteControlTag on redo', () => {
      const op = createDeleteControlTagOperation('Volume', '0', []);
      op.redo();
      expect(mockDeleteControlTag).toHaveBeenCalledWith('Volume');
    });
  });
});
