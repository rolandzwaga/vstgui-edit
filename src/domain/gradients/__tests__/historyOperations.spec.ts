import { beforeEach, describe, expect, test, vi } from 'vitest';
import type { GradientColorStop } from '../../../types/uidesc';
import {
  createAddGradientOperation,
  createDeleteGradientOperation,
  createEditGradientNameOperation,
  createEditGradientStopsOperation,
  initGradientHistoryOperations,
  type RemovedGradientReference,
} from '../historyOperations';

describe('gradient history operations', () => {
  const mockAddGradient = vi.fn();
  const mockDeleteGradient = vi.fn();
  const mockUpdateGradientName = vi.fn();
  const mockUpdateGradientStops = vi.fn();
  const mockUpdateViewAttribute = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    initGradientHistoryOperations(
      mockAddGradient,
      mockDeleteGradient,
      mockUpdateGradientName,
      mockUpdateGradientStops,
      mockUpdateViewAttribute
    );
  });

  describe('createAddGradientOperation', () => {
    const name = 'NewGradient';
    const stops: GradientColorStop[] = [
      { rgba: '#000000FF', start: '0.00' },
      { rgba: '#FFFFFFFF', start: '1.00' },
    ];

    test('creates operation with correct type', () => {
      const op = createAddGradientOperation(name, stops);
      expect(op.type).toBe('add-gradient');
    });

    test('creates operation with description', () => {
      const op = createAddGradientOperation(name, stops);
      expect(op.description).toContain('NewGradient');
    });

    test('creates operation with timestamp', () => {
      const before = Date.now();
      const op = createAddGradientOperation(name, stops);
      expect(op.timestamp).toBeGreaterThanOrEqual(before);
    });

    test('undo calls deleteGradient', () => {
      mockDeleteGradient.mockReturnValue({ removedReferences: [] });
      const op = createAddGradientOperation(name, stops);
      op.undo();
      expect(mockDeleteGradient).toHaveBeenCalledWith(name);
    });

    test('redo calls addGradient', () => {
      mockDeleteGradient.mockReturnValue({ removedReferences: [] });
      const op = createAddGradientOperation(name, stops);
      op.undo();
      op.redo();
      expect(mockAddGradient).toHaveBeenCalledWith(name, stops);
    });

    test('redo restores removed references', () => {
      const refs: RemovedGradientReference[] = [
        { viewId: 'MainView-child', attribute: 'gradient', value: 'NewGradient' },
      ];
      mockDeleteGradient.mockReturnValue({ removedReferences: refs });
      const op = createAddGradientOperation(name, stops);
      op.undo();
      op.redo();
      expect(mockUpdateViewAttribute).toHaveBeenCalledWith(
        'MainView-child',
        'gradient',
        'NewGradient'
      );
    });
  });

  describe('createEditGradientNameOperation', () => {
    const oldName = 'OldName';
    const newName = 'NewName';

    test('creates operation with correct type', () => {
      const op = createEditGradientNameOperation(oldName, newName);
      expect(op.type).toBe('edit-gradient-name');
    });

    test('creates operation with description', () => {
      const op = createEditGradientNameOperation(oldName, newName);
      expect(op.description).toContain('OldName');
      expect(op.description).toContain('NewName');
    });

    test('undo calls updateGradientName with reversed args', () => {
      const op = createEditGradientNameOperation(oldName, newName);
      op.undo();
      expect(mockUpdateGradientName).toHaveBeenCalledWith(newName, oldName);
    });

    test('redo calls updateGradientName with original args', () => {
      const op = createEditGradientNameOperation(oldName, newName);
      op.redo();
      expect(mockUpdateGradientName).toHaveBeenCalledWith(oldName, newName);
    });
  });

  describe('createEditGradientStopsOperation', () => {
    const name = 'MyGradient';
    const oldStops: GradientColorStop[] = [
      { rgba: '#000000FF', start: '0.00' },
      { rgba: '#FFFFFFFF', start: '1.00' },
    ];
    const newStops: GradientColorStop[] = [
      { rgba: '#FF0000FF', start: '0.00' },
      { rgba: '#0000FFFF', start: '0.50' },
      { rgba: '#00FF00FF', start: '1.00' },
    ];

    test('creates operation with correct type', () => {
      const op = createEditGradientStopsOperation(name, oldStops, newStops);
      expect(op.type).toBe('edit-gradient-stops');
    });

    test('creates operation with description', () => {
      const op = createEditGradientStopsOperation(name, oldStops, newStops);
      expect(op.description).toContain('MyGradient');
    });

    test('undo calls updateGradientStops with old stops', () => {
      const op = createEditGradientStopsOperation(name, oldStops, newStops);
      op.undo();
      expect(mockUpdateGradientStops).toHaveBeenCalledWith(name, oldStops);
    });

    test('redo calls updateGradientStops with new stops', () => {
      const op = createEditGradientStopsOperation(name, oldStops, newStops);
      op.redo();
      expect(mockUpdateGradientStops).toHaveBeenCalledWith(name, newStops);
    });
  });

  describe('createDeleteGradientOperation', () => {
    const name = 'DeletedGradient';
    const stops: GradientColorStop[] = [
      { rgba: '#000000FF', start: '0.00' },
      { rgba: '#FFFFFFFF', start: '1.00' },
    ];
    const refs: RemovedGradientReference[] = [
      { viewId: 'MainView-child', attribute: 'gradient', value: 'DeletedGradient' },
    ];

    test('creates operation with correct type', () => {
      const op = createDeleteGradientOperation(name, stops, refs);
      expect(op.type).toBe('delete-gradient');
    });

    test('creates operation with description', () => {
      const op = createDeleteGradientOperation(name, stops, refs);
      expect(op.description).toContain('DeletedGradient');
    });

    test('undo calls addGradient and restores references', () => {
      const op = createDeleteGradientOperation(name, stops, refs);
      op.undo();
      expect(mockAddGradient).toHaveBeenCalledWith(name, stops);
      expect(mockUpdateViewAttribute).toHaveBeenCalledWith(
        'MainView-child',
        'gradient',
        'DeletedGradient'
      );
    });

    test('redo calls deleteGradient', () => {
      const op = createDeleteGradientOperation(name, stops, refs);
      op.redo();
      expect(mockDeleteGradient).toHaveBeenCalledWith(name);
    });
  });
});
