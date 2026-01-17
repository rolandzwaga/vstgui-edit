/**
 * Tests for guide historyOperations domain functions
 */
import { describe, expect, test, vi } from 'vitest';
import type { CustomGuide } from '../../../types/guides';
import {
  createGuideClearAllOperation,
  createGuideCreateOperation,
  createGuideDeleteOperation,
  createGuideRepositionOperation,
  formatGuideClearAllDescription,
  formatGuideCreateDescription,
  formatGuideDeleteDescription,
  formatGuideRepositionDescription,
} from '../historyOperations';

describe('historyOperations', () => {
  describe('createGuideCreateOperation', () => {
    const guide: CustomGuide = { id: 'g1', orientation: 'horizontal', position: 100 };
    const addFn = vi.fn();
    const deleteFn = vi.fn();

    test('returns operation with correct type', () => {
      const op = createGuideCreateOperation(guide, addFn, deleteFn);
      expect(op.type).toBe('guide-create');
    });

    test('returns operation with description', () => {
      const op = createGuideCreateOperation(guide, addFn, deleteFn);
      expect(op.description).toBeTruthy();
      expect(op.description).toContain('horizontal');
    });

    test('undo deletes the guide', () => {
      const op = createGuideCreateOperation(guide, addFn, deleteFn);
      op.undo();
      expect(deleteFn).toHaveBeenCalledWith('g1');
    });

    test('redo re-adds the guide', () => {
      const op = createGuideCreateOperation(guide, addFn, deleteFn);
      op.redo();
      expect(addFn).toHaveBeenCalledWith('horizontal', 100);
    });

    test('has timestamp', () => {
      const before = Date.now();
      const op = createGuideCreateOperation(guide, addFn, deleteFn);
      const after = Date.now();
      expect(op.timestamp).toBeGreaterThanOrEqual(before);
      expect(op.timestamp).toBeLessThanOrEqual(after);
    });
  });

  describe('createGuideDeleteOperation', () => {
    const guide: CustomGuide = { id: 'g1', orientation: 'vertical', position: 200 };
    const addFn = vi.fn();
    const deleteFn = vi.fn();

    test('returns operation with correct type', () => {
      const op = createGuideDeleteOperation(guide, addFn, deleteFn);
      expect(op.type).toBe('guide-delete');
    });

    test('returns operation with description', () => {
      const op = createGuideDeleteOperation(guide, addFn, deleteFn);
      expect(op.description).toBeTruthy();
      expect(op.description).toContain('vertical');
    });

    test('undo re-adds the guide', () => {
      const op = createGuideDeleteOperation(guide, addFn, deleteFn);
      op.undo();
      expect(addFn).toHaveBeenCalledWith('vertical', 200);
    });

    test('redo deletes the guide', () => {
      const op = createGuideDeleteOperation(guide, addFn, deleteFn);
      op.redo();
      expect(deleteFn).toHaveBeenCalledWith('g1');
    });

    test('has timestamp', () => {
      const before = Date.now();
      const op = createGuideDeleteOperation(guide, addFn, deleteFn);
      const after = Date.now();
      expect(op.timestamp).toBeGreaterThanOrEqual(before);
      expect(op.timestamp).toBeLessThanOrEqual(after);
    });
  });

  describe('createGuideRepositionOperation', () => {
    const guide: CustomGuide = { id: 'g1', orientation: 'horizontal', position: 150 };
    const repositionFn = vi.fn();

    test('returns operation with correct type', () => {
      const op = createGuideRepositionOperation(guide, 100, 150, repositionFn);
      expect(op.type).toBe('guide-reposition');
    });

    test('returns operation with description', () => {
      const op = createGuideRepositionOperation(guide, 100, 150, repositionFn);
      expect(op.description).toBeTruthy();
      expect(op.description).toContain('horizontal');
    });

    test('undo restores old position', () => {
      const op = createGuideRepositionOperation(guide, 100, 150, repositionFn);
      op.undo();
      expect(repositionFn).toHaveBeenCalledWith('g1', 100);
    });

    test('redo applies new position', () => {
      const op = createGuideRepositionOperation(guide, 100, 150, repositionFn);
      op.redo();
      expect(repositionFn).toHaveBeenCalledWith('g1', 150);
    });

    test('has timestamp', () => {
      const before = Date.now();
      const op = createGuideRepositionOperation(guide, 100, 150, repositionFn);
      const after = Date.now();
      expect(op.timestamp).toBeGreaterThanOrEqual(before);
      expect(op.timestamp).toBeLessThanOrEqual(after);
    });
  });

  describe('createGuideClearAllOperation', () => {
    const guides: CustomGuide[] = [
      { id: 'g1', orientation: 'horizontal', position: 100 },
      { id: 'g2', orientation: 'vertical', position: 200 },
    ];
    const addFn = vi.fn();
    const clearFn = vi.fn();

    test('returns operation with correct type', () => {
      const op = createGuideClearAllOperation(guides, addFn, clearFn);
      expect(op.type).toBe('guide-clear-all');
    });

    test('returns operation with description', () => {
      const op = createGuideClearAllOperation(guides, addFn, clearFn);
      expect(op.description).toBeTruthy();
      expect(op.description).toContain('2');
    });

    test('undo restores all guides', () => {
      const op = createGuideClearAllOperation(guides, addFn, clearFn);
      op.undo();
      expect(addFn).toHaveBeenCalledTimes(2);
      expect(addFn).toHaveBeenCalledWith('horizontal', 100);
      expect(addFn).toHaveBeenCalledWith('vertical', 200);
    });

    test('redo clears all guides', () => {
      const op = createGuideClearAllOperation(guides, addFn, clearFn);
      op.redo();
      expect(clearFn).toHaveBeenCalled();
    });

    test('has timestamp', () => {
      const before = Date.now();
      const op = createGuideClearAllOperation(guides, addFn, clearFn);
      const after = Date.now();
      expect(op.timestamp).toBeGreaterThanOrEqual(before);
      expect(op.timestamp).toBeLessThanOrEqual(after);
    });
  });

  describe('description formatters', () => {
    describe('formatGuideCreateDescription', () => {
      test('formats horizontal guide', () => {
        const guide: CustomGuide = { id: 'g1', orientation: 'horizontal', position: 100 };
        const desc = formatGuideCreateDescription(guide);
        expect(desc).toContain('horizontal');
        expect(desc).toContain('100');
      });

      test('formats vertical guide', () => {
        const guide: CustomGuide = { id: 'g1', orientation: 'vertical', position: 200 };
        const desc = formatGuideCreateDescription(guide);
        expect(desc).toContain('vertical');
        expect(desc).toContain('200');
      });
    });

    describe('formatGuideDeleteDescription', () => {
      test('formats horizontal guide', () => {
        const guide: CustomGuide = { id: 'g1', orientation: 'horizontal', position: 100 };
        const desc = formatGuideDeleteDescription(guide);
        expect(desc).toContain('horizontal');
        expect(desc).toContain('100');
      });

      test('formats vertical guide', () => {
        const guide: CustomGuide = { id: 'g1', orientation: 'vertical', position: 200 };
        const desc = formatGuideDeleteDescription(guide);
        expect(desc).toContain('vertical');
        expect(desc).toContain('200');
      });
    });

    describe('formatGuideRepositionDescription', () => {
      test('formats with old and new positions', () => {
        const guide: CustomGuide = { id: 'g1', orientation: 'horizontal', position: 150 };
        const desc = formatGuideRepositionDescription(guide, 100, 150);
        expect(desc).toContain('horizontal');
        expect(desc).toContain('100');
        expect(desc).toContain('150');
      });
    });

    describe('formatGuideClearAllDescription', () => {
      test('formats with count singular', () => {
        const desc = formatGuideClearAllDescription(1);
        expect(desc).toContain('1');
        expect(desc.toLowerCase()).toContain('guide');
      });

      test('formats with count plural', () => {
        const desc = formatGuideClearAllDescription(5);
        expect(desc).toContain('5');
        expect(desc.toLowerCase()).toContain('guide');
      });
    });
  });
});
