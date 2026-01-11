/**
 * Tests for historyOperations.ts
 * History operations for Find/Replace undo/redo support.
 */

import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { createReplaceOperation, createReplaceAllOperation } from '../historyOperations';
import type { ReplaceChange } from '../../../types/search';

// Mock documentStore
vi.mock('../../../stores/documentStore', () => ({
  updateViewAttribute: vi.fn(),
  markDirty: vi.fn(),
}));

import { updateViewAttribute, markDirty } from '../../../stores/documentStore';

describe('historyOperations', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('createReplaceOperation', () => {
    const mockChange: ReplaceChange = {
      viewId: 'view-1',
      attributeName: 'background-color',
      oldValue: '#FF0000',
      newValue: '#00FF00',
    };

    it('should return operation with correct type', () => {
      const operation = createReplaceOperation(mockChange);

      expect(operation.type).toBe('property-change');
    });

    it('should have description with attribute name', () => {
      const operation = createReplaceOperation(mockChange);

      expect(operation.description).toBe('Replace background-color');
    });

    it('should have timestamp', () => {
      const before = Date.now();
      const operation = createReplaceOperation(mockChange);
      const after = Date.now();

      expect(operation.timestamp).toBeGreaterThanOrEqual(before);
      expect(operation.timestamp).toBeLessThanOrEqual(after);
    });

    it('should undo by restoring old value', () => {
      const operation = createReplaceOperation(mockChange);

      operation.undo();

      expect(updateViewAttribute).toHaveBeenCalledWith('view-1', 'background-color', '#FF0000');
    });

    it('should redo by applying new value', () => {
      const operation = createReplaceOperation(mockChange);

      operation.redo();

      expect(updateViewAttribute).toHaveBeenCalledWith('view-1', 'background-color', '#00FF00');
    });

    it('should mark dirty on redo', () => {
      const operation = createReplaceOperation(mockChange);

      operation.redo();

      expect(markDirty).toHaveBeenCalled();
    });
  });

  describe('createReplaceAllOperation', () => {
    const mockChanges: ReplaceChange[] = [
      {
        viewId: 'view-1',
        attributeName: 'background-color',
        oldValue: '#FF0000',
        newValue: '#00FF00',
      },
      {
        viewId: 'view-2',
        attributeName: 'background-color',
        oldValue: '#0000FF',
        newValue: '#00FF00',
      },
      {
        viewId: 'view-3',
        attributeName: 'background-color',
        oldValue: '#FFFF00',
        newValue: '#00FF00',
      },
    ];

    it('should return operation with correct type', () => {
      const operation = createReplaceAllOperation(mockChanges, 'background-color');

      expect(operation.type).toBe('property-change');
    });

    it('should have description with attribute name and count', () => {
      const operation = createReplaceAllOperation(mockChanges, 'background-color');

      expect(operation.description).toBe('Replace all background-color (3 views)');
    });

    it('should have timestamp', () => {
      const before = Date.now();
      const operation = createReplaceAllOperation(mockChanges, 'background-color');
      const after = Date.now();

      expect(operation.timestamp).toBeGreaterThanOrEqual(before);
      expect(operation.timestamp).toBeLessThanOrEqual(after);
    });

    it('should undo all changes by restoring old values', () => {
      const operation = createReplaceAllOperation(mockChanges, 'background-color');

      operation.undo();

      expect(updateViewAttribute).toHaveBeenCalledTimes(3);
      expect(updateViewAttribute).toHaveBeenCalledWith('view-1', 'background-color', '#FF0000');
      expect(updateViewAttribute).toHaveBeenCalledWith('view-2', 'background-color', '#0000FF');
      expect(updateViewAttribute).toHaveBeenCalledWith('view-3', 'background-color', '#FFFF00');
    });

    it('should redo all changes by applying new values', () => {
      const operation = createReplaceAllOperation(mockChanges, 'background-color');

      operation.redo();

      expect(updateViewAttribute).toHaveBeenCalledTimes(3);
      expect(updateViewAttribute).toHaveBeenCalledWith('view-1', 'background-color', '#00FF00');
      expect(updateViewAttribute).toHaveBeenCalledWith('view-2', 'background-color', '#00FF00');
      expect(updateViewAttribute).toHaveBeenCalledWith('view-3', 'background-color', '#00FF00');
    });

    it('should mark dirty on redo', () => {
      const operation = createReplaceAllOperation(mockChanges, 'background-color');

      operation.redo();

      expect(markDirty).toHaveBeenCalled();
    });

    it('should handle single change array', () => {
      const singleChange = [mockChanges[0]];
      const operation = createReplaceAllOperation(singleChange, 'background-color');

      expect(operation.description).toBe('Replace all background-color (1 views)');

      operation.undo();
      expect(updateViewAttribute).toHaveBeenCalledWith('view-1', 'background-color', '#FF0000');
    });

    it('should handle empty change array', () => {
      const operation = createReplaceAllOperation([], 'background-color');

      expect(operation.description).toBe('Replace all background-color (0 views)');

      operation.undo();
      expect(updateViewAttribute).not.toHaveBeenCalled();
    });
  });
});
