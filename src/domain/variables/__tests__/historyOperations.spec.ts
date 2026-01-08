import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  createAddVariableOperation,
  createDeleteVariableOperation,
  createEditVariableNameOperation,
  createEditVariableValueOperation,
  initVariableHistoryOperations,
  type RemovedVariableReference,
} from '../historyOperations';

describe('variables historyOperations', () => {
  const mockAddVariable = vi.fn();
  const mockDeleteVariable = vi.fn();
  const mockUpdateVariableName = vi.fn();
  const mockUpdateVariableValue = vi.fn();
  const mockRestoreVariableReference = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    initVariableHistoryOperations({
      addVariable: mockAddVariable,
      deleteVariable: mockDeleteVariable,
      updateVariableName: mockUpdateVariableName,
      updateVariableValue: mockUpdateVariableValue,
      restoreVariableReference: mockRestoreVariableReference,
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('createAddVariableOperation', () => {
    it('should create operation with correct type', () => {
      const op = createAddVariableOperation('buttonWidth', '100');
      expect(op.type).toBe('add-variable');
    });

    it('should create operation with description', () => {
      const op = createAddVariableOperation('buttonWidth', '100');
      expect(op.description).toContain('buttonWidth');
    });

    it('should have timestamp', () => {
      const before = Date.now();
      const op = createAddVariableOperation('buttonWidth', '100');
      expect(op.timestamp).toBeGreaterThanOrEqual(before);
    });

    it('should call deleteVariable on undo', () => {
      mockDeleteVariable.mockReturnValue({ value: '100', removedReferences: [] });
      const op = createAddVariableOperation('buttonWidth', '100');
      op.undo();
      expect(mockDeleteVariable).toHaveBeenCalledWith('buttonWidth');
    });

    it('should call addVariable on redo', () => {
      mockDeleteVariable.mockReturnValue({ value: '100', removedReferences: [] });
      const op = createAddVariableOperation('buttonWidth', '100');
      op.undo();
      op.redo();
      expect(mockAddVariable).toHaveBeenCalledWith('buttonWidth', '100');
    });

    it('should restore references on redo after undo', () => {
      const refs: RemovedVariableReference[] = [
        { viewId: 'view-1', attribute: 'size', value: 'var.buttonWidth, 50' },
      ];
      mockDeleteVariable.mockReturnValue({ value: '100', removedReferences: refs });
      const op = createAddVariableOperation('buttonWidth', '100');
      op.undo();
      op.redo();
      expect(mockRestoreVariableReference).toHaveBeenCalledWith('view-1', 'size', 'var.buttonWidth, 50');
    });
  });

  describe('createEditVariableNameOperation', () => {
    it('should create operation with correct type', () => {
      const op = createEditVariableNameOperation('buttonWidth', 'mainButtonWidth');
      expect(op.type).toBe('edit-variable-name');
    });

    it('should create operation with description', () => {
      const op = createEditVariableNameOperation('buttonWidth', 'mainButtonWidth');
      expect(op.description).toContain('buttonWidth');
      expect(op.description).toContain('mainButtonWidth');
    });

    it('should call updateVariableName with swapped args on undo', () => {
      const op = createEditVariableNameOperation('buttonWidth', 'mainButtonWidth');
      op.undo();
      expect(mockUpdateVariableName).toHaveBeenCalledWith('mainButtonWidth', 'buttonWidth');
    });

    it('should call updateVariableName with original args on redo', () => {
      const op = createEditVariableNameOperation('buttonWidth', 'mainButtonWidth');
      op.redo();
      expect(mockUpdateVariableName).toHaveBeenCalledWith('buttonWidth', 'mainButtonWidth');
    });
  });

  describe('createEditVariableValueOperation', () => {
    it('should create operation with correct type', () => {
      const op = createEditVariableValueOperation('buttonWidth', '100', '200');
      expect(op.type).toBe('edit-variable-value');
    });

    it('should create operation with description', () => {
      const op = createEditVariableValueOperation('buttonWidth', '100', '200');
      expect(op.description).toContain('buttonWidth');
    });

    it('should call updateVariableValue with old value on undo', () => {
      const op = createEditVariableValueOperation('buttonWidth', '100', '200');
      op.undo();
      expect(mockUpdateVariableValue).toHaveBeenCalledWith('buttonWidth', '100');
    });

    it('should call updateVariableValue with new value on redo', () => {
      const op = createEditVariableValueOperation('buttonWidth', '100', '200');
      op.redo();
      expect(mockUpdateVariableValue).toHaveBeenCalledWith('buttonWidth', '200');
    });
  });

  describe('createDeleteVariableOperation', () => {
    it('should create operation with correct type', () => {
      const op = createDeleteVariableOperation('buttonWidth', '100', []);
      expect(op.type).toBe('delete-variable');
    });

    it('should create operation with description', () => {
      const op = createDeleteVariableOperation('buttonWidth', '100', []);
      expect(op.description).toContain('buttonWidth');
    });

    it('should call addVariable on undo', () => {
      const op = createDeleteVariableOperation('buttonWidth', '100', []);
      op.undo();
      expect(mockAddVariable).toHaveBeenCalledWith('buttonWidth', '100');
    });

    it('should restore references on undo', () => {
      const refs: RemovedVariableReference[] = [
        { viewId: 'view-1', attribute: 'size', value: 'var.buttonWidth, 50' },
        { viewId: 'view-2', attribute: 'min-size', value: 'var.buttonWidth, 20' },
      ];
      const op = createDeleteVariableOperation('buttonWidth', '100', refs);
      op.undo();
      expect(mockRestoreVariableReference).toHaveBeenCalledTimes(2);
      expect(mockRestoreVariableReference).toHaveBeenCalledWith('view-1', 'size', 'var.buttonWidth, 50');
      expect(mockRestoreVariableReference).toHaveBeenCalledWith('view-2', 'min-size', 'var.buttonWidth, 20');
    });

    it('should call deleteVariable on redo', () => {
      const op = createDeleteVariableOperation('buttonWidth', '100', []);
      op.redo();
      expect(mockDeleteVariable).toHaveBeenCalledWith('buttonWidth');
    });
  });
});
