import { describe, expect, it, vi } from 'vitest';
import type { AlignmentType } from '../../../types/alignment';
import { handleAlignmentShortcut } from '../shortcuts';

describe('handleAlignmentShortcut', () => {
  const createKeyboardEvent = (
    key: string,
    options: { ctrlKey?: boolean; shiftKey?: boolean } = {}
  ): KeyboardEvent => {
    return new KeyboardEvent('keydown', {
      key,
      ctrlKey: options.ctrlKey ?? false,
      shiftKey: options.shiftKey ?? false,
    });
  };

  describe('Ctrl+Shift+L (align left)', () => {
    it('returns true and triggers align left', () => {
      const onAlign = vi.fn();
      const selectedIds = new Set(['view1', 'view2']);
      const event = createKeyboardEvent('l', { ctrlKey: true, shiftKey: true });

      const result = handleAlignmentShortcut(event, selectedIds, onAlign);

      expect(result).toBe(true);
      expect(onAlign).toHaveBeenCalledWith('left', ['view1', 'view2']);
    });

    it('works with uppercase L', () => {
      const onAlign = vi.fn();
      const selectedIds = new Set(['view1']);
      const event = createKeyboardEvent('L', { ctrlKey: true, shiftKey: true });

      const result = handleAlignmentShortcut(event, selectedIds, onAlign);

      expect(result).toBe(true);
      expect(onAlign).toHaveBeenCalledWith('left', ['view1']);
    });
  });

  describe('Ctrl+Shift+C (align center)', () => {
    it('returns true and triggers align center', () => {
      const onAlign = vi.fn();
      const selectedIds = new Set(['view1', 'view2']);
      const event = createKeyboardEvent('c', { ctrlKey: true, shiftKey: true });

      const result = handleAlignmentShortcut(event, selectedIds, onAlign);

      expect(result).toBe(true);
      expect(onAlign).toHaveBeenCalledWith('center', ['view1', 'view2']);
    });
  });

  describe('Ctrl+Shift+R (align right)', () => {
    it('returns true and triggers align right', () => {
      const onAlign = vi.fn();
      const selectedIds = new Set(['view1', 'view2']);
      const event = createKeyboardEvent('r', { ctrlKey: true, shiftKey: true });

      const result = handleAlignmentShortcut(event, selectedIds, onAlign);

      expect(result).toBe(true);
      expect(onAlign).toHaveBeenCalledWith('right', ['view1', 'view2']);
    });
  });

  describe('Ctrl+Shift+T (align top)', () => {
    it('returns true and triggers align top', () => {
      const onAlign = vi.fn();
      const selectedIds = new Set(['view1', 'view2']);
      const event = createKeyboardEvent('t', { ctrlKey: true, shiftKey: true });

      const result = handleAlignmentShortcut(event, selectedIds, onAlign);

      expect(result).toBe(true);
      expect(onAlign).toHaveBeenCalledWith('top', ['view1', 'view2']);
    });
  });

  describe('Ctrl+Shift+M (align middle)', () => {
    it('returns true and triggers align middle', () => {
      const onAlign = vi.fn();
      const selectedIds = new Set(['view1', 'view2']);
      const event = createKeyboardEvent('m', { ctrlKey: true, shiftKey: true });

      const result = handleAlignmentShortcut(event, selectedIds, onAlign);

      expect(result).toBe(true);
      expect(onAlign).toHaveBeenCalledWith('middle', ['view1', 'view2']);
    });
  });

  describe('Ctrl+Shift+B (align bottom)', () => {
    it('returns true and triggers align bottom', () => {
      const onAlign = vi.fn();
      const selectedIds = new Set(['view1', 'view2']);
      const event = createKeyboardEvent('b', { ctrlKey: true, shiftKey: true });

      const result = handleAlignmentShortcut(event, selectedIds, onAlign);

      expect(result).toBe(true);
      expect(onAlign).toHaveBeenCalledWith('bottom', ['view1', 'view2']);
    });
  });

  describe('returns false for unrelated keys', () => {
    it('returns false for Ctrl+Shift+X', () => {
      const onAlign = vi.fn();
      const selectedIds = new Set(['view1']);
      const event = createKeyboardEvent('x', { ctrlKey: true, shiftKey: true });

      const result = handleAlignmentShortcut(event, selectedIds, onAlign);

      expect(result).toBe(false);
      expect(onAlign).not.toHaveBeenCalled();
    });

    it('returns false for just Ctrl+L (without Shift)', () => {
      const onAlign = vi.fn();
      const selectedIds = new Set(['view1']);
      const event = createKeyboardEvent('l', { ctrlKey: true, shiftKey: false });

      const result = handleAlignmentShortcut(event, selectedIds, onAlign);

      expect(result).toBe(false);
      expect(onAlign).not.toHaveBeenCalled();
    });

    it('returns false for just Shift+L (without Ctrl)', () => {
      const onAlign = vi.fn();
      const selectedIds = new Set(['view1']);
      const event = createKeyboardEvent('l', { ctrlKey: false, shiftKey: true });

      const result = handleAlignmentShortcut(event, selectedIds, onAlign);

      expect(result).toBe(false);
      expect(onAlign).not.toHaveBeenCalled();
    });

    it('returns false for just L (no modifiers)', () => {
      const onAlign = vi.fn();
      const selectedIds = new Set(['view1']);
      const event = createKeyboardEvent('l', { ctrlKey: false, shiftKey: false });

      const result = handleAlignmentShortcut(event, selectedIds, onAlign);

      expect(result).toBe(false);
      expect(onAlign).not.toHaveBeenCalled();
    });
  });

  describe('returns false when no views selected', () => {
    it('returns false with empty selection', () => {
      const onAlign = vi.fn();
      const selectedIds = new Set<string>();
      const event = createKeyboardEvent('l', { ctrlKey: true, shiftKey: true });

      const result = handleAlignmentShortcut(event, selectedIds, onAlign);

      expect(result).toBe(false);
      expect(onAlign).not.toHaveBeenCalled();
    });
  });

  describe('works without callback', () => {
    it('returns true for valid shortcut without onAlign callback', () => {
      const selectedIds = new Set(['view1']);
      const event = createKeyboardEvent('l', { ctrlKey: true, shiftKey: true });

      const result = handleAlignmentShortcut(event, selectedIds);

      expect(result).toBe(true);
    });
  });
});
